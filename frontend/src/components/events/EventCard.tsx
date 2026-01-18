import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Event, ITicketType } from "@/types/event";

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

  const totalCapacity = event.ticketTypes?.reduce((acc, t) => acc + t.capacity, 0) || 0;
  const totalSold = event.ticketTypes?.reduce((acc, t) => acc + t.sold, 0) || 0;
  const availableTickets = totalCapacity - totalSold;
  const isAlmostSoldOut = availableTickets <= totalCapacity * 0.1 && availableTickets > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Link to={`/events/${event._id}`} className="block group">
        <article className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-500 border border-transparent hover:border-primary/20 group-hover:ring-1 group-hover:ring-primary/10">
          {/* Image */}
          <div className="relative aspect-[16/10] overflow-hidden bg-muted">
            {event.image ? (
              <motion.img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6 }}
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
                {formatPrice(event.ticketTypes)}
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
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{event.location.address}</span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{totalSold.toLocaleString()} attending</span>
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
