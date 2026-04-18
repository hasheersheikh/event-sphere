import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store, MapPin, Phone, Mail, MessageCircle, Clock, Link2,
  CreditCard, Building2, Instagram, Facebook, Globe,
  Package, Plus, Trash2, Edit3, ChevronLeft, ToggleLeft, ToggleRight,
  Image as ImageIcon, X, Upload, ShoppingBag, UserPlus, KeyRound,
  Wallet, TrendingUp, IndianRupee, CheckCircle2, AlertCircle,
  Check, Ban, Loader2, Smartphone, LayoutDashboard, Activity, ExternalLink, ArrowUpRight
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
import { Badge } from "@/components/ui/badge";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalDataTable } from "@/components/portal/PortalDataTable";
import { PortalGrid } from "@/components/portal/PortalGrid";

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

  const labelClass = "text-[9px] font-black uppercase tracking-widest text-muted-foreground";
  const inputClass = "h-10 rounded-lg bg-muted/30 border-border text-xs";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-black text-sm uppercase tracking-tight">Add Product</h2>
          <button type="button" onClick={onClose} className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
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
              <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-border">
                <img src={form.watch("image")} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => form.setValue("image", "")}
                  className="absolute top-1 right-1 h-4 w-4 rounded-full bg-destructive/80 text-white flex items-center justify-center">
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            )}
            <button type="button" onClick={handleImageUpload}
              className="w-full h-9 rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5 transition-colors italic">
              <Upload className="h-3.5 w-3.5" /> {form.watch("image") ? "Modify" : "Upload"}
            </button>

            <Button type="button"
              onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
              disabled={mutation.isPending}
              className="w-full h-9 rounded-lg font-black uppercase tracking-widest text-[9px] bg-primary italic shadow-lg shadow-primary/10">
              {mutation.isPending ? "SAVING..." : "Add Product"}
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
  const [ordersPage, setOrdersPage] = useState(1);

  const { data: store, isLoading } = useQuery({
    queryKey: ["adminStoreDetail", id],
    queryFn: async () => {
      const { data } = await api.get(`/local-stores/${id}`);
      return data;
    },
    enabled: Boolean(id),
  });

  const { data: ordersData, isFetching: ordersFetching } = useQuery({
    queryKey: ["storeOrders", id, ordersPage],
    queryFn: async () => {
      const { data } = await api.get(`/store-orders/admin?storeId=${id}&page=${ordersPage}&limit=10`);
      return data;
    },
    enabled: Boolean(id),
  });

  const orders = ordersData?.data || [];
  const ordersPagination = ordersData?.pagination;

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
      <div className="p-4 md:p-6 space-y-6 animate-pulse">
        <Skeleton className="h-8 w-48 rounded-lg" />
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="grid grid-cols-4 gap-6">
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
          <Skeleton className="h-24 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!store) return (
    <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-center">
      <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
        <AlertCircle className="h-8 w-8 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-xl font-black uppercase tracking-tight">Store context lost.</h2>
        <p className="text-sm text-muted-foreground">The store you are looking for does not exist or was removed.</p>
      </div>
      <Button variant="outline" onClick={() => navigate("/portal/admin/local-stores")} className="rounded-lg h-10 px-5 font-black uppercase tracking-widest text-[9px]">
        Back to Stores
      </Button>
    </div>
  );

  const TABS = [
    { key: "info",     label: "Overview", icon: LayoutDashboard },
    { key: "products", label: `Catalog (${store.products?.length ?? 0})`, icon: Package },
    { key: "orders",   label: `Activity (${ordersPagination?.total ?? 0})`, icon: ShoppingBag },
    { key: "owners",   label: `Management (${storeOwners?.length ?? 0})`, icon: KeyRound },
    { key: "payouts",  label: "Financials", icon: Wallet },
  ] as const;

  const quickStats = [
    { 
      label: "Gross Sales", 
      value: `₹${orders?.reduce((acc: number, o: any) => acc + (o.status === "delivered" ? o.totalAmount : 0), 0).toLocaleString()}`, 
      icon: TrendingUp, 
      color: "text-emerald-500", 
      bg: "bg-emerald-500/5" 
    },
    { 
      label: "Total Orders", 
      value: ordersPagination?.total ?? 0, 
      icon: ShoppingBag, 
      color: "text-blue-500", 
      bg: "bg-blue-500/5" 
    },
    { 
      label: "Live Products", 
      value: store.products?.filter((p: any) => p.isAvailable).length ?? 0, 
      icon: Package, 
      color: "text-amber-500", 
      bg: "bg-amber-500/5" 
    },
    { 
      label: "Business Status", 
      value: store.isActive ? "OPERATIONAL" : "SUSPENDED", 
      icon: store.isActive ? CheckCircle2 : Ban, 
      color: store.isActive ? "text-emerald-500" : "text-rose-500", 
      bg: store.isActive ? "bg-emerald-500/5" : "bg-rose-500/5" 
    },
  ];

  const infoRow = (Icon: any, label: string, value: string, href?: string) => (
    <div className="flex items-center justify-between p-3.5 rounded-xl bg-muted/20 border border-border/40 hover:border-primary/20 transition-all group">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-background border border-border flex items-center justify-center shrink-0 group-hover:bg-primary/5 transition-colors">
          <Icon className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
        <div>
          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground/60">{label}</p>
          {href
            ? <a href={href} target="_blank" rel="noopener noreferrer" className="text-xs font-bold hover:text-primary transition-colors break-all leading-none">{value}</a>
            : <p className="text-xs font-bold break-all leading-none">{value}</p>
          }
        </div>
      </div>
    </div>
  );

  const payoutColumns = [
    {
      header: "Transaction",
      accessor: (p: any) => (
        <span className="text-[9px] font-black italic tracking-widest opacity-60">
          #{p._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Method",
      accessor: (p: any) => (
        <div className="flex items-center gap-2">
          {p.payoutMethod === "upi"
            ? <Smartphone className="h-3.5 w-3.5 text-primary" />
            : <Building2 className="h-3.5 w-3.5 text-primary" />
          }
          <span className="text-[10px] font-black uppercase tracking-widest">{p.payoutMethod}</span>
        </div>
      ),
    },
    {
      header: "Destination",
      accessor: (p: any) => (
        <span className="text-[10px] font-bold text-muted-foreground italic truncate max-w-[150px]">
          {p.payoutMethod === "upi" ? p.upiId : `${p.bankDetails?.bankName} ••••${p.bankDetails?.accountNumber?.slice(-4)}`}
        </span>
      ),
    },
    {
      header: "STATUS",
      accessor: (p: any) => {
        const statuses: Record<string, string> = {
          pending:    "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5",
          processing: "bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/5",
          paid:       "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5",
          rejected:   "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5",
        };
        return (
          <Badge className={cn("px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border italic truncate", statuses[p.status])}>
            {p.status}
          </Badge>
        );
      },
    },
    {
      header: "Amount",
      accessor: (p: any) => (
        <span className="text-xs font-black italic tabular-nums text-foreground">
          ₹{p.netAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (p: any) => (
        <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">
          {new Date(p.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: "Action",
      accessor: (p: any) => (
        p.status === "pending" && (
          <button
            onClick={() => { setPayoutActionId(payoutActionId === p._id ? null : p._id); setPayoutNote(""); }}
            className="h-8 px-4 rounded-lg bg-primary text-black text-[9px] font-black uppercase tracking-widest shadow-lg shadow-primary/10 italic hover:scale-105 transition-all"
          >
            {payoutActionId === p._id ? "Cancel" : "Review"}
          </button>
        )
      ),
    },
  ];

  const orderColumns = [
    {
      header: "Order ID",
      accessor: (o: any) => (
        <span className="text-[9px] font-black italic tracking-widest opacity-60">
          #{o._id.slice(-6).toUpperCase()}
        </span>
      ),
    },
    {
      header: "Customer",
      accessor: (o: any) => (
        <div className="flex flex-col">
          <span className="text-xs font-black uppercase italic tracking-tight">{o.customer?.name ?? "Anonymous"}</span>
          <span className="text-[9px] font-bold text-muted-foreground italic opacity-60">{o.customer?.phone}</span>
        </div>
      ),
    },
    {
      header: "Address",
      accessor: (o: any) => (
        <div className="flex items-center gap-1.5 p-1 px-2 rounded-lg bg-muted/20 border border-border/40 w-fit">
          <MapPin className="h-3 w-3 text-primary opacity-60" />
          <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[120px] italic">
            {o.customer?.address}
          </span>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: (o: any) => (
        <Badge className={cn(
          "rounded-lg text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 italic shadow-sm",
          o.status === "delivered" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/5" :
          o.status === "cancelled" ? "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5" :
          "bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5"
        )}>
          {o.status}
        </Badge>
      ),
    },
    {
      header: "Total",
      accessor: (o: any) => (
        <span className="text-xs font-black italic tabular-nums text-foreground">
          ₹{o.totalAmount?.toLocaleString()}
        </span>
      ),
    },
    {
      header: "Date",
      accessor: (o: any) => (
        <span className="text-[9px] font-black text-muted-foreground uppercase opacity-60">
          {new Date(o.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      <nav className="flex items-center justify-between mb-2">
        <button
          onClick={() => navigate("/portal/admin/local-stores")}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/30 hover:bg-muted/50 text-[9px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-all border border-border/40 backdrop-blur-sm"
        >
          <ChevronLeft className="h-3 w-3" /> Back to Stores
        </button>
        <Badge variant="outline" className="h-7 px-4 border-primary/20 bg-primary/10 text-primary font-black uppercase tracking-widest italic text-[8px] rounded-xl shadow-lg shadow-primary/5 capitalize">
          Store ID: {id?.slice(-4).toUpperCase()}
        </Badge>
      </nav>

      <PortalPageHeader 
        title={store.name}
        icon={Store}
        subtitle={store.description || "No description provided."}
        badge={
          <Badge variant={store.isActive ? "secondary" : "destructive"} className="h-5 font-black uppercase text-[8px] px-3 rounded-lg shadow-sm italic tracking-widest">
            {store.isActive ? "OPERATIONAL" : "SUSPENDED"}
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
             <button
                onClick={() => toggleMutation.mutate()}
                className={cn(
                  "flex items-center gap-1.5 px-4 h-10 rounded-xl font-black uppercase tracking-widest text-[9px] transition-all italic border shadow-lg overflow-hidden relative group",
                  store.isActive 
                    ? "bg-rose-500/10 text-rose-500 border-rose-500/20 hover:bg-rose-500/20" 
                    : "bg-emerald-500 text-emerald-950 border-transparent hover:bg-emerald-400"
                )}
              >
                {store.isActive ? <Ban className="h-3.5 w-3.5" /> : <Check className="h-3.5 w-3.5" />}
                {store.isActive ? "Deactivate" : "Activate"}
              </button>
              <Button
                onClick={() => navigate(`/portal/admin/local-stores/${id}/edit`)}
                className="h-10 px-5 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/10 italic hover:scale-105 transition-all"
              >
                <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Store
              </Button>
          </div>
        }
      />

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {quickStats.map((stat, i) => (
          <PortalStatCard
            key={stat.label}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            index={i}
            color={stat.color}
            bg={stat.bg}
            subtext="Store Stats"
          />
        ))}
      </section>

      <div className="flex flex-wrap items-center gap-1 p-1 bg-muted/20 border border-border/40 rounded-2xl w-fit backdrop-blur-md shadow-inner">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all italic",
              activeTab === t.key
                ? "bg-background text-primary shadow-xl ring-1 ring-border/50 scale-105"
                : "text-muted-foreground hover:bg-background/40 hover:text-foreground"
            )}
          >
            <t.icon className={cn("h-3.5 w-3.5", activeTab === t.key ? "text-primary" : "text-muted-foreground/60")} />
            {t.label}
          </button>
        ))}
      </div>

        {/* Tab Content Transition Wrap */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === "info" && (
              <motion.div key="info" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Business Details */}
                <div className="lg:col-span-2 space-y-6">
                  <section className="bg-card border border-border rounded-xl p-4 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] scale-[4] pointer-events-none">
                      <Store className="h-16 w-16" />
                    </div>
                    <h3 className="text-sm font-black uppercase brand-font italic tracking-tighter mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-4 bg-primary rounded-full" />
                      Store <span className="text-primary">Details.</span>
                    </h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {store.address && infoRow(MapPin, "Location", store.address)}
                      {store.contactPhone && infoRow(Phone, "Line", store.contactPhone, `tel:${store.contactPhone}`)}
                      {store.whatsapp && infoRow(MessageCircle, "WhatsApp", store.whatsapp, `https://wa.me/${store.whatsapp.replace(/\D/g, "")}`)}
                      {store.contactEmail && infoRow(Mail, "Email", store.contactEmail, `mailto:${store.contactEmail}`)}
                      {store.openingHours && infoRow(Clock, "Hours", store.openingHours)}
                      {store.googleMapUrl && infoRow(Link2, "Map Link", "Open Map", store.googleMapUrl)}
                    </div>
                  </section>

                  <section className="bg-card border border-border rounded-xl p-4 shadow-2xl">
                    <h3 className="text-sm font-black uppercase brand-font italic tracking-tighter mb-4 flex items-center gap-2">
                      <div className="h-1.5 w-4 bg-rose-500 rounded-full" />
                      Visual <span className="text-rose-500">Assets.</span>
                    </h3>
                    {store.photos?.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {store.photos.map((photo: string, i: number) => (
                          <div key={i} className="aspect-[4/5] rounded-xl overflow-hidden bg-muted group/photo border border-border relative">
                            <img src={photo} alt="" className="w-full h-full object-cover group-hover/photo:scale-110 transition-transform duration-500" />
                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover/photo:opacity-100 transition-opacity flex items-center justify-center">
                              <ImageIcon className="h-5 w-5 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/10 opacity-50">
                        <ImageIcon className="h-8 w-8 mx-auto mb-2 text-muted-foreground/30" />
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">No assets</p>
                      </div>
                    )}
                  </section>
                </div>

                {/* Sidebar Config */}
                <div className="space-y-6">
                  <section className="bg-card border border-border rounded-xl p-4 shadow-2xl">
                    <h3 className="text-sm font-black uppercase brand-font italic tracking-tighter mb-4">
                      Payment <span className="text-primary">Info.</span>
                    </h3>
                    <div className="space-y-4">
                      {store.paymentMethods?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {store.paymentMethods.map((m: string) => (
                            <div key={m} className="px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest bg-primary/5 text-primary border border-primary/10">
                              {m.replace("_", " ")}
                            </div>
                          ))}
                        </div>
                      )}
                      {store.upiId && (
                        <div className="p-2.5 rounded-lg bg-muted/30 border border-border/60 flex items-center gap-3 group">
                          <Smartphone className="h-4 w-4 text-emerald-500" />
                          <div className="min-w-0">
                            <p className="text-[7px] font-black text-muted-foreground uppercase tracking-widest">UPI ID</p>
                            <p className="text-[10px] font-mono font-bold truncate group-hover:text-primary transition-colors">{store.upiId}</p>
                          </div>
                        </div>
                      )}
                      {store.bankDetails?.accountNumber && (
                        <div className="bg-muted/10 border border-border/40 rounded-xl p-4 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-lg bg-background border border-border flex items-center justify-center">
                              <Building2 className="h-3.5 w-3.5 text-primary" />
                            </div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Bank Account</p>
                          </div>
                          <div className="space-y-3 pt-2 border-t border-border/50">
                            {[
                              ["Beneficiary", store.bankDetails.accountHolder],
                              ["Institute", store.bankDetails.bankName],
                              ["Acct #", store.bankDetails.accountNumber],
                              ["IFSC Code", store.bankDetails.ifscCode],
                            ].filter(([, v]) => v).map(([label, value]) => (
                              <div key={label as string} className="flex justify-between items-end gap-4 overflow-hidden">
                                <span className="text-[9px] font-black uppercase text-muted-foreground shrink-0">{label}</span>
                                <div className="h-[1px] flex-1 bg-border/40 mb-1 border-dotted border-b pointer-events-none" />
                                <span className="text-[11px] font-black font-mono text-foreground">{value}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </section>

                  <section className="bg-card border border-border rounded-xl p-4 shadow-2xl overflow-hidden relative group/social">
                    <div className="absolute inset-0 bg-primary/[0.02] translate-y-full group-hover/social:translate-y-0 transition-transform duration-700" />
                    <h3 className="text-sm font-black uppercase brand-font italic tracking-tighter mb-4 relative">
                      Social <span className="text-primary">Links.</span>
                    </h3>
                    <div className="grid gap-2 relative">
                      {store.website && (
                        <a href={store.website} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group/link">
                          <Globe className="h-3.5 w-3.5 text-muted-foreground group-hover/link:text-primary" />
                          <span className="text-xs font-black uppercase tracking-tight">Website</span>
                          <ArrowUpRight className="h-2.5 w-2.5 ml-auto opacity-40" />
                        </a>
                      )}
                      {store.instagram && (
                        <a href={`https://instagram.com/${store.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/60 hover:border-pink-500/40 hover:bg-pink-500/5 transition-all group/inst">
                          <Instagram className="h-3.5 w-3.5 text-muted-foreground group-hover/inst:text-pink-500" />
                          <span className="text-xs font-black uppercase tracking-tight">Instagram</span>
                          <ArrowUpRight className="h-2.5 w-2.5 ml-auto opacity-40" />
                        </a>
                      )}
                      {store.facebook && (
                        <a href={store.facebook.startsWith("http") ? store.facebook : `https://facebook.com/${store.facebook}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/60 hover:border-blue-500/40 hover:bg-blue-500/5 transition-all group/fb">
                          <Facebook className="h-3.5 w-3.5 text-muted-foreground group-hover/fb:text-blue-500" />
                          <span className="text-xs font-black uppercase tracking-tight">Facebook</span>
                          <ArrowUpRight className="h-2.5 w-2.5 ml-auto opacity-40" />
                        </a>
                      )}
                    </div>
                  </section>
                </div>
              </motion.div>
            )}

            {activeTab === "products" && (
              <motion.div key="products" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <PortalGrid
                  data={store.products || []}
                  isLoading={isLoading}
                  columns={3}
                  renderItem={(product: any) => (
                    <div
                      key={product._id}
                      className="glass-card rounded-2xl p-4 border border-border/50 relative overflow-hidden group hover:border-primary/30 transition-all shadow-xl bg-card/40"
                    >
                      <div className="h-32 w-full rounded-xl overflow-hidden bg-muted border border-border relative mb-4">
                        {product.image
                          ? <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                          : <div className="w-full h-full flex items-center justify-center bg-muted/40 text-muted-foreground/20 italic font-black uppercase text-[10px]">No image</div>
                        }
                        <div className="absolute top-3 right-3 h-7 px-3 rounded-xl bg-background/90 backdrop-blur-md border border-white/10 flex items-center justify-center font-black text-xs text-primary shadow-lg tabular-nums italic">
                          ₹{product.price}
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-black text-sm tracking-tight uppercase group-hover:text-primary transition-colors truncate brand-font italic">{product.name}</h4>
                          <Badge className={cn(
                            "text-[8px] font-black uppercase px-2 py-0.5 rounded-lg border italic shadow-sm",
                            product.isAvailable ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-border"
                          )}>
                            {product.isAvailable ? "LIVE" : "DRAFT"}
                          </Badge>
                        </div>
                        {product.description && <p className="text-[10px] font-bold text-muted-foreground line-clamp-2 italic leading-relaxed opacity-80">{product.description}</p>}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t border-border/30">
                        {product.discountPercent ? (
                          <div className="px-2.5 py-1 rounded-lg bg-rose-500/10 text-rose-500 font-black text-[9px] border border-rose-500/10 italic">
                            -{product.discountPercent}% OFF
                          </div>
                        ) : <div />}
                        <button
                          onClick={() => { if (confirm("Remove this product?")) removeProductMutation.mutate(product._id); }}
                          className="h-9 w-9 rounded-xl bg-muted/40 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-all border border-border/40 hover:border-rose-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                  emptyMessage="No products yet."
                  header={
                    <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-muted/20 border border-border/40 p-4 rounded-2xl">
                      <div>
                        <h3 className="text-sm font-black uppercase brand-font italic tracking-tighter">
                          Product <span className="text-primary">Catalog.</span>
                        </h3>
                        <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mt-0.5 opacity-60">
                          {store.products?.length ?? 0} products
                        </p>
                      </div>
                      <Button onClick={() => setShowAddProduct(true)} className="h-9 px-6 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/10 gap-2 italic hover:scale-105 transition-all">
                        <Plus className="h-4 w-4" /> Add Product
                      </Button>
                    </header>
                  }
                />
              </motion.div>
            )}

             {activeTab === "orders" && (
              <motion.div key="orders" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <PortalDataTable
                  columns={orderColumns}
                  data={orders}
                  isLoading={isLoading || ordersFetching}
                  pagination={ordersPagination}
                  onPageChange={setOrdersPage}
                  emptyMessage="No orders yet."
                  rowKey="_id"
                />
              </motion.div>
            )}

            {activeTab === "owners" && (
              <motion.div key="owners" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <PortalGrid
                  data={storeOwners || []}
                  isLoading={isLoading}
                  columns={3}
                  renderItem={(owner: any) => (
                    <div key={owner._id} className="p-4 bg-muted/10 border border-border/60 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all shadow-xl backdrop-blur-sm">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-xs text-primary border border-primary/20 group-hover:bg-primary group-hover:text-black transition-all duration-500 italic shadow-lg shadow-primary/5">
                          {owner.name.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-black text-xs uppercase italic tracking-tight truncate brand-font">{owner.name}</p>
                          <p className="text-[9px] font-black text-muted-foreground/60 truncate uppercase tracking-widest">{owner.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => { if (confirm("Remove this owner's access?")) deleteOwnerMutation.mutate(owner._id); }}
                        className="h-9 w-9 rounded-xl bg-muted/30 text-muted-foreground hover:bg-rose-500/10 hover:text-rose-500 flex items-center justify-center transition-all border border-border/40 shrink-0 ml-3 hover:border-rose-500/20 shadow-sm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  emptyMessage="No owners added yet."
                  header={
                    <header className="p-4 bg-muted/20 border border-border/40 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div>
                        <h3 className="text-sm font-black uppercase brand-font italic tracking-tighter">
                          Store <span className="text-primary">Owners.</span>
                        </h3>
                        <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">
                          Manage who can access this store.
                        </p>
                      </div>
                      <Button onClick={() => setShowCreateOwner(true)} className="h-9 px-6 rounded-xl bg-primary text-black font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/10 gap-2 italic hover:scale-105 transition-all">
                        <UserPlus className="h-4 w-4" /> Add Owner
                      </Button>
                    </header>
                  }
                />
                <div className="p-4 bg-muted/20 border border-dashed border-border rounded-xl flex items-center gap-4">
                  <div className="h-9 w-9 rounded-lg bg-background border border-border flex items-center justify-center shrink-0">
                    <Smartphone className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Mobile Login</p>
                    <p className="text-[9px] font-bold text-muted-foreground italic opacity-60">Access via /store-owner/login</p>
                  </div>
                  <Button variant="link" onClick={() => window.open("/store-owner/login")} className="ml-auto text-[9px] font-black uppercase tracking-widest h-auto p-0">Launch <ExternalLink className="h-2.5 w-2.5 inline ml-1" /></Button>
                </div>
              </motion.div>
            )}

            {activeTab === "payouts" && (
              <motion.div key="payouts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 pb-20">
                {/* Earnings summary grid */}
                {earningsLoading ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
                  </div>
                ) : earningsData?.summary && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {[
                      { label: "Total Sales",     value: `₹${earningsData.summary.grossRevenue.toLocaleString()}`, icon: TrendingUp,    color: "text-foreground",   bg: "bg-card border-border/60" },
                      { label: "Commission", value: `₹${earningsData.summary.totalPlatformEarned.toLocaleString()}`, icon: IndianRupee,   color: "text-primary",      bg: "bg-primary/5 border-primary/20" },
                      { label: "Available",    value: `₹${earningsData.summary.availableNet.toLocaleString()}`,        icon: AlertCircle,   color: "text-amber-500",    bg: "bg-amber-500/5 border-amber-500/20" },
                      { label: "Settled",   value: `₹${earningsData.summary.paidOut.toLocaleString()}`,             icon: CheckCircle2,  color: "text-emerald-500",  bg: "bg-emerald-500/5 border-emerald-500/20" },
                    ].map(({ label, value, icon: Icon, color, bg }) => (
                      <div key={label} className={cn("p-3 rounded-xl border shadow-xl flex flex-col justify-between gap-2.5 group hover:border-primary/20 transition-all", bg)}>
                        <div className="flex items-center justify-between">
                          <p className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">{label}</p>
                          <Icon className={cn("h-4 w-4 opacity-60 group-hover:scale-110 group-hover:opacity-100 transition-all", color)} />
                        </div>
                        <p className={cn("text-lg font-black tracking-tight tabular-nums italic", color)}>{value}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-4">
                  <header className="p-4 bg-muted/20 border border-border/40 rounded-2xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.02] scale-[6] pointer-events-none -rotate-12">
                      <Wallet className="h-16 w-16" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black uppercase brand-font italic tracking-tighter">
                        Payment <span className="text-primary">History.</span>
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-black uppercase tracking-widest mt-0.5 opacity-60">
                        Record of all payout transactions.
                      </p>
                    </div>
                  </header>

                  <PortalDataTable
                    columns={payoutColumns}
                    data={earningsData?.payouts || []}
                    isLoading={earningsLoading}
                    rowKey="_id"
                    emptyMessage="No payouts yet."
                  />

                  <AnimatePresence>
                    {payoutActionId && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }} 
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-muted/10 border border-primary/20 rounded-2xl p-4 overflow-hidden relative shadow-2xl"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-primary italic">Process Payout</h4>
                            <button onClick={() => setPayoutActionId(null)} className="h-6 w-6 rounded-lg bg-background border border-border flex items-center justify-center hover:bg-rose-500/10 hover:text-rose-500 transition-all">
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Note</label>
                            <Input
                              value={payoutNote}
                              onChange={(e) => setPayoutNote(e.target.value)}
                              placeholder="Add a note..."
                              className="h-10 rounded-xl bg-background border-border text-[10px] font-black uppercase tracking-widest"
                            />
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              onClick={() => updatePayoutMutation.mutate({ payoutId: payoutActionId, status: "paid", note: payoutNote })}
                              disabled={updatePayoutMutation.isPending}
                              className="flex-1 h-10 rounded-xl bg-emerald-500 text-black font-black uppercase tracking-widest text-[9px] italic shadow-lg shadow-emerald-500/20"
                            >
                              Mark as Paid
                            </Button>
                            <Button
                              onClick={() => updatePayoutMutation.mutate({ payoutId: payoutActionId, status: "rejected", note: payoutNote })}
                              disabled={updatePayoutMutation.isPending}
                              className="flex-1 h-10 rounded-xl bg-rose-500 text-white font-black uppercase tracking-widest text-[9px] italic shadow-lg shadow-rose-500/20"
                            >
                              Reject Payout
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>


      {showAddProduct && <AddProductModal storeId={id!} onClose={() => setShowAddProduct(false)} />}

      {/* Owner Creation Popover */}
      <AnimatePresence>
        {showCreateOwner && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card border border-border rounded-xl w-full max-w-sm shadow-2xl p-5 space-y-4">
              <div>
                <h3 className="text-lg font-black uppercase brand-font italic tracking-tighter">Add Store <span className="text-primary">Owner.</span></h3>
                <p className="text-[9px] font-bold text-muted-foreground italic mt-1 leading-relaxed opacity-60">A login email will be sent automatically.</p>
              </div>
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 opacity-60">
                    Full Name
                  </label>
                  <Input value={ownerName} onChange={(e) => setOwnerName(e.target.value)}
                    className="h-9 rounded-lg bg-muted/30 border-border indent-1 font-bold uppercase text-xs" placeholder="NAME..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-1.5 opacity-60">
                    Email Address
                  </label>
                  <Input type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)}
                    className="h-9 rounded-lg bg-muted/30 border-border indent-1 font-bold text-xs" placeholder="owner@domain.com" />
                </div>
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={() => createOwnerMutation.mutate()}
                  disabled={createOwnerMutation.isPending || !ownerName || !ownerEmail}
                  className="h-9 rounded-lg bg-primary text-primary-foreground font-black uppercase tracking-widest text-[9px] shadow-xl shadow-primary/20 italic"
                >
                  {createOwnerMutation.isPending ? "CREATING..." : "Create Account"}
                </Button>
                <Button variant="ghost" onClick={() => setShowCreateOwner(false)} className="font-black uppercase tracking-widest text-[8px] h-8 opacity-60 hover:opacity-100">Cancel</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminStoreDetailPage;
