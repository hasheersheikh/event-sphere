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
  ExternalLink
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from "@/lib/api";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { motion } from "framer-motion";

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
    color: "from-blue-500/20 to-cyan-500/20"
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
    color: "from-purple-500/20 to-pink-500/20",
    popular: true
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
    color: "from-amber-500/20 to-orange-500/20"
  }
];

const INFLUENCERS = [
  {
    name: "Ishita 'The Vibe' Sharma",
    handle: "@ishita_vibes",
    niche: "Nightlife & Music",
    reach: "450K+",
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=256&h=256&auto=format&fit=crop"
  },
  {
    name: "Arjun Mehta",
    handle: "@arjun_explores",
    niche: "Food & Events",
    reach: "280K+",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=256&h=256&auto=format&fit=crop"
  },
  {
    name: "Sanya Kapoor",
    handle: "@sanya_style",
    niche: "Fashion & Lifestyle",
    reach: "620K+",
    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&h=256&auto=format&fit=crop"
  },
  {
    name: "Rohan Das",
    handle: "@rohan_beats",
    niche: "Concerts & DJ",
    reach: "150K+",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=256&h=256&auto=format&fit=crop"
  },
  {
    name: "Meera Reddy",
    handle: "@meera_moments",
    niche: "Cultural Festivals",
    reach: "340K+",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=256&h=256&auto=format&fit=crop"
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
  "C9vTMylsR8I", // Viral: Tomorrowland Symphony of Unity
  "C7z9Z8xW7yY"  // Popular: High-energy festival vibe
];

const BoostMarketingPage = () => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 space-y-20 bg-background min-h-screen pb-32">
      <PortalPageHeader
        title="Boost Your Event"
        icon={Zap}
        subtitle="Get more reach and ticket sales through our Instagram marketing partners."
        badge={
          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-md text-[8px] font-black uppercase tracking-widest px-2 py-0.5 italic">
            Marketing Engine v2.0
          </Badge>
        }
        actions={
          <Link to={`/portal/manager/boost/request${selectedPlan ? `?plan=${selectedPlan}` : ""}`}>
            <Button className="bg-primary text-primary-foreground h-11 px-6 rounded-xl font-black uppercase tracking-widest text-[10px] italic flex items-center gap-2 shadow-lg hover:shadow-primary/20">
              Start Marketing Now <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        }
      />

      {/* Plans Section */}
      <section className="space-y-8">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black brand-font uppercase tracking-tighter italic">Select Your Engine</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Choose a plan that fits your event scale</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, idx) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              onClick={() => setSelectedPlan(plan.id)}
              className={`relative group cursor-pointer rounded-2xl border transition-all duration-300 p-6 flex flex-col ${
                selectedPlan === plan.id 
                  ? "border-primary bg-primary/5 shadow-xl shadow-primary/5 ring-1 ring-primary" 
                  : "border-border bg-card hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
                  Recommended
                </div>
              )}

              <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-6`}>
                <plan.icon className={`h-6 w-6 ${selectedPlan === plan.id ? "text-primary" : "text-muted-foreground"}`} />
              </div>

              <h3 className="text-lg font-black brand-font uppercase tracking-tighter italic mb-1">
                {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-2xl font-black italic">{plan.price}</span>
                {plan.price !== "Custom" && <span className="text-[10px] font-black text-muted-foreground uppercase">/ Event</span>}
              </div>

              <p className="text-[11px] font-medium text-muted-foreground leading-relaxed mb-6">
                {plan.description}
              </p>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((feature, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2 text-[10px] font-bold uppercase tracking-wide text-foreground/70 leading-tight">
                    <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                    {feature}
                  </li>
                ))}
              </ul>

              <div 
                className={`w-full rounded-xl h-11 flex items-center justify-center border font-black uppercase tracking-widest text-[9px] italic transition-all ${
                  selectedPlan === plan.id ? "bg-primary text-primary-foreground border-primary" : "border-border"
                }`}
              >
                {selectedPlan === plan.id ? "Selected Plan" : "Select Plan"}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Influencer Section */}
      <section className="space-y-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black brand-font uppercase tracking-tighter italic text-center">Elite Creator Network</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Work with influencers who dominate your event's niche</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6 px-4">
          {INFLUENCERS.map((inf, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="flex flex-col items-center group"
            >
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <img 
                  src={inf.image} 
                  alt={inf.name} 
                  className="h-20 w-20 rounded-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500 border-2 border-border group-hover:border-primary relative z-10"
                />
                <div className="absolute -bottom-1 -right-1 bg-primary text-black h-6 w-6 rounded-full flex items-center justify-center shadow-lg z-20">
                  <Star className="h-3 w-3 fill-black" />
                </div>
              </div>
              <h4 className="text-[10px] font-black uppercase tracking-tight italic mb-0.5">{inf.name}</h4>
              <p className="text-[9px] font-black text-primary uppercase tracking-widest mb-1">{inf.handle}</p>
              <Badge variant="outline" className="text-[7px] font-black uppercase tracking-widest px-1.5 py-0 border-border/50 text-muted-foreground">
                {inf.reach} REACH
              </Badge>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Showcase Section */}
      <section className="space-y-10">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-black brand-font uppercase tracking-tighter italic text-center">Marketing Showcase</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Actual campaigns running in our high-octane engine</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 px-2">
          {SHOWCASE_REELS.map((reelId, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="relative aspect-[9/16] rounded-2xl overflow-hidden bg-zinc-900 shadow-2xl border border-border/30 group"
            >
              <iframe
                src={`https://www.instagram.com/reel/${reelId}/embed`}
                className="absolute inset-0 w-full h-full pointer-events-auto"
                title={`Marketing showcase reel ${idx + 1}`}
                allowFullScreen
                style={{ border: 0 }}
              />
              <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 group-hover:opacity-40 transition-opacity" />
              <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center gap-2 pointer-events-none">
                <div className="h-6 w-6 rounded-full bg-primary/20 backdrop-blur-md flex items-center justify-center border border-primary/30">
                  <Instagram className="h-3 w-3 text-primary" />
                </div>
                <span className="text-[8px] font-black text-white uppercase tracking-widest italic drop-shadow-lg">Campaign #{idx + 101}</span>
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
      <section className="max-w-4xl mx-auto py-12">
        <div className="bg-[#C4F000] rounded-[2.5rem] p-12 text-black relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 rotate-12 transition-transform group-hover:rotate-0">
            <Rocket size={180} />
          </div>
          
          <div className="relative z-10 space-y-6">
            <h2 className="text-5xl font-black brand-font uppercase tracking-tighter italic leading-none">Ready to Go Viral?</h2>
            <p className="text-lg font-bold uppercase tracking-tight italic opacity-80 max-w-lg">
              Initialize your marketing engine today and watch your ticket sales skyrocket.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link to={`/portal/manager/boost/request${selectedPlan ? `?plan=${selectedPlan}` : ""}`}>
                <Button className="bg-black text-white hover:bg-zinc-800 h-16 px-10 rounded-2xl font-black uppercase tracking-widest text-xs italic flex items-center gap-3">
                  Start Marketing Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BoostMarketingPage;
