import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, Calendar, Filter, X } from "lucide-react";
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
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <div className="fixed inset-0 bg-muted/20 z-0" />
      <Navbar />

      <main className="flex-1">
        {/* Header */}
        <section className="bg-muted/30 py-8 md:py-12 border-b border-border">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                Explore Events
              </h1>
              <p className="text-muted-foreground text-lg">
                Discover {events?.length || 0} amazing events happening near you
              </p>
            </motion.div>

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              onSubmit={handleSearch}
              className="mt-8 flex flex-col md:flex-row gap-3"
            >
              <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-12 pl-12 rounded-xl border-border focus:border-primary transition-all"
                />
              </div>
              <div className="relative md:w-64 group">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <Input
                  type="text"
                  placeholder="Location"
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="h-12 pl-12 rounded-xl border-border focus:border-primary transition-all"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="h-12 rounded-xl font-bold uppercase tracking-wider px-8 shadow-lg transition-all hover:scale-105 active:scale-95"
              >
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                size="lg"
                className="h-12 md:hidden rounded-none font-bold"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-5 w-5 mr-2" />
                Filters
              </Button>
            </motion.form>
          </div>
        </section>

        {/* Main Content */}
        <section className="container py-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Filters */}
            <aside
              className={`lg:w-64 shrink-0 ${showFilters ? "block" : "hidden lg:block"}`}
            >
              <div className="sticky top-20 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Categories</h3>
                  {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
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
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all border ${
                        selectedCategory === category.name
                          ? "bg-primary text-primary-foreground border-primary shadow-lg"
                          : "bg-background hover:bg-muted border-border"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span>{category.name}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            {/* Events Grid */}
            <div className="flex-1">
              {/* Active Filters */}
              {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2 mb-6">
                  <span className="text-sm text-muted-foreground">
                    Active filters:
                  </span>
                  {searchQuery && (
                    <Badge variant="secondary" className="gap-1">
                      Search: {searchQuery}
                      <button onClick={() => setSearchQuery("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {selectedCategory && (
                    <Badge variant="secondary" className="gap-1">
                      {selectedCategory}
                      <button onClick={() => setSelectedCategory("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {locationFilter && (
                    <Badge variant="secondary" className="gap-1">
                      {locationFilter}
                      <button onClick={() => setLocationFilter("")}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                </div>
              )}

              {/* Results */}
              {isLoading ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="flex flex-col space-y-3">
                      <Skeleton className="h-[200px] w-full rounded-2xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[80%]" />
                      </div>
                      <div className="flex justify-between items-center pt-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events?.length > 0 ? (
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {events.map((event: any, index: number) => (
                    <EventCard key={event._id} event={event} index={index} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold mb-2">
                    No events found
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Try adjusting your filters or search query
                  </p>
                  <Button onClick={clearFilters}>Clear Filters</Button>
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
