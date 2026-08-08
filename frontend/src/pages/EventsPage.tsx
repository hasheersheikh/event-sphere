import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, ArrowUpDown, ChevronUp } from "lucide-react";
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
import { Event } from "@/types/event";

// ─── Date filter helpers ────────────────────────────────────────────────────

const EVENTS_PER_PAGE = 20;

const DATE_FILTERS = [
  { id: "today", label: "Today" },
  { id: "weekend", label: "This Weekend" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
] as const;

type DateFilterId = "all" | (typeof DATE_FILTERS)[number]["id"];

function filterByDate(events: Event[], filter: DateFilterId): Event[] {
  if (filter === "all") return events;
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return events.filter((e) => {
    const eventDate = new Date(e.date);
    const eventDay = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
    if (filter === "today") return eventDay.getTime() === today.getTime();
    if (filter === "week") {
      const end = new Date(today); end.setDate(today.getDate() + 7);
      return eventDay >= today && eventDay <= end;
    }
    if (filter === "month") {
      const end = new Date(today); end.setDate(today.getDate() + 30);
      return eventDay >= today && eventDay <= end;
    }
    if (filter === "weekend") {
      const day = today.getDay(); // 0=Sun, 6=Sat
      const toFri = (5 - day + 7) % 7;
      const fri = new Date(today); fri.setDate(today.getDate() + (toFri === 0 && day !== 5 ? 7 : toFri));
      const sun = new Date(fri); sun.setDate(fri.getDate() + 2);
      return eventDay >= fri && eventDay <= sun;
    }
    return true;
  });
}

// ─── Page ───────────────────────────────────────────────────────────────────

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryImages: Record<string, string> = {
    "Music": "/categories/music.jpeg",
    "Comedy": "/categories/comedy.jpeg",
    "Sports": "/categories/sports.jpg",
    "Arts": "/categories/arts.jpeg",
    "Food & Drink": "/categories/food-drink.jpeg",
    "Health": "/categories/health.jpg",
    "Meetups": "/categories/meetups.jpeg",
  };
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [dateFilter, setDateFilter] = useState<DateFilterId>("all");
  const [sortBy, setSortBy] = useState<"default" | "price-asc" | "price-desc">("default");
  const [sortOpen, setSortOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const { selectedCity } = useCity();
  const sortRef = useRef<HTMLDivElement>(null);

  const placeholders = [
    "Let us help you catch the city pulse",
    "Best events in the city, instantly.",
    "Find concerts near you.",
    "Discover tonight's parties.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    if (!sortOpen) return;
    const close = (e: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [sortOpen]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const { data: apiEvents, isLoading } = useQuery({
    queryKey: ["events", searchQuery, selectedCategory, selectedCity],
    queryFn: async () => {
      const { data } = await api.get("/events", {
        params: {
          q: searchQuery,
          category: selectedCategory,
          city: selectedCity || undefined,
        },
      });
      return data as Event[];
    },
  });

  const rawEvents: Event[] = apiEvents || [];
  const dateFiltered = filterByDate(rawEvents, dateFilter);
  const displayEvents = useMemo(() => {
    if (sortBy === "default") return dateFiltered;
    return [...dateFiltered].sort((a, b) => {
      const minPrice = (e: Event) =>
        e.ticketTypes?.length ? Math.min(...e.ticketTypes.map((t) => t.price)) : 0;
      return sortBy === "price-asc" ? minPrice(a) - minPrice(b) : minPrice(b) - minPrice(a);
    });
  }, [dateFiltered, sortBy]);

  // Pagination
  const totalPages = Math.ceil(displayEvents.length / EVENTS_PER_PAGE);
  const paginatedEvents = displayEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, dateFilter, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    if (selectedCategory) params.set("category", selectedCategory);
    setSearchParams(params);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCategory("");
    setDateFilter("all");
    setSortBy("default");
    setSearchParams({});
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-0 md:pt-4">

        {/* ─── Desktop: heading + left-aligned search ──────────────────── */}
        <section className="hidden md:block py-1.5">
          <div className="container px-8">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-2"
            >
              <div className="mb-4">
                <p className="text-[9px] font-black uppercase tracking-[0.6em] text-neon-lime mb-1">Discover Experiences That Moves You</p>
                <h1 className="text-4xl font-black tracking-tighter">Events</h1>
              </div>
              <form onSubmit={handleSearch} className="max-w-md">
                <div className="flex items-stretch gap-1.5 p-1.5 bg-card border border-border/30 rounded-2xl shadow-[0_6px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
                    {!searchQuery && (
                      <div className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/60 pointer-events-none overflow-hidden h-5 flex items-center">
                        <span className="animate-scroll-vertical whitespace-nowrap" key={placeholderIndex}>
                          {placeholders[placeholderIndex]}
                        </span>
                      </div>
                    )}
                    <Input
                      type="text"
                      placeholder=""
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-10 pl-9 bg-transparent border-none focus-visible:ring-0 text-sm"
                    />
                  </div>
                  <Button
                    variant="default"
                    type="submit"
                    className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[9px] shrink-0"
                  >
                    Search
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ─── Mobile: centered pill search ────────────────────────────── */}
        <section className="md:hidden pt-4 pb-4">
          <div className="container px-8">
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex items-center gap-3 px-4 py-2 bg-card rounded-full border border-border/30 shadow-[0_6px_24px_rgba(0,0,0,0.12),0_2px_6px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.85)] dark:shadow-[0_6px_24px_rgba(0,0,0,0.65),0_2px_8px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.07)]">
                <div className="relative flex-1 h-9 flex items-center">
                  {!searchQuery && (
                    <div className="absolute inset-0 flex items-center overflow-hidden pointer-events-none">
                      <span className="animate-scroll-vertical whitespace-nowrap text-sm font-light text-foreground/50" key={placeholderIndex}>
                        {placeholders[placeholderIndex]}
                      </span>
                    </div>
                  )}
                  <Input
                    type="text"
                    placeholder=""
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 h-9 bg-transparent border-none focus-visible:ring-0 text-sm font-light px-0"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 w-9 rounded-full bg-neon-lime flex items-center justify-center shrink-0 active:scale-95 transition-transform duration-100"
                >
                  <Search className="h-4 w-4 text-black" />
                </button>
              </div>
            </motion.form>
          </div>
        </section>

        {/* ─── Mobile: Instagram stories-style categories ─────────────────── */}
        <section className="md:hidden py-4 px-8">
          <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide snap-x px-8 py-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const next = selectedCategory === cat.name ? "" : cat.name;
                    setSelectedCategory(next);
                    const params = new URLSearchParams(searchParams);
                    if (next) params.set("category", next);
                    else params.delete("category");
                    setSearchParams(params);
                  }}
                  className="flex flex-col items-center gap-1.5 shrink-0 snap-start group p-2"
                >
                  <div
                    className={cn(
                      "w-20 h-20 rounded-full overflow-hidden transition-all duration-200 relative",
                      selectedCategory === cat.name
                        ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                        : ""
                    )}
                  >
                    <img
                      src={categoryImages[cat.name] || "/images/categories/other.jpg"}
                      alt={cat.name}
                      className={cn(
                        "w-full h-full object-cover transition-all duration-200",
                        selectedCategory === cat.name ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                      )}
                    />
                    {selectedCategory === cat.name && (
                      <div className="absolute inset-0 bg-foreground/20 rounded-full" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-bold whitespace-nowrap",
                      selectedCategory === cat.name ? "text-foreground font-black" : "text-muted-foreground"
                    )}
                  >
                    {cat.name}
                  </span>
                </button>
              ))}
          </div>
        </section>

        {/* ─── Desktop: Category pills ─────────────────────────────────────────── */}
        <section className="hidden md:block py-2">
          <div className="container px-8">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    const next = selectedCategory === cat.name ? "" : cat.name;
                    setSelectedCategory(next);
                    const params = new URLSearchParams(searchParams);
                    if (next) params.set("category", next);
                    else params.delete("category");
                    setSearchParams(params);
                  }}
                  className={cn(
                    "whitespace-nowrap px-3.5 md:px-4 py-1.5 md:py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border transition-all duration-200 shrink-0 flex items-center gap-1 md:gap-1.5",
                    selectedCategory === cat.name
                      ? "bg-foreground border-foreground text-background"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
                  )}
                >
                  <span className="text-xs md:text-sm">{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Date filter + view toggle ────────────────────────────────── */}
        <section className="py-2 md:py-2">
          <div className="container px-8 flex items-center justify-between gap-3 md:gap-4">
            {/* Date tabs */}
            <div className="flex items-center gap-1 md:gap-1.5 overflow-x-auto scrollbar-hide">
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter((prev) => (prev === f.id ? "all" : f.id))}
                  className={cn(
                    "whitespace-nowrap px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-200 shrink-0",
                    dateFilter === f.id
                      ? "bg-foreground border-foreground text-background"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              {/* Sort by price */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className={cn(
                    "h-7 px-3 flex items-center gap-1.5 rounded-lg border text-[9px] font-black uppercase tracking-widest transition-colors duration-150",
                    sortBy !== "default"
                      ? "border-foreground bg-foreground text-background"
                      : "border-border/40 text-muted-foreground hover:text-foreground hover:border-border"
                  )}
                >
                  <ArrowUpDown className="h-3 w-3" />
                  <span className="hidden sm:inline">
                    {sortBy === "price-asc" ? "Price ↑" : sortBy === "price-desc" ? "Price ↓" : "Sort"}
                  </span>
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-9 z-50 w-44 rounded-xl border border-border/60 bg-background shadow-xl overflow-hidden">
                    {[
                      { id: "default", label: "Default" },
                      { id: "price-asc", label: "Price: Low to High" },
                      { id: "price-desc", label: "Price: High to Low" },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => { setSortBy(opt.id as typeof sortBy); setSortOpen(false); }}
                        className={cn(
                          "w-full text-left px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors",
                          sortBy === opt.id ? "bg-foreground text-background" : "hover:bg-muted text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Results ─────────────────────────────────────────────────── */}
        <section className="container py-8 md:py-10 px-8 md:px-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="space-y-3">
                  <Skeleton className="aspect-[4/5] w-full rounded-xl" />
                  <Skeleton className="h-2.5 w-20 rounded" />
                  <Skeleton className="h-4 w-full rounded" />
                  <Skeleton className="h-3 w-28 rounded" />
                </div>
              ))}
            </div>
          ) : displayEvents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-3 gap-y-8 md:gap-x-6 md:gap-y-12 lg:gap-x-8 lg:gap-y-14">
                {paginatedEvents.map((event, index) => (
                  <EventCard key={event._id} event={event} index={index} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 md:mt-12">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
                      currentPage === 1
                        ? "border-border/30 text-muted-foreground"
                        : "border-border/60 text-foreground hover:border-foreground hover:bg-foreground/5"
                    )}
                  >
                    ←
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                      // Show first page, last page, current page, and pages around current page
                      const showPage =
                        pageNum === 1 ||
                        pageNum === totalPages ||
                        (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

                      if (!showPage && pageNum === currentPage - 2) {
                        return (
                          <span key={pageNum} className="text-muted-foreground text-sm px-2">
                            ...
                          </span>
                        );
                      }

                      if (!showPage && pageNum === currentPage + 2) {
                        return (
                          <span key={pageNum} className="text-muted-foreground text-sm px-2">
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={cn(
                            "h-10 w-10 rounded-full text-sm font-black border transition-all duration-200",
                            currentPage === pageNum
                              ? "bg-foreground border-foreground text-background"
                              : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
                          )}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "h-10 w-10 rounded-full border flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed",
                      currentPage === totalPages
                        ? "border-border/30 text-muted-foreground"
                        : "border-border/60 text-foreground hover:border-foreground hover:bg-foreground/5"
                    )}
                  >
                    →
                  </button>
                </div>
              )}

              {/* Results info */}
              <div className="text-center mt-6 text-xs text-muted-foreground">
                Showing {((currentPage - 1) * EVENTS_PER_PAGE) + 1}-{Math.min(currentPage * EVENTS_PER_PAGE, displayEvents.length)} of {displayEvents.length} events
              </div>
            </>
          ) : (
            <div className="py-16 md:py-24 text-center space-y-4 md:space-y-6 border border-dashed border-border/50 rounded-2xl">
              <Search className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/20 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-lg md:text-xl font-black tracking-tighter">No events found</h3>
                <p className="text-muted-foreground text-xs md:text-sm max-w-xs mx-auto">
                  Try a different date range, category, or clear your filters.
                </p>
              </div>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="rounded-xl font-black uppercase tracking-widest text-[10px] h-9 md:h-10 px-5 md:px-6 hover:bg-primary/10 hover:text-primary border-border/50 hover:border-primary/30 transition-all"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </section>
      </main>

      <Footer mobileMinimal />

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showBackToTop ? 1 : 0, scale: showBackToTop ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-foreground text-background shadow-lg hover:shadow-xl hover:bg-foreground/90 transition-all flex items-center justify-center"
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </motion.button>
    </div>
  );
};

export default EventsPage;
