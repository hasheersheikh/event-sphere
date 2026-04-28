import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, MapPin, X, LayoutGrid, List, Calendar, MapPinIcon } from "lucide-react";
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
import { Event, ITicketType } from "@/types/event";

// ─── Date filter helpers ────────────────────────────────────────────────────

const DATE_FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "weekend", label: "This Weekend" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
] as const;

type DateFilterId = (typeof DATE_FILTERS)[number]["id"];

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

// ─── Format helpers (used in list view) ────────────────────────────────────

function formatListDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    weekday: "short", month: "short", day: "numeric",
  });
}

function formatMinPrice(ticketTypes: ITicketType[]) {
  if (!ticketTypes?.length) return "Free";
  const min = Math.min(...ticketTypes.map((t) => t.price));
  if (min === 0) return "Free";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(min);
}

// ─── List-view row ──────────────────────────────────────────────────────────

const EventListItem = ({ event, index }: { event: Event; index: number }) => {
  const isSoldOut =
    event.ticketTypes?.every((t) => t.isSoldOut || t.sold >= t.capacity) ?? false;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link
        to={`/events/${event._id}`}
        className="flex items-center gap-4 px-4 py-3.5 rounded-xl border border-border/20 hover:border-border/50 hover:bg-muted/20 transition-all duration-200 group"
      >
        <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-muted border border-border/20">
          <img
            src={event.image || ""}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-extrabold text-[13px] tracking-tight leading-snug line-clamp-1 group-hover:text-foreground/80 transition-colors">
            {event.title}
          </p>
          <div className="flex items-center gap-3 mt-0.5 text-muted-foreground">
            <span className="text-[11px] font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3 shrink-0" />
              {formatListDate(event.date)}
            </span>
            <span className="text-[11px] font-medium flex items-center gap-1 min-w-0">
              <MapPinIcon className="h-3 w-3 shrink-0" />
              <span className="line-clamp-1">{event.location?.venueName || event.location?.address?.split(",")[0]}</span>
            </span>
          </div>
        </div>

        <div className="shrink-0 text-right">
          {event.isSponsored && (
            <span className="block text-[8px] font-black uppercase tracking-wider text-muted-foreground mb-0.5">Promoted</span>
          )}
          {isSoldOut ? (
            <span className="text-[11px] font-bold text-muted-foreground">Sold Out</span>
          ) : (
            <span className="text-[13px] font-black">{formatMinPrice(event.ticketTypes)}</span>
          )}
        </div>
      </Link>
    </motion.div>
  );
};

// ─── Page ───────────────────────────────────────────────────────────────────

const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [dateFilter, setDateFilter] = useState<DateFilterId>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const { selectedCity } = useCity();

  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchQuery(searchParams.get("q") || "");
    setLocationFilter(searchParams.get("location") || "");
  }, [searchParams]);

  const { data: apiEvents, isLoading } = useQuery({
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
      return data as Event[];
    },
  });

  const rawEvents: Event[] = apiEvents || [];
  const displayEvents = filterByDate(rawEvents, dateFilter);

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
    setDateFilter("all");
    setSearchParams({});
  };

  const hasActiveFilters = searchQuery || selectedCategory || locationFilter || dateFilter !== "all";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-14 md:pt-16">

        {/* ─── Page header ─────────────────────────────────────────────── */}
        <section className="border-b border-border/20 py-10 md:py-14 relative overflow-hidden">
          {/* Decorative Mic Graphic */}
          <motion.div
            initial={{ opacity: 0, x: 100, rotate: 15 }}
            animate={{ opacity: 1, x: 0, rotate: 12 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-[-10%] top-[-20%] w-[50%] h-[150%] pointer-events-none hidden md:block opacity-[0.07] dark:opacity-[0.12]"
          >
            <img
              src="/mic.png"
              alt=""
              className="w-full h-full object-contain grayscale dark:brightness-0 dark:invert"
            />
          </motion.div>

          <div className="container relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="mb-7"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-2">
                Discover
              </p>
              <h1 className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-[0.88]">
                Events
                {!isLoading && displayEvents.length > 0 && (
                  <span className="text-muted-foreground/30 ml-3 text-2xl md:text-3xl font-bold">
                    {displayEvents.length}
                  </span>
                )}
              </h1>
            </motion.div>

            {/* Search bar */}
            <motion.form
              onSubmit={handleSearch}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.06, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-2 max-w-2xl"
            >
              <div className="flex flex-col sm:flex-row items-stretch gap-2 flex-1 p-1.5 bg-card border border-border/50 rounded-2xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Search events…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-10 pl-10 bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
                  />
                </div>
                <div className="hidden sm:block w-px self-stretch my-2 bg-border/40" />
                <div className="relative sm:w-48">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                  <Input
                    type="text"
                    placeholder="Location…"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="h-10 pl-10 bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-foreground/90 shrink-0"
                >
                  Search
                </Button>
              </div>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={clearFilters}
                  className="h-10 self-center px-4 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 text-[11px] font-bold shrink-0 transition-all"
                >
                  <X className="h-4 w-4 mr-1" /> Clear all
                </Button>
              )}
            </motion.form>
          </div>
        </section>

        {/* ─── Category pills (sticky) ──────────────────────────────────── */}
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
                    ? "bg-foreground border-foreground text-background"
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
                    if (next) params.set("category", next);
                    else params.delete("category");
                    setSearchParams(params);
                  }}
                  className={cn(
                    "whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all duration-200 shrink-0 flex items-center gap-1.5",
                    selectedCategory === cat.name
                      ? "bg-foreground border-foreground text-background"
                      : "border-border/50 text-muted-foreground hover:border-border hover:text-foreground bg-transparent"
                  )}
                >
                  <span>{cat.icon}</span>
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ─── Date filter + view toggle ────────────────────────────────── */}
        <section className="border-b border-border/10 py-2.5">
          <div className="container flex items-center justify-between gap-4">
            {/* Date tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
              {DATE_FILTERS.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setDateFilter(f.id)}
                  className={cn(
                    "whitespace-nowrap px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all duration-150 shrink-0",
                    dateFilter === f.id
                      ? "bg-foreground/8 text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-0.5 border border-border/40 rounded-lg p-0.5 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-md transition-colors duration-150",
                  viewMode === "grid" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="Grid view"
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={cn(
                  "h-7 w-7 flex items-center justify-center rounded-md transition-colors duration-150",
                  viewMode === "list" ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                )}
                aria-label="List view"
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ─── Results ─────────────────────────────────────────────────── */}
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
          ) : displayEvents.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                {displayEvents.map((event, index) => (
                  <EventCard key={event._id} event={event} index={index} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col gap-2 max-w-3xl">
                {displayEvents.map((event, index) => (
                  <EventListItem key={event._id} event={event} index={index} />
                ))}
              </div>
            )
          ) : (
            <div className="py-24 text-center space-y-6 border border-dashed border-border/50 rounded-2xl">
              <Search className="h-10 w-10 text-muted-foreground/20 mx-auto" />
              <div className="space-y-2">
                <h3 className="text-xl font-black tracking-tighter">No events found</h3>
                <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                  Try a different date range, category, or clear your filters.
                </p>
              </div>
              <Button
                onClick={clearFilters}
                variant="outline"
                className="rounded-xl font-black uppercase tracking-widest text-[10px] h-10 px-6 hover:bg-primary/10 hover:text-primary border-border/50 hover:border-primary/30 transition-all"
              >
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
