import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Ticket, Camera, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrganizerCta() {
  return (
    <section className="py-8 md:py-14 border-t border-border/20">
      <div className="container px-3 md:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="dark rounded-2xl border border-border/40 overflow-hidden"
        >
          {/* Customer Steps */}
          <div className="relative overflow-hidden bg-background py-16 md:py-24 text-center px-6">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/concert-crowd-silhouette.jpg')" }}
            />
            <div className="absolute inset-0 bg-background/85" />

            <div className="relative z-10 max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-foreground mb-3 leading-tight">
                We Help you to{" "}
                <span className="text-neon-lime">catch the City Pulse</span>
              </h2>
              <p className="text-muted-foreground text-sm">
                Discover events, book your spot, create memories
              </p>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto">
              {[
                { icon: Search, title: "Discover Events", accent: "you like", desc: "Find the absolute best concerts, secret parties, and local workshops happening right around you." },
                { icon: Ticket, title: "Book Your", accent: "Spot", desc: "Purchase tickets instantly with secure one-tap checkout. No booking fees, no complications." },
                { icon: Camera, title: "Get Memories", accent: "& Friends", desc: "Attend events, share vibes with awesome folks, and bring home epic memories that last forever." },
              ].map(({ icon: Icon, title, accent, desc }, i) => (
                <motion.div
                  key={title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.12 }}
                  className="flex flex-col items-center"
                >
                  <div className="h-14 w-14 rounded-full border-2 border-neon-lime flex items-center justify-center text-neon-lime mb-5 shrink-0">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-foreground mb-2">
                    {title} <span className="text-neon-lime">{accent}</span>
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">{desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* For Creators & Organizers */}
          <div className="relative py-16 md:py-24 text-center px-6">
            {/* Background image with overlay */}
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: "url('/images/performer-stage-silhouette.jpg')" }}
            />
            <div className="absolute inset-0 bg-background/85" />

            {/* Content */}
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground mb-3">
                For Creators & Organizers
              </p>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight text-foreground mb-6 leading-tight">
                The City{" "}
                <span className="text-neon-lime">Experience</span>
              </h2>

              <div className="max-w-3xl mx-auto space-y-4 mb-8">
                <h3 className="text-lg md:text-xl font-black text-foreground leading-tight">
                  List Your Events, Venues, Stores, Artists, Adventure Camps, and Sports Activities
                </h3>
                <p className="text-muted-foreground text-sm md:text-base italic">
                  Less than 2 minutes to go live and maximize your impact
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link to="/list-your-event">
                  <Button className="h-11 px-6 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-black uppercase tracking-widest text-[10px]">
                    <Megaphone className="h-4 w-4 mr-2" />
                    List Your Event
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
