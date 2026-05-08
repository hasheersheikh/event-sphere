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
import { motion } from "framer-motion";
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

  const { data: influencers = [], isLoading: influencersLoading } = useQuery({
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
      <div className="p-4 md:p-6 space-y-32 md:space-y-48 max-w-7xl mx-auto pb-48 pt-20">
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
                <Button className="bg-[#C4F000] text-black h-16 px-12 rounded-2xl font-black uppercase tracking-widest text-[11px] italic flex items-center gap-3 shadow-2xl hover:bg-[#A3C800] hover:scale-105 transition-all">
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
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                onClick={() => setSelectedPlan(plan.id)}
                className={`relative group cursor-pointer rounded-3xl border-2 transition-all duration-500 p-8 flex flex-col ${
                  selectedPlan === plan.id 
                    ? "border-primary bg-primary/5 shadow-2xl shadow-primary/10 scale-[1.02]" 
                    : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl">
                    Recommended
                  </div>
                )}

                <div className={`h-14 w-14 rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-8 shadow-inner`}>
                  <plan.icon className={`h-7 w-7 ${selectedPlan === plan.id ? "text-primary" : "text-muted-foreground"}`} />
                </div>

                <h3 className="text-xl font-black brand-font uppercase tracking-tighter italic mb-1">
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-black italic">{plan.price}</span>
                  {plan.price !== "Custom" && <span className="text-[10px] font-black text-muted-foreground uppercase">/ Event</span>}
                </div>

                <p className="text-[12px] font-medium text-muted-foreground leading-relaxed mb-8">
                  {plan.description}
                </p>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-3 text-[10px] font-bold uppercase tracking-wide text-foreground/80 leading-tight">
                      <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <div 
                  className={`w-full rounded-2xl h-12 flex items-center justify-center border-2 font-black uppercase tracking-widest text-[10px] italic transition-all ${
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
        <section className="space-y-12 bg-muted/20 py-16 rounded-[4rem] border border-border/50">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-3xl font-black brand-font uppercase tracking-tighter italic text-center">Elite Creator Network</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Work with influencers who dominate your event's niche</p>
          </div>

          <div className="flex flex-wrap justify-center gap-10 px-4">
            {influencersLoading ? (
              <div className="flex flex-col items-center gap-4 py-10">
                <Loader2 className="h-8 w-8 text-primary animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic">Syncing with creators...</p>
              </div>
            ) : influencers.length > 0 ? (
              influencers.map((inf: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex flex-col items-center group"
                >
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <img 
                      src={inf.image} 
                      alt={inf.name} 
                      className="h-24 w-24 rounded-full object-cover transition-all duration-700 border-2 border-border group-hover:border-primary relative z-10 p-1 bg-background"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-primary text-black h-8 w-8 rounded-full flex items-center justify-center shadow-2xl z-20 border-4 border-background">
                      <Star className="h-4 w-4 fill-black" />
                    </div>
                  </div>
                  <h4 className="text-[11px] font-black uppercase tracking-tight italic mb-1">{inf.name}</h4>
                  <div className="flex items-center gap-2">
                    <p className="text-[10px] font-black text-primary uppercase tracking-widest">{inf.handle}</p>
                    {inf.instagramUrl && (
                      <a 
                        href={inf.instagramUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-primary transition-colors"
                        title="View Profile"
                      >
                        <Instagram className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 border-border text-muted-foreground bg-background mt-2">
                    {inf.reach} REACH
                  </Badge>
                </motion.div>
              ))
            ) : (
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground italic py-10">No creators in network yet.</p>
            )}
          </div>
        </section>

        {/* Showcase Section */}
        <section className="space-y-12">
          <div className="flex flex-col gap-1 text-center">
            <h2 className="text-3xl font-black brand-font uppercase tracking-tighter italic text-center">Marketing Showcase</h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-center">Tap any reel to see the magic in action</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 px-2">
            {SHOWCASE_REELS.map((reelId, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="flex justify-center"
              >
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
                    maxWidth: "326px", 
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
          <div className="bg-[#C4F000] rounded-[3.5rem] p-16 text-black relative overflow-hidden group">
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
