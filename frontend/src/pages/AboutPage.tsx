import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Cpu,
  Layers,
  Wind,
  Zap,
  ArrowRight,
  MousePointer2,
  Sparkles,
} from "lucide-react";

const AboutPage = () => {
  const categories = [
    {
      title: "Fluid Infrastructure",
      desc: "Our systems adapt in real-time to the pulse of your audience.",
      icon: Wind,
      color: "from-indigo-500 to-cyan-400",
    },
    {
      title: "Layered security",
      desc: "Multi-dimensional encryption that moves with your data.",
      icon: Layers,
      color: "from-emerald-500 to-teal-400",
    },
    {
      title: "Neural Synergy",
      desc: "AI-driven discovery that understands the human rhythm.",
      icon: Cpu,
      color: "from-violet-500 to-fuchsia-400",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#050505] text-white selection:bg-emerald-500/30 overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section - Fluid Abstract */}
        <section className="relative min-h-[90vh] flex items-center justify-center py-20">
          <div className="absolute inset-0 z-0">
            <img
              src="/Users/hashir/.gemini/antigravity/brain/979b63cb-17ca-4737-99ca-d4f3319698e3/about_hero_fluid_abstraction_1772662580395.png"
              alt="Fluid Abstraction"
              className="w-full h-full object-cover opacity-60 scale-110 blur-[2px]"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-transparent to-[#050505]" />
          </div>

          <div className="container relative z-10 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 text-[10px] font-medium uppercase tracking-[0.3em] mb-8 text-emerald-400">
                <Sparkles className="h-3 w-3" />
                The Future is Fluid
              </div>
              <h1 className="text-6xl md:text-[10rem] font-medium tracking-tight leading-[0.85] mb-12 drop-shadow-2xl">
                Beyond the <br />
                <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-violet-400 bg-clip-text text-transparent italic font-light">
                  Static.
                </span>
              </h1>
              <p className="text-lg md:text-2xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed font-light">
                City Pulse redefines the event landscape through an organic
                fusion of technology and human intuition. We don't just host; we
                evolve.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <Button className="h-14 px-10 bg-white text-black hover:bg-emerald-400 transition-all rounded-full font-bold text-sm group">
                  Get Started
                  <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button
                  variant="link"
                  className="text-white/80 hover:text-white font-medium flex items-center gap-2"
                >
                  <MousePointer2 className="h-4 w-4" />
                  Watch the Flow
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Feature Grid - Glassmorphism */}
        <section className="py-32 container relative">
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />

          <div className="grid lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="group relative p-10 rounded-[2.5rem] bg-white/[0.03] backdrop-blur-2xl border border-white/10 hover:border-emerald-500/30 transition-all duration-500"
              >
                <div
                  className={`h-16 w-16 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center mb-8 shadow-lg shadow-emerald-500/20`}
                >
                  <cat.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-2xl font-medium mb-4 tracking-tight group-hover:text-emerald-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="text-white/40 leading-relaxed font-light">
                  {cat.desc}
                </p>

                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="h-5 w-5 text-emerald-400 animate-pulse" />
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Philosophy - Editorial Layout */}
        <section className="py-32 md:py-60 container">
          <div className="flex flex-col lg:flex-row items-center gap-24">
            <div className="flex-1 relative">
              <motion.div
                initial={{ opacity: 0, rotate: -5 }}
                whileInView={{ opacity: 1, rotate: 0 }}
                className="relative z-10 rounded-[3rem] overflow-hidden border border-white/10"
              >
                <img
                  src="https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=2070"
                  alt="Tech meeting"
                  className="w-full grayscale hover:grayscale-0 transition-all duration-1000"
                />
              </motion.div>
              <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-violet-500/20 blur-[80px] rounded-full" />
            </div>

            <div className="flex-1 space-y-12">
              <h2 className="text-5xl md:text-7xl font-light tracking-tight leading-none">
                Unfolding the <br />
                <span className="italic">Hidden Rhythm.</span>
              </h2>
              <p className="text-xl text-white/50 font-light leading-relaxed">
                We saw the chaos of traditional event planning and chose a
                different path. City Pulse uses liquid algorithms to harmonize
                supply and demand, creating a seamless stream of experiences for
                both creators and attendees.
              </p>
              <div className="space-y-6">
                {[
                  "Continuous Evolution",
                  "Real-time Synchronization",
                  "Organic Discovery",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-4 text-emerald-400 font-medium tracking-wide"
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Global Stats - Dynamic Scroller */}
        <section className="py-32 bg-white/5 border-y border-white/10 backdrop-blur-md overflow-hidden">
          <div className="flex whitespace-nowrap animate-infinite-scroll">
            {[1, 2, 3, 4].map((_, i) => (
              <div key={i} className="flex gap-20 px-10 items-center">
                <div className="flex items-baseline gap-4">
                  <span className="text-8xl font-black italic">500k+</span>
                  <span className="text-xl text-emerald-400 uppercase tracking-widest font-bold">
                    Connections
                  </span>
                </div>
                <div className="h-12 w-[1px] bg-white/20" />
                <div className="flex items-baseline gap-4">
                  <span className="text-8xl font-black italic">10k+</span>
                  <span className="text-xl text-violet-400 uppercase tracking-widest font-bold">
                    Pulse Hubs
                  </span>
                </div>
                <div className="h-12 w-[1px] bg-white/20" />
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA - Immersive */}
        <section className="py-40 container text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative p-20 rounded-[4rem] overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-violet-500/20 backdrop-blur-3xl border border-white/10" />
            <div className="relative z-10">
              <h2 className="text-5xl md:text-8xl font-medium tracking-tighter mb-10">
                Join the{" "}
                <span className="text-emerald-400 italic">Movement.</span>
              </h2>
              <p className="text-white/60 text-lg mb-12 max-w-xl mx-auto font-light">
                Step into an ecosystem where technology feels as natural as
                breath.
              </p>
              <Link to="/auth">
                <Button className="h-20 px-20 bg-emerald-500 hover:bg-emerald-400 text-black rounded-full font-black uppercase tracking-[0.3em] text-xs shadow-[0_20px_50px_rgba(16,185,129,0.3)] transition-all">
                  Pulse In
                </Button>
              </Link>
            </div>
          </motion.div>
        </section>
      </main>

      <Footer />

      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-infinite-scroll {
          display: flex;
          width: 200%;
          animation: infinite-scroll 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default AboutPage;
