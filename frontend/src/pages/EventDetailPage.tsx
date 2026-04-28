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
  const [bookingStep, setBookingStep] = useState<"select" | "contact">("select");
  const [guestEmail, setGuestEmail] = useState(user?.email || "");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestContactName, setGuestContactName] = useState(user?.name || "");
  const [selectedTicket, setSelectedTicket] = useState<{
    type: string;
    price: number;
    quantity: number;
    fullPassPrice?: number;
    isFullPass?: boolean;
    dayWisePrices?: any[];
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
      setBookingStep("select");
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

  const minPrice = event.ticketTypes?.length
    ? Math.min(...event.ticketTypes.map((t: any) => t.price))
    : 0;
  const allSoldOut = event.ticketTypes?.every((t: any) => t.isSoldOut || t.sold >= t.capacity);

  const TicketPanel = () => (
    <div className="space-y-5">
      {/* Header: label + from-price */}
      <div className="flex items-end justify-between gap-2">
        <div className="flex items-center gap-2">
          <Ticket className="h-4 w-4 shrink-0" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Tickets</span>
        </div>
        {!allSoldOut && minPrice > 0 && (
          <span className="text-[11px] font-bold text-muted-foreground">
            from <span className="text-foreground font-black text-sm">{formatPrice(minPrice)}</span>
          </span>
        )}
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
          const isCurrentSoldOut = ticket.isSoldOut || ticket.sold >= ticket.capacity;

          return (
            <div
              key={ticket.name}
              className={`p-4 border rounded-xl transition-all duration-200 ${isCurrentSoldOut
                  ? "bg-muted/20 border-border/20 opacity-50"
                  : "bg-card border-border/30 hover:border-foreground/20 hover:shadow-sm"
                }`}
            >
              <div className="flex justify-between items-start gap-3 mb-3">
                <div>
                  <span className="font-extrabold text-sm tracking-tight block">{ticket.name}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden max-w-[100px]">
                      <div
                        className="h-full rounded-full transition-all duration-500 bg-foreground/60"
                        style={{ width: `${Math.min((ticket.sold / ticket.capacity) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                      {maxQty} left
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {appliedVoucher && basePrice > 0 && (
                    <span className="text-[9px] line-through text-muted-foreground block">{formatPrice(basePrice)}</span>
                  )}
                  <span className="font-black text-lg leading-none">{formatPrice(finalPrice)}</span>
                </div>
              </div>

              {!isCurrentSoldOut && (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-0.5 bg-muted/60 rounded-lg border border-border/30 p-0.5">
                    <button
                      onClick={() => setTicketQuantities(p => ({ ...p, [ticket.name]: Math.max(1, (p[ticket.name] || 1) - 1) }))}
                      disabled={qty <= 1}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-background disabled:opacity-30 transition-all duration-150"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="w-8 text-center font-black text-sm tabular-nums">{qty}</span>
                    <button
                      onClick={() => setTicketQuantities(p => ({ ...p, [ticket.name]: Math.min(maxQty, (p[ticket.name] || 1) + 1) }))}
                      disabled={qty >= maxQty}
                      className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-background disabled:opacity-30 transition-all duration-150"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">Total</p>
                    <p className="font-black text-sm text-primary">{formatPrice(finalPrice * qty)}</p>
                  </div>
                </div>
              )}

              <Button
                onClick={() => handleBooking(ticket, finalPrice)}
                disabled={isCurrentSoldOut || bookingMutation.isPending}
                className="w-full h-11 rounded-xl font-black uppercase tracking-widest text-[10px] mt-3 bg-foreground text-background hover:bg-foreground/90 transition-all duration-200 disabled:opacity-40 flex items-center justify-center gap-2"
              >
                {isCurrentSoldOut ? (
                  "Sold Out"
                ) : (
                  <>
                    Get {qty} Ticket{qty > 1 ? "s" : ""}
                    <span className="opacity-60">·</span>
                    {formatPrice(finalPrice * qty)}
                  </>
                )}
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
            className="h-9 rounded-lg bg-muted/20 border-border/30 font-bold uppercase tracking-widest text-[10px]"
            disabled={!!appliedVoucher}
          />
          {appliedVoucher ? (
            <Button variant="ghost" size="sm" onClick={() => { setAppliedVoucher(null); setVoucherCode(""); }} className="text-destructive h-9 shrink-0">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={handleApplyVoucher} disabled={!voucherCode || isLoadingVoucher} className="h-9 rounded-lg font-black uppercase text-[8px] tracking-widest shrink-0">
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

      {/* Trust signals */}
      <div className="flex items-center gap-4 pt-2 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3" /> Secure Payment
        </div>
        <div className="flex items-center gap-1">
          <Check className="h-3 w-3" /> Instant Confirmation
        </div>
      </div>

      {/* Availability bar */}
      {totalCapacity > 0 && (
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
            <span>Overall Availability</span>
            <span>{totalSold} / {totalCapacity} sold</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${soldPercentage}%` }} />
          </div>
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9">
          <Heart className="h-3.5 w-3.5" />
        </Button>
        <Button variant="outline" size="sm" className="flex-1 rounded-lg h-9" onClick={() => setShowShareSnippet(true)}>
          <Share2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="pt-3 border-t border-border/20">
        <p className="text-[9px] font-bold text-muted-foreground mb-2 uppercase tracking-widest">Add to calendar</p>
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
        <div className="pt-3 border-t border-border/20 flex flex-wrap gap-4">
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
        <div className="relative h-[50vh] sm:h-[58vh] md:h-[65vh] overflow-hidden bg-muted">
          {videoId ? (
            <>
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1`}
                allow="autoplay; encrypted-media"
                title="Event video"
                className="absolute pointer-events-none"
                style={{
                  top: "50%", left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "max(100%, calc(100vh * 16/9))",
                  height: "max(100%, calc(100vw * 9/16))",
                  border: 0,
                }}
              />
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-24 right-4 z-20 h-9 w-9 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-sm border border-white/15 text-white flex items-center justify-center transition-all"
              >
                {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              </button>
            </>
          ) : (
            <SafeImage
              src={event.image || getCategoryImage(event.category)}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover"
            />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/10 pointer-events-none" />

          <div className="absolute top-4 left-4 z-10">
            <Link to="/events">
              <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-black/60 transition-all duration-200">
                <ChevronLeft className="h-3.5 w-3.5" /> Events
              </button>
            </Link>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-white text-[9px] font-black uppercase tracking-widest">
              {event.category}
            </span>
          </div>

          <div className="absolute bottom-0 left-0 right-0 px-4 pb-8 pt-20 z-10 pointer-events-none">
            <div className="max-w-6xl mx-auto">
              <h1 className="font-display font-black text-white leading-[0.9] tracking-tighter text-[clamp(1.8rem,5vw,3.5rem)] max-w-3xl mb-4">
                {event.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-white/60 text-sm font-medium">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 shrink-0" />
                  {formatDate(event.date)}
                </div>
                {event.time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5 shrink-0" />
                    {event.time}{event.endTime ? ` – ${event.endTime}` : ""}
                  </div>
                )}
                {(event.location?.venueName || event.location?.address) && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    {event.location.venueName || event.location.address?.split(",")[0]}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Content ─── */}
        <div className="container pt-8 pb-4 max-w-6xl">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">

            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="lg:col-span-2 space-y-10"
            >
              {/* Countdown */}
              {timeLeft && (
                <div className="flex gap-3 flex-wrap">
                  {[
                    { label: "Days", value: timeLeft.days },
                    { label: "Hrs", value: timeLeft.hours },
                    { label: "Min", value: timeLeft.minutes },
                    { label: "Sec", value: timeLeft.seconds },
                  ].map((item) => (
                    <div key={item.label} className="flex flex-col items-center bg-foreground/[0.04] rounded-xl px-5 py-3.5 min-w-[70px] border border-border/20">
                      <span className="text-xl md:text-2xl font-black tabular-nums">
                        {String(item.value).padStart(2, "0")}
                      </span>
                      <span className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{item.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Description */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">About</p>
                <p className="text-foreground/75 leading-relaxed whitespace-pre-wrap text-sm md:text-base">
                  {event.description}
                </p>
              </div>

              {/* Location */}
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4">Location</p>
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center shrink-0 border border-border/30">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        {event.location.venueName && <p className="font-extrabold text-base mb-0.5">{event.location.venueName}</p>}
                        <p className="text-sm text-muted-foreground">{event.location.address}</p>
                      </div>
                    </div>
                    <a
                      href={event.location.googleMapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.address)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="shrink-0 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      Open <ArrowRight className="h-3 w-3" />
                    </a>
                  </div>
                  <div className="rounded-xl overflow-hidden border border-border/20 aspect-video bg-muted">
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
              </div>

              {/* Reels */}
              {event.reels && event.reels.length > 0 && (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-4 flex items-center gap-2">
                    <Sparkles className="h-3 w-3" /> Shorts
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {event.reels.map((url: string, idx: number) => {
                      const ytId = getYouTubeId(url);
                      if (!ytId) return null;
                      return (
                        <div key={idx} className="relative rounded-xl overflow-hidden border border-border/20 bg-muted aspect-[9/16]">
                          <iframe src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tags */}
              {event.tags && event.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag: string) => (
                    <span key={tag} className="px-3 py-1.5 rounded-full bg-muted border border-border/30 text-[11px] font-bold text-muted-foreground">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Organizer */}
              <div className="flex items-center gap-4 pb-2 border-b border-border/20">
                <div className="h-11 w-11 rounded-xl bg-muted border border-border/30 flex items-center justify-center shrink-0">
                  <User className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-0.5">Organized by</p>
                  <p className="font-extrabold tracking-tight">{event.creator?.name || "Verified Organizer"}</p>
                </div>
              </div>
            </motion.div>

            {/* Desktop Sidebar */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="hidden lg:block lg:col-span-1"
            >
              <div className="sticky top-20 bg-card border border-border/30 p-6 rounded-2xl shadow-sm">
                <TicketPanel />
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* ═══ MOBILE STICKY BOTTOM BAR ═══ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/98 backdrop-blur-xl">
        {showMobileTickets ? (
          <div className="max-h-[75vh] overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/20">
              <span className="font-extrabold text-sm uppercase tracking-tight">Select Tickets</span>
              <button onClick={() => setShowMobileTickets(false)} className="h-8 w-8 flex items-center justify-center rounded-lg bg-muted text-muted-foreground hover:text-foreground transition-colors">
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className="p-4">
              <TicketPanel />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="flex-1 min-w-0">
              <p className="text-[10px] text-muted-foreground font-medium truncate">{event.location?.venueName || event.location?.address?.split(",")[0]}</p>
              <p className="font-black text-base leading-tight">
                {allSoldOut ? "Sold Out" : minPrice === 0 ? "Free" : `From ${formatPrice(minPrice)}`}
              </p>
            </div>
            <Button
              onClick={() => setShowMobileTickets(true)}
              disabled={allSoldOut}
              className="h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-foreground/90 shrink-0 disabled:opacity-40"
            >
              {allSoldOut ? "Sold Out" : "Get Tickets →"}
            </Button>
          </div>
        )}
      </div>

      {showShareSnippet && <ShareSnippet event={event} onClose={() => setShowShareSnippet(false)} />}

      <Footer />

      {/* Booking modal — step-by-step */}
      <Dialog open={isBookingModalOpen} onOpenChange={(open) => { setIsBookingModalOpen(open); if (!open) setBookingStep("select"); }}>
        <DialogContent className="sm:max-w-md rounded-2xl bg-card border-border/30">

          {/* Step progress indicator */}
          {event.isMultiDay && selectedTicket && (
            <div className="flex items-center gap-2 mb-1">
              {[
                { step: 1, label: "Sessions", active: bookingStep === "select" },
                { step: 2, label: "Details", active: bookingStep === "contact" },
              ].map(({ step, label, active }, i) => (
                <div key={step} className="flex items-center gap-2">
                  {i > 0 && <div className="h-px w-6 bg-border/40" />}
                  <div className="flex items-center gap-1.5">
                    <div className={cn(
                      "h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-black transition-all",
                      active ? "bg-foreground text-background" : "bg-muted text-muted-foreground"
                    )}>
                      {step}
                    </div>
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-widest transition-colors",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {label}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {bookingStep === "select" && event.isMultiDay && selectedTicket ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-black tracking-tighter">Select Sessions</DialogTitle>
                <DialogDescription className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest">
                  Choose which days you'd like to attend.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-2 py-3">
                {selectedTicket.isFullPass && (
                  <div
                    onClick={() => { setIsFullPassSelected(!isFullPassSelected); setSelectedDays([]); }}
                    className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all duration-200 ${isFullPassSelected ? "bg-primary/10 border-primary" : "bg-muted/20 border-border/30 hover:border-border"
                      }`}
                  >
                    <span className="text-xs font-bold uppercase tracking-tight">Full Event Pass</span>
                    <span className="text-xs font-black text-primary">{formatPrice(selectedTicket.fullPassPrice || selectedTicket.price)}</span>
                  </div>
                )}
                {!isFullPassSelected && event.days?.map((day: any, idx: number) => {
                  const isSelected = selectedDays.includes(idx);
                  const dayPrice = selectedTicket.dayWisePrices?.find((dp: any) => dp.dayIndex === idx)?.price || selectedTicket.price;
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (isSelected) setSelectedDays(selectedDays.filter(d => d !== idx));
                        else setSelectedDays([...selectedDays, idx]);
                      }}
                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all duration-200 ${isSelected ? "bg-primary/10 border-primary" : "bg-muted/20 border-border/30 hover:border-border"
                        }`}
                    >
                      <div>
                        <span className="text-xs font-bold uppercase tracking-tight block">{day.title || `Day ${idx + 1}`}</span>
                        <span className="text-[9px] text-muted-foreground">{formatDate(day.date)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-primary">{formatPrice(dayPrice)}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="pt-2 border-t border-border/20 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
                <span className="text-xl font-black text-primary">
                  {formatPrice(
                    isFullPassSelected
                      ? (selectedTicket.fullPassPrice || selectedTicket.price)
                      : selectedDays.reduce((acc, idx) => acc + (selectedTicket.dayWisePrices?.find((p: any) => p.dayIndex === idx)?.price || selectedTicket.price), 0)
                  )}
                </span>
              </div>
              <DialogFooter>
                <Button
                  onClick={() => setBookingStep("contact")}
                  disabled={event.isMultiDay && !isFullPassSelected && selectedDays.length === 0}
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  Continue <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-black tracking-tighter">Your Contact Details</DialogTitle>
                <DialogDescription className="text-muted-foreground text-[11px] font-bold uppercase tracking-widest">
                  We'll send your tickets to these details.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="contactName" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Building2 className="h-3 w-3" /> Name / Company
                  </Label>
                  <Input id="contactName" type="text" placeholder="Your name or company" value={guestContactName} onChange={(e) => setGuestContactName(e.target.value)} className="rounded-xl bg-muted/20 border-border/30 h-11 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3 w-3" /> Email Address
                  </Label>
                  <Input id="email" type="email" placeholder="your@email.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className="rounded-xl bg-muted/20 border-border/30 h-11 font-medium" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3 w-3" /> WhatsApp Number
                  </Label>
                  <Input id="phone" type="tel" placeholder="+91 00000 00000" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className="rounded-xl bg-muted/20 border-border/30 h-11 font-medium" />
                  <p className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">* Ticket sent via Email & WhatsApp</p>
                </div>
              </div>

              <DialogFooter>
                <Button
                  onClick={() => startBookingProcess()}
                  disabled={!guestEmail || !guestPhone || bookingMutation.isPending}
                  className="w-full h-12 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
                >
                  {bookingMutation.isPending ? "Processing…" : "Confirm & Pay"}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EventDetailPage;
