import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Mail, Phone, MapPin, Send, MessageSquare, HelpCircle, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useState } from "react";

const ContactPage = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success("Message sent! We'll get back to you shortly.");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  const contactInfo = [
    { icon: Mail, label: "Email Support", value: "support@citypulse.com" },
    { icon: MessageSquare, label: "WhatsApp Us", value: "+91 98765-43210" },
    { icon: Phone, label: "Call Us", value: "+91 1800-CITY-PULSE" },
    {
      icon: MapPin,
      label: "Office",
      value: "Cyber Hub, Gurugram, India 122002",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 relative z-10">
        {/* Header */}
        <section className="relative pt-16 pb-8 md:pt-20 md:pb-12 overflow-hidden">
          <div className="container relative z-20">
            <PublicPageHeader
              pillText="Connect with Us"
              title={
                <>
                  Get in <span className="text-primary italic">Touch.</span>
                </>
              }
              subtitle="Have questions or feedback? We'd love to hear from you. Our team typically responds within 24 hours."
              themeColor="primary"
              size="md"
            />
          </div>
        </section>

        <section className="py-20 container max-w-6xl mx-auto px-4">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Quick Help Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="lg:col-span-12 p-8 rounded-[2.5rem] bg-primary/5 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-8 mb-4 group hover:bg-primary/[0.08] transition-all duration-500"
            >
              <div className="flex items-center gap-6">
                <div className="h-16 w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform duration-500">
                  <HelpCircle className="h-8 w-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold uppercase tracking-tighter italic">Looking for instant answers?</h3>
                  <p className="text-muted-foreground font-medium italic">Our Help Center has answers to the most common questions.</p>
                </div>
              </div>
              <Link to="/help">
                <Button className="h-14 px-10 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-button gap-3 bg-primary text-primary-foreground hover:scale-105 transition-all">
                  Visit Help Center
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </motion.div>

            <div className="lg:col-span-12 grid lg:grid-cols-2 gap-16 mt-8">
            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-card rounded-3xl border p-8 md:p-12 shadow-sm"
            >
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-primary" />
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      required
                      className="rounded-xl h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <SelectBox id="subject" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">How can we help?</Label>
                  <Textarea
                    id="message"
                    placeholder="Tell us about your inquiry..."
                    className="rounded-xl min-h-[150px] resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-lg rounded-xl shadow-button gap-2"
                  disabled={isSubmitting}
                >
                  <Send
                    className={`h-5 w-5 ${isSubmitting ? "animate-pulse" : ""}`}
                  />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>

            {/* Info Cards */}
            <div className="space-y-8">
              <div className="grid gap-6">
                {contactInfo.map((info, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="p-8 bg-muted/30 rounded-3xl border flex items-start gap-5 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <info.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">{info.label}</h3>
                      <p className="text-muted-foreground">{info.value}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="rounded-3xl border overflow-hidden h-64 bg-muted relative group">
                <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors duration-500" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="h-10 w-10 text-primary mx-auto mb-2 animate-bounce" />
                    <span className="font-semibold">City Pulse HQ</span>
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 right-4 p-4 bg-background/80 backdrop-blur-sm rounded-xl text-xs text-muted-foreground border">
                  Cyber Hub, DLF Phase 2, Gurugram
                </div>
              </div>
            </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

const SelectBox = ({ id }: { id: string }) => (
  <select
    id={id}
    className="w-full h-12 rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
  >
    <option value="general">General Inquiry</option>
    <option value="booking">Booking Issue</option>
    <option value="manager">Event Management</option>
    <option value="technical">Technical Support</option>
    <option value="other">Other</option>
  </select>
);

export default ContactPage;
