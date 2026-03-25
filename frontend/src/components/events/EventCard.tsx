import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event, ITicketType } from "@/types/event";
import SafeImage from "@/components/ui/SafeImage";

interface EventCardProps {
  event: Event;
  index?: number;
}

const EventCard = ({ event, index = 0 }: EventCardProps) => {
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
  const totalSold = event.ticketTypes?.reduce((acc, t) => acc + t.sold, 0) || 0;
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
      // Map existing categories to closest local image
      art: "/images/categories/entertainment.jpg",
      meetup: "/images/categories/business.jpg",
      tech: "/images/categories/technology.jpg",
    };
    return cats[category.toLowerCase()] || cats.other;
  };

  const isSoldOut = totalCapacity > 0 && (availableTickets <= 0 || event.ticketTypes?.every(t => t.isSoldOut));
  const isAlmostSoldOut =
    availableTickets <= totalCapacity * 0.1 && availableTickets > 0;
  const isPast = new Date(event.date) < new Date() || event.status === "past";

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{
        duration: 0.8,
        ease: [0.23, 1, 0.32, 1],
        delay: index * 0.05,
      }}
      className="group"
    >
      <Link to={`/events/${event._id}`} className="block h-full">
        <article className="h-full bg-card/40 backdrop-blur-md border border-border/40 rounded-[2.5rem] overflow-hidden hover:border-primary/40 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-primary/5 flex flex-col">
          {/* Image Container */}
          <div className="relative aspect-[4/3] overflow-hidden">
            <SafeImage
              src={event.image || getCategoryImage(event.category)}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card/80 via-transparent to-transparent opacity-60" />

            {/* Status Badges */}
            <div className="absolute top-6 right-6 flex flex-col gap-2">
              <Badge className="bg-primary/90 text-primary-foreground backdrop-blur-md border-none px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] shadow-xl">
                {event.category || "GENERAL"}
              </Badge>
              {isSoldOut && (
                <Badge className="bg-black/80 text-white backdrop-blur-md border-white/20 px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] shadow-xl">
                  SOLD OUT
                </Badge>
              )}
              {isAlmostSoldOut && (
                <Badge className="bg-red-500 text-white border-none px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] shadow-xl animate-pulse">
                  LOW STOCK
                </Badge>
              )}
            </div>

            {/* Price Tag */}
            <div className="absolute bottom-6 left-6">
              <div className="px-5 py-2.5 bg-background/80 backdrop-blur-xl border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-foreground shadow-2xl">
                {formatPrice(event.ticketTypes || [])}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 flex-1 flex flex-col">
            <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-[0.3em] text-primary mb-4">
              <Calendar className="h-3 w-3" />
              {formatDate(event.date)}
            </div>

            <h3 className="text-2xl font-black tracking-tighter leading-none mb-4 text-foreground italic uppercase group-hover:text-primary transition-colors duration-300">
              {event.title}
            </h3>

            <div className="flex items-start gap-2 text-muted-foreground mb-8">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
              <p className="text-[10px] font-bold leading-relaxed tracking-tight">
                {typeof event.location === "string"
                  ? event.location
                  : event.location?.venueName || event.location?.address?.split(",")[0]}
              </p>
            </div>

            <div className="mt-auto pt-6 border-t border-border/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 flex items-center justify-center font-black text-[10px] text-primary uppercase shadow-inner">
                  {event.creator?.name?.charAt(0) || "P"}
                </div>
                <div className="flex flex-col">
                  <span className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">
                    Curated By
                  </span>
                  <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
                    {event.creator?.name || "Pulse Host"}
                  </span>
                </div>
              </div>

              <div className="h-12 w-12 rounded-2xl flex items-center justify-center bg-foreground text-background group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-500 shadow-lg group-hover:shadow-primary/20 group-hover:rotate-12">
                <ArrowRight className="h-5 w-5" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default EventCard;
