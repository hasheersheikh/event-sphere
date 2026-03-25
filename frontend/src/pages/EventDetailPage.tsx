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
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
    }) => {
      const { data } = await api.post("/bookings", {
        eventId: id,
        tickets: [ticketData],
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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBooking = async (ticketType: string, price: number) => {
    if (!user) {
      toast.error("Please login to book tickets.");
      navigate("/auth", { state: { from: window.location.pathname } });
      return;
    }

    if (price === 0) {
      bookingMutation.mutate({ type: ticketType, quantity: 1, price });
      return;
    }

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast.error("Razorpay SDK failed to load. Are you online?");
        return;
      }

      // 1. Create Pending Booking
      const { data: booking } = await api.post("/bookings", {
        eventId: id,
        tickets: [{ type: ticketType, quantity: 1, price }],
        status: "pending",
      });

      // 2. Create Razorpay Order
      const { data: order } = await api.post("/payments/create-order", {
        amount: price,
        currency: "INR",
        receipt: `receipt_${booking._id}`,
        bookingId: booking._id,
      });

      // 3. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
        amount: order.amount,
        currency: order.currency,
        name: "City Pulse",
        description: `Booking for ${event.title}`,
        image: "/placeholder.svg",
        order_id: order.id,
        handler: async (response: any) => {
          try {
            const { data: verifyData } = await api.post("/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId: booking._id,
            });

            if (verifyData.success) {
              confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ["#6366f1", "#ec4899", "#ffffff"],
              });
              toast.success("Payment successful! Tickets confirmed.");
              setTimeout(() => navigate("/my-tickets"), 2000);
            }
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: "#10B981",
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
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
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url?.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
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
                        <p className="text-xl font-bold">
                          {event.location.address}
                        </p>
                      </div>
                    </div>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        event.location.address,
                      )}`}
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
                      frameBorder="0"
                      style={{ border: 0 }}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        event.location.address,
                      )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      allowFullScreen
                    ></iframe>
                  </div>
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
                      Event Highlights
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {event.reels.map((url: string, idx: number) => {
                        const isInstagram = url.includes("instagram.com");
                        const ytId = !isInstagram ? getYouTubeId(url) : null;
                        
                        return (
                          <div 
                            key={idx} 
                            className={`relative rounded-3xl overflow-hidden border border-white/10 bg-zinc-900 shadow-2xl transition-all duration-500 hover:scale-[1.02] hover:border-primary/30 group ${isInstagram ? "aspect-[9/16]" : "aspect-video md:aspect-[9/16]"}`}
                          >
                            {isInstagram ? (
                              <iframe
                                src={`https://www.instagram.com/reels/${url.split("/reels/")[1]?.split("/")[0]}/embed`}
                                className="w-full h-full"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency
                              />
                            ) : ytId ? (
                              <iframe
                                src={`https://www.youtube.com/embed/${ytId}?modestbranding=1&rel=0`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            ) : null}
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
                      {event.tags.map((tag) => (
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
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em]">Access Nodes</h2>
                  </div>

                <div className="space-y-4 mb-6">
                  {event.ticketTypes.map((ticket: any, index: number) => {
                    const basePrice = ticket.price;
                    const discount = 
                      appliedVoucher 
                        ? (appliedVoucher.discountType === 'percentage' 
                           ? (basePrice * appliedVoucher.discountAmount / 100) 
                           : appliedVoucher.discountAmount)
                        : 0;
                    const finalPrice = Math.max(0, basePrice - discount);

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
                          </div>
                        </div>
                        <div className="text-[10px] font-bold text-muted-foreground italic uppercase tracking-widest flex items-center gap-2">
                          <span className="h-1 w-1 rounded-full bg-primary" />
                          {ticket.capacity - ticket.sold} Units Available
                        </div>
                        <Button
                          onClick={() => handleBooking(ticket.name, finalPrice)}
                          disabled={
                            ticket.isSoldOut ||
                            ticket.sold >= ticket.capacity ||
                            bookingMutation.isPending
                          }
                          className="w-full h-12 rounded-xl font-black uppercase tracking-widest transition-all duration-300 shadow-lg hover:shadow-primary/20 bg-primary text-primary-foreground hover:scale-[1.02]"
                        >
                          {ticket.isSoldOut || ticket.sold >= ticket.capacity
                            ? "Depleted"
                            : "Initialize Access"}
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
                    startDate={event.date.split("T")[0]}
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

                {/* Attendees */}
                {event.soldTickets > 0 && (
                  <div className="mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>
                        {event.soldTickets.toLocaleString()} people
                        attending
                      </span>
                    </div>
                  </div>
                )}
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
    </div>
  );
};

export default EventDetailPage;
