import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
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

const AUTO_SCROLL_SPEED = 50; // px per second — mobile-only autoplay
const AUTO_SCROLL_RESUME_DELAY_MS = 4000;

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
  const shouldReduceMotion = useReducedMotion();
  const autoScrollAnimRef = useRef<number>();
  const autoScrollLastTsRef = useRef(0);
  const autoScrollPausedRef = useRef(false);
  const autoScrollResumeTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

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

  // Mobile-only autoplay — continuously drifts the strip, pausing while the user touches it
  useEffect(() => {
    if (!isMobile || shouldReduceMotion) {
      if (autoScrollAnimRef.current) cancelAnimationFrame(autoScrollAnimRef.current);
      return;
    }
    const tick = (ts: number) => {
      const el = scrollContainerRef.current;
      if (el && !autoScrollPausedRef.current) {
        const delta = autoScrollLastTsRef.current ? ts - autoScrollLastTsRef.current : 0;
        el.scrollLeft += (AUTO_SCROLL_SPEED * delta) / 1000;
        if (el.scrollLeft >= el.scrollWidth - el.clientWidth - 1) {
          el.scrollLeft = 0;
        }
      }
      autoScrollLastTsRef.current = ts;
      autoScrollAnimRef.current = requestAnimationFrame(tick);
    };
    autoScrollAnimRef.current = requestAnimationFrame(tick);
    return () => {
      if (autoScrollAnimRef.current) cancelAnimationFrame(autoScrollAnimRef.current);
      autoScrollLastTsRef.current = 0;
    };
  }, [isMobile, shouldReduceMotion, influencers]);

  const pauseAutoScroll = () => {
    autoScrollPausedRef.current = true;
    if (autoScrollResumeTimeoutRef.current) clearTimeout(autoScrollResumeTimeoutRef.current);
  };

  const resumeAutoScrollSoon = () => {
    if (autoScrollResumeTimeoutRef.current) clearTimeout(autoScrollResumeTimeoutRef.current);
    autoScrollResumeTimeoutRef.current = setTimeout(() => {
      autoScrollPausedRef.current = false;
      autoScrollLastTsRef.current = 0;
    }, AUTO_SCROLL_RESUME_DELAY_MS);
  };

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = isMobile ? 280 : 340;
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
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.35em] md:tracking-[0.4em]">
                Elite Creator Network
              </p>
            </div>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter">
              Pulse <span className="text-primary">Influencers</span>
            </h2>
          </div>
        </div>

        <div className="relative">
          <div
            ref={scrollContainerRef}
            onTouchStart={pauseAutoScroll}
            onTouchEnd={resumeAutoScrollSoon}
            className="flex gap-3 md:gap-4 overflow-x-auto scrollbar-hide pb-2"
          >
            {influencers.map((inf, idx) => (
              <motion.div
                key={inf._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                whileHover={{ scale: 1.10, y: -8, zIndex: 20 }}
                style={{ zIndex: 1 }}
                className="flex-shrink-0 w-[86vw] max-w-[20.4rem] sm:w-[21.6rem] md:w-96 lg:w-[26.4rem]"
              >
                <div
                  onClick={() => inf.instagramUrl && window.open(inf.instagramUrl, "_blank", "noopener,noreferrer")}
                  className={`relative group bg-card/40 backdrop-blur-md border border-border/60 rounded-xl md:rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-primary/40 ${inf.instagramUrl ? "cursor-pointer" : ""}`}
                >
                  {/* Card Image Cover */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-muted/20">
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

                </div>
              </motion.div>
            ))}
          </div>

          {canScrollLeft && (
            <button
              onClick={() => scroll("left")}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all z-10"
              aria-label="Scroll left"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scroll("right")}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 h-10 w-10 rounded-full bg-background border border-border/50 shadow-lg flex items-center justify-center hover:bg-muted hover:border-primary/50 transition-all z-10"
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

export default InfluencerSlider;