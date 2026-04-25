import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowUpRight, ImageIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event, ITicketType } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";

interface EventCardProps {
  event: Event;
  index?: number;
  imageRatio?: string;
}

const EventCard = ({ event, index = 0, imageRatio = "16/10" }: EventCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ y: -5, transition: { duration: 0.22, ease: "easeOut" } }}
      transition={{
        duration: 0.5,
        ease: [0.23, 1, 0.32, 1],
        delay: index * 0.06,
      }}
      className="group h-full"
    >
      <Link to={`/events/${event._id}`} className="block h-full">
        <article className="h-full bg-card border border-border/30 rounded-xl overflow-hidden hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-350 flex flex-col">

          {/* ── image ── */}
          <div className="relative overflow-hidden bg-muted" style={{ aspectRatio: imageRatio }}>

            {/* shimmer while loading */}
            <AnimatedShimmer visible={!imageLoaded} />

            {/* image — fades in + un-zooms on load */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.07 }}
              animate={
                imageLoaded
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 1.07 }
              }
              transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
            >
              <SafeImage
                src={event.image || getCategoryImage(event.category)}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                onLoad={() => setImageLoaded(true)}
              />
            </motion.div>

            {/* gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-400" />

            {/* category + sponsored badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-1">
              {event.isSponsored && (
                <Badge className="bg-amber-500 text-black border-0 px-2.5 py-1 rounded-md font-black uppercase tracking-wider text-[9px] shadow-lg w-fit">
                  Sponsored
                </Badge>
              )}
              <Badge className="bg-background/85 dark:bg-background/70 text-foreground backdrop-blur-sm border-0 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[9px] shadow-sm w-fit">
                {event.category || "General"}
              </Badge>
            </div>

            {/* sold-out / low-stock */}
            <div className="absolute top-3 right-3 flex flex-col gap-1">
              {isSoldOut && (
                <Badge className="bg-black/75 text-white/90 backdrop-blur-sm border-0 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[9px]">
                  Sold Out
                </Badge>
              )}
              {isAlmostSoldOut && (
                <Badge className="bg-red-500/90 text-white border-0 px-2.5 py-1 rounded-md font-bold uppercase tracking-wider text-[9px] animate-pulse">
                  Few Left
                </Badge>
              )}
            </div>

            {/* price — bottom right */}
            <div className="absolute bottom-3 right-3">
              <span className="inline-block px-3 py-1.5 bg-background/90 dark:bg-background/80 backdrop-blur-sm rounded-md text-[10px] font-black tracking-wide text-foreground shadow-sm border border-white/10">
                {formatPrice(event.ticketTypes || [])}
              </span>
            </div>
          </div>

          {/* ── content ── */}
          <div className="p-4 flex-1 flex flex-col gap-2">

            {/* date */}
            <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-[0.3em] text-primary">
              <Calendar className="h-3 w-3" />
              {formatDate(event.date)}
            </div>

            {/* title */}
            <h3 className="text-sm font-black tracking-tight leading-snug text-foreground group-hover:text-primary transition-colors duration-250 line-clamp-2 flex-1">
              {event.title}
            </h3>

            {/* location */}
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin className="h-3 w-3 shrink-0 text-primary/50" />
              <p className="text-[11px] font-medium line-clamp-1">
                {typeof event.location === "string"
                  ? event.location
                  : event.location?.venueName ||
                  event.location?.address?.split(",")[0]}
              </p>
            </div>

            {/* footer */}
            <div className="pt-3 mt-1 border-t border-border/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/15 flex items-center justify-center text-[10px] font-black text-primary uppercase shrink-0">
                  {event.creator?.name?.charAt(0) || "E"}
                </div>
                <span className="text-xs font-semibold text-muted-foreground line-clamp-1 max-w-[90px]">
                  {event.creator?.name || "Organizer"}
                </span>
              </div>

              <motion.div
                whileHover={{ rotate: 0, scale: 1.1 }}
                initial={{ rotate: 0 }}
                className="h-7 w-7 rounded-lg flex items-center justify-center bg-foreground/8 dark:bg-foreground/10 text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300"
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
              </motion.div>
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
  >
    <ImageIcon className="h-8 w-8 text-muted-foreground/20" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/8 to-transparent -translate-x-full"
      animate={{ x: ["−100%", "200%"] }}
      transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
      style={{ transform: "translateX(-100%)" }}
    />
  </motion.div>
);

export default EventCard;
