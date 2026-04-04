import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";
import {
  Store, Phone, CreditCard, Image as ImageIcon,
  ChevronLeft, ChevronRight, X, Upload, Check,
  MapPin, Mail, MessageCircle, Clock, Link2,
  Building2, Instagram, Facebook, Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate as useNav } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import api from "@/lib/api";

const CATEGORIES = ["Food & Beverage", "Grocery", "Bakery", "Crafts & Art", "Fashion", "Electronics", "Books", "Health & Beauty", "General"];
const PAYMENT_OPTIONS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "upi", label: "UPI" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "online", label: "Online (Razorpay)" },
];

const storeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  description: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  photos: z.array(z.string()).optional(),
  contactEmail: z.string().email("Invalid email").or(z.literal("")).optional(),
  contactPhone: z.string().optional(),
  whatsapp: z.string().optional(),
  openingHours: z.string().optional(),
  googleMapUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  paymentMethods: z.array(z.string()).optional(),
  upiId: z.string().optional(),
  bankDetails: z.object({
    accountHolder: z.string().optional(),
    accountNumber: z.string().optional(),
    bankName: z.string().optional(),
    ifscCode: z.string().optional(),
  }).optional(),
  instagram: z.string().optional(),
  facebook: z.string().optional(),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type StoreFormValues = z.infer<typeof storeSchema>;

const STEPS = [
  { title: "Basic Info", icon: Store },
  { title: "Contact", icon: Phone },
  { title: "Payment", icon: CreditCard },
  { title: "Media & Social", icon: ImageIcon },
];

const EMPTY_DEFAULTS: StoreFormValues = {
  name: "", address: "", description: "", category: "", photos: [],
  contactEmail: "", contactPhone: "", whatsapp: "", openingHours: "", googleMapUrl: "",
  paymentMethods: [], upiId: "",
  bankDetails: { accountHolder: "", accountNumber: "", bankName: "", ifscCode: "" },
  instagram: "", facebook: "", website: "",
};

const CreateStorePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEdit = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);

  const form = useForm<StoreFormValues>({
    resolver: zodResolver(storeSchema),
    defaultValues: EMPTY_DEFAULTS,
  });

  // Load existing store data if editing
  useQuery({
    queryKey: ["adminStore", id],
    queryFn: async () => {
      const { data } = await api.get(`/local-stores/${id}`);
      return data;
    },
    enabled: isEdit,
    onSuccess: (data: any) => {
      form.reset({
        name: data.name || "",
        address: data.address || "",
        description: data.description || "",
        category: data.category || "",
        photos: data.photos || [],
        contactEmail: data.contactEmail || "",
        contactPhone: data.contactPhone || "",
        whatsapp: data.whatsapp || "",
        openingHours: data.openingHours || "",
        googleMapUrl: data.googleMapUrl || "",
        paymentMethods: data.paymentMethods || [],
        upiId: data.upiId || "",
        bankDetails: {
          accountHolder: data.bankDetails?.accountHolder || "",
          accountNumber: data.bankDetails?.accountNumber || "",
          bankName: data.bankDetails?.bankName || "",
          ifscCode: data.bankDetails?.ifscCode || "",
        },
        instagram: data.instagram || "",
        facebook: data.facebook || "",
        website: data.website || "",
      });
    },
  } as any);

  const { fields: photoFields, append: appendPhoto, remove: removePhoto } = useFieldArray({
    control: form.control,
    name: "photos" as any,
  });

  const watchedPaymentMethods = form.watch("paymentMethods") || [];

  const togglePaymentMethod = (method: string) => {
    const current = form.getValues("paymentMethods") || [];
    form.setValue(
      "paymentMethods",
      current.includes(method) ? current.filter((m) => m !== method) : [...current, method],
    );
  };

  const handlePhotoUpload = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
        uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET,
        sources: ["local", "url", "camera"],
        multiple: true,
        maxFiles: 6,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          appendPhoto(result.info.secure_url as any);
        }
      },
    );
    widget.open();
  };

  const mutation = useMutation({
    mutationFn: async (values: StoreFormValues) => {
      const payload = {
        ...values,
        photos: values.photos?.filter(Boolean),
        paymentMethods: values.paymentMethods?.filter(Boolean),
      };
      if (isEdit) {
        const { data } = await api.put(`/local-stores/${id}`, payload);
        return data;
      }
      const { data } = await api.post("/local-stores", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success(isEdit ? "Store updated successfully!" : "Store created successfully!");
      navigate(`/portal/admin/local-stores/${data._id}`);
    },
    onError: (e: any) => toast.error(e.response?.data?.message || "Failed to save store"),
  });

  const STEP_FIELDS: Record<number, (keyof StoreFormValues)[]> = {
    1: ["name", "category", "address"],
    2: [],
    3: [],
    4: [],
  };

  const nextStep = async () => {
    const toValidate = STEP_FIELDS[currentStep];
    if (toValidate.length > 0) {
      const isValid = await form.trigger(toValidate);
      if (!isValid) {
        toast.error("Please fix the errors before continuing.");
        return;
      }
    }
    setCurrentStep((p) => Math.min(p + 1, STEPS.length));
  };

  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));

  const labelClass = "text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1";
  const inputClass = "h-12 rounded-xl bg-muted/30 border-border";

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />

      <main className="flex-1 container max-w-3xl py-10 px-4 md:px-6 relative z-10">
        {/* Header */}
        <header className="mb-10">
          <button
            type="button"
            onClick={() => navigate("/portal/admin/local-stores")}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back to Stores
          </button>
          <div className="flex items-center gap-3 mb-3 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
            <Store className="h-4 w-4" />
            {isEdit ? "Edit Store" : "New Store"}
          </div>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter leading-none text-foreground">
            {isEdit ? "Edit" : "Create"} <span className="text-gradient">Store.</span>
          </h1>

          {/* Step indicator */}
          <div className="mt-10 flex items-center justify-center">
            {STEPS.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = currentStep === i + 1;
              const isCompleted = currentStep > i + 1;
              return (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                      isActive
                        ? "bg-primary border-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110"
                        : isCompleted
                        ? "bg-primary/20 border-primary/40 text-primary"
                        : "bg-card border-border text-muted-foreground"
                    )}>
                      {isCompleted
                        ? <Check className="h-5 w-5 text-primary" />
                        : <StepIcon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "")} />
                      }
                    </div>
                    <span className={cn(
                      "text-[9px] font-black uppercase tracking-widest hidden sm:block",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>{s.title}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={cn(
                      "w-12 sm:w-20 h-[2px] mx-2 transition-all duration-700",
                      isCompleted ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()}>
            <AnimatePresence mode="wait">
              {/* ── Step 1: Basic Info ── */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-5"
                >
                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Store className="h-4 w-4 text-primary" />
                        </div>
                        Store Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Store Name *</FormLabel>
                          <FormControl>
                            <Input className={inputClass} placeholder="e.g. The Spice House" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="category" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Category *</FormLabel>
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
                          <FormLabel className={labelClass}>Address *</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="Full address" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              className="rounded-xl bg-muted/30 border-border resize-none min-h-[100px]"
                              placeholder="Tell customers what makes your store special..."
                              {...field}
                            />
                          </FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Step 2: Contact ── */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-5"
                >
                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Phone className="h-4 w-4 text-primary" />
                        </div>
                        Contact Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="contactPhone" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>Phone Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className={cn(inputClass, "pl-10")} placeholder="+91 98765 43210" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )} />

                        <FormField control={form.control} name="whatsapp" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>WhatsApp Number</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input className={cn(inputClass, "pl-10")} placeholder="+91 98765 43210" {...field} />
                              </div>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="contactEmail" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Contact Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="store@example.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="openingHours" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Opening Hours</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="Mon–Sat: 9 AM – 9 PM" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="googleMapUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Google Maps URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="https://maps.google.com/..." {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Step 3: Payment ── */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-5"
                >
                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <CreditCard className="h-4 w-4 text-primary" />
                        </div>
                        Payment Methods
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                      <div className="space-y-3">
                        <p className={labelClass}>Accepted Payment Methods</p>
                        <div className="flex flex-wrap gap-2">
                          {PAYMENT_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => togglePaymentMethod(opt.value)}
                              className={cn(
                                "px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                                watchedPaymentMethods.includes(opt.value)
                                  ? "bg-primary text-primary-foreground border-primary shadow-md"
                                  : "bg-muted/30 border-border text-muted-foreground hover:border-primary/40"
                              )}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      <FormField control={form.control} name="upiId" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>UPI ID</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="storename@upi" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        Bank Account Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <FormField control={form.control} name="bankDetails.accountHolder" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>Account Holder Name</FormLabel>
                            <FormControl><Input className={inputClass} placeholder="Full legal name" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bankDetails.bankName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>Bank Name</FormLabel>
                            <FormControl><Input className={inputClass} placeholder="e.g. HDFC Bank" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bankDetails.accountNumber" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>Account Number</FormLabel>
                            <FormControl><Input className={inputClass} placeholder="XXXXXXXXXXXX" {...field} /></FormControl>
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="bankDetails.ifscCode" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelClass}>IFSC Code</FormLabel>
                            <FormControl><Input className={inputClass} placeholder="HDFC0001234" {...field} /></FormControl>
                          </FormItem>
                        )} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ── Step 4: Media & Social ── */}
              {currentStep === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  className="space-y-5"
                >
                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <ImageIcon className="h-4 w-4 text-primary" />
                        </div>
                        Store Photos
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {photoFields.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                          {photoFields.map((f, i) => (
                            <div key={f.id} className="relative aspect-square rounded-xl overflow-hidden bg-muted border border-border group">
                              <img src={form.watch(`photos.${i}` as any)} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removePhoto(i)}
                                className="absolute top-1.5 right-1.5 h-6 w-6 rounded-full bg-destructive/90 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={handlePhotoUpload}
                        className="w-full h-14 rounded-xl border-2 border-dashed border-border bg-muted/20 hover:bg-muted/40 text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 transition-colors"
                      >
                        <Upload className="h-4 w-4" /> Upload Photos via Cloudinary
                      </button>
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Globe className="h-4 w-4 text-primary" />
                        </div>
                        Social &amp; Web Presence
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      <FormField control={form.control} name="website" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Website URL</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="https://yourstore.com" {...field} />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="instagram" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Instagram Handle</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="@yourstore" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />

                      <FormField control={form.control} name="facebook" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelClass}>Facebook Page</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input className={cn(inputClass, "pl-10")} placeholder="facebook.com/yourstore" {...field} />
                            </div>
                          </FormControl>
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8">
              <Button
                type="button"
                variant="ghost"
                onClick={currentStep === 1 ? () => navigate("/portal/admin/local-stores") : prevStep}
                className="h-12 px-6 rounded-2xl font-black uppercase tracking-widest text-[10px] gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {currentStep === 1 ? "Cancel" : "Back"}
              </Button>

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => form.handleSubmit((v) => mutation.mutate(v))()}
                  disabled={mutation.isPending}
                  className="h-12 px-8 rounded-2xl font-black uppercase tracking-widest text-[10px] bg-primary gap-2"
                >
                  {mutation.isPending ? "Saving..." : isEdit ? "Update Store" : "Create Store"}
                  <Check className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default CreateStorePage;
