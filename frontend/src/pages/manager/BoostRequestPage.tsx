import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
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

const PLANS = [
  { id: "starter", name: "Starter Sync" },
  { id: "velocity", name: "Viral Velocity" },
  { id: "elite", name: "Elite Influence" }
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
  });

  const events = response?.data || [];

  const boostMutation = useMutation({
    mutationFn: async (data: any) => {
      return api.post("/manager/marketing-boost", data);
    },
    onSuccess: () => {
      toast.success("Marketing request initialized. Our agency will connect shortly.");
      navigate("/portal/manager/boost");
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
    if (!formData.eventId) {
      toast.error("Please select an event to boost.");
      return;
    }
    boostMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate(-1)}
          className="mb-8 text-[10px] font-black uppercase tracking-widest italic flex items-center gap-2 hover:bg-primary/5"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Boost
        </Button>

        <div className="bg-card border border-border rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
            <Instagram size={300} />
          </div>

          <div className="relative z-10 space-y-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-3xl font-black brand-font uppercase tracking-tighter italic leading-none">Initialize Engine.</h2>
              </div>
              <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Our team will contact you once you submit this form.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Calendar className="h-3 w-3" /> Select Event
                  </label>
                  <Select 
                    value={formData.eventId} 
                    onValueChange={(val) => setFormData({...formData, eventId: val})}
                  >
                    <SelectTrigger className="bg-muted/50 border-border rounded-xl h-14 text-[11px] font-black uppercase tracking-widest focus:ring-primary italic">
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

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                      <Target className="h-3 w-3" /> Marketing Plan
                    </label>
                    <Select 
                      value={formData.plan} 
                      onValueChange={(val) => setFormData({...formData, plan: val})}
                    >
                      <SelectTrigger className="bg-muted/50 border-border rounded-xl h-14 text-[11px] font-black uppercase tracking-widest focus:ring-primary italic">
                        <SelectValue placeholder="CHOOSE A PLAN" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {PLANS.map((plan) => (
                          <SelectItem key={plan.id} value={plan.id} className="text-[10px] font-black uppercase tracking-widest italic py-3 focus:bg-primary/10">
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Instagram className="h-3 w-3" /> Instagram Handle
                  </label>
                  <Input 
                    placeholder="@YOURHANDLE" 
                    value={formData.igHandle}
                    onChange={(e) => setFormData({...formData, igHandle: e.target.value.startsWith('@') ? e.target.value : '@' + e.target.value})}
                    className="bg-muted/50 border-border rounded-xl h-14 text-[11px] font-black uppercase tracking-widest focus-visible:ring-primary italic"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <Phone className="h-3 w-3" /> WhatsApp Contact
                  </label>
                  <Input 
                    placeholder="+91 00000 00000" 
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="bg-muted/50 border-border rounded-xl h-14 text-[11px] font-black uppercase tracking-widest focus-visible:ring-primary italic"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Additional Message</label>
                <Textarea 
                  placeholder="ANY SPECIFIC TARGET AUDIENCE OR REQUIREMENTS..." 
                  className="bg-muted/50 border-border rounded-xl min-h-[120px] text-[11px] font-black uppercase tracking-widest focus-visible:ring-primary italic resize-none"
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
              </div>

              <Button 
                type="submit"
                disabled={boostMutation.isPending}
                className="w-full bg-[#C4F000] text-black hover:bg-[#A3C800] h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:scale-[1.01] active:scale-[0.98] transition-all italic mt-4"
              >
                {boostMutation.isPending ? "SENDING..." : (
                  <div className="flex items-center gap-3">
                    Submit Marketing Request <Send className="h-4 w-4" />
                  </div>
                )}
              </Button>

              <p className="text-center text-[8px] font-black text-muted-foreground/40 uppercase tracking-[0.3em] italic">
                Our team will contact you to finalize the marketing plan within 24 hours.
              </p>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default BoostRequestPage;
