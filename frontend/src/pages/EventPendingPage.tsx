import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  Home,
  LayoutDashboard,
  Clock,
  ShieldCheck,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const EventPendingPage = () => {
  const { id } = useParams();

  useEffect(() => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function () {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-white">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-zinc-900/50 border border-white/10 p-12 rounded-[3rem] text-center backdrop-blur-xl relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 blur-[100px] rounded-full" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-orange-500/10 blur-[100px] rounded-full" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center h-24 w-24 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>

              <h1 className="text-4xl md:text-5xl font-black brand-font uppercase tracking-tighter italic mb-6">
                Event Created{" "}
                <span className="text-emerald-500">Successfully!</span>
              </h1>

              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="bg-orange-500/10 border border-orange-500/20 px-6 py-2 rounded-full flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-xs font-black uppercase tracking-widest text-orange-500">
                    Pending Admin Approval
                  </span>
                </div>
              </div>

              <p className="text-zinc-400 font-medium text-lg leading-relaxed mb-12 max-w-lg mx-auto italic">
                Your production has been successfully initialized. To maintain
                platform quality, all events undergo a high-frequency moderation
                review.
                <span className="block mt-4 text-zinc-500 text-sm non-italic">
                  The Pulse Council will authorize your listing within 24 hours.
                </span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/portal/manager">
                  <Button className="w-full h-16 rounded-2xl bg-white text-black font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-black transition-all group">
                    <LayoutDashboard className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                    Manager Portal
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="w-full h-16 rounded-2xl border-white/10 bg-white/5 font-black uppercase tracking-widest hover:bg-white/10 transition-all group"
                  >
                    <Home className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                    Back to Terminal
                  </Button>
                </Link>
              </div>

              <div className="mt-12 pt-12 border-t border-white/5 flex items-center justify-center gap-4 text-zinc-600">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">
                  Encrypted Pulse Validation
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default EventPendingPage;
