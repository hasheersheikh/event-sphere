import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Ticket,
  Calendar,
  MapPin,
  User as UserIcon,
  ArrowRight,
  Star,
  Clock,
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useAuth } from "@/contexts/AuthContext";
import api from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const { user } = useAuth();

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: async () => {
      const { data } = await api.get("/bookings");
      return data;
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative">
      <div className="fixed inset-0 mesh-bg z-0" />
      <Navbar />
      <main className="flex-1 container py-12 md:py-20">
        <header className="mb-16 md:flex items-center justify-between gap-8">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shrink-0 rounded-2xl">
              <UserIcon className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2">
                Hey, <span className="text-primary">{user?.name}</span>
              </h1>
              <p className="text-muted-foreground text-lg font-medium italic">
                Your personal event command center.
              </p>
            </div>
          </div>
          <div className="mt-8 md:mt-0 flex gap-4">
            <div className="bg-muted/50 border border-border px-6 py-4 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">
                Passes
              </p>
              <p className="text-2xl font-black">{bookings?.length || 0}</p>
            </div>
            <div className="bg-primary/5 border border-primary/10 px-6 py-4 rounded-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">
                Status
              </p>
              <p className="text-2xl font-black text-primary">Active</p>
            </div>
          </div>
        </header>

        <section className="space-y-10">
          <div className="flex items-end justify-between border-b pb-6">
            <div>
              <h2 className="text-2xl font-black flex items-center gap-3">
                <Ticket className="h-6 w-6 text-primary" />
                Secured Passes
              </h2>
              <p className="text-muted-foreground font-medium mt-1">
                Events you're scheduled to attend.
              </p>
            </div>
            <Link to="/events">
              <Button
                variant="ghost"
                className="rounded-none gap-2 font-bold text-xs uppercase tracking-widest border border-transparent hover:border-border"
              >
                Discover More <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-[300px] rounded-[2rem] bg-muted animate-pulse"
                />
              ))}
            </div>
          ) : bookings?.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {bookings.map((booking: any, index: number) => (
                <motion.div
                  key={booking._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/events/${booking.event._id}`}>
                    <div className="bg-card border border-border/50 p-8 h-full rounded-2xl hover:shadow-xl transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Star className="h-20 w-20 text-primary rotate-12" />
                      </div>

                      <div className="mb-8">
                        <Badge
                          variant="secondary"
                          className="px-4 py-1 font-bold text-[10px] uppercase tracking-widest mb-4 bg-primary/10 text-primary border border-primary/20 rounded-lg"
                        >
                          Confirmed Entry
                        </Badge>
                        <h3 className="text-2xl font-bold tracking-tight leading-none group-hover:text-primary transition-colors">
                          {booking.event.title}
                        </h3>
                      </div>

                      <div className="space-y-4 mb-10">
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <Calendar className="h-4 w-4" />
                          </div>
                          <span>
                            {new Date(booking.event.date).toLocaleDateString(
                              "en-US",
                              {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <MapPin className="h-4 w-4" />
                          </div>
                          <span className="line-clamp-1">
                            {booking.event.location.venueName ||
                              booking.event.location.address}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
                            <Clock className="h-4 w-4" />
                          </div>
                          <span>{booking.event.time || "TBA"}</span>
                        </div>
                      </div>

                      <div className="pt-6 border-t flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Reserved
                          </span>
                          <span className="text-lg font-black">
                            {booking.tickets[0].quantity}x{" "}
                            {booking.tickets[0].type}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                            Value
                          </span>
                          <p className="text-lg font-black text-primary">
                            ₹{booking.totalAmount}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="py-24 text-center glass-card rounded-[3rem] border border-dashed border-border/50">
              <div className="h-24 w-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-8">
                <Ticket className="h-12 w-12 text-muted-foreground/20" />
              </div>
              <h3 className="text-2xl font-black mb-3 tracking-tight">
                Your Passport is Empty
              </h3>
              <p className="text-muted-foreground font-medium mb-10 max-w-sm mx-auto leading-relaxed">
                The city is alive with experiences waiting for you. Grab your
                first pass and start building your highlight reel.
              </p>
              <Link to="/events">
                <Button className="rounded-2xl px-12 py-7 font-black shadow-button hover:scale-105 transition-transform uppercase tracking-tighter text-lg">
                  Explore Lineup
                </Button>
              </Link>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
