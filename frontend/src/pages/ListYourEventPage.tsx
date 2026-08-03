import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight,
  CalendarDays,
  TicketIcon,
  BarChart3,
  Users,
  ShieldCheck,
  Zap,
  MapPin,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Megaphone,
  Globe2,
  Lock,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.55, ease: [0.16, 1, 0.3, 1] },
});

const STEPS = [
  {
    num: "01",
    title: "Create your account",
    description: "Sign up as an event organizer in under 2 minutes. No upfront fees, no commitments.",
    icon: Users,
  },
  {
    num: "02",
    title: "Set up your event",
    description: "Add all your event details: dates, venue, lineup, ticket types and pricing.",
    icon: CalendarDays,
  },
  {
    num: "03",
    title: "Start selling tickets",
    description: "Go live instantly. Share your event page and start collecting ticket sales.",
    icon: TicketIcon,
  },
  {
    num: "04",
    title: "Track and manage",
    description: "Monitor sales, manage attendees, scan QR codes at the door, all from one dashboard.",
    icon: BarChart3,
  },
];

const FEATURES = [
  {
    icon: TicketIcon,
    title: "Flexible Ticketing",
    description: "Create multiple ticket tiers: General, VIP, Early Bird. Set capacity limits and custom pricing.",
  },
  {
    icon: BarChart3,
    title: "Real-time Analytics",
    description: "Track sales, revenue, and attendee demographics live. Know exactly how your event is performing.",
  },
  {
    icon: ShieldCheck,
    title: "Secure Payments",
    description: "Industry-standard payment processing. Funds deposited directly to your account after the event.",
  },
  {
    icon: Megaphone,
    title: "Boost & Promote",
    description: "Amplify your reach through our influencer network and targeted social media campaigns.",
  },
  {
    icon: MapPin,
    title: "Venue Management",
    description: "Add venue details, maps, and parking info. Help attendees find you effortlessly.",
  },
  {
    icon: Zap,
    title: "Instant QR Check-in",
    description: "Scan tickets at the door with our mobile scanner. Fast, contactless, and fraud-proof.",
  },
];

const FAQS = [
  {
    q: "Is it free to list an event?",
    a: "Yes! Creating an account and listing your event is completely free. A commission applies only on paid ticket sales: 3% + GST if you list exclusively on City Pulse, or 5% + GST if you also sell on other platforms.",
  },
  {
    q: "How quickly can I go live?",
    a: "Once your account is approved, you can publish an event in minutes. Our team reviews listings within 24 hours.",
  },
  {
    q: "What payment methods are supported?",
    a: "We support UPI, net banking, credit/debit cards, and wallets. Payouts are made directly to your bank account.",
  },
  {
    q: "Can I sell tickets for free events?",
    a: "Absolutely. You can create free-entry events with RSVP-style ticketing to track attendance and communicate with attendees.",
  },
  {
    q: "What types of events can I list?",
    a: "Concerts, comedy shows, workshops, club nights, sports events, art exhibitions. Any live event is welcome.",
  },
];

const ListYourEventPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">

        {/* ── HERO ── */}
        <section className="border-b border-border/20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-12 pb-14 md:pt-20 md:pb-20 text-center">

            <PublicPageHeader
              pillText="For Organizers · City Pulse"
              title={
                <>
                  List Your <span className="text-neon-lime">Event</span>
                </>
              }
              subtitle="Reach thousands of event-goers in your city. Sell tickets, manage your crowd, and grow your audience on City Pulse."
              size="lg"
              className="text-center mb-8"
            />

            <motion.div className="flex flex-col sm:flex-row gap-3 mb-12 md:mb-16 justify-center" {...fadeUp(0.12)}>
              <Link to="/auth" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] bg-foreground text-background hover:bg-foreground/90 gap-2 transition-all">
                  Create Free Account <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
              <a href="#how-it-works" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  className="w-full sm:w-auto h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-border/50 hover:border-border transition-all"
                >
                  See How It Works
                </Button>
              </a>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/20"
              {...fadeUp(0.16)}
            >
              {[
                { value: "10K+", label: "Events Listed" },
                { value: "500K+", label: "Tickets Sold" },
                { value: "200+", label: "Cities" },
                { value: "4.9★", label: "Organizer Rating" },
              ].map((s) => (
                <div key={s.label} className="bg-background px-5 py-4 md:px-7 md:py-5">
                  <p className="font-display font-black text-2xl md:text-3xl tracking-tighter text-neon-lime">{s.value}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="border-b border-border/20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
            <motion.div {...fadeUp(0)}>
              <PublicPageHeader
                pillText="Process"
                title={
                  <>
                    How It <span className="text-neon-lime">Works</span>
                  </>
                }
                size="md"
                className="text-center mb-10"
              />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  {...fadeUp(i * 0.07)}
                  className="group rounded-2xl border border-border/30 bg-card p-6 hover:border-border/60 transition-all"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center">
                      <step.icon className="h-4 w-4 text-foreground/60" />
                    </div>
                    <span className="font-display font-black text-4xl leading-none tracking-tighter text-foreground/[0.07] select-none">
                      {step.num}
                    </span>
                  </div>
                  <h3 className="font-black text-[14px] tracking-tight mb-2 leading-snug">{step.title}</h3>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── COMMISSION ── */}
        <section className="border-b border-border/20 bg-card/50">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
            <motion.div {...fadeUp(0)}>
              <PublicPageHeader
                pillText="Transparent Pricing"
                title={
                  <>
                    Simple <span className="text-neon-lime">Commission</span>
                  </>
                }
                subtitle="No monthly fees. Commission only on paid ticket sales."
                size="md"
                className="text-center mb-10"
              />
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border/30 rounded-2xl overflow-hidden border border-border/30">
              {/* Exclusive */}
              <motion.div {...fadeUp(0.05)} className="bg-card p-7 md:p-10">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-xl bg-neon-lime/10 border border-neon-lime/30 flex items-center justify-center">
                      <Lock className="h-3.5 w-3.5 text-neon-lime" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Exclusive</span>
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-[0.25em] bg-neon-lime text-black px-2.5 py-1 rounded-full shrink-0">
                    Best Rate
                  </span>
                </div>

                <div className="mb-1">
                  <span className="font-display font-black text-[4.5rem] md:text-[5.5rem] leading-none tracking-tighter">
                    3<span className="text-neon-lime">%</span>
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-5">+ GST · per paid ticket sold</p>

                <div className="border-t border-border/20 pt-5 mb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    List your event <span className="text-foreground font-bold">exclusively on City Pulse.</span> Lower rate, priority placement, and dedicated support.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {["Tickets sold only through City Pulse", "Priority event placement", "Dedicated organizer support"].map(item => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-neon-lime shrink-0" />
                      <span className="text-[12px] font-medium">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Standard */}
              <motion.div {...fadeUp(0.08)} className="bg-muted/20 p-7 md:p-10">
                <div className="flex items-center gap-2 mb-5">
                  <div className="h-8 w-8 rounded-xl bg-muted border border-border/40 flex items-center justify-center">
                    <Globe2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-muted-foreground">Standard</span>
                </div>

                <div className="mb-1">
                  <span className="font-display font-black text-[4.5rem] md:text-[5.5rem] leading-none tracking-tighter text-foreground">
                    5<span className="text-foreground/30">%</span>
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mb-5">+ GST · per paid ticket sold</p>

                <div className="border-t border-border/20 pt-5 mb-5">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    List on City Pulse <span className="text-foreground font-bold">alongside other platforms.</span> Ideal for multi-channel campaigns.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {["Tickets can be sold on other platforms", "Standard event placement", "Community organizer support"].map(item => (
                    <div key={item} className="flex items-center gap-2.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="text-[12px] font-medium text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.p {...fadeUp(0.14)} className="text-[10px] text-muted-foreground/40 mt-4">
              Free events and RSVP-only events are always free to list.
            </motion.p>
          </div>
        </section>

        {/* ── FEATURES GRID ── */}
        <section className="border-b border-border/20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
            <motion.div {...fadeUp(0)}>
              <PublicPageHeader
                pillText="Everything You Need"
                title={
                  <>
                    Built for <span className="text-neon-lime">Organizers</span>
                  </>
                }
                size="md"
                className="text-center mb-10"
              />
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  {...fadeUp(i * 0.05)}
                  className="flex gap-4 p-5 rounded-2xl border border-border/30 bg-card hover:border-border/60 transition-colors"
                >
                  <div className="h-9 w-9 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 mt-0.5">
                    <feat.icon className="h-4 w-4 text-foreground/55" />
                  </div>
                  <div>
                    <h3 className="font-black text-[13px] tracking-tight mb-1">{feat.title}</h3>
                    <p className="text-[12px] text-muted-foreground leading-relaxed">{feat.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT'S INCLUDED ── */}
        <section className="border-b border-border/20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
            <div className="rounded-2xl border border-border/30 bg-card overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <motion.div {...fadeUp(0)} className="p-7 md:p-12 lg:border-r border-b lg:border-b-0 border-border/20">
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neon-lime mb-4">What's included</p>
                  <h2 className="font-display font-black text-4xl md:text-5xl tracking-tighter leading-[0.9] mb-5">
                    Free to list.<br />Pay only<br />when you sell.
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    No monthly fees, no setup costs. Create your account and publish
                    your first event for free. Commission applies only on paid ticket sales.
                  </p>
                </motion.div>

                <motion.div {...fadeUp(0.08)} className="p-7 md:p-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      "Unlimited event listings",
                      "Custom ticket types & pricing",
                      "Real-time sales dashboard",
                      "QR code ticket scanning",
                      "Attendee communication",
                      "Event analytics & reporting",
                      "Dedicated organizer support",
                      "Boost & marketing add-ons",
                    ].map((item) => (
                      <div key={item} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-neon-lime shrink-0" />
                        <span className="text-[13px] font-medium">{item}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="border-b border-border/20">
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
            <motion.div {...fadeUp(0)}>
              <PublicPageHeader
                pillText="Questions"
                title={
                  <>
                    Frequently Asked <span className="text-neon-lime">Questions</span>
                  </>
                }
                size="md"
                className="text-center mb-10"
              />
            </motion.div>

            <div className="max-w-3xl mx-auto space-y-2">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.05)}
                  className="rounded-xl border border-border/30 overflow-hidden"
                >
                  <button
                    className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 hover:bg-muted/30 transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-black text-sm md:text-[15px] tracking-tight">{faq.q}</span>
                    <div className={cn(
                      "h-6 w-6 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                      openFaq === i ? "border-neon-lime/40 bg-neon-lime/5" : "border-border/50"
                    )}>
                      {openFaq === i
                        ? <ChevronUp className="h-3 w-3 text-neon-lime" />
                        : <ChevronDown className="h-3 w-3 text-muted-foreground" />
                      }
                    </div>
                  </button>
                  <div className={cn("overflow-hidden transition-all duration-300", openFaq === i ? "max-h-48" : "max-h-0")}>
                    <p className="px-5 pb-4 text-[13px] text-muted-foreground leading-relaxed border-t border-border/20 pt-3">
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section>
          <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-14 md:py-20">
            <motion.div
              {...fadeUp(0)}
              className="rounded-2xl md:rounded-3xl bg-neon-lime p-8 md:p-20 text-black relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-10 md:p-16 opacity-10 rotate-12 group-hover:rotate-0 transition-transform duration-700 pointer-events-none">
                <TicketIcon size={240} />
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/50 mb-5">Ready to start?</p>
                <h2 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.85] mb-6">
                  Start listing<br />today.
                </h2>
                <p className="text-black/70 text-sm md:text-base leading-relaxed mb-8 max-w-md">
                  Join thousands of organizers already selling tickets on City Pulse.
                  Free to sign up, no credit card required.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button className="w-full sm:w-auto h-12 px-8 rounded-xl bg-black text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[10px] gap-2 transition-all">
                      Create Your Account <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link to="/auth" className="w-full sm:w-auto">
                    <Button
                      variant="ghost"
                      className="w-full sm:w-auto h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] text-black/60 hover:text-black hover:bg-black/10 transition-all"
                    >
                      Sign In Instead
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

      </main>

      <Footer />
    </div>
  );
};

export default ListYourEventPage;
