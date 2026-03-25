import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useLocalStoreCart } from "@/contexts/LocalStoreCartContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const LocalStoreCartDrawer = () => {
  const { isOpen, setIsOpen, items, updateQty, removeItem, clearCart, totalItems, totalPrice } =
    useLocalStoreCart();

  // Group items by store
  const byStore: Record<string, typeof items> = {};
  items.forEach((item) => {
    if (!byStore[item.storeId]) byStore[item.storeId] = [];
    byStore[item.storeId].push(item);
  });

  const handleCheckout = () => {
    toast.success("Order placed! The store will contact you shortly.");
    clearCart();
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
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
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-amber-500/10 flex items-center justify-center">
                  <ShoppingCart className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h2 className="font-black text-base tracking-tight">Local Cart</h2>
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                    {totalItems} item{totalItems !== 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Items */}
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
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-12 w-12 rounded-xl object-cover flex-shrink-0"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                                <ShoppingBag className="h-5 w-5 text-muted-foreground/40" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black truncate">{item.name}</p>
                              <p className="text-xs text-primary font-black">
                                ₹{(finalPrice * item.quantity).toFixed(0)}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                type="button"
                                onClick={() => updateQty(item.productId, item.quantity - 1)}
                                className="h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                              <button
                                type="button"
                                onClick={() => updateQty(item.productId, item.quantity + 1)}
                                className="h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-muted transition-colors"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => removeItem(item.productId)}
                                className="h-7 w-7 rounded-lg text-destructive/60 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors ml-1"
                              >
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

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/20 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-black uppercase tracking-widest text-muted-foreground">Total</span>
                  <span className="text-xl font-black text-primary">₹{totalPrice.toFixed(0)}</span>
                </div>
                <Button
                  type="button"
                  onClick={handleCheckout}
                  className="w-full h-14 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] bg-amber-500 hover:bg-amber-400 text-black shadow-lg"
                >
                  Place Order
                </Button>
                <button
                  type="button"
                  onClick={clearCart}
                  className="w-full text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-destructive transition-colors"
                >
                  Clear cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default LocalStoreCartDrawer;
