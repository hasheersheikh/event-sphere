import { motion } from "framer-motion";
import HeroSection from "@/components/home/HeroSection";
import FeaturedEvent from "@/components/events/FeaturedEvent";
import EventCard from "@/components/events/EventCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", "featured"],
    queryFn: async () => {
      const { data } = await api.get("/events");
      return data;
    },
  });

  const featuredEvent = events?.[0];
  const upcomingEvents = events?.slice(0, 6) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Event */}
        <section className="container py-16 md:py-24">
          <div className="mb-10">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              Don't Miss
            </span>
          </div>
          {isLoading ? (
            <div className="bg-muted rounded-[2rem] p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <Skeleton className="aspect-[4/3] w-full rounded-[2rem]" />
                <div className="space-y-6">
                  <Skeleton className="h-4 w-[30%]" />
                  <div className="space-y-3">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-[80%]" />
                  </div>
                  <Skeleton className="h-4 w-[70%]" />
                  <Skeleton className="h-4 w-[60%]" />
                  <div className="flex gap-3 pt-4">
                    <Skeleton className="h-12 w-40 rounded-full" />
                    <Skeleton className="h-12 w-32 rounded-full" />
                  </div>
                </div>
              </div>
            </div>
          ) : featuredEvent ? (
            <FeaturedEvent event={featuredEvent} />
          ) : null}
        </section>

        {/* Upcoming Events */}
        <section className="container py-12 md:py-20">
          <div className="flex items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Upcoming
              </span>
              <h2 className="text-3xl md:text-4xl font-extrabold mt-2 tracking-tight">
                What's Next
              </h2>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="gap-2 rounded-full font-bold">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="aspect-[4/3] w-full rounded-[1.5rem]" />
                    <div className="space-y-2 px-1">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-[70%]" />
                      <Skeleton className="h-4 w-[50%]" />
                    </div>
                    <div className="flex justify-between items-center px-1 pt-2">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-9 w-28 rounded-full" />
                    </div>
                  </div>
                ))
              : upcomingEvents.map((event: any, index: number) => (
                  <EventCard key={event._id} event={event} index={index} />
                ))}
          </div>
        </section>

        {/* CTA Section — Full-Bleed Image Banner */}
        <section className="relative overflow-hidden my-12 md:my-20">
          <div className="relative min-h-[400px] flex items-center">
            <img
              src="https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&q=80&w=2000"
              alt="Concert crowd"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
            <div className="container relative z-10 py-20 text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="max-w-2xl mx-auto"
              >
                <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
                  Ready to Host Your
                  <br />
                  Own Event?
                </h2>
                <p className="text-white/70 text-lg mb-10 font-medium">
                  Join thousands of organizers who trust City Pulse.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/events/create">
                    <Button
                      size="lg"
                      className="rounded-full px-10 font-bold bg-white text-black hover:bg-white/90 shadow-2xl"
                    >
                      Start Creating
                    </Button>
                  </Link>
                  <Link to="/about">
                    <Button
                      size="lg"
                      variant="outline"
                      className="rounded-full px-10 font-bold border-white/30 text-white hover:bg-white/10"
                    >
                      Learn More
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
