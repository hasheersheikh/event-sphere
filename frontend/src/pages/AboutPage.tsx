import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useRef, useState, useEffect } from "react";
import {
  Users,
  ShieldCheck,
  Globe,
  Music,
  Zap,
  RefreshCcw,
  Headphones,
  Building2,
  BarChart3,
  QrCode,
  GraduationCap,
  Smartphone,
  Megaphone,
  Trophy,
  Mic2,
  UtensilsCrossed,
  Palette,
  Mountain,
  ShoppingBag,
  Brush,
  Search,
  Compass,
  CalendarDays,
} from "lucide-react";
import CircularWorkflowSection from "@/components/shared/CircularWorkflowSection";
import LazySection from "@/components/shared/LazySection";
import FeatureCard from "@/components/shared/FeatureCard";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

const cityExperiences = [
  { icon: Music, label: "Live Concerts" },
  { icon: Trophy, label: "Sports Tournaments" },
  { icon: Mic2, label: "Stand-up Comedy" },
  { icon: UtensilsCrossed, label: "Food Festivals" },
  { icon: Palette, label: "Local Exhibitions" },
  { icon: Mountain, label: "Trekking Groups" },
  { icon: ShoppingBag, label: "Store Openings" },
  { icon: Brush, label: "Art Workshops" },
];

const neon = "hsl(71,100%,47%)";

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
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const stats = [
    { label: "Community Nodes", value: "2.4M+", icon: Globe, color: "text-blue-500" },
    { label: "Live Experiences", value: "85K+", icon: Music, color: "text-emerald-500" },
    { label: "Global Organizers", value: "12K+", icon: Users, color: "text-indigo-500" },
    { label: "Trust Score", value: "99.9%", icon: ShieldCheck, color: "text-amber-500" },
  ];

  const features = [
    { icon: RefreshCcw, title: "Cash Flow in 48 Hours", description: "Forget waiting weeks. Get your ticket revenue within 48 hours post event, straight to your account.", color: "text-lime-500" },
    { icon: Zap, title: "Go Live in Under 5 Minutes", description: "List your event, set up tickets, and start selling, all in less time than your coffee takes to brew.", color: "text-yellow-500" },
    { icon: Headphones, title: "24/7 Human Support", description: "Real people, real-time help. No bots. Our team is available day and night to support your events.", color: "text-blue-500" },
    { icon: Building2, title: "Ticketing at Any Scale", description: "From pop ups to packed festivals, City Pulse handles it all, no limits, no glitches.", color: "text-purple-500" },
    { icon: BarChart3, title: "Advanced Analytics & Insights", description: "Track sales, identify booking trends, and know your audience like never before, all from a simple dashboard.", color: "text-pink-500" },
    { icon: QrCode, title: "Simplest Gate Management Ever", description: "QR-based check-in, real-time attendee data, and entry control, all in one app.", color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden" ref={containerRef}>
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" style={{ background: `${neon}18` }} />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" style={{ background: `${neon}18` }} />

      <Navbar />

      <main className="flex-1 relative z-10">

        {/* Hero Header */}
        <section className="relative pt-20 md:pt-24 pb-6 md:pb-8 overflow-hidden">
          <div className="container px-3 md:px-4">
            <PublicPageHeader
              pillText="About City Pulse"
              title={
                <>
                  If it's happening in the city,{" "}
                  <span className="text-neon-lime">it's on City Pulse</span>
                </>
              }
              subtitle="A hyperlocal discovery platform that helps people find, explore, and book everything happening in their city—from major events to hidden local experiences."
              size="md"
              className="text-center mb-10"
            />
          </div>
        </section>

        {/* Vision Image */}
        <LazySection minHeight="min-h-56 sm:min-h-72 md:min-h-[28rem]">
          <section className="container py-12 md:py-20 px-3 md:px-4">
            <div className="max-w-6xl mx-auto px-3 md:px-0">
            <div className="relative h-56 sm:h-72 md:h-[28rem] rounded-2xl md:rounded-[2.5rem] overflow-hidden border border-border/50 shadow-2xl">
              <img
                src={
                  theme === "dark"
                    ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070"
                    : "https://images.unsplash.com/photo-1549451371-64aa98a6f660?auto=format&fit=crop&q=80&w=2070"
                }
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                alt="City Pulse Community"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${theme === "dark" ? "from-background via-background/20 to-transparent" : ""}`} />
              <div className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4 md:bottom-10 md:left-10 md:right-10 flex flex-col md:flex-row items-center md:items-end justify-between gap-3 md:gap-6">
                <div className="max-w-xl w-full md:w-auto space-y-2 md:space-y-3 text-center md:text-left">
                  <NeonBadge>Our Core Philosophy</NeonBadge>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl">
                    Every city has <br />its own rhythm.
                  </h2>
                </div>
                <div className="hidden md:block">
                  <div className="h-16 w-16 rounded-full border border-white/20 backdrop-blur-xl flex items-center justify-center animate-pulse">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </LazySection>

        {/* The Problem We Solve */}
        <LazySection>
          <section className="container py-12 md:py-20 px-3 md:px-4">
            <div className="max-w-6xl mx-auto px-3 md:px-0 space-y-8 md:space-y-12">

            <div>
              <PublicPageHeader
                pillText="What's Happening Around You"
                title={
                  <>
                    The Problem <span className="text-neon-lime">We Solve</span>
                  </>
                }
                size="md"
                className="text-center mb-0"
              />
              <div className="flex md:flex-wrap md:justify-center items-center gap-2 md:gap-3 mt-5 md:mt-6 overflow-x-auto md:overflow-visible scrollbar-hide snap-x md:snap-none px-1 md:px-0 -mx-1 md:mx-0 py-1">
                {cityExperiences.map((exp, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-3 md:px-4 py-2 rounded-full bg-card/60 border border-border/60 backdrop-blur-sm text-xs md:text-sm font-semibold text-foreground/80 hover:border-[hsl(71,100%,47%)]/40 hover:text-foreground transition-all duration-300 whitespace-nowrap shrink-0 snap-start"
                  >
                    <exp.icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-neon-lime" />
                    {exp.label}
                  </div>
                ))}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl space-y-3 flex flex-col justify-between">
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground text-center md:text-left">The Problem</p>
                <div>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed mb-3 text-center md:text-left">
                    The problem isn't that these experiences don't exist.
                  </p>
                  <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter italic text-foreground leading-tight text-center md:text-left">
                    Most people never hear about them.
                  </p>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-center md:text-left">
                  While major concerts find their place on national platforms, hundreds of amazing local experiences go unnoticed—they simply lack the visibility.
                </p>
              </div>

              <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] border backdrop-blur-xl space-y-3 flex flex-col justify-between text-center md:text-left" style={{ background: `${neon}12`, borderColor: `${neon}4D` }}>
                <p className="text-xs font-black uppercase tracking-widest text-neon-lime">The Solution</p>
                <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter italic text-foreground leading-tight">
                  That's the gap City Pulse was created to solve.
                </p>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                  One platform. Every experience. Your city, fully discoverable.
                </p>
              </div>
            </div>
          </div>
        </section>
        </LazySection>

        {/* Our Story */}
        <LazySection>
          <section className="py-12 md:py-20 container px-3 md:px-4">
            <div className="max-w-6xl mx-auto px-3 md:px-0 space-y-6 md:space-y-10">
            <div>
              <PublicPageHeader
                pillText="Our Story"
                title={
                  <>
                    The Mind <span className="text-neon-lime">Behind It</span>
                  </>
                }
                size="md"
                className="text-center mb-0"
              />
            </div>

            <div className="p-6 md:p-10 rounded-2xl md:rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl">
              <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-10">
                <div className="flex-shrink-0 flex flex-col items-center md:items-start gap-3">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl flex items-center justify-center text-neon-lime" style={{ background: `${neon}18`, border: `1px solid ${neon}33` }}>
                    <GraduationCap className="h-8 w-8 md:h-10 md:w-10" />
                  </div>
                  <div className="text-center md:text-left">
                    <p className="text-lg md:text-xl font-black tracking-tighter uppercase italic">Mohsin Sheikh</p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-1.5 mt-1.5">
                      <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-neon-lime" style={{ background: `${neon}18`, border: `1px solid ${neon}33` }}>IIT Alumni</span>
                      <span className="inline-flex items-center text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full text-neon-lime" style={{ background: `${neon}18`, border: `1px solid ${neon}33` }}>IIM Alumni</span>
                    </div>
                  </div>
                </div>

                <div className="flex-1 space-y-4">
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed">
                    City Pulse was built with a precise blend of technological innovation, deep-rooted love for urban culture, and a simple belief:
                  </p>
                  <p className="text-xl md:text-2xl font-black tracking-tighter italic text-foreground">
                    "Every city deserves its own discovery platform."
                  </p>
                  <div className="pt-2 border-t border-border/40">
                    <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                      We didn't want to build just another rigid corporate ticketing platform. We set out to create a <span className="text-foreground font-semibold">living, breathing digital companion for the city</span>—democratizing the event space so a massive musical concert gets the same spotlight as a small, passionate neighbourhood art exhibition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        </LazySection>

        {/* Why We Exist */}
        <LazySection>
          <section className="py-12 md:py-20 container px-3 md:px-4">
            <div className="max-w-6xl mx-auto px-3 md:px-0 space-y-6 md:space-y-10">
            <div>
              <PublicPageHeader
                pillText="Why We Exist"
                title={
                  <>
                    Built for the <span className="text-neon-lime">City</span>
                  </>
                }
                size="md"
                className="text-center mb-0"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4 md:gap-6">
              <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-muted/50 flex items-center justify-center text-blue-500">
                    <Smartphone className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black tracking-tighter uppercase italic text-neon-lime">For People</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-center md:text-left">
                  City Pulse removes the stress of discovering what to do next. No more hunting across:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Instagram", "WhatsApp Groups", "Facebook Pages", "Multiple Websites"].map((platform) => (
                    <div key={platform} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted/30 border border-border/40">
                      <div className="h-1.5 w-1.5 rounded-full flex-shrink-0" style={{ background: neon }} />
                      <span className="text-[11px] font-semibold text-muted-foreground">{platform}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/40">
                  <p className="text-xs md:text-sm font-bold text-foreground">
                    Everything happening in and around your city—in one place.
                  </p>
                </div>
              </div>

              <div className="p-6 md:p-8 rounded-2xl md:rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl space-y-5">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <div className="h-11 w-11 rounded-xl bg-muted/50 flex items-center justify-center text-emerald-500">
                    <Megaphone className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg md:text-xl font-black tracking-tighter uppercase italic text-neon-lime">For Organizers</h3>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed text-center md:text-left">
                  A platform built for every kind of creator:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["Event Organizers", "Creators", "Clubs & Cafés", "Local Businesses"].map((type) => (
                    <div key={type} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-muted/30 border border-border/40">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                      <span className="text-[11px] font-semibold text-muted-foreground">{type}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-border/40">
                  <p className="text-xs md:text-sm font-bold text-foreground">
                    Reach the right audience—without massive advertising budgets.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 md:p-10 rounded-2xl md:rounded-[2rem] backdrop-blur-xl text-center space-y-2"
              style={{ background: `${neon}0F`, border: `1px solid ${neon}33` }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-neon-lime">Our Goal</p>
              <p className="text-xl md:text-2xl lg:text-3xl font-black tracking-tighter italic text-foreground leading-tight">
                Create a bridge between people looking for experiences and the people creating them.
              </p>
              <p className="text-xs md:text-sm text-muted-foreground pt-1">
                When discovery becomes easier, cities become more connected.
              </p>
            </div>
          </div>
        </section>
        </LazySection>

        {/* Stats Grid */}
        <LazySection>
          <section className="py-12 md:py-20 container px-3 md:px-4">
            <div className="max-w-6xl mx-auto px-3 md:px-0 grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="p-4 md:p-8 rounded-xl md:rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl hover:border-[hsl(71,100%,47%)]/30 transition-all duration-500 group text-center space-y-2 md:space-y-5"
              >
                <div className={`h-10 w-10 md:h-12 md:w-12 rounded-xl bg-muted/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
                  <stat.icon className="h-5 w-5 md:h-6 md:w-6" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-2xl md:text-4xl font-black tracking-tighter italic uppercase text-foreground">{stat.value}</h3>
                  <p className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.25em] md:tracking-[0.3em] text-muted-foreground leading-tight">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        </LazySection>

        {/* More Than a Ticketing Platform */}
        <LazySection>
          <section className="py-12 md:py-20 container px-3 md:px-4">
            <div className="max-w-6xl mx-auto px-3 md:px-0 space-y-6 md:space-y-10">
            <div className="space-y-3 md:space-y-4">
              <PublicPageHeader
                pillText="More Than Ticketing"
                title={
                  <>
                    We're the city's <span className="text-neon-lime">Discovery Engine</span>
                  </>
                }
                size="md"
                className="text-center mb-0"
              />
            </div>

            <div className="grid sm:grid-cols-3 gap-4 md:gap-6">
              {[
                { icon: Search, color: "text-violet-500", title: "Discover", desc: "A city isn't defined only by its biggest events. It's defined by thousands of experiences happening every single day." },
                { icon: CalendarDays, color: "text-amber-500", title: "Plan", desc: "Weekend plans, next adventures, local businesses, event tickets—everything you need to stay connected to your city." },
                { icon: Compass, color: "text-rose-500", title: "Explore", desc: "Break free from the mundane. Immerse yourself in local culture. Your city, neatly organized and instantly accessible." },
              ].map((item) => (
                <FeatureCard
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  description={item.desc}
                  color={item.color}
                />
              ))}
            </div>

          </div>
        </section>
        </LazySection>

        {/* Features Section */}
        <LazySection>
          <section className="py-12 md:py-20 container relative px-3 md:px-4">
            <div className="max-w-6xl mx-auto px-3 md:px-0 space-y-10 md:space-y-16">
            <PublicPageHeader
              pillText="Everything You Need"
              title={
                <>
                  Everything <span className="text-neon-lime">You Need</span>
                </>
              }
              subtitle="City Pulse provides all the tools you need to create, manage, and scale your events with ease."
              size="md"
              className="text-center mb-0"
            />

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {features.map((feature) => (
                <FeatureCard
                  key={feature.title}
                  icon={feature.icon}
                  title={feature.title}
                  description={feature.description}
                  color={feature.color}
                  size="lg"
                />
              ))}
            </div>
          </div>
        </section>
        </LazySection>

        <LazySection minHeight="min-h-64">
          <CircularWorkflowSection />
        </LazySection>
      </main>

      <Footer />
    </div>
  );
};

const NeonBadge = ({ children }: { children: React.ReactNode }) => {
  const neon = "hsl(71,100%,47%)";
  return (
    <div
      className="inline-flex items-center px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-neon-lime leading-none"
      style={{ background: `${neon}18`, border: `1px solid ${neon}40` }}
    >
      {children}
    </div>
  );
};

export default AboutPage;
