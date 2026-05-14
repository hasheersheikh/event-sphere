import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Building2, TrendingUp, ArrowRight, Eye } from "lucide-react";
import api from "@/lib/api";
import { Event } from "@/types/event";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import React from "react";

interface TrendingVenue {
  _id: string;
  name: string;
  location: string;
  description?: string;
  image?: string;
  order: number;
}

const TrendingVenues = () => {
  const { data: trendingVenues, isLoading } = useQuery({
    queryKey: ["trendingVenues"],
    queryFn: async () => {
      const { data } = await api.get("/trending-venues");
      return data as TrendingVenue[];
    },
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const checkScroll = () => {
      const container = scrollContainerRef.current;
      if (container) {
        setCanScrollLeft(container.scrollLeft > 0);
        setCanScrollRight(
          container.scrollLeft < container.scrollWidth - container.clientWidth
        );
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      checkScroll();
      container.addEventListener("scroll", checkScroll);
      return () => container.removeEventListener("scroll", checkScroll);
    }
  }, [trendingVenues]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = isMobile ? 280 : 340;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (isLoading || !trendingVenues || trendingVenues.length === 0) return null;

  return (
    <section className="py-12 border-t border-border/20">
      <div className="container">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 " />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] ">
                Trending Now
              </p>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tighter">
              Trending <span className="">Venues</span>
            </h2>
          </div>
          <Link
            to="/events"
            className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-neon-lime flex items-center gap-1 transition-colors group"
          >
            View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          >
            {trendingVenues.map((venue, idx) => (
              <motion.div
                key={venue._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="flex-shrink-0 w-72 md:w-80"
              >
                <div className="block group">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-muted border border-border/50 hover:border-neon-lime/50 transition-all duration-300">
                    {venue.image ? (
                      <img
                        src={venue.image}
                        alt={venue.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-neon-lime/20 to-neon-lime/5 flex items-center justify-center">
                        <Building2 className="h-12 w-12 text-neon-lime/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base font-black text-white line-clamp-1 mb-1">
                            {venue.name}
                          </h3>
                          <p className="text-[10px] font-medium text-white/70 line-clamp-1">
                            {venue.location}
                          </p>
                        </div>
                        {/* {venue.description && (
                          <p className="text-[9px] text-white/50 line-clamp-1 mt-1 italic">
                            {venue.description}
                          </p>
                        )} */}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:bg-muted hover:border-neon-lime/50 transition-all z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:bg-muted hover:border-neon-lime/50 transition-all z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default TrendingVenues;
