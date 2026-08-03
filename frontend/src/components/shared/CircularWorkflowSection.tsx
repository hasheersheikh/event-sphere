import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { 
  Compass, 
  Ticket, 
  Sparkles, 
  CalendarDays, 
  Users, 
  MapPin, 
  ArrowRight,
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface PublicStats {
  events: number;
  attendees: number;
  cities: number;
}

export default function CircularWorkflowSection() {
  // Query backend public stats
  const { data: stats, isLoading } = useQuery<PublicStats>({
    queryKey: ["publicStats"],
    queryFn: async () => {
      const { data } = await api.get("/events/stats");
      return data;
    },
    placeholderData: {
      events: 10000,
      attendees: 500000,
      cities: 200
    },
    refetchInterval: 30000 // refetch every 30 seconds to keep stats updated
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M+";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + "K+";
    }
    return num.toString() + "+";
  };

  const steps = [
    {
      id: "01",
      title: "Discover Events",
      subtitle: "Discover Events you like",
      description: "Find the absolute best concerts, secret parties, and local workshops happening right around you.",
      icon: Compass,
      color: "from-pink-500 to-rose-500",
      glow: "rgba(244,63,94,0.15)"
    },
    {
      id: "02",
      title: "Book Your Spot",
      subtitle: "Book Your Spot",
      description: "Purchase tickets instantly with secure one-tap checkout. No booking fees, no complications.",
      icon: Ticket,
      color: "from-neon-lime to-emerald-500",
      glow: "rgba(180,255,0,0.15)"
    },
    {
      id: "03",
      title: "Connect",
      subtitle: "Get Memories & Friends",
      description: "Attend events, share vibes with awesome folks, and bring home epic memories that last forever.",
      icon: Sparkles,
      color: "from-purple-500 to-indigo-600",
      glow: "rgba(168,85,247,0.15)"
    }
  ];

  return (
    <section className="py-12 md:py-20 relative overflow-hidden bg-background border-t border-border/20 selection:bg-neon-lime/20">
      {/* Background Neon Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-neon-lime/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/10 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="container px-3 md:px-4 relative z-10 space-y-16 md:space-y-24">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-neon-lime/10 border border-neon-lime/20 rounded-full text-neon-lime text-[9px] font-black uppercase tracking-[0.2em] leading-none"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon-lime" />
            The City Experience
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-display text-3xl sm:text-4xl md:text-6xl font-black tracking-tighter uppercase leading-[0.88] text-foreground"
          >
            We Help you to <span className="text-neon-lime italic">catch the City Pulse</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-muted-foreground text-sm md:text-base max-w-xl mx-auto font-medium"
          >
            A seamless bridge from discovery to core memory. Here is how it syncs.
          </motion.p>
        </div>

        {/* Three Step Circular Journey */}
        <div className="relative grid md:grid-cols-3 gap-10 md:gap-16 lg:gap-16 max-w-5xl mx-auto">
          {/* Connecting SVG Path on Desktop */}
          <div className="hidden md:block absolute top-[90px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-pink-500 via-neon-lime to-purple-500 opacity-20 -z-10" />

          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                {/* Circular Node */}
                <div 
                  className={cn(
                    "relative w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 rounded-full flex items-center justify-center border-2 border-border/40 bg-card/60 backdrop-blur-xl transition-all duration-500",
                    "group-hover:border-transparent group-hover:scale-105"
                  )}
                  style={{
                    boxShadow: `0 0 0 rgba(0,0,0,0)`,
                  }}
                  whileHover={{
                    boxShadow: `0 20px 40px ${step.glow}`,
                  }}
                >
                  {/* Hover background gradient border */}
                  <div className={cn(
                    "absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 p-[2px]",
                    "bg-gradient-to-br", step.color
                  )}>
                    <div className="w-full h-full rounded-full bg-background" />
                  </div>

                  <div className="space-y-2 flex flex-col items-center">
                    {/* Pulsing Icon Ring */}
                    <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-muted/40 flex items-center justify-center group-hover:bg-muted/10 transition-colors">
                      <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-foreground group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest block">
                      Step {step.id}
                    </span>
                  </div>
                </div>

                {/* Text Content */}
                <div className="mt-8 space-y-2.5 max-w-xs">
                  <h3 className="text-xl font-black tracking-tight text-foreground uppercase italic group-hover:text-neon-lime transition-colors">
                    {step.subtitle}
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Customizable Stats Circles */}
        <div className="pt-8 border-t border-border/10">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              {
                label: "Live Events",
                value: stats?.events ? formatNumber(stats.events) : "10K+",
                icon: CalendarDays,
                borderColor: "group-hover:border-pink-500/40 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.1)]",
                textColor: "text-pink-500"
              },
              {
                label: "Happy Attendees",
                value: stats?.attendees ? formatNumber(stats.attendees) : "500K+",
                icon: Users,
                borderColor: "group-hover:border-neon-lime/40 group-hover:shadow-[0_0_25px_rgba(180,255,0,0.1)]",
                textColor: "text-neon-lime"
              },
              {
                label: "Cities Connected",
                value: stats?.cities ? formatNumber(stats.cities) : "200+",
                icon: MapPin,
                borderColor: "group-hover:border-purple-500/40 group-hover:shadow-[0_0_25px_rgba(168,85,247,0.1)]",
                textColor: "text-purple-500",
                colSpan: "col-span-2 md:col-span-1"
              }
            ].map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className={cn(
                    "group p-6 rounded-[2rem] border border-border/40 bg-card/30 backdrop-blur-md transition-all duration-300",
                    stat.colSpan
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
                        {stat.label}
                      </p>
                      <h4 className="text-2xl md:text-3xl font-black tracking-tighter text-foreground italic uppercase">
                        {isLoading ? (
                          <span className="inline-block h-6 w-16 bg-muted animate-pulse rounded" />
                        ) : (
                          stat.value
                        )}
                      </h4>
                    </div>
                    <div className={cn(
                      "w-12 h-12 rounded-2xl bg-muted/40 flex items-center justify-center border border-border/10 transition-all duration-300",
                      stat.borderColor
                    )}>
                      <StatIcon className={cn("h-5 w-5", stat.textColor)} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Organizer Section: Listing CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-border/40 bg-card/60 backdrop-blur-xl p-8 md:p-12 text-center max-w-5xl mx-auto shadow-2xl"
        >
          {/* Decorative glowing gradient backdrop */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-neon-lime/5 blur-[80px] pointer-events-none rounded-full" />
          
          <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-neon-lime/10 border border-neon-lime/20 rounded-full text-neon-lime text-[9px] font-black uppercase tracking-[0.25em] leading-none">
              <Zap className="h-3 w-3 text-neon-lime" />
              For Creators & Organizers
            </div>
            
            <div className="space-y-2">
              <h3 className="font-display text-2xl md:text-4xl font-black tracking-tighter uppercase leading-none text-foreground">
                List Your Events, Venues, Stores/ Artists,<br />
                Adventure Camps, and Sports Activities
              </h3>
              <p className="text-muted-foreground text-xs md:text-sm font-bold uppercase tracking-wider italic text-neon-lime">
                Less than 2 Minutes and maximize your Impact
              </p>
            </div>

            <div className="pt-2 flex justify-center">
              <Link to="/auth" className="relative group">
                <Button className="h-14 px-10 rounded-full font-black uppercase tracking-widest text-xs bg-neon-lime text-black hover:bg-[#D4FF00] hover:shadow-[0_8px_30px_rgba(180,255,0,0.4)] border-none transition-all flex items-center gap-2 duration-300">
                  Try Listing Now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 duration-300" />
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
