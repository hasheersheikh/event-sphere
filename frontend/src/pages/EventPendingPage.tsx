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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 mt-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          <div className="bg-card border border-border p-12 rounded-[2.5rem] text-center backdrop-blur-3xl relative overflow-hidden shadow-2xl">
            {/* Background Accent */}
            <div className="absolute -top-32 -right-32 w-80 h-80 bg-primary/10 blur-[120px] rounded-full" />
            <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-orange-500/5 blur-[120px] rounded-full" />

            <div className="relative z-10">
              <div className="inline-flex items-center justify-center h-28 w-28 rounded-full bg-primary/10 border border-primary/20 mb-8 shadow-inner">
                <CheckCircle2 className="h-14 w-14 text-primary animate-pulse" />
              </div>

              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic mb-6 leading-none">
                Event <br />
                <span className="text-primary">Initialized.</span>
              </h1>

              <div className="flex items-center justify-center gap-3 mb-10">
                <div className="bg-orange-500/10 border border-orange-500/20 px-8 py-2.5 rounded-full flex items-center gap-3 shadow-lg shadow-orange-500/5">
                  <Clock className="h-4 w-4 text-orange-500" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500">
                    Awaiting Administrative Authorization
                  </span>
                </div>
              </div>

              <p className="text-muted-foreground font-bold text-lg leading-relaxed mb-12 max-w-lg mx-auto italic">
                Your event has been successfully queued for deployment. To maintain 
                platform operational standards, all listings undergo high-frequency moderation 
                review.
                <span className="block mt-6 text-muted-foreground/40 text-[10px] uppercase font-black tracking-[0.2em] not-italic underline decoration-primary underline-offset-8">
                  Security verification complete: Node Pulse-Gamma
                </span>
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Link to="/portal/manager">
                  <Button className="w-full h-16 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 group">
                    <LayoutDashboard className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                    Manager Command
                  </Button>
                </Link>
                <Link to="/">
                  <Button
                    variant="outline"
                    className="w-full h-16 rounded-2xl border-border bg-muted/50 font-black uppercase tracking-widest hover:bg-muted transition-all hover:scale-[1.02] group"
                  >
                    <Home className="h-5 w-5 mr-3 transition-transform group-hover:scale-110" />
                    Main Terminal
                  </Button>
                </Link>
              </div>

              <div className="mt-12 pt-12 border-t border-border/50 flex items-center justify-center gap-4 text-muted-foreground/30">
                <ShieldCheck className="h-4 w-4" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">
                  Encrypted Protocol Verified
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
