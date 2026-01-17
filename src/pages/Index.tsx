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
import { eventsWithImages, categories } from "@/data/eventsData";

const Index = () => {
  const featuredEvent = eventsWithImages.find((e) => e.isFeatured);
  const upcomingEvents = eventsWithImages.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <HeroSection />

        {/* Featured Event */}
        {featuredEvent && (
          <section className="container py-12 md:py-16">
            <FeaturedEvent event={featuredEvent} />
          </section>
        )}

        {/* Categories */}
        <section className="container py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Browse by Category</h2>
              <p className="text-muted-foreground">Find events that match your interests</p>
            </div>
            <Link to="/categories" className="hidden md:block">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {categories.map((category, index) => (
              <CategoryCard key={category.id} category={category} index={index} />
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="container py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Don't miss out on these amazing experiences</p>
            </div>
            <Link to="/events">
              <Button variant="ghost" className="gap-2">
                View All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <EventCard key={event.id} event={event} index={index} />
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
                Why Choose <span className="gradient-text">EventHub</span>?
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
                  description: "Hand-picked events from trusted organizers, ensuring quality experiences every time.",
                },
                {
                  icon: Shield,
                  title: "Secure Booking",
                  description: "Your tickets and payments are protected with industry-leading security measures.",
                },
                {
                  icon: Zap,
                  title: "Instant Access",
                  description: "Get your tickets instantly via email and mobile app. No waiting, no hassle.",
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
                Join thousands of event organizers who trust EventHub to bring their events to life.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/create-event">
                  <Button size="xl" variant="hero" className="bg-white text-primary hover:bg-white/90">
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
