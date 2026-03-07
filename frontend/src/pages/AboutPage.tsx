import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  Users,
  Zap,
  Heart,
  ShieldCheck,
  Globe,
  Sparkles,
  Music,
  Mic2,
  Trophy,
} from "lucide-react";

const AboutPage = () => {
  const stats = [
    { label: "Active Pulse Nodes", value: "2.4M+", icon: Globe },
    { label: "Live Experiences", value: "85K+", icon: Music },
    { label: "Global Organizers", value: "12K+", icon: Users },
    { label: "Sync Successful", value: "99.9%", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground overflow-x-hidden selection:bg-emerald-500/30">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-24 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&q=80&w=2070"
              alt="Vibrant Crowd"
              className="w-full h-full object-cover opacity-30 scale-110 blur-[3px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
          </div>

          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-3 px-6 py-2 border border-primary/30 bg-background/50 text-[10px] font-bold uppercase tracking-[0.4em] mb-12 text-primary rounded-full">
                <Sparkles className="h-3 w-3" />
                The Heart of Experience
              </div>
              <h1 className="text-6xl md:text-[8rem] font-medium tracking-tighter leading-[0.85] mb-10 drop-shadow-2xl">
                Bridging the <br />
                <span className="text-gradient italic font-light">
                  Human Pulse.
                </span>
              </h1>
              <p className="text-lg md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-light">
                City Pulse is the ultimate ecosystem for live experiences,
                connecting event creators with an audience that's hungry for the
                extraordinary.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="py-40 container">
          <div className="grid lg:grid-cols-2 gap-32 items-center">
            <div className="space-y-12">
              <div className="h-1 w-20 bg-emerald-500 shadow-[0_0_20px_#10B981]" />
              <h2 className="text-5xl md:text-8xl font-medium tracking-tighter leading-none mb-10">
                Where Fans <br />
                <span className="italic font-light text-gradient">
                  Find Magic.
                </span>
              </h2>
              <p className="text-2xl text-muted-foreground font-light leading-relaxed">
                We believe that every concert, every festival, and every local
                meetup is a chance for a unique connection. Our platform doesn't
                just sell tickets—it facilitates memories.
              </p>
              <div className="p-10 border border-border bg-muted/30 rounded-2xl shadow-sm">
                <p className="text-xl font-medium italic text-primary">
                  "Our mission is to sync the world's rhythm, making every event
                  discovery feel like destiny."
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-emerald-500/10 to-transparent blur-[80px]" />
              <img
                src="https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&q=80&w=2070"
                alt="Crowd Interaction"
                className="w-full aspect-[4/5] object-cover border border-border shadow-2xl scale-95 rounded-3xl"
              />
            </div>
          </div>
        </section>

        {/* Infinite Scrolling Stats */}
        <section className="py-32 bg-muted/30 backdrop-blur-3xl border-y border-border overflow-hidden">
          <div className="flex animate-marquee whitespace-nowrap">
            {[...stats, ...stats].map((stat, i) => (
              <div key={i} className="flex items-center gap-10 px-20">
                <stat.icon className="h-8 w-8 text-emerald-500" />
                <div className="flex flex-col">
                  <span className="text-4xl font-black subpixel-antialiased uppercase tracking-tighter">
                    {stat.value}
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50">
                    {stat.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Vision Blocks */}
        <section className="py-40 container">
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Liquid Discovery",
                desc: "Our AI-driven pulse match ensures you're always tuned into the events that resonate with your vibe.",
                icon: Zap,
              },
              {
                title: "Fan-First Ethics",
                desc: "Transparency in pricing and secondary markets, built on the foundation of human trust.",
                icon: Heart,
              },
              {
                title: "Creator Control",
                desc: "Empowering organizers with the tools they need to host seamless, high-impact productions.",
                icon: Trophy,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-12 border border-border/50 hover:bg-muted/50 transition-all duration-500 group rounded-2xl shadow-sm"
              >
                <item.icon className="h-10 w-10 text-primary mb-10 group-hover:scale-110 transition-transform" />
                <h3 className="text-3xl font-bold uppercase italic tracking-tighter mb-6 text-foreground">
                  {item.title}
                </h3>
                <p className="text-muted-foreground font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
