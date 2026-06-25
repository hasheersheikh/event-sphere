import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Instagram, 
  Zap, 
  Target, 
  Rocket, 
  CheckCircle2, 
  ArrowRight,
  Send,
  Calendar,
  Phone,
  AtSign,
  TrendingUp,
  Users,
  BarChart3,
  Play,
  Star,
  ExternalLink,
  Sparkles,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { motion, useMotionValue, useMotionTemplate } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import InfluencerSlider from "@/components/home/InfluencerSlider";

const PLANS = [
  {
    id: "starter",
    name: "Starter Sync",
    price: "₹1,499",
    description: "Ideal for local hype and initial traction.",
    features: [
      "1 Targeted Instagram Post",
      "2 Strategic Stories",
      "Basic Analytics Report",
      "City-specific Tagging"
    ],
    icon: AtSign,
    color: "from-cyan-500/20 to-blue-500/20",
    glowClass: "shadow-[0_0_30px_rgba(6,182,212,0.08)] hover:border-cyan-500/30",
    selectedGlowClass: "border-neon-cyan shadow-[0_0_40px_rgba(6,182,212,0.25)]",
    spotlightColor: "rgba(6, 182, 212, 0.1)",
    accentColor: "text-cyan-500",
    badgeColor: "bg-cyan-500/10 text-cyan-500 border border-cyan-500/20",
    btnSelected: "bg-cyan-500 text-white hover:bg-cyan-600 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
  },
  {
    id: "velocity",
    name: "Viral Velocity",
    price: "₹3,999",
    description: "Maximum momentum for high-capacity events.",
    features: [
      "1 High-Impact Reel",
      "5 Story Series with CTAs",
      "Newsletter Feature",
      "WhatsApp Group Blast",
      "Detailed Engagement Analysis"
    ],
    icon: Zap,
    color: "from-pink-500/20 to-purple-500/20",
    popular: true,
    glowClass: "shadow-[0_0_30px_rgba(236,72,153,0.08)] hover:border-pink-500/30",
    selectedGlowClass: "border-neon-pink shadow-[0_0_40px_rgba(236,72,153,0.3)]",
    spotlightColor: "rgba(236, 72, 153, 0.15)",
    accentColor: "text-pink-500",
    badgeColor: "bg-neon-pink text-black font-extrabold",
    btnSelected: "bg-neon-pink text-black hover:bg-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
  },
  {
    id: "elite",
    name: "Elite Influence",
    price: "Custom",
    description: "The ultimate exposure package for premier productions.",
    features: [
      "Influencer Collaboration",
      "Full Media Coverage",
      "Top-spot Carousel Placement",
      "Dedicated Ad Campaign",
      "White-glove Marketing Support"
    ],
    icon: Rocket,
    color: "from-orange-500/20 to-amber-500/20",
    glowClass: "shadow-[0_0_30px_rgba(249,115,22,0.08)] hover:border-orange-500/30",
    selectedGlowClass: "border-neon-orange shadow-[0_0_40px_rgba(249,115,22,0.25)]",
    spotlightColor: "rgba(249, 115, 22, 0.1)",
    accentColor: "text-orange-500",
    badgeColor: "bg-orange-500/10 text-orange-500 border border-orange-500/20",
    btnSelected: "bg-orange-500 text-white hover:bg-orange-600 shadow-[0_0_15px_rgba(249,115,22,0.4)]"
  }
];

const STRATEGIES = [
  {
    title: "Precision Geofencing",
    description: "We target users within a 15-30km radius of your venue, ensuring your ads reach people who can actually attend.",
    icon: Target
  },
  {
    title: "Vibe-Match Influencers",
    description: "Our engine connects you with creators whose audience demographic perfectly matches your event's genre.",
    icon: Users
  },
  {
    title: "High-Retention Content",
    description: "We don't just post; we create scroll-stopping Reels designed for maximum engagement and viral potential.",
    icon: TrendingUp
  },
  {
    title: "Data-Driven ROI",
    description: "Track every click and conversion with detailed reports. We optimize campaigns in real-time for best results.",
    icon: BarChart3
  }
];

interface ShowcaseVideo {
  _id: string;
  platform: "instagram" | "youtube";
  videoId: string;
  label?: string;
}

interface PlanCardProps {
  plan: typeof PLANS[0];
  isSelected: boolean;
  onClick: () => void;
  idx: number;
}

const PlanCard = ({ plan, isSelected, onClick, idx }: PlanCardProps) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  const iconVariants = {
    initial: { y: 0 },
    animate: {
      y: [0, -6, 0],
      transition: {
        duration: 4 + idx,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const checkVariants = {
    hovered: { scale: 1.15, rotate: 5, transition: { type: "spring", stiffness: 300 } },
    normal: { scale: 1, rotate: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: idx * 0.1,
        ease: [0.16, 1, 0.3, 1]
      }}
      whileHover={{ y: -8, transition: { duration: 0.2, ease: "easeOut" } }}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      className={`relative group cursor-pointer rounded-2xl md:rounded-[2.5rem] border-2 p-5 md:p-8 flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-md bg-card/40 ${
        isSelected
          ? plan.selectedGlowClass
          : `border-border/60 hover:border-transparent hover:shadow-2xl ${plan.glowClass}`
      }`}
    >
      <motion.div
        className="absolute inset-0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              350px circle at ${mouseX}px ${mouseY}px,
              ${plan.spotlightColor},
              transparent 80%
            )
          `
        }}
      />

      <div className={`absolute -right-12 -top-12 h-32 w-32 rounded-full blur-[60px] opacity-20 transition-all duration-700 group-hover:scale-125 pointer-events-none z-0 bg-gradient-to-br ${plan.color}`} />

      {plan.popular && (
        <motion.div 
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute top-5 right-6 text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg z-10 flex items-center gap-1.5 ${plan.badgeColor}`}
        >
          <Sparkles className="h-3 w-3 animate-pulse" />
          Recommended
        </motion.div>
      )}

      <div className="relative z-10 flex flex-col flex-1">
        <motion.div
          variants={iconVariants}
          initial="initial"
          animate="animate"
          className={`h-12 w-12 md:h-14 md:w-14 rounded-xl md:rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-5 md:mb-8 shadow-inner border border-white/5 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/5 hover:bg-white/10 transition-colors" />
          <plan.icon className={`h-5 w-5 md:h-6 md:w-6 relative z-10 transition-colors duration-300 ${isSelected ? plan.accentColor : "text-muted-foreground group-hover:text-foreground"}`} />
        </motion.div>

        <h3 className="text-xl md:text-2xl font-black brand-font uppercase tracking-tighter italic mb-1.5 md:mb-2 group-hover:text-primary transition-colors">
          {plan.name}
        </h3>

        <div className="flex items-baseline gap-1.5 mb-4 md:mb-6">
          <span className="text-3xl md:text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {plan.price}
          </span>
          {plan.price !== "Custom" && (
            <span className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-wider">
              / Event
            </span>
          )}
        </div>

        <p className="text-[11px] md:text-[12px] font-medium text-muted-foreground leading-relaxed mb-5 md:mb-8 min-h-[32px] md:min-h-[36px]">
          {plan.description}
        </p>

        <div className="h-[1px] w-full bg-border/40 mb-5 md:mb-8" />

        <ul className="space-y-3 md:space-y-4 mb-6 md:mb-10 flex-1">
          {plan.features.map((feature, fIdx) => (
            <motion.li
              key={fIdx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 + fIdx * 0.08, ease: "easeOut" }}
              className="flex items-start gap-2 md:gap-3 text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-foreground/80 leading-tight group/item"
            >
              <motion.div
                variants={checkVariants}
                animate="normal"
                whileHover="hovered"
                className="shrink-0 mt-0.5"
              >
                <CheckCircle2 className={`h-3.5 w-3.5 md:h-4 md:w-4 shrink-0 transition-colors duration-300 ${isSelected ? plan.accentColor : "text-primary"}`} />
              </motion.div>
              <span className="transition-colors duration-300 group-hover/item:text-foreground">
                {feature}
              </span>
            </motion.li>
          ))}
        </ul>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={`w-full rounded-xl md:rounded-2xl h-12 md:h-14 flex items-center justify-center border-2 font-black uppercase tracking-widest text-[10px] md:text-[11px] italic transition-all duration-300 select-none ${
            isSelected
              ? `${plan.btnSelected} border-transparent`
              : "border-border/80 hover:border-foreground/20 hover:bg-foreground/5 bg-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {isSelected ? (
            <span className="flex items-center gap-1.5 md:gap-2">
              Selected <span className="hidden sm:inline">Plan</span> <CheckCircle2 className="h-3.5 w-3.5 md:h-4 md:w-4" />
            </span>
          ) : (
            "Select Plan"
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

const BoostMarketingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const { data: showcaseVideos = [] } = useQuery<ShowcaseVideo[]>({
    queryKey: ["showcase-videos"],
    queryFn: async () => {
      const { data } = await api.get("/showcase-videos");
      return data;
    },
  });



  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="px-4 md:p-6 space-y-12 md:space-y-24 max-w-[1440px] mx-auto pb-16 md:pb-24 pt-16 md:pt-20">
        {/* Public Landing Header */}
        <section className="pt-6 md:pt-12 pb-4 md:pb-6 space-y-4 md:space-y-5 text-center px-2">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] md:tracking-[0.2em] italic"
            >
              <Sparkles className="h-2.5 md:h-3 w-2.5 md:w-3" />
              Marketing Engine v2.0
            </motion.div>
            <div className="space-y-3 md:space-y-4">
              <h1 className="text-3xl sm:text-4xl md:text-6xl lg:text-8xl font-black brand-font uppercase tracking-tighter italic leading-[0.85] md:leading-[0.9] text-foreground text-center">
                Boost Your <span className="text-primary underline decoration-primary/20 underline-offset-[8px] md:underline-offset-[12px]">Event.</span>
              </h1>
              <p className="text-muted-foreground font-medium uppercase tracking-[0.15em] md:tracking-[0.2em] text-[9px] md:text-xs max-w-xl mx-auto leading-relaxed text-center px-4">
                Get more reach and ticket sales through our elite Instagram marketing partners and influencer network.
              </p>
            </div>
            <div className="flex justify-center pt-4 md:pt-8">
               <Link to={`/boost/request${selectedPlan ? `?plan=${selectedPlan}` : ""}`}>
                <Button className="bg-neon-lime text-black h-12 md:h-16 px-8 md:px-12 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-[11px] italic flex items-center gap-2 md:gap-3 shadow-xl hover:shadow-2xl hover:bg-neon-lime/90 hover:scale-105 transition-all">
                  Start Marketing Now <ArrowRight className="h-3.5 md:h-4 w-3.5 md:w-4" />
                </Button>
              </Link>
            </div>
        </section>

        {/* Influencer Section */}
        <InfluencerSlider />

        {/* Plans Section */}
        <section className="space-y-8 md:space-y-12 px-2">
          <div className="flex flex-col gap-1 items-center md:items-start text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-black brand-font uppercase tracking-tighter italic">Select Your Engine</h2>
            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] md:tracking-[0.2em]">Choose a plan that fits your event scale</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-8">
            {PLANS.map((plan, idx) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isSelected={selectedPlan === plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                idx={idx}
              />
            ))}
          </div>
        </section>

        {/* Showcase Section */}
        <section className="space-y-8 md:space-y-12 px-2">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-2xl md:text-3xl font-black brand-font uppercase tracking-tighter italic text-center">Marketing Showcase</h2>
            <p className="text-[9px] md:text-[10px] font-black text-muted-foreground uppercase tracking-[0.15em] md:tracking-[0.2em] text-center">Tap any reel to see the magic in action</p>
          </div>

          {showcaseVideos.length === 0 ? (
            <div className="py-12 md:py-16 text-center border border-dashed border-border/30 rounded-3xl">
              <p className="text-xs md:text-sm text-muted-foreground font-medium">No showcase videos yet. Add some from the admin portal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8 px-2 md:px-4">
              {showcaseVideos.map((v, idx) => (
                <motion.div
                  key={v._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="group flex flex-col w-full max-w-[400px] mx-auto rounded-2xl md:rounded-3xl overflow-hidden border border-border/60 hover:border-border transition-all duration-300 hover:shadow-[0_0_40px_rgba(0,0,0,0.3)] bg-card"
                >
                  {/* Platform header bar */}
                  <div className="flex items-center justify-between px-3 md:px-4 py-2.5 md:py-3 border-b border-border/40">
                    <div className="flex items-center gap-2 md:gap-2.5">
                      {v.platform === "instagram" ? (
                        <div className="h-6 w-6 md:h-7 md:w-7 rounded-lg flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600 shadow-sm">
                          <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                        </div>
                      ) : (
                        <div className="h-6 w-6 md:h-7 md:w-7 rounded-lg flex items-center justify-center bg-red-600 shadow-sm">
                          <Play className="h-3.5 w-3.5 md:h-4 md:w-4 text-white fill-white" />
                        </div>
                      )}
                      <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                        {v.label || (v.platform === "instagram" ? "Instagram Reel" : "YouTube Short")}
                      </span>
                    </div>
                    <a
                      href={v.platform === "instagram"
                        ? `https://www.instagram.com/reel/${v.videoId}/`
                        : `https://www.youtube.com/shorts/${v.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[8px] md:text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                    >
                      Open <ExternalLink className="h-2.5 w-2.5 md:h-3 md:w-3" />
                    </a>
                  </div>

                  {/* Embed */}
                  <iframe
                    src={v.platform === "instagram"
                      ? `https://www.instagram.com/reel/${v.videoId}/embed/`
                      : `https://www.youtube.com/embed/${v.videoId}`}
                    className="w-full border-0"
                    style={{ height: 450 }}
                    allowFullScreen
                    loading="lazy"
                    title={v.label || v.videoId}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Strategy Section */}
        <section className="bg-muted/30 rounded-2xl md:rounded-[3rem] p-6 md:p-12 lg:p-16 border border-border/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-center">
            <div className="space-y-6 md:space-y-8">
              <div className="space-y-2 md:space-y-3">
                <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase tracking-[0.15em] md:tracking-[0.2em] text-[8px] px-3 py-1 italic">Our Strategy</Badge>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black brand-font uppercase tracking-tighter italic leading-[0.9]">How We Pulse Your Event.</h2>
                <p className="text-xs md:text-sm font-medium text-muted-foreground leading-relaxed max-w-md">
                  We don't just "post" on social media. We build a comprehensive digital ecosystem around your event to drive ticket sales.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-8">
                {STRATEGIES.map((strat, idx) => (
                  <div key={idx} className="space-y-2 md:space-y-3">
                    <div className="h-9 w-9 md:h-10 md:w-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                      <strat.icon className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                    </div>
                    <h4 className="text-[11px] md:text-xs font-black uppercase tracking-tight italic">{strat.title}</h4>
                    <p className="text-[9px] md:text-[10px] font-medium text-muted-foreground leading-relaxed">{strat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-2 md:-inset-4 bg-gradient-to-tr from-primary/10 to-transparent blur-2xl md:blur-3xl opacity-50" />
              <div className="relative aspect-square rounded-2xl md:rounded-3xl overflow-hidden border border-border shadow-xl md:shadow-2xl bg-card p-5 md:p-8 flex flex-col justify-center gap-4 md:gap-6">
                 <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      <span>Reach Growth</span>
                      <span className="text-primary">+420%</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "85%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary"
                      />
                    </div>
                 </div>
                 <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      <span>Ticket Conversion</span>
                      <span className="text-primary">+12.5%</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "65%" }}
                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-primary"
                      />
                    </div>
                 </div>
                 <div className="space-y-1.5 md:space-y-2">
                    <div className="flex items-center justify-between text-[9px] md:text-[10px] font-black uppercase tracking-widest">
                      <span>Audience Retention</span>
                      <span className="text-primary">94%</span>
                    </div>
                    <div className="h-1.5 md:h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: "94%" }}
                        transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                        className="h-full bg-primary"
                      />
                    </div>
                 </div>
                 <div className="mt-3 md:mt-4 pt-4 md:pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex -space-x-2 md:-space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-7 w-7 md:h-8 md:w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[9px] md:text-[10px] font-black">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Trusted by 200+ Promoters</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="max-w-5xl mx-auto px-2">
          <div className="bg-neon-lime rounded-2xl md:rounded-[3.5rem] p-8 md:p-16 text-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 md:p-16 opacity-10 rotate-12 transition-transform group-hover:rotate-0 pointer-events-none">
              <Rocket size={150} className="md:hidden" />
              <Rocket size={250} className="hidden md:block" />
            </div>

            <div className="relative z-10 space-y-5 md:space-y-8">
              <h2 className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black brand-font uppercase tracking-tighter italic leading-none text-center md:text-left">Ready to Go Viral?</h2>
              <p className="text-sm md:text-lg lg:text-xl font-bold uppercase tracking-tight italic opacity-80 max-w-lg leading-relaxed text-center md:text-left mx-auto md:mx-0">
                Initialize your marketing engine today and watch your ticket sales skyrocket.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-2 md:pt-4 justify-center md:justify-start">
                <Link to={`/boost/request${selectedPlan ? `?plan=${selectedPlan}` : ""}`}>
                  <Button className="bg-black text-white hover:bg-zinc-800 h-12 md:h-16 px-8 md:px-12 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs italic flex items-center gap-2 md:gap-3 shadow-lg md:shadow-xl">
                    Start Marketing Now <ArrowRight className="h-3.5 md:h-4 w-3.5 md:w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BoostMarketingPage;
