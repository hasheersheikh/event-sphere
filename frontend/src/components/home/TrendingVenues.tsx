import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { MapPin, Building2, ArrowRight, Eye } from "lucide-react";
import api from "@/lib/api";
import { Event } from "@/types/event";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import MarqueeCarousel from "@/components/events/MarqueeCarousel";
import MobileMarqueeCarousel from "@/components/events/MobileMarqueeCarousel";
import DetailModal from "@/components/shared/DetailModal";
import ReadMore from "@/components/shared/ReadMore";
import RevealImage from "@/components/ui/RevealImage";
import { VENUE_CATEGORIES } from "@/constants/venueCategories";

interface TrendingVenue {
  _id: string;
  name: string;
  location: string;
  category?: string;
  description?: string;
  image?: string;
  images?: string[];
  order: number;
}

const VenueCardContent = ({ venue }: { venue: TrendingVenue }) => {
  const total = Array.from(new Set([venue.image, ...(venue.images || [])].filter(Boolean))).length;
  return (
    <div>
      {/* Image — 4:5 Instagram portrait ratio */}
      <div className="relative aspect-[4/5] rounded-xl md:rounded-2xl overflow-hidden bg-muted border border-border/50 group-hover:border-border transition-all duration-300">
        {venue.image ? (
          <RevealImage
            src={venue.image}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-neon-lime/20 to-neon-lime/5 flex items-center justify-center">
            <Building2 className="h-12 w-12 text-neon-lime/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Photo count badge */}
        {total > 1 && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-full border border-white/10">
            <Eye className="h-3 w-3" />
            <span className="text-[9px] font-black">{total} photos</span>
          </div>
        )}
      </div>

      {/* Title — below the image, centered, matching Upcoming Events */}
      <div className="mt-3 text-center">
        <h3 className="font-black text-lg md:text-xl tracking-tight leading-snug line-clamp-1 text-foreground">
          {venue.name}
        </h3>
        <div className="flex items-center justify-center gap-1 mt-1">
          <MapPin className="h-3 w-3 text-neon-lime shrink-0" />
          <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">
            {venue.location}
          </p>
        </div>
      </div>
    </div>
  );
};

const TrendingVenues = () => {
  const { data: trendingVenues, isLoading } = useQuery({
    queryKey: ["trendingVenues"],
    queryFn: async () => {
      const { data } = await api.get("/trending-venues");
      return data as TrendingVenue[];
    },
  });

  const [selectedVenue, setSelectedVenue] = useState<TrendingVenue | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [activeCategory, setActiveCategory] = useState<string>("All");

  useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedVenue]);

  if (isLoading || !trendingVenues || trendingVenues.length === 0) return null;

  return (
    <section className="py-8 md:py-14 border-t border-border/20">
      <div className="container px-3 md:px-8">
        <PublicPageHeader
          pillText="Where It's Happening"
          title={
            <>
              Trending <span className="text-neon-lime">Venues</span>
            </>
          }
          size="md"
          className="text-center"
        >
          <Link
            to="/venues"
            className="inline-flex text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-neon-lime items-center gap-1 transition-colors group"
          >
            View All <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </PublicPageHeader>

        {/* Category filter pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-5 md:pb-1 pl-3 pr-4 md:px-8 justify-start md:justify-center">
          {VENUE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] px-3 md:px-4 py-1.5 rounded-full border transition-all duration-200 ${
                activeCategory === cat
                  ? "bg-foreground text-background border-transparent"
                  : "bg-transparent text-foreground border-border/40 hover:border-foreground/30 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Mobile: snap carousel, one active card, dots — same engine as Upcoming Events */}
        <div className="md:hidden">
          <MobileMarqueeCarousel>
            {(trendingVenues ?? []).map((venue) => (
              <button
                key={venue._id}
                onClick={() => setSelectedVenue(venue)}
                className="block w-full text-left group focus:outline-none"
              >
                <VenueCardContent venue={venue} />
              </button>
            ))}
          </MobileMarqueeCarousel>
        </div>

        {/* Desktop: continuous drift marquee */}
        <div className="relative hidden md:block">
          <MarqueeCarousel>
            {(trendingVenues ?? []).map((venue, idx) => (
              <motion.div
                key={venue._id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="flex-shrink-0 w-[21.6rem]"
              >
                <button
                  onClick={() => setSelectedVenue(venue)}
                  className="block w-full text-left group focus:outline-none"
                >
                  <VenueCardContent venue={venue} />
                </button>
              </motion.div>
            ))}
          </MarqueeCarousel>
        </div>
      </div>

      <DetailModal
        open={!!selectedVenue}
        onClose={() => setSelectedVenue(null)}
        mediaClassName="sm:w-96"
        media={
          selectedVenue && (() => {
            const venueImages = Array.from(
              new Set([selectedVenue.image, ...(selectedVenue.images || [])].filter(Boolean))
            ) as string[];

            return (
              <div className="relative w-full sm:w-96 aspect-[4/5] rounded-t-3xl sm:rounded-none overflow-hidden bg-muted border-b sm:border-b-0 sm:border-r border-border/60">
                {venueImages.length > 0 ? (
                  <RevealImage
                    key={venueImages[activeImageIndex]}
                    src={venueImages[activeImageIndex]}
                    alt={selectedVenue.name}
                    spinner
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neon-lime/20 to-neon-lime/5 flex items-center justify-center">
                    <Building2 className="h-16 w-16 text-neon-lime/40" />
                  </div>
                )}

                {venueImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === 0 ? venueImages.length - 1 : prev - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-all border border-white/10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev === venueImages.length - 1 ? 0 : prev + 1))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/60 text-white hover:bg-black/80 flex items-center justify-center transition-all border border-white/10"
                      aria-label="Next image"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            );
          })()
        }
      >
        {selectedVenue && (
          <div className="space-y-5">
            <div>
              <div className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-neon-lime shrink-0" />
                <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground leading-tight">
                  {selectedVenue.name}
                </h3>
              </div>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="h-3 w-3 text-neon-lime/70" />
                <span className="text-[10px] font-black uppercase tracking-widest">{selectedVenue.location}</span>
              </div>
            </div>

            {/* Thumbnails */}
            {(() => {
              const venueImages = Array.from(
                new Set([selectedVenue.image, ...(selectedVenue.images || [])].filter(Boolean))
              ) as string[];
              return venueImages.length > 1 ? (
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                  {venueImages.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImageIndex(i)}
                      className={cn(
                        "relative flex-shrink-0 w-14 aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all",
                        activeImageIndex === i ? "border-neon-lime" : "border-border/50 opacity-60 hover:opacity-100"
                      )}
                    >
                      <RevealImage src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Tabs */}
            <Tabs defaultValue="about" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-muted/40 rounded-xl p-1 border border-border/20">
                <TabsTrigger
                  value="about"
                  className="rounded-lg font-black uppercase text-[10px] tracking-widest py-2.5 italic transition-all data-[state=active]:bg-background data-[state=active]:text-neon-lime data-[state=active]:shadow-sm"
                >
                  About
                </TabsTrigger>
                <TabsTrigger
                  value="location"
                  className="rounded-lg font-black uppercase text-[10px] tracking-widest py-2.5 italic transition-all data-[state=active]:bg-background data-[state=active]:text-neon-lime data-[state=active]:shadow-sm"
                >
                  Location
                </TabsTrigger>
              </TabsList>

              <TabsContent value="about" className="mt-4 focus-visible:outline-none">
                <div className="space-y-1.5 p-1">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Venue Profile</h4>
                  {selectedVenue.description ? (
                    <ReadMore text={selectedVenue.description} collapsedLines={4} />
                  ) : (
                    <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                      No description available for this trending venue.
                    </p>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="location" className="mt-4 space-y-4 focus-visible:outline-none">
                <div className="flex items-start gap-3 p-3 bg-muted/20 border border-border/50 rounded-xl">
                  <MapPin className="h-5 w-5 text-neon-lime shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">Address</h4>
                    <p className="text-xs text-foreground font-black uppercase">{selectedVenue.location}</p>
                  </div>
                </div>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedVenue.name + ' ' + selectedVenue.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-neon-lime text-black font-black uppercase tracking-widest text-[10px] hover:bg-neon-lime/80 transition-all italic text-center shadow-lg shadow-neon-lime/10"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  View on Google Maps
                </a>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DetailModal>
    </section>
  );
};

export default TrendingVenues;
