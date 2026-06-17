import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Star, Loader2, ArrowRight } from "lucide-react";
import api from "@/lib/api";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface Influencer {
  _id: string;
  name: string;
  handle: string;
  category?: string;
  niche: string;
  reach: string;
  image: string;
  instagramUrl?: string;
  isActive: boolean;
}

const InfluencerSlider = () => {
  const { data: influencers, isLoading } = useQuery<Influencer[]>({
    queryKey: ["influencers", "public"],
    queryFn: async () => {
      const { data } = await api.get("/influencers");
      return data;
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
  }, [influencers]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = isMobile ? 270 : 320;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <section className="py-8 md:py-12 border-t border-border/20">
        <div className="container px-3 md:px-4">
          <div className="flex flex-col items-center gap-3 md:gap-4 py-12 md:py-16">
            <Loader2 className="h-7 w-7 md:h-8 md:w-8 text-primary animate-spin" />
            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground italic text-center">Syncing with creator network...</p>
          </div>
        </div>
      </section>
    );
  }

  if (!influencers || influencers.length === 0) return null;

  return (
    <section className="py-8 md:py-12 border-t border-border/20">
      <div className="container px-3 md:px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 md:mb-8 gap-3 md:gap-4">
          <div>
            <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
              <Star className="h-3.5 w-3.5 md:h-4 md:w-4 text-primary fill-primary/20" />
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.35em] md:tracking-[0.4em]">
                Elite Creator Network
              </p>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter">
              Pulse <span className="text-primary">Influencers</span>
            </h2>
          </div>
          <Link
            to="/boost"
            className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors group self-start md:self-auto"
          >
            Marketing Portal <ArrowRight className="h-2.5 w-2.5 md:h-3 md:w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-2"
          >
            {influencers.map((inf, idx) => (
              <motion.div
                key={inf._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                whileHover={{ y: -8 }}
                className="flex-shrink-0 w-56 sm:w-60 md:w-72 flex flex-col h-full"
              >
                <div
                  onClick={() => inf.instagramUrl && window.open(inf.instagramUrl, "_blank", "noopener,noreferrer")}
                  className={`relative group bg-card/40 backdrop-blur-md border border-border/60 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-primary/40 flex flex-col h-full ${inf.instagramUrl ? "cursor-pointer" : ""}`}
                >
                  {/* Card Image Cover */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent z-10" />

                    <img
                      src={inf.image}
                      alt={inf.name}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <Badge className="bg-primary text-primary-foreground font-extrabold uppercase text-[7px] md:text-[8px] tracking-[0.15em] px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border border-primary/20 shadow-md">
                        {inf.category || "Other"}
                      </Badge>
                    </div>

                    {/* Reach Badge */}
                    <div className="absolute top-3 right-3 z-20">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-foreground font-black uppercase text-[7px] md:text-[8px] tracking-[0.1em] px-2.5 md:px-3 py-1 md:py-1.5 rounded-full border border-border/50 shadow-md">
                        {inf.reach} REACH
                      </Badge>
                    </div>

                    {/* Star overlay on hover */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black h-10 w-10 md:h-12 md:w-12 rounded-full flex items-center justify-center shadow-2xl z-20 border-4 border-background opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
                      <Star className="h-4 w-4 md:h-5 md:w-5 fill-black" />
                    </div>

                    {/* Name + handle overlay */}
                    <div className="absolute bottom-3 left-4 right-4 z-20">
                      <h4 className="text-base md:text-lg font-black uppercase tracking-tight italic text-foreground leading-tight drop-shadow-sm">
                        {inf.name}
                      </h4>
                      <p className="text-[9px] md:text-[10px] font-black text-primary uppercase tracking-widest mt-0.5 md:mt-1">
                        {inf.handle}
                      </p>
                    </div>
                  </div>

                  {/* Card bottom: niche only */}
                  <div className="p-4 md:p-5 flex items-center justify-between text-[9px] md:text-[10px]">
                    <span className="font-black text-muted-foreground uppercase tracking-widest text-[8px] md:text-[10px]">Niche</span>
                    <span className="font-extrabold text-foreground uppercase tracking-tight italic bg-muted/60 px-2 md:px-3 py-0.5 md:py-1 rounded-lg text-[9px] md:text-[10px]">
                      {inf.niche}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-9 w-9 md:h-10 md:w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-9 w-9 md:h-10 md:w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all z-10"
              aria-label="Scroll right"
            >
              <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
            </button>
          )}
        </div>
      </div>
    </section>
  );
};

export default InfluencerSlider;
