import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Zap, 
  QrCode, 
  Lock, 
  ArrowRight,
  ArrowLeft,
  Server,
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
      stats: "2.4k Organizers",
    },
    {
      title: "Scanner Gate",
      description: "Volunteer entry point for real-time ticket validation.",
      icon: QrCode,
      href: "/volunteer-login",
      color: "bg-blue-500",
      stats: "Gate Monitoring",
    },
    {
      title: "Platform Admin",
      description: "Executive oversight, moderation, and system configuration.",
      icon: Lock,
      href: "/admin-auth",
      color: "bg-orange-500",
      stats: "System Control",
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30 flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <Link to="/" className="inline-flex items-center gap-3 group mb-8">
            <div className="h-12 w-12 bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center rounded-2xl group-hover:border-primary/50 transition-all duration-500">
              <PulseLogo size={28} />
            </div>
          </Link>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted/50 border border-border rounded-full text-[11px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6 shadow-sm">
            <Server className="h-3.5 w-3.5 text-primary" />
            Internal Systems Control
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.85] mb-6">
            Staff <span className="text-primary truncate">Portal.</span>
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto text-base font-medium italic">
            Select your access level to enter the City Pulse management environment. Authorized personnel only.
          </p>
        </div>

        {/* Selection Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          {staffTypes.map((staff, i) => (
            <motion.div
              key={staff.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link 
                to={staff.href}
                className="group relative block h-full p-10 bg-card border border-border rounded-[3rem] shadow-xl hover:bg-muted/50 hover:border-primary/30 transition-all duration-500 overflow-hidden"
              >
                {/* Hover Background Glow */}
                <div className={`absolute -top-24 -right-24 w-48 h-48 ${staff.color} opacity-0 group-hover:opacity-10 blur-[60px] transition-opacity duration-500`} />
                
                <div className="relative z-10 flex flex-col h-full">
                  <div className={`h-20 w-20 ${staff.color} rounded-3xl flex items-center justify-center mb-10 shadow-2xl`}>
                    <staff.icon className="h-10 w-10 text-black" />
                  </div>
                  
                  <div className="mb-10">
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mb-4 group-hover:text-primary transition-colors">
                      {staff.title}
                    </h3>
                    <p className="text-muted-foreground text-sm leading-relaxed font-medium italic">
                      {staff.description}
                    </p>
                  </div>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors italic">
                      {staff.stats}
                    </span>
                    <div className="h-12 w-12 rounded-full border border-border flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-all">
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-16 text-center border-t border-white/5 pt-10">
          <Link
            to="/auth"
            className="inline-flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 hover:text-white transition-colors group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Return to Public Access
          </Link>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/30">
        <ShieldCheck className="h-4 w-4" />
        Verified Security Node
      </div>
    </div>
  );
};

export default StaffLoginPage;
