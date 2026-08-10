import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import MarqueeCarousel from "@/components/events/MarqueeCarousel";
import MobileMarqueeCarousel from "@/components/events/MobileMarqueeCarousel";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

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

const InfluencerCardContent = ({ inf }: { inf: Influencer }) => (
  <div
    onClick={() => inf.instagramUrl && window.open(inf.instagramUrl, "_blank", "noopener,noreferrer")}
    className={inf.instagramUrl ? "cursor-pointer" : ""}
  >
    {/* Card Image Cover */}
    <div className="relative aspect-[4/5] w-full rounded-xl md:rounded-2xl overflow-hidden bg-muted/20 border border-border/50 hover:border-border transition-all duration-300">
      <img
        src={inf.image}
        alt={inf.name}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

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
    </div>

    {/* Name + handle — below the image, centered, matching Upcoming Events */}
    <div className="mt-3 text-center">
      <h4 className="font-black text-lg md:text-xl tracking-tight leading-snug line-clamp-1 text-foreground">
        {inf.name}
      </h4>
      <p className="text-[11px] font-black text-neon-lime uppercase tracking-widest mt-1">
        {inf.handle}
      </p>
    </div>
  </div>
);

const InfluencerSlider = () => {
  const { data: influencers, isLoading } = useQuery<Influencer[]>({
    queryKey: ["influencers", "public"],
    queryFn: async () => {
      const { data } = await api.get("/influencers");
      return data;
    },
  });

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
        <PublicPageHeader
          pillText="Elite Creator Network"
          title={
            <>
              Pulse <span className="text-neon-lime">Influencers</span>
            </>
          }
          subtitle="We have exclusive partnerships with most influential creators and influencers within your city to maximize event reach, drive ticket sales, and create maximum buzz."
          size="md"
          className="text-center"
        />

        {/* Mobile: snap carousel, one active card, dots — same engine as Upcoming Events */}
        <div className="md:hidden">
          <MobileMarqueeCarousel>
            {influencers.map((inf) => (
              <InfluencerCardContent key={inf._id} inf={inf} />
            ))}
          </MobileMarqueeCarousel>
        </div>

        {/* Desktop: continuous drift marquee */}
        <div className="relative hidden md:block">
          <MarqueeCarousel>
            {influencers.map((inf, idx) => (
              <motion.div
                key={inf._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="flex-shrink-0 w-[21.6rem]"
              >
                <InfluencerCardContent inf={inf} />
              </motion.div>
            ))}
          </MarqueeCarousel>
        </div>
      </div>
    </section>
  );
};

export default InfluencerSlider;