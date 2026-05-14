import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Shield, Lock, Eye, Users, Database, Cookie, Settings, RefreshCw, CheckCircle2, AlertTriangle } from "lucide-react";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 relative overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-lime/5 blur-[120px] rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-neon-lime/10 blur-[100px] rounded-full" />
          <div className="absolute top-1/3 left-1/2 w-72 h-72 bg-neon-lime/5 blur-[80px] rounded-full" />
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
              <div className="inline-flex items-center justify-center gap-3 px-6 py-3 bg-neon-lime/10 border-2 border-neon-lime/30 rounded-2xl mb-6">
                <Shield className="h-12 w-12 text-neon-lime" />
                <h1 className="text-4xl md:text-6xl font-black tracking-tight">
                  Privacy <span className="text-neon-lime">Policy</span>
                </h1>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your Data, Your Rights. We take your privacy seriously.
              </p>
            </motion.div>
          </div>

          {/* Last Updated Badge */}
          <div className="flex justify-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-muted/50 border border-border/40 rounded-full text-sm text-muted-foreground">
              <RefreshCw className="h-4 w-4" />
              Last Updated: January 18, 2026
            </span>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {/* Column - Data Privacy Info */}
            <div className="space-y-5 md:space-y-6">
              {/* What We Collect */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-lime/50 transition-all duration-300 group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Database className="h-8 w-8 text-neon-lime/50 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-3 md:pr-10 text-center md:text-left">What We Collect</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Personal & contact info</span>
                  </li>
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Profile & preferences</span>
                  </li>
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Payment & ticket details</span>
                  </li>
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Event participation data</span>
                  </li>
                </ul>
              </motion.div>

              {/* How We Use */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="relative overflow-hidden rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-lime/50 transition-all duration-300 group"
              >
                <div className="absolute top-0 right-0 p-4">
                  <Users className="h-8 w-8 text-neon-lime/50 group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-xl font-black mb-3 md:pr-10 text-center md:text-left">How We Use Data</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Service improvement & delivery</span>
                  </li>
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Transaction processing</span>
                  </li>
                  <li className="flex items-start gap-3 text-center md:text-left">
                    <CheckCircle2 className="h-5 w-5 text-neon-lime flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-foreground/90">Communication & updates</span>
                  </li>
                </ul>
              </motion.div>

              {/* Data Sharing */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-lime/50 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <Eye className="h-6 w-6 text-neon-lime" />
                  <h3 className="text-2xl font-black uppercase tracking-tight">
                    Data <span className="text-neon-lime">Sharing</span>
                  </h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed text-center md:text-left">
                    We only share your personal information when necessary for service delivery or when required by law. Your data is never sold to third parties.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {[
                      { icon: Shield, label: "Limited", desc: "Event organizers only" },
                      { icon: Lock, label: "Secure", desc: "Legal compliance" },
                      { icon: Database, label: "Partners", desc: "Service providers" },
                    ].map((item, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 + 0.4, duration: 0.3 }}
                        className="flex-1 px-4 py-3 bg-muted/50 border border-border/40 rounded-lg text-center hover:bg-neon-lime/10 transition-all"
                      >
                        <item.icon className="h-5 w-5 text-neon-lime/70 mx-auto mb-2" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-neon-lime mb-1">{item.label}</p>
                        <p className="text-xs text-foreground/90">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Cookies Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-lime/30 transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <Cookie className="h-6 w-6 text-neon-lime" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-center md:text-left">
                    <span className="text-neon-lime">Cookies</span>
                  </h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed text-center md:text-left">
                    We use cookies and similar technologies to enhance your experience, analyze usage, and store your preferences. You can control cookie settings in your browser.
                  </p>
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <button className="w-full px-6 py-3 bg-neon-lime/10 border border-neon-lime/30 rounded-lg text-neon-lime font-bold hover:bg-neon-lime/20 transition-all">
                      <Settings className="h-5 w-5 inline mr-2" />
                      Manage Cookie Settings
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Your Rights */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-lime/50 transition-all duration-300 group"
              >
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/40">
                  <Users className="h-6 w-6 text-neon-lime" />
                  <h3 className="text-2xl font-black uppercase tracking-tight text-center md:text-left">
                    Your <span className="text-neon-lime">Rights</span>
                  </h3>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed text-center md:text-left">
                    You have the right to access, update, or delete your personal information at any time. We provide tools for account management and data control.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                    {[
                      { icon: Eye, label: "Access & Control", desc: "Access your personal data" },
                      { icon: Database, label: "Data Portability", desc: "Download your information" },
                      { icon: RefreshCw, label: "Account Deletion", desc: "Permanently remove account" },
                    ].map((right, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.08 + 0.45, duration: 0.3 }}
                        className="flex-1 px-4 py-3 bg-muted/50 border border-border/40 rounded-lg text-center hover:bg-neon-lime/10 transition-all"
                      >
                        <right.icon className="h-5 w-5 text-neon-lime/70 mx-auto mb-2" />
                        <p className="text-xs font-bold text-neon-lime mb-1">{right.label}</p>
                        <p className="text-xs text-foreground/90">{right.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Updates Notice */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="rounded-2xl bg-card border border-border/40 p-6 hover:border-neon-lime/30 transition-all duration-300"
              >
                <div className="space-y-4">
                  <p className="text-sm text-foreground/80 mb-4 leading-relaxed text-center md:text-left">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. Check back periodically for the latest version.
                  </p>
                  <div className="mt-6 pt-6 border-t border-border/40">
                    <h4 className="text-sm font-black uppercase tracking-widest text-neon-lime mb-3 text-center md:text-left">Stay Informed</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { icon: CheckCircle2, label: "Check our blog for updates" },
                        { icon: Shield, label: "Subscribe to newsletter" },
                      ].map((item, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 + 0.55, duration: 0.3 }}
                          className="flex-1 px-4 py-3 bg-neon-lime/10 border border-neon-lime/30 rounded-lg text-center hover:bg-neon-lime/20 transition-all"
                        >
                          <item.icon className="h-5 w-5 text-neon-lime mx-auto mb-2" />
                          <p className="text-xs font-bold">{item.label}</p>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Contact Support Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="rounded-2xl bg-gradient-to-br from-neon-lime/10 via-transparent to-transparent border-2 border-neon-lime/20 p-6"
              >
                <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
                  <AlertTriangle className="h-6 w-6 text-neon-lime flex-shrink-0" />
                  <div className="flex-1">
                    <h4 className="text-sm font-black uppercase tracking-widest text-neon-lime mb-2">Have Questions?</h4>
                    <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                      Our privacy team is here to help. Contact us for any questions about your data, our privacy practices, or your rights.
                    </p>
                    <div className="mt-6 pt-6 border-t border-border/40">
                      <a
                        href="mailto:privacy@citypulse.com"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-neon-lime text-black font-bold rounded-lg hover:bg-neon-lime/80 transition-all md:w-auto w-full"
                        aria-label="Contact Privacy Team via Email"
                      >
                        <Users aria-hidden="true" className="h-5 w-5" />
                        Contact Privacy Team
                      </a>
                    </div>
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

export default PrivacyPolicy;
