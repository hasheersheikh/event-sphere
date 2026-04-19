import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, ShoppingBag, LogOut, Package, MapPin, Phone, Mail,
  ChevronDown, ChevronUp, Filter, LayoutDashboard, Wallet,
  Edit2, Check, X, Globe, Instagram, Facebook, Clock,
  CreditCard, MessageCircle, TrendingUp, IndianRupee, AlertCircle,
  CheckCircle2, Loader2, ArrowUpRight, Building2, Smartphone, Plus, Trash2, Upload, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { USE_LOCAL_STORAGE, uploadImageToBackend } from "@/lib/localUpload";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-500 border-amber-500/20",
  confirmed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  processing: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  shipped: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20",
  delivered: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
  cancelled: "bg-rose-500/10 text-rose-500 border-rose-500/20",
};

const PAYOUT_STATUS: Record<string, { label: string; cls: string }> = {
  pending:    { label: "Pending",    cls: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  processing: { label: "Processing", cls: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  paid:       { label: "Paid",       cls: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  rejected:   { label: "Rejected",   cls: "bg-rose-500/10 text-rose-500 border-rose-500/20" },
};

const ALL_STATUSES = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const TABS = [
  { id: "orders",  label: "Orders",       icon: Package },
  { id: "products",label: "Products",     icon: Package },
  { id: "store",   label: "Store Details", icon: Store },
  { id: "payouts", label: "Payouts",       icon: Wallet },
] as const;

type Tab = typeof TABS[number]["id"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const authHeader = (token: string) => ({ Authorization: `Bearer ${token}` });

// ─── Main component ───────────────────────────────────────────────────────────

const StoreOwnerPortal = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  const owner = (() => {
    try { return JSON.parse(localStorage.getItem("store-owner") || "null"); } catch { return null; }
  })();

  useEffect(() => { if (!owner) navigate("/store-owner/login"); }, []);

  const logout = () => {
    localStorage.removeItem("store-owner");
    navigate("/store-owner/login");
  };

  if (!owner) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top header */}
      <header className="bg-card border-b border-border sticky top-0 z-30">
        <div className="container max-w-6xl flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Store className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="font-black text-xs leading-none">{owner.storeName}</p>
              <p className="text-[8px] text-muted-foreground font-black uppercase tracking-widest leading-none mt-0.5">Owner Portal</p>
            </div>
          </div>

          {/* Tab bar (desktop) */}
          <nav className="hidden md:flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-all",
                  activeTab === id
                    ? "bg-card shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="h-3 w-3" />
                {label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <p className="text-xs text-muted-foreground hidden sm:block">{owner.name}</p>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Logout
            </button>
          </div>
        </div>

        {/* Mobile tab bar */}
        <div className="flex md:hidden border-t border-border">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2.5 text-[9px] font-black uppercase tracking-wider transition-colors",
                activeTab === id ? "text-amber-500 border-t-2 border-amber-500 -mt-px" : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </header>

      {/* Tab content */}
      <main className="flex-1 container max-w-6xl px-4 py-4">
        <AnimatePresence mode="wait">
          {activeTab === "orders" && <OrdersTab key="orders" owner={owner} qc={qc} />}
          {activeTab === "products" && <ProductsTab key="products" owner={owner} qc={qc} />}
          {activeTab === "store"  && <StoreDetailsTab key="store" owner={owner} />}
          {activeTab === "payouts" && <PayoutsTab key="payouts" owner={owner} qc={qc} />}
        </AnimatePresence>
      </main>
    </div>
  );
};

// ─── ORDERS TAB ───────────────────────────────────────────────────────────────

const OrdersTab = ({ owner, qc }: { owner: any; qc: any }) => {
  const [filterStatus, setFilterStatus] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders, isLoading } = useQuery({
    queryKey: ["owner-orders", filterStatus],
    queryFn: async () => {
      const params = filterStatus !== "all" ? `?status=${filterStatus}` : "";
      const { data } = await api.get(`/store-orders/owner${params}`, { headers: authHeader(owner.token) });
      return data.data || [];
    },
    enabled: Boolean(owner?.token),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/store-orders/${id}/status`, { status }, { headers: authHeader(owner.token) }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["owner-orders"] }); toast.success("Status updated"); },
    onError: () => toast.error("Failed to update status"),
  });

  const stats = {
    total: orders?.length || 0,
    pending: orders?.filter((o: any) => o.status === "pending")?.length || 0,
    delivered: orders?.filter((o: any) => o.status === "delivered")?.length || 0,
    revenue: orders?.reduce((s: number, o: any) => s + (o.totalAmount || 0), 0) || 0,
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Orders",         value: stats.total,                     color: "text-foreground",  icon: Package },
          { label: "Pending",        value: stats.pending,                   color: "text-amber-500",   icon: AlertCircle },
          { label: "Delivered",      value: stats.delivered,                 color: "text-emerald-500", icon: CheckCircle2 },
          { label: "Revenue",        value: `₹${stats.revenue.toFixed(0)}`, color: "text-amber-500",   icon: IndianRupee },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-border rounded-xl p-3.5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{s.label}</p>
              <s.icon className={cn("h-3.5 w-3.5 opacity-60", s.color)} />
            </div>
            <p className={cn("text-xl font-black italic", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48 rounded-xl">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Orders</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-3">{Array(4).fill(0).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-muted animate-pulse" />)}</div>
      ) : !orders?.length ? (
        <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card/50">
          <ShoppingBag className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No orders yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((order: any) => (
            <div key={order._id} className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
              <div className="flex items-center gap-3 p-3.5">
                <div className="h-9 w-9 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Package className="h-4 w-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-bold text-xs">{order.customer.name}</p>
                    <span className="text-[9px] text-muted-foreground font-black uppercase">#{order._id.slice(-4).toUpperCase()}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {order.customer.phone} · {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-black text-xs hidden sm:block">₹{order.totalAmount.toFixed(0)}</span>
                  <Select
                    value={order.status}
                    onValueChange={(val) => updateStatus.mutate({ id: order._id, status: val })}
                  >
                    <SelectTrigger className={cn("w-28 h-7 rounded-lg border text-[10px] font-black uppercase tracking-wider", STATUS_STYLES[order.status])}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_STATUSES.map((s) => (
                        <SelectItem key={s} value={s} className="capitalize text-xs">{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => setExpanded(expanded === order._id ? null : order._id)}
                    className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
                  >
                    {expanded === order._id ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {expanded === order._id && (
                <div className="border-t bg-muted/20 p-5">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Customer</p>
                      <p className="font-bold text-sm">{order.customer.name}</p>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="h-3.5 w-3.5" />{order.customer.email}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone className="h-3.5 w-3.5" />
                        <a href={`tel:${order.customer.phone}`} className="hover:text-foreground">{order.customer.phone}</a>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />{order.customer.address}
                      </div>
                      {order.notes && <p className="text-xs text-muted-foreground italic">Note: {order.notes}</p>}
                    </div>
                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Items</p>
                      {order.items.map((item: any, idx: number) => {
                        const fp = item.price * (1 - (item.discountPercent || 0) / 100);
                        return (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              {item.image && <img src={item.image} alt={item.name} className="h-8 w-8 rounded-lg object-cover" />}
                              <span>{item.name} <span className="text-muted-foreground">×{item.quantity}</span></span>
                            </div>
                            <span className="font-bold">₹{(fp * item.quantity).toFixed(0)}</span>
                          </div>
                        );
                      })}
                      <div className="pt-2 border-t flex justify-between font-black text-sm">
                        <span className="text-xs text-muted-foreground capitalize">
                          {order.paymentMethod === "cod" ? "Cash on Delivery" : "Online"}
                        </span>
                        <span>₹{order.totalAmount.toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── PRODUCTS TAB ─────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  image: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  isAvailable: z.boolean().default(true),
});
type ProductFormValues = z.infer<typeof productSchema>;

const AddProductForm = ({ owner, onClose }: { owner: any; onClose: () => void }) => {
  const qc = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, discountPercent: 0, image: "", description: "", isAvailable: true },
  });

  const productImageInputRef = useRef<HTMLInputElement>(null);

  const handleProductImageUpload = () => {
    if (USE_LOCAL_STORAGE) {
      productImageInputRef.current?.click();
      return;
    }
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          form.setValue("image", result.info.secure_url);
        }
      },
    );
    widget.open();
  };

  const handleLocalProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageToBackend(file);
      form.setValue("image", url);
      toast.success("Image uploaded.");
    } catch {
      toast.error("Upload failed.");
    }
    e.target.value = "";
  };

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const { data } = await api.post(`/local-stores/owner/my-store/products`, values, { headers: authHeader(owner.token) });
      return data;
    },
    onSuccess: () => {
      toast.success("Product added.");
      qc.invalidateQueries({ queryKey: ["owner-store"] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-md shadow-2xl overflow-y-auto max-h-[95vh]">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="font-black text-base uppercase tracking-tight">Add Product</h2>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Product Name *</FormLabel>
                <FormControl><Input className="h-10 rounded-lg bg-muted/30 border-border" placeholder="e.g. Masala Chai" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Description</FormLabel>
                <FormControl><Input className="h-10 rounded-lg bg-muted/30 border-border" placeholder="Short description" {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Price (₹) *</FormLabel>
                  <FormControl><Input type="number" className="h-10 rounded-lg bg-muted/30 border-border" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="discountPercent" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Discount %</FormLabel>
                  <FormControl><Input type="number" className="h-10 rounded-lg bg-muted/30 border-border" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Product Image</p>
              {form.watch("image") && (
                <div className="relative w-20 h-20 rounded-lg overflow-hidden border border-border">
                  <img src={form.watch("image")} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => form.setValue("image", "")}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive/80 text-white flex items-center justify-center"
                  >
                    <X className="h-2.5 w-2.5" />
                  </button>
                </div>
              )}
              <input ref={productImageInputRef} type="file" accept="image/*" className="hidden" onChange={handleLocalProductImageUpload} />
              <button
                type="button"
                onClick={handleProductImageUpload}
                className="w-full h-10 rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 text-[9px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="h-3.5 w-3.5" /> {form.watch("image") ? "Change Image" : "Upload Image"}
              </button>
            </div>
            <Button
              type="button"
              onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
              disabled={mutation.isPending}
              className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[9px] bg-primary mt-4"
            >
              {mutation.isPending ? "Adding..." : "Add Product"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

const ProductsTab = ({ owner, qc }: { owner: any; qc: any }) => {
  const [showAddForm, setShowAddForm] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ["owner-store"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores/owner/my-store", { headers: authHeader(owner.token) });
      return data;
    },
    enabled: Boolean(owner?.token),
  });

  const toggleProductMutation = useMutation({
    mutationFn: async ({ productId, isAvailable }: { productId: string; isAvailable: boolean }) => {
      const { data } = await api.put(`/local-stores/owner/my-store/products/${productId}`, { isAvailable }, { headers: authHeader(owner.token) });
      return data;
    },
    onSuccess: () => {
      toast.success("Product status updated");
      qc.invalidateQueries({ queryKey: ["owner-store"] });
    },
    onError: () => toast.error("Failed to update product"),
  });

  const removeProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      await api.delete(`/local-stores/owner/my-store/products/${productId}`, { headers: authHeader(owner.token) });
    },
    onSuccess: () => {
      toast.success("Product removed");
      qc.invalidateQueries({ queryKey: ["owner-store"] });
    },
    onError: () => toast.error("Failed to remove product"),
  });

  if (isLoading) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="h-16 rounded-2xl bg-muted animate-pulse" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array(3).fill(0).map((_, i) => <div key={i} className="h-64 rounded-2xl bg-muted animate-pulse" />)}
      </div>
    </motion.div>
  );

  const products = store?.products || [];

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {showAddForm && <AddProductForm owner={owner} onClose={() => setShowAddForm(false)} />}
      
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight">Products</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">Manage your store's inventory</p>
        </div>
        <Button size="sm" onClick={() => setShowAddForm(true)} className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black gap-1.5 h-9 px-4 text-[10px] font-black uppercase tracking-widest">
          <Plus className="h-4 w-4" /> Add Product
        </Button>
      </div>

      {products.length === 0 ? (
        <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-card/50">
          <Package className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No products yet</p>
          <p className="text-xs text-muted-foreground mt-2">Add products to your store to start selling.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {products.map((product: any) => (
            <div key={product._id} className="bg-card rounded-xl border border-border overflow-hidden flex flex-col group">
              <div className="relative h-40 bg-muted shrink-0">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                     <ImageIcon className="h-7 w-7 text-muted-foreground/30" />
                  </div>
                )}
                {!product.isAvailable && (
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] flex items-center justify-center">
                    <Badge variant="destructive" className="font-black uppercase tracking-widest text-[9px]">Unavailable</Badge>
                  </div>
                )}
                {product.discountPercent > 0 && (
                  <div className="absolute top-2 left-2 bg-rose-500 text-white px-2 py-0.5 rounded text-[9px] font-black tracking-widest">
                    {product.discountPercent}% OFF
                  </div>
                )}
              </div>
              <div className="p-3.5 flex flex-col flex-1">
                <div className="flex justify-between items-start mb-1.5">
                  <h3 className="font-bold text-xs leading-tight group-hover:text-amber-500 transition-colors uppercase italic">{product.name}</h3>
                  <div className="text-right shrink-0 ml-3">
                    <p className="font-black text-xs">₹{product.price}</p>
                  </div>
                </div>
                {product.description && (
                  <p className="text-[10px] text-muted-foreground line-clamp-2 flex-1 mb-3">{product.description}</p>
                )}
                <div className="flex items-center gap-2 pt-3 border-t mt-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 rounded-lg text-[9px] uppercase font-black tracking-wider"
                    onClick={() => toggleProductMutation.mutate({ productId: product._id, isAvailable: !product.isAvailable })}
                  >
                    {product.isAvailable ? "Mark Unavailable" : "Mark Available"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-lg text-destructive hover:bg-destructive/10 shrink-0"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to remove this product?")) {
                        removeProductMutation.mutate(product._id);
                      }
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

// ─── STORE DETAILS TAB ────────────────────────────────────────────────────────

const StoreDetailsTab = ({ owner }: { owner: any }) => {
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<any>(null);

  const { data: store, isLoading } = useQuery({
    queryKey: ["owner-store"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores/owner/my-store", { headers: authHeader(owner.token) });
      return data;
    },
    enabled: Boolean(owner?.token),
  });

  useEffect(() => {
    if (store && !form) setForm(store);
  }, [store]);

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      api.put("/local-stores/owner/my-store", payload, { headers: authHeader(owner.token) }),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["owner-store"] });
      setForm(res.data);
      setIsEditing(false);
      toast.success("Store details updated");
    },
    onError: () => toast.error("Failed to save changes"),
  });

  const field = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));
  const bankField = (key: string, value: string) =>
    setForm((f: any) => ({ ...f, bankDetails: { ...f?.bankDetails, [key]: value } }));

  if (isLoading) return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      {Array(4).fill(0).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />)}
    </motion.div>
  );

  if (!store || !form) return null;

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black tracking-tight">{store.name}</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{store.address}</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => { setIsEditing(false); setForm(store); }} className="rounded-lg gap-1.5 h-8 text-[10px] font-black uppercase">
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
              <Button size="sm" onClick={() => saveMutation.mutate(form)} disabled={saveMutation.isPending} className="rounded-lg bg-amber-500 hover:bg-amber-400 text-black gap-1.5 h-8 text-[10px] font-black uppercase">
                {saveMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                Save
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)} className="rounded-lg gap-1.5 bg-amber-500 hover:bg-amber-400 text-black h-8 text-[10px] font-black uppercase">
              <Edit2 className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* About */}
        <Section title="About the Store">
          <Field label="Description" editing={isEditing}>
            {isEditing ? (
              <textarea
                value={form.description || ""}
                onChange={(e) => field("description", e.target.value)}
                rows={3}
                className="w-full px-3 py-2 rounded-xl bg-muted/30 border border-border text-sm resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              />
            ) : (
              <p className="text-sm text-muted-foreground">{store.description || "—"}</p>
            )}
          </Field>
          <Field label="Opening Hours" editing={isEditing} icon={<Clock className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.openingHours || ""} onChange={(e) => field("openingHours", e.target.value)}
                placeholder="e.g. Mon–Sat 9 AM – 9 PM" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.openingHours || "—"}</p>
            )}
          </Field>
        </Section>

        {/* Contact */}
        <Section title="Contact Information">
          <Field label="Phone" editing={isEditing} icon={<Phone className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.contactPhone || ""} onChange={(e) => field("contactPhone", e.target.value)}
                placeholder="+91 XXXXX XXXXX" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.contactPhone || "—"}</p>
            )}
          </Field>
          <Field label="Email" editing={isEditing} icon={<Mail className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input type="email" value={form.contactEmail || ""} onChange={(e) => field("contactEmail", e.target.value)}
                placeholder="store@example.com" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.contactEmail || "—"}</p>
            )}
          </Field>
          <Field label="WhatsApp" editing={isEditing} icon={<MessageCircle className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.whatsapp || ""} onChange={(e) => field("whatsapp", e.target.value)}
                placeholder="+91 XXXXX XXXXX" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.whatsapp || "—"}</p>
            )}
          </Field>
        </Section>

        {/* Social */}
        <Section title="Online Presence">
          <Field label="Website" editing={isEditing} icon={<Globe className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.website || ""} onChange={(e) => field("website", e.target.value)}
                placeholder="https://yourstore.com" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.website || "—"}</p>
            )}
          </Field>
          <Field label="Instagram" editing={isEditing} icon={<Instagram className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.instagram || ""} onChange={(e) => field("instagram", e.target.value)}
                placeholder="@handle" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.instagram || "—"}</p>
            )}
          </Field>
          <Field label="Facebook" editing={isEditing} icon={<Facebook className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.facebook || ""} onChange={(e) => field("facebook", e.target.value)}
                placeholder="Page URL or handle" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.facebook || "—"}</p>
            )}
          </Field>
        </Section>

        {/* Payment */}
        <Section title="Payment Information">
          <Field label="UPI ID" editing={isEditing} icon={<Smartphone className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.upiId || ""} onChange={(e) => field("upiId", e.target.value)}
                placeholder="yourname@upi" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.upiId || "—"}</p>
            )}
          </Field>
          <Field label="Account Holder" editing={isEditing} icon={<Building2 className="h-3.5 w-3.5" />}>
            {isEditing ? (
              <Input value={form.bankDetails?.accountHolder || ""} onChange={(e) => bankField("accountHolder", e.target.value)}
                placeholder="Account holder name" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.bankDetails?.accountHolder || "—"}</p>
            )}
          </Field>
          <Field label="Bank Name" editing={isEditing}>
            {isEditing ? (
              <Input value={form.bankDetails?.bankName || ""} onChange={(e) => bankField("bankName", e.target.value)}
                placeholder="Bank name" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.bankDetails?.bankName || "—"}</p>
            )}
          </Field>
          <Field label="Account Number" editing={isEditing}>
            {isEditing ? (
              <Input value={form.bankDetails?.accountNumber || ""} onChange={(e) => bankField("accountNumber", e.target.value)}
                placeholder="Account number" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">
                {store.bankDetails?.accountNumber ? `••••${store.bankDetails.accountNumber.slice(-4)}` : "—"}
              </p>
            )}
          </Field>
          <Field label="IFSC Code" editing={isEditing}>
            {isEditing ? (
              <Input value={form.bankDetails?.ifscCode || ""} onChange={(e) => bankField("ifscCode", e.target.value)}
                placeholder="IFSC code" className="h-9 rounded-xl text-sm" />
            ) : (
              <p className="text-sm text-muted-foreground">{store.bankDetails?.ifscCode || "—"}</p>
            )}
          </Field>
        </Section>
      </div>
    </motion.div>
  );
};

// ─── PAYOUTS TAB ──────────────────────────────────────────────────────────────

const PayoutsTab = ({ owner, qc }: { owner: any; qc: any }) => {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [payoutMethod, setPayoutMethod] = useState<"upi" | "bank_transfer">("upi");
  const [upiId, setUpiId] = useState("");
  const [bankDetails, setBankDetails] = useState({ accountHolder: "", accountNumber: "", bankName: "", ifscCode: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["owner-payouts"],
    queryFn: async () => {
      const { data } = await api.get("/store-payouts/my", { headers: authHeader(owner.token) });
      return data;
    },
    enabled: Boolean(owner?.token),
  });

  const requestMutation = useMutation({
    mutationFn: () =>
      api.post("/store-payouts", {
        payoutMethod,
        upiId: payoutMethod === "upi" ? upiId : undefined,
        bankDetails: payoutMethod === "bank_transfer" ? bankDetails : undefined,
      }, { headers: authHeader(owner.token) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["owner-payouts"] });
      setShowRequestForm(false);
      toast.success("Payout request submitted! We'll process it within 2–3 business days.");
    },
    onError: (err: any) => toast.error(err.response?.data?.message || "Failed to submit payout request"),
  });

  const summary = data?.summary;
  const payouts: any[] = data?.payouts || [];
  const hasPending = payouts.some(p => p.status === "pending" || p.status === "processing");

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-6">
      {/* Summary cards */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
        </div>
      ) : summary && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SummaryCard
            label="Gross Revenue"
            value={`₹${summary.grossRevenue.toFixed(0)}`}
            sub="Delivered orders"
            icon={TrendingUp}
            color="text-foreground"
          />
          <SummaryCard
            label="Platform Fee"
            value={`₹${summary.platformFee.toFixed(0)}`}
            sub={`${summary.platformFeePercent}% of gross`}
            icon={CreditCard}
            color="text-muted-foreground"
          />
          <SummaryCard
            label="Available"
            value={`₹${summary.availableNet.toFixed(0)}`}
            sub="Net payout"
            icon={IndianRupee}
            color="text-amber-500"
            highlight
          />
          <SummaryCard
            label="Total Paid"
            value={`₹${summary.paidOut.toFixed(0)}`}
            sub="Settled"
            icon={CheckCircle2}
            color="text-emerald-500"
          />
        </div>
      )}

      {/* Request payout CTA */}
      {!showRequestForm && (
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-500/5 border border-amber-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="font-black text-xs">Request Settlement</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {hasPending
                ? "Payout request in progress."
                : summary?.availableNet > 0
                  ? `₹${summary?.availableNet?.toFixed(0)} available for withdrawal.`
                  : "No earnings available yet."}
            </p>
          </div>
          <Button
            onClick={() => setShowRequestForm(true)}
            disabled={hasPending || !summary?.availableNet || summary.availableNet <= 0}
            className="shrink-0 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-black text-[10px] uppercase tracking-widest gap-2 h-9 px-4"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Withdraw ₹{summary?.availableNet?.toFixed(0) || "0"}
          </Button>
        </div>
      )}

      {/* Payout request form */}
      <AnimatePresence>
        {showRequestForm && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-card border border-border rounded-2xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wider">Payout Request</h3>
              <button onClick={() => setShowRequestForm(false)} className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="bg-muted/30 rounded-xl p-4 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Available earnings</span>
                <span className="font-bold">₹{summary?.availableGross?.toFixed(0)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Platform fee ({summary?.platformFeePercent}%)</span>
                <span className="font-bold text-rose-500">- ₹{summary?.platformFee?.toFixed(0)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between text-sm font-black">
                <span>You receive</span>
                <span className="text-amber-500">₹{summary?.availableNet?.toFixed(0)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payout Method</p>
              <div className="grid grid-cols-2 gap-3">
                {(["upi", "bank_transfer"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setPayoutMethod(m)}
                    className={cn(
                      "p-4 rounded-xl border text-left transition-all",
                      payoutMethod === m
                        ? "bg-amber-500/10 border-amber-500/40"
                        : "bg-muted/20 border-border hover:border-amber-500/30"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {m === "upi" ? <Smartphone className="h-4 w-4 text-amber-500" /> : <Building2 className="h-4 w-4 text-amber-500" />}
                      <span className="text-xs font-black uppercase tracking-wider">{m === "upi" ? "UPI" : "Bank Transfer"}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{m === "upi" ? "Instant transfer" : "1–2 business days"}</p>
                  </button>
                ))}
              </div>
            </div>

            {payoutMethod === "upi" ? (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">UPI ID</label>
                <Input value={upiId} onChange={(e) => setUpiId(e.target.value)}
                  placeholder="yourname@upi" className="h-10 rounded-xl text-sm" />
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { key: "accountHolder", label: "Account Holder", placeholder: "Full name" },
                  { key: "accountNumber", label: "Account Number", placeholder: "Account number" },
                  { key: "bankName", label: "Bank Name", placeholder: "e.g. HDFC Bank" },
                  { key: "ifscCode", label: "IFSC Code", placeholder: "e.g. HDFC0001234" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key} className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</label>
                    <Input
                      value={(bankDetails as any)[key]}
                      onChange={(e) => setBankDetails(b => ({ ...b, [key]: e.target.value }))}
                      placeholder={placeholder}
                      className="h-10 rounded-xl text-sm"
                    />
                  </div>
                ))}
              </div>
            )}

            <Button
              onClick={() => requestMutation.mutate()}
              disabled={requestMutation.isPending || (payoutMethod === "upi" ? !upiId : !bankDetails.accountNumber)}
              className="w-full h-11 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase tracking-widest"
            >
              {requestMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Submit Payout Request"}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payout history */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payout History</h3>
        {payouts.length === 0 ? (
          <div className="py-12 text-center bg-card/50 border border-dashed border-border rounded-2xl">
            <Wallet className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">No payout requests yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((p: any) => (
              <div key={p._id} className="bg-card border border-border rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                    <IndianRupee className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">₹{p.netAmount.toFixed(0)} net</p>
                    <p className="text-xs text-muted-foreground">
                      {p.payoutMethod === "upi" ? `UPI · ${p.upiId}` : `Bank · ••••${p.bankDetails?.accountNumber?.slice(-4)}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      Requested {new Date(p.createdAt).toLocaleDateString()}
                      {p.processedAt && ` · Processed ${new Date(p.processedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <Badge className={cn("border text-xs font-bold", PAYOUT_STATUS[p.status]?.cls)}>
                    {PAYOUT_STATUS[p.status]?.label}
                  </Badge>
                  {p.adminNote && <p className="text-[10px] text-muted-foreground italic">{p.adminNote}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ─── Shared tiny components ───────────────────────────────────────────────────

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-xl p-4 space-y-3">
    <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Field = ({
  label, icon, editing, children,
}: { label: string; icon?: React.ReactNode; editing: boolean; children: React.ReactNode }) => (
  <div className="space-y-1.5">
    <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
      {icon}{label}
    </p>
    {children}
  </div>
);

const SummaryCard = ({
  label, value, sub, icon: Icon, color, highlight,
}: { label: string; value: string; sub: string; icon: any; color: string; highlight?: boolean }) => (
  <div className={cn(
    "rounded-xl p-3.5 border space-y-2",
    highlight ? "bg-amber-500/5 border-amber-500/20" : "bg-card border-border"
  )}>
    <div className="flex items-center justify-between">
      <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
      <Icon className={cn("h-3.5 w-3.5 opacity-70", color)} />
    </div>
    <p className={cn("text-xl font-black italic", color)}>{value}</p>
    <p className="text-[9px] text-muted-foreground leading-tight">{sub}</p>
  </div>
);

export default StoreOwnerPortal;
