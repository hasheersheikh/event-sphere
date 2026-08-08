import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { 
  Instagram, 
  Zap, 
  Target, 
  Send,
  Calendar,
  Phone,
  ArrowLeft
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
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
import { motion } from "framer-motion";
import Navbar from "@/components/layout/Navbar";

const PLANS = [
  { id: "starter", name: "Spark", price: "₹4,999", color: "cyan", bgClass: "bg-cyan-500", textClass: "text-cyan-500", borderClass: "border-cyan-500", hoverClass: "hover:border-cyan-500/50" },
  { id: "velocity", name: "Accelerator", price: "₹9,999", color: "pink", bgClass: "bg-neon-pink", textClass: "text-neon-pink", borderClass: "border-neon-pink", hoverClass: "hover:border-neon-pink/50" },
  { id: "elite", name: "Impact", price: "₹17,499", color: "orange", bgClass: "bg-orange-500", textClass: "text-orange-500", borderClass: "border-orange-500", hoverClass: "hover:border-orange-500/50" }
];

const BoostRequestPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    eventId: "",
    plan: searchParams.get("plan") || "",
    igHandle: "",
    phone: "",
    message: ""
  });

  const { data: response } = useQuery({
    queryKey: ["my-events-for-boost"],
    queryFn: async () => {
      const { data } = await api.get("/events/my?limit=100");
      return data;
    },
    // Only fetch if authenticated, otherwise keep empty
    retry: false,
  });

  const events = response?.data || [];

  const boostMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/manager/marketing-boost", data);
    },
    onSuccess: () => {
      toast.success("Marketing request initialized. Our agency will connect shortly.");
      navigate("/boost");
    },
    onError: () => {
      toast.error("Failed to send request. Please try again.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.plan) {
      toast.error("Please select a marketing plan.");
      return;
    }
    boostMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container px-4 md:px-8 py-4 md:py-6 max-w-4xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Boost
        </Button>

        {/* Main Form Card */}
        <div className="bg-card border-2 border-border rounded-3xl overflow-hidden shadow-xl">
          {/* Neon Accent Header */}
          <div className="h-2 bg-gradient-to-r from-neon-lime via-neon-pink to-neon-orange" />

          <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
            {/* Plan Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: plan.id })}
                  className={`p-6 rounded-2xl border-2 bg-card transition-all ${
                    formData.plan === plan.id
                      ? `${plan.borderClass} ${plan.textClass} shadow-lg shadow-${plan.color}-500/20`
                      : `border-border ${plan.hoverClass} text-foreground`
                  }`}
                >
                  <div className="text-center">
                    <div className={`text-2xl md:text-3xl font-black italic mb-2 ${
                      formData.plan === plan.id ? plan.textClass : "text-foreground"
                    }`}>
                      {plan.name}
                    </div>
                    <div className={`text-sm font-bold uppercase tracking-wider ${
                      formData.plan === plan.id ? plan.textClass : "text-muted-foreground"
                    }`}>
                      {plan.price}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Event Details */}
            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                <Calendar className="h-5 w-5 text-neon-pink" />
                Event Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Event Title
                  </label>
                  <Input
                    placeholder="Your event name"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-muted/50 border-border hover:border-neon-pink/50 rounded-xl h-12 text-sm transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-6">
              <h3 className="text-lg font-black uppercase tracking-wider text-foreground flex items-center gap-3">
                <Phone className="h-5 w-5 text-neon-orange" />
                Contact Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Instagram Handle
                  </label>
                  <Input
                    placeholder="@yourhandle"
                    value={formData.igHandle}
                    onChange={(e) => setFormData({...formData, igHandle: e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value})}
                    className="bg-muted/50 border-border hover:border-neon-orange/50 rounded-xl h-12 text-sm transition-colors"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    WhatsApp Number
                  </label>
                  <Input
                    placeholder="+91 00000 00000"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-muted/50 border-border hover:border-neon-orange/50 rounded-xl h-12 text-sm transition-colors"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={boostMutation.isPending || !formData.plan}
                className="w-full bg-neon-lime text-black hover:bg-neon-lime/90 h-14 rounded-xl font-black uppercase tracking-widest text-sm shadow-lg shadow-neon-lime/20 hover:shadow-xl hover:shadow-neon-lime/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {boostMutation.isPending ? (
                  <span className="flex items-center gap-2">
                    Sending Request...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Submit Marketing Request <Send className="h-4 w-4" />
                  </span>
                )}
              </Button>

              <p className="text-center text-xs text-muted-foreground mt-4">
                Our team will contact you within 24 hours to finalize your marketing plan.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BoostRequestPage;
