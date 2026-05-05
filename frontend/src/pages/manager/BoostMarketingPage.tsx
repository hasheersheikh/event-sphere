import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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
  AtSign
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import api from "@/lib/api";
import { toast } from "sonner";
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

const BoostMarketingPage = () => {
  const [searchParams] = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    eventId: "",
    igHandle: "",
    phone: "",
    message: ""
  });

  useEffect(() => {
    const eventId = searchParams.get("eventId");
    if (eventId) {
      setFormData(prev => ({ ...prev, eventId }));
    }
  }, [searchParams]);

  const { data: response } = useQuery({
    queryKey: ["my-events-for-boost"],
    queryFn: async () => {
      const { data } = await api.get("/events/my?limit=100");
      return data;
    },
  });

  const events = response?.data || [];

  const boostMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/manager/marketing-boost", data);
    },
    onSuccess: () => {
      toast.success("Marketing request initialized. Our agency will connect shortly.");
      setFormData({ eventId: "", igHandle: "", phone: "", message: "" });
      setSelectedPlan(null);
    },
    onError: () => {
      toast.error("Failed to send request. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan) {
      toast.error("Please select a marketing plan.");
      return;
    }
    if (!formData.eventId) {
      toast.error("Please select an event to boost.");
      return;
    }
    boostMutation.mutate({
      ...formData,
      plan: selectedPlan
    });
  };

  return (
    <div className="p-4 md:p-6 space-y-8 bg-background min-h-screen pb-20">
      <PortalPageHeader
        title="Boost Your Event"
        icon={Zap}
        subtitle="Get more reach and ticket sales through our Instagram marketing partners."
        badge={
          <Badge className="bg-primary/10 text-primary border-primary/20 rounded-md text-[8px] font-black uppercase tracking-widest px-2 py-0.5 italic">
            Marketing Engine v2.0
          </Badge>
        }
      />

      {/* Plans Section */}
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

            <Button 
              variant={selectedPlan === plan.id ? "default" : "outline"}
              className={`w-full rounded-xl h-11 font-black uppercase tracking-widest text-[9px] italic ${
                selectedPlan === plan.id ? "bg-primary text-primary-foreground" : ""
              }`}
            >
              {selectedPlan === plan.id ? "Selected Plan" : "Choose Plan"}
            </Button>
          </motion.div>
        ))}
      </div>

      {/* Form Section */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-3xl mx-auto bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
          <Instagram size={200} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-black brand-font uppercase tracking-tighter italic">Request Marketing Boost</h2>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Our team will contact you once you submit this form.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  <Calendar className="h-3 w-3" /> Select Event
                </label>
                <Select 
                  value={formData.eventId} 
                  onValueChange={(val) => setFormData({...formData, eventId: val})}
                >
                  <SelectTrigger className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest focus:ring-primary italic">
                    <SelectValue placeholder="CHOOSE AN EVENT" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {events.map((event: any) => (
                      <SelectItem key={event._id} value={event._id} className="text-[10px] font-black uppercase tracking-widest italic py-3 focus:bg-primary/10">
                        {event.title}
                      </SelectItem>
                    ))}
                    {events.length === 0 && (
                      <div className="p-4 text-[10px] font-black text-center text-muted-foreground uppercase italic">No active operations found.</div>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  <Instagram className="h-3 w-3" /> Instagram Handle
                </label>
                <Input 
                  placeholder="@YOURHANDLE" 
                  value={formData.igHandle}
                  onChange={(e) => setFormData({...formData, igHandle: e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value})}
                  className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest focus-visible:ring-primary italic"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  <Phone className="h-3 w-3" /> WhatsApp Contact
                </label>
                <Input 
                  placeholder="+91 00000 00000" 
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="bg-muted/50 border-border rounded-xl h-12 text-[11px] font-black uppercase tracking-widest focus-visible:ring-primary italic"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                  <Target className="h-3 w-3" /> Selected Plan
                </label>
                <div className="h-12 bg-muted/30 border border-dashed border-border rounded-xl flex items-center px-4 text-[11px] font-black uppercase tracking-widest text-primary italic">
                  {PLANS.find(p => p.id === selectedPlan)?.name || "PLAN NOT SELECTED"}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Additional Message</label>
              <Textarea 
                placeholder="ANY SPECIFIC TARGET AUDIENCE OR REQUIREMENTS..." 
                className="bg-muted/50 border-border rounded-xl min-h-[100px] text-[11px] font-black uppercase tracking-widest focus-visible:ring-primary italic resize-none"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
              />
            </div>

            <Button 
              type="submit"
              disabled={boostMutation.isPending}
              className="w-full bg-[#C4F000] text-black hover:bg-[#A3C800] h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all italic"
            >
              {boostMutation.isPending ? "SENDING..." : (
                <div className="flex items-center gap-3">
                  Submit Marketing Request <Send className="h-4 w-4" />
                </div>
              )}
            </Button>

            <p className="text-center text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">
              Our team will contact you to finalize the marketing plan.
            </p>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default BoostMarketingPage;
