import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const totalSold = event.ticketTypes?.reduce((acc, t) => acc + t.sold, 0) || 0;
  const availableTickets = totalCapacity - totalSold;
  const isAlmostSoldOut =
    availableTickets <= totalCapacity * 0.1 && availableTickets > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: "easeOut", delay: index * 0.05 }}
    >
      <Link to={`/events/${event._id}`} className="block group">
        <article className="bg-card rounded-[1.5rem] overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-400">
          {/* Image */}
          <div className="relative aspect-[4/3] overflow-hidden">
            {event.image ? (
              <img
                src={event.image}
                alt={event.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full gradient-hero" />
            )}

            {/* Category Badge */}
            <div className="absolute top-4 left-4">
              <Badge
                variant="secondary"
                className="backdrop-blur-md bg-white/90 text-foreground font-bold text-xs rounded-full px-3 py-1 border-0"
              >
                {event.category}
              </Badge>
            </div>

            {/* Almost Sold Out */}
            {isAlmostSoldOut && (
              <div className="absolute top-4 right-4">
                <Badge
                  variant="destructive"
                  className="rounded-full px-3 py-1 font-bold text-xs animate-pulse"
                >
                  Almost Sold Out
                </Badge>
              </div>
            )}
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="font-bold text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors leading-snug">
              {event.title}
            </h3>

            <div className="space-y-1.5 mb-5">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                <span className="font-medium">{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span className="truncate font-medium">
                  {event.location.address.split(",")[0]}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-foreground">
                {formatPrice(event.ticketTypes)}
              </span>
              <Button
                size="sm"
                className="rounded-full px-5 font-bold shadow-button text-xs h-9"
              >
                Get Tickets
              </Button>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default EventCard;
