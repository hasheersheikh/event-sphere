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
  User,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { AddToCalendarButton } from "add-to-calendar-button-react";
import ShareSnippet from "@/components/events/ShareSnippet";

const EventDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareSnippet, setShowShareSnippet] = useState(false);

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
        image: "/logo.png",
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

  const getCategoryImage = (category: string = "general") => {
    const cats: Record<string, string> = {
      music:
        "https://images.unsplash.com/photo-1459749411177-042180ce673c?auto=format&fit=crop&q=80&w=2070",
      art: "https://images.unsplash.com/photo-1540575861501-7ad05823c91b?auto=format&fit=crop&q=80&w=2070",
      tech: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=2070",
      sports:
        "https://images.unsplash.com/photo-1461896705182-a530af726796?auto=format&fit=crop&q=80&w=2070",
      meetup:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=2070",
      general:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070",
    };
    return cats[category.toLowerCase()] || cats.general;
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-[40vh] md:h-[50vh] lg:h-[60vh]">
          <img
            src={event.image || getCategoryImage(event.category)}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-black/30" />

          {/* Back Button */}
          <div className="absolute top-20 left-6">
            <Link to="/events">
              <Button
                variant="secondary"
                size="sm"
                className="gap-2 rounded-full backdrop-blur-md bg-white/90 hover:bg-white shadow-lg"
              >
                <ChevronLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="container -mt-24 relative z-10 pb-16">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="lg:col-span-2"
            >
              <div className="bg-card rounded-[1.5rem] shadow-card p-6 md:p-8">
                {/* Header */}
                <div className="mb-6">
                  <Badge
                    variant="secondary"
                    className="mb-4 rounded-full px-4 py-1 font-bold text-xs"
                  >
                    {event.category}
                  </Badge>
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                    {event.title}
                  </h1>

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
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-[1rem] mb-6">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Event Venue</p>
                    <p className="text-muted-foreground">
                      {event.location.address}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">
                    About This Event
                  </h2>
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {event.description}
                  </p>
                </div>

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
              <div className="sticky top-20 bg-card rounded-[1.5rem] shadow-card p-6">
                <h2 className="text-xl font-bold mb-6">Tickets</h2>

                <div className="space-y-4 mb-6">
                  {event.ticketTypes.map((ticket: any) => (
                    <div
                      key={ticket.name}
                      className="p-4 border rounded-[1rem] flex flex-col gap-3"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{ticket.name}</span>
                        <span className="font-bold text-primary">
                          {formatPrice(ticket.price)}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ticket.capacity - ticket.sold} remaining
                      </div>
                      <Button
                        onClick={() => handleBooking(ticket.name, ticket.price)}
                        disabled={
                          ticket.sold >= ticket.capacity ||
                          bookingMutation.isPending
                        }
                        className="w-full rounded-full font-bold shadow-button"
                      >
                        {ticket.sold >= ticket.capacity
                          ? "Sold Out"
                          : "Book Now"}
                      </Button>
                    </div>
                  ))}
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
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>
                      {event.soldTickets?.toLocaleString() || 0} people
                      attending
                    </span>
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
    </div>
  );
};

export default EventDetailPage;
