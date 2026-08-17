import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, ShoppingBag, ArrowUpRight, ImageIcon } from "lucide-react";
import SafeImage from "@/components/ui/SafeImage";

interface Product {
  _id: string;
  name: string;
  image?: string;
  price?: number;
}

interface LocalStore {
  _id: string;
  name: string;
  address: string;
  description?: string;
  listingPhoto?: string;
  bannerPhoto?: string;
  photos: string[];
  category: string;
  products: Product[];
}

interface StoreCardProps {
  store: LocalStore;
  index?: number;
  showProducts?: boolean;
}

const StoreCard = ({ store, index = 0, showProducts = true }: StoreCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-30px" }}
      whileHover={{ scale: 1.1, transition: { duration: 0.3, ease: "easeOut" } }}
      transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1], delay: index * 0.04 }}
      className="group h-full"
    >
      <Link to={`/local-stores/${store._id}`} className="block h-full">
        <article className="h-full flex flex-col">

          {/* ── image ── */}
          <div className="relative aspect-[4/5] w-full rounded-xl md:rounded-2xl overflow-hidden bg-muted border border-border/50 hover:border-border transition-all duration-300 shrink-0">
            <AnimatedShimmer visible={!imageLoaded} />

            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={imageLoaded ? { opacity: 1 } : { opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              {(store.listingPhoto || store.bannerPhoto || store.photos?.[0]) ? (
                <SafeImage
                  src={store.listingPhoto || store.bannerPhoto || store.photos[0]}
                  alt={store.name}
                  className="w-full h-full object-cover"
                  onLoad={() => setImageLoaded(true)}
                />
              ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center" onLoad={() => setImageLoaded(true)}>
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
                </div>
              )}
            </motion.div>

            {/* gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

            {/* category badge */}
            <div className="absolute top-2.5 left-2.5">
              <span className="inline-block px-2 py-1 bg-white/90 text-black rounded font-black uppercase tracking-wider text-[8px]">
                {store.category}
              </span>
            </div>
          </div>

          {/* Name + address — below the image, centered, matching Upcoming Events */}
          <div className="mt-3 text-center">
            <h3 className="font-black text-lg md:text-xl tracking-tight leading-snug line-clamp-1 text-foreground">
              {store.name}
            </h3>
            <div className="flex items-center justify-center gap-1 mt-1">
              <MapPin className="h-3 w-3 text-neon-lime shrink-0" />
              <p className="text-[11px] text-muted-foreground font-medium line-clamp-1">{store.address}</p>
            </div>
          </div>
        </article>
      </Link>
    </motion.div>
  );
};

const AnimatedShimmer = ({ visible }: { visible: boolean }) => (
  <motion.div
    className="absolute inset-0 overflow-hidden bg-muted"
    animate={{ opacity: visible ? 1 : 0 }}
    transition={{ duration: 0.3 }}
    style={{ pointerEvents: visible ? "auto" : "none" }}
  >
    <ImageIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-muted-foreground/20" />
    <motion.div
      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
      animate={{ x: ["-100%", "200%"] }}
      transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
    />
  </motion.div>
);

export default StoreCard;
