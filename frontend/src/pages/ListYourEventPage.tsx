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
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] },
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
    description: "Add all your event details — dates, venue, lineup, ticket types and pricing.",
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
    description: "Monitor sales, manage attendees, scan QR codes at the door — all from one dashboard.",
    icon: BarChart3,
  },
];

const FEATURES = [
  {
    icon: TicketIcon,
    title: "Flexible Ticketing",
    description: "Create multiple ticket tiers — General, VIP, Early Bird. Set capacity limits and custom pricing.",
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
    a: "Yes — creating an account and listing your event is completely free. A small service fee applies only on paid ticket sales.",
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
    a: "Concerts, comedy shows, workshops, club nights, sports events, art exhibitions — any live event is welcome.",
  },
];

const ListYourEventPage = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />

      <main className="flex-1 pt-16 md:pt-20">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 space-y-0 pb-24">

          {/* ── HERO ── */}
          <section className="relative overflow-hidden pb-20 md:pb-28 border-b border-border/20 text-center">
            <div className="relative z-10">
              <motion.p
                className="text-[9px] font-black uppercase tracking-[0.6em] text-muted-foreground/50 mb-5"
                {...fadeUp(0)}
              >
                For Organizers · City Pulse
              </motion.p>
              <motion.h1
                className="font-display font-black leading-[0.85] tracking-tighter text-[clamp(3.5rem,10vw,8rem)] mb-6"
                {...fadeUp(0.05)}
              >
                List Your<br />
                <span className="text-neon-lime">Event.</span>
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-base md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto"
                {...fadeUp(0.1)}
              >
                Reach thousands of event-goers in your city. Sell tickets, manage
                your crowd, and grow your audience — all on City Pulse.
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center"
                {...fadeUp(0.15)}
              >
                <Link to="/auth">
                  <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] bg-neon-lime text-black hover:bg-[#D4FF00] hover:shadow-[0_8px_32px_rgba(180,255,0,0.4)] transition-all gap-2">
                    Create Free Account <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button
                    variant="outline"
                    className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] border-border/40 hover:border-neon-lime/40 hover:text-neon-lime transition-all"
                  >
                    See How It Works
                  </Button>
                </a>
              </motion.div>

              {/* Stats row */}
              <motion.div
                className="flex flex-wrap items-center justify-center gap-12 mt-16 pt-12 border-t border-border/20"
                {...fadeUp(0.22)}
              >
                {[
                  { value: "10K+", label: "Events Listed" },
                  { value: "500K+", label: "Tickets Sold" },
                  { value: "200+", label: "Cities" },
                  { value: "4.9★", label: "Organizer Rating" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className="font-display font-black text-4xl md:text-5xl tracking-tighter text-neon-lime">{s.value}</p>
                    <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground mt-1">{s.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how-it-works" className="py-20 md:py-28 border-b border-border/20">
            <motion.div className="mb-14" {...fadeUp(0)}>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neon-lime mb-3">Process</p>
              <h2 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.88]">
                How it works.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {STEPS.map((step, i) => (
                <motion.div
                  key={step.num}
                  {...fadeUp(i * 0.08)}
                  className="group relative border border-border/30 rounded-3xl p-8 bg-card hover:border-neon-lime/30 hover:shadow-[0_0_40px_rgba(180,255,0,0.04)] transition-all"
                >
                  <span className="font-display font-black text-[5rem] leading-none tracking-tighter text-neon-lime/15 group-hover:text-neon-lime/25 transition-colors block mb-4">
                    {step.num}
                  </span>
                  <div className="h-11 w-11 rounded-2xl border border-border/40 bg-background flex items-center justify-center mb-5">
                    <step.icon className="h-5 w-5 text-muted-foreground group-hover:text-neon-lime transition-colors" />
                  </div>
                  <h3 className="font-black text-base tracking-tight mb-2">{step.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── FEATURES GRID ── */}
          <section className="py-20 md:py-28 border-b border-border/20">
            <motion.div className="mb-14" {...fadeUp(0)}>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neon-lime mb-3">Everything you need</p>
              <h2 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.88]">
                Built for organizers.
              </h2>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES.map((feat, i) => (
                <motion.div
                  key={feat.title}
                  {...fadeUp(i * 0.07)}
                  className="group border border-border/30 rounded-3xl p-8 bg-card hover:border-neon-lime/30 hover:shadow-[0_0_40px_rgba(180,255,0,0.04)] transition-all"
                >
                  <div className="h-12 w-12 rounded-2xl border border-border/40 bg-background flex items-center justify-center mb-6 group-hover:border-neon-lime/40 transition-colors">
                    <feat.icon className="h-5 w-5 text-muted-foreground group-hover:text-neon-lime transition-colors" />
                  </div>
                  <h3 className="font-black text-base tracking-tight mb-2">{feat.title}</h3>
                  <p className="text-[13px] text-muted-foreground leading-relaxed">{feat.description}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── WHAT'S INCLUDED ── */}
          <section className="py-20 md:py-28 border-b border-border/20">
            <div className="rounded-[2.5rem] border border-border/30 bg-card p-10 md:p-16">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
                <motion.div {...fadeUp(0)}>
                  <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neon-lime mb-4">What's included</p>
                  <h2 className="font-display font-black text-5xl md:text-6xl tracking-tighter leading-[0.88] mb-6">
                    Free to list.<br />Pay only when<br />you sell.
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                    No monthly fees, no setup costs. Create your organizer account and publish your first
                    event for free. A small platform fee applies only on paid ticket sales.
                  </p>
                </motion.div>

                <motion.div {...fadeUp(0.1)} className="space-y-4">
                  {[
                    "Unlimited event listings",
                    "Customizable ticket types & pricing",
                    "Real-time sales dashboard",
                    "QR code ticket scanning",
                    "Attendee communication tools",
                    "Event analytics & reporting",
                    "Dedicated organizer support",
                    "Boost & marketing add-ons",
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 py-1">
                      <CheckCircle2 className="h-5 w-5 text-neon-lime shrink-0" />
                      <span className="text-sm md:text-base font-medium">{item}</span>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </section>

          {/* ── FAQ ── */}
          <section className="py-20 md:py-28 border-b border-border/20">
            <motion.div className="mb-14" {...fadeUp(0)}>
              <p className="text-[9px] font-black uppercase tracking-[0.5em] text-neon-lime mb-3">Questions</p>
              <h2 className="font-display font-black text-5xl md:text-7xl tracking-tighter leading-[0.88]">
                FAQ.
              </h2>
            </motion.div>

            <div className="space-y-2 max-w-4xl">
              {FAQS.map((faq, i) => (
                <motion.div
                  key={i}
                  {...fadeUp(i * 0.06)}
                  className="border border-border/30 rounded-2xl overflow-hidden hover:border-neon-lime/20 transition-colors"
                >
                  <button
                    className="w-full flex items-center justify-between px-8 py-6 text-left gap-6 hover:bg-card transition-colors"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <span className="font-black text-base md:text-lg tracking-tight">{faq.q}</span>
                    {openFaq === i ? (
                      <ChevronUp className="h-5 w-5 text-neon-lime shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                  <div
                    className={cn(
                      "overflow-hidden transition-all duration-300",
                      openFaq === i ? "max-h-48" : "max-h-0"
                    )}
                  >
                    <p className="px-8 pb-6 text-sm md:text-base text-muted-foreground leading-relaxed">
                      {faq.a}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className="pt-20 md:pt-28">
            <motion.div
              {...fadeUp(0)}
              className="bg-neon-lime rounded-[3rem] p-14 md:p-20 text-black relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-16 opacity-10 rotate-12 transition-transform group-hover:rotate-0 pointer-events-none">
                <TicketIcon size={280} />
              </div>
              <div className="relative z-10">
                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-black/50 mb-5">Ready to start?</p>
                <h2 className="font-display font-black text-5xl md:text-8xl tracking-tighter leading-[0.85] mb-6">
                  Start listing<br />today.
                </h2>
                <p className="text-black/70 text-base md:text-lg leading-relaxed mb-10 max-w-lg">
                  Join thousands of organizers already selling tickets on City Pulse.
                  Free to sign up — no credit card required.
                </p>
                <Link to="/auth">
                  <Button className="h-14 px-10 rounded-2xl bg-black text-white hover:bg-zinc-800 font-black uppercase tracking-widest text-[11px] shadow-xl gap-2 transition-all">
                    Create Your Account <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </motion.div>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ListYourEventPage;
