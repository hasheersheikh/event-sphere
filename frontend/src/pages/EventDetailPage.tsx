import { useState } from "react";
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
  Volume2,
  VolumeX,
  Sparkles,
  Info,
  Mail,
  Phone,
  Plus,
  Minus,
  Eye,
  Building2,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { AddToCalendarButton } from "add-to-calendar-button-react";
import ShareSnippet from "@/components/events/ShareSnippet";
import { useEffect } from "react";
import SafeImage from "@/components/ui/SafeImage";

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareSnippet, setShowShareSnippet] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [showMobileTickets, setShowMobileTickets] = useState(false);
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestContactName, setGuestContactName] = useState(user?.name || "");
  const [selectedTicket, setSelectedTicket] = useState<{
    type: string;
    price: number;
    quantity: number;
    fullPassPrice?: number;
    isFullPass?: boolean;
    dayWisePrices?: any[]
  } | null>(null);
  const [ticketQuantities, setTicketQuantities] = useState<Record<string, number>>({});
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isFullPassSelected, setIsFullPassSelected] = useState(false);

  const handleApplyVoucher = async () => {
    setIsLoadingVoucher(true);
    try {
      const { data } = await api.post(`/events/${id}/vouchers/apply`, { code: voucherCode });
      setAppliedVoucher(data);
      toast.success("Voucher applied!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid voucher code");
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  const { data: event, isLoading, error } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: async (ticketData: { type: string; quantity: number; price: number; email: string; phoneNumber: string }) => {
      const { data } = await api.post("/bookings", {
        eventId: id,
        tickets: [{ type: ticketData.type, quantity: ticketData.quantity, price: ticketData.price }],
        email: ticketData.email,
        phoneNumber: ticketData.phoneNumber,
      });
      return data;
    },
    onSuccess: () => {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ["#ffffff", "#cccccc", "#888888"] });
      toast.success("Tickets booked! See you there.");
      setTimeout(() => navigate("/my-tickets"), 2000);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Booking failed.");
    },
  });

  const getTimeRemaining = (date: string, time: string) => {
    if (!date || !time) return null;
    try {
      const eventDate = new Date(date);
      const timeParts = time.split(":");
      if (timeParts.length >= 2) {
        eventDate.setHours(parseInt(timeParts[0], 10));
        eventDate.setMinutes(parseInt(timeParts[1], 10));
        eventDate.setSeconds(0);
      }
      const difference = eventDate.getTime() - new Date().getTime();
      if (difference <= 0) return null;
      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    } catch { return null; }
  };

  useEffect(() => {
    if (!event?.date || !event?.time) return;
    setTimeLeft(getTimeRemaining(event.date, event.time));
    const timer = setInterval(() => setTimeLeft(getTimeRemaining(event.date, event.time)), 1000);
    return () => clearInterval(timer);
  }, [event?.date, event?.time]);

  const handleBooking = async (ticket: any, unitPrice: number) => {
    const qty = ticketQuantities[ticket.name] || 1;
    const maxQty = ticket.capacity - ticket.sold;
    if (qty > maxQty) { toast.error(`Only ${maxQty} tickets available`); return; }
    const ticketData = { type: ticket.name, price: unitPrice, quantity: qty, fullPassPrice: ticket.fullPassPrice, isFullPass: ticket.isFullPass, dayWisePrices: ticket.dayWisePrices };
    setSelectedTicket(ticketData);
    setSelectedDays([]);
    setIsFullPassSelected(false);
    if (user?.email && user?.phoneNumber && !event?.isMultiDay) {
      startBookingProcess({ email: user.email, phone: user.phoneNumber, contactName: user.name, ticket: ticketData });
    } else {
      if (user) { setGuestEmail(user.email || ""); setGuestPhone(user.phoneNumber || ""); setGuestContactName(user.name || ""); }
      setIsBookingModalOpen(true);
    }
  };

  const startBookingProcess = async (overrides?: { email?: string; phone?: string; contactName?: string; ticket?: typeof selectedTicket }) => {
    const emailToUse = overrides?.email || guestEmail || user?.email;
    const phoneToUse = overrides?.phone || guestPhone || user?.phoneNumber;
    const contactNameToUse = overrides?.contactName || guestContactName || user?.name;
    const ticketToUse = overrides?.ticket || selectedTicket;
    if (!ticketToUse || !emailToUse || !phoneToUse) { toast.error("Please provide email and phone number."); return; }
    const { type: ticketType, price: basePrice, quantity, fullPassPrice } = ticketToUse;
    let unitPrice = basePrice;
    if (event.isMultiDay) {
      if (isFullPassSelected) { unitPrice = fullPassPrice || basePrice; }
      else if (selectedDays.length > 0) {
        unitPrice = 0;
        selectedDays.forEach(dayIdx => {
          unitPrice += ticketToUse.dayWisePrices?.find((dp: any) => dp.dayIndex === dayIdx)?.price || basePrice;
        });
      }
    }
    if (unitPrice <= 0 && event.isMultiDay) { toast.error("Please select at least one day or Full Pass."); return; }
    const finalPrice = unitPrice * quantity;
    if (finalPrice === 0 && !event.isMultiDay) {
      bookingMutation.mutate({ type: ticketType, quantity, price: 0, email: emailToUse, phoneNumber: phoneToUse });
      setIsBookingModalOpen(false);
      return;
    }
    try {
      const { data: booking } = await api.post("/bookings", {
        eventId: id,
        tickets: [{ type: ticketType, quantity, price: unitPrice, selectedDays, isFullPass: isFullPassSelected }],
        email: emailToUse, phoneNumber: phoneToUse, contactName: contactNameToUse || undefined,
        voucherCode: appliedVoucher?.code || undefined, status: "pending",
      });
      setIsBookingModalOpen(false);
      const { data } = await api.post("/payments/create-payment-link", {
        bookingId: booking._id, amount: booking.totalAmount, currency: "INR",
        customerName: contactNameToUse || user?.name || "Guest",
        customerEmail: emailToUse, customerPhone: phoneToUse, eventTitle: event.title,
      });
      window.location.href = data.payment_url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed.");
    }
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
    new Date(dateString).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(price);
  };

  const totalCapacity = event.ticketTypes?.reduce((acc: number, t: any) => acc + t.capacity, 0) || 0;
  const totalSold = event.ticketTypes?.reduce((acc: number, t: any) => acc + t.sold, 0) || 0;
  const soldPercentage = totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

  const getCategoryImage = (category: string = "other") => {
    const cats: Record<string, string> = {
      music: "/images/categories/music.jpg", technology: "/images/categories/technology.jpg",
      business: "/images/categories/business.jpg", entertainment: "/images/categories/entertainment.jpg",
      health: "/images/categories/health.jpg", sports: "/images/categories/sports.jpg",
      education: "/images/categories/education.jpg", other: "/images/categories/other.jpg",
      art: "/images/categories/entertainment.jpg", meetup: "/images/categories/business.jpg",
      tech: "/images/categories/technology.jpg",
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

  // Min price for mobile sticky bar
  const minPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map((t: any) => t.price))
    : 0;
  const allSoldOut = event.ticketTypes?.every((t: any) => t.isSoldOut || t.sold >= t.capacity);

  /* ── Ticket panel (shared between sidebar and mobile drawer) ── */
  const TicketPanel = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary mb-2">
        <Ticket className="h-4 w-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tickets</span>
      </div>

      <div className="space-y-3">
        {event.ticketTypes.map((ticket: any) => {
          const basePrice = ticket.price;
          const discount = appliedVoucher
            ? appliedVoucher.discountType === "percentage"
              ? basePrice * appliedVoucher.discountAmount / 100
              : appliedVoucher.discountAmount
            : 0;
          const finalPrice = Math.max(0, basePrice - discount);
          const maxQty = ticket.capacity - ticket.sold;
          const qty = ticketQuantities[ticket.name] || 1;

          return (
            <div
              key={ticket.name}
              className={`p-4 border rounded-xl flex flex-col gap-3 transition-all ${
                ticket.isSoldOut
                  ? "bg-muted/20 border-border/30 opacity-60"
                  : "bg-muted/30 border-border/40 hover:border-primary/30"
              }`}
            >
              <div className="flex justify-between items-start gap-3">
                <span className="font-black text-sm uppercase tracking-tight">{ticket.name}</span>
                <div className="text-right shrink-0">
                  {appliedVoucher && basePrice > 0 && (
                    <span className="text-[9px] line-through text-muted-foreground block">{formatPrice(basePrice)}</span>
                  )}
                  <span className="font-black text-base text-primary">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                {maxQty} spots left
              </div>

              {!ticket.isSoldOut && ticket.sold < ticket.capacity && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-1 bg-background/60 rounded-lg border border-border/40 p-0.5">
                    <button
                      onClick={() => setTicketQuantities(p => ({ ...p, [ticket.name]: Math.max(1, (p[ticket.name] || 1) - 1) }))}
                      disabled={qty <= 1}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-7 text-center font-black text-sm">{qty}</span>
                    <button
                      onClick={() => setTicketQuantities(p => ({ ...p, [ticket.name]: Math.min(maxQty, (p[ticket.name] || 1) + 1) }))}
                      disabled={qty >= maxQty}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-muted disabled:opacity-30 transition-all"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">Total</p>
                    <p className="font-black text-primary">{formatPrice(finalPrice * qty)}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleBooking(ticket, finalPrice)}
                disabled={ticket.isSoldOut || ticket.sold >= ticket.capacity || bookingMutation.isPending}
                className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
              >
                {ticket.isSoldOut || ticket.sold >= ticket.capacity ? "Sold Out" : `Book ${qty} Ticket${qty > 1 ? "s" : ""}`}
              </Button>
            </div>
          );
        })}
      </div>

      {/* Voucher */}
      <div className="space-y-2 pt-1">
        <div className="flex gap-2">
          <Input
            placeholder="Promo code"
            value={voucherCode}
            onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
            className="h-10 rounded-lg bg-muted/30 border-border/40 font-bold uppercase tracking-widest text-[11px]"
            disabled={!!appliedVoucher}
          />
          {appliedVoucher ? (
            <Button variant="ghost" size="sm" onClick={() => { setAppliedVoucher(null); setVoucherCode(""); }} className="text-destructive h-10 shrink-0">
              <Trash2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={handleApplyVoucher} disabled={!voucherCode || isLoadingVoucher} className="h-10 rounded-lg font-black uppercase text-[9px] tracking-widest shrink-0">
              {isLoadingVoucher ? "…" : "Apply"}
            </Button>
          )}
        </div>
        {appliedVoucher && (
          <p className="text-[9px] font-bold text-primary uppercase tracking-widest">
            Applied: {appliedVoucher.discountType === "percentage" ? `${appliedVoucher.discountAmount}% OFF` : `₹${appliedVoucher.discountAmount} OFF`}
          </p>
        )}
      </div>

      {/* Availability bar */}
      {totalCapacity > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>Availability</span>
            <span>{totalSold} / {totalCapacity}</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all duration-500 rounded-full" style={{ width: `${soldPercentage}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9">
          <Heart className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9" onClick={() => setShowShareSnippet(true)}>
          <Share2 className="h-4 w-4" />
        </Button>
      </div>

      <div className="pt-3 border-t border-border/30">
        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">Add to calendar</p>
        <AddToCalendarButton
          name={event.title}
          options={["Google", "Apple", "Outlook.com"]}
          location={event.location.address}
          startDate={new Date(event.date).toISOString().split("T")[0]}
          startTime={event.time}
          endTime={event.endTime || "23:59"}
          description={event.description}
          timeZone="Asia/Kolkata"
          buttonStyle="round"
          label="Add to Calendar"
          lightMode="system"
          size="small"
        />
      </div>

      {(event.soldTickets > 0 || event.viewCount > 0) && (
        <div className="pt-3 border-t border-border/30 flex flex-wrap gap-4">
          {event.soldTickets > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" /> {event.soldTickets.toLocaleString()} attending
            </div>
          )}
          {event.viewCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Eye className="h-3.5 w-3.5" /> {event.viewCount.toLocaleString()} views
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-14 md:pt-16 pb-24 md:pb-0">

        {/* ─── Hero ─── */}
        <div className="relative h-[45vh] sm:h-[52vh] md:h-[58vh] overflow-hidden bg-muted">
          {videoId ? (
            <>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                className="w-[300%] h-full ml-[-100%] object-cover pointer-events-none"
                allow="autoplay; encrypted-media"
                title="Event video"
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-4 right-4 z-20 h-10 w-10 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center transition-all"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
            </>
          ) : (
            <SafeImage
              src={event.image || getCategoryImage(event.category)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}

          {/* gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

          {/* back button */}
          <div className="absolute top-4 left-4 z-10">
            <Link to="/events">
              <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-black/40 backdrop-blur-sm border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/60 transition-all">
                <ChevronLeft className="h-3.5 w-3.5" /> Events
              </button>
            </Link>
          </div>

          {/* category badge */}
          <div className="absolute top-4 right-4 z-10">
            <Badge className="bg-white/90 text-black border-0 px-3 py-1 rounded-lg font-black uppercase tracking-widest text-[9px]">
              {event.category}
            </Badge>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="container -mt-8 relative z-10 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Title block */}
              <div className="bg-card border border-border/40 rounded-2xl p-6 md:p-8">
                <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight mb-4">
                  {event.title}
                </h1>

                {/* Countdown */}
                {timeLeft && (
                  <div className="flex gap-3 mb-6">
                    {[
                      { label: "Days", value: timeLeft.days },
                      { label: "Hrs", value: timeLeft.hours },
                      { label: "Min", value: timeLeft.minutes },
                      { label: "Sec", value: timeLeft.seconds },
                    ].map((item) => (
                      <div key={item.label} className="flex flex-col items-center bg-primary/10 border border-primary/20 rounded-xl px-3 py-2.5 min-w-[60px]">
                        <span className="text-xl md:text-2xl font-black text-primary tabular-nums">
                          {String(item.value).padStart(2, "0")}
                        </span>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">{item.label}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{formatDate(event.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-medium">{event.time}{event.endTime && ` – ${event.endTime}`}</span>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-card border border-border/40 rounded-2xl p-6 md:p-8 space-y-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Venue</p>
                      {event.location.venueName && <p className="font-black text-base">{event.location.venueName}</p>}
                      <p className="text-sm text-muted-foreground font-medium">{event.location.address}</p>
                    </div>
                  </div>
                  <a
                    href={event.location.googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.address)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="shrink-0 h-9 w-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    <MapPin className="h-4 w-4" />
                  </a>
                </div>

                <div className="rounded-xl overflow-hidden border border-border/30 aspect-video bg-muted">
                  <iframe
                    width="100%" height="100%"
                    style={{ border: 0 }}
                    src={
                      event.location.googleMapUrl?.includes("/embed")
                        ? event.location.googleMapUrl
                        : `https://maps.google.com/maps?q=${encodeURIComponent(event.location.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                    }
                    allowFullScreen
                  />
                </div>
              </div>

              {/* Description */}
              <div className="bg-card border border-border/40 rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-4 text-primary">
                  <Info className="h-4 w-4" />
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">About this event</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium text-sm md:text-base">
                  {event.description}
                </p>
              </div>

              {/* Reels */}
              {event.reels && event.reels.length > 0 && (
                <div className="bg-card border border-border/40 rounded-2xl p-6 md:p-8">
                  <h2 className="font-black uppercase tracking-tight text-sm flex items-center gap-2 mb-6">
                    <Sparkles className="h-4 w-4 text-primary" /> Shorts
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {event.reels.map((url: string, idx: number) => {
                      const ytId = getYouTubeId(url);
                      if (!ytId) return null;
                      return (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-border/30 bg-muted aspect-[9/16]">
                          <iframe src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="bg-card border border-border/40 rounded-2xl p-6">
                  <div className="flex flex-wrap gap-2">
                    {event.tags.map((tag: string) => (
                      <span key={tag} className="px-3 py-1.5 rounded-full bg-muted border border-border/40 text-[11px] font-bold text-muted-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizer */}
              <div className="bg-card border border-border/40 rounded-2xl p-6 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Organized by</p>
                  <p className="font-black text-base tracking-tight">{event.creator?.name || "Verified Organizer"}</p>
                </div>
              </div>
            </motion.div>

            {/* Desktop Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="hidden lg:block lg:col-span-1"
            >
              <div className="sticky top-20 bg-card border border-border/40 p-6 rounded-2xl shadow-xl">
                <TicketPanel />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ═══ MOBILE STICKY BOTTOM BAR ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/60 bg-background/98 backdrop-blur-xl">
        {showMobileTickets ? (
          /* Expanded ticket panel */
          <div className="max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
              <span className="font-black text-sm uppercase tracking-tight">Select Tickets</span>
              <button onClick={() => setShowMobileTickets(false)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <TicketPanel />
            </div>
          </div>
        ) : (
          /* Collapsed bar */
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium truncate">{event.title}</p>
              <p className="font-black text-sm text-primary">
                {allSoldOut ? "Sold Out" : minPrice === 0 ? "Free" : `From ${formatPrice(minPrice)}`}
              </p>
            </div>
            <Button
              onClick={() => setShowMobileTickets(true)}
              disabled={allSoldOut}
              className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 disabled:opacity-50"
            >
              {allSoldOut ? "Sold Out" : "Get Tickets"}
            </Button>
          </div>
        )}
      </div>

      {showShareSnippet && <ShareSnippet event={event} onClose={() => setShowShareSnippet(false)} />}

      <Footer />

      {/* Booking modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border/40">
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tighter">Your Contact Details</DialogTitle>
            <DialogDescription className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest">
              We'll send your tickets to these details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label htmlFor="contactName" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Building2 className="h-3 w-3" /> Name / Company
              </Label>
              <Input id="contactName" type="text" placeholder="Your name or company" value={guestContactName} onChange={(e) => setGuestContactName(e.target.value)} className="rounded-xl bg-muted/30 border-border h-11 font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <Input id="email" type="email" placeholder="your@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="rounded-xl bg-muted/30 border-border h-11 font-medium" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Phone className="h-3 w-3" /> WhatsApp Number
              </Label>
              <Input id="phone" type="tel" placeholder="+91 00000 00000" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="rounded-xl bg-muted/30 border-border h-11 font-medium" />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">* Ticket sent via Email & WhatsApp</p>
            </div>
          </div>

          {event.isMultiDay && selectedTicket && (
            <div className="px-0 pb-2 space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                <Calendar className="h-3 w-3" /> Select Sessions / Days
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {selectedTicket.isFullPass && (
                  <div
                    onClick={() => { setIsFullPassSelected(!isFullPassSelected); setSelectedDays([]); }}
                    className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${isFullPassSelected ? "bg-primary/10 border-primary" : "bg-muted/30 border-border/40"}`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">Full Event Pass</span>
                    <span className="text-xs font-black text-primary">₹{selectedTicket.fullPassPrice || selectedTicket.price}</span>
                  </div>
                )}
                {!isFullPassSelected && event.days?.map((day: any, idx: number) => {
                  const isSelected = selectedDays.includes(idx);
                  const dayPrice = selectedTicket.dayWisePrices?.find((dp: any) => dp.dayIndex === idx)?.price || selectedTicket.price;
                  return (
                    <div key={idx} onClick={() => { if (isSelected) setSelectedDays(selectedDays.filter(d => d !== idx)); else setSelectedDays([...selectedDays, idx]); }}
                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${isSelected ? "bg-primary/10 border-primary" : "bg-muted/30 border-border/40"}`}>
                      <div>
                        <span className="text-xs font-bold uppercase tracking-tight block">{day.title || `Day ${idx + 1}`}</span>
                        <span className="text-[9px] text-muted-foreground">{formatDate(day.date)}</span>
                      </div>
                      <span className="text-xs font-black text-primary">₹{dayPrice}</span>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-border/40 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
                <span className="text-xl font-black text-primary">
                  ₹{isFullPassSelected ? (selectedTicket.fullPassPrice || selectedTicket.price)
                    : selectedDays.reduce((acc, idx) => acc + (selectedTicket.dayWisePrices?.find((p: any) => p.dayIndex === idx)?.price || selectedTicket.price), 0)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={startBookingProcess}
              disabled={!guestEmail || !guestPhone || bookingMutation.isPending}
              className="w-full h-13 rounded-xl font-black uppercase tracking-widest bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
            >
              {bookingMutation.isPending ? "Processing…" : "Confirm & Pay"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailPage;
