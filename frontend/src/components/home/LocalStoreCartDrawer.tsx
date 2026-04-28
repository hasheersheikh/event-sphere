import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ShoppingCart, Minus, Plus, Trash2, ShoppingBag,
  ArrowRight, ArrowLeft, Loader2, CheckCircle2,
  User, Mail, Phone, MapPin, Banknote, CreditCard, StickyNote,
} from "lucide-react";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/lib/api";

type Step = "cart" | "details" | "success";

const LocalStoreCartDrawer = () => {
  const { isOpen, setIsOpen, items, updateQty, removeItem, clearCart, totalItems, totalPrice } =
    useLocalStoreCart();
  const { user } = useAuth();

  const [step, setStep] = useState<Step>("cart");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phoneNumber || "",
    address: "",
    state: "",
    pincode: "",
    country: "India",
    paymentMethod: "cash",
    notes: "",
  });

  // Group items by store
  const byStore: Record<string, typeof items> = {};
  items.forEach((item) => {
    if (!byStore[item.storeId]) byStore[item.storeId] = [];
    byStore[item.storeId].push(item);
  });

  const handleOpen = (open: boolean) => {
    setIsOpen(open);
    if (!open) setTimeout(() => setStep("cart"), 300);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone || !form.address || !form.state || !form.pincode || !form.country) {
      toast.error("Please fill in all required fields.");
      return;
    }

    const fullAddress = `${form.address}, ${form.state}, ${form.pincode}, ${form.country}`;

    setIsSubmitting(true);
    try {
      const storeEntries = Object.entries(byStore);

      if (form.paymentMethod === "cod") {
        // COD: create all orders directly, show success
        for (const [storeId, storeItems] of storeEntries) {
          await api.post("/store-orders", {
            storeId,
            items: storeItems.map((i) => ({
              productId: i.productId, name: i.name, price: i.price,
              discountPercent: i.discountPercent || 0, quantity: i.quantity, image: i.image,
            })),
            customer: { name: form.name, email: form.email, phone: form.phone, address: fullAddress },
            paymentMethod: "cod",
            notes: form.notes,
          });
        }
        setStep("success");
        clearCart();
      } else {
        // Online: create orders (pending), then redirect to Razorpay for each
        // If cart has items from multiple stores, create one payment link for total
        // and create orders for each store
        const orderIds: string[] = [];
        let totalOnline = 0;
        let firstStoreName = "";

        for (const [storeId, storeItems] of storeEntries) {
          const storeTotal = storeItems.reduce((s, i) => {
            return s + i.price * (1 - (i.discountPercent || 0) / 100) * i.quantity;
          }, 0);
          const { data: order } = await api.post("/store-orders", {
            storeId,
            items: storeItems.map((i) => ({
              productId: i.productId, name: i.name, price: i.price,
              discountPercent: i.discountPercent || 0, quantity: i.quantity, image: i.image,
            })),
            customer: { name: form.name, email: form.email, phone: form.phone, address: fullAddress },
            paymentMethod: "online",
            notes: form.notes,
          });
          orderIds.push(order._id);
          totalOnline += storeTotal;
          if (!firstStoreName) firstStoreName = storeItems[0].storeName;
        }

        // Create a single Razorpay payment link (orderId = first order, multiple store note)
        const { data: payLink } = await api.post("/payments/create-store-order-payment-link", {
          orderId: orderIds[0],
          amount: totalOnline,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          storeName: firstStoreName,
        });

        clearCart();
        // Redirect to Razorpay
        window.location.href = payLink.payment_url;
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to place order. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const field = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => handleOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-background border-l border-border z-[101] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
              <div className="flex items-center gap-3">
                {step === "details" && (
                  <button
                    type="button"
                    onClick={() => setStep("cart")}
                    className="h-8 w-8 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors mr-1"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                )}
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  {step === "success" ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-amber-500" />
                  )}
                </div>
                <div>
                  <h2 className="font-black text-base tracking-tight">
                    {step === "cart" ? "Your Cart" : step === "details" ? "Checkout" : "Order Placed!"}
                  </h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {step === "cart"
                      ? `${totalItems} item${totalItems !== 1 ? "s" : ""}`
                      : step === "details"
                      ? "Fill in your details"
                      : "Confirmation sent to email"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpen(false)}
                className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* ── STEP: CART ── */}
            {step === "cart" && (
              <>
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {items.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center gap-4 text-center py-20">
                      <div className="h-16 w-16 rounded-3xl bg-muted/50 flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                        Your cart is empty
                      </p>
                      <p className="text-xs text-muted-foreground/60 max-w-[200px]">
                        Add products from local stores to get started
                      </p>
                    </div>
                  ) : (
                    Object.entries(byStore).map(([storeId, storeItems]) => (
                      <div key={storeId}>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                          <span className="h-1 w-4 bg-amber-400 rounded-full inline-block" />
                          {storeItems[0].storeName}
                        </p>
                        <div className="space-y-3">
                          {storeItems.map((item) => {
                            const finalPrice = item.price * (1 - (item.discountPercent || 0) / 100);
                            return (
                              <div
                                key={item.productId}
                                className="flex items-center gap-3 p-3 rounded-2xl bg-muted/30 border border-border/40"
                              >
                                {item.image ? (
                                  <img src={item.image} alt={item.name} className="h-12 w-12 rounded-xl object-cover shrink-0" />
                                ) : (
                                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center shrink-0">
                                    <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                                  </div>
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-black truncate">{item.name}</p>
                                  <p className="text-xs text-amber-500 font-black">
                                    ₹{(finalPrice * item.quantity).toFixed(0)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button type="button" onClick={() => updateQty(item.productId, item.quantity - 1)} className="h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors">
                                    <Minus className="h-3 w-3" />
                                  </button>
                                  <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                  <button type="button" onClick={() => updateQty(item.productId, item.quantity + 1)} className="h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors">
                                    <Plus className="h-3 w-3" />
                                  </button>
                                  <button type="button" onClick={() => removeItem(item.productId)} className="h-7 w-7 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors ml-1">
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {items.length > 0 && (
                  <div className="p-6 border-t border-border bg-muted/20 space-y-4 shrink-0">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total</span>
                      <span className="text-xl font-black text-amber-500">₹{totalPrice.toFixed(0)}</span>
                    </div>
                    <Button
                      type="button"
                      onClick={() => {
                        setForm((f) => ({ ...f, name: user?.name || "", email: user?.email || "", phone: user?.phoneNumber || "" }));
                        setStep("details");
                      }}
                      className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] bg-amber-500 hover:bg-amber-400 text-black shadow-lg"
                    >
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                    <button type="button" onClick={clearCart} className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors">
                      Clear cart
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ── STEP: DETAILS ── */}
            {step === "details" && (
              <form onSubmit={handleCheckout} className="flex flex-col flex-1 overflow-hidden">
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                  {/* Order summary */}
                  <div className="bg-muted/30 rounded-2xl p-4 border border-border/40 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Order Summary</p>
                    {items.map((i) => (
                      <div key={i.productId} className="flex justify-between text-xs">
                        <span className="truncate flex-1">{i.name} × {i.quantity}</span>
                        <span className="font-black ml-4 text-amber-500">₹{(i.price * (1 - (i.discountPercent || 0) / 100) * i.quantity).toFixed(0)}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/40 pt-2 flex justify-between font-black text-sm">
                      <span>Total</span>
                      <span className="text-amber-500">₹{totalPrice.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Customer details */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Your Details</p>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        required
                        placeholder="Full name"
                        value={form.name}
                        onChange={(e) => field("name", e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-muted/20 border-border text-sm font-bold"
                      />
                    </div>

                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        required
                        type="email"
                        placeholder="Email address"
                        value={form.email}
                        onChange={(e) => field("email", e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-muted/20 border-border text-sm font-bold"
                      />
                    </div>

                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/50" />
                      <Input
                        required
                        type="tel"
                        placeholder="Phone number"
                        value={form.phone}
                        onChange={(e) => field("phone", e.target.value)}
                        className="pl-11 h-12 rounded-xl bg-muted/20 border-border text-sm font-bold"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                        <textarea
                          required
                          placeholder="Street address, Area, House No."
                          value={form.address}
                          onChange={(e) => field("address", e.target.value)}
                          rows={2}
                          className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/20 border border-border text-sm font-bold resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder:text-muted-foreground/50"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Input
                            required
                            placeholder="State"
                            value={form.state}
                            onChange={(e) => field("state", e.target.value)}
                            className="h-12 rounded-xl bg-muted/20 border-border text-sm font-bold"
                          />
                        </div>
                        <div className="relative">
                          <Input
                            required
                            placeholder="Pin code"
                            value={form.pincode}
                            onChange={(e) => field("pincode", e.target.value)}
                            className="h-12 rounded-xl bg-muted/20 border-border text-sm font-bold"
                          />
                        </div>
                      </div>

                      <div className="relative">
                        <Input
                          required
                          placeholder="Country"
                          value={form.country}
                          onChange={(e) => field("country", e.target.value)}
                          className="h-12 rounded-xl bg-muted/20 border-border text-sm font-bold"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Payment method */}
                  <div className="space-y-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <CreditCard className="h-3.5 w-3.5" /> Payment Method
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => field("paymentMethod", "cod")}
                        className={`h-20 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          form.paymentMethod === "cod"
                            ? "bg-amber-500 border-amber-500 text-black"
                            : "bg-muted/20 border-border text-muted-foreground hover:border-amber-500/40"
                        }`}
                      >
                        <Banknote className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Cash on Delivery</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => field("paymentMethod", "online")}
                        className={`h-20 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all ${
                          form.paymentMethod === "online"
                            ? "bg-amber-500 border-amber-500 text-black"
                            : "bg-muted/20 border-border text-muted-foreground hover:border-amber-500/40"
                        }`}
                      >
                        <CreditCard className="h-5 w-5" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Pay Online</span>
                      </button>
                    </div>
                    {form.paymentMethod === "online" && (
                      <p className="text-[10px] text-muted-foreground italic px-1">
                        You'll be redirected to Razorpay to complete payment securely.
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="relative">
                    <StickyNote className="absolute left-4 top-3.5 h-4 w-4 text-muted-foreground/50" />
                    <textarea
                      placeholder="Special instructions (optional)"
                      value={form.notes}
                      onChange={(e) => field("notes", e.target.value)}
                      rows={2}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/20 border border-border text-sm font-bold resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 placeholder:text-muted-foreground/50"
                    />
                  </div>
                </div>

                <div className="p-6 border-t border-border bg-muted/20 shrink-0">
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] bg-amber-500 hover:bg-amber-400 text-black shadow-lg disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : form.paymentMethod === "online" ? (
                      <>Pay ₹{totalPrice.toFixed(0)} Online <ArrowRight className="ml-2 h-4 w-4" /></>
                    ) : (
                      <>Place Order · ₹{totalPrice.toFixed(0)}</>
                    )}
                  </Button>
                </div>
              </form>
            )}

            {/* ── STEP: SUCCESS ── */}
            {step === "success" && (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center gap-6">
                <div className="h-20 w-20 rounded-3xl bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="h-10 w-10 text-emerald-500" />
                </div>
                <div>
                  <h3 className="text-2xl font-black tracking-tighter uppercase italic mb-2">Order Placed!</h3>
                  <p className="text-sm text-muted-foreground italic leading-relaxed max-w-xs">
                    The store will review your order and contact you shortly. A confirmation has been sent to <strong>{form.email}</strong>.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={() => handleOpen(false)}
                  className="mt-4 h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-amber-500 hover:bg-amber-400 text-black"
                >
                  Continue Shopping
                </Button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LocalStoreCartDrawer;
