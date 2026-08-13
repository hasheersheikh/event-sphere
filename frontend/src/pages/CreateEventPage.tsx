import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  MapPin,
  Ticket,
  Info,
  Image as ImageIcon,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Tag,
  LayoutGrid,
  RefreshCw,
  CalendarDays,
  Layers,
  AlertCircle,
  Users,
  XCircle,
  Video,
  Camera,
  Loader2,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { CLOUDINARY_ENABLED, uploadImageToBackend } from "@/lib/localUpload";
import { UPLOAD_SPECS, validateUploadFile } from "@/lib/uploadSpecs";
import { requestImageCrop } from "@/lib/imageCropController";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CityCombobox } from "@/components/events/CityCombobox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import api from "@/lib/api";

// ─── Zod schema ─────────────────────────────────────────────────────────────

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  image: z.string().min(1, "Banner image is required").url("Please enter a valid image URL"),
  videoUrl: z.string().optional(),
  eventVideo: z.string().optional(), // Uploaded video file
  reels: z.array(z.string()).optional(),
  artist: z.object({
    name: z.string().optional(),
    instagramHandle: z.string().optional(),
    profileImage: z.string().optional(),
  }).optional(),
  lineup: z.array(z.object({
    name: z.string().min(1, "Name is required"),
    role: z.string().optional(),
    instagramUrl: z.string().optional(),
    image: z.string().optional(),
  })).optional(),
  ageRestriction: z.string().optional().default("All Ages"),

  // ── Schedule ──────────────────────────────────────────────────────────────
  scheduleType: z.enum(["single", "multi_slot", "recurring", "multi_day"]).default("single"),

  // single / multi_slot / recurring share a base date
  date: z.any().optional(),
  time: z.string().optional(),
  endTime: z.string().optional(),

  // multi_slot – N shows on the same day
  slots: z.array(z.object({
    startTime: z.string().min(1, "Start time required"),
    endTime: z.string().optional(),
    label: z.string().optional(),
    capacity: z.coerce.number().min(1).optional(),
  })).optional(),

  // recurring
  recurrence: z.object({
    frequency: z.enum(["daily", "weekly"]),
    daysOfWeek: z.array(z.number()).optional(),
    endDate: z.any().optional(),
  }).optional(),

  // multi_day – arbitrary dates
  days: z.array(z.object({
    date: z.date({ required_error: "Date is required" }),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().optional(),
    title: z.string().optional(),
  })).optional(),

  // ── Location ──────────────────────────────────────────────────────────────
  city: z.string().min(1, "City is required"),
  location: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    venueName: z.string().optional(),
    googleMapUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  }),

  offlineTicketsAvailable: z.boolean().optional().default(false),

  coordinator: z.object({
    name: z.string().optional(),
    phone: z.string().optional().refine(
      (val) => !val || /^\+91\d{10}$/.test(val),
      "Phone number must start with +91 and be 13 digits"
    ),
  }).optional(),

  // ── Tickets & vouchers ────────────────────────────────────────────────────
  ticketTypes: z.array(z.object({
    name: z.string().min(1, "Ticket name is required"),
    description: z.string().optional(),
    price: z.coerce.number().min(0, "Price cannot be negative"),
    capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
    isSoldOut: z.boolean().optional().default(false),
    isFullPass: z.boolean().optional().default(false),
    fullPassPrice: z.coerce.number().min(0).optional(),
    dayWisePrices: z.array(z.object({ dayIndex: z.number(), price: z.coerce.number().min(0) })).optional(),
  })).min(1, "At least one ticket type is required"),

  vouchers: z.array(z.object({
    code: z.string().min(1, "Code is required"),
    discountType: z.enum(["percentage", "fixed"]),
    discountAmount: z.coerce.number().min(0),
    isActive: z.boolean().default(true),
  })).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const WEEK_DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

const SCHEDULE_TYPES = [
  {
    type: "single" as const,
    label: "Single Event",
    icon: CalendarIcon,
    desc: "One date and time",
  },
  {
    type: "multi_slot" as const,
    label: "Multi-Slot",
    icon: Layers,
    desc: "Multiple shows, same day",
  },
  {
    type: "recurring" as const,
    label: "Recurring",
    icon: RefreshCw,
    desc: "Repeats daily or weekly",
  },
  {
    type: "multi_day" as const,
    label: "Multi-Day",
    icon: CalendarDays,
    desc: "Spans multiple dates",
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const flattenErrors = (errors: any, path = ""): { field: string; message: string }[] => {
  const out: { field: string; message: string }[] = [];
  for (const key in errors) {
    const err = errors[key];
    const fullPath = path ? `${path}.${key}` : key;
    if (err?.message && typeof err.message === "string") {
      out.push({ field: fullPath, message: err.message });
    } else if (Array.isArray(err)) {
      err.forEach((item: any, i: number) => out.push(...flattenErrors(item, `${fullPath}[${i}]`)));
    } else if (err && typeof err === "object") {
      out.push(...flattenErrors(err, fullPath));
    }
  }
  return out;
};

const STEP_FIELDS: Record<number, string[]> = {
  1: ["title", "description", "category", "image", "ageRestriction", "lineup", "artist", "videoUrl", "eventVideo", "reels"],
  2: ["location", "city", "date", "time", "endTime", "slots", "days", "recurrence", "coordinator", "offlineTicketsAvailable"],
  3: ["ticketTypes", "vouchers"],
};

// ─── Component ───────────────────────────────────────────────────────────────

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const isUnapprovedManager = user?.role === "event_manager" && !user?.isApproved;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    shouldUnregister: false,
    defaultValues: {
      title: "",
      description: "",
      category: "",
      image: "",
      videoUrl: "",
      eventVideo: "",
      reels: [],
      artist: { name: "", instagramHandle: "", profileImage: "" },
      ageRestriction: "All Ages",
      scheduleType: "single",
      date: undefined,
      time: "",
      endTime: "",
      slots: [],
      recurrence: { frequency: "daily", daysOfWeek: [] },
      days: [],
      city: "",
      location: { address: "", venueName: "", googleMapUrl: "" },
      offlineTicketsAvailable: false,
      coordinator: { name: "", phone: "" },
      ticketTypes: [{ name: "General Admission", price: 0, capacity: 100, isSoldOut: false, isFullPass: false, dayWisePrices: [] }],
      vouchers: [],
      lineup: [],
    },
  });

  const scheduleType = form.watch("scheduleType");
  const recurrenceFreq = form.watch("recurrence.frequency");
  const recurrenceDays = form.watch("recurrence.daysOfWeek") || [];

  // Field arrays
  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({ name: "slots", control: form.control });
  const { fields: dayFields, remove: removeDay } = useFieldArray({ name: "days", control: form.control });
  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({ name: "ticketTypes", control: form.control });
  const { fields: voucherFields, append: appendVoucher, remove: removeVoucher } = useFieldArray({ name: "vouchers", control: form.control });
  const { fields: lineupFields, append: appendLineup, remove: removeLineup } = useFieldArray({ name: "lineup", control: form.control });

  // ── Schedule type change — clears stale type-specific data ───────────────
  const handleScheduleTypeChange = (newType: EventFormValues["scheduleType"]) => {
    if (newType === scheduleType) return;
    // Clear multi_day-specific ticket data when leaving multi_day
    if (scheduleType === "multi_day" && newType !== "multi_day") {
      const tickets = form.getValues("ticketTypes");
      tickets.forEach((_, i) => {
        form.setValue(`ticketTypes.${i}.isFullPass`, false);
        form.setValue(`ticketTypes.${i}.dayWisePrices`, []);
      });
    }
    form.setValue("scheduleType", newType);
    form.setValue("slots", []);
    form.setValue("days", []);
    form.setValue("recurrence", { frequency: "daily", daysOfWeek: [] });
    // Clear date/time when switching to multi_day — derived from days array instead
    if (newType === "multi_day") {
      form.setValue("date", undefined);
      form.setValue("time", "");
      form.setValue("endTime", "");
    }
  };

  // ── Slot overlap detection ─────────────────────────────────────────────────
  const hasSlotOverlap = () => {
    const slots = form.getValues("slots") || [];
    for (let i = 0; i < slots.length; i++) {
      for (let j = i + 1; j < slots.length; j++) {
        const aEnd = slots[i].endTime || "23:59";
        const bEnd = slots[j].endTime || "23:59";
        if (slots[i].startTime < bEnd && aEnd > slots[j].startTime) return true;
      }
    }
    return false;
  };

  // ── Mutation ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const st = values.scheduleType;
      const payload: any = {
        ...values,
        scheduleType: st,
        isMultiDay: st === "multi_day",
      };

      if (st === "single") {
        payload.date = values.date ? format(new Date(values.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        delete payload.slots;
        delete payload.days;
        delete payload.recurrence;
      } else if (st === "multi_slot") {
        payload.date = values.date ? format(new Date(values.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        payload.time = values.slots?.[0]?.startTime || "00:00";
        delete payload.days;
        delete payload.recurrence;
      } else if (st === "recurring") {
        payload.date = values.date ? format(new Date(values.date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        payload.recurrence = {
          frequency: values.recurrence?.frequency || "daily",
          daysOfWeek: values.recurrence?.daysOfWeek || [],
          endDate: values.recurrence?.endDate ? format(new Date(values.recurrence.endDate), "yyyy-MM-dd") : null,
        };
        delete payload.days;
        // slots (optional sub-slots per occurrence) are intentionally kept
      } else if (st === "multi_day") {
        const sortedDays = [...(values.days || [])].sort((a, b) => a.date.getTime() - b.date.getTime());
        payload.date = sortedDays[0]?.date ? format(new Date(sortedDays[0].date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        payload.time = sortedDays[0]?.startTime || "09:00";
        payload.days = sortedDays.map((d) => ({ ...d, date: format(new Date(d.date), "yyyy-MM-dd") }));
        delete payload.slots;
        delete payload.recurrence;
      }

      console.group("🚀 CreateEvent — API payload");
      console.log("Schedule type:", st);
      console.log("Full payload:", JSON.parse(JSON.stringify(payload)));
      console.groupEnd();

      const { data } = await api.post("/events", payload);
      return data;
    },
    onSuccess: (data) => {
      console.log("✅ CreateEvent — success, event id:", data._id);
      toast.success("Event created successfully!");
      navigate(`/events/${data._id}/success`);
    },
    onError: (error: any) => {
      console.group("❌ CreateEvent — API error");
      console.log("Status:", error.response?.status);
      console.log("Server message:", error.response?.data);
      console.log("Full error:", error);
      console.groupEnd();
      toast.error(error.response?.data?.message || "Something went wrong.");
    },
  });

  // ── Step validation ────────────────────────────────────────────────────────
  const nextStep = async () => {
    const fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate.push("title", "description", "category", "image", "ageRestriction");
      lineupFields.forEach((_, i) => fieldsToValidate.push(`lineup.${i}.name`));
    }
    if (currentStep === 2) {
      fieldsToValidate.push("location.address", "city");
      if (scheduleType === "single") fieldsToValidate.push("date", "time");
      else if (scheduleType === "multi_slot") fieldsToValidate.push("date");
      else if (scheduleType === "recurring") fieldsToValidate.push("date", "time");
      else if (scheduleType === "multi_day") fieldsToValidate.push("days");
    }
    const isValid = await form.trigger(fieldsToValidate);

    console.group(`🔍 CreateEvent — nextStep (step ${currentStep} → ${currentStep + 1})`);
    console.log("Fields validated:", fieldsToValidate);
    console.log("Valid:", isValid);
    if (!isValid) {
      console.log("Errors (flat):", flattenErrors(form.formState.errors));
      console.log("Raw errors:", form.formState.errors);
    }
    console.groupEnd();

    if (isValid) {
      if (currentStep === 2) {
        if (scheduleType === "multi_slot") {
          if (slotFields.length === 0) { toast.error("Please add at least one time slot."); return; }
          if (hasSlotOverlap()) { toast.error("Please resolve time slot overlaps."); return; }
        }
        if (scheduleType === "multi_day" && dayFields.length === 0) {
          toast.error("Please select at least one event day."); return;
        }
      }
      setCurrentStep((p) => Math.min(p + 1, 3));
      window.scrollTo(0, 0);
    } else {
      const errs = flattenErrors(form.formState.errors);
      toast.error(errs[0]?.message || "Please fix the highlighted fields before proceeding.");
    }
  };

  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));
  const onSubmit = (values: EventFormValues) => { mutation.mutate(values); };

  const handleFinalSubmit = async () => {
    const isValid = await form.trigger();

    console.group("🔍 CreateEvent — handleFinalSubmit");
    console.log("Form valid:", isValid);
    console.log("Current form values:", JSON.parse(JSON.stringify(form.getValues())));
    console.log("Schedule type:", form.getValues("scheduleType"));
    console.log("All errors (flat):", flattenErrors(form.formState.errors));
    console.log("Raw errors:", form.formState.errors);
    console.groupEnd();

    if (!isValid) {
      const errors = form.formState.errors;
      for (let step = 1; step <= 3; step++) {
        const keys = STEP_FIELDS[step];
        if (keys.some((k) => errors[k as keyof typeof errors])) {
          setCurrentStep(step); window.scrollTo(0, 0);
          const errs = flattenErrors(
            Object.fromEntries(keys.filter((k) => errors[k as keyof typeof errors]).map((k) => [k, errors[k as keyof typeof errors]]))
          );
          const stepName = ["Basics", "When & Where", "Tickets"][step - 1];
          console.log(`❌ Step ${step} (${stepName}) errors:`, errs);
          toast.error(`Step ${step} (${stepName}): ${errs[0]?.message || "Please fix the highlighted fields."}`);
          return;
        }
      }
      console.log("❌ Errors outside mapped steps:", flattenErrors(form.formState.errors));
      toast.error("Please fix all errors before submitting.");
      return;
    }
    form.handleSubmit(onSubmit)();
  };

  const categories = ["Music", "Technology", "Business", "Entertainment", "Health", "Sports", "Education", "Exhibition", "Other"];
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const artistPhotoInputRef = useRef<HTMLInputElement>(null);
  const [artistPhotoUploading, setArtistPhotoUploading] = useState(false);

  // Direct Cloudinary REST upload — no widget/popup
  const uploadToCloudinary = async (file: File, resourceType: "image" | "video" = "image"): Promise<string> => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
    if (CLOUDINARY_ENABLED && cloudName && uploadPreset) {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", uploadPreset);
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
        { method: "POST", body: fd }
      );
      const data = await res.json();
      if (!data.secure_url) throw new Error("Cloudinary upload failed");
      return data.secure_url as string;
    }
    return uploadImageToBackend(file);
  };

  const handleUpload = () => { bannerInputRef.current?.click(); };

  const handleLocalBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateUploadFile(file, UPLOAD_SPECS.eventBanner);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }
    const cropped = await requestImageCrop(file, UPLOAD_SPECS.eventBanner.aspect!);
    if (!cropped) { e.target.value = ""; return; }
    try {
      const url = await uploadToCloudinary(cropped, "image");
      form.setValue("image", url);
      toast.success("Banner uploaded.");
    } catch { toast.error("Upload failed."); }
    e.target.value = "";
  };

  const handleArtistPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const validationError = validateUploadFile(file, UPLOAD_SPECS.artistPhoto);
    if (validationError) {
      toast.error(validationError);
      return;
    }
    const cropped = await requestImageCrop(file, UPLOAD_SPECS.artistPhoto.aspect!, UPLOAD_SPECS.artistPhoto.cropShape);
    if (!cropped) return;
    setArtistPhotoUploading(true);
    try {
      const url = await uploadToCloudinary(cropped, "image");
      form.setValue("artist.profileImage", url);
      toast.success("Artist photo uploaded.");
    } catch {
      toast.error("Upload failed.");
    } finally {
      setArtistPhotoUploading(false);
    }
  };

  const handleVideoUpload = () => { videoInputRef.current?.click(); };

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateUploadFile(file, UPLOAD_SPECS.eventVideo);
    if (validationError) {
      toast.error(validationError);
      e.target.value = "";
      return;
    }

    try {
      const url = await uploadToCloudinary(file, "video");
      form.setValue("eventVideo", url);
      toast.success("Event video uploaded. This will be displayed in a gallery with your banner image.", {
        description: "Video should be in Instagram photo aspect ratio (4:5 portrait). Other aspect ratios will be cropped.",
        duration: 5000,
      });
    } catch { toast.error("Video upload failed."); }
    e.target.value = "";
  };

  const steps = [
    { title: "Basics", icon: Info },
    { title: "When & Where", icon: CalendarIcon },
    { title: "Tickets", icon: Ticket },
  ];

  // ── Shared input class ─────────────────────────────────────────────────────
  const inputCls = "h-12 bg-background/50 border-border/50 rounded-xl font-medium text-sm";
  const labelCls = "text-[10px] font-black uppercase tracking-widest text-muted-foreground";

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <Navbar />

      <main className="flex-1 container max-w-4xl py-12 px-4 md:px-6 relative z-10 mt-14 md:mt-16">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
            <Plus className="h-4 w-4" /> Event Creation
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-foreground">
            Create Event.
          </h1>

          {/* Stepper */}
          <div className="mt-12 flex items-center justify-center max-w-2xl mx-auto">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = currentStep === i + 1;
              const isCompleted = currentStep > i + 1;
              return (
                <div key={i} className="flex items-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                      isActive ? "bg-primary border-primary scale-110" : isCompleted ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
                    )}>
                      <StepIcon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "")} />
                    </div>
                    <span className={cn("text-[10px] font-black uppercase tracking-widest", isActive ? "text-primary" : "text-muted-foreground")}>{s.title}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn("w-20 md:w-32 h-[2px] mx-2 md:mx-4 transition-all duration-700", isCompleted ? "bg-primary" : "bg-border")} />
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-center text-[10px] text-muted-foreground font-medium">
            Fields marked <span className="text-destructive font-black">*</span> are required
          </p>

          {isUnapprovedManager && (
            <div className="mt-8 mx-auto max-w-2xl p-5 bg-orange-500/5 border border-orange-500/20 rounded-2xl flex items-center gap-4">
              <ShieldCheck className="h-6 w-6 text-orange-500 shrink-0" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Verification Pending</p>
                <p className="text-xs font-medium text-orange-500/80 mt-0.5">Public broadcasting disabled until your account is approved.</p>
              </div>
            </div>
          )}
        </header>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <AnimatePresence mode="wait">

              {/* ═══════════════════════════════════════
                  STEP 1: Basics
              ═══════════════════════════════════════ */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {STEP_FIELDS[1].some((k) => form.formState.errors[k as keyof typeof form.formState.errors]) && (
                    <div className="flex gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Fix these errors before continuing</p>
                        {flattenErrors(Object.fromEntries(STEP_FIELDS[1].filter((k) => form.formState.errors[k as keyof typeof form.formState.errors]).map((k) => [k, form.formState.errors[k as keyof typeof form.formState.errors]]))).map((e, i) => (
                          <p key={i} className="text-[11px] font-medium text-destructive/80">· {e.message}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <Card className="border border-border/40 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl"><Info className="h-4 w-4 text-primary" /></div>
                        General Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelCls}>Event Title <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Input placeholder="e.g. Modern Web Summit 2025" className={cn(inputCls, "h-14 text-base font-bold")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="category" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelCls}>Category <span className="text-destructive">*</span></FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger className={cn(inputCls, "h-12")}><SelectValue placeholder="Select Category" /></SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((cat) => (<SelectItem key={cat} value={cat} className="font-medium">{cat}</SelectItem>))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )} />

                        <div className="space-y-2">
                          <Label className={labelCls}>Event Banner <span className="text-destructive">*</span></Label>
                          <input ref={bannerInputRef} type="file" accept={UPLOAD_SPECS.eventBanner.accept} className="hidden" onChange={handleLocalBannerUpload} />
                          <button type="button" onClick={handleUpload} className={cn(
                            "w-full h-12 bg-background/50 border border-dashed rounded-xl flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group",
                            form.formState.errors.image ? "border-destructive/60" : "border-border/50"
                          )}>
                            <ImageIcon className={cn("h-4 w-4", form.formState.errors.image ? "text-destructive" : "text-muted-foreground group-hover:text-primary")} />
                            <span className={cn("text-[10px] font-black uppercase tracking-widest", form.formState.errors.image ? "text-destructive" : "text-muted-foreground group-hover:text-primary")}>
                              {form.watch("image") ? "Change Image" : "Upload Image"}
                            </span>
                          </button>
                          {form.formState.errors.image && (
                            <p className="text-[11px] text-destructive font-medium">{form.formState.errors.image.message}</p>
                          )}
                          <p className="text-[10px] text-muted-foreground/60">
                            Use your Instagram post photo (4:5 portrait, 1080 × 1350 px). This is the standard Instagram feed size, so no separate photo needed. {UPLOAD_SPECS.eventBanner.hint}
                          </p>
                        </div>
                      </div>

                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelCls}>Description <span className="text-destructive">*</span></FormLabel>
                          <FormControl><Textarea placeholder="Describe the event..." className="min-h-[120px] bg-background/50 border-border/50 rounded-xl font-medium text-sm resize-none" {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid md:grid-cols-2 gap-6">
                         <FormField control={form.control} name="ageRestriction" render={({ field }) => (
                           <FormItem>
                             <FormLabel className={labelCls}>Age Requirement</FormLabel>
                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                               <FormControl>
                                 <SelectTrigger className={cn(inputCls, "h-12")}><SelectValue placeholder="Select Age" /></SelectTrigger>
                               </FormControl>
                               <SelectContent>
                                 {["All Ages", "13+", "16+", "18+", "21+"].map((age) => (<SelectItem key={age} value={age} className="font-medium">{age}</SelectItem>))}
                               </SelectContent>
                             </Select>
                             <FormMessage />
                           </FormItem>
                         )} />

                       {/* Artist Information */}
                       <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/30">
                         <div className="flex items-center gap-2">
                           <div className="p-1.5 bg-neon-lime/10 rounded-lg"><Users className="h-3.5 w-3.5 text-neon-lime" /></div>
                           <Label className="text-[10px] font-black uppercase tracking-widest text-neon-lime">Artist Information (Optional)</Label>
                         </div>
                         <div className="grid md:grid-cols-3 gap-4">
                           <FormField control={form.control} name="artist.name" render={({ field }) => (
                             <FormItem>
                               <FormLabel className={labelCls}>Artist Name</FormLabel>
                               <FormControl>
                                 <Input placeholder="Artist name" className={cn(inputCls, "h-11")} {...field} />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )} />
                           <FormField control={form.control} name="artist.instagramHandle" render={({ field }) => (
                             <FormItem>
                               <FormLabel className={labelCls}>Instagram Handle</FormLabel>
                               <FormControl>
                                 <Input placeholder="@username" className={cn(inputCls, "h-11")} {...field} />
                               </FormControl>
                               <FormMessage />
                             </FormItem>
                           )} />
                           <FormItem>
                             <FormLabel className={labelCls}>Artist Photo</FormLabel>
                             <div className="flex items-center gap-3">
                               <input
                                 ref={artistPhotoInputRef}
                                 type="file"
                                 accept={UPLOAD_SPECS.artistPhoto.accept}
                                 className="hidden"
                                 onChange={handleArtistPhotoUpload}
                               />
                               <button
                                 type="button"
                                 onClick={() => artistPhotoInputRef.current?.click()}
                                 disabled={artistPhotoUploading}
                                 className="relative h-11 w-11 shrink-0 rounded-full overflow-hidden border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors flex items-center justify-center bg-background/50 group"
                               >
                                 {form.watch("artist.profileImage") ? (
                                   <>
                                     <img src={form.watch("artist.profileImage")} alt="Artist" className="h-full w-full object-cover" />
                                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                       <Camera className="h-3.5 w-3.5 text-white" />
                                     </div>
                                   </>
                                 ) : artistPhotoUploading ? (
                                   <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                 ) : (
                                   <Camera className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                                 )}
                               </button>
                               <span className="text-[10px] text-muted-foreground/60 leading-snug">{UPLOAD_SPECS.artistPhoto.hint}</span>
                             </div>
                           </FormItem>
                          </div>
                        </div>

                        {/* Lineup */}
                        <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/30">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-primary/10 rounded-lg"><Users className="h-3.5 w-3.5 text-primary" /></div>
                            <Label className="text-[10px] font-black uppercase tracking-widest text-primary">Event Lineup (Influencers & Hosts)</Label>
                          </div>
                          <div className="space-y-3">
                            {lineupFields.map((_, index) => (
                              <div key={index} className="p-4 border border-border/40 rounded-xl bg-muted/10 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className={labelCls}>Person {index + 1}</span>
                                  <button type="button" onClick={() => removeLineup(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="grid md:grid-cols-2 gap-3">
                                  <FormField control={form.control} name={`lineup.${index}.name`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>Name <span className="text-destructive">*</span></FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g. Shah Rukh Khan" className={cn(inputCls, "h-10 text-xs")} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <FormField control={form.control} name={`lineup.${index}.role`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>Role</FormLabel>
                                      <FormControl>
                                        <Input placeholder="e.g. Host, DJ, Guest" className={cn(inputCls, "h-10 text-xs")} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <FormField control={form.control} name={`lineup.${index}.instagramUrl`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>Instagram Profile URL</FormLabel>
                                      <FormControl>
                                        <Input placeholder="https://instagram.com/username" className={cn(inputCls, "h-10 text-xs")} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <FormField control={form.control} name={`lineup.${index}.image`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>Profile Image URL</FormLabel>
                                      <FormControl>
                                        <Input placeholder="Profile image URL" className={cn(inputCls, "h-10 text-xs")} {...field} />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                </div>
                              </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendLineup({ name: "", role: "", instagramUrl: "", image: "" })} className="w-full h-10 rounded-xl border-dashed border-border/50 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5">
                              <Plus className="h-3 w-3" /> Add Person to Lineup
                            </Button>
                          </div>
                        </div>

                         <FormField control={form.control} name="videoUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelCls}>Main Video URL (YouTube)</FormLabel>
                            <FormControl><Input placeholder="https://youtube.com/watch?v=..." className={inputCls} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

                        {/* Event Video Upload - for banner gallery */}
                        <div className="space-y-2">
                          <Label className={labelCls}>Event Video <span className="text-muted-foreground">(Optional)</span></Label>
                          <input
                            ref={videoInputRef}
                            type="file"
                            accept={UPLOAD_SPECS.eventVideo.accept}
                            className="hidden"
                            onChange={handleVideoFileUpload}
                          />
                          <button
                            type="button"
                            onClick={handleVideoUpload}
                            className="w-full h-12 bg-background/50 border border-dashed border-primary/30 rounded-xl flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                          >
                            <Video className="h-4 w-4 text-primary group-hover:scale-110 transition-transform" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary group-hover:text-primary/80">
                              {form.watch("eventVideo") ? "Change Video" : "Upload Event Video"}
                            </span>
                          </button>
                          <div className="space-y-1">
                            <p className="text-[10px] text-muted-foreground/60">
                              {UPLOAD_SPECS.eventVideo.hint}. Video will be displayed in a gallery with your banner image (5s image → video loop).
                            </p>
                            <p className="text-[9px] text-orange-500/70 font-medium">
                              ⚠️ Use Instagram photo aspect ratio (4:5 portrait, 1080 × 1350 px). Videos in other aspect ratios will be cropped.
                            </p>
                          </div>
                          {form.watch("eventVideo") && (
                            <div className="relative aspect-[4/5] w-32 rounded-lg overflow-hidden bg-muted border border-border/30 mt-2">
                              <video src={form.watch("eventVideo")} className="w-full h-full object-cover" muted />
                              <button
                                type="button"
                                onClick={() => form.setValue("eventVideo", "")}
                                className="absolute top-1 right-1 h-6 w-6 rounded-full bg-destructive/90 text-white flex items-center justify-center hover:bg-destructive transition-colors"
                                title="Remove video"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label className={labelCls}>Event Reels & Shorts</Label>
                          <div className="space-y-2">
                            {form.watch("reels")?.map((_, index) => (
                              <div key={index} className="flex gap-2">
                                <Input className={cn(inputCls, "h-10 text-xs")} placeholder="YouTube Short or Instagram Reel URL"
                                  value={form.watch(`reels.${index}`)}
                                  onChange={(e) => { const r = [...(form.getValues("reels") || [])]; r[index] = e.target.value; form.setValue("reels", r); }}
                                />
                                <Button type="button" variant="ghost" size="sm" onClick={() => { const r = [...(form.getValues("reels") || [])]; r.splice(index, 1); form.setValue("reels", r); }} className="h-10 w-10 rounded-xl hover:bg-destructive/10 hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" onClick={() => form.setValue("reels", [...(form.getValues("reels") || []), ""])} className="w-full h-10 rounded-xl border-dashed border-border/50 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5">
                              <Plus className="h-3 w-3" /> Add Reel/Short
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════
                  STEP 2: When & Where
              ═══════════════════════════════════════ */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {STEP_FIELDS[2].some((k) => form.formState.errors[k as keyof typeof form.formState.errors]) && (
                    <div className="flex gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Fix these errors before continuing</p>
                        {flattenErrors(Object.fromEntries(STEP_FIELDS[2].filter((k) => form.formState.errors[k as keyof typeof form.formState.errors]).map((k) => [k, form.formState.errors[k as keyof typeof form.formState.errors]]))).map((e, i) => (
                          <p key={i} className="text-[11px] font-medium text-destructive/80">· {e.message}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <Card className="border border-border/40 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl"><CalendarIcon className="h-4 w-4 text-primary" /></div>
                        Schedule
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-8">

                      {/* ── Schedule type selector ─────────────────────── */}
                      <div>
                        <p className={cn(labelCls, "mb-3")}>Event Type</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {SCHEDULE_TYPES.map((opt) => {
                            const Icon = opt.icon;
                            const active = scheduleType === opt.type;
                            return (
                              <button
                                key={opt.type}
                                type="button"
                                onClick={() => handleScheduleTypeChange(opt.type)}
                                className={cn(
                                  "p-4 border-2 rounded-xl text-left transition-all duration-200",
                                  active
                                    ? "bg-primary text-primary-foreground border-primary"
                                    : "bg-muted/20 border-border/40 hover:border-primary/40 hover:bg-muted/40"
                                )}
                              >
                                <Icon className={cn("h-5 w-5 mb-2.5", active ? "text-primary-foreground" : "text-muted-foreground")} />
                                <p className="text-[11px] font-black uppercase tracking-wider">{opt.label}</p>
                                <p className={cn("text-[10px] mt-0.5 leading-snug", active ? "text-primary-foreground/70" : "text-muted-foreground")}>{opt.desc}</p>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* ── Single Event ───────────────────────────────── */}
                      {scheduleType === "single" && (
                        <div className="grid md:grid-cols-3 gap-5">
                          <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className={labelCls}>Date <span className="text-destructive">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button type="button" variant="outline" className={cn(inputCls, "text-left px-4", !field.value && "text-muted-foreground")}>
                                      {field.value ? format(field.value, "PPP") : "Select Date"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="time" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelCls}>Start Time <span className="text-destructive">*</span></FormLabel>
                              <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="endTime" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelCls}>End Time</FormLabel>
                              <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      )}

                      {/* ── Multi-Slot ─────────────────────────────────── */}
                      {scheduleType === "multi_slot" && (
                        <div className="space-y-5">
                          <FormField control={form.control} name="date" render={({ field }) => (
                            <FormItem className="flex flex-col max-w-xs">
                              <FormLabel className={labelCls}>Event Date <span className="text-destructive">*</span></FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button type="button" variant="outline" className={cn(inputCls, "text-left px-4 w-full", !field.value && "text-muted-foreground")}>
                                      {field.value ? format(field.value, "PPP") : "Select Date"}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )} />

                          {hasSlotOverlap() && (
                            <div className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/30 rounded-xl text-orange-600 text-xs font-bold">
                              <AlertCircle className="h-4 w-4 shrink-0" />
                              Some time slots overlap. Please check the times.
                            </div>
                          )}

                          <div className="space-y-3">
                            {slotFields.map((slot, index) => (
                              <div key={slot.id} className="p-4 border border-border/40 rounded-xl bg-muted/10 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className={cn(labelCls)}>Show {index + 1}</span>
                                  <button type="button" onClick={() => removeSlot(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <FormField control={form.control} name={`slots.${index}.startTime`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>Start Time</FormLabel>
                                      <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )} />
                                  <FormField control={form.control} name={`slots.${index}.endTime`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>End Time</FormLabel>
                                      <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                    </FormItem>
                                  )} />
                                  <FormField control={form.control} name={`slots.${index}.label`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>Label</FormLabel>
                                      <FormControl><Input placeholder="e.g. Evening Show" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                    </FormItem>
                                  )} />
                                  <FormField control={form.control} name={`slots.${index}.capacity`} render={({ field }) => (
                                    <FormItem>
                                      <FormLabel className={cn(labelCls, "text-[9px]")}>Capacity</FormLabel>
                                      <FormControl><Input type="number" placeholder="e.g. 100" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                    </FormItem>
                                  )} />
                                </div>
                              </div>
                            ))}
                            <Button type="button" variant="outline" onClick={() => appendSlot({ startTime: "09:00", endTime: "11:00", label: "", capacity: undefined })}
                              className="w-full h-11 rounded-xl border-dashed border-border/50 text-[10px] font-black uppercase gap-2 hover:bg-primary/5 hover:border-primary/50">
                              <Plus className="h-3.5 w-3.5" /> Add Show Slot
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* ── Recurring ──────────────────────────────────── */}
                      {scheduleType === "recurring" && (
                        <div className="space-y-5">
                          <div className="grid md:grid-cols-3 gap-5">
                            <FormField control={form.control} name="date" render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className={labelCls}>Start Date <span className="text-destructive">*</span></FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button type="button" variant="outline" className={cn(inputCls, "text-left px-4", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(field.value, "PPP") : "Select Date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="time" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={labelCls}>Time <span className="text-destructive">*</span></FormLabel>
                                <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="endTime" render={({ field }) => (
                              <FormItem>
                                <FormLabel className={labelCls}>End Time</FormLabel>
                                <FormControl><Input type="time" className={inputCls} {...field} /></FormControl>
                              </FormItem>
                            )} />
                          </div>

                          {/* Frequency */}
                          <div className="p-5 border border-border/40 rounded-xl bg-muted/10 space-y-4">
                            <p className={labelCls}>Repeat Frequency</p>
                            <div className="flex gap-3">
                              {(["daily", "weekly"] as const).map((freq) => (
                                <button key={freq} type="button"
                                  onClick={() => {
                    form.setValue("recurrence.frequency", freq);
                    if (freq === "daily") form.setValue("recurrence.daysOfWeek", []);
                  }}
                                  className={cn("flex-1 h-11 rounded-xl border-2 text-[11px] font-black uppercase tracking-wider transition-all",
                                    recurrenceFreq === freq ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40"
                                  )}>
                                  {freq === "daily" ? "Daily" : "Weekly"}
                                </button>
                              ))}
                            </div>

                            {recurrenceFreq === "weekly" && (
                              <div>
                                <p className={cn(labelCls, "mb-3")}>Repeat On</p>
                                <div className="flex flex-wrap gap-2">
                                  {WEEK_DAYS.map((day) => {
                                    const selected = recurrenceDays.includes(day.value);
                                    return (
                                      <button key={day.value} type="button"
                                        onClick={() => {
                                          const current = form.getValues("recurrence.daysOfWeek") || [];
                                          form.setValue("recurrence.daysOfWeek",
                                            selected ? current.filter((d) => d !== day.value) : [...current, day.value]
                                          );
                                        }}
                                        className={cn("h-9 w-12 rounded-lg border-2 text-[10px] font-black uppercase transition-all",
                                          selected ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/40"
                                        )}>
                                        {day.label}
                                      </button>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            {/* Optional end date */}
                            <FormField control={form.control} name="recurrence.endDate" render={({ field }) => (
                              <FormItem className="flex flex-col max-w-xs">
                                <FormLabel className={labelCls}>End Date (optional: leave blank for no end)</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button type="button" variant="outline" className={cn(inputCls, "h-10 text-left px-4 text-sm", !field.value && "text-muted-foreground")}>
                                        {field.value ? format(new Date(field.value), "PPP") : "No end date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined}
                                      onSelect={(d) => field.onChange(d || null)}
                                      disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                {field.value && (
                                  <button type="button" onClick={() => field.onChange(null)} className="text-[10px] font-bold text-muted-foreground hover:text-destructive w-fit mt-1 transition-colors">
                                    Clear end date
                                  </button>
                                )}
                              </FormItem>
                            )} />
                          </div>

                          <div className="space-y-4 pt-4 border-t border-border/20">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={cn(labelCls, "text-[11px] text-foreground")}>Time Slots (Optional)</p>
                                <p className="text-[10px] text-muted-foreground font-medium">Add specific shows for each day of this recurrence.</p>
                              </div>
                              <Button type="button" variant="outline" size="sm" onClick={() => appendSlot({ startTime: "10:00", endTime: "12:00", label: "", capacity: undefined })}
                                className="h-9 rounded-xl border-dashed border-primary/30 text-[9px] font-black uppercase tracking-widest gap-2 hover:bg-primary/5">
                                <Plus className="h-3 w-3" /> Add Slot
                              </Button>
                            </div>

                            {slotFields.length > 0 && (
                              <div className="space-y-3">
                                {slotFields.map((slot, index) => (
                                  <div key={slot.id} className="p-4 border border-border/40 rounded-xl bg-muted/10 space-y-3 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="flex items-center justify-between">
                                      <span className={cn(labelCls)}>Show {index + 1}</span>
                                      <button type="button" onClick={() => removeSlot(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                      <FormField control={form.control} name={`slots.${index}.startTime`} render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className={cn(labelCls, "text-[9px]")}>Start</FormLabel>
                                          <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                      <FormField control={form.control} name={`slots.${index}.endTime`} render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className={cn(labelCls, "text-[9px]")}>End</FormLabel>
                                          <FormControl><Input type="time" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                      <FormField control={form.control} name={`slots.${index}.label`} render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className={cn(labelCls, "text-[9px]")}>Label</FormLabel>
                                          <FormControl><Input placeholder="e.g. Afternoon" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                      <FormField control={form.control} name={`slots.${index}.capacity`} render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className={cn(labelCls, "text-[9px]")}>Capacity</FormLabel>
                                          <FormControl><Input type="number" placeholder="100" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ── Multi-Day ──────────────────────────────────── */}
                      {scheduleType === "multi_day" && (
                        <div className="space-y-5">
                          <p className="text-sm text-muted-foreground font-medium">
                            Pick any combination of dates. They don't need to be continuous.
                          </p>

                          {/* Multi-select calendar */}
                          <div className="flex justify-center">
                            <div className="border border-border/40 rounded-2xl overflow-hidden p-1 bg-muted/10">
                              <Calendar
                                mode="multiple"
                                selected={dayFields.map((f) => f.date as unknown as Date).filter(Boolean)}
                                onSelect={(dates: Date[] | undefined) => {
                                  const existing = form.getValues("days") || [];
                                  const newDates = dates || [];
                                  // Build merged array: keep existing entries that are still selected, add new
                                  const merged = newDates.map((d) => {
                                    const found = existing.find((e) => e.date && isSameDay(new Date(e.date), d));
                                    return found || { date: d, startTime: "09:00", endTime: "17:00", title: "" };
                                  });
                                  form.setValue("days", merged);
                                }}
                                disabled={(d) => {
                                  const alreadySelected = dayFields.some(f => f.date && isSameDay(new Date(f.date as unknown as Date), d));
                                  return !alreadySelected && d < new Date(new Date().setHours(0, 0, 0, 0));
                                }}
                                numberOfMonths={2}
                                className="rounded-xl"
                              />
                            </div>
                          </div>

                          {dayFields.length > 0 && (
                            <div className="space-y-3">
                              <p className={labelCls}>{dayFields.length} date{dayFields.length > 1 ? "s" : ""} selected. Set times for each</p>
                              {dayFields
                                .map((f, i) => ({ ...f, originalIndex: i }))
                                .sort((a, b) => new Date(a.date as unknown as Date).getTime() - new Date(b.date as unknown as Date).getTime())
                                .map((field) => {
                                  const index = field.originalIndex;
                                  return (
                                  <div key={field.id} className="p-4 border border-border/40 rounded-xl bg-muted/10">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-sm font-black tracking-tight">
                                        {field.date ? format(new Date(field.date as unknown as Date), "EEE, MMM d yyyy") : `Day ${index + 1}`}
                                      </span>
                                      <button type="button" onClick={() => removeDay(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                      </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                      <FormField control={form.control} name={`days.${index}.title`} render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className={cn(labelCls, "text-[9px]")}>Label (optional)</FormLabel>
                                          <FormControl><Input placeholder="e.g. Workshop Day" className={cn(inputCls, "h-10 text-xs")} {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                      <FormField control={form.control} name={`days.${index}.startTime`} render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className={cn(labelCls, "text-[9px]")}>Start</FormLabel>
                                          <FormControl><Input type="time" className={cn(inputCls, "h-10")} {...field} /></FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )} />
                                      <FormField control={form.control} name={`days.${index}.endTime`} render={({ field }) => (
                                        <FormItem>
                                          <FormLabel className={cn(labelCls, "text-[9px]")}>End</FormLabel>
                                          <FormControl><Input type="time" className={cn(inputCls, "h-10")} {...field} /></FormControl>
                                        </FormItem>
                                      )} />
                                    </div>
                                  </div>
                                  );
                                })}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Location */}
                  <Card className="border border-border/40 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl"><MapPin className="h-4 w-4 text-primary" /></div>
                        Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                      <FormField control={form.control} name="city" render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className={labelCls}>City <span className="text-destructive">*</span></FormLabel>
                          <FormControl>
                            <CityCombobox
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Select city"
                              triggerClassName={inputCls}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid md:grid-cols-2 gap-5">
                        <FormField control={form.control} name="location.venueName" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelCls}>Venue Name</FormLabel>
                            <FormControl><Input placeholder="e.g. Grand Plaza" className={inputCls} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                        <FormField control={form.control} name="location.address" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelCls}>Address <span className="text-destructive">*</span></FormLabel>
                            <FormControl><Input placeholder="Full Address" className={inputCls} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />
                      </div>

                      <FormField control={form.control} name="location.googleMapUrl" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelCls}>Google Maps Link (optional)</FormLabel>
                          <FormControl><Input placeholder="https://maps.app.goo.gl/..." className={inputCls} {...field} /></FormControl>
                          <FormDescription className="text-[10px] text-muted-foreground">Paste a Google Maps share link to show the exact pin on the event page.</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </CardContent>
                  </Card>

                  <Card className="border border-border/40 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-base flex items-center gap-3 font-black">
                          <div className="p-2 bg-primary/10 rounded-xl"><MapPin className="h-4 w-4 text-primary" /></div>
                          Offline Tickets
                        </CardTitle>
                        <FormField control={form.control} name="offlineTicketsAvailable" render={({ field }) => (
                          <FormItem className="flex items-center gap-3 space-y-0">
                            <FormLabel className={cn(labelCls, "text-[9px]")}>Available</FormLabel>
                            <FormControl>
                              <button
                                type="button"
                                role="switch"
                                aria-checked={!!field.value}
                                onClick={() => field.onChange(!field.value)}
                                className={cn(
                                  "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none",
                                  field.value ? "bg-neon-lime" : "bg-muted"
                                )}
                              >
                                <span className={cn(
                                  "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-lg transform transition-transform",
                                  field.value ? "translate-x-5" : "translate-x-0"
                                )} />
                              </button>
                            </FormControl>
                          </FormItem>
                        )} />
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1 ml-11">
                        When enabled, attendees will see a "Call Coordinator" option on the event page to purchase tickets offline.
                      </p>
                    </CardHeader>
                    {form.watch("offlineTicketsAvailable") && (
                      <CardContent className="pt-6 space-y-5">
                        <div className="grid md:grid-cols-2 gap-5">
                          <FormField control={form.control} name="coordinator.name" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelCls}>Coordinator Name</FormLabel>
                              <FormControl><Input placeholder="e.g. John Doe" className={inputCls} {...field} /></FormControl>
                              <FormMessage />
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="coordinator.phone" render={({ field }) => (
                            <FormItem>
                              <FormLabel className={labelCls}>Contact Number <span className="text-destructive">*</span></FormLabel>
                              <div className="flex gap-2 items-center">
                                <div className="h-12 px-4 flex items-center justify-center rounded-xl bg-background/50 border border-border/50 text-sm font-black text-foreground shrink-0 select-none">
                                  +91
                                </div>
                                <FormControl>
                                  <Input
                                    placeholder="9876543210"
                                    className={cn(inputCls, "flex-1")}
                                    value={field.value ? field.value.replace(/^\+91/, "") : ""}
                                    onChange={(e) => {
                                      const digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                                      field.onChange(digits ? "+91" + digits : "");
                                    }}
                                  />
                                </FormControl>
                              </div>
                              <FormDescription className="text-[10px] text-muted-foreground">Enter the 10-digit phone number (e.g., 9876543210)</FormDescription>
                              <FormMessage />
                            </FormItem>
                          )} />
                        </div>
                      </CardContent>
                    )}
                  </Card>
                </motion.div>
              )}

              {/* ═══════════════════════════════════════
                  STEP 3: Tickets & Vouchers
              ═══════════════════════════════════════ */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  {STEP_FIELDS[3].some((k) => form.formState.errors[k as keyof typeof form.formState.errors]) && (
                    <div className="flex gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5">
                      <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-black uppercase tracking-widest text-destructive">Fix these errors before submitting</p>
                        {flattenErrors(Object.fromEntries(STEP_FIELDS[3].filter((k) => form.formState.errors[k as keyof typeof form.formState.errors]).map((k) => [k, form.formState.errors[k as keyof typeof form.formState.errors]]))).map((e, i) => (
                          <p key={i} className="text-[11px] font-medium text-destructive/80">· {e.message}</p>
                        ))}
                      </div>
                    </div>
                  )}
                  <Card className="border border-border/40 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base flex items-center gap-3 font-black">
                          <div className="p-2 bg-primary/10 rounded-xl"><Ticket className="h-4 w-4 text-primary" /></div>
                          Tickets
                        </CardTitle>
                        <Button type="button" variant="ghost" size="sm" onClick={() => appendTicket({ name: "", price: 0, capacity: 100, isSoldOut: false, isFullPass: false })}
                          className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary">
                          <Plus className="h-3 w-3" /> Add Tier
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 p-6">
                      {ticketFields.map((field, index) => (
                        <div key={field.id} className="p-5 border border-border/40 rounded-xl bg-muted/10">
                          <div className="flex justify-between items-center mb-5">
                            <span className={cn(labelCls, "tracking-[0.3em]")}>Ticket Tier {index + 1}</span>
                            {ticketFields.length > 1 && (
                              <button type="button" onClick={() => removeTicket(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-5">
                            <div className="grid md:grid-cols-3 gap-4">
                              <FormField control={form.control} name={`ticketTypes.${index}.name`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(labelCls, "text-[9px]")}>Tier Name <span className="text-destructive">*</span></FormLabel>
                                  <FormControl><Input className={cn(inputCls, "h-11")} {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`ticketTypes.${index}.price`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(labelCls, "text-[9px]")}>Base Price (₹) <span className="text-destructive">*</span></FormLabel>
                                  <FormControl><Input type="number" className={cn(inputCls, "h-11")} {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`ticketTypes.${index}.capacity`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(labelCls, "text-[9px]")}>Total Capacity <span className="text-destructive">*</span></FormLabel>
                                  <FormControl><Input type="number" className={cn(inputCls, "h-11")} {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                            </div>

                            {/* Multi-day pricing */}
                            {scheduleType === "multi_day" && dayFields.length > 0 && (
                              <div className="pt-4 border-t border-border/30 space-y-4">
                                <div className="flex flex-wrap items-center gap-6">
                                  <FormField control={form.control} name={`ticketTypes.${index}.isFullPass`} render={({ field }) => (
                                    <FormItem className="flex items-center gap-2.5 space-y-0">
                                      <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} className="h-4 w-4 rounded border-primary/30" /></FormControl>
                                      <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer text-primary">Enable Full Pass</FormLabel>
                                    </FormItem>
                                  )} />
                                  {form.watch(`ticketTypes.${index}.isFullPass`) && (
                                    <FormField control={form.control} name={`ticketTypes.${index}.fullPassPrice`} render={({ field }) => (
                                      <FormItem className="flex-1 max-w-[180px]">
                                        <FormControl>
                                          <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-black text-primary">₹</span>
                                            <Input type="number" placeholder="Full Pass Price" className={cn(inputCls, "h-10 pl-7 bg-primary/10 border-primary/20 text-primary text-xs")} {...field} />
                                          </div>
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                  )}
                                </div>

                                <div>
                                  <div className="flex items-center gap-2 mb-3">
                                    <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                                    <Label className={cn(labelCls, "text-[9px]")}>Daily Rates</Label>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {dayFields.map((day, dayIndex) => (
                                      <div key={day.id} className="p-3 border border-border/30 rounded-xl space-y-2 hover:border-primary/20 transition-colors">
                                        <span className="text-[9px] font-black uppercase tracking-widest text-primary/70 block">
                                          {day.date ? format(new Date(day.date as unknown as Date), "MMM dd") : `Day ${dayIndex + 1}`}
                                        </span>
                                        <div className="relative">
                                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">₹</span>
                                          <Input type="number" className={cn(inputCls, "h-9 pl-6 text-[11px]")} placeholder="Price"
                                            onChange={(e) => {
                                              const prices = form.getValues(`ticketTypes.${index}.dayWisePrices`) || [];
                                              const i2 = prices.findIndex((p) => p.dayIndex === dayIndex);
                                              if (i2 > -1) prices[i2].price = Number(e.target.value);
                                              else prices.push({ dayIndex, price: Number(e.target.value) });
                                              form.setValue(`ticketTypes.${index}.dayWisePrices`, prices);
                                            }}
                                            value={form.watch(`ticketTypes.${index}.dayWisePrices`)?.find((p) => p.dayIndex === dayIndex)?.price || ""}
                                          />
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* Vouchers */}
                  <Card className="border border-border/40 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base flex items-center gap-3 font-black">
                          <div className="p-2 bg-primary/10 rounded-xl"><Tag className="h-4 w-4 text-primary" /></div>
                          Vouchers
                        </CardTitle>
                        <Button type="button" variant="ghost" size="sm" onClick={() => appendVoucher({ code: "", discountType: "percentage", discountAmount: 10, isActive: true })}
                          className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary">
                          <Plus className="h-3 w-3" /> Add Voucher
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4 p-6">
                      {voucherFields.map((field, index) => (
                        <div key={field.id} className="grid md:grid-cols-4 gap-3 p-4 border border-border/30 rounded-xl bg-muted/10">
                          <FormField control={form.control} name={`vouchers.${index}.code`} render={({ field }) => (
                            <FormItem><FormControl><Input placeholder="CODE" className={cn(inputCls, "h-10 uppercase text-[11px] tracking-widest")} {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={form.control} name={`vouchers.${index}.discountType`} render={({ field }) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className={cn(inputCls, "h-10 text-[10px]")}><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>
                                  <SelectItem value="percentage">% Off</SelectItem>
                                  <SelectItem value="fixed">₹ Fixed</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vouchers.${index}.discountAmount`} render={({ field }) => (
                            <FormItem><FormControl><Input type="number" className={cn(inputCls, "h-10 text-[11px]")} {...field} /></FormControl></FormItem>
                          )} />
                          <Button type="button" variant="ghost" onClick={() => removeVoucher(index)} className="h-10 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                      {voucherFields.length === 0 && (
                        <p className="text-[11px] text-muted-foreground text-center py-4">No vouchers yet. Add one to offer discounts.</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex gap-4 pt-8">
              {currentStep > 1 && (
                <Button type="button" variant="outline" onClick={prevStep} className="h-14 flex-1 rounded-xl border-border/50 font-black uppercase tracking-widest text-[10px]">
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button type="button" onClick={nextStep} disabled={mutation.isPending || isUnapprovedManager}
                  className="h-14 flex-[2] rounded-xl font-black uppercase tracking-[0.3em] text-[10px] bg-primary text-primary-foreground hover:bg-primary/90">
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button type="button" onClick={handleFinalSubmit} disabled={mutation.isPending || isUnapprovedManager}
                  className="h-14 flex-[2] rounded-xl font-black uppercase tracking-[0.3em] text-[10px] bg-primary text-primary-foreground hover:bg-primary/90">
                  {mutation.isPending ? "Creating…" : "Create Event"}
                </Button>
              )}
              <Button type="button" variant="outline" onClick={() => navigate("/")} className="flex-1 h-14 rounded-xl border-border/50 font-black uppercase tracking-widest text-[10px]" disabled={mutation.isPending}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </main>

      <Footer />
    </div>
  );
};

export default CreateEventPage;
