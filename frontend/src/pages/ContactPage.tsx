import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, ArrowRight, Clock, Ticket, Megaphone, Wrench, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useState } from "react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
});

const TOPICS = [
  { icon: Ticket, label: "Ticket & Booking", value: "booking" },
  { icon: Megaphone, label: "Event Management", value: "manager" },
  { icon: Wrench, label: "Technical Issue", value: "technical" },
  { icon: HelpCircle, label: "General Inquiry", value: "general" },
];

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("general");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent! We'll get back to you within 24 hours.");
      (e.target as HTMLFormElement).reset();
      setSelectedTopic("general");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 pt-14 md:pt-16">

        {/* ── Hero ── */}
        <section className="border-b border-border/20 py-10 md:py-16">
          <div className="container px-4 md:px-6 max-w-5xl">
            <motion.p {...fadeUp(0)} className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground mb-3">
              Support
            </motion.p>
            <motion.h1 {...fadeUp(0.05)} className="font-display text-4xl md:text-6xl font-black tracking-tighter leading-[0.9] mb-4">
              How can we<br />
              <span className="text-muted-foreground/40">help you?</span>
            </motion.h1>
            <motion.p {...fadeUp(0.1)} className="text-sm text-muted-foreground max-w-sm leading-relaxed">
              Our team is here for you: tickets, events, or anything else. We typically respond within 24 hours.
            </motion.p>
          </div>
        </section>

        {/* ── Quick contact strip ── */}
        <section className="border-b border-border/20">
          <div className="container px-4 md:px-6 max-w-5xl">
            <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border/20">
              {[
                { icon: Mail, label: "Email", value: "support@citypulse.com" },
                { icon: Phone, label: "Phone", value: "+91 1800-CITY-PULSE" },
                { icon: Clock, label: "Response time", value: "Within 24 hours" },
              ].map(({ icon: Icon, label, value }, i) => (
                <motion.div
                  key={label}
                  {...fadeUp(i * 0.06)}
                  className="flex items-center gap-4 py-5 px-0 sm:px-8 first:pl-0 last:pr-0"
                >
                  <div className="h-9 w-9 rounded-xl border border-border/40 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-0.5">{label}</p>
                    <p className="text-[13px] font-bold">{value}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Main content ── */}
        <section className="py-10 md:py-16 container px-4 md:px-6 max-w-5xl">
          <div className="grid lg:grid-cols-[1fr_380px] gap-8 md:gap-12 items-start">

            {/* ── Form ── */}
            <motion.div {...fadeUp(0.08)} className="bg-card border border-border/40 rounded-2xl p-6 md:p-8">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Send a message</h2>

              {/* Topic selector */}
              <div className="grid grid-cols-2 gap-2 mb-6">
                {TOPICS.map(({ icon: Icon, label, value }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSelectedTopic(value)}
                    className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border text-left transition-all duration-150 ${
                      selectedTopic === value
                        ? "border-foreground bg-foreground text-background"
                        : "border-border/40 text-muted-foreground hover:border-border hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="text-[11px] font-black uppercase tracking-wide leading-tight">{label}</span>
                  </button>
                ))}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Name</label>
                    <Input
                      placeholder="Your full name"
                      required
                      className="h-11 rounded-xl border-border/40 bg-muted/20 focus-visible:border-foreground focus-visible:ring-0"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      required
                      className="h-11 rounded-xl border-border/40 bg-muted/20 focus-visible:border-foreground focus-visible:ring-0"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Message</label>
                  <Textarea
                    placeholder="Describe your issue or question in detail…"
                    required
                    className="rounded-xl min-h-[140px] resize-none border-border/40 bg-muted/20 focus-visible:border-foreground focus-visible:ring-0"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="h-11 px-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[11px] gap-2 transition-all"
                >
                  {isSubmitting ? "Sending…" : (
                    <>Send Message <ArrowRight className="h-3.5 w-3.5" /></>
                  )}
                </Button>
              </form>
            </motion.div>

            {/* ── Right panel ── */}
            <motion.div {...fadeUp(0.14)} className="space-y-3">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground mb-6">Common topics</h2>

              {[
                { q: "How do I get a refund for a cancelled event?", a: "Refunds are processed within 5–7 business days to your original payment method once an event is officially cancelled by the organiser." },
                { q: "Can I transfer my ticket to someone else?", a: "Yes! Open your ticket in My Tickets, tap Transfer, and enter the recipient's email. They'll receive it instantly." },
                { q: "My payment failed but I was charged. What do I do?", a: "Contact us with your order ID and we'll investigate. In most cases the hold is released automatically within 3 days." },
                { q: "How do I list my event on City Pulse?", a: "Visit the List Your Event page and apply as an organiser. Our team reviews applications within 48 hours." },
              ].map(({ q, a }, i) => (
                <details
                  key={i}
                  className="group border border-border/30 rounded-xl overflow-hidden"
                >
                  <summary className="flex items-center justify-between gap-3 px-4 py-3.5 cursor-pointer list-none select-none hover:bg-muted/20 transition-colors">
                    <span className="text-[12px] font-bold leading-snug">{q}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform duration-200 group-open:rotate-90" />
                  </summary>
                  <div className="px-4 pb-4 text-[12px] text-muted-foreground leading-relaxed border-t border-border/20 pt-3">
                    {a}
                  </div>
                </details>
              ))}

              <div className="mt-6 p-5 rounded-xl border border-border/30 bg-muted/10">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground/60" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Office</span>
                </div>
                <p className="text-[13px] font-bold">City Pulse HQ</p>
                <p className="text-[12px] text-muted-foreground mt-0.5">Cyber Hub, DLF Phase 2<br />Gurugram, Haryana 122002</p>
              </div>
            </motion.div>

          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
