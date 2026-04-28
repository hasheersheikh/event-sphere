import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Store,
  MapPin,
  Package,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Edit3,
  X,
  Upload,
  Phone,
  MessageCircle,
  Mail,
  Clock,
  Link2,
  CreditCard,
  Building2,
  Globe,
  Instagram,
  Facebook,
  Image as ImageIcon,
  Activity,
} from "lucide-react";
import api from "@/lib/api";
import {
  USE_LOCAL_STORAGE,
  uploadImageToBackend,
  uploadImagesToBackend,
} from "@/lib/localUpload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { PortalPageHeader } from "@/components/portal/PortalPageHeader";
import { PortalStatCard } from "@/components/portal/PortalStatCard";
import { PortalDataTable } from "@/components/portal/PortalDataTable";

interface BankDetails {
  accountHolder?: string;
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
}

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
  category: string;
  photos: string[];
  products: Product[];
  isActive: boolean;
  paymentMethods?: string[];
  contactPhone?: string;
  contactEmail?: string;
  whatsapp?: string;
  openingHours?: string;
  googleMapUrl?: string;
  upiId?: string;
  bankDetails?: BankDetails;
  website?: string;
  instagram?: string;
  facebook?: string;
}

const storeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  photos: z
    .array(z.string().url("Must be a valid URL").or(z.literal("")))
    .optional(),
  contactEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  whatsapp: z.string().optional(),
  openingHours: z.string().optional(),
  googleMapUrl: z
    .string()
    .url("Must be a valid URL")
    .or(z.literal(""))
    .optional(),
  paymentMethods: z.array(z.string()).optional(),
  upiId: z.string().optional(),
  bankDetails: z
    .object({
      accountHolder: z.string().optional(),
      accountNumber: z.string().optional(),
      bankName: z.string().optional(),
      ifscCode: z.string().optional(),
    })
    .optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
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

const CATEGORIES = [
  "Food & Beverage",
  "Grocery",
  "Bakery",
  "Crafts & Art",
  "Fashion",
  "Electronics",
  "Books",
  "Health & Beauty",
  "General",
];
const PAYMENT_OPTIONS = ["cod", "upi", "card", "bank_transfer", "online"];

const TABS = ["Basic", "Contact", "Payment", "Social"] as const;
type Tab = (typeof TABS)[number];

// ── Add/Edit Store Form ──────────────────────────────────────────────────────
const StoreForm = ({
  onClose,
  editStore,
}: {
  onClose: () => void;
  editStore?: LocalStore;
}) => {
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("Basic");

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: editStore
      ? {
          name: editStore.name,
          address: editStore.address,
          description: editStore.description || "",
          category: editStore.category,
          photos: editStore.photos,
          contactEmail: editStore.contactEmail || "",
          contactPhone: editStore.contactPhone || "",
          whatsapp: editStore.whatsapp || "",
          openingHours: editStore.openingHours || "",
          googleMapUrl: editStore.googleMapUrl || "",
          paymentMethods: editStore.paymentMethods || [],
          upiId: editStore.upiId || "",
          bankDetails: {
            accountHolder: editStore.bankDetails?.accountHolder || "",
            accountNumber: editStore.bankDetails?.accountNumber || "",
            bankName: editStore.bankDetails?.bankName || "",
            ifscCode: editStore.bankDetails?.ifscCode || "",
          },
          instagram: editStore.instagram || "",
          facebook: editStore.facebook || "",
          website: editStore.website || "",
        }
      : {
          name: "",
          address: "",
          description: "",
          category: "",
          photos: [],
          contactEmail: "",
          contactPhone: "",
          whatsapp: "",
          openingHours: "",
          googleMapUrl: "",
          paymentMethods: [],
          upiId: "",
          bankDetails: {
            accountHolder: "",
            accountNumber: "",
            bankName: "",
            ifscCode: "",
          },
          instagram: "",
          facebook: "",
          website: "",
        },
  });

  const {
    fields: photoFields,
    append: appendPhoto,
    remove: removePhoto,
  } = useFieldArray({
    control: form.control,
    name: "photos" as never,
  });

  const watchedPaymentMethods = form.watch("paymentMethods") || [];

  const togglePaymentMethod = (method: string) => {
    const current = form.getValues("paymentMethods") || [];
    if (current.includes(method)) {
      form.setValue(
        "paymentMethods",
        current.filter((m) => m !== method),
      );
    } else {
      form.setValue("paymentMethods", [...current, method]);
    }
  };

  const photosInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = () => {
    if (USE_LOCAL_STORAGE) {
      photosInputRef.current?.click();
      return;
    }
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: true,
        maxFiles: 5,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          appendPhoto(result.info.secure_url as any);
        }
      },
    );
    widget.open();
  };

  const handleLocalPhotosUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const urls = await uploadImagesToBackend(files.slice(0, 5));
      urls.forEach((url) => appendPhoto(url as any));
      toast.success("Photos uploaded.");
    } catch {
      toast.error("Upload failed.");
    }
    e.target.value = "";
  };

  const mutation = useMutation({
    mutationFn: async (values: StoreFormValues) => {
      const payload = {
        ...values,
        photos: values.photos?.filter(Boolean),
        paymentMethods: values.paymentMethods?.filter(Boolean),
      };
      if (editStore) {
        const { data } = await api.put(
          `/local-stores/${editStore._id}`,
          payload,
        );
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

  const labelClass =
    "text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-70";
  const inputClass = "h-9 rounded-lg bg-muted/30 border-border text-xs";

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-xl max-h-[92vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-border sticky top-0 bg-background z-10">
          <h2 className="font-black text-sm uppercase tracking-tight italic">
            {editStore ? "Refine Store" : "Initialize Entity"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-3 sticky top-[53px] bg-background z-10">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-2.5 py-2 text-[8px] font-black uppercase tracking-widest border-b-2 transition-colors italic",
                activeTab === tab
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-5">
            {/* ── BASIC TAB ── */}
            {activeTab === "Basic" && (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Store Name</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClass}
                          placeholder="e.g. The Spice House"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Category</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          className="w-full h-9 rounded-lg bg-muted/30 border border-border px-2 text-[11px] font-bold focus:outline-none focus:border-primary"
                        >
                          <option value="">Select category...</option>
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Address</FormLabel>
                      <FormControl>
                        <Input
                          className={inputClass}
                          placeholder="Full address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Description (optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          className="rounded-xl bg-muted/30 border-border resize-none min-h-[80px]"
                          placeholder="Describe the store..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photos */}
                <div className="space-y-3">
                  <p className={labelClass}>Store Photos</p>
                  {photoFields.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {photoFields.map((f, i) => (
                        <div
                          key={f.id}
                          className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group"
                        >
                          <img
                            src={form.watch(`photos.${i}` as any)}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(i)}
                            className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    ref={photosInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleLocalPhotosUpload}
                  />
                  <button
                    type="button"
                    onClick={handlePhotoUpload}
                    className="w-full h-9 rounded-lg border border-dashed border-border bg-muted/20 hover:bg-muted/40 text-[8px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-1.5 transition-colors italic"
                  >
                    <Upload className="h-3.5 w-3.5" /> Deploy Assets
                  </button>
                </div>
              </>
            )}

            {/* ── CONTACT TAB ── */}
            {activeTab === "Contact" && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactPhone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>Phone</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              className={cn(inputClass, "pl-10")}
                              placeholder="+91 98765 43210"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className={labelClass}>WhatsApp</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                              className={cn(inputClass, "pl-10")}
                              placeholder="+91 98765 43210"
                              {...field}
                            />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Contact Email
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className={cn(inputClass, "pl-10")}
                            placeholder="store@example.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="openingHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Opening Hours
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className={cn(inputClass, "pl-10")}
                            placeholder="Mon–Sat: 9 AM – 9 PM"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="googleMapUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Google Maps URL
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className={cn(inputClass, "pl-10")}
                            placeholder="https://maps.google.com/..."
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* ── PAYMENT TAB ── */}
            {activeTab === "Payment" && (
              <>
                <div className="space-y-3">
                  <p className={labelClass}>Accepted Payment Methods</p>
                  <div className="flex flex-wrap gap-2">
                    {PAYMENT_OPTIONS.map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => togglePaymentMethod(method)}
                        className={cn(
                          "px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest border transition-colors italic",
                          watchedPaymentMethods.includes(method)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-muted/30 border-border text-muted-foreground hover:border-primary/50",
                        )}
                      >
                        {method === "cod"
                          ? "Cash on Delivery"
                          : method === "upi"
                            ? "UPI"
                            : method === "card"
                              ? "Card"
                              : method === "bank_transfer"
                                ? "Bank Transfer"
                                : "Online"}
                      </button>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="upiId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>UPI ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className={cn(inputClass, "pl-10")}
                            placeholder="storename@upi"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="rounded-xl border border-border/60 bg-muted/10 p-4 space-y-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className={labelClass}>Bank Account Details</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FormField
                      control={form.control}
                      name="bankDetails.accountHolder"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>
                            Account Holder
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={inputClass}
                              placeholder="Full name"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankDetails.bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>
                            Bank Name
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={inputClass}
                              placeholder="e.g. HDFC Bank"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankDetails.accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>
                            Account Number
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={inputClass}
                              placeholder="XXXXXXXXXXXX"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="bankDetails.ifscCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>
                            IFSC Code
                          </FormLabel>
                          <FormControl>
                            <Input
                              className={inputClass}
                              placeholder="HDFC0001234"
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </>
            )}

            {/* ── SOCIAL TAB ── */}
            {activeTab === "Social" && (
              <>
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className={cn(inputClass, "pl-10")}
                            placeholder="https://yourstore.com"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Instagram Username
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className={cn(inputClass, "pl-10")}
                            placeholder="@yourstore"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="facebook"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className={labelClass}>
                        Facebook Page
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            className={cn(inputClass, "pl-10")}
                            placeholder="facebook.com/yourstore"
                            {...field}
                          />
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </>
            )}

            <Button
              type="button"
              onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
              disabled={mutation.isPending}
              className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[9px] bg-primary italic shadow-lg shadow-primary/20"
            >
              {mutation.isPending
                ? "SYNCHRONIZING..."
                : editStore
                  ? "Update Store"
                  : "Create Store"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

// ── Add Product Form ─────────────────────────────────────────────────────────
const AddProductForm = ({
  storeId,
  onClose,
}: {
  storeId: string;
  onClose: () => void;
}) => {
  const qc = useQueryClient();
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      price: 0,
      discountPercent: 0,
      image: "",
      description: "",
      isAvailable: true,
    },
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

  const handleLocalProductImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
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
      const { data } = await api.post(
        `/local-stores/${storeId}/products`,
        values,
      );
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
          <h2 className="font-black text-base uppercase tracking-tight">
            Add Product
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="p-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Product Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 rounded-xl bg-muted/30 border-border"
                      placeholder="e.g. Masala Chai"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Description
                  </FormLabel>
                  <FormControl>
                    <Input
                      className="h-12 rounded-xl bg-muted/30 border-border"
                      placeholder="Short description"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Price (₹)
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-12 rounded-xl bg-muted/30 border-border"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="discountPercent"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                      Discount %
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        className="h-12 rounded-xl bg-muted/30 border-border"
                        {...field}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                Product Image (optional)
              </p>
              {form.watch("image") && (
                <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-border">
                  <img
                    src={form.watch("image")}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => form.setValue("image", "")}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-destructive/80 text-white flex items-center justify-center"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              <input
                ref={productImageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLocalProductImageUpload}
              />
              <button
                type="button"
                onClick={handleProductImageUpload}
                className="w-full h-12 rounded-xl border border-dashed border-border bg-muted/20 hover:bg-muted/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="h-4 w-4" />{" "}
                {form.watch("image") ? "Change Image" : "Upload Image"}
              </button>
            </div>
            <Button
              type="button"
              onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
              disabled={mutation.isPending}
              className="w-full h-10 rounded-xl font-black uppercase tracking-widest text-[9px] bg-primary italic shadow-lg shadow-primary/20"
            >
              {mutation.isPending ? "ENROLLING..." : "Finalize Listing"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};

// ── Store Details Modal ──────────────────────────────────────────────────────
const StoreDetailsModal = ({
  store,
  onClose,
}: {
  store: LocalStore;
  onClose: () => void;
}) => {
  const [tab, setTab] = useState<"info" | "products">("info");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-background z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden bg-muted flex-shrink-0">
              {store.photos[0] ? (
                <img
                  src={store.photos[0]}
                  alt={store.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Store className="h-5 w-5 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <div>
              <h2 className="font-black text-base">{store.name}</h2>
              <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                {store.category}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl bg-muted flex items-center justify-center"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex border-b border-border px-6">
          {(["info", "products"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={cn(
                "px-4 py-3 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors capitalize",
                tab === t
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t === "info"
                ? "Store Info"
                : `Products (${store.products.length})`}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {tab === "info" && (
            <>
              {store.description && (
                <p className="text-sm text-muted-foreground">
                  {store.description}
                </p>
              )}

              <section className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  Contact
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {store.address && (
                    <div className="flex items-start gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <span>{store.address}</span>
                    </div>
                  )}
                  {store.contactPhone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`tel:${store.contactPhone}`}
                        className="hover:text-primary transition-colors"
                      >
                        {store.contactPhone}
                      </a>
                    </div>
                  )}
                  {store.whatsapp && (
                    <div className="flex items-center gap-2 text-sm">
                      <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                      <a
                        href={`https://wa.me/${store.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {store.whatsapp}
                      </a>
                    </div>
                  )}
                  {store.contactEmail && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={`mailto:${store.contactEmail}`}
                        className="hover:text-primary transition-colors"
                      >
                        {store.contactEmail}
                      </a>
                    </div>
                  )}
                  {store.openingHours && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span>{store.openingHours}</span>
                    </div>
                  )}
                  {store.googleMapUrl && (
                    <div className="flex items-center gap-2 text-sm">
                      <Link2 className="h-4 w-4 text-muted-foreground shrink-0" />
                      <a
                        href={store.googleMapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors truncate"
                      >
                        View on Google Maps
                      </a>
                    </div>
                  )}
                </div>
              </section>

              {(store.paymentMethods?.length ||
                store.upiId ||
                store.bankDetails?.accountNumber) && (
                <section className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Payment
                  </p>
                  {store.paymentMethods && store.paymentMethods.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {store.paymentMethods.map((m) => (
                        <span
                          key={m}
                          className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-primary/10 text-primary"
                        >
                          {m === "cod"
                            ? "Cash on Delivery"
                            : m === "upi"
                              ? "UPI"
                              : m === "card"
                                ? "Card"
                                : m === "bank_transfer"
                                  ? "Bank Transfer"
                                  : "Online"}
                        </span>
                      ))}
                    </div>
                  )}
                  {store.upiId && (
                    <div className="flex items-center gap-2 text-sm">
                      <CreditCard className="h-4 w-4 text-muted-foreground shrink-0" />
                      <span className="font-mono text-xs bg-muted/50 px-3 py-1 rounded-lg">
                        {store.upiId}
                      </span>
                    </div>
                  )}
                  {store.bankDetails?.accountNumber && (
                    <div className="bg-muted/20 border border-border rounded-xl p-4 space-y-2">
                      <div className="flex items-center gap-2 mb-1">
                        <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                          Bank Details
                        </p>
                      </div>
                      {(
                        [
                          ["Account Holder", store.bankDetails.accountHolder],
                          ["Bank Name", store.bankDetails.bankName],
                          ["Account Number", store.bankDetails.accountNumber],
                          ["IFSC Code", store.bankDetails.ifscCode],
                        ] as [string, string | undefined][]
                      ).map(([label, value]) =>
                        value ? (
                          <div
                            key={label}
                            className="flex justify-between text-xs"
                          >
                            <span className="text-muted-foreground">
                              {label}
                            </span>
                            <span className="font-bold font-mono">{value}</span>
                          </div>
                        ) : null,
                      )}
                    </div>
                  )}
                </section>
              )}

              {(store.website || store.instagram || store.facebook) && (
                <section className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Social & Web
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {store.website && (
                      <a
                        href={store.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold hover:text-primary transition-colors"
                      >
                        <Globe className="h-4 w-4" /> Website
                      </a>
                    )}
                    {store.instagram && (
                      <a
                        href={`https://instagram.com/${store.instagram.replace("@", "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold hover:text-pink-500 transition-colors"
                      >
                        <Instagram className="h-4 w-4" /> {store.instagram}
                      </a>
                    )}
                    {store.facebook && (
                      <a
                        href={
                          store.facebook.startsWith("http")
                            ? store.facebook
                            : `https://facebook.com/${store.facebook}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs font-bold hover:text-blue-500 transition-colors"
                      >
                        <Facebook className="h-4 w-4" /> Facebook
                      </a>
                    )}
                  </div>
                </section>
              )}

              {store.photos.length > 0 && (
                <section className="space-y-3">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                    Photos
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {store.photos.map((photo, i) => (
                      <div
                        key={i}
                        className="aspect-square rounded-xl overflow-hidden bg-muted"
                      >
                        <img
                          src={photo}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </>
          )}

          {tab === "products" &&
            (store.products.length === 0 ? (
              <div className="py-12 text-center">
                <Package className="h-8 w-8 text-muted-foreground/20 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">
                  No products yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {store.products.map((product) => (
                  <div
                    key={product._id}
                    className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/40"
                  >
                    <div className="h-12 w-12 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                      {product.image ? (
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-muted-foreground/30" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">
                        {product.name}
                      </p>
                      {product.description && (
                        <p className="text-xs text-muted-foreground truncate">
                          {product.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-black text-primary">
                        ₹{product.price}
                      </p>
                      {product.discountPercent ? (
                        <p className="text-[10px] text-rose-500 font-bold">
                          {product.discountPercent}% off
                        </p>
                      ) : null}
                      <p
                        className={cn(
                          "text-[9px] font-black",
                          product.isAvailable
                            ? "text-emerald-500"
                            : "text-muted-foreground",
                        )}
                      >
                        {product.isAvailable ? "Available" : "Unavailable"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

// ── Store Row ────────────────────────────────────────────────────────────────
const StoreRow = ({
  store,
  onEdit,
  onAddProduct,
}: {
  store: LocalStore;
  onEdit: (store: LocalStore) => void;
  onAddProduct: (storeId: string) => void;
}) => {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: () => api.delete(`/local-stores/${store._id}`),
    onSuccess: () => {
      toast.success("Store deleted.");
      qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: () => api.patch(`/local-stores/${store._id}/toggle`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["adminLocalStores"] }),
  });

  const stop = (e: React.MouseEvent) => e.stopPropagation();

  return (
    <div
      onClick={() => navigate(`/portal/admin/local-stores/${store._id}`)}
      className="border border-border/60 rounded-xl overflow-hidden bg-card hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex items-center gap-3 p-2.5">
        <div className="h-9 w-9 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          {store.photos[0] ? (
            <img
              src={store.photos[0]}
              alt={store.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Store className="h-4 w-4 text-muted-foreground/40" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-black text-xs truncate group-hover:text-primary transition-colors italic uppercase">
              {store.name}
            </p>
            <span className="text-[8px] font-black uppercase tracking-widest bg-primary/10 text-primary px-2 py-0.5 rounded-full flex-shrink-0">
              {store.category}
            </span>
            <span
              className={cn(
                "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0 italic",
                store.isActive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {store.isActive ? "Live" : "Idle"}
            </span>
          </div>
          <div className="flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-muted-foreground flex-shrink-0" />
            <p className="text-[11px] text-muted-foreground truncate">
              {store.address}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Package className="h-3 w-3" /> {store.products.length} products
            </span>
            {store.paymentMethods && store.paymentMethods.length > 0 && (
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {store.paymentMethods.join(" · ")}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0" onClick={stop}>
          <button
            type="button"
            onClick={() => toggleMutation.mutate()}
            className={cn(
              "h-7 w-7 rounded-lg flex items-center justify-center transition-colors",
              store.isActive
                ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/20"
                : "text-muted-foreground bg-muted hover:bg-muted/80",
            )}
            title={store.isActive ? "Deactivate" : "Activate"}
          >
            {store.isActive ? (
              <ToggleRight className="h-4 w-4" />
            ) : (
              <ToggleLeft className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            onClick={() => onAddProduct(store._id)}
            className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            title="Add product"
          >
            <Plus className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(store)}
            className="h-7 w-7 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center transition-colors"
            title="Edit store"
          >
            <Edit3 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm("Delete this store?")) deleteMutation.mutate();
            }}
            className="h-7 w-7 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
        </div>
      </div>
    </div>
  );
};

// ── Main Page ────────────────────────────────────────────────────────────────
const LocalStoresPage = () => {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [addProductStoreId, setAddProductStoreId] = useState<string | null>(
    null,
  );

  const { data: response, isLoading } = useQuery({
    queryKey: ["adminLocalStores", page],
    queryFn: async () => {
      const { data } = await api.get(`/local-stores/admin/all?page=${page}&limit=20`);
      return data;
    },
  });

  const stores = response?.data || [];
  const pagination = response?.pagination;

  const columns = [
    {
      header: "Entity Identity",
      accessor: (store: LocalStore) => (
        <div 
          className="flex items-center gap-3 cursor-pointer group/item"
          onClick={() => navigate(`/portal/admin/local-stores/${store._id}`)}
        >
          <div className="h-8 w-8 rounded-lg overflow-hidden bg-muted border border-border flex-shrink-0">
            {store.photos[0] ? (
              <img
                src={store.photos[0]}
                alt={store.name}
                className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Store className="h-3 w-3 text-muted-foreground/30" />
              </div>
            )}
          </div>
          <div>
            <p className="font-black text-[11px] uppercase tracking-tight group-hover/item:text-primary transition-colors italic leading-none mb-1 text-foreground">
              {store.name}
            </p>
            <p className="text-[8px] text-muted-foreground font-black italic opacity-60 flex items-center gap-1">
              <MapPin className="h-2 w-2" /> {store.address}
            </p>
          </div>
        </div>
      ),
    },
    {
      header: "Classification",
      accessor: (store: LocalStore) => (
        <Badge className="bg-primary/10 text-primary border border-primary/20 rounded-md text-[7px] font-black uppercase tracking-widest px-1.5 py-0.5 italic">
          {store.category}
        </Badge>
      ),
    },
    {
      header: "Transmission",
      accessor: (store: LocalStore) => (
        <div className="flex items-center gap-1.5">
          <div
            className={cn(
              "h-1.5 w-1.5 rounded-full",
              store.isActive
                ? "bg-emerald-500 shadow-[0_0_8px_#10B981]"
                : "bg-muted shadow-none",
            )}
          />
          <span className="text-[8px] font-black uppercase tracking-widest italic opacity-80 text-foreground">
            {store.isActive ? "Active" : "Idle"}
          </span>
        </div>
      ),
    },
    {
      header: "Inventory",
      accessor: (store: LocalStore) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-black text-foreground italic flex items-center gap-1 leading-none">
            <Package className="h-2.5 w-2.5 opacity-60" /> {store.products.length} Units
          </span>
          {store.paymentMethods && (
            <span className="text-[7px] font-bold text-muted-foreground uppercase tracking-tighter opacity-70">
              {store.paymentMethods.slice(0, 2).join(" · ")}
            </span>
          )}
        </div>
      ),
    },
    {
      header: "Tactical Operations",
      headerClassName: "text-right",
      accessor: (store: LocalStore) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "h-7 w-7 rounded-lg border border-border",
              store.isActive ? "text-emerald-500 hover:bg-emerald-500/10" : "text-muted-foreground hover:bg-muted"
            )}
            onClick={(e) => {
              e.stopPropagation();
              api.patch(`/local-stores/${store._id}/toggle`).then(() => {
                qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
              });
            }}
          >
            {store.isActive ? <ToggleRight className="h-3.5 w-3.5" /> : <ToggleLeft className="h-3.5 w-3.5" />}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg border border-border hover:bg-primary/10 hover:text-primary"
            onClick={(e) => {
              e.stopPropagation();
              setAddProductStoreId(store._id);
            }}
          >
            <Plus className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg border border-border hover:bg-muted"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/portal/admin/local-stores/${store._id}/edit`);
            }}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 rounded-lg border border-border hover:bg-rose-500 hover:text-white"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm("Initiate purge protocol for this entity?")) {
                api.delete(`/local-stores/${store._id}`).then(() => {
                  qc.invalidateQueries({ queryKey: ["adminLocalStores"] });
                  toast.success("Node purged.");
                });
              }
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const statCards = [
    {
      label: "Node Registry",
      value: pagination?.total ?? 0,
      icon: Store,
      iconClass: "icon-events",
      subtext: "Total provisioners",
    },
    {
      label: "Operational",
      value: stores?.filter((s) => s.isActive).length ?? 0, // This is current page stats, maybe fine or need global. For now sticking to this or total active if available.
      icon: Activity,
      iconClass: "icon-tickets",
      subtext: "Live transmissions",
    },
    {
      label: "Inventory Load",
      value: stores?.reduce((a, s) => a + s.products.length, 0) ?? 0,
      icon: Package,
      iconClass: "icon-revenue",
      subtext: "Total product units",
    },
  ];

  const [searchQuery, setSearchQuery] = useState("");
  const filteredStores = stores?.filter((s) => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="p-3 md:p-4 space-y-4 bg-background min-h-screen">
      {/* Modals */}
      {addProductStoreId && (
        <AddProductForm
          storeId={addProductStoreId}
          onClose={() => setAddProductStoreId(null)}
        />
      )}

      <PortalPageHeader 
        title="Provisioner Grid"
        icon={Store}
        subtitle="Logistical management of all registered local provisioners."
        actions={
          <Button
            onClick={() => navigate("/portal/admin/local-stores/new")}
            className="h-10 px-6 rounded-xl bg-[#C4F000] text-black font-black uppercase tracking-widest text-[9px] shadow-lg hover:bg-[#A3C800] hover:scale-105 transition-all border-none italic"
          >
            Initialize Node
          </Button>
        }
      />

      {/* Standardized Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <PortalStatCard
            key={stat.label}
            label={stat.label}
            value={isLoading ? "—" : stat.value}
            icon={stat.icon}
            subtext={stat.subtext}
            iconClass={stat.iconClass}
            index={index}
          />
        ))}
      </div>

      <PortalDataTable
        columns={columns}
        data={filteredStores}
        isLoading={isLoading}
        pagination={pagination}
        onPageChange={setPage}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="SEARCH BY NODE IDENTITY..."
        rowKey="_id"
      />
    </div>
  );
};

export default LocalStoresPage;
