import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event, ITicketType } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";

interface EventCardProps {
  event: Event;
  index?: number;
  imageRatio?: string;
}

const EventCard = ({ event, index = 0, imageRatio = "3/4" }: EventCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (ticketTypes: ITicketType[]) => {
    if (!ticketTypes || ticketTypes.length === 0) return "Free";
    const minPrice = Math.min(...ticketTypes.map((t) => t.price));
    if (minPrice === 0) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(minPrice);
  };

  const totalCapacity =
    event.ticketTypes?.reduce((acc, t) => acc + t.capacity, 0) || 0;
  const totalSold =
    event.ticketTypes?.reduce((acc, t) => acc + t.sold, 0) || 0;
  const availableTickets = totalCapacity - totalSold;

  const getCategoryImage = (category: string = "other") => {
    const cats: Record<string, string> = {
      music: "/images/categories/music.jpg",
      technology: "/images/categories/technology.jpg",
      business: "/images/categories/business.jpg",
      entertainment: "/images/categories/entertainment.jpg",
      health: "/images/categories/health.jpg",
      sports: "/images/categories/sports.jpg",
      education: "/images/categories/education.jpg",
      other: "/images/categories/other.jpg",
      art: "/images/categories/entertainment.jpg",
      meetup: "/images/categories/business.jpg",
      tech: "/images/categories/technology.jpg",
    };
    return cats[category.toLowerCase()] || cats.other;
  };

  const isSoldOut =
    totalCapacity > 0 &&
    (availableTickets <= 0 || event.ticketTypes?.every((t) => t.isSoldOut));
  const isAlmostSoldOut =
    availableTickets <= totalCapacity * 0.1 && availableTickets > 0;

  const priceLabel = formatPrice(event.ticketTypes || []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      transition={{
        duration: 0.45,
        ease: [0.23, 1, 0.32, 1],
        delay: index * 0.05,
      }}
      className="group h-full"
    >
      <Link to={`/events/${event._id}`} className="block h-full">
        <article className="h-full flex flex-col">

          {/* ── image ── */}
          <div
            className="relative overflow-hidden rounded-xl bg-muted flex-shrink-0"
            style={{ aspectRatio: imageRatio }}
          >
            {/* shimmer */}
            <AnimatedShimmer visible={!imageLoaded} />

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={imageLoaded ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <SafeImage
                src={event.image || getCategoryImage(event.category)}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>

            {/* subtle gradient at bottom for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

            {/* top badges */}
            <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
              {event.isSponsored && (
                <Badge className="bg-foreground text-background border-0 px-2 py-0.5 rounded font-black uppercase tracking-wider text-[8px] w-fit">
                  Sponsored
                </Badge>
              )}
              {isSoldOut && (
                <Badge className="bg-white/15 text-white backdrop-blur-sm border-0 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] w-fit">
                  Sold Out
                </Badge>
              )}
              {isAlmostSoldOut && (
                <Badge className="bg-red-500/90 text-white border-0 px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[8px] w-fit">
                  Few Left
                </Badge>
              )}
            </div>

            {/* price bottom-right on image */}
            <div className="absolute bottom-2.5 right-2.5">
              <span className="inline-block px-2.5 py-1 bg-white text-black rounded font-black text-[11px] tracking-tight">
                {priceLabel}
              </span>
            </div>
          </div>

          {/* ── text below image ── */}
          <div className="pt-3 pb-1 flex flex-col gap-1">
            {/* date */}
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary">
              {formatDate(event.date)}
            </p>

            {/* title */}
            <h3 className="text-sm font-black tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors duration-200 line-clamp-2">
              {event.title}
            </h3>

            {/* venue */}
            <div className="flex items-center gap-1 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0" />
              <p className="text-[11px] font-medium line-clamp-1">
                {typeof event.location === "string"
                  ? event.location
                  : event.location?.venueName ||
                    event.location?.address?.split(",")[0]}
              </p>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

/* shimmer skeleton */
const AnimatedShimmer = ({ visible }: { visible: boolean }) => (
  <motion.div
    className="absolute inset-0 overflow-hidden bg-muted flex items-center justify-center"
    animate={{ opacity: visible ? 1 : 0 }}
    transition={{ duration: 0.3 }}
    style={{ pointerEvents: visible ? "auto" : "none" }}
  >
    <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ["-100%", "200%"] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

export default EventCard;
