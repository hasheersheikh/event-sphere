import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Search, BookOpen, MessageCircle, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";

const HelpCenter = () => {
  const categories = [
    { title: "Booking Tickets", icon: HelpCircle, items: [
      { q: "How do I book a ticket?", a: "Find an event you like, select the ticket type and quantity, and click 'Book Now'. You'll be redirected to a secure payment page (or confirmation for free events)." },
      { q: "Where can I find my tickets?", a: "Once booked, your tickets are available in the 'My Tickets' section of your dashboard. You'll also receive an email confirmation." },
      { q: "Can I cancel a booking?", a: "Cancellation policies are set by individual event organizers. Check the event details or contact the organizer directly for refund requests." }
    ]},
    { title: "Managing Events", icon: BookOpen, items: [
      { q: "How do I create an event?", a: "If you have an Event Manager role, you can click 'Create New Event' on your dashboard. Follow the multi-step form to add details, tickets, and images." },
      { q: "How do I scan attendee tickets?", a: "Access the 'Scanner' via the navigation bar on your mobile device. Grant camera permissions and scan the QR codes on attendee tickets." },
      { q: "Can I edit an event after publishing?", a: "Yes, you can edit your event details from the 'My Created Events' section on your dashboard." }
    ]},
    { title: "Account & Security", icon: MessageCircle, items: [
      { q: "How do I change my password?", a: "Navigate to your profile settings to update your password and other account information." },
      { q: "Is my payment information secure?", a: "Yes, we use industry-standard encryption and secure payment gateways. We never store your full credit card details on our servers." }
    ]}
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Search Hero */}
        <section className="py-16 md:py-24 bg-primary/5 border-b">
          <div className="container text-center max-w-3xl mx-auto px-4">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-5xl font-bold mb-6"
            >
              How can we <span className="gradient-text">help you?</span>
            </motion.h1>
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input 
                placeholder="Search for articles, guides, or FAQs..." 
                className="pl-12 h-14 text-lg rounded-2xl shadow-sm border-primary/10 focus-visible:ring-primary"
              />
            </div>
          </div>
        </section>

        {/* Categories & FAQs */}
        <section className="py-20 container max-w-5xl mx-auto px-4">
          <div className="grid gap-12">
            {categories.map((category, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <category.icon className="h-6 w-6" />
                  </div>
                  <h2 className="text-2xl font-bold">{category.title}</h2>
                </div>
                
                <Accordion type="single" collapsible className="w-full space-y-3">
                  {category.items.map((item, i) => (
                    <AccordionItem 
                      key={i} 
                      value={`item-${idx}-${i}`}
                      className="border rounded-2xl px-6 bg-card hover:bg-muted/30 transition-colors"
                    >
                      <AccordionTrigger className="text-left font-semibold hover:no-underline py-4">
                        {item.q}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground pb-4 leading-relaxed">
                        {item.a}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Still Need Help? */}
        <section className="py-20 bg-muted/30 border-y">
          <div className="container text-center max-w-2xl mx-auto px-4">
            <h2 className="text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-muted-foreground text-lg mb-8">
              Our support team is always ready to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/contact">
                <Button size="lg" className="px-8 h-12 rounded-xl shadow-button">
                  Contact Support
                </Button>
              </Link>
              <a href="mailto:support@eventsphere.com">
                <Button variant="outline" size="lg" className="px-8 h-12 rounded-xl">
                  Email Us Directly
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

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default HelpCenter;
