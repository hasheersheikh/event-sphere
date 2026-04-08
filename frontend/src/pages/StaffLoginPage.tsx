import { motion } from "framer-motion";
import {
  ShieldCheck,
  Zap,
  QrCode,
  Lock,
  ArrowRight,
  ArrowLeft,
  Server,
  Store,
} from "lucide-react";
import { Link } from "react-router-dom";
import PulseLogo from "@/components/layout/PulseLogo";

const StaffLoginPage = () => {
  const staffTypes = [
    {
      title: "Event Manager",
      description: "Control center for event creation, ticketing, and analytics.",
      icon: Zap,
      href: "/manager/login",
      color: "bg-emerald-500",
      accent: "text-emerald-500",
      stats: "2.4k Organizers",
    },
    {
      title: "Store Owner",
      description: "Manage your local store, products, and incoming orders.",
      icon: Store,
      href: "/store-owner/login",
      color: "bg-amber-500",
      accent: "text-amber-500",
      stats: "Local Commerce",
    },
    {
      title: "Scanner Gate",
      description: "Volunteer entry point for real-time ticket validation.",
      icon: QrCode,
      href: "/volunteer-login",
      color: "bg-blue-500",
      accent: "text-blue-500",
      stats: "Gate Monitoring",
    },
    {
      title: "Platform Admin",
      description: "Executive oversight, moderation, and system configuration.",
      icon: Lock,
      href: "/admin-auth",
      color: "bg-orange-500",
      accent: "text-orange-500",
      stats: "System Control",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col items-center justify-center p-6 md:p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-blue-500/10 rounded-full blur-[160px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 md:mb-24">
          <Link to="/" className="inline-flex items-center gap-3 group mb-12">
            <div className="h-10 w-10 bg-white/5 backdrop-blur-3xl border border-white/10 flex items-center justify-center rounded-xl group-hover:border-primary/50 transition-all duration-500 shadow-2xl">
              <PulseLogo size={24} />
            </div>
            <span className="text-xl font-black uppercase tracking-tighter italic">City Pulse</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted/30 border border-border/50 rounded-full text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-8 shadow-sm">
            <Server className="h-3 w-3 text-primary" />
            Internal Systems Control
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.8] mb-8">
            Staff <span className="text-primary">Portal.</span>
          </h1>
          <p className="text-muted-foreground/80 max-w-md mx-auto text-sm font-bold italic tracking-wide leading-relaxed">
            Select your specialized access node to enter the City Pulse management cluster. Authorized personnel only.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 px-2">
          {staffTypes.map((staff, i) => (
            <motion.div
              key={staff.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.6, ease: "easeOut" }}
            >
              <Link 
                to={staff.href}
                className="group relative block h-full p-8 bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] shadow-lg hover:shadow-2xl hover:border-primary/20 transition-all duration-500 overflow-hidden"
              >
                {/* Hover Background Glow */}
                <div className={`absolute -top-16 -right-16 w-32 h-32 ${staff.color} opacity-0 group-hover:opacity-10 blur-[40px] transition-opacity duration-700`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`h-14 w-14 ${staff.color} rounded-2xl flex items-center justify-center mb-10 shadow-xl group-hover:scale-110 transition-transform duration-500`}>
                    <staff.icon className="h-7 w-7 text-black" />
                  </div>
                  
                  <div className="mb-10">
                    <h3 className="text-2xl font-black uppercase italic tracking-tighter mb-3 group-hover:text-primary transition-colors">
                      {staff.title}
                    </h3>
                    <p className="text-muted-foreground/70 text-xs leading-relaxed font-bold italic">
                      {staff.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60 group-hover:text-foreground transition-colors italic">
                      {staff.stats}
                    </span>
                    <div className="h-10 w-10 rounded-full border border-border/50 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all duration-500 group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Internal Card Decor */}
                <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity pointer-events-none">
                  <staff.icon className="h-20 w-20" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-20 text-center">
          <Link
            to="/auth"
            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.4em] text-zinc-600 hover:text-white transition-colors group italic"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Return to Public Access
          </Link>
        </div>
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.5em] text-muted-foreground/20 italic select-none">
        <ShieldCheck className="h-3 w-3" />
        High security verification node
      </div>
    </div>
  );
};

export default StaffLoginPage;
