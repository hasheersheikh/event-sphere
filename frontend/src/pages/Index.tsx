import { motion } from "framer-motion";
import HeroSection from "@/components/home/HeroSection";
import FeaturedEvent from "@/components/events/FeaturedEvent";
import EventCard from "@/components/events/EventCard";
import CategoryCard from "@/components/events/CategoryCard";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { categories } from "@/data/mockEvents";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { data: events, isLoading } = useQuery({
    queryKey: ["events", "featured"],
    queryFn: async () => {
      const { data } = await api.get("/events");
      return data;
    },
  });

  const featuredEvent = events?.[0]; // Use the first event as featured for now
  const upcomingEvents = events?.slice(0, 6) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Event */}
        <section className="container py-12 md:py-16">
          {isLoading ? (
            <div className="grid lg:grid-cols-2 gap-8 items-center bg-card rounded-3xl p-6 md:p-8 shadow-card border">
              <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
              <div className="space-y-6">
                <Skeleton className="h-8 w-[40%] rounded-full" />
                <div className="space-y-3">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-[80%]" />
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-[60%]" />
                  <Skeleton className="h-4 w-[70%]" />
                </div>
                <div className="pt-6 border-t flex justify-between items-end">
                  <Skeleton className="h-10 w-32" />
                  <Skeleton className="h-12 w-40 rounded-xl" />
                </div>
              </div>
            </div>
          ) : featuredEvent ? (
            <FeaturedEvent event={featuredEvent} />
          ) : null}
        </section>

        {/* Upcoming Events */}
        <section className="container py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Upcoming Events
              </h2>
              <p className="text-muted-foreground">
                Don't miss out on these amazing experiences
              </p>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <Skeleton className="h-[200px] w-full rounded-2xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-[80%]" />
                    </div>
                    <div className="flex justify-between items-center pt-4">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                ))
              : upcomingEvents.map((event: any, index: number) => (
                  <EventCard key={event._id} event={event} index={index} />
                ))}
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="bg-muted/50 py-16 md:py-24">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center max-w-2xl mx-auto mb-12"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Why Choose <span className="gradient-text">CityPulse</span>?
              </h2>
              <p className="text-muted-foreground text-lg">
                We make discovering and attending events effortless
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Sparkles,
                  title: "Curated Events",
                  description:
                    "Hand-picked events from trusted organizers, ensuring quality experiences every time.",
                },
                {
                  icon: Shield,
                  title: "Secure Booking",
                  description:
                    "Your tickets and payments are protected with industry-leading security measures.",
                },
                {
                  icon: Zap,
                  title: "Instant Access",
                  description:
                    "Get your tickets instantly via email and mobile app. No waiting, no hassle.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-card rounded-2xl p-8 text-center shadow-card"
                >
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl gradient-hero mb-6">
                    <feature.icon className="h-7 w-7 text-primary-foreground" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container py-16 md:py-24">
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative overflow-hidden rounded-3xl gradient-hero p-8 md:p-16 text-center"
          >
            <div className="relative z-10 max-w-2xl mx-auto text-primary-foreground">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Host Your Own Event?
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8">
                Join thousands of event organizers who trust City Pulse to bring
                their events to life.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/events/create">
                  <Button
                    size="xl"
                    variant="hero"
                    className="bg-white text-primary hover:bg-white/90"
                  >
                    Start Creating
                  </Button>
                </Link>
                <Link to="/about">
                  <Button size="xl" variant="hero-outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
