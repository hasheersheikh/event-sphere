import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, X } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import EventCard from "@/components/events/EventCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { categories } from "@/data/mockEvents";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCity } from "@/contexts/CityContext";

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const { selectedCity } = useCity();

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("q") || "");
    setLocationFilter(searchParams.get("location") || "");
  }, [searchParams]);

  const { data: events, isLoading } = useQuery({
    queryKey: ["events", searchQuery, selectedCategory, locationFilter, selectedCity],
    queryFn: async () => {
      const { data } = await api.get("/events", {
        params: {
          q: searchQuery,
          category: selectedCategory,
          location: locationFilter,
          city: selectedCity || undefined,
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-14 md:pt-16">

        {/* ─── Page header ─── */}
        <section className="border-b border-border/20 py-8 md:py-10">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-6"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.45em] text-primary mb-2">
                Discover
              </p>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter">
                Events
                {events?.length > 0 && (
                  <span className="text-muted-foreground/50 ml-3 text-2xl md:text-3xl font-bold">
                    {events.length}
                  </span>
                )}
              </h1>
            </motion.div>

            {/* Search bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  type="text"
                  placeholder="Search events…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-11 pl-10 bg-card border-border/50 rounded-xl font-medium text-sm"
                />
              </div>
              <div className="relative sm:w-56">
                <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
                <Input
                  type="text"
                  placeholder="Location…"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-11 pl-10 bg-card border-border/50 rounded-xl font-medium text-sm"
                />
              </div>
              <Button
                type="submit"
                className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground shrink-0"
              >
                Search
              </Button>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-11 px-4 rounded-xl text-muted-foreground hover:text-foreground text-[11px] font-bold shrink-0"
                >
                  <X className="h-4 w-4 mr-1" /> Clear
                </Button>
              )}
            </motion.form>
          </div>
        </section>

        {/* ─── Category filter pills ─── */}
        <section className="border-b border-border/20 py-3 sticky top-14 md:top-16 z-30 bg-background/95 backdrop-blur-xl">
          <div className="container">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  const params = new URLSearchParams(searchParams);
                  params.delete("category");
                  setSearchParams(params);
                }}
                className={cn(
                  "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-200 shrink-0",
                  !selectedCategory
                    ? "bg-primary border-primary text-primary-foreground"
                    : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
                )}
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const next = selectedCategory === cat.name ? "" : cat.name;
                    setSelectedCategory(next);
                    const params = new URLSearchParams(searchParams);
                    if (next) params.set("category", next); else params.delete("category");
                    setSearchParams(params);
                  }}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-200 shrink-0",
                    selectedCategory === cat.name
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Results grid ─── */}
        <section className="container py-8">
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[3/4] w-full rounded-xl" />
                  <Skeleton className="h-2.5 w-20 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              ))}
            </div>
          ) : events?.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {events.map((event: any, index: number) => (
                <EventCard key={event._id} event={event} index={index} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center space-y-6 border border-dashed border-border/50 rounded-2xl">
              <Search className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tighter">No events found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Try adjusting your search or filters.
                </p>
              </div>
              <Button onClick={clearFilters} variant="outline" className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6">
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default EventsPage;
