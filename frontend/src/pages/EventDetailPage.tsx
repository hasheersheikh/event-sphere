import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  Share2,
  Heart,
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
  Building2,
  ChevronDown,
  Check,
  ArrowRight,
  Shield,
  ExternalLink,
  Play,
  Zap,
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
import SafeImage from "@/components/ui/SafeImage";
import BookingModal from "@/components/events/BookingModal";
import TermsAndConditions from "@/components/events/TermsAndConditions";

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareSnippet, setShowShareSnippet] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showAllReels, setShowAllReels] = useState(false);

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
    enabled: !!id,
  });

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
    new Date(dateString).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

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
      music: "/images/categories/music.jpg", technology: "/images/categories/technology.jpg",
      business: "/images/categories/business.jpg", entertainment: "/images/categories/entertainment.jpg",
      comedy: "/images/categories/entertainment.jpg",
      health: "/images/categories/health.jpg", sports: "/images/categories/sports.jpg",
      education: "/images/categories/education.jpg", workshop: "/images/categories/technology.jpg",
      other: "/images/categories/other.jpg", art: "/images/categories/entertainment.jpg",
      meetup: "/images/categories/business.jpg", tech: "/images/categories/technology.jpg",
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

      <main className="flex-1 pt-12 pb-24 relative z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">

          <div className="flex flex-col md:flex-row gap-12 lg:gap-16 items-start">

            {/* Left Column: Image & Protection Info */}
            <div className="w-full md:w-[40%] space-y-6">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-muted shadow-xl group border border-border/50">
                <SafeImage
                  src={event.image || getCategoryImage(event.category)}
                  alt={event.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Heart & Share Buttons Overlay */}
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <button className="h-11 w-11 rounded-full bg-background/60 backdrop-blur-md border border-border/20 flex items-center justify-center hover:bg-background/80 transition-all shadow-lg">
                    <Heart className="h-5 w-5 text-foreground" />
                  </button>
                  <button
                    onClick={() => setShowShareSnippet(true)}
                    className="h-11 w-11 rounded-full bg-background/60 backdrop-blur-md border border-border/20 flex items-center justify-center hover:bg-background/80 transition-all shadow-lg"
                  >
                    <Share2 className="h-5 w-5 text-foreground" />
                  </button>
                </div>
              </div>



              {/* Media Section: Desktop Only (In Left Column) */}
              <div className="hidden md:block space-y-10">
                {/* Main Video Highlight */}
                {videoId && (
                  <div className="pt-4 space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-xl font-black uppercase tracking-tight">Main Video</h3>
                    </div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-border/30">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&rel=0&modestbranding=1`}
                        allow="autoplay; encrypted-media"
                        title="Event Highlight Video"
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 0 }}
                      />
                    </div>
                  </div>
                )}

                {/* Reels Section */}
                {displayReels.length > 0 && (
                  <div className="pt-10 space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-xl font-black uppercase tracking-tight">Event Reels</h3>
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
                  {event.isActive && timeLeft ? (
                    <div className="flex items-center gap-2 bg-primary/5 px-3 py-1 rounded-full text-primary animate-pulse">
                      <Clock className="h-3.5 w-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">
                        {timeLeft.hasStarted
                          ? `Ends in ${timeLeft.hours}h ${timeLeft.minutes}m`
                          : `Starts in ${timeLeft.days}d ${timeLeft.hours}h ${timeLeft.minutes}m`}
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

                <h1 className="font-display font-black text-5xl lg:text-7xl leading-[0.95] tracking-tight uppercase break-words">
                  {event.title}
                </h1>
                <div className="space-y-2.5">
                  <p className="text-2xl font-bold text-muted-foreground tracking-tight">{event.location.venueName || "Venue"}</p>
                  <p className="text-2xl font-black text-[#C4F000] tracking-tight">
                    {event.scheduleType === "recurring"
                      ? event.nextOccurrence
                        ? `${getRecurrenceText(event.recurrence)} • Next: ${formatDate(event.nextOccurrence)} at ${event.time} IST`
                        : `${getRecurrenceText(event.recurrence)}, ${event.time} IST`
                      : `${formatDate(event.nextOccurrence || event.date)} at ${event.time} IST`}
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
                    <div className="flex items-center gap-2 text-muted-foreground text-xs font-black uppercase tracking-[0.2em]">
                      <Eye className="h-3.5 w-3.5" />
                      {event.viewCount || 0} Views
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
              <div className="bg-card rounded-2xl p-8 border border-border shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 transition-colors">
                <div className="space-y-1 text-center sm:text-left">
                  <p className="text-2xl font-black uppercase tracking-tight">Book Tickets</p>
                  <p className="text-muted-foreground text-xs font-medium">The price you'll pay. No surprises later.</p>
                </div>
                <Button
                  onClick={() => setIsBookingModalOpen(true)}
                  disabled={allSoldOut || event.isActive === false || event.status === 'past'}
                  className="h-14 px-10 rounded-full font-black uppercase tracking-widest text-sm bg-[#C4F000] text-black hover:bg-[#A3C800] transition-all shadow-[0_8px_20px_rgba(196,240,0,0.3)] hover:shadow-[0_12px_24px_rgba(196,240,0,0.4)] border-none"
                >
                  {event.isActive === false || event.status === 'past' ? "Event Ended" : allSoldOut ? "Sold Out" : `Get Tickets · ${formatPrice(minPrice)}`}
                </Button>
              </div>

              {/* About Section */}
              <div className="space-y-6">
                <h3 className="text-2xl font-black uppercase tracking-tight">About</h3>
                <div className="space-y-5">
                  <p className="text-lg text-foreground/80 leading-relaxed whitespace-pre-wrap selection:bg-primary/30">
                    {event.description}
                  </p>
                  {event.description.length > 300 && (
                    <button className="text-sm font-black uppercase tracking-widest text-foreground border-b-2 border-border pb-1 hover:border-foreground transition-all">
                      Read more
                    </button>
                  )}
                </div>

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

              {/* Venue Section */}
              <div className="space-y-8 pt-10 border-t border-border">
                <h3 className="text-2xl font-black uppercase tracking-tight">Venue</h3>
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <p className="text-xl font-bold">{event.location.venueName || "Venue"}</p>
                    <p className="text-muted-foreground font-medium">{event.location.address}</p>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.venueName + " " + event.location.address)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2.5 text-sm font-black uppercase tracking-widest text-foreground hover:text-primary transition-all group"
                  >
                    Open in maps <ExternalLink className="h-4 w-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </a>
                  <div className="pt-6 border-t border-border/40">
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Doors open</p>
                    <p className="text-lg font-black text-foreground mt-1.5">{event.time} IST</p>
                  </div>
                </div>
              </div>

              {/* Coordinator Section */}
              {event.coordinator && (event.coordinator.name || event.coordinator.phone) && (
                <div className="space-y-8 pt-10 border-t border-border">
                  <h3 className="text-2xl font-black uppercase tracking-tight">Contact Coordinator</h3>
                  <div className="space-y-5">
                    {event.coordinator.name && (
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Coordinator Name</p>
                          <p className="text-xl font-black">{event.coordinator.name}</p>
                        </div>
                      </div>
                    )}
                    {event.coordinator.phone && (
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Phone className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em]">Contact Number</p>
                          <a
                            href={`tel:${event.coordinator.phone}`}
                            className="text-xl font-black text-foreground hover:text-primary transition-colors"
                          >
                            {event.coordinator.phone}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Terms & Conditions Section */}
              <div className="pt-10 border-t border-border">
                <TermsAndConditions />
              </div>

              {/* App Promotion */}
              <div className="bg-muted/30 rounded-3xl p-8 border border-border/50 space-y-8 relative overflow-hidden">
                <div className="absolute top-6 right-6 px-3 py-1 bg-[#C4F000]/10 border border-[#C4F000]/30 rounded-full text-[#C4F000] text-[9px] font-black uppercase tracking-widest">
                  Coming Soon
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black uppercase tracking-tight leading-tight">City Pulse App</h3>
                  <p className="text-sm text-muted-foreground font-medium">Join fans discovering the best nights out.</p>
                </div>
                <div className="grid sm:grid-cols-2 gap-8">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Discover the best nights out in your city, with tailored recommendations synced to your music library.
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Keep track of what’s coming up by saving events, sharing them with friends, or even listening to new music in the app.
                  </p>
                </div>

              </div>

              {/* Media Section: Mobile Only (At bottom of Right Column) */}
              <div className="md:hidden space-y-10 pt-10 border-t border-border">
                {/* Main Video Highlight */}
                {videoId && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-xl font-black uppercase tracking-tight">Main Video</h3>
                    </div>
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-border/30">
                      <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=0&mute=0&rel=0&modestbranding=1`}
                        allow="autoplay; encrypted-media"
                        title="Event Highlight Video"
                        className="absolute inset-0 w-full h-full"
                        style={{ border: 0 }}
                      />
                    </div>
                  </div>
                )}

                {/* Reels Section */}
                {displayReels.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b border-border pb-3">
                      <h3 className="text-xl font-black uppercase tracking-tight">Event Reels</h3>
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
          </div>
        </div>
      </main>

      {showShareSnippet && <ShareSnippet event={event} onClose={() => setShowShareSnippet(false)} />}
      {event && <BookingModal isOpen={isBookingModalOpen} onClose={() => setIsBookingModalOpen(false)} event={event} />}
      <Footer />
    </div>
  );
};

export default EventDetailPage;
