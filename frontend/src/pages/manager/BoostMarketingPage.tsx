import { useState, useEffect } from "react";
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

const SHOWCASE_REELS = [
  "DSrwiaUDZEQ", // User requested: GulNaz Gull recap
  "C9tV3lYiRwL", // Viral: Tomorrowland 2024 Alesso Recap
  "C9vTMylsR8I"  // Viral: Tomorrowland Symphony of Unity
];

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
      className={`relative group cursor-pointer rounded-[2.5rem] border-2 p-8 flex flex-col overflow-hidden transition-all duration-300 backdrop-blur-md bg-card/40 ${
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
          className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-8 shadow-inner border border-white/5 relative overflow-hidden`}
        >
          <div className="absolute inset-0 bg-white/5 hover:bg-white/10 transition-colors" />
          <plan.icon className={`h-6 w-6 relative z-10 transition-colors duration-300 ${isSelected ? plan.accentColor : "text-muted-foreground group-hover:text-foreground"}`} />
        </motion.div>

        <h3 className="text-2xl font-black brand-font uppercase tracking-tighter italic mb-2 group-hover:text-primary transition-colors">
          {plan.name}
        </h3>
        
        <div className="flex items-baseline gap-1.5 mb-6">
          <span className="text-4xl font-black italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
            {plan.price}
          </span>
          {plan.price !== "Custom" && (
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
              / Event
            </span>
          )}
        </div>

        <p className="text-[12px] font-medium text-muted-foreground leading-relaxed mb-8 min-h-[36px]">
          {plan.description}
        </p>

        <div className="h-[1px] w-full bg-border/40 mb-8" />

        <ul className="space-y-4 mb-10 flex-1">
          {plan.features.map((feature, fIdx) => (
            <motion.li 
              key={fIdx} 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 + fIdx * 0.08, ease: "easeOut" }}
              className="flex items-start gap-3 text-[10px] font-bold uppercase tracking-wide text-foreground/80 leading-tight group/item"
            >
              <motion.div 
                variants={checkVariants}
                animate="normal"
                whileHover="hovered"
                className="shrink-0 mt-0.5"
              >
                <CheckCircle2 className={`h-4 w-4 shrink-0 transition-colors duration-300 ${isSelected ? plan.accentColor : "text-primary"}`} />
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
          className={`w-full rounded-2xl h-14 flex items-center justify-center border-2 font-black uppercase tracking-widest text-[11px] italic transition-all duration-300 select-none ${
            isSelected 
              ? `${plan.btnSelected} border-transparent` 
              : "border-border/80 hover:border-foreground/20 hover:bg-foreground/5 bg-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          {isSelected ? (
            <span className="flex items-center gap-2">
              Selected Plan <CheckCircle2 className="h-4 w-4" />
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

  const { data: influencers = [], isLoading: influencersLoading } = useQuery<any[]>({
    queryKey: ["influencers", "public"],
    queryFn: async () => {
      const { data } = await api.get("/influencers");
      return data;
    },
  });

  useEffect(() => {
    // Re-process Instagram embeds when component mounts or reels change
    if ((window as any).instgrm) {
      (window as any).instgrm.Embeds.process();
    } else {
      // If script not loaded yet, add it
      const script = document.createElement("script");
      script.async = true;
      script.src = "//www.instagram.com/embed.js";
      document.body.appendChild(script);
      script.onload = () => {
        if ((window as any).instgrm) {
          (window as any).instgrm.Embeds.process();
        }
      };
    }
  }, []);

  return (
    <div className="bg-background min-h-screen">
      <Navbar />
      <div className="p-4 md:p-6 space-y-32 md:space-y-48 max-w-[1440px] mx-auto pb-48 pt-20">
        {/* Public Landing Header */}
        <section className="pt-24 pb-6 space-y-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] italic"
            >
              <Sparkles className="h-3 w-3" />
              Marketing Engine v2.0
            </motion.div>
            <div className="space-y-4">
              <h1 className="text-5xl md:text-8xl font-black brand-font uppercase tracking-tighter italic leading-[0.85] text-foreground text-center">
                Boost Your <span className="text-primary underline decoration-primary/20 underline-offset-[12px]">Event.</span>
              </h1>
              <p className="text-muted-foreground font-medium uppercase tracking-[0.2em] text-[10px] md:text-xs max-w-xl mx-auto leading-relaxed text-center">
                Get more reach and ticket sales through our elite Instagram marketing partners and influencer network.
              </p>
            </div>
            <div className="flex justify-center pt-8">
               <Link to={`/boost/request${selectedPlan ? `?plan=${selectedPlan}` : ""}`}>
                <Button className="bg-neon-lime text-black h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] italic flex items-center gap-3 shadow-2xl hover:bg-neon-lime/90 hover:scale-105 transition-all">
                  Start Marketing Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
        </section>

        {/* Plans Section */}
        <section className="space-y-12">
          <div className="flex flex-col gap-1 items-center md:items-start">
            <h2 className="text-3xl font-black brand-font uppercase tracking-tighter italic">Select Your Engine</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Choose a plan that fits your event scale</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

        {/* Influencer Section */}
        <section className="space-y-12 bg-muted/20 py-16 rounded-[4rem] border border-border/50">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-3xl font-black brand-font uppercase tracking-tighter italic text-center">Elite Creator Network</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Work with influencers who dominate your event's niche</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 max-w-7xl mx-auto">
            {influencersLoading ? (
              <div className="col-span-full flex flex-col items-center gap-4 py-10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Syncing with creators...</p>
              </div>
            ) : influencers.length > 0 ? (
              influencers.map((inf: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05, duration: 0.4 }}
                  whileHover={{ y: -8 }}
                  className="relative group bg-card/40 backdrop-blur-md border border-border/60 rounded-2xl overflow-hidden transition-all duration-300 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:border-primary/40 flex flex-col h-full"
                >
                  {/* Card Image Cover */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/20">
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/10 to-transparent z-10" />
                    
                    <img 
                      src={inf.image} 
                      alt={inf.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />

                    {/* Category Badge */}
                    <div className="absolute top-4 left-4 z-20">
                      <Badge className="bg-primary text-primary-foreground font-extrabold uppercase text-[8px] tracking-[0.15em] px-3 py-1.5 rounded-full border border-primary/20 shadow-md">
                        {inf.category || 'Other'}
                      </Badge>
                    </div>

                    {/* Reach Badge */}
                    <div className="absolute top-4 right-4 z-20">
                      <Badge variant="outline" className="bg-background/80 backdrop-blur-md text-foreground font-black uppercase text-[8px] tracking-[0.1em] px-3 py-1.5 rounded-full border border-border/50 shadow-md">
                        {inf.reach} REACH
                      </Badge>
                    </div>

                    {/* Star overlay badge */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-black h-12 w-12 rounded-full flex items-center justify-center shadow-2xl z-20 border-4 border-background opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100 transition-all duration-500">
                      <Star className="h-5 w-5 fill-black" />
                    </div>

                    {/* Text overlay on image bottom */}
                    <div className="absolute bottom-4 left-5 right-5 z-20">
                      <h4 className="text-lg font-black uppercase tracking-tight italic text-foreground leading-tight drop-shadow-sm">
                        {inf.name}
                      </h4>
                      <div className="flex items-center justify-between mt-1">
                        <p className="text-[10px] font-black text-primary uppercase tracking-widest">
                          {inf.handle}
                        </p>
                        {inf.instagramUrl && (
                          <a 
                            href={inf.instagramUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary transition-colors"
                            title="View Instagram"
                          >
                            <Instagram className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Card bottom details */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-black text-muted-foreground uppercase tracking-widest">Niche</span>
                      <span className="font-extrabold text-foreground uppercase tracking-tight italic bg-muted/60 px-3 py-1 rounded-lg">
                        {inf.niche}
                      </span>
                    </div>

                    {inf.instagramUrl && (
                      <a 
                        href={inf.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full h-10 rounded-xl bg-muted/40 hover:bg-primary border border-border/50 hover:border-transparent text-muted-foreground hover:text-primary-foreground transition-all text-[9px] font-black uppercase tracking-widest duration-300"
                      >
                        Instagram Profile <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-card/20 rounded-[2rem] border-2 border-dashed border-border/50">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">No creators in network yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* Showcase Section */}
        <section className="space-y-12">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-3xl font-black brand-font uppercase tracking-tighter italic text-center">Marketing Showcase</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Tap any reel to see the magic in action</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-12 px-4">
            {SHOWCASE_REELS.map((reelId, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex justify-center w-full"
              >
                <div className="w-full max-w-[400px] flex justify-center">
                  <blockquote 
                    className="instagram-media" 
                    data-instgrm-permalink={`https://www.instagram.com/reel/${reelId}/?utm_source=ig_embed&utm_campaign=loading`} 
                    data-instgrm-version="14" 
                    style={{ 
                      background: "#FFF", 
                      border: "0", 
                      borderRadius: "24px", 
                      boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)", 
                      margin: "1px", 
                      maxWidth: "400px", 
                      minWidth: "326px", 
                      padding: "0", 
                      width: "100%"
                    }}
                  >
                  <div style={{ padding: "16px" }}>
                    <a 
                      href={`https://www.instagram.com/reel/${reelId}/?utm_source=ig_embed&utm_campaign=loading`} 
                      style={{ background: "#FFFFFF", lineHeigh: "0", padding: "0 0", textAlign: "center", textDecoration: "none", width: "100%" }} 
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", flexGrow: "0", height: "40px", marginRight: "14px", width: "40px" }}></div>
                        <div style={{ display: "flex", flexDirection: "column", flexGrow: "1", justifyContent: "center" }}>
                          <div style={{ backgroundColor: "#F4F4F4", borderRadius: "4px", flexGrow: "0", height: "14px", marginBottom: "6px", width: "100px" }}></div>
                          <div style={{ backgroundColor: "#F4F4F4", borderRadius: "4px", flexGrow: "0", height: "14px", width: "60px" }}></div>
                        </div>
                      </div>
                      <div style={{ padding: "19% 0" }}></div>
                      <div style={{ display: "block", height: "50px", margin: "0 auto 12px", width: "50px" }}>
                        <svg width="50px" height="50px" viewBox="0 0 60 60" version="1.1" xmlns="https://www.w3.org/2000/svg" xmlnsXlink="https://www.w3.org/1999/xlink">
                          <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
                            <g transform="translate(-511.000000, -20.000000)" fill="#000000">
                              <g>
                                <path d="M556.869,30.41 C554.814,30.41 553.148,32.076 553.148,34.131 C553.148,36.186 554.814,37.852 556.869,37.852 C558.924,37.852 560.59,36.186 560.59,34.131 C560.59,32.076 558.924,30.41 556.869,30.41 M541,60.657 C535.114,60.657 530.342,55.887 530.342,50 C530.342,44.114 535.114,39.342 541,39.342 C546.887,39.342 551.658,44.114 551.658,50 C551.658,55.887 546.887,60.657 541,60.657 M541,33.886 C532.1,33.886 524.886,41.1 524.886,50 C524.886,58.899 532.1,66.113 541,66.113 C549.9,66.113 557.115,58.899 557.115,50 C557.115,41.1 549.9,33.886 541,33.886 M565.378,62.101 C565.244,65.022 564.756,66.606 564.346,67.663 C563.803,69.06 563.154,70.057 562.106,71.106 C561.058,72.155 560.06,72.803 558.662,73.347 C557.607,73.757 556.021,74.244 553.102,74.378 C549.944,74.521 548.997,74.552 541,74.552 C533.003,74.552 532.056,74.521 528.898,74.378 C525.979,74.244 524.393,73.757 523.338,73.347 C521.94,72.803 520.942,72.155 519.894,71.106 C518.846,70.057 518.197,69.06 517.654,67.663 C517.244,66.606 516.755,65.022 516.623,62.101 C516.479,58.943 516.448,57.996 516.448,50 C516.448,42.003 516.479,41.056 516.623,37.899 C516.755,34.978 517.244,33.391 517.654,32.338 C518.197,30.938 518.846,29.942 519.894,28.894 C520.942,27.846 521.94,27.196 523.338,26.654 C524.393,26.244 525.979,25.756 528.898,25.623 C532.057,25.479 533.004,25.448 541,25.448 C548.997,25.448 549.943,25.479 553.102,25.623 C556.021,25.756 557.607,26.244 558.662,26.654 C560.06,27.196 561.058,27.846 562.106,28.894 C563.154,29.942 563.803,30.938 564.346,32.338 C564.756,33.391 565.244,34.978 565.378,37.899 C565.522,41.056 565.552,42.003 565.552,50 C565.552,57.996 565.522,58.943 565.378,62.101 M570.82,37.631 C570.674,34.438 570.167,32.258 569.425,30.349 C568.659,28.377 567.633,26.702 565.965,25.035 C564.297,23.368 562.623,22.342 560.652,21.575 C558.743,20.834 556.562,20.326 553.369,20.18 C550.169,20.033 549.148,20 541,20 C532.853,20 531.831,20.033 528.631,20.18 C525.438,20.326 523.257,20.834 521.349,21.575 C519.376,22.342 517.703,23.368 516.035,25.035 C514.368,26.702 513.342,28.377 512.574,30.349 C511.834,32.258 511.326,34.438 511.181,37.631 C511.035,40.831 511,41.851 511,50 C511,58.147 511.035,59.17 511.181,62.369 C511.326,65.562 511.834,67.743 512.574,69.651 C513.342,71.625 514.368,73.296 516.035,74.965 C517.703,76.634 519.376,77.658 521.349,78.425 C523.257,79.167 525.438,79.673 528.631,79.82 C531.831,79.965 532.853,80.001 541,80.001 C549.148,80.001 550.169,79.965 553.369,79.82 C556.562,79.673 558.743,79.167 560.652,78.425 C562.623,77.658 564.297,76.634 565.965,74.965 C567.633,73.296 568.659,71.625 569.425,69.651 C570.167,67.743 570.674,65.562 570.82,62.369 C570.966,59.17 571,58.147 571,50 C571,41.851 570.966,40.831 570.82,37.631"></path>
                              </g>
                            </g>
                          </g>
                        </svg>
                      </div>
                      <div style={{ paddingTop: "8px" }}>
                        <div style={{ color: "#3897f0", fontFamily: "Arial,sans-serif", fontSize: "14px", fontStyle: "normal", fontWeight: "550", lineHeight: "18px" }}>View this post on Instagram</div>
                      </div>
                      <div style={{ padding: "12.5% 0" }}></div>
                      <div style={{ display: "flex", flexDirection: "row", marginBottom: "14px", alignItems: "center" }}>
                        <div>
                          <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", height: "12.5px", width: "12.5px", transform: "translateX(0px) translateY(7px)" }}></div>
                          <div style={{ backgroundColor: "#F4F4F4", height: "12.5px", transform: "rotate(-45deg) translateX(3px) translateY(1px)", width: "12.5px", flexGrow: "0", marginRight: "14px", marginLeft: "2px" }}></div>
                          <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", height: "12.5px", width: "12.5px", transform: "translateX(9px) translateY(-18px)" }}></div>
                        </div>
                        <div style={{ marginLeft: "8px" }}>
                          <div style={{ backgroundColor: "#F4F4F4", borderRadius: "50%", flexGrow: "0", height: "20px", width: "20px" }}></div>
                          <div style={{ width: "0", height: "0", borderTop: "2px solid transparent", borderLeft: "6px solid #f4f4f4", borderBottom: "2px solid transparent", transform: "translateX(16px) translateY(-4px) rotate(30deg)" }}></div>
                        </div>
                        <div style={{ marginLeft: "auto" }}>
                          <div style={{ width: "0px", borderTop: "8px solid #F4F4F4", borderRight: "8px solid transparent", transform: "translateY(16px)" }}></div>
                          <div style={{ backgroundColor: "#F4F4F4", flexGrow: "0", height: "12px", width: "16px", transform: "translateY(-4px)" }}></div>
                          <div style={{ width: "0", height: "0", borderTop: "8px solid #F4F4F4", borderLeft: "8px solid transparent", transform: "translateY(-4px) translateX(8px)" }}></div>
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", flexGrow: "1", justifyContent: "center", marginBottom: "24px" }}>
                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "4px", flexGrow: "0", height: "14px", marginBottom: "6px", width: "100px" }}></div>
                        <div style={{ backgroundColor: "#F4F4F4", borderRadius: "4px", flexGrow: "0", height: "14px", width: "60px" }}></div>
                      </div>
                    </a>
                    <p style={{ color: "#c9c8cd", fontFamily: "Arial,sans-serif", fontSize: "14px", lineHeight: "17px", marginBottom: "0", marginTop: "8px", overflow: "hidden", padding: "8px 0 7px", textAlign: "center", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <a 
                        href={`https://www.instagram.com/reel/${reelId}/?utm_source=ig_embed&utm_campaign=loading`} 
                        style={{ color: "#c9c8cd", fontFamily: "Arial,sans-serif", fontSize: "14px", fontStyle: "normal", fontWeight: "normal", lineHeight: "17px", textDecoration: "none" }} 
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        A post shared by City Pulse
                      </a>
                    </p>
                  </div>
                </blockquote>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Strategy Section */}
        <section className="bg-muted/30 rounded-[3rem] p-12 md:p-16 border border-border/50">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-3">
                <Badge variant="outline" className="border-primary/30 text-primary font-black uppercase tracking-[0.2em] text-[8px] px-3 py-1 italic">Our Strategy</Badge>
                <h2 className="text-4xl font-black brand-font uppercase tracking-tighter italic leading-[0.9]">How We Pulse Your Event.</h2>
                <p className="text-sm font-medium text-muted-foreground leading-relaxed max-w-md">
                  We don't just "post" on social media. We build a comprehensive digital ecosystem around your event to drive ticket sales.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {STRATEGIES.map((strat, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="h-10 w-10 rounded-xl bg-background border border-border flex items-center justify-center shadow-sm">
                      <strat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-xs font-black uppercase tracking-tight italic">{strat.title}</h4>
                    <p className="text-[10px] font-medium text-muted-foreground leading-relaxed">{strat.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-primary/10 to-transparent blur-3xl opacity-50" />
              <div className="relative aspect-square rounded-3xl overflow-hidden border border-border shadow-2xl bg-card p-8 flex flex-col justify-center gap-6">
                 <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Reach Growth</span>
                      <span className="text-primary">+420%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "85%" }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Ticket Conversion</span>
                      <span className="text-primary">+12.5%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "65%" }}
                        transition={{ duration: 1.5, delay: 0.2, ease: "easeOut" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                      <span>Audience Retention</span>
                      <span className="text-primary">94%</span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: "94%" }}
                        transition={{ duration: 1.5, delay: 0.4, ease: "easeOut" }}
                        className="h-full bg-primary" 
                      />
                    </div>
                 </div>
                 <div className="mt-4 pt-6 border-t border-border flex items-center justify-between">
                    <div className="flex -space-x-3">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-8 w-8 rounded-full border-2 border-card bg-muted flex items-center justify-center text-[10px] font-black">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Trusted by 200+ Promoters</span>
                 </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="max-w-5xl mx-auto">
          <div className="bg-neon-lime rounded-[3.5rem] p-16 text-black relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 transition-transform group-hover:rotate-0">
              <Rocket size={250} />
            </div>
            
            <div className="relative z-10 space-y-8">
              <h2 className="text-6xl md:text-7xl font-black brand-font uppercase tracking-tighter italic leading-none">Ready to Go Viral?</h2>
              <p className="text-xl font-bold uppercase tracking-tight italic opacity-80 max-w-lg leading-relaxed">
                Initialize your marketing engine today and watch your ticket sales skyrocket.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to={`/boost/request${selectedPlan ? `?plan=${selectedPlan}` : ""}`}>
                  <Button className="bg-black text-white hover:bg-zinc-800 h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-xs italic flex items-center gap-3 shadow-xl">
                    Start Marketing Now <ArrowRight className="h-4 w-4" />
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
