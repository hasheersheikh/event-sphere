import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ShoppingBag, MapPin, Plus, Minus, ShoppingCart, Star, Tag, ArrowRight } from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface Product {
  _id: string;
  name: string;
  description?: string;
  price: number;
  discountPercent?: number;
  image?: string;
  isAvailable: boolean;
}

interface LocalStore {
  _id: string;
  name: string;
  address: string;
  description?: string;
  photos: string[];
  category: string;
  products: Product[];
}

const ProductCard = ({ product, store }: { product: Product; store: LocalStore }) => {
  const { addItem, items, updateQty } = useLocalStoreCart();
  const cartItem = items.find((i) => i.productId === product._id);
  const discountedPrice = product.price * (1 - (product.discountPercent || 0) / 100);

  const handleAdd = () => {
    addItem({
      storeId: store._id,
      storeName: store.name,
      productId: product._id,
      name: product.name,
      price: product.price,
      discountPercent: product.discountPercent,
      image: product.image,
    });
    toast.success(`${product.name} added to cart`);
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="relative bg-card border border-border/60 rounded-2xl overflow-hidden group flex-shrink-0 w-44"
    >
      {/* Product Image */}
      <div className="h-28 bg-muted/50 relative overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
          </div>
        )}
        {product.discountPercent ? (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
            {product.discountPercent}% off
          </div>
        ) : null}
      </div>

      <div className="p-3">
        <p className="text-xs font-black truncate">{product.name}</p>
        {product.description && (
          <p className="text-[10px] text-muted-foreground truncate mt-0.5">{product.description}</p>
        )}
        <div className="flex items-center gap-1.5 mt-2">
          <span className="text-sm font-black text-primary">₹{discountedPrice.toFixed(0)}</span>
          {product.discountPercent ? (
            <span className="text-[10px] text-muted-foreground line-through">₹{product.price}</span>
          ) : null}
        </div>

        {/* Add / Qty */}
        {!product.isAvailable ? (
          <p className="text-[10px] text-muted-foreground font-bold mt-2 uppercase tracking-wider">Unavailable</p>
        ) : cartItem ? (
          <div className="flex items-center justify-between mt-2 bg-primary/10 rounded-xl p-1">
            <button
              type="button"
              onClick={() => updateQty(product._id, cartItem.quantity - 1)}
              className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="text-xs font-black text-primary">{cartItem.quantity}</span>
            <button
              type="button"
              onClick={() => updateQty(product._id, cartItem.quantity + 1)}
              className="h-6 w-6 rounded-lg bg-primary text-primary-foreground flex items-center justify-center"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAdd}
            className="mt-2 w-full h-7 rounded-xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1 hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>
    </motion.div>
  );
};

const StoreCard = ({ store }: { store: LocalStore }) => {
  const [expanded, setExpanded] = useState(false);
  const coverPhoto = store.photos[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="bg-card border border-border/60 rounded-3xl overflow-hidden hover:border-primary/30 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5"
    >
      {/* Store Header */}
      <div className="relative h-40 overflow-hidden">
        {coverPhoto ? (
          <img src={coverPhoto} alt={store.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-accent/10 to-background flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-primary/30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
        <div className="absolute bottom-3 left-4">
          <span className="text-[9px] font-black uppercase tracking-widest bg-primary/90 text-primary-foreground px-3 py-1 rounded-full">
            {store.category}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h3 className="font-black text-base tracking-tight">{store.name}</h3>
        <div className="flex items-center gap-1.5 mt-1 mb-1">
          <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <p className="text-[11px] text-muted-foreground truncate">{store.address}</p>
        </div>
        {store.description && (
          <p className="text-[11px] text-muted-foreground/80 line-clamp-2 mb-3">{store.description}</p>
        )}

        {/* Star rating (static visual) */}
        <div className="flex items-center gap-1 mb-4">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className={cn("h-3 w-3", i <= 4 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30")} />
          ))}
          <span className="text-[10px] text-muted-foreground ml-1">({store.products.length} items)</span>
        </div>

        {/* Products horizontal scroll */}
        {store.products.length > 0 && (
          <div className="space-y-3">
            <div
              className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide"
              style={{ scrollbarWidth: "none" }}
            >
              {(expanded ? store.products : store.products.slice(0, 6)).map((product) => (
                <ProductCard key={product._id} product={product} store={store} />
              ))}
            </div>
            {store.products.length > 6 && (
              <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
              >
                {expanded ? "Show less" : `+${store.products.length - 6} more items`}
                <ArrowRight className={cn("h-3 w-3 transition-transform", expanded && "rotate-90")} />
              </button>
            )}
          </div>
        )}

        {store.products.length === 0 && (
          <p className="text-[11px] text-muted-foreground italic">No products listed yet</p>
        )}
      </div>
    </motion.div>
  );
};

const GoLocalSection = () => {
  const { data: stores, isLoading } = useQuery({
    queryKey: ["localStores"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores");
      return data as LocalStore[];
    },
  });
  const { totalItems, setIsOpen } = useLocalStoreCart();

  if (!isLoading && (!stores || stores.length === 0)) return null;

  return (
    <section className="py-24 relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-14">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-1 w-8 bg-amber-400 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-500">
                Nearby Gems
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-none">
              Go <span className="text-amber-400 italic">Local.</span>
            </h2>
            <p className="text-muted-foreground text-sm mt-3 max-w-md font-light">
              Discover handpicked local stores around you — fresh produce, artisan crafts, neighbourhood favourites.
            </p>
          </div>

          <div className="flex items-center gap-4">
            {totalItems > 0 && (
              <button
                type="button"
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-2 px-5 py-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-500 hover:bg-amber-500/20 transition-all"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">{totalItems} items</span>
              </button>
            )}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-border/50 text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              <span className="text-[10px] font-black uppercase tracking-widest">Local Deals</span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(3).fill(0).map((_, i) => (
              <div key={i} className="h-80 rounded-3xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stores?.map((store) => (
              <StoreCard key={store._id} store={store} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default GoLocalSection;
