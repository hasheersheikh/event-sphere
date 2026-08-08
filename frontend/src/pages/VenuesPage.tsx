import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, MapPin, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { motion } from "framer-motion";

interface TrendingVenue {
  _id: string;
  name: string;
  location: string;
  description?: string;
  image?: string;
  images?: string[];
  order: number;
}

const VenuesPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVenue, setSelectedVenue] = useState<TrendingVenue | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  const { data: venues = [], isLoading } = useQuery<TrendingVenue[]>({
    queryKey: ["trendingVenues"],
    queryFn: async () => {
      const { data } = await api.get("/trending-venues");
      return data;
    },
  });

  const filteredVenues = venues.filter(
    (v) =>
      v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-0 md:pt-4">

        {/* ─── Header ─── */}
        <section className="border-b border-border/20 py-1 md:py-1.5">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-4"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-neon-lime mb-2">
                Discover
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                Trending <span className="text-neon-lime">Venues</span>
              </h1>
            </motion.div>

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="relative max-w-md"
            >
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
              <Input
                placeholder="Search venues…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-11 pl-10 bg-card border-border/50 rounded-xl font-medium text-sm"
              />
            </motion.div>
          </div>
        </section>

        {/* Results */}
        <section className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filteredVenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVenues.map((venue, idx) => (
                <motion.div
                  key={venue._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                >
                  <button
                    onClick={() => {
                      setSelectedVenue(venue);
                      setActiveImageIndex(0);
                    }}
                    className="block w-full text-left group focus:outline-none"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-muted border border-border/50 hover:border-neon-lime/50 transition-all duration-300">
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
                            <div className="flex items-center gap-1 text-white/70">
                              <MapPin className="h-3 w-3 text-neon-lime/75" />
                              <span className="text-[10px] font-medium tracking-wide">{venue.location}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-6 border border-dashed border-border/50 rounded-2xl">
              <Search className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tighter">No venues found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Try a different search term or clear your filter.
                </p>
              </div>
              <Button
                onClick={() => setSearchQuery("")}
                variant="outline"
                className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 hover:bg-primary/10 hover:text-primary border-border/50 hover:border-primary/30 transition-all"
              >
                Clear Search
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Details Dialog */}
      <Dialog open={!!selectedVenue} onOpenChange={(open) => !open && setSelectedVenue(null)}>
        <DialogContent className="sm:max-w-lg overflow-hidden rounded-2xl border-border bg-background shadow-2xl p-6">
          {selectedVenue && (() => {
            const venueImages = Array.from(
              new Set([selectedVenue.image, ...(selectedVenue.images || [])].filter(Boolean))
            ) as string[];

            return (
              <div className="space-y-5">
                <DialogHeader className="p-0">
                  <DialogTitle className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-neon-lime" />
                    {selectedVenue.name}
                  </DialogTitle>
                  <div className="flex items-center gap-1 text-muted-foreground mt-0.5">
                    <MapPin className="h-3 w-3 text-neon-lime/70" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedVenue.location}</span>
                  </div>
                </DialogHeader>

                {/* Photos Gallery */}
                <div className="space-y-2">
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-muted border border-border/60">
                    {venueImages.length > 0 ? (
                      <img
                        src={venueImages[activeImageIndex]}
                        alt={selectedVenue.name}
                        className="w-full h-full object-cover transition-all duration-300"
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

                  {venueImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {venueImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImageIndex(i)}
                          className={cn(
                            "relative flex-shrink-0 w-20 aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all",
                            activeImageIndex === i ? "border-neon-lime" : "border-border/50 opacity-60 hover:opacity-100"
                          )}
                        >
                          <img src={img} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

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
                      <p className="text-xs text-foreground/80 leading-relaxed font-semibold">
                        {selectedVenue.description || "No description available for this trending venue."}
                      </p>
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
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VenuesPage;
