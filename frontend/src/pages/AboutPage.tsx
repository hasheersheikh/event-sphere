import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useRef, useState, useEffect } from "react";
import {
  Users,
  Zap,
  Heart,
  ShieldCheck,
  Globe,
  Sparkles,
  Music,
  ArrowRight,
  Trophy,
} from "lucide-react";

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

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const yBg = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacityHero = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const stats = [
    { label: "Community Nodes", value: "2.4M+", icon: Globe },
    { label: "Live Experiences", value: "85K+", icon: Music },
    { label: "Global Organizers", value: "12K+", icon: Users },
    { label: "Trust Score", value: "99.9%", icon: ShieldCheck },
  ];

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-primary/30"
      ref={containerRef}
    >
      <Navbar />

      <main className="flex-1">
        {/* Immersive Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <motion.div
            className="absolute inset-0 z-0"
            style={{ y: yBg, opacity: opacityHero }}
          >
            <AnimatePresence mode="wait">
              <motion.img
                key={theme}
                src={
                  theme === "dark"
                    ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070"
                    : "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=2070"
                }
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                alt="Immersive Festival"
                className="w-full h-full object-cover scale-110"
              />
            </AnimatePresence>
            <div
              className={`absolute inset-0 bg-gradient-to-b ${
                theme === "dark"
                  ? "from-background/20 via-background/40 to-background"
                  : "from-white/40 via-white/60 to-background"
              }`}
            />
            <div className="absolute inset-0 mesh-bg opacity-30" />
          </motion.div>

          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 glass-panel text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-primary">
                <Sparkles className="h-3 w-3 animate-pulse" />
                The Protocol of Connection
              </div>
              <h1 className="text-6xl md:text-[9.5rem] font-bold tracking-tighter leading-[0.8] mb-12 mix-blend-difference">
                Unified by <br />
                <span className="text-gradient italic font-light">
                  The Pulse.
                </span>
              </h1>
              <p className="text-xl md:text-3xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light mb-16">
                Event Sphere is a decentralized ecosystem for extraordinary live
                experiences, syncing human connection across the globe.
              </p>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
              >
                <ArrowRight className="h-10 w-10 mx-auto text-primary animate-bounce opacity-30" />
              </motion.div>
            </motion.div>
          </div>
        </section>


        {/* Infinite Scrolling Stats - Refined */}
        <section className="py-40 bg-muted/20 border-y border-border/50 overflow-hidden relative">
          <div className="absolute inset-0 mesh-bg opacity-10" />
          <div className="flex animate-marquee whitespace-nowrap relative z-10">
            {[...stats, ...stats, ...stats].map((stat, i) => (
              <div key={i} className="flex items-center gap-12 px-24 group">
                <stat.icon className="h-10 w-10 text-primary/40 group-hover:text-primary transition-colors duration-500" />
                <div className="flex flex-col">
                  <span className="text-5xl md:text-7xl font-bold tracking-tighter text-foreground group-hover:text-primary transition-colors duration-500">
                    {stat.value}
                  </span>
                  <span className="text-[11px] font-black uppercase tracking-[0.5em] text-muted-foreground/40 group-hover:text-muted-foreground transition-colors duration-500">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

      </main>

      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
        .animate-marquee {
          animation: marquee 60s linear infinite;
        }
        .mesh-bg {
          background-image: radial-gradient(circle at 2px 2px, hsl(var(--border)) 1px, transparent 0);
          background-size: 32px 32px;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
