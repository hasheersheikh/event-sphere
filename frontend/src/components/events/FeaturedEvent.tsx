import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const minPrice =
    event.ticketTypes?.length > 0
      ? Math.min(...event.ticketTypes.map((t) => t.price))
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-muted rounded-[2rem] overflow-hidden"
    >
      <div className="grid md:grid-cols-2 items-stretch">
        {/* Image Side */}
        <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[420px] overflow-hidden rounded-[2rem]">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-hero" />
          )}
        </div>

        {/* Content Side */}
        <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-center">
          <div className="flex flex-col gap-5">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Featured Event
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight tracking-tight">
              {event.title}
            </h2>

            <p className="text-muted-foreground text-base md:text-lg line-clamp-3 leading-relaxed">
              {event.description}
            </p>

            <div className="flex flex-col gap-2 text-sm font-semibold text-foreground/80">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(event.date)}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {event.location.venueName || event.location.address}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-4">
              <Link to={`/events/${event._id}`}>
                <Button
                  size="lg"
                  className="rounded-full px-8 font-bold shadow-button gap-2"
                >
                  Buy Tickets · {formatPrice(minPrice, "INR")}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to={`/events/${event._id}`}>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 font-bold"
                >
                  More Info
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FeaturedEvent;
