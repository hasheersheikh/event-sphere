import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  ChevronLeft,
  Ticket,
  Trash2,
  User,
  Sparkles,
  Mail,
  Phone,
  Plus,
  Minus,
  Eye,
  Instagram,
  Building2,
  ChevronDown,
  Check,
  Shield,
  ExternalLink,
  Play,
  Zap,
  Headphones,
  MessageCircle,
  Smartphone,
  ChevronUp,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { cn } from "@/lib/utils";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import ShareSnippet from "@/components/events/ShareSnippet";
import BookingModal from "@/components/events/BookingModal";
import TermsAndConditions from "@/components/events/TermsAndConditions";
import EventHeroGallery from "@/components/events/EventHeroGallery";

const formatViews = (viewCount?: number) => {
  const baseViews = 10000 + (viewCount || 0);
  if (baseViews >= 1000) {
    return `${(baseViews / 1000).toFixed(1)} K`;
  }
  return baseViews.toString();
};

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareSnippet, setShowShareSnippet] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; hasStarted: boolean } | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showAllReels, setShowAllReels] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showFullLineup, setShowFullLineup] = useState(false);
  const [videoModal, setVideoModal] = useState<{ url: string; vertical?: boolean } | null>(null);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const { data: sameCategoryEvents } = useQuery({
    queryKey: ["sameCategoryEvents", id, event?.category],
    queryFn: async () => {
      const { data } = await api.get("/events", {
        params: { category: event?.category, limit: 5 },
      });
      return data;
    },
    enabled: !!event?.category,
  });

  const { data: generalEvents } = useQuery({
    queryKey: ["generalEvents", id],
    queryFn: async () => {
      const { data } = await api.get("/events", {
        params: { limit: 10, sort: "-createdAt" },
      });
      return data;
    },
    enabled: !!id,
  });

  const filteredSimilarEvents = (() => {
    const excludeId = (e: any) => e._id !== id && e._id !== event?._id;
    const sameCategory = (sameCategoryEvents || []).filter(excludeId).slice(0, 5);
    const usedIds = new Set([id, event?._id, ...sameCategory.map((e: any) => e._id)]);
    const fill = (generalEvents || [])
      .filter((e: any) => !usedIds.has(e._id))
      .slice(0, 5 - sameCategory.length);
    return [...sameCategory, ...fill].slice(0, 5);
  })();


  const getTimeRemaining = () => {
    if (!event?.nextOccurrence || !event?.isActive) return null;

    try {
      const nextDate = new Date(event.nextOccurrence);
      const now = new Date();

      // Build start datetime from the occurrence date + event.time
      const startDateTime = new Date(nextDate);
      if (event.time && event.time.trim() !== '') {
        const [sh, sm] = event.time.split(":").map(Number);
        startDateTime.setHours(sh, sm, 0, 0);
      }

      // Build end datetime if endTime is provided
      let endDateTime: Date | null = null;
      if (event.endTime && event.endTime.trim() !== '') {
        endDateTime = new Date(nextDate);
        const [eh, em] = event.endTime.split(":").map(Number);
        endDateTime.setHours(eh, em, 0, 0);
      }

      const hasStarted = startDateTime <= now;
      // After start: count to end (if available), otherwise nothing to show
      const target = hasStarted ? endDateTime : startDateTime;
      if (!target) return null;

      const difference = target.getTime() - now.getTime();
      if (difference <= 0) return null;

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        hasStarted,
      };
    } catch { return null; }
  };

  useEffect(() => {
    if (!event?.isActive) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(getTimeRemaining());
    const timer = setInterval(() => setTimeLeft(getTimeRemaining()), 1000);
    return () => clearInterval(timer);
  }, [event?.isActive, event?.nextOccurrence, event?.endTime]);

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


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">
          <div className="h-[45vh] md:h-[55vh] bg-muted animate-pulse" />
          <div className="container py-8 space-y-4 max-w-5xl">
            <div className="h-8 w-48 rounded bg-muted animate-pulse" />
            <div className="h-12 w-3/4 rounded bg-muted animate-pulse" />
            <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-24 text-center">
          <h1 className="text-2xl font-black mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-8">This event doesn't exist or has been removed.</p>
          <Link to="/events"><Button className="rounded-xl">Browse Events</Button></Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

  const formatDuration = (start: string, end?: string): string | null => {
    if (!end) return null;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let mins = (eh * 60 + em) - (sh * 60 + sm);
    if (mins <= 0) mins += 24 * 60;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h === 0) return `${m} min`;
    if (m === 0) return `${h} hr${h > 1 ? "s" : ""}`;
    return `${h} hr${h > 1 ? "s" : ""} ${m} min`;
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);
  };

  const totalCapacity = event.ticketTypes?.reduce((acc: number, t: any) => acc + t.capacity, 0) || 0;
  const totalSold = event.ticketTypes?.reduce((acc: number, t: any) => acc + t.sold, 0) || 0;
  const soldPercentage = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

  const getRecurrenceText = (recurrence: any) => {
    if (!recurrence || !recurrence.frequency) return "";
    const freq = recurrence.frequency === "daily" ? "Daily" : "Weekly";
    const days = recurrence.daysOfWeek?.length 
      ? ` on ${recurrence.daysOfWeek.map((d: number) => ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d]).join(", ")}`
      : "";
    return `${freq}${days}`;
  };

  const getCategoryImage = (category: string = "other") => {
    const cats: Record<string, string> = {
      music: "/images/categories/music.png", technology: "/images/categories/music.png",
      business: "/images/categories/meetups.png", entertainment: "/images/categories/comedy.png",
      comedy: "/images/categories/comedy.png",
      health: "/images/categories/health.png", sports: "/images/categories/sports.png",
      education: "/images/categories/meetups.png", workshop: "/images/categories/meetups.png",
      other: "/images/categories/meetups.png", art: "/images/categories/arts.png",
      exhibition: "/images/categories/arts.png",
      meetup: "/images/categories/meetups.png", tech: "/images/categories/music.png",
    };
    return cats[category.toLowerCase()] || cats.other;
  };

  const getYouTubeId = (url: string) => {
    if (!url) return null;
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11}).*/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  };

  const videoId = getYouTubeId(event.videoUrl);

  // Only use reels if they exist on the event
  const displayReels = event.reels?.length ? event.reels : [];

  const visibleReels = showAllReels ? displayReels : displayReels.slice(0, 2);

  const minPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map((t: any) => t.price))
    : 0;
  const allSoldOut = event.ticketTypes?.every((t: any) => t.isSoldOut || t.sold >= t.capacity);

  const getReelData = (url: string) => {
    if (!url) return null;

    // YouTube Shorts
    const shortsRegex = /\/shorts\/([a-zA-Z0-9_-]+)/;
    const shortsMatch = url.match(shortsRegex);
    if (shortsMatch) return { type: 'youtube', id: shortsMatch[1] };

    // Instagram Reels
    const instaRegex = /\/(?:reel|reels)\/([a-zA-Z0-9_-]+)/;
    const instaMatch = url.match(instaRegex);
    if (instaMatch) return { type: 'instagram', id: instaMatch[1] };

    return null;
  };

  const hasAvailableTickets = event.ticketTypes?.some((t: any) => !(t.isSoldOut || t.sold >= t.capacity));

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20">
      <Navbar />

      <main className="flex-1 pt-12 pb-32 md:pb-24 relative z-10">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">

          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">

            {/* Left Column: Image & Protection Info */}
            <div className="w-full md:w-[40%] space-y-6">
              <div className="relative aspect-[4/5] w-full">
                {/* Event Hero Gallery - Shows image and video in a slideshow */}
                <EventHeroGallery
                  imageUrl={event.image || getCategoryImage(event.category)}
                  videoUrl={(event as any).eventVideo}
                  aspectRatio="portrait"
                />

                {/* Share Button Overlay */}
                <div className="absolute top-4 right-4 z-20">
                  <button
                    onClick={() => setShowShareSnippet(true)}
                    className="h-10 px-4 rounded-full bg-slate-950/70 backdrop-blur-md border border-white/10 flex items-center gap-2 hover:bg-slate-900/90 text-white transition-all shadow-lg text-xs font-black uppercase tracking-wider group"
                    title="Share Event"
                  >
                    <Share2 className="h-3.5 w-3.5 group-hover:scale-110 transition-transform" />
                    <span>Share</span>
                  </button>
                </div>
              </div>



              {/* Media Section: Desktop Only (In Left Column) */}
              <div className="hidden md:block space-y-10">
                {/* Main Video Highlight */}
                {videoId && (
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-2xl font-black tracking-tighter">Main Video</h3>
                    </div>
                    <button
                      onClick={() => setVideoModal({ url: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` })}
                      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-border/30 group block"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                          <Play className="h-6 w-6 text-black ml-1" />
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Reels Section */}
                {displayReels.length > 0 && (
                  <div className="pt-10 space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-2xl font-black tracking-tighter">Event Reels</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{displayReels.length} Clips</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      {visibleReels.map((reel, idx) => {
                        const data = getReelData(reel);
                        const embedUrl = data?.type === 'youtube'
                          ? `https://www.youtube.com/embed/${data.id}?controls=0&modestbranding=1&rel=0`
                          : data?.type === 'instagram'
                            ? `https://www.instagram.com/reel/${data.id}/embed`
                            : null;

                        return (
                          <div key={idx} className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 shadow-lg border border-border/30 group">
                            {embedUrl ? (
                              <iframe
                                src={embedUrl}
                                className="absolute inset-0 w-full h-full pointer-events-auto"
                                title={`Event reel ${idx + 1}`}
                                allowFullScreen
                                style={{ border: 0 }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                                <Play className="h-8 w-8 text-muted-foreground" />
                              </div>
                            )}
                            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-100 group-hover:opacity-0 transition-opacity duration-500" />
                          </div>
                        );
                      })}
                    </div>

                    {displayReels.length > 2 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllReels(!showAllReels)}
                        className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-border hover:bg-muted"
                      >
                        {showAllReels ? "Show Less" : "Show More Reels"}
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Content */}
            <div className="w-full md:w-[60%] space-y-10">

               {/* Header */}
               <div className="space-y-5">
                 <div className="flex flex-wrap items-center gap-4">
                   <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-[9px] font-black uppercase tracking-[0.15em]">
                     {event.category}
                   </span>
                   <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                     <Eye className="h-3.5 w-3.5" />
                     {formatViews(event.viewCount)} Views
                   </span>
                   {event.isActive && event.endTime ? (
                     <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full text-primary">
                       <Clock className="h-3.5 w-3.5" />
                       <span className="text-[10px] font-black uppercase tracking-widest">
                         {formatDuration(event.time, event.endTime)}
                       </span>
                     </div>
                   ) : (
                     event.isActive === false && (
                       <div className="flex items-center gap-2 bg-rose-500/10 px-3 py-1 rounded-full text-rose-500">
                         <Clock className="h-3.5 w-3.5" />
                         <span className="text-[10px] font-black uppercase tracking-widest">
                           This event has ended
                         </span>
                       </div>
                     )
                   )}
                 </div>

                 <h1 className="font-display font-black text-3xl md:text-5xl lg:text-7xl leading-[0.95] tracking-tight uppercase break-words">
                   {event.title}
                 </h1>

                 {/* Artist Information */}
                 {event.artist && event.artist.name && (
                   <div className="flex items-center gap-4 py-4 border-t border-b border-border/30">
                     {event.artist.profileImage ? (
                       <img
                         src={event.artist.profileImage}
                         alt={event.artist.name}
                         className="w-16 h-16 rounded-full object-cover border-2 border-neon-lime/30"
                       />
                     ) : (
                       <div className="w-16 h-16 rounded-full bg-neon-lime/10 flex items-center justify-center border-2 border-neon-lime/30">
                         <Users className="h-8 w-8 text-neon-lime" />
                       </div>
                     )}
                     <div className="flex-1">
                       <p className="text-[10px] font-black uppercase tracking-widest text-neon-lime mb-1">Artist</p>
                       <p className="text-xl font-black">{event.artist.name}</p>
                       {event.artist.instagramHandle && (
                         <a
                           href={`https://instagram.com/${event.artist.instagramHandle.replace('@', '')}`}
                           target="_blank"
                           rel="noopener noreferrer"
                           className="inline-flex items-center gap-2 text-sm font-bold text-neon-lime hover:text-neon-lime/80 transition-colors mt-1"
                         >
                           @{event.artist.instagramHandle.replace('@', '')} <ExternalLink className="h-3.5 w-3.5" />
                         </a>
                       )}
                      </div>
                    </div>
                  )}

                 <div className="space-y-2.5">
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-muted-foreground tracking-tight">{event.location.venueName || "Venue"}</p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((event.location.venueName || "") + " " + (event.location.address || ""))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in Maps"
                      className="shrink-0 h-7 w-7 rounded-full bg-muted/60 hover:bg-neon-lime/20 border border-border/40 hover:border-neon-lime/50 flex items-center justify-center transition-all"
                    >
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground hover:text-neon-lime" />
                    </a>
                  </div>
                  <p className="text-2xl font-black text-[#C4F000] tracking-tight">
                    {event.scheduleType === "recurring"
                      ? event.nextOccurrence
                        ? `${getRecurrenceText(event.recurrence)} • Next: ${formatDate(event.nextOccurrence)} at ${event.time}`
                        : `${getRecurrenceText(event.recurrence)}, ${event.time}`
                      : `${formatDate(event.nextOccurrence || event.date)} at ${event.time}`}
                  </p>
                  <div className="flex flex-wrap items-center gap-6 pt-3">
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">
                      <Ticket className="h-3.5 w-3.5" />
                      {event.category}
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">
                      <MapPin className="h-3.5 w-3.5" />
                      {event.location.city || event.location.address?.split(",")[0]}
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Manager Actions - Internal Tooling */}
              {user && (user._id === event.creator?._id || user.role === 'admin') && (
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center sm:text-left">
                      <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">Manager Action</p>
                      <p className="text-sm font-black uppercase tracking-tight italic">Promote this event on Instagram</p>
                    </div>
                  </div>
                  <Link to={`/boost?eventId=${event._id}`} className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black uppercase tracking-widest text-[9px] px-8 h-12 italic shadow-lg shadow-primary/10">
                      Boost This Event
                    </Button>
                  </Link>
                </div>
              )}

              {/* Ticket Card */}
              <div className="hidden md:flex bg-card rounded-2xl p-8 border border-border shadow-xl flex-row items-center justify-between gap-6 transition-colors">
                <div className="space-y-1 text-left">
                  <p className="text-2xl font-black tracking-tighter">Book Tickets</p>
                  <p className="text-muted-foreground text-xs font-medium">The price you'll pay. No surprises later.</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Button
                    onClick={() => setIsBookingModalOpen(true)}
                    disabled={allSoldOut || event.isActive === false || event.status === 'past'}
                    className="h-14 px-10 rounded-full font-black uppercase tracking-widest text-sm bg-[#C4F000] text-black hover:bg-[#A3C800] transition-all shadow-[0_8px_20px_rgba(196,240,0,0.3)] hover:shadow-[0_12px_24px_rgba(196,240,0,0.4)] border-none"
                  >
                    {event.isActive === false || event.status === 'past' ? (
                      "Event Ended"
                    ) : allSoldOut ? (
                      "Sold Out"
                    ) : (
                      <span className="flex items-center gap-2">
                      Starting  <span className="text-lg font-black tracking-normal">{formatPrice(minPrice)}</span>
                      </span>
                    )}
                  </Button>
                  <Button
                    onClick={() => setShowShareSnippet(true)}
                    variant="outline"
                    className="h-14 w-14 rounded-full border border-border bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-center shrink-0"
                    title="Share Event Details"
                  >
                    <Share2 className="h-5 w-5 text-foreground" />
                  </Button>
                </div>
              </div>

              {/* About Section */}
              <div className="space-y-4">
                <h3 className="text-2xl md:text-3xl font-black tracking-tighter">About</h3>
                <p className={`text-base md:text-lg text-foreground/80 font-normal leading-relaxed max-w-3xl ${showFullDescription ? "whitespace-pre-wrap" : "line-clamp-2"}`}>
                  {event.description}
                </p>
                <button
                  onClick={() => setShowFullDescription(!showFullDescription)}
                  className="text-xs font-black uppercase tracking-widest text-neon-lime hover:text-neon-lime/80 transition-colors"
                >
                  {showFullDescription ? "View Less" : "View More"}
                </button>
              </div>

              {/* Lineup Section */}
              {event.lineup && event.lineup.length > 0 && (() => {
                // Deduplicate by name in case API returns duplicates
                const lineup = (event.lineup as any[]).filter(
                  (p, i, arr) => arr.findIndex((x: any) => x.name === p.name) === i
                );
                const isMultiple = lineup.length > 1;
                const avatars = lineup.filter((p: any) => p.image).slice(0, 3);
                const overflowCount = lineup.length - 3;
                const previewNames = lineup.slice(0, 3).map((p: any) => p.name).join(', ')
                  + (lineup.length > 3 ? ` and ${lineup.length - 3} more` : '');

                return (
                  <div className="space-y-4">
                    <h3 className="text-2xl md:text-3xl font-black tracking-tighter">Lineup</h3>

                    {/* Collapsed summary bar — only for multiple lineup members */}
                    {isMultiple && (
                      <div className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-zinc-900 text-white">
                        {/* Overlapping avatars — only for people who have an image */}
                        {avatars.length > 0 && (
                          <div className="flex items-center shrink-0">
                            {avatars.map((person: any, i: number) => (
                              <img
                                key={i}
                                src={person.image}
                                alt={person.name}
                                className="w-10 h-10 rounded-full object-cover border-2 border-zinc-900"
                                style={{ marginLeft: i > 0 ? '-10px' : 0 }}
                              />
                            ))}
                            {overflowCount > 0 && (
                              <div
                                className="w-10 h-10 rounded-full bg-white/15 border-2 border-zinc-900 flex items-center justify-center shrink-0"
                                style={{ marginLeft: '-10px' }}
                              >
                                <span className="text-xs font-black text-white">{overflowCount}</span>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Names summary */}
                        <p className="flex-1 min-w-0 text-sm font-black leading-snug line-clamp-2">
                          {previewNames}
                        </p>

                        {/* Show More button — always for multiple */}
                        <button
                          onClick={() => setShowFullLineup(!showFullLineup)}
                          className="shrink-0 px-4 py-2 rounded-full bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest hover:bg-white/90 transition-colors"
                        >
                          {showFullLineup ? 'Show Less' : 'Show More'}
                        </button>
                      </div>
                    )}

                    {/* Grid — always for single person, only on expand for multiple */}
                    {(!isMultiple || showFullLineup) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {lineup.map((person: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-3 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                            {/* Avatar — only rendered if image exists */}
                            {person.image && (
                              <img
                                src={person.image}
                                alt={person.name}
                                className="w-12 h-12 rounded-full object-cover border-2 border-border/20 shrink-0"
                              />
                            )}
                            {/* Name + role */}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-black truncate">{person.name}</p>
                              {person.role && (
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{person.role}</p>
                              )}
                            </div>
                            {/* Instagram link */}
                            {person.instagramUrl && (
                              <a
                                href={person.instagramUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="shrink-0 h-9 w-9 rounded-full bg-gradient-to-br from-[#405DE6] via-[#E1306C] to-[#FCAF45] flex items-center justify-center transition-opacity hover:opacity-80"
                                title="Instagram"
                              >
                                <Instagram className="h-4 w-4 text-white" />
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Media Section: Mobile Only — shown early so user doesn't have to scroll far */}
              <div className="md:hidden space-y-10 pt-2 border-t border-border">
                {videoId && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-2xl font-black tracking-tighter">Main Video</h3>
                    </div>
                    <button
                      onClick={() => setVideoModal({ url: `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1` })}
                      className="relative w-full aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-border/30 group block"
                    >
                      <img
                        src={`https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <div className="h-14 w-14 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                          <Play className="h-6 w-6 text-black ml-1" />
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {displayReels.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-2xl font-black tracking-tighter">Event Reels</h3>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{displayReels.length} Clips</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {visibleReels.map((reel, idx) => {
                        const data = getReelData(reel);
                        const modalUrl = data?.type === 'youtube'
                          ? `https://www.youtube.com/embed/${data.id}?autoplay=1&rel=0&modestbranding=1`
                          : data?.type === 'instagram'
                            ? `https://www.instagram.com/reel/${data.id}/embed`
                            : null;
                        const thumb = data?.type === 'youtube'
                          ? `https://img.youtube.com/vi/${data.id}/hqdefault.jpg`
                          : null;
                        return (
                          <button
                            key={idx}
                            onClick={() => modalUrl && setVideoModal({ url: modalUrl, vertical: true })}
                            className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 shadow-lg border border-border/30 group w-full block"
                          >
                            {/* Branded fallback — visible when no thumb or thumb fails */}
                            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-2 ${data?.type === 'instagram' ? 'bg-gradient-to-br from-[#405DE6] via-[#E1306C] to-[#FCAF45]' : 'bg-zinc-800'}`}>
                              {data?.type === 'instagram' ? (
                                <>
                                  <Instagram className="h-10 w-10 text-white" />
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/70">Instagram Reel</span>
                                </>
                              ) : (
                                <>
                                  <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center">
                                    <Play className="h-6 w-6 text-white ml-0.5" />
                                  </div>
                                  <span className="text-[9px] font-black uppercase tracking-widest text-white/50">YouTube Short</span>
                                </>
                              )}
                            </div>
                            {/* Thumbnail sits on top, hidden on error */}
                            {thumb && (
                              <img
                                src={thumb}
                                alt={`Reel ${idx + 1}`}
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }}
                              />
                            )}
                            {/* Play overlay */}
                            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                                <Play className="h-5 w-5 text-black ml-0.5" />
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    {displayReels.length > 2 && (
                      <Button
                        variant="outline"
                        onClick={() => setShowAllReels(!showAllReels)}
                        className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] border-border hover:bg-muted"
                      >
                        {showAllReels ? "Show Less" : "Show More Reels"}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div>

                <div className="space-y-4 pt-6 border-t border-border/40">
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center text-[10px] font-black italic">i</div>
                    </div>
                    <span className="text-sm font-bold">This is a {event.ageRestriction || "All Ages"} event</span>
                  </div>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <div className="h-6 w-6 flex items-center justify-center">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-sm font-bold">Presented by {event.creator?.name || "Social Club"}</span>
                  </div>
                </div>
              </div>


              {/* Coordinator Section — only shown when manager has enabled offline tickets */}
              {event.offlineTicketsAvailable && event.coordinator?.phone && (
                <div className="pt-8 border-t border-border">
                  <a
                    href={`tel:${event.coordinator.phone}`}
                    className="group flex flex-col gap-4 p-5 rounded-2xl bg-muted/30 hover:bg-muted/50 transition-all border border-border hover:border-[#C4F000]/30"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-[#C4F000] bg-[#C4F000]/10 px-3 py-1.5 rounded-full whitespace-nowrap">
                        Offline Tickets Available
                      </span>
                      <span className="text-xs font-bold text-muted-foreground shrink-0">Tap to call</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-[#C4F000]/10 flex items-center justify-center shrink-0 group-hover:bg-[#C4F000]/20 transition-colors">
                        <Phone className="h-5 w-5 text-[#C4F000]" />
                      </div>
                      <p className="text-xl font-black tracking-tight">{event.coordinator.phone}</p>
                    </div>
                  </a>
                </div>
              )}

              {/* Terms & Conditions Section */}
              <div className="pt-10 border-t border-border">
                <TermsAndConditions />
              </div>



            </div>
          </div>

          {/* You May Also Like — full-width below two-column layout */}
          {filteredSimilarEvents.length > 0 && (
            <div className="pt-10 mt-6 border-t border-border">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl md:text-3xl font-black tracking-tighter">You May Also Like</h3>
                  <span className="text-sm font-bold text-neon-lime">{filteredSimilarEvents.length} Events</span>
                </div>

                {/* Mobile: horizontal scroll carousel | Desktop: 4-col grid */}
                <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 -mx-4 px-4 pb-4 md:grid md:grid-cols-4 md:overflow-visible md:mx-0 md:px-0 md:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  {filteredSimilarEvents.map((similarEvent: any, idx: number) => (
                    <motion.div
                      key={similarEvent._id}
                      className="snap-start shrink-0 w-[72%] sm:w-[45%] md:w-auto"
                      initial={{ opacity: 0, y: 16 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1, duration: 0.4 }}
                    >
                      <Link to={`/events/${similarEvent._id}`} className="block group">
                        <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-muted border border-border/50 hover:border-neon-lime/50 transition-all duration-300">
                          <img
                            src={similarEvent.image || getCategoryImage(similarEvent.category)}
                            alt={similarEvent.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                            <p className="text-sm font-black text-white line-clamp-2">{similarEvent.title}</p>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* City Pulse App — below You May Also Like */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mt-10 relative overflow-hidden rounded-[2.5rem] bg-neon-lime px-8 py-6 md:px-12 md:py-8 space-y-6 shadow-2xl"
          >
            {/* Background icon */}
            <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none">
              <Smartphone className="h-64 w-64 text-black" />
            </div>

            <div className="relative z-10 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-black/10 border border-black/20 rounded-full text-black text-[9px] font-black uppercase tracking-[0.25em]">
                <Zap className="h-3 w-3 text-black animate-pulse" />
                Coming Soon
              </div>
              <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight text-black">
                City Pulse <span className="italic">App</span>
              </h3>
              <p className="text-sm text-black/70 font-medium">Join fans discovering the best nights out.</p>
            </div>
            <div className="relative z-10 grid sm:grid-cols-2 gap-8">
              <p className="text-sm text-black/80 leading-relaxed">
                Discover the best nights out in your city, with tailored recommendations synced to your music library.
              </p>
              <p className="text-sm text-black/80 leading-relaxed">
                Keep track of what's coming up by saving events, sharing them with friends, or even listening to new music in the app.
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {showShareSnippet && <ShareSnippet event={event} onClose={() => setShowShareSnippet(false)} />}
      {event && <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} event={event} />}

      {/* Video Modal */}
      {videoModal && (
        <div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setVideoModal(null)}
        >
          <button
            onClick={() => setVideoModal(null)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors z-10"
          >
            <span className="text-white text-xl font-black leading-none">×</span>
          </button>
          <div
            className={videoModal.vertical ? "h-[90dvh] px-4" : "w-full max-w-4xl px-4"}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={`relative w-full h-full ${videoModal.vertical ? "aspect-[9/16] max-h-[90dvh] mx-auto" : "aspect-video"}`}>
              <iframe
                src={videoModal.url}
                allow="autoplay; encrypted-media; fullscreen"
                title="Event Video"
                className="absolute inset-0 w-full h-full"
                style={{ border: 0 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Booking Bar (Mobile Only) */}
      <div className="md:hidden fixed bottom-[5px] left-3 right-3 z-50 bg-background/95 backdrop-blur-md border border-border shadow-[0_-8px_30px_rgba(0,0,0,0.12)] px-4 py-4 flex items-center justify-between gap-4 rounded-2xl">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price starts at</p>
          <p className="text-lg font-black text-[#C4F000]">{formatPrice(minPrice)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={() => setShowShareSnippet(true)}
            variant="outline"
            className="h-12 w-12 rounded-full border border-border bg-muted/20 hover:bg-muted/40 transition-all flex items-center justify-center shrink-0"
            title="Share Event Details"
          >
            <Share2 className="h-4.5 w-4.5 text-foreground" />
          </Button>
          <Button
            onClick={() => setIsBookingModalOpen(true)}
            disabled={allSoldOut || event.isActive === false || event.status === 'past'}
            className="h-12 px-6 rounded-full font-black uppercase tracking-widest text-[11px] bg-[#C4F000] text-black hover:bg-[#A3C800] transition-all shadow-[0_6px_15px_rgba(196,240,0,0.25)] border-none"
          >
            {event.isActive === false || event.status === 'past' ? "Ended" : allSoldOut ? "Sold Out" : "Buy Ticket"}
          </Button>
        </div>
      </div>

      {/* Back to Top Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: showBackToTop ? 1 : 0, scale: showBackToTop ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
        onClick={scrollToTop}
        className="fixed bottom-24 md:bottom-6 right-6 z-40 h-12 w-12 rounded-full bg-foreground text-background shadow-lg hover:shadow-xl hover:bg-foreground/90 transition-all flex items-center justify-center"
        aria-label="Back to top"
      >
        <ChevronUp className="h-5 w-5" />
      </motion.button>

      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
};

export default EventDetailPage;
