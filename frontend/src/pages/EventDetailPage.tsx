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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  const queryClient = useQueryClient();
  const [showShareSnippet, setShowShareSnippet] = useState(false);
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [voucherCode, setVoucherCode] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState<any>(null);
  const [isLoadingVoucher, setIsLoadingVoucher] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
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
      toast.success("Voucher applied successfully!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Invalid voucher code");
    } finally {
      setIsLoadingVoucher(false);
    }
  };

  const {
    data: event,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      return data;
    },
    enabled: !!id,
  });

  const bookingMutation = useMutation({
    mutationFn: async (ticketData: {
      type: string;
      quantity: number;
      price: number;
      email: string;
      phoneNumber: string;
    }) => {
      const { data } = await api.post("/bookings", {
        eventId: id,
        tickets: [{ type: ticketData.type, quantity: ticketData.quantity, price: ticketData.price }],
        email: ticketData.email,
        phoneNumber: ticketData.phoneNumber,
      });
      return data;
    },
    onSuccess: () => {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#ec4899", "#ffffff"],
      });
      toast.success("Tickets booked successfully! Get ready for the event.");
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
      
      const now = new Date();
      const difference = eventDate.getTime() - now.getTime();

      if (difference <= 0) return null;

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      return { days, hours, minutes, seconds };
    } catch (e) {
      console.error("Timer calculation error:", e);
      return null;
    }
  };

  useEffect(() => {
    if (!event?.date || !event?.time) return;

    // Initial update
    setTimeLeft(getTimeRemaining(event.date, event.time));

    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(event.date, event.time));
    }, 1000);
    return () => clearInterval(timer);
  }, [event?.date, event?.time]);

  const handleBooking = async (ticket: any, unitPrice: number) => {
    const qty = ticketQuantities[ticket.name] || 1;
    const maxQty = ticket.capacity - ticket.sold;

    if (qty > maxQty) {
      toast.error(`Only ${maxQty} tickets available`);
      return;
    }

    const ticketData = {
      type: ticket.name,
      price: unitPrice,
      quantity: qty,
      fullPassPrice: ticket.fullPassPrice,
      isFullPass: ticket.isFullPass,
      dayWisePrices: ticket.dayWisePrices
    };

    setSelectedTicket(ticketData);
    setSelectedDays([]);
    setIsFullPassSelected(false);

    // For logged-in users with saved contact info on non-multiday events, skip the modal
    if (user?.email && user?.phoneNumber && !event?.isMultiDay) {
      startBookingProcess({
        email: user.email,
        phone: user.phoneNumber,
        contactName: user.name,
        ticket: ticketData,
      });
    } else {
      if (user) {
        setGuestEmail(user.email || "");
        setGuestPhone(user.phoneNumber || "");
        setGuestContactName(user.name || "");
      }
      setIsBookingModalOpen(true);
    }
  };

  const startBookingProcess = async (overrides?: {
    email?: string;
    phone?: string;
    contactName?: string;
    ticket?: typeof selectedTicket;
  }) => {
    const emailToUse = overrides?.email || guestEmail || user?.email;
    const phoneToUse = overrides?.phone || guestPhone || user?.phoneNumber;
    const contactNameToUse = overrides?.contactName || guestContactName || user?.name;
    const ticketToUse = overrides?.ticket || selectedTicket;

    if (!ticketToUse || !emailToUse || !phoneToUse) {
      toast.error("Please provide email and phone number.");
      return;
    }

    const { type: ticketType, price: basePrice, quantity, fullPassPrice } = ticketToUse;

    let unitPrice = basePrice;
    if (event.isMultiDay) {
      if (isFullPassSelected) {
        unitPrice = fullPassPrice || basePrice;
      } else if (selectedDays.length > 0) {
        unitPrice = 0;
        selectedDays.forEach(dayIdx => {
          const dayPrice = ticketToUse.dayWisePrices?.find((dp: any) => dp.dayIndex === dayIdx)?.price || basePrice;
          unitPrice += dayPrice;
        });
      }
    }

    if (unitPrice <= 0 && event.isMultiDay) {
      toast.error("Please select at least one day or Full Pass.");
      return;
    }

    const finalPrice = unitPrice * quantity;

    if (finalPrice === 0 && !event.isMultiDay) {
      bookingMutation.mutate({
        type: ticketType,
        quantity,
        price: 0,
        email: emailToUse,
        phoneNumber: phoneToUse
      });
      setIsBookingModalOpen(false);
      return;
    }

    try {
      // 1. Create Pending Booking — backend applies voucher discount server-side
      const { data: booking } = await api.post("/bookings", {
        eventId: id,
        tickets: [{
          type: ticketType,
          quantity,
          price: unitPrice,
          selectedDays: selectedDays,
          isFullPass: isFullPassSelected
        }],
        email: emailToUse,
        phoneNumber: phoneToUse,
        contactName: contactNameToUse || undefined,
        voucherCode: appliedVoucher?.code || undefined,
        status: "pending",
      });

      setIsBookingModalOpen(false);

      // 2. Get hosted payment link — use backend-verified totalAmount
      const { data } = await api.post("/payments/create-payment-link", {
        bookingId: booking._id,
        amount: booking.totalAmount,
        currency: "INR",
        customerName: contactNameToUse || user?.name || "Guest",
        customerEmail: emailToUse,
        customerPhone: phoneToUse,
        eventTitle: event.title,
      });

      // 3. Redirect to Razorpay hosted payment page
      window.location.href = data.payment_url;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Booking failed.");
    }
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 text-center">
          <p className="text-muted-foreground animate-pulse">
            Loading event details...
          </p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event || error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 container py-16 text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The event you're looking for doesn't exist or has been removed.
          </p>
          <Link to="/events">
            <Button>Browse Events</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalCapacity =
    event.ticketTypes?.reduce((acc: number, t: any) => acc + t.capacity, 0) ||
    0;
  const totalSold =
    event.ticketTypes?.reduce((acc: number, t: any) => acc + t.sold, 0) || 0;
  const availableTickets = totalCapacity - totalSold;
  const soldPercentage =
    totalCapacity > 0 ? (totalSold / totalCapacity) * 100 : 0;

  const getCategoryImage = (category: string = "other") => {
    const cats: Record<string, string> = {
      music: "/images/categories/music.jpg",
      technology: "/images/categories/technology.jpg",
      business: "/images/categories/business.jpg",
      entertainment: "/images/categories/entertainment.jpg",
      health: "/images/categories/health.jpg",
      sports: "/images/categories/sports.jpg",
      education: "/images/categories/education.jpg",
      other: "/images/categories/other.jpg",
      // Map existing categories to closest local image
      art: "/images/categories/entertainment.jpg",
      meetup: "/images/categories/business.jpg",
      tech: "/images/categories/technology.jpg",
    };
    return cats[category.toLowerCase()] || cats.other;
  };


  const getYouTubeId = (url: string) => {
    if (!url) return null;
    // YouTube Shorts: youtube.com/shorts/VIDEO_ID
    const shortsMatch = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/);
    if (shortsMatch) return shortsMatch[1];
    // Standard watch/embed/short URLs
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([a-zA-Z0-9_-]{11}).*/;
    const match = url.match(regExp);
    return match ? match[2] : null;
  };

  const videoId = getYouTubeId(event.videoUrl);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <div className="fixed inset-0 bg-muted/20 z-0" />
      <Navbar />

      <main className="flex-1">
        {/* Hero Image / Video */}
        <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
          {videoId ? (
            <div className="absolute inset-0 w-full h-full">
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&iv_load_policy=3&modestbranding=1&enablejsapi=1`}
                className="w-[300%] h-[100%] ml-[-100%] object-cover pointer-events-none"
                allow="autoplay; encrypted-media"
                title="Background Video"
              />
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setIsMuted(!isMuted)}
                className="absolute bottom-32 right-8 z-20 rounded-full bg-background/20 hover:bg-background/40 backdrop-blur-xl border-white/10 text-white shadow-2xl transition-all duration-500 hover:scale-110 active:scale-90"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
            </div>
          ) : (
            <SafeImage
              src={event.image || getCategoryImage(event.category)}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          )}

        </div>

        {/* Content */}
        <div className="container -mt-24 relative z-10 pb-16">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/events">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 rounded-lg bg-background/90 hover:bg-background shadow-lg border border-border font-bold uppercase tracking-wider backdrop-blur-md"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to Events
              </Button>
            </Link>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-card border border-border/50 p-6 md:p-10 rounded-2xl shadow-sm">
                {/* Header */}
                <div className="mb-6">
                  <Badge
                    variant="secondary"
                    className="mb-6 rounded-lg px-4 py-1.5 font-bold text-[10px] uppercase tracking-widest border border-border"
                  >
                    {event.category}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    {event.title}
                  </h1>

                  {timeLeft && (
                    <div className="flex gap-4 mb-8">
                      {[
                        { label: "Days", value: timeLeft.days },
                        { label: "Hours", value: timeLeft.hours },
                        { label: "Mins", value: timeLeft.minutes },
                        { label: "Secs", value: timeLeft.seconds },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex flex-col items-center bg-primary/10 border border-primary/20 rounded-xl px-4 py-3 min-w-[70px]"
                        >
                          <span className="text-2xl font-black text-primary">
                            {String(item.value).padStart(2, "0")}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <span>{formatDate(event.date)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-primary" />
                      <span>
                        {event.time}
                        {event.endTime && ` - ${event.endTime}`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="p-8 bg-muted/30 rounded-[2rem] mb-8 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <MapPin className="h-6 w-6 text-primary shrink-0 mt-1" />
                      <div>
                        <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground mb-1">
                          Event Venue
                        </p>
                        {event.location.venueName && (
                          <p className="font-black text-base">{event.location.venueName}</p>
                        )}
                        <p className="text-base font-medium text-muted-foreground">
                          {event.location.address}
                        </p>
                      </div>
                    </div>
                    <a
                      href={
                        event.location.googleMapUrl ||
                        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.address)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-black transition-all shadow-sm"
                      title="Open in Google Maps"
                    >
                      <MapPin className="h-5 w-5" />
                    </a>
                  </div>

                  {/* Google Maps Embed */}
                  <div className="rounded-[1.5rem] overflow-hidden border border-border aspect-video bg-background/50">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      src={
                        event.location.googleMapUrl
                          ? event.location.googleMapUrl.includes("/embed")
                            ? event.location.googleMapUrl
                            : `https://maps.google.com/maps?q=${encodeURIComponent(event.location.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                          : `https://maps.google.com/maps?q=${encodeURIComponent(event.location.address)}&t=&z=13&ie=UTF8&iwloc=&output=embed`
                      }
                      allowFullScreen
                    />
                  </div>
                  {event.location.googleMapUrl && (
                    <a
                      href={event.location.googleMapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                    >
                      <MapPin className="h-3 w-3" /> View exact location on Google Maps
                    </a>
                  )}
                </div>

                {/* Description */}
                <div className="mb-12">
                  <div className="flex items-center gap-3 mb-6 text-primary">
                    <Info className="h-5 w-5" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Event Details</h2>
                  </div>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap font-medium italic text-lg">
                    {event.description}
                  </p>
                </div>

                {event.reels && event.reels.length > 0 && (
                  <div className="mb-12">
                    <h2 className="text-2xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
                      <Sparkles className="h-6 w-6 text-primary" />
                      Event Shorts
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {event.reels.map((url: string, idx: number) => {
                        const ytId = getYouTubeId(url);
                        if (!ytId) return null;
                        return (
                          <div
                            key={idx}
                            className="relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 group aspect-[9/16]"
                          >
                            <iframe
                              src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`}
                              className="w-full h-full"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag: string) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="rounded-full"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Organizer */}
                <div className="pt-6 border-t border-border">
                  <h2 className="text-xl font-semibold mb-4">Organized by</h2>
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {event.creator?.name || "Verified Organizer"}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Event Organizer
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Sidebar - Booking Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="sticky top-20 bg-card border border-border p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden backdrop-blur-3xl">
                {/* Background Accent */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/5 blur-[80px] rounded-full" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-8 text-primary">
                    <Ticket className="h-5 w-5" />
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Tickets</h2>
                  </div>

                <div className="space-y-4 mb-6">
                  {event.ticketTypes.map((ticket: any) => {
                    const basePrice = ticket.price;
                    const discount =
                      appliedVoucher
                        ? (appliedVoucher.discountType === 'percentage'
                           ? (basePrice * appliedVoucher.discountAmount / 100)
                           : appliedVoucher.discountAmount)
                        : 0;
                    const finalPrice = Math.max(0, basePrice - discount);
                    const maxQty = ticket.capacity - ticket.sold;
                    const qty = ticketQuantities[ticket.name] || 1;
                    const totalPrice = finalPrice * qty;

                    return (
                      <div
                        key={ticket.name}
                        className={`p-6 border rounded-2xl flex flex-col gap-4 transition-all duration-500 ${ticket.isSoldOut ? "bg-destructive/5 border-destructive/20" : "bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-primary/30"}`}
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-black uppercase tracking-tight italic text-sm">{ticket.name}</span>
                          <div className="flex flex-col items-end">
                            {appliedVoucher && basePrice > 0 && (
                              <span className="text-[8px] line-through text-muted-foreground font-black uppercase tracking-widest">
                                {formatPrice(basePrice)}
                              </span>
                            )}
                            <span className="font-black text-lg text-primary tracking-tighter">
                              {formatPrice(finalPrice)}
                            </span>
                            <span className="text-[8px] text-muted-foreground font-bold uppercase tracking-widest">
                              per ticket
                            </span>
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {maxQty} spots left
                        </div>

                        {!ticket.isSoldOut && ticket.sold < ticket.capacity && (
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2 bg-background/50 rounded-xl border border-border/50 p-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setTicketQuantities((prev: any) => ({
                                    ...prev,
                                    [ticket.name]: Math.max(1, (prev[ticket.name] || 1) - 1)
                                  }));
                                }}
                                disabled={qty <= 1}
                                className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="w-8 text-center font-black text-sm tracking-tight">
                                {qty}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  setTicketQuantities((prev: any) => ({
                                    ...prev,
                                    [ticket.name]: Math.min(maxQty, (prev[ticket.name] || 1) + 1)
                                  }));
                                }}
                                disabled={qty >= maxQty}
                                className="h-9 w-9 rounded-lg flex items-center justify-center hover:bg-primary/10 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <div className="text-right">
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">Total</p>
                              <p className="text-lg font-black text-primary tracking-tighter">
                                {formatPrice(totalPrice)}
                              </p>
                            </div>
                          </div>
                        )}

                        <Button
                          onClick={() => handleBooking(ticket, finalPrice)}
                          disabled={
                            ticket.isSoldOut ||
                            ticket.sold >= ticket.capacity ||
                            bookingMutation.isPending
                          }
                          className="w-full h-12 rounded-xl font-black uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02]"
                        >
                          {ticket.isSoldOut || ticket.sold >= ticket.capacity
                            ? "Sold Out"
                            : `Book ${qty} Ticket${qty > 1 ? 's' : ''}`}
                        </Button>
                      </div>
                    );
                  })}
                </div>

                {/* Voucher Code Input */}
                <div className="mb-6 space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      placeholder="PROMO CODE"
                      value={voucherCode}
                      onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                      className="h-10 rounded-xl bg-muted/30 border-border font-bold uppercase tracking-widest text-[10px]"
                      disabled={!!appliedVoucher}
                    />
                    {appliedVoucher ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setAppliedVoucher(null);
                          setVoucherCode("");
                        }}
                        className="text-destructive h-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={handleApplyVoucher}
                        disabled={!voucherCode || isLoadingVoucher}
                        className="h-10 rounded-xl font-black uppercase text-[9px] tracking-widest"
                      >
                        {isLoadingVoucher ? "..." : "Apply"}
                      </Button>
                    )}
                  </div>
                  {appliedVoucher && (
                    <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest ml-1">
                      Voucher Applied: {appliedVoucher.discountType === 'percentage' ? `${appliedVoucher.discountAmount}% OFF` : `₹${appliedVoucher.discountAmount} OFF`}
                    </p>
                  )}
                </div>

                {/* Availability Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">
                      Overall availability
                    </span>
                    <span className="font-semibold">
                      {totalSold.toLocaleString()} /{" "}
                      {totalCapacity.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-hero transition-all duration-500"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 rounded-full"
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1 rounded-full"
                    onClick={() => setShowShareSnippet(true)}
                  >
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm font-medium mb-4">
                    Don't forget the date!
                  </p>
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

                {/* Attendees & Views */}
                <div className="mt-6 pt-6 border-t border-border flex flex-wrap gap-4">
                  {event.soldTickets > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{event.soldTickets.toLocaleString()} attending</span>
                    </div>
                  )}
                  {event.viewCount > 0 && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Eye className="h-4 w-4" />
                      <span>{event.viewCount.toLocaleString()} views</span>
                    </div>
                  )}
                </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {showShareSnippet && (
        <ShareSnippet
          event={event}
          onClose={() => setShowShareSnippet(false)}
        />
      )}

      <Footer />

      {/* Booking Contact Info Modal */}
      <Dialog open={isBookingModalOpen} onOpenChange={setIsBookingModalOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl bg-card border-border/50 backdrop-blur-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">
              Your Contact Details
            </DialogTitle>
            <DialogDescription className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]">
              We'll send your tickets to these details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="contactName" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Building2 className="h-3 w-3" /> Name / Company
              </Label>
              <Input
                id="contactName"
                type="text"
                placeholder="Your name or company"
                value={guestContactName}
                onChange={(e) => setGuestContactName(e.target.value)}
                className="rounded-xl bg-muted/30 border-border h-12 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Mail className="h-3 w-3" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="rounded-xl bg-muted/30 border-border h-12 font-medium"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Phone className="h-3 w-3" /> WhatsApp Number
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+91 00000 00000"
                value={guestPhone}
                onChange={(e) => setGuestPhone(e.target.value)}
                className="rounded-xl bg-muted/30 border-border h-12 font-medium"
              />
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest pl-1 italic">
                * PDF ticket will be sent via Email & WhatsApp
              </p>
            </div>
          </div>
          
          {event.isMultiDay && selectedTicket && (
            <div className="px-6 pb-4 space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-2">
                <Calendar className="h-3 w-3" /> Select Sessions / Days
              </Label>
              <div className="grid grid-cols-1 gap-2">
                {selectedTicket.isFullPass && (
                    <div 
                      onClick={() => {
                        setIsFullPassSelected(!isFullPassSelected);
                        setSelectedDays([]);
                      }}
                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${isFullPassSelected ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-border/50'}`}
                    >
                      <span className="text-xs font-bold uppercase tracking-tight">Full Event Pass</span>
                      <span className="text-xs font-black text-primary italic">₹{selectedTicket.fullPassPrice || selectedTicket.price}</span>
                    </div>
                )}
                {!isFullPassSelected && event.days?.map((day: any, idx: number) => {
                  const isSelected = selectedDays.includes(idx);
                  const dayPrice = selectedTicket.dayWisePrices?.find((dp: any) => dp.dayIndex === idx)?.price || selectedTicket.price;
                  
                  return (
                    <div 
                      key={idx}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedDays(selectedDays.filter(d => d !== idx));
                        } else {
                          setSelectedDays([...selectedDays, idx]);
                        }
                      }}
                      className={`p-3 rounded-xl border flex justify-between items-center cursor-pointer transition-all ${isSelected ? 'bg-primary/10 border-primary' : 'bg-muted/30 border-border/50'}`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold uppercase tracking-tight">{day.title || `Day ${idx + 1}`}</span>
                        <span className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">{formatDate(day.date)}</span>
                      </div>
                      <span className="text-xs font-black text-primary italic">₹{dayPrice}</span>
                    </div>
                  );
                })}
              </div>
              
              <div className="pt-2 border-t border-border/50 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Total</span>
                <span className="text-xl font-black text-primary tracking-tighter italic">
                  ₹{(() => {
                    if (isFullPassSelected) return selectedTicket.fullPassPrice || selectedTicket.price;
                    return selectedDays.reduce((acc, idx) => {
                      const dp = selectedTicket.dayWisePrices?.find((p: any) => p.dayIndex === idx);
                      return acc + (dp ? dp.price : selectedTicket.price);
                    }, 0);
                  })()}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              onClick={startBookingProcess}
              disabled={!guestEmail || !guestPhone || bookingMutation.isPending}
              className="w-full h-14 rounded-2xl font-black uppercase tracking-widest shadow-lg hover:shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02] transition-all"
            >
              {bookingMutation.isPending ? "Syncing..." : "Initiate Checkout"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default EventDetailPage;
