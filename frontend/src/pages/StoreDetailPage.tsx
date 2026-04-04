import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBag, MapPin, ChevronLeft, Sparkles, Store,
  Phone, Mail, MessageCircle, Globe, Instagram, Facebook,
  Clock, CreditCard, ShoppingCart, Plus,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { toast } from "sonner";

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash on Delivery",
  upi: "UPI",
  card: "Card",
  bank_transfer: "Bank Transfer",
};

const StoreDetailPage = () => {
  const { id } = useParams<{ id: string }>();

  const { data: store, isLoading } = useQuery({
    queryKey: ["localStore", id],
    queryFn: async () => {
      const { data } = await api.get(`/local-stores/${id}`);
      return data;
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-24">
          <div className="h-64 w-full bg-muted animate-pulse rounded-[3rem]" />
          <div className="mt-12 space-y-8">
            <div className="h-12 w-1/3 bg-muted animate-pulse rounded-full" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="h-64 rounded-[2.5rem] bg-muted animate-pulse" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-24 text-center">
          <h2 className="text-4xl font-black uppercase italic">Store not found</h2>
          <Link to="/local-stores">
            <Button className="mt-8">Back to Stores</Button>
          </Link>
        </main>
      </div>
    );
  }

  const hasContact = store.contactEmail || store.contactPhone || store.whatsapp || store.openingHours;
  const hasSocial = store.instagram || store.facebook || store.website;
  const hasPayment = store.paymentMethods?.length > 0 || store.upiId || store.bankDetails?.accountNumber;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />

      <main className="flex-1 container py-12 md:py-24 relative z-10">
        <Link
          to="/local-stores"
          className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-amber-500 transition-colors mb-12"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Local Gems
        </Link>

        {/* Store Header */}
        <section className="relative rounded-[3rem] overflow-hidden border border-border/50 bg-card/30 backdrop-blur-xl mb-16">
          <div className="h-64 md:h-80 w-full relative">
            {store.photos?.[0] ? (
              <img src={store.photos[0]} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-amber-500/10 to-background flex items-center justify-center">
                <Store className="h-24 w-24 text-amber-500/10" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
          </div>

          <div className="p-8 md:p-12 -mt-20 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <Badge className="bg-amber-500 text-black px-4 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] text-[8px] border-none shadow-xl">
                  {store.category}
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none italic uppercase">
                  {store.name}
                </h1>
                <div className="flex items-start gap-2 text-muted-foreground font-medium italic">
                  <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                  <p>{store.address}</p>
                </div>
                {store.openingHours && (
                  <div className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-4 w-4 shrink-0 text-amber-500" />
                    <span className="font-medium italic">{store.openingHours}</span>
                  </div>
                )}
              </div>
              <div className="hidden md:flex items-center gap-3 text-amber-500 bg-amber-500/5 px-6 py-4 rounded-3xl border border-amber-500/20">
                <Sparkles className="h-5 w-5" />
                <span className="text-xs font-black uppercase tracking-widest">Premium Partner</span>
              </div>
            </div>

            <p className="mt-10 text-lg text-muted-foreground max-w-3xl leading-relaxed italic font-medium">
              {store.description || "A local neighbourhood favourite, bringing you the best in quality and tradition."}
            </p>
          </div>
        </section>

        {/* Products Grid */}
        <section className="space-y-12 mb-20">
          <div className="flex items-center justify-between border-b border-border/50 pb-8">
            <h2 className="text-3xl font-black tracking-tighter uppercase italic">
              The <span className="text-amber-500">Collection.</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
              {store.products?.length || 0} items
            </span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {store.products?.map((product: any) => (
              <ProductCard
                key={product._id}
                product={product}
                storeId={store._id}
                storeName={store.name}
              />
            ))}
          </div>

          {!store.products?.length && (
            <div className="py-24 text-center bg-card/20 rounded-[3rem] border border-dashed border-border/50">
              <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">No products yet.</p>
              <p className="text-xs text-muted-foreground/60 italic mt-2">New items coming soon.</p>
            </div>
          )}
        </section>

        {/* Contact & Info Section */}
        {(hasContact || hasSocial || hasPayment) && (
          <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {/* Contact */}
            {hasContact && (
              <div className="bg-card/40 border border-border/50 rounded-[2rem] p-8 space-y-5">
                <h3 className="text-lg font-black tracking-tighter uppercase italic">
                  <span className="text-amber-500">Contact</span> Us
                </h3>
                <div className="space-y-4">
                  {store.contactPhone && (
                    <a href={`tel:${store.contactPhone}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <Phone className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="font-medium">{store.contactPhone}</span>
                    </a>
                  )}
                  {store.contactEmail && (
                    <a href={`mailto:${store.contactEmail}`} className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
                        <Mail className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="font-medium">{store.contactEmail}</span>
                    </a>
                  )}
                  {store.whatsapp && (
                    <a href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <div className="h-9 w-9 rounded-xl bg-emerald-500/10 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <MessageCircle className="h-4 w-4 text-emerald-500" />
                      </div>
                      <span className="font-medium">WhatsApp</span>
                    </a>
                  )}
                  {store.openingHours && (
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <Clock className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="font-medium">{store.openingHours}</span>
                    </div>
                  )}
                  {store.googleMapUrl && (
                    <a href={store.googleMapUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <MapPin className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="font-medium">View on Map</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Payment Methods */}
            {hasPayment && (
              <div className="bg-card/40 border border-border/50 rounded-[2rem] p-8 space-y-5">
                <h3 className="text-lg font-black tracking-tighter uppercase italic">
                  <span className="text-amber-500">Payment</span> Methods
                </h3>
                <div className="space-y-3">
                  {store.paymentMethods?.map((m: string) => (
                    <div key={m} className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
                        <CreditCard className="h-4 w-4 text-amber-500" />
                      </div>
                      <span className="text-sm font-bold">{PAYMENT_LABELS[m] || m}</span>
                    </div>
                  ))}
                  {store.upiId && (
                    <div className="mt-4 p-3 bg-muted/40 rounded-xl">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">UPI ID</p>
                      <p className="text-sm font-black text-amber-500">{store.upiId}</p>
                    </div>
                  )}
                  {store.bankDetails?.accountNumber && (
                    <div className="mt-2 p-3 bg-muted/40 rounded-xl space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Bank Details</p>
                      {store.bankDetails.accountHolder && <p className="text-xs font-bold">{store.bankDetails.accountHolder}</p>}
                      {store.bankDetails.bankName && <p className="text-xs text-muted-foreground">{store.bankDetails.bankName}</p>}
                      <p className="text-xs font-black text-amber-500">{store.bankDetails.accountNumber}</p>
                      {store.bankDetails.ifscCode && <p className="text-xs text-muted-foreground">IFSC: {store.bankDetails.ifscCode}</p>}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Social Links */}
            {hasSocial && (
              <div className="bg-card/40 border border-border/50 rounded-[2rem] p-8 space-y-5">
                <h3 className="text-lg font-black tracking-tighter uppercase italic">
                  <span className="text-amber-500">Find</span> Us Online
                </h3>
                <div className="space-y-4">
                  {store.website && (
                    <a href={store.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <div className="h-9 w-9 rounded-xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                        <Globe className="h-4 w-4 text-blue-500" />
                      </div>
                      <span className="font-medium truncate">{store.website.replace(/^https?:\/\//, "")}</span>
                    </a>
                  )}
                  {store.instagram && (
                    <a href={`https://instagram.com/${store.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <div className="h-9 w-9 rounded-xl bg-pink-500/10 flex items-center justify-center group-hover:bg-pink-500/20 transition-colors">
                        <Instagram className="h-4 w-4 text-pink-500" />
                      </div>
                      <span className="font-medium">@{store.instagram.replace("@", "")}</span>
                    </a>
                  )}
                  {store.facebook && (
                    <a href={store.facebook.startsWith("http") ? store.facebook : `https://facebook.com/${store.facebook}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors group">
                      <div className="h-9 w-9 rounded-xl bg-blue-600/10 flex items-center justify-center group-hover:bg-blue-600/20 transition-colors">
                        <Facebook className="h-4 w-4 text-blue-600" />
                      </div>
                      <span className="font-medium">Facebook</span>
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

const ProductCard = ({ product, storeId, storeName }: { product: any; storeId: string; storeName: string }) => {
  const { addItem } = useLocalStoreCart();
  const finalPrice = product.price * (1 - (product.discountPercent || 0) / 100);

  const handleAdd = () => {
    if (!product.isAvailable) return;
    addItem({
      storeId,
      storeName,
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
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="group relative bg-card/40 border border-border/50 rounded-[2.5rem] overflow-hidden hover:border-amber-500/30 transition-all duration-500 shadow-xl hover:shadow-2xl flex flex-col"
    >
      <div className="h-56 relative overflow-hidden">
        {product.image ? (
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/20" />
          </div>
        )}
        {product.discountPercent > 0 && (
          <div className="absolute top-6 left-6">
            <Badge className="bg-rose-500 text-white px-3 py-1 rounded-xl font-black uppercase tracking-widest text-[8px] border-none shadow-lg">
              {product.discountPercent}% OFF
            </Badge>
          </div>
        )}
        {!product.isAvailable && (
          <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Unavailable</span>
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-card/80 to-transparent pointer-events-none" />
      </div>

      <div className="p-6 space-y-3 flex flex-col flex-1">
        <h3 className="text-lg font-black tracking-tighter uppercase italic leading-none truncate">
          {product.name}
        </h3>
        <p className="text-xs text-muted-foreground font-medium italic line-clamp-2 leading-relaxed flex-1">
          {product.description || "Crafted with local passion."}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-border/40">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-amber-500 italic">₹{finalPrice.toFixed(0)}</span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-muted-foreground line-through font-bold">₹{product.price}</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!product.isAvailable}
            className="h-9 w-9 rounded-xl bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default StoreDetailPage;
