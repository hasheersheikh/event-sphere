import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Event, ITicketType } from "@/types/event";

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

  const isAlmostSoldOut =
    availableTickets <= totalCapacity * 0.1 && availableTickets > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -10 }}
      transition={{
        duration: 0.6,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.05,
      }}
      className="group relative"
    >
      <Link to={`/events/${event._id}`} className="block">
        <article className="bg-card border border-border/50 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group-hover:border-primary/30">
          {/* Image Container */}
          <div className="relative aspect-[16/9] overflow-hidden">
            <img
              src={event.image || getCategoryImage(event.category)}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Price Badge - Softened */}
            <div className="absolute bottom-4 left-4 px-3 py-1 bg-background/90 backdrop-blur-md border border-border rounded-lg text-[10px] font-bold uppercase text-foreground shadow-lg">
              {formatPrice(event.ticketTypes || [])}
            </div>

            {/* Category / Sold Out Badge */}
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              <div className="px-3 py-1 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-widest rounded-md">
                {event.category || "GENERAL"}
              </div>
              {isAlmostSoldOut && (
                <div className="px-3 py-1 bg-red-600 text-white text-[9px] font-bold uppercase tracking-widest rounded-md shadow-lg">
                  ALMOST SOLD OUT
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-primary mb-3">
              <Calendar className="h-3 w-3" />
              {formatDate(event.date)}
            </div>

            <h3 className="text-xl font-bold leading-tight mb-3 text-foreground line-clamp-2 min-h-[3.5rem] group-hover:text-primary transition-colors">
              {event.title}
            </h3>

            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-6 font-medium italic">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="truncate">
                {typeof event.location === "string"
                  ? event.location
                  : event.location?.address?.split(",")[0]}
              </span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-border/50">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-muted border border-border flex items-center justify-center font-bold text-[10px] text-muted-foreground uppercase">
                  {event.creator?.name?.charAt(0) || "P"}
                </div>
                <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-tight">
                  {event.creator?.name || "Pulse Host"}
                </span>
              </div>

              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <ArrowRight className="h-4 w-4" />
              </div>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default EventCard;
