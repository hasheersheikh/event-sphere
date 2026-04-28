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
  Clock,
  LayoutGrid,
  RefreshCw,
  CalendarDays,
  Layers,
  AlertCircle,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { USE_LOCAL_STORAGE, uploadImageToBackend } from "@/lib/localUpload";

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
import { CITIES } from "@/contexts/CityContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

// ─── Zod schema ─────────────────────────────────────────────────────────────

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  image: z.string().url("Please enter a valid image URL").or(z.literal("")),
  videoUrl: z.string().url("Please enter a valid YouTube URL").or(z.literal("")).optional(),
  reels: z.array(z.string().url("Please enter a valid Reels URL").or(z.literal(""))).optional(),
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
  city: z.string().optional(),
  location: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    venueName: z.string().optional(),
    googleMapUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  }),

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

// ─── Component ───────────────────────────────────────────────────────────────

const CreateEventPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);

  const isUnapprovedManager = user?.role === "event_manager" && !user?.isApproved;

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      image: "",
      videoUrl: "",
      reels: [],
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
      ticketTypes: [{ name: "General Admission", price: 0, capacity: 100, isSoldOut: false, isFullPass: false, dayWisePrices: [] }],
      vouchers: [],
    },
  });

  const scheduleType = form.watch("scheduleType");
  const recurrenceFreq = form.watch("recurrence.frequency");
  const recurrenceDays = form.watch("recurrence.daysOfWeek") || [];

  // Field arrays
  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({ name: "slots", control: form.control });
  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({ name: "days", control: form.control });
  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({ name: "ticketTypes", control: form.control });
  const { fields: voucherFields, append: appendVoucher, remove: removeVoucher } = useFieldArray({ name: "vouchers", control: form.control });

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
        if (values.recurrence?.endDate) {
          payload.recurrence = { ...values.recurrence, endDate: format(new Date(values.recurrence.endDate), "yyyy-MM-dd") };
        }
        delete payload.slots;
        delete payload.days;
      } else if (st === "multi_day") {
        const sortedDays = [...(values.days || [])].sort((a, b) => a.date.getTime() - b.date.getTime());
        payload.date = sortedDays[0]?.date ? format(new Date(sortedDays[0].date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        payload.time = sortedDays[0]?.startTime || "09:00";
        payload.days = sortedDays.map((d) => ({ ...d, date: format(new Date(d.date), "yyyy-MM-dd") }));
        delete payload.slots;
        delete payload.recurrence;
      }

      const { data } = await api.post("/events", payload);
      return data;
    },
    onSuccess: (data) => {
      toast.success("Event created successfully!");
      navigate(`/events/${data._id}/success`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Something went wrong.");
    },
  });

  // ── Step validation ────────────────────────────────────────────────────────
  const nextStep = async () => {
    const fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate.push("title", "description", "category");
    }
    if (currentStep === 2) {
      fieldsToValidate.push("location.address");
      if (scheduleType === "single") fieldsToValidate.push("date", "time");
      else if (scheduleType === "multi_slot") fieldsToValidate.push("date", "slots");
      else if (scheduleType === "recurring") fieldsToValidate.push("date", "time", "recurrence");
      else if (scheduleType === "multi_day") fieldsToValidate.push("days");
    }
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) setCurrentStep((p) => Math.min(p + 1, 3));
    else toast.error("Please resolve the issues in the current stage.");
  };

  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));
  const onSubmit = (values: EventFormValues) => { if (currentStep === 3) mutation.mutate(values); };

  const categories = ["Music", "Technology", "Business", "Entertainment", "Health", "Sports", "Education", "Other"];
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (USE_LOCAL_STORAGE) { bannerInputRef.current?.click(); return; }
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      { cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME, uploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET, sources: ["local", "url", "camera"], multiple: false, cropping: true, croppingAspectRatio: 1.6 },
      (error: any, result: any) => { if (!error && result && result.event === "success") { form.setValue("image", result.info.secure_url); toast.success("Image uploaded."); } }
    );
    widget.open();
  };

  const handleLocalBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try { const url = await uploadImageToBackend(file); form.setValue("image", url); toast.success("Image uploaded."); }
    catch { toast.error("Upload failed."); }
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
                  STEP 1 — Basics
              ═══════════════════════════════════════ */}
              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
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
                          <FormLabel className={labelCls}>Event Title</FormLabel>
                          <FormControl><Input placeholder="e.g. Modern Web Summit 2025" className={cn(inputCls, "h-14 text-base font-bold")} {...field} /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField control={form.control} name="category" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelCls}>Category</FormLabel>
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
                          <Label className={labelCls}>Event Banner</Label>
                          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleLocalBannerUpload} />
                          <button type="button" onClick={handleUpload} className="w-full h-12 bg-background/50 border border-dashed border-border/50 rounded-xl flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group">
                            <ImageIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                              {form.watch("image") ? "Change Image" : "Upload Image"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem>
                          <FormLabel className={labelCls}>Description</FormLabel>
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
                        
                        <FormField control={form.control} name="videoUrl" render={({ field }) => (
                          <FormItem>
                            <FormLabel className={labelCls}>Main Video URL (YouTube)</FormLabel>
                            <FormControl><Input placeholder="https://youtube.com/watch?v=..." className={inputCls} {...field} /></FormControl>
                            <FormMessage />
                          </FormItem>
                        )} />

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
                  STEP 2 — When & Where
              ═══════════════════════════════════════ */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
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
                                onClick={() => form.setValue("scheduleType", opt.type)}
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
                              <FormLabel className={labelCls}>Date</FormLabel>
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
                              <FormLabel className={labelCls}>Start Time</FormLabel>
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
                              <FormLabel className={labelCls}>Event Date</FormLabel>
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
                                <FormLabel className={labelCls}>Start Date</FormLabel>
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
                                <FormLabel className={labelCls}>Time</FormLabel>
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
                                  onClick={() => form.setValue("recurrence.frequency", freq)}
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
                                <FormLabel className={labelCls}>End Date (optional — leave blank for no end)</FormLabel>
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
                        </div>
                      )}

                      {/* ── Multi-Day ──────────────────────────────────── */}
                      {scheduleType === "multi_day" && (
                        <div className="space-y-5">
                          <p className="text-sm text-muted-foreground font-medium">
                            Pick any combination of dates — they don't need to be continuous.
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
                                disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                numberOfMonths={2}
                                className="rounded-xl"
                              />
                            </div>
                          </div>

                          {dayFields.length > 0 && (
                            <div className="space-y-3">
                              <p className={labelCls}>{dayFields.length} date{dayFields.length > 1 ? "s" : ""} selected — set times for each</p>
                              {dayFields
                                .slice()
                                .sort((a, b) => new Date(a.date as unknown as Date).getTime() - new Date(b.date as unknown as Date).getTime())
                                .map((field, index) => (
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
                                ))}
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
                        <FormItem>
                          <FormLabel className={labelCls}>City</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl><SelectTrigger className={inputCls}><SelectValue placeholder="Select city" /></SelectTrigger></FormControl>
                            <SelectContent>{CITIES.map((city) => (<SelectItem key={city} value={city}>{city}</SelectItem>))}</SelectContent>
                          </Select>
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
                            <FormLabel className={labelCls}>Address</FormLabel>
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
                </motion.div>
              )}

              {/* ═══════════════════════════════════════
                  STEP 3 — Tickets & Vouchers
              ═══════════════════════════════════════ */}
              {currentStep === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
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
                                  <FormLabel className={cn(labelCls, "text-[9px]")}>Tier Name</FormLabel>
                                  <FormControl><Input className={cn(inputCls, "h-11")} {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`ticketTypes.${index}.price`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(labelCls, "text-[9px]")}>Base Price (₹)</FormLabel>
                                  <FormControl><Input type="number" className={cn(inputCls, "h-11")} {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name={`ticketTypes.${index}.capacity`} render={({ field }) => (
                                <FormItem>
                                  <FormLabel className={cn(labelCls, "text-[9px]")}>Total Capacity</FormLabel>
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
                <Button type="button" onClick={() => form.handleSubmit(onSubmit)()} disabled={mutation.isPending || isUnapprovedManager}
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
