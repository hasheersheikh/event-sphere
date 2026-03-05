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
      <Link to={`/events/${event._id || event.id}`} className="block">
        <article className="glass-card overflow-hidden bg-white/[0.03] backdrop-blur-3xl border border-white/10 hover:border-emerald-500/30 transition-all duration-500 shadow-2xl hover:shadow-[0_30px_60px_rgba(16,185,129,0.1)]">
          {/* Image Container */}
          <div className="relative aspect-[16/10] overflow-hidden">
            <img
              src={event.image || getCategoryImage(event.category)}
              alt={event.title}
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

            {/* Price Badge */}
            <div className="absolute bottom-6 right-6 px-5 py-2 glass-panel rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white">
              {formatPrice(event.ticketTypes || [])}
            </div>

            {/* Category / Sold Out Badge */}
            <div className="absolute top-6 left-6 flex flex-col gap-2">
              <div className="px-4 py-1.5 glass-panel rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-emerald-400">
                {event.category || "GENERAL"}
              </div>
              {isAlmostSoldOut && (
                <div className="px-4 py-1.5 bg-rose-500/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-[0.2em] text-white animate-pulse">
                  Almost Sold Out
                </div>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-10">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-white/40 mb-5">
              <Calendar className="h-3.5 w-3.5 text-emerald-500" />
              {formatDate(event.date)}
            </div>

            <h3 className="text-2xl font-medium tracking-tighter leading-tight mb-4 group-hover:text-emerald-400 transition-colors italic">
              {event.title}
            </h3>

            <div className="flex items-center gap-2 text-white/40 text-[11px] mb-10 font-light italic">
              <MapPin className="h-3.5 w-3.5 text-emerald-500" />
              {typeof event.location === "string"
                ? event.location
                : event.location?.address?.split(",")[0]}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/5">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center font-black text-xs text-white/40 group-hover:bg-emerald-500 group-hover:text-black transition-all">
                  {event.creator?.name?.charAt(0) || "P"}
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/20">
                    Curated By
                  </p>
                  <p className="text-[11px] font-bold text-white/60 group-hover:text-white transition-colors capitalize">
                    {event.creator?.name || "Pulse Host"}
                  </p>
                </div>
              </div>

              <Button
                variant="ghost"
                className="h-12 w-12 rounded-full p-0 flex items-center justify-center border border-white/5 hover:bg-emerald-500 hover:text-black hover:border-emerald-500 transition-all group-hover:translate-x-1"
              >
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

export default EventCard;
