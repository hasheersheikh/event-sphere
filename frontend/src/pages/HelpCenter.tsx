import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  BookOpen,
  MessageCircle,
  HelpCircle,
  ChevronDown,
  Ticket,
  ShieldCheck,
  Mail,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

const categories = [
  {
    title: "Post-Event Services",
    icon: Ticket,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    items: [
      {
        q: "Can I view my past event attendances?",
        a: "Yes, you can view all your past and upcoming event attendances in the 'My Tickets' section of your dashboard.",
      },
    ],
  },
  {
    title: "Refunds and Event Changes",
    icon: BookOpen,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    items: [
      {
        q: "Can I get a refund if I miss an event?",
        a: "Refund eligibility depends on the event organizer's policy. Generally, missed events are non-refundable unless specified otherwise.",
      },
      {
        q: "What's the refund policy for event cancellations?",
        a: "If an event is cancelled by the organizer, a full refund is typically processed automatically through City Pulse within 5-7 business days.",
      },
    ],
  },
  {
    title: "Payment and Ticket Delivery",
    icon: Sparkles,
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    items: [
      {
        q: "What payment methods are available?",
        a: "We support all major Credit/Debit cards, UPI, and popular digital wallets via our secure payment gateway.",
      },
      {
        q: "How are tickets delivered?",
        a: "Tickets are delivered instantly via email and are also available for download in the 'My Tickets' section of your profile.",
      },
      {
        q: "How will I receive my tickets?",
        a: "Once booking is successful, you will receive a confirmation email with your E-ticket and QR code.",
      },
    ],
  },
  {
    title: "How City Pulse Works",
    icon: MessageCircle,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    items: [
      {
        q: "How do I find events and purchase tickets on City Pulse?",
        a: "Browse events on our homepage, select the one you like, choose your ticket type, and complete the secure checkout process.",
      },
    ],
  },
  {
    title: "Security & Data",
    icon: ShieldCheck,
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    items: [
      {
        q: "How does City Pulse protect my personal and payment data?",
        a: "City Pulse uses industry-standard SSL encryption and secure payment processors. We never store your full payment details on our servers.",
      },
    ],
  },
  {
    title: "Legal",
    icon: ShieldCheck,
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/20",
    items: [
      {
        q: "Where can I find the Terms & Conditions?",
        a: "Our Terms & Conditions can be found at the footer of every page or by clicking 'Terms' in the Support menu.",
      },
      {
        q: "What is your Privacy Policy?",
        a: "We value your privacy. You can read our full Privacy Policy in the footer or under the Legal section of our Help Center.",
      },
    ],
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={cn(
        "border rounded-2xl overflow-hidden transition-all duration-300",
        open ? "border-primary/30 bg-primary/5" : "border-border/50 bg-card/50 hover:border-border"
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-bold text-sm text-foreground leading-snug">{q}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300",
            open && "rotate-180 text-primary"
          )}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
          >
            <p className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed border-t border-border/40 pt-4">
              {a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const HelpCenter = () => {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = categories
    .map((cat) => ({
      ...cat,
      items: cat.items.filter(
        ({ q, a }) =>
          q.toLowerCase().includes(search.toLowerCase()) ||
          a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((cat) =>
      search
        ? cat.items.length > 0
        : activeCategory === null || cat.title === activeCategory
    );

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="flex-1 relative z-10">
        {/* ── Hero ── */}
        <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden">
          <div className="container relative z-20 max-w-4xl mx-auto px-4 text-center">
            <PublicPageHeader
              pillText="Support Center"
              title={
                <>
                  How can <span className="text-primary italic">City Pulse</span> help?
                </>
              }
              subtitle="Search our knowledge base or browse categories below to find answers fast."
              themeColor="primary"
              size="md"
            />

            {/* Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="relative max-w-2xl mx-auto mt-12"
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search questions..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActiveCategory(null);
                }}
                className="h-16 pl-14 text-base rounded-2xl bg-card/80 border-border shadow-xl backdrop-blur focus:border-primary/50 focus:ring-primary/20"
              />
            </motion.div>

            {/* Category pills */}
            {!search && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex flex-wrap items-center justify-center gap-2 mt-8"
              >
                <button
                  onClick={() => setActiveCategory(null)}
                  className={cn(
                    "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                    activeCategory === null
                      ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted",
                  )}
                >
                  All Topics
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.title}
                    onClick={() => setActiveCategory(cat.title)}
                    className={cn(
                      "px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                      activeCategory === cat.title
                        ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20"
                        : "bg-muted/50 border-border/50 text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {cat.title}
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        </section>

        {/* ── FAQ Grid ── */}
        <section className="container max-w-5xl mx-auto px-4 pb-24">
          {filtered.length === 0 ? (
            <div className="py-24 text-center space-y-4">
              <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center mx-auto">
                <Search className="h-8 w-8 text-muted-foreground/30" />
              </div>
              <p className="text-muted-foreground font-bold">No results for &ldquo;{search}&rdquo;</p>
              <button
                onClick={() => setSearch("")}
                className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline"
              >
                Clear search
              </button>
            </div>
          ) : (
            <div className="space-y-12">
              {filtered.map((cat, idx) => (
                <motion.div
                  key={cat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  {/* Category header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className={cn("h-12 w-12 rounded-2xl border flex items-center justify-center", cat.bg, cat.border)}>
                      <cat.icon className={cn("h-6 w-6", cat.color)} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.35em] text-muted-foreground">
                        Category
                      </p>
                      <h2 className="text-xl font-black uppercase tracking-tighter italic">
                        {cat.title}
                      </h2>
                    </div>
                    <div className="ml-auto h-px flex-1 bg-gradient-to-r from-border to-transparent" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      {cat.items.length} {cat.items.length === 1 ? "article" : "articles"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {cat.items.map((item, i) => (
                      <FaqItem key={i} q={item.q} a={item.a} />
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* ── Still Need Help ── */}
        <section className="border-t border-border/50 bg-card/30">
          <div className="container max-w-4xl mx-auto px-4 py-20 text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-muted/50 border border-border rounded-full text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Still Stuck?
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
              Talk to <span className="text-primary">Support.</span>
            </h2>
            <p className="text-muted-foreground font-medium italic max-w-md mx-auto">
              Our team is ready to help you with anything not covered in the docs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center gap-2 group">
                  Contact Support
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <a href="mailto:support@citypulse.com">
                <Button variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                  <Mail className="h-4 w-4" />
                  Email Us
                </Button>
              </a>
              <a href="https://wa.me/1234567890" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] flex items-center gap-2 border-emerald-500/50 hover:bg-emerald-500/10 text-emerald-500 transition-all hover:scale-105 active:scale-95">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Us
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HelpCenter;
