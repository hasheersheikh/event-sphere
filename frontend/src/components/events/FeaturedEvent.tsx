import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Event } from "@/types/event";

interface FeaturedEventProps {
  event: Event;
}

const FeaturedEvent = ({ event }: FeaturedEventProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price?: number, currency?: string) => {
    if (price === 0 || price === undefined) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const minPrice = event.ticketTypes?.length > 0 
    ? Math.min(...event.ticketTypes.map(t => t.price)) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="relative overflow-hidden rounded-3xl"
    >
      {/* Background */}
      <div className="absolute inset-0">
        {event.image ? (
          <img
            src={event.image}
            alt={event.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full gradient-hero" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/90 via-foreground/70 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-8 md:p-12 lg:p-16 min-h-[400px] md:min-h-[450px] flex items-center">
        <div className="max-w-xl text-primary-foreground">
          <Badge variant="accent" className="mb-4">
            ⭐ Featured Event
          </Badge>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
            {event.title}
          </h2>
          
          <p className="text-primary-foreground/80 text-lg mb-6 line-clamp-2">
            {event.description}
          </p>

          <div className="flex flex-wrap gap-4 mb-8 text-primary-foreground/90">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>{formatDate(event.date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span>{event.location.venueName || event.location.address}</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link to={`/events/${event._id}`}>
              <Button size="lg" variant="hero" className="gap-2">
                Get Tickets · {formatPrice(minPrice, "INR")}
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to={`/events/${event._id}`}>
              <Button size="lg" variant="hero-outline">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedEvent;
