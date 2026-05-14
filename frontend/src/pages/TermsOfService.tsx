import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, Scale, Share2, Heart, Phone, CreditCard, Users, AlertTriangle, Globe, Zap, Clock, Calendar, CheckCircle2, Send } from "lucide-react";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-neon-purple/5 blur-[100px] rounded-full" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-neon-pink/5 blur-[120px] rounded-full" />
          <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-neon-lime/5 blur-[80px] rounded-full" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 container py-16 md:py-24 max-w-5xl"
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-neon-purple/10 border-2 border-neon-purple/30 rounded-2xl mb-6">
                <Shield className="h-12 w-12 text-neon-purple" />
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                  Terms and <span className="text-neon-purple">Conditions</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Welcome to City Pulse - Your Gateway to Unforgettable Events & Experiences
              </p>
            </motion.div>
          </div>

          {/* Last Updated Badge */}
          <div className="flex justify-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border/40 rounded-full text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              Last Updated: January 18, 2026
            </span>
          </div>

          {/* Main Content Grid */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8">
            {/* Left Column - Key Points */}
            <div className="space-y-5 md:space-y-6 order-2 md:order-1">
              {/* Platform Overview */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-purple/50 transition-all duration-300 group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Globe className="h-8 w-8 text-neon-purple/50 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-3 md:pr-10 text-center md:text-left">What We Offer</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-purple flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Event discovery & ticketing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Share2 className="h-5 w-5 text-neon-purple flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">WhatsApp & Instagram sharing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-neon-purple flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Offline ticket support</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CreditCard className="h-5 w-5 text-neon-purple flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Secure payment options</span>
                  </li>
                </ul>
              </motion.div>

              {/* User Guidelines */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-pink/50 transition-all duration-300 group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <AlertTriangle className="h-8 w-8 text-neon-pink/50 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-3 md:pr-10 text-center md:text-left">User Guidelines</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-pink flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Must be 18+ to manage events</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-neon-pink flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Respect venue rules & policies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-neon-pink flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Provide accurate event information</span>
                  </li>
                </ul>
              </motion.div>

              {/* Organizer Guidelines */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-lime/50 transition-all duration-300 group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Scale className="h-8 w-8 text-neon-lime/50 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-3 md:pr-10 text-center md:text-left">For Organizers</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Ensure accurate event details</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Follow platform policies</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Configure bank offers & discounts</span>
                  </li>
                </ul>
              </motion.div>
            </div>

            {/* Right Column - Detailed Terms */}
            <div className="space-y-5 md:space-y-6 order-1 md:order-2">
              {/* Ticketing Terms */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-2xl bg-card border border-border/40 p-8 hover:border-neon-pink/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <Zap className="h-6 w-6 text-neon-pink" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">
                    Ticketing <span className="text-neon-pink">Terms</span>
                  </h3>
                </div>
                <ul className="space-y-3">
                  {[
                    "Tickets are non-cancelable, non-refundable and non-transferable.",
                    "Guestlist may shut earlier than the mentioned time once it is full.",
                    "21+ Government Issued ID required (Digilocker/Physical ID).",
                    "Entry must be no later than the time on your ticket.",
                    "Follow the dress code if any.",
                    "Management reserves right to refuse entry per licensing law.",
                    "No illegal substances permitted.",
                    "Internet handling fee per ticket may apply.",
                    "No refund/replacement - personal use only.",
                    "Management reserves exclusive right for admission refusal.",
                    "Terms subject to change at organizer discretion.",
                  ].map((term, idx) => (
                    <motion.li
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.05, duration: 0.3 }}
                      className="flex items-start gap-3 group"
                    >
                      <AlertTriangle className="h-4 w-4 text-neon-pink flex-shrink-0 mt-1" />
                      <span className="text-sm text-foreground/90 leading-relaxed">{term}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl bg-card border border-border/40 p-8 hover:border-neon-purple/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <CreditCard className="h-6 w-6 text-neon-purple" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">
                    Payment <span className="text-neon-purple">Information</span>
                  </h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                    We support multiple secure payment gateways including credit cards, UPI, and net banking. All transactions are processed with industry-standard encryption to ensure your data security.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {["Credit Cards", "UPI", "Net Banking", "Digital Wallets"].map((method, idx) => (
                      <motion.div
                        key={method}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + 0.35, duration: 0.3 }}
                        className="flex-1 px-4 py-3 bg-neon-purple/10 border border-neon-purple/30 rounded-lg text-sm font-bold text-foreground/90"
                      >
                        {method}
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-4 italic">
                    * Organizers can configure bank-specific offers and discounts for their events.
                  </p>
                </div>
              </motion.div>

              {/* Contact & Support */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="rounded-2xl bg-card border border-border/40 p-8 hover:border-neon-lime/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <Phone className="h-6 w-6 text-neon-lime" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">
                    Get <span className="text-neon-lime">Support</span>
                  </h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed">
                    Need help? Our support team is available 24/7 to assist you with any questions or concerns about our platform, events, or ticketing.
                  </p>
                  <a
                    href="mailto:support@citypulse.com"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-neon-lime text-black font-bold rounded-lg hover:bg-neon-lime/80 transition-all"
                  >
                    <Send className="h-5 w-5" />
                    Contact Support Team
                  </a>
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <h4 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-3 text-center md:text-left">Alternative Contact Methods</h4>
                    <div className="flex flex-wrap justify-center md:justify-start gap-3">
                      {[
                        { icon: Phone, label: "Phone", value: "+91 XXXXXXXXXX" },
                        { icon: Send, label: "Email", value: "support@citypulse.com" },
                        { icon: Share2, label: "Social", value: "@citypulse" },
                      ].map((contact, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.08 + 0.4, duration: 0.3 }}
                          className="flex-1 px-4 py-3 bg-muted/50 border border-border/40 rounded-lg text-sm"
                        >
                          <contact.icon className="h-4 w-4 text-muted-foreground/70 flex-shrink-0" />
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{contact.label}</p>
                            <p className="text-sm text-foreground">{contact.value}</p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Liability Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl bg-gradient-to-br from-rose-500/10 via-transparent to-transparent border-2 border-rose-500/20 p-6"
              >
                <div className="flex items-start gap-4">
                  <AlertTriangle className="h-5 w-5 text-rose-500 flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-widest text-rose-500 mb-2">Important Notice</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed">
                      City Pulse is not responsible for indirect, incidental, special, consequential, or punitive damages resulting from your use of the service. Please review our terms carefully and contact support if you have questions.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
