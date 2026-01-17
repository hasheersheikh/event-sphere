import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";

interface EventCardProps {
  event: Event;
  index?: number;
}

const EventCard = ({ event, index = 0 }: EventCardProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const availableTickets = event.totalTickets - event.soldTickets;
  const isAlmostSoldOut = availableTickets <= event.totalTickets * 0.1;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
    >
      <Link to={`/events/${event.id}`} className="block group">
        <article className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="w-full h-full gradient-hero opacity-80" />
            )}
            
            {/* Category Badge */}
            <div className="absolute top-3 left-3">
              <Badge variant="category" className="backdrop-blur-sm bg-background/90">
                {event.category}
              </Badge>
            </div>

            {/* Price Tag */}
            <div className="absolute top-3 right-3">
              <span className="px-3 py-1.5 rounded-full bg-background/90 backdrop-blur-sm text-sm font-bold">
                {formatPrice(event.price, event.currency)}
              </span>
            </div>

            {/* Almost Sold Out Badge */}
            {isAlmostSoldOut && (
              <div className="absolute bottom-3 left-3">
                <Badge variant="destructive" className="animate-pulse">
                  Almost Sold Out!
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
              {event.title}
            </h3>
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary" />
                <span>{formatDate(event.date)} · {event.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{event.venue}, {event.location}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{event.soldTickets.toLocaleString()} attending</span>
              </div>
              <span className="text-sm font-medium text-primary">
                View Details →
              </span>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default EventCard;
