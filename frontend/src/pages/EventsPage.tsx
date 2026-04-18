import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Filter, X, Zap } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventCard from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { categories } from "@/data/mockEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") || "",
  );
  const [locationFilter, setLocationFilter] = useState(
    searchParams.get("location") || "",
  );
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("q") || "");
    setLocationFilter(searchParams.get("location") || "");
  }, [searchParams]);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", searchQuery, selectedCategory, locationFilter],
    queryFn: async () => {
      const { data } = await api.get("/events", {
        params: {
          q: searchQuery,
          category: selectedCategory,
          location: locationFilter,
        },
      });
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    if (locationFilter) params.set("location", locationFilter);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setLocationFilter("");
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory || locationFilter;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-16 pb-8 md:pt-20 md:pb-12 overflow-hidden">
          <div className="container relative z-20">
            <PublicPageHeader
              pillText="Premium Experience"
              title={
                <>
                  Discover <span className="text-primary italic">Events.</span>
                </>
              }
              subtitle={`Explore ${
                events?.length || 0
              } curated experiences happening in your orbit. Hand-picked for the bold and the curious.`}
              themeColor="primary"
              size="md"
            />

            {/* Search & Filter Bar */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="max-w-5xl mx-auto"
            >
              <form
                onSubmit={handleSearch}
                className="flex flex-col md:flex-row gap-4 p-3 bg-card/50 border border-border/50 rounded-[2.2rem] backdrop-blur-xl shadow-2xl"
              >
                <div className="relative flex-1 group">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Wandering for something specific?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-12 pl-14 bg-background/50 border-white/5 rounded-3xl font-bold text-base focus:ring-primary focus:border-primary transition-all shadow-inner"
                  />
                </div>
                <div className="relative md:w-80 group">
                  <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input
                    type="text"
                    placeholder="Near you..."
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="h-12 pl-14 bg-background/50 border-white/5 rounded-3xl font-bold text-base focus:ring-primary focus:border-primary transition-all shadow-inner"
                  />
                </div>
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 rounded-xl font-black uppercase tracking-[0.2em] text-[9px] px-8 shadow-button hover:scale-[1.02] active:scale-[0.98] transition-all bg-primary text-primary-foreground"
                >
                  Locate Events
                </Button>
              </form>
            </motion.div>
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-16">
          <div className="flex flex-col lg:flex-row gap-16">
            {/* Sidebar Filters */}
            <aside
              className={`lg:w-72 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="sticky top-32 space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-border/50 pb-4">
                    <h3 className="text-xs font-black uppercase tracking-[0.3em] text-muted-foreground">
                      Dimensions
                    </h3>
                    {hasActiveFilters && (
                      <button
                        onClick={clearFilters}
                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() =>
                          setSelectedCategory(
                            selectedCategory === category.name
                              ? ""
                              : category.name,
                          )
                        }
                        className={cn(
                          "w-full flex items-center justify-between px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 border",
                          selectedCategory === category.name
                            ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02]"
                            : "bg-card/50 border-border/50 text-muted-foreground hover:bg-card hover:text-foreground",
                        )}
                      >
                        {category.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Promotional Card */}
                <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/20 relative overflow-hidden group">
                  <div className="relative z-10 space-y-4">
                    <h4 className="text-xl font-black tracking-tighter italic uppercase">
                      Pulse Prime.
                    </h4>
                    <p className="text-xs font-bold text-muted-foreground leading-relaxed">
                      Unlock early access to the most exclusive experiences in
                      your city.
                    </p>
                    <Button
                      variant="link"
                      className="p-0 h-auto text-[10px] font-black uppercase tracking-widest text-primary"
                    >
                      Learn More &rarr;
                    </Button>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
                    <Zap className="h-24 w-24 text-primary" />
                  </div>
                </div>
              </div>
            </aside>

            {/* Events Grid */}
            <div className="flex-1 space-y-12">
              {/* Results Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h2 className="text-3xl font-black tracking-tighter uppercase italic">
                    {hasActiveFilters ? "Filtered" : "All"}{" "}
                    <span className="text-primary">Experiences.</span>
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium mt-2">
                    Showing {events?.length || 0} results matching your intent.
                  </p>
                </div>

                {hasActiveFilters && (
                  <div className="flex flex-wrap items-center gap-3">
                    {searchQuery && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/5 border-primary/20 text-primary rounded-xl px-4 py-1.5 font-bold"
                      >
                        "{searchQuery}"
                        <button
                          onClick={() => setSearchQuery("")}
                          className="ml-2 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {selectedCategory && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/5 border-primary/20 text-primary rounded-xl px-4 py-1.5 font-bold"
                      >
                        {selectedCategory}
                        <button
                          onClick={() => setSelectedCategory("")}
                          className="ml-2 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                    {locationFilter && (
                      <Badge
                        variant="secondary"
                        className="bg-primary/5 border-primary/20 text-primary rounded-xl px-4 py-1.5 font-bold"
                      >
                        {locationFilter}
                        <button
                          onClick={() => setLocationFilter("")}
                          className="ml-2 hover:text-foreground"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    )}
                  </div>
                )}
              </div>

              {/* Results Grid */}
              {isLoading ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-6">
                      <Skeleton className="h-64 w-full rounded-[2.5rem]" />
                      <div className="space-y-3 px-4">
                        <Skeleton className="h-6 w-3/4 rounded-full" />
                        <Skeleton className="h-4 w-1/2 rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events?.length > 0 ? (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8 pb-32">
                  {events.map((event: any, index: number) => (
                    <EventCard key={event._id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center space-y-8 bg-card/30 border border-dashed border-border/50 rounded-[3rem]">
                  <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                    <Search className="h-10 w-10 text-muted-foreground/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black uppercase tracking-tight italic">
                      Void Detected.
                    </h3>
                    <p className="text-muted-foreground max-w-sm mx-auto font-medium">
                      We couldn't locate any experiences matching your current
                      parameters.
                    </p>
                  </div>
                  <Button
                    onClick={clearFilters}
                    className="rounded-xl px-10 py-4 font-black uppercase tracking-widest text-[9px] shadow-button"
                  >
                    Reset Search
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;
