import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Globe,
  Sparkles,
  Music,
  ArrowRight,
  Zap,
  Star,
  Shield,
  Target,
  RefreshCcw,
  Headphones,
  Building2,
  BarChart3,
  QrCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

const AboutPage = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkTheme = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setTheme(isDark ? "dark" : "light");
    };

    checkTheme();
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const stats = [
    {
      label: "Community Nodes",
      value: "2.4M+",
      icon: Globe,
      color: "text-blue-500",
    },
    {
      label: "Live Experiences",
      value: "85K+",
      icon: Music,
      color: "text-emerald-500",
    },
    {
      label: "Global Organizers",
      value: "12K+",
      icon: Users,
      color: "text-indigo-500",
    },
    {
      label: "Trust Score",
      value: "99.9%",
      icon: ShieldCheck,
      color: "text-amber-500",
    },
  ];

  const features = [
    {
      icon: RefreshCcw,
      title: "Cash Flow in 48 Hours",
      description:
        "Forget waiting weeks. Get your ticket revenue within 48 hours post event, straight to your account.",
      color: "text-lime-500",
    },
    {
      icon: Zap,
      title: "Go Live in Under 5 Minutes",
      description:
        "List your event, set up tickets, and start selling, all in less time than your coffee takes to brew.",
      color: "text-yellow-500",
    },
    {
      icon: Headphones,
      title: "24/7 Human Support",
      description:
        "Real people, real-time help. No bots. Our team is available day and night to support your events.",
      color: "text-blue-500",
    },
    {
      icon: Building2,
      title: "Ticketing at Any Scale",
      description:
        "From pop ups to packed festivals, CitiPulse handles it all, no limits, no glitches.",
      color: "text-purple-500",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics & Insights",
      description:
        "Track sales, identify booking trends, and know your audience like never before, all from a simple dashboard.",
      color: "text-pink-500",
    },
    {
      icon: QrCode,
      title: "Simplest Gate Management Ever",
      description:
        "QR-based check-in, real-time attendee data, and entry control, all in one app.",
      color: "text-orange-500",
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden"
      ref={containerRef}
    >
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* Premium Header Section */}
        <section className="relative pt-24 pb-8 overflow-hidden">
          <div className="container relative z-20">
            <PublicPageHeader
              pillText="The Protocol of Connection"
              title={
                <>
                  Unified by{" "}
                  <span className="text-primary italic">The Pulse.</span>
                </>
              }
              subtitle="Event Sphere is a decentralized ecosystem for extraordinary live experiences, syncing human connection across the globe."
              themeColor="primary"
            />
          </div>
        </section>

        {/* Vision Image Section */}
        <section className="container py-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative h-[28rem] rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl"
          >
            <img
              src={
                theme === "dark"
                  ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070"
                  : "https://images.unsplash.com/photo-1549451371-64aa98a6f660?auto=format&fit=crop&q=80&w=2070"
              }
              className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
              alt="Pulse Community"
            />
            <div
              className={`absolute inset-0 bg-gradient-to-t ${
                theme === "dark"
                  ? "from-background via-background/20 to-transparent"
                  : ""
              }`}
            />

            <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row items-end justify-between gap-6">
              <div className="max-w-xl space-y-3">
                <Badge
                  variant="secondary"
                  className="bg-primary/20 text-primary border-primary/30 rounded-xl px-4 py-1.5 font-bold uppercase tracking-widest text-[9px]"
                >
                  Our Core Philosophy
                </Badge>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl">
                  Beyond The <br />
                  Spectacle.
                </h2>
              </div>
              <div className="hidden md:block">
                <div className="h-16 w-16 rounded-full border border-white/20 backdrop-blur-xl flex items-center justify-center animate-pulse">
                  <Zap className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats Grid - High Density */}
        <section className="py-20 container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 group text-center space-y-5"
              >
                <div
                  className={`h-12 w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 ${stat.color}`}
                >
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-3xl md:text-4xl font-black tracking-tighter italic uppercase text-foreground">
                    {stat.value}
                  </h3>
                  <p className="text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                    {stat.label}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 container relative">
          <div className="text-center space-y-4 mb-16">
            <Badge
              variant="secondary"
              className="bg-primary/20 text-primary border-primary/30 rounded-xl px-4 py-1.5 font-bold uppercase tracking-widest text-[9px]"
            >
              Everything You Need
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
              Everything <span className="text-primary italic">You Need.</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg font-medium italic max-w-2xl mx-auto">
              CitiPulse provides all the tools you need to create, manage, and
              scale your events with ease.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-8 rounded-[2.5rem] bg-card/30 border border-border/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 group space-y-6"
              >
                <div
                  className={`h-14 w-14 rounded-2xl bg-muted/50 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ${feature.color}`}
                >
                  <feature.icon className="h-7 w-7" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-black tracking-tighter uppercase italic leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium leading-relaxed italic">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Values Section */}
        <section className="py-24 bg-primary/[0.02] border-y border-border/50 relative overflow-hidden">
          <div className="container relative z-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-xl space-y-5 text-center md:text-left">
                <h2 className="text-3xl md:text-5xl font-black tracking-tighter uppercase leading-none">
                  Our <span className="text-primary italic">DNA.</span>
                </h2>
                <p className="text-muted-foreground text-base md:text-lg font-medium italic">
                  We believe that the most powerful form of technology is the
                  one that facilitates human presence.
                </p>
                <div className="pt-4">
                  <Link to="/auth">
                    <Button className="h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-button bg-primary text-primary-foreground">
                      Join the Network
                      <ArrowRight className="h-3.5 w-3.5 ml-3" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-6 w-full md:w-auto">
                <ValueCard
                  icon={Target}
                  title="Precision"
                  description="Highly curated experiences that resonate with your specific frequency."
                />
                <ValueCard
                  icon={Shield}
                  title="Integrity"
                  description="Decentralized trust protocols ensuring absolute security for every ticket."
                />
                <ValueCard
                  icon={Star}
                  title="Legacy"
                  description="Building moments that echo long after the final note has faded."
                />
                <ValueCard
                  icon={Users}
                  title="Community"
                  description="Connecting organizers and fans in a symbiotic, local ecosystem."
                />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Connect - Reused from Index but simplified */}
        <section className="py-24 container text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none italic">
              Ready to <br />
              <span className="text-primary">Sync?</span>
            </h2>
            <p className="text-muted-foreground text-base md:text-lg font-medium italic max-w-xl mx-auto">
              Whether you're an organizer with a vision or a fan seeking the
              next memory, the Pulse is waiting for your signature.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <Button className="h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[9px] shadow-button">
                  Get Started
                </Button>
              </Link>
              <Link to="/events">
                <Button
                  variant="outline"
                  className="h-12 px-10 rounded-xl font-black uppercase tracking-widest text-[9px] border border-primary text-primary hover:bg-primary/10"
                >
                  Explore Pulses
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

const ValueCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: any;
  title: string;
  description: string;
}) => (
  <div className="p-6 rounded-2xl bg-card/50 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 group space-y-3 max-w-[280px]">
    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
      <Icon className="h-5 w-5" />
    </div>
    <h4 className="text-base md:text-lg font-black uppercase tracking-tight italic">
      {title}
    </h4>
    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
      {description}
    </p>
  </div>
);

const Badge = ({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <div
    className={cn(
      "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
      variant === "secondary"
        ? "bg-secondary text-secondary-foreground"
        : "bg-primary text-primary-foreground",
      className,
    )}
  >
    {children}
  </div>
);

export default AboutPage;
