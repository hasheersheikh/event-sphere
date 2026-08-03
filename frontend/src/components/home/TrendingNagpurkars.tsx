import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail } from "lucide-react";
import PublicPageHeader from "@/components/layout/PublicPageHeader";
import MarqueeCarousel from "@/components/events/MarqueeCarousel";
import MobileMarqueeCarousel from "@/components/events/MobileMarqueeCarousel";

interface Nagpurkar {
  id: number;
  category: string;
  name: string;
  tagline: string;
  description: string;
  image: string | null;
  isLogo?: boolean;
  contact?: string;
}

const CATEGORIES = ["All", "Artists", "Sports Person", "Influencers", "Entrepreneur", "Organisation", "Hidden Gems"];

const BADGE_COLORS: Record<string, string> = {
  Artists: "bg-primary text-primary-foreground",
  "Sports Person": "bg-blue-500 text-white",
  Influencers: "bg-pink-500 text-white",
  Entrepreneur: "bg-orange-500 text-white",
  Organisation: "bg-violet-500 text-white",
  "Hidden Gems": "bg-amber-400 text-black",
};

const NAGPURKARS: Nagpurkar[] = [
  {
    id: 1,
    category: "Artists",
    name: "RJ Aamod",
    tagline: "Mudde Ki Baat",
    description: "RJ Aamod is a seasoned radio jockey based in Nagpur, widely known for his association with the popular radio station 94.3 MY FM. He hosts engaging shows including 'Mudde Ki Baat' (Monday to Saturday, 07:00–10:00 AM) and 'Mahul Morning' (08:00–10:00 AM). Recognized for his strong communication skills and deep understanding of commercial radio, content curation, and balancing audience engagement with entertainment.",
    image: "/images/photos/rj-aamod.jpg",
  },
  {
    id: 2,
    category: "Influencers",
    name: "Amir Sheikh",
    tagline: "Jo X Factor par dikhta hai wo bikta hai",
    description: "Amir Sheikh is one of Nagpur's most recognized digital creators and entrepreneurs, widely regarded as a preferred choice for brands seeking impactful influencer marketing and audience engagement. He is known for creating high-performing lifestyle, business, fashion, travel, and entertainment content. Amir Sheikh also serves as the Brand Ambassador of NMC (Nagpur Municipal Corporation) and has been honored with several prestigious awards including Lokmat Awards, Pride of Real Estate Awards, Bharat Brands Conclave Awards, and the Power Influencer Award at IIM Nagpur.",
    image: "/images/photos/amir-sheikh.png",
    contact: "nagpurxfactorb@gmail.com",
  },
  {
    id: 3,
    category: "Sports Person",
    name: "Raunak Sadhwani",
    tagline: "Nagpur's Chess Prodigy, The World's Challenger",
    description: "Nagpur continues to firmly cement its status as India's ultimate chess capital, and Raunak Sadhwani is leading the charge on the global stage! The fiercely talented Grandmaster is actively pushing deep into the global elite. Fresh off guiding his team, C'Chartres Echecs, to a historic triumph at the French Top 16 Club Championship, Nagpur's own prodigy is now relentlessly campaigning to cross the legendary 2700 Elo rating milestone. From our local streets straight to outwitting the world's best, Raunak is proving that Orange City's grit knows no bounds.",
    image: "/images/photos/raunak-sadhwani.jpg",
  },
  {
    id: 4,
    category: "Hidden Gems",
    name: "Gandhe Brothers",
    tagline: "Nagpur's Culinary Pride — Master Chef",
    description: "Vikram and Ajinkya Gandhe, popularly known as the Gandhe Brothers, are the winners of MasterChef India Season 9 and the first duo to win the prestigious culinary competition. Based in Nagpur, they are the founders of Place Bakehouse & Coffee, a popular café and restaurant known for its innovative baked creations and contemporary cuisine. Celebrated for their creativity and passion for food, the Gandhe Brothers have become among India's most recognized culinary creators, inspiring a new generation of chefs and food entrepreneurs.",
    image: "/images/photos/gandhe-brothers.png",
  },
  {
    id: 5,
    category: "Artists",
    name: "Emcee Manoj",
    tagline: "The Ultimate Anchor for Unforgettable Events.",
    description: "Emcee Manoj is one of Nagpur's leading professional emcees, known for hosting corporate events, luxury weddings, award ceremonies, concerts, and entertainment shows. With a dynamic stage presence, exceptional audience engagement, and years of experience, he is a preferred host for leading brands, businesses, and high-profile events across Central India.",
    image: "/images/photos/emcee-manoj.png",
  },
  {
    id: 6,
    category: "Artists",
    name: "Sagar",
    tagline: "Vocalist with Rhythm and Soulful Voice",
    description: "Sagar, vocalist of SAAZ band, is known for weaving powerful melodies, rhythm, and emotion into unforgettable sonic landscapes. From high-energy studio productions to captivating live performances, Sagar from SAAZ Music blends cultural depth with modern beats to define a unique sound.",
    image: "/images/photos/sagar-vocalist.png",
  },
  {
    id: 7,
    category: "Sports Person",
    name: "Divya Deshmukh",
    tagline: "The Golden Girl of Indian Chess.",
    description: "Divya Deshmukh is an extraordinary chess Grandmaster from Nagpur who has emerged as a leading icon in international chess. She etched her name in history by winning the FIDE Women's World Cup, becoming the first Indian woman to ever lift the prestigious trophy. This historic triumph directly earned her the full Grandmaster (GM) title, making her only the fourth Indian woman in history to achieve the milestone.",
    image: "/images/photos/divya-deshmukh.png",
  },
  {
    id: 8,
    category: "Organisation",
    name: "Onbookr.com",
    tagline: "Booking Made Simple for Service Businesses",
    description: "Onbookr is an online appointment scheduling platform that helps service businesses manage bookings, automate reminders, sync calendars, and accept payments from a single dashboard. Ideal for consultants, coaches, healthcare providers, salons, freelancers, and other service-based businesses looking to simplify scheduling and reduce no-shows.",
    image: "/images/photos/onbookr.png",
    isLogo: true,
  },
  {
    id: 9,
    category: "Organisation",
    name: "AgriPilot.AI",
    tagline: "AI for Smarter Agriculture",
    description: "AgriPilot.ai is an AI-powered agritech platform that helps farmers and agribusinesses improve productivity through real-time crop monitoring, weather insights, soil analysis, and data-driven recommendations. By combining AI, IoT, and satellite technology, it enables smarter farming decisions while improving resource efficiency and sustainability.",
    image: "/images/photos/agripilot-ai.png",
    isLogo: true,
  },
  {
    id: 10,
    category: "Organisation",
    name: "Clover Carte",
    tagline: "The Future of Unattended Retail",
    description: "Clover Carte, started in Nagpur, is a highly innovative Indian tech startup transforming the automated retail landscape. By designing and manufacturing fully custom, IoT-enabled smart vending machines, they have seamlessly bridged the gap between hardware precision and intelligent software. Their proprietary cloud platform gives businesses real-time control over inventory, analytics, and cashless payment tracking.",
    image: "/images/photos/clover-carte.png",
    isLogo: true,
  },
  {
    id: 11,
    category: "Entrepreneur",
    name: "Sahil Chawla",
    tagline: "Bridging Nagpur to Silicon Valley.",
    description: "Widely recognised for the patented E-Funnel, Sahil Chawla is a prominent entrepreneur and technology innovator. A New Champions member at the World Economic Forum since October 2023, he is the CEO and Co-Founder of Tsecond Inc. His notable achievements include inventing the Electronic Funnel, securing a copyright recognized in 168 countries, and initiating a patent application. He is a Charter Member of TiE Nagpur and has signed an MOU with the Indian Angel Network for incubation purposes.",
    image: "/images/photos/sahil-chawla.jpg",
  },
];

const initials = (name: string) => name.split(" ").map(w => w[0]).join("");

const NagpurkarCardContent = ({ person }: { person: Nagpurkar }) => (
  <div>
    <div className="relative aspect-[4/5] w-full rounded-xl md:rounded-2xl overflow-hidden border border-border/60 group-hover:border-primary/40 transition-all duration-300 bg-muted/20">
      {person.isLogo ? (
        /* Logo card — same 4:5 ratio, logo contained on dark bg */
        <div className="absolute inset-0 flex items-center justify-center p-10 bg-card/60">
          <img
            src={person.image!}
            alt={person.name}
            className="w-full h-full object-contain"
          />
        </div>
      ) : person.image ? (
        <img
          src={person.image}
          alt={person.name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-primary/30 via-primary/10 to-background flex items-center justify-center">
          <span className="text-6xl font-black text-primary/50 tracking-tighter">{initials(person.name)}</span>
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

      <div className="absolute top-3 left-3 z-10">
        <span className={`inline-flex items-center text-[7px] md:text-[8px] font-black uppercase tracking-[0.15em] px-2.5 py-1 rounded-full ${BADGE_COLORS[person.category] || "bg-primary text-primary-foreground"}`}>
          {person.category}
        </span>
      </div>
    </div>

    {/* Name + tagline — below the image, centered, matching Upcoming Events */}
    <div className="mt-3 text-center">
      <h4 className="font-black text-lg md:text-xl tracking-tight leading-snug line-clamp-1 text-foreground">
        {person.name}
      </h4>
      <p className="text-[11px] font-black text-neon-lime uppercase tracking-widest mt-1 line-clamp-1">
        {person.tagline}
      </p>
    </div>
  </div>
);

const TrendingNagpurkars = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [selected, setSelected] = useState<Nagpurkar | null>(null);

  const filtered = activeCategory === "All"
    ? NAGPURKARS
    : NAGPURKARS.filter(n => n.category === activeCategory);

  return (
    <section className="py-8 md:py-14 border-t border-border/20">
      <div className="container px-3 md:px-4">
        <div className="mb-6 md:mb-10">
          <PublicPageHeader
            pillText="Faces of the City"
            title={
              <>
                Trending <span className="text-neon-lime">Nagpurkars</span>
              </>
            }
            size="md"
            className="text-center mb-6"
          />

          {/* Category filter pills */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 justify-center">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 text-[9px] md:text-[10px] font-black uppercase tracking-[0.1em] px-3 md:px-4 py-1.5 rounded-full border transition-all duration-200 ${
                  activeCategory === cat
                    ? "bg-foreground text-background border-transparent"
                    : "bg-transparent text-muted-foreground border-border/40 hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile: snap carousel, one active card, dots — same engine as Upcoming Events */}
        <div className="md:hidden">
          <MobileMarqueeCarousel key={activeCategory}>
            {filtered.map((person) => (
              <div
                key={person.id}
                className="cursor-pointer group"
                onClick={() => setSelected(person)}
              >
                <NagpurkarCardContent person={person} />
              </div>
            ))}
          </MobileMarqueeCarousel>
        </div>

        {/* Desktop: continuous drift marquee */}
        <div className="relative hidden md:block">
          <MarqueeCarousel>
            {filtered.map((person, idx) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05, duration: 0.4 }}
                className="flex-shrink-0 w-[21.6rem] cursor-pointer group"
                onClick={() => setSelected(person)}
              >
                <NagpurkarCardContent person={person} />
              </motion.div>
            ))}
          </MarqueeCarousel>
        </div>
      </div>

      {/* Detail modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6 bg-background/80 backdrop-blur-md"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 40 }}
              transition={{ type: "spring", stiffness: 350, damping: 32 }}
              className="relative bg-card border border-border/60 rounded-t-3xl sm:rounded-2xl overflow-hidden w-full sm:max-w-3xl max-h-[92vh] shadow-2xl flex flex-col sm:flex-row"
              onClick={e => e.stopPropagation()}
            >
              {/* Image / logo panel */}
              {selected.isLogo ? (
                <div className="flex-shrink-0 sm:w-64 flex items-center justify-center p-10 bg-card/60 border-b sm:border-b-0 sm:border-r border-border/40">
                  <img src={selected.image!} alt={selected.name} className="w-36 sm:w-44 h-auto object-contain" />
                </div>
              ) : (
                <div className="relative flex-shrink-0 sm:w-72">
                  {selected.image ? (
                    <img
                      src={selected.image}
                      alt={selected.name}
                      className="w-full h-56 sm:h-full object-cover object-top"
                    />
                  ) : (
                    <div className="w-full h-56 sm:h-full bg-gradient-to-br from-primary/30 via-primary/10 to-card flex items-center justify-center">
                      <span className="text-7xl font-black text-primary/50 tracking-tighter">{initials(selected.name)}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-card/70 via-transparent to-transparent" />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 md:p-8">
                <span className={`inline-flex items-center text-[9px] md:text-[10px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full mb-4 ${BADGE_COLORS[selected.category] || "bg-primary text-primary-foreground"}`}>
                  {selected.category}
                </span>

                <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter italic leading-tight text-foreground">
                  {selected.name}
                </h3>
                <p className="text-xs md:text-sm font-black text-primary uppercase tracking-widest mt-2 italic">
                  {selected.tagline}
                </p>

                <div className="h-px bg-border/40 my-5" />

                <p className="text-sm md:text-[15px] text-muted-foreground leading-relaxed font-medium">
                  {selected.description}
                </p>

                {selected.contact && (
                  <div className="mt-6 pt-5 border-t border-border/30">
                    <a
                      href={`mailto:${selected.contact}`}
                      className="inline-flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-primary hover:underline underline-offset-4"
                    >
                      <Mail className="h-4 w-4" />
                      {selected.contact}
                    </a>
                  </div>
                )}
              </div>

              {/* Close */}
              <button
                onClick={() => setSelected(null)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-background/90 border border-border/50 flex items-center justify-center hover:bg-muted transition-colors z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default TrendingNagpurkars;
