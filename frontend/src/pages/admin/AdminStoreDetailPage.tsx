import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Store, MapPin, Phone, Mail, MessageCircle, Clock, Link2,
  CreditCard, Building2, Instagram, Facebook, Globe,
  Package, Plus, Trash2, Edit3, ChevronLeft, ToggleLeft, ToggleRight,
  Image as ImageIcon, X, Upload, ShoppingBag, UserPlus, KeyRound,
  Wallet, TrendingUp, IndianRupee, CheckCircle2, AlertCircle,
  Check, Ban, Loader2, Smartphone,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";

// ── Add Product Modal ────────────────────────────────────────────────────────
const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  image: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  isAvailable: z.boolean().default(true),
});

type ProductFormValues = z.infer<typeof productSchema>;

const AddProductModal = ({ storeId, onClose }: { storeId: string; onClose: () => void }) => {
  const qc = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, discountPercent: 0, image: "", description: "", isAvailable: true },
  });

  const handleImageUpload = () => {
    // @ts-ignore
    window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1,
      },
      (error: any, result: any) => {
        if (!error && result?.event === "success") form.setValue("image", result.info.secure_url);
      },
    ).open();
  };

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const { data } = await api.post(`/local-stores/${storeId}/products`, values);
      return data;
    },
    onSuccess: () => {
      toast.success("Product added.");
      qc.invalidateQueries({ queryKey: ["adminStoreDetail", storeId] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  const labelClass = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";
  const inputClass = "h-12 rounded-xl bg-muted/30 border-border";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-black text-base uppercase tracking-tight">Add Product</h2>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Product Name</FormLabel>
                <FormControl><Input className={inputClass} placeholder="e.g. Masala Chai" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Description</FormLabel>
                <FormControl><Input className={inputClass} placeholder="Short description" {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Price (₹)</FormLabel>
                  <FormControl><Input type="number" className={inputClass} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="discountPercent" render={({ field }) => (
                <FormItem>
                  <FormLabel className={labelClass}>Discount %</FormLabel>
                  <FormControl><Input type="number" className={inputClass} {...field} /></FormControl>
                </FormItem>
              )} />
            </div>

            {form.watch("image") && (
              <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                <img src={form.watch("image")} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => form.setValue("image", "")}
                  className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive/80 text-white flex items-center justify-center">
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            <button type="button" onClick={handleImageUpload}
              className="w-full h-12 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 transition-colors">
              <Upload className="h-4 w-4" /> {form.watch("image") ? "Change Image" : "Upload Image"}
            </button>

            <Button type="button"
              onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
              disabled={mutation.isPending}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary">
              {mutation.isPending ? "Adding..." : "Add Product"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const AdminStoreDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<"info" | "products" | "orders" | "owners" | "payouts">("info");
  const [payoutActionId, setPayoutActionId] = useState<string | null>(null);
  const [payoutNote, setPayoutNote] = useState("");
  const [showCreateOwner, setShowCreateOwner] = useState(false);
  const [ownerName, setOwnerName] = useState("");
  const [ownerEmail, setOwnerEmail] = useState("");
  const [showAddProduct, setShowAddProduct] = useState(false);

  const { data: store, isLoading } = useQuery({
    queryKey: ["adminStoreDetail", id],
    queryFn: async () => {
      const { data } = await api.get(`/local-stores/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  const { data: orders } = useQuery({
    queryKey: ["storeOrders", id],
    queryFn: async () => {
      const { data } = await api.get(`/store-orders/admin?storeId=${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  const { data: storeOwners } = useQuery({
    queryKey: ["storeOwners", id],
    queryFn: async () => {
      const { data } = await api.get(`/store-owner/store/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  const { data: earningsData, isLoading: earningsLoading } = useQuery({
    queryKey: ["storeEarnings", id],
    queryFn: async () => {
      const { data } = await api.get(`/store-payouts/admin/store/${id}`);
      return data;
    },
    enabled: Boolean(id) && activeTab === "payouts",
  });

  const updatePayoutMutation = useMutation({
    mutationFn: ({ payoutId, status, note }: { payoutId: string; status: string; note: string }) =>
      api.patch(`/store-payouts/${payoutId}/status`, { status, adminNote: note }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["storeEarnings", id] });
      setPayoutActionId(null);
      setPayoutNote("");
      toast.success("Payout status updated");
    },
    onError: () => toast.error("Failed to update payout status"),
  });

  const toggleMutation = useMutation({
    mutationFn: () => api.patch(`/local-stores/${id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminStoreDetail", id] }),
  });

  const removeProductMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/local-stores/${id}/products/${productId}`),
    onSuccess: () => {
      toast.success("Product removed.");
      qc.invalidateQueries({ queryKey: ["adminStoreDetail", id] });
    },
  });

  const createOwnerMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post("/store-owner/create", {
        name: ownerName, email: ownerEmail, storeId: id,
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Owner account created! Temp password: ${data.tempPassword}`);
      qc.invalidateQueries({ queryKey: ["storeOwners", id] });
      setShowCreateOwner(false);
      setOwnerName(""); setOwnerEmail("");
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to create owner"),
  });

  const deleteOwnerMutation = useMutation({
    mutationFn: (ownerId: string) => api.delete(`/store-owner/${ownerId}`),
    onSuccess: () => {
      toast.success("Owner removed.");
      qc.invalidateQueries({ queryKey: ["storeOwners", id] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full rounded-2xl" />
      </div>
    );
  }

  if (!store) return <div className="p-8 text-muted-foreground">Store not found.</div>;

  const TABS = [
    { key: "info",     label: "Store Info" },
    { key: "products", label: `Products (${store.products?.length ?? 0})` },
    { key: "orders",   label: `Orders (${orders?.length ?? 0})` },
    { key: "owners",   label: `Owners (${storeOwners?.length ?? 0})` },
    { key: "payouts",  label: "Payouts" },
  ] as const;

  const infoRow = (Icon: any, label: string, value: string, href?: string) => (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-muted/20">
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
        {href
          ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-sm font-bold hover:text-primary transition-colors break-all">{value}</a>
          : <p className="text-sm font-bold break-all">{value}</p>
        }
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 max-w-5xl">
      {/* Back */}
      <button
        type="button"
        onClick={() => navigate("/portal/admin/local-stores")}
        className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronLeft className="h-3.5 w-3.5" /> All Stores
      </button>

      {/* Store hero */}
      <div className="bg-card border border-border rounded-3xl overflow-hidden">
        {store.photos?.[0] && (
          <div className="h-48 w-full overflow-hidden">
            <img src={store.photos[0]} alt={store.name} className="w-full h-full object-cover" />
          </div>
        )}
        <div className="p-6 flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black">{store.name}</h1>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                store.isActive ? "bg-emerald-500/10 text-emerald-500" : "bg-muted text-muted-foreground"
              )}>
                {store.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-full">
              {store.category}
            </span>
            {store.description && <p className="mt-3 text-sm text-muted-foreground max-w-lg">{store.description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleMutation.mutate()}
              className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center transition-colors",
                store.isActive ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : "bg-muted text-muted-foreground hover:bg-muted/80"
              )}
              title={store.isActive ? "Deactivate" : "Activate"}
            >
              {store.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
            </button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/portal/admin/local-stores/${id}/edit`)}
              className="h-10 px-4 rounded-xl font-black uppercase tracking-widest text-[10px] gap-2"
            >
              <Edit3 className="h-3.5 w-3.5" /> Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "px-5 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors",
              activeTab === t.key
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Info Tab ── */}
      {activeTab === "info" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Contact */}
          <section className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Contact</p>
            <div className="space-y-2">
              {store.address && infoRow(MapPin, "Address", store.address)}
              {store.contactPhone && infoRow(Phone, "Phone", store.contactPhone, `tel:${store.contactPhone}`)}
              {store.whatsapp && infoRow(MessageCircle, "WhatsApp", store.whatsapp, `https://wa.me/${store.whatsapp.replace(/\D/g, "")}`)}
              {store.contactEmail && infoRow(Mail, "Email", store.contactEmail, `mailto:${store.contactEmail}`)}
              {store.openingHours && infoRow(Clock, "Opening Hours", store.openingHours)}
              {store.googleMapUrl && infoRow(Link2, "Google Maps", "View Location", store.googleMapUrl)}
            </div>
          </section>

          {/* Payment */}
          <section className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payment</p>
            {store.paymentMethods?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {store.paymentMethods.map((m: string) => (
                  <span key={m} className="px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                    {m === "cod" ? "Cash on Delivery" : m === "upi" ? "UPI" : m === "card" ? "Card" : m === "bank_transfer" ? "Bank Transfer" : "Online"}
                  </span>
                ))}
              </div>
            )}
            {store.upiId && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/20">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                <span className="font-mono text-sm font-bold">{store.upiId}</span>
              </div>
            )}
            {store.bankDetails?.accountNumber && (
              <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Bank Details</p>
                </div>
                {[
                  ["Account Holder", store.bankDetails?.accountHolder],
                  ["Bank Name", store.bankDetails?.bankName],
                  ["Account Number", store.bankDetails?.accountNumber],
                  ["IFSC Code", store.bankDetails?.ifscCode],
                ].filter(([, v]) => v).map(([label, value]) => (
                  <div key={label as string} className="flex justify-between text-sm">
                    <span className="text-muted-foreground text-xs">{label}</span>
                    <span className="font-bold font-mono text-xs">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Social */}
          {(store.website || store.instagram || store.facebook) && (
            <section className="space-y-3 md:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Social & Web</p>
              <div className="flex flex-wrap gap-3">
                {store.website && (
                  <a href={store.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/20 border border-border hover:border-primary/40 text-xs font-bold transition-colors">
                    <Globe className="h-4 w-4" /> Website
                  </a>
                )}
                {store.instagram && (
                  <a href={`https://instagram.com/${store.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/20 border border-border hover:border-pink-500/40 text-xs font-bold transition-colors hover:text-pink-500">
                    <Instagram className="h-4 w-4" /> {store.instagram}
                  </a>
                )}
                {store.facebook && (
                  <a href={store.facebook.startsWith("http") ? store.facebook : `https://facebook.com/${store.facebook}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-muted/20 border border-border hover:border-blue-500/40 text-xs font-bold transition-colors hover:text-blue-500">
                    <Facebook className="h-4 w-4" /> Facebook
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Photos */}
          {store.photos?.length > 0 && (
            <section className="space-y-3 md:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Photos</p>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {store.photos.map((photo: string, i: number) => (
                  <div key={i} className="aspect-square rounded-xl overflow-hidden bg-muted">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Products Tab ── */}
      {activeTab === "products" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{store.products?.length ?? 0} products listed</p>
            <Button
              type="button"
              onClick={() => setShowAddProduct(true)}
              className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
            >
              <Plus className="h-4 w-4" /> Add Product
            </Button>
          </div>

          {!store.products?.length ? (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl">
              <Package className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No products yet</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {store.products.map((product: any) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/60 hover:border-primary/20 transition-colors"
                >
                  <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    {product.image
                      ? <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center"><ImageIcon className="h-5 w-5 text-muted-foreground/30" /></div>
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm truncate">{product.name}</p>
                    {product.description && <p className="text-xs text-muted-foreground truncate">{product.description}</p>}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-primary">₹{product.price}</span>
                      {product.discountPercent ? (
                        <span className="text-[9px] bg-rose-500/10 text-rose-500 font-black px-1.5 py-0.5 rounded-full">{product.discountPercent}% off</span>
                      ) : null}
                      <span className={cn("text-[9px] font-black", product.isAvailable ? "text-emerald-500" : "text-muted-foreground")}>
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (confirm("Remove this product?")) removeProductMutation.mutate(product._id); }}
                    className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Orders Tab ── */}
      {activeTab === "orders" && (
        <div className="space-y-3">
          {!orders?.length ? (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl">
              <ShoppingBag className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No orders yet</p>
            </div>
          ) : (
            orders.map((order: any) => (
              <div key={order._id} className="bg-card border border-border rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{order.customer.name}</p>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                      #{order._id.slice(-6).toUpperCase()} · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-black">₹{order.totalAmount.toFixed(0)}</span>
                    <span className={cn(
                      "text-[10px] font-black uppercase px-3 py-1 rounded-full border",
                      order.status === "delivered" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                      order.status === "cancelled" ? "bg-rose-500/10 text-rose-500 border-rose-500/20" :
                      "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    )}>
                      {order.status}
                    </span>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {order.customer.phone} · {order.customer.address}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Owners Tab ── */}
      {activeTab === "owners" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Store owners can log in at{" "}
              <a href="/store-owner/login" target="_blank" className="text-primary font-bold hover:underline">
                /store-owner/login
              </a>
            </p>
            <Button
              type="button"
              onClick={() => setShowCreateOwner(true)}
              className="h-10 px-5 rounded-xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
            >
              <UserPlus className="h-4 w-4" /> Add Owner
            </Button>
          </div>

          {!storeOwners?.length ? (
            <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
              <KeyRound className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No owner accounts yet</p>
              <p className="text-xs text-muted-foreground/60 mt-2">Create an owner to let them manage orders.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {storeOwners.map((owner: any) => (
                <div key={owner._id} className="flex items-center gap-4 p-4 bg-card border border-border rounded-2xl">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary flex-shrink-0">
                    {owner.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm">{owner.name}</p>
                    <p className="text-xs text-muted-foreground">{owner.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => { if (confirm("Remove this owner?")) deleteOwnerMutation.mutate(owner._id); }}
                    className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center flex-shrink-0 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Create Owner Form */}
          {showCreateOwner && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-background border border-border rounded-3xl w-full max-w-md shadow-2xl p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-base uppercase tracking-tight">Create Store Owner</h3>
                  <button type="button" onClick={() => setShowCreateOwner(false)} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
                    <X className="h-4 w-4" />
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">A temporary password will be emailed to the owner.</p>
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Full Name</label>
                    <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-border" placeholder="Owner's full name" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email Address</label>
                    <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)}
                      className="h-12 rounded-xl bg-muted/30 border-border" placeholder="owner@store.com" />
                  </div>
                </div>
                <Button
                  type="button"
                  onClick={() => createOwnerMutation.mutate()}
                  disabled={createOwnerMutation.isPending || !ownerName || !ownerEmail}
                  className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary"
                >
                  {createOwnerMutation.isPending ? "Creating..." : "Create Owner Account"}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Payouts Tab ── */}
      {activeTab === "payouts" && (
        <div className="space-y-6">
          {/* Earnings summary */}
          {earningsLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array(4).fill(0).map((_, i) => <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />)}
            </div>
          ) : earningsData?.summary && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Gross Revenue",     value: `₹${earningsData.summary.grossRevenue.toFixed(0)}`,        icon: TrendingUp,    color: "text-foreground",   bg: "bg-card" },
                  { label: "Platform Earned",   value: `₹${earningsData.summary.totalPlatformEarned.toFixed(0)}`, icon: IndianRupee,   color: "text-primary",      bg: "bg-primary/5 border-primary/20" },
                  { label: "Pending Payout",    value: `₹${earningsData.summary.availableNet.toFixed(0)}`,        icon: AlertCircle,   color: "text-amber-500",    bg: "bg-amber-500/5 border-amber-500/20" },
                  { label: "Total Paid Out",    value: `₹${earningsData.summary.paidOut.toFixed(0)}`,             icon: CheckCircle2,  color: "text-emerald-500",  bg: "bg-card" },
                ].map(({ label, value, icon: Icon, color, bg }) => (
                  <div key={label} className={`rounded-2xl p-5 border space-y-3 ${bg}`}>
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                      <Icon className={`h-4 w-4 opacity-70 ${color}`} />
                    </div>
                    <p className={`text-2xl font-black ${color}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Fee breakdown */}
              <div className="bg-muted/30 border border-border rounded-2xl p-5 flex flex-wrap gap-6 text-sm">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Delivered Orders</p>
                  <p className="font-black">{earningsData.summary.deliveredOrders} / {earningsData.summary.totalOrders}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Platform Fee Rate</p>
                  <p className="font-black">{earningsData.summary.platformFeePercent}%</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Available (Gross)</p>
                  <p className="font-black">₹{earningsData.summary.availableGross.toFixed(0)}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Pending Fee Deduction</p>
                  <p className="font-black text-rose-500">- ₹{earningsData.summary.platformFee.toFixed(0)}</p>
                </div>
              </div>
            </>
          )}

          {/* Payout requests */}
          <div className="space-y-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Payout Requests</p>

            {!earningsData?.payouts?.length ? (
              <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-card">
                <Wallet className="h-10 w-10 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No payout requests yet</p>
              </div>
            ) : (
              earningsData.payouts.map((payout: any) => {
                const isActing = payoutActionId === payout._id;
                const statusStyles: Record<string, string> = {
                  pending:    "bg-amber-500/10 text-amber-500 border-amber-500/20",
                  processing: "bg-blue-500/10 text-blue-500 border-blue-500/20",
                  paid:       "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
                  rejected:   "bg-rose-500/10 text-rose-500 border-rose-500/20",
                };
                return (
                  <div key={payout._id} className="bg-card border border-border rounded-2xl overflow-hidden">
                    {/* Row */}
                    <div className="flex items-center gap-4 p-5 flex-wrap">
                      <div className="h-10 w-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                        {payout.payoutMethod === "upi"
                          ? <Smartphone className="h-5 w-5 text-amber-500" />
                          : <Building2 className="h-5 w-5 text-amber-500" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-bold text-sm">₹{payout.netAmount.toFixed(0)} net</p>
                          <span className="text-xs text-muted-foreground">(₹{payout.requestedAmount.toFixed(0)} gross · ₹{payout.platformFee.toFixed(0)} fee)</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {payout.payoutMethod === "upi"
                            ? `UPI · ${payout.upiId}`
                            : `Bank · ${payout.bankDetails?.bankName || ""} ••••${payout.bankDetails?.accountNumber?.slice(-4) || ""}`
                          }
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Requested {new Date(payout.createdAt).toLocaleDateString()}
                          {payout.processedAt && ` · Processed ${new Date(payout.processedAt).toLocaleDateString()}`}
                        </p>
                        {payout.adminNote && (
                          <p className="text-[10px] italic text-muted-foreground mt-1">Note: {payout.adminNote}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${statusStyles[payout.status] || ""}`}>
                          {payout.status}
                        </span>
                        {payout.status === "pending" && (
                          <button
                            onClick={() => { setPayoutActionId(isActing ? null : payout._id); setPayoutNote(""); }}
                            className="h-8 px-3 rounded-xl bg-muted text-xs font-bold hover:bg-muted/80 transition-colors"
                          >
                            {isActing ? "Cancel" : "Review"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Inline action panel */}
                    {isActing && (
                      <div className="border-t border-border bg-muted/20 p-5 space-y-4">
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Admin Action</p>
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Note (optional)</label>
                          <Input
                            value={payoutNote}
                            onChange={(e) => setPayoutNote(e.target.value)}
                            placeholder="Add a note for the store owner..."
                            className="h-10 rounded-xl text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            onClick={() => updatePayoutMutation.mutate({ payoutId: payout._id, status: "processing", note: payoutNote })}
                            disabled={updatePayoutMutation.isPending}
                            className="rounded-xl bg-blue-500 hover:bg-blue-400 text-white gap-1.5 text-xs"
                          >
                            <Loader2 className={`h-3.5 w-3.5 ${updatePayoutMutation.isPending ? "animate-spin" : "hidden"}`} />
                            Mark Processing
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => updatePayoutMutation.mutate({ payoutId: payout._id, status: "paid", note: payoutNote })}
                            disabled={updatePayoutMutation.isPending}
                            className="rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white gap-1.5 text-xs"
                          >
                            <Check className="h-3.5 w-3.5" /> Mark Paid
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePayoutMutation.mutate({ payoutId: payout._id, status: "rejected", note: payoutNote })}
                            disabled={updatePayoutMutation.isPending}
                            className="rounded-xl border-rose-500/30 text-rose-500 hover:bg-rose-500/10 gap-1.5 text-xs"
                          >
                            <Ban className="h-3.5 w-3.5" /> Reject
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {showAddProduct && <AddProductModal storeId={id!} onClose={() => setShowAddProduct(false)} />}
    </div>
  );
};

export default AdminStoreDetailPage;
