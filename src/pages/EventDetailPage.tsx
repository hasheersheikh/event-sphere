import { useParams, Link } from "react-router-dom";
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
  User
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { eventsWithImages } from "@/data/eventsData";

const EventDetailPage = () => {
  const { id } = useParams();
  const event = eventsWithImages.find((e) => e.id === id);

  if (!event) {
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

  const formatPrice = (price: number, currency: string) => {
    if (price === 0) return "Free";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
    }).format(price);
  };

  const availableTickets = event.totalTickets - event.soldTickets;
  const soldPercentage = (event.soldTickets / event.totalTickets) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Image */}
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px]">
          {event.image ? (
            <img
              src={event.image}
              alt={event.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full gradient-hero" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          
          {/* Back Button */}
          <div className="absolute top-4 left-4">
            <Link to="/events">
              <Button variant="secondary" size="sm" className="gap-2 backdrop-blur-sm">
                <ChevronLeft className="h-4 w-4" />
                Back to Events
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
              <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
                {/* Header */}
                <div className="mb-6">
                  <Badge variant="category" className="mb-4">
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
                      <span>{event.time}{event.endTime && ` - ${event.endTime}`}</span>
                    </div>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-xl mb-6">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">{event.venue}</p>
                    <p className="text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>

                {/* Tags */}
                {event.tags && event.tags.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {event.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">
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
                      <p className="font-semibold">{event.organizer.name}</p>
                      <p className="text-sm text-muted-foreground">Event Organizer</p>
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
              <div className="sticky top-20 bg-card rounded-2xl shadow-card p-6">
                {/* Price */}
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold gradient-text">
                    {formatPrice(event.price, event.currency)}
                  </p>
                  <p className="text-sm text-muted-foreground">per ticket</p>
                </div>

                {/* Availability */}
                <div className="mb-6">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Tickets sold</span>
                    <span className="font-semibold">
                      {event.soldTickets.toLocaleString()} / {event.totalTickets.toLocaleString()}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full gradient-hero transition-all duration-500"
                      style={{ width: `${soldPercentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {availableTickets.toLocaleString()} tickets remaining
                  </p>
                </div>

                {/* CTA Buttons */}
                <div className="space-y-3">
                  <Button size="lg" className="w-full gap-2">
                    <Ticket className="h-5 w-5" />
                    Get Tickets
                  </Button>
                  <div className="flex gap-3">
                    <Button variant="outline" size="lg" className="flex-1">
                      <Heart className="h-5 w-5" />
                    </Button>
                    <Button variant="outline" size="lg" className="flex-1">
                      <Share2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Attendees */}
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.soldTickets.toLocaleString()} people attending</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default EventDetailPage;
