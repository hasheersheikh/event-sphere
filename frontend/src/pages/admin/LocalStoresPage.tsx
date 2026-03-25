import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus, Trash2, Store, MapPin, Package, Tag, X, ChevronDown, ChevronUp,
  ToggleLeft, ToggleRight, Edit3, Image as ImageIcon
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";

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
  isActive: boolean;
  createdAt: string;
}

const storeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  photos: z.array(z.string().url("Must be a valid URL").or(z.literal(""))).optional(),
});

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  price: z.coerce.number().min(0, "Price must be positive"),
  discountPercent: z.coerce.number().min(0).max(100).optional(),
  image: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  isAvailable: z.boolean().default(true),
});

type StoreFormValues = z.infer<typeof storeSchema>;
type ProductFormValues = z.infer<typeof productSchema>;

const CATEGORIES = ["Food & Beverage", "Grocery", "Bakery", "Crafts & Art", "Fashion", "Electronics", "Books", "Health & Beauty", "General"];

// ── Add/Edit Store Form ──────────────────────────────────────────────────────
const StoreForm = ({ onClose, editStore }: { onClose: () => void; editStore?: LocalStore }) => {
  const qc = useQueryClient();

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: editStore
      ? {
          name: editStore.name,
          address: editStore.address,
          description: editStore.description || "",
          category: editStore.category,
          photos: editStore.photos,
        }
      : { name: "", address: "", description: "", category: "", photos: [] },
  });

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control: form.control,
    name: "photos" as any,
  });

  const mutation = useMutation({
    mutationFn: async (values: StoreFormValues) => {
      const payload = { ...values, photos: values.photos?.filter(Boolean) };
      if (editStore) {
        const { data } = await api.put(`/local-stores/${editStore._id}`, payload);
        return data;
      }
      const { data } = await api.post("/local-stores", payload);
      return data;
    },
    onSuccess: () => {
      toast.success(editStore ? "Store updated." : "Store created.");
      qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
      qc.invalidateQueries({ queryKey: ["localStores"] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-black text-lg uppercase tracking-tight">
            {editStore ? "Edit Store" : "Add New Store"}
          </h2>
          <button type="button" onClick={onClose} className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center">
            <X className="h-4 w-4" />
          </button>
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-5">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Store Name</FormLabel>
                <FormControl><Input className="h-12 rounded-xl bg-muted/30 border-border" placeholder="e.g. The Spice House" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Category</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full h-12 rounded-xl bg-muted/30 border border-border px-4 text-sm font-bold focus:outline-none focus:border-primary"
                  >
                    <option value="">Select category...</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="address" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Address</FormLabel>
                <FormControl><Input className="h-12 rounded-xl bg-muted/30 border-border" placeholder="Full address" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description (optional)</FormLabel>
                <FormControl><Textarea className="rounded-xl bg-muted/30 border-border resize-none min-h-[80px]" placeholder="Describe the store..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Photos */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Photos (URLs)</p>
                <button type="button" onClick={() => appendPhoto("" as any)} className="text-[10px] font-black text-primary flex items-center gap-1">
                  <Plus className="h-3 w-3" /> Add URL
                </button>
              </div>
              {photoFields.map((f, i) => (
                <div key={f.id} className="flex gap-2">
                  <Input
                    className="h-10 rounded-xl bg-muted/30 border-border text-xs"
                    placeholder="https://..."
                    {...form.register(`photos.${i}` as any)}
                  />
                  <button type="button" onClick={() => removePhoto(i)} className="h-10 w-10 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center flex-shrink-0">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button
              type="button"
              onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
              disabled={mutation.isPending}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary"
            >
              {mutation.isPending ? "Saving..." : editStore ? "Update Store" : "Create Store"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

// ── Add Product Form ─────────────────────────────────────────────────────────
const AddProductForm = ({ storeId, onClose }: { storeId: string; onClose: () => void }) => {
  const qc = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { name: "", price: 0, discountPercent: 0, image: "", description: "", isAvailable: true },
  });

  const mutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const { data } = await api.post(`/local-stores/${storeId}/products`, values);
      return data;
    },
    onSuccess: () => {
      toast.success("Product added.");
      qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
      qc.invalidateQueries({ queryKey: ["localStores"] });
      onClose();
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed"),
  });

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
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Product Name</FormLabel>
                <FormControl><Input className="h-12 rounded-xl bg-muted/30 border-border" placeholder="e.g. Masala Chai" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Description</FormLabel>
                <FormControl><Input className="h-12 rounded-xl bg-muted/30 border-border" placeholder="Short description" {...field} /></FormControl>
              </FormItem>
            )} />
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="price" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Price (₹)</FormLabel>
                  <FormControl><Input type="number" className="h-12 rounded-xl bg-muted/30 border-border" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="discountPercent" render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Discount %</FormLabel>
                  <FormControl><Input type="number" className="h-12 rounded-xl bg-muted/30 border-border" {...field} /></FormControl>
                </FormItem>
              )} />
            </div>
            <FormField control={form.control} name="image" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Image URL (optional)</FormLabel>
                <FormControl><Input className="h-12 rounded-xl bg-muted/30 border-border" placeholder="https://..." {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <Button
              type="button"
              onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
              disabled={mutation.isPending}
              className="w-full h-12 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary"
            >
              {mutation.isPending ? "Adding..." : "Add Product"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

// ── Store Card ───────────────────────────────────────────────────────────────
const StoreRow = ({ store }: { store: LocalStore }) => {
  const qc = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/local-stores/${store._id}`),
    onSuccess: () => {
      toast.success("Store deleted.");
      qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
      qc.invalidateQueries({ queryKey: ["localStores"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => api.patch(`/local-stores/${store._id}/toggle`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
      qc.invalidateQueries({ queryKey: ["localStores"] });
    },
  });

  const removeProductMutation = useMutation({
    mutationFn: (productId: string) => api.delete(`/local-stores/${store._id}/products/${productId}`),
    onSuccess: () => {
      toast.success("Product removed.");
      qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
    },
  });

  return (
    <>
      <div className="border border-border/60 rounded-2xl overflow-hidden bg-card hover:border-primary/20 transition-colors">
        <div className="flex items-center gap-4 p-5">
          {/* Cover photo */}
          <div className="h-14 w-14 rounded-xl overflow-hidden bg-muted flex-shrink-0">
            {store.photos[0] ? (
              <img src={store.photos[0]} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="h-6 w-6 text-muted-foreground/40" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-black truncate">{store.name}</p>
              <span className="text-[9px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
                {store.category}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
              <p className="text-[11px] text-muted-foreground truncate">{store.address}</p>
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5">{store.products.length} products</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => toggleMutation.mutate()}
              className={cn("h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                store.isActive ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-muted-foreground bg-muted hover:bg-muted/80"
              )}
              title={store.isActive ? "Deactivate" : "Activate"}
            >
              {store.isActive ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={() => setShowEdit(true)}
              className="h-8 w-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              <Edit3 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => { if (confirm("Delete this store?")) deleteMutation.mutate(); }}
              className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setExpanded(!expanded)}
              className="h-8 w-8 rounded-xl bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            >
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Products panel */}
        {expanded && (
          <div className="border-t border-border/40 p-5 bg-muted/10 space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Package className="h-3 w-3" /> Products ({store.products.length})
              </p>
              <button
                type="button"
                onClick={() => setShowAddProduct(true)}
                className="flex items-center gap-1 text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary/80 transition-colors"
              >
                <Plus className="h-3 w-3" /> Add Product
              </button>
            </div>

            {store.products.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No products yet. Add your first product.</p>
            ) : (
              <div className="space-y-2">
                {store.products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-background border border-border/40"
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.image ? (
                        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black truncate">{product.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-primary font-black">₹{product.price}</span>
                        {product.discountPercent ? (
                          <span className="text-[9px] bg-rose-500/10 text-rose-500 font-black px-1.5 py-0.5 rounded-full">
                            {product.discountPercent}% off
                          </span>
                        ) : null}
                        <span className={cn("text-[9px] font-black", product.isAvailable ? "text-emerald-500" : "text-muted-foreground")}>
                          {product.isAvailable ? "Available" : "Unavailable"}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => { if (confirm("Remove this product?")) removeProductMutation.mutate(product._id); }}
                      className="h-8 w-8 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors flex-shrink-0"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {showAddProduct && <AddProductForm storeId={store._id} onClose={() => setShowAddProduct(false)} />}
      {showEdit && <StoreForm editStore={store} onClose={() => setShowEdit(false)} />}
    </>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const LocalStoresPage = () => {
  const [showCreate, setShowCreate] = useState(false);

  const { data: stores, isLoading } = useQuery({
    queryKey: ["adminLocalStores"],
    queryFn: async () => {
      const { data } = await api.get("/local-stores/admin/all");
      return data as LocalStore[];
    },
  });

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-1 w-6 bg-amber-400 rounded-full" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground">Admin Panel</span>
          </div>
          <h1 className="text-3xl font-black tracking-tighter">
            Local <span className="text-amber-400">Stores</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage local stores displayed on the homepage.</p>
        </div>
        <Button
          type="button"
          onClick={() => setShowCreate(true)}
          className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
        >
          <Plus className="h-4 w-4" /> Add Store
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Stores", value: stores?.length ?? "—", color: "text-primary" },
          { label: "Active", value: stores?.filter(s => s.isActive).length ?? "—", color: "text-emerald-500" },
          { label: "Total Products", value: stores?.reduce((a, s) => a + s.products.length, 0) ?? "—", color: "text-amber-500" },
        ].map((stat) => (
          <div key={stat.label} className="p-5 rounded-2xl bg-card border border-border/60">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Stores list */}
      {isLoading ? (
        <div className="space-y-4">
          {Array(3).fill(0).map((_, i) => (
            <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : !stores?.length ? (
        <div className="py-20 text-center border border-dashed border-border rounded-3xl">
          <Store className="h-12 w-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No stores yet</p>
          <p className="text-xs text-muted-foreground/60 mt-2">Click "Add Store" to create your first local store.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {stores.map((store) => (
            <StoreRow key={store._id} store={store} />
          ))}
        </div>
      )}

      {showCreate && <StoreForm onClose={() => setShowCreate(false)} />}
    </div>
  );
};

export default LocalStoresPage;
