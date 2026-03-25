import { cn } from "@/lib/utils";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  motion,
  useScroll,
  useTransform,
} from "framer-motion";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
    { label: "Community Nodes", value: "2.4M+", icon: Globe, color: "text-blue-500" },
    { label: "Live Experiences", value: "85K+", icon: Music, color: "text-emerald-500" },
    { label: "Global Organizers", value: "12K+", icon: Users, color: "text-indigo-500" },
    { label: "Trust Score", value: "99.9%", icon: ShieldCheck, color: "text-amber-500" },
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
        <section className="relative pt-32 pb-20 overflow-hidden">
          <div className="container relative z-20">
            <header className="max-w-4xl mx-auto text-center space-y-8">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center justify-center gap-3 mb-2"
              >
                <div className="h-px w-10 bg-primary/30 rounded-full" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-primary">
                  The Protocol of Connection
                </span>
                <div className="h-px w-10 bg-primary/30 rounded-full" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85]"
              >
                Unified by <br />
                <span className="text-primary italic">The Pulse.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground text-xl md:text-2xl font-medium max-w-2xl mx-auto italic leading-relaxed"
              >
                Event Sphere is a decentralized ecosystem for extraordinary live
                experiences, syncing human connection across the globe.
              </motion.p>
            </header>
          </div>
        </section>

        {/* Vision Image Section */}
        <section className="container py-12 px-4">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="relative h-[40rem] rounded-[4rem] overflow-hidden border border-border/50 shadow-2xl"
           >
              <img 
                src={theme === 'dark' 
                  ? "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&q=80&w=2070" 
                  : "https://images.unsplash.com/photo-1549451371-64aa98a6f660?auto=format&fit=crop&q=80&w=2070"
                } 
                className="w-full h-full object-cover scale-105 hover:scale-100 transition-transform duration-1000"
                alt="Pulse Community"
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${
                theme === 'dark' ? 'from-background via-background/20 to-transparent' : 'from-background/40 via-transparent to-transparent'
              }`} />
              
              <div className="absolute bottom-12 left-12 right-12 flex flex-col md:flex-row items-end justify-between gap-8">
                 <div className="max-w-xl space-y-4">
                    <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30 rounded-xl px-4 py-1.5 font-bold uppercase tracking-widest text-[9px]">
                      Our Core Philosophy
                    </Badge>
                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase italic leading-none drop-shadow-2xl">
                      Beyond The <br />Spectacle.
                    </h2>
                 </div>
                 <div className="hidden md:block">
                    <div className="h-24 w-24 rounded-full border border-white/20 backdrop-blur-xl flex items-center justify-center animate-pulse">
                        <Zap className="h-8 w-8 text-white" />
                    </div>
                 </div>
              </div>
           </motion.div>
        </section>

        {/* Stats Grid - High Density */}
        <section className="py-32 container">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                {stats.map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="p-10 rounded-[2.5rem] bg-card/50 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 group text-center space-y-6"
                    >
                        <div className={`h-16 w-16 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-500 ${stat.color}`}>
                            <stat.icon className="h-8 w-8" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase text-foreground">
                                {stat.value}
                            </h3>
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">
                                {stat.label}
                            </p>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>

        {/* Values Section */}
        <section className="py-32 bg-primary/[0.02] border-y border-border/50 relative overflow-hidden">
            <div className="container relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-16">
                    <div className="max-w-xl space-y-6 text-center md:text-left">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter uppercase leading-none">
                            Our <span className="text-primary italic">DNA.</span>
                        </h2>
                        <p className="text-muted-foreground text-lg font-medium italic">
                            We believe that the most powerful form of technology is the one that facilitates human presence.
                        </p>
                        <div className="pt-6">
                            <Link to="/auth">
                                <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-button bg-primary text-primary-foreground">
                                    Join the Network
                                    <ArrowRight className="h-4 w-4 ml-4" />
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
        <section className="py-40 container text-center">
            <div className="max-w-3xl mx-auto space-y-10">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase leading-none italic">
                    Ready to <br />
                    <span className="text-primary">Sync?</span>
                </h2>
                <p className="text-muted-foreground text-lg font-medium italic max-w-xl mx-auto">
                    Whether you're an organizer with a vision or a fan seeking the next memory, the Pulse is waiting for your signature.
                </p>
                <div className="flex flex-wrap justify-center gap-6">
                    <Link to="/auth">
                        <Button className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-button">
                            Get Started
                        </Button>
                    </Link>
                    <Link to="/events">
                        <Button variant="outline" className="h-14 px-12 rounded-2xl font-black uppercase tracking-widest text-[10px] border-2 border-primary text-primary">
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

const ValueCard = ({ icon: Icon, title, description }: { icon: any, title: string, description: string }) => (
    <div className="p-8 rounded-[2rem] bg-card/50 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-all duration-500 group space-y-4 max-w-[280px]">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
            <Icon className="h-6 w-6" />
        </div>
        <h4 className="text-lg font-black uppercase tracking-tight italic">{title}</h4>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">{description}</p>
    </div>
);

const Badge = ({ children, variant = "default", className }: { children: React.ReactNode, variant?: string, className?: string }) => (
    <div className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
        variant === "secondary" ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
        className
    )}>
        {children}
    </div>
);

export default AboutPage;
