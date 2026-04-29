import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import * as z from "zod";
import {
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Ticket,
  Info,
  Image as ImageIcon,
  ArrowLeft,
  Tag,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  MapPin,
} from "lucide-react";
import { format, isSameDay } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { USE_LOCAL_STORAGE, uploadImageToBackend } from "@/lib/localUpload";
import {
  RefreshCw,
  CalendarDays,
  Layers,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";
import { CITIES } from "@/contexts/CityContext";

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  image: z.string().min(1, "Banner image is required").url("Please enter a valid image URL"),
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
  city: z.string().min(1, "City is required"),
  location: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    venueName: z.string().optional(),
    googleMapUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  }),

  coordinator: z.object({
    name: z.string().min(1, "Coordinator name is required"),
    phone: z.string().regex(/^\+91\d{10}$/, "Phone number must start with +91 and be 13 digits"),
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

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const { data: event, isLoading: isFetching } = useQuery({
    queryKey: ["event", id],
    queryFn: async () => {
      const { data } = await api.get(`/events/${id}`);
      if (data.date) {
        data.date = new Date(data.date);
      }
      return data;
    },
  });

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      scheduleType: "single",
      date: undefined,
      time: "",
      endTime: "",
      slots: [],
      recurrence: { frequency: "daily", daysOfWeek: [] },
      city: "",
      location: {
        address: "",
        venueName: "",
        googleMapUrl: "",
      },
      coordinator: {
        name: "",
        phone: "",
      },
      image: "",
      videoUrl: "",
      reels: [],
      days: [],
      ticketTypes: [],
      vouchers: [],
    },
  });

  const { fields: slotFields, append: appendSlot, remove: removeSlot } = useFieldArray({ name: "slots", control: form.control });
  const { fields: dayFields, append: appendDay, remove: removeDay } = useFieldArray({ name: "days", control: form.control });
  const { fields: ticketFields, append: appendTicket, remove: removeTicket } = useFieldArray({ name: "ticketTypes", control: form.control });
  const { fields: voucherFields, append: appendVoucher, remove: removeVoucher } = useFieldArray({ name: "vouchers", control: form.control });

  const scheduleType = form.watch("scheduleType");
  const recurrenceFreq = form.watch("recurrence.frequency");
  const recurrenceDays = form.watch("recurrence.daysOfWeek") || [];

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

  useEffect(() => {
    if (event) {
      form.reset({
        title: event.title,
        description: event.description,
        category: event.category,
        scheduleType: event.scheduleType || (event.isMultiDay ? "multi_day" : "single"),
        date: event.date,
        time: event.time,
        endTime: event.endTime || "",
        slots: event.slots || [],
        recurrence: event.recurrence || { frequency: "daily", daysOfWeek: [] },
        city: event.city || "",
        location: {
          address: event.location?.address || "",
          venueName: event.location?.venueName || "",
          googleMapUrl: event.location?.googleMapUrl || "",
        },
        coordinator: {
          name: event.coordinator?.name || "",
          phone: event.coordinator?.phone || "",
        },
        image: event.image || "",
        videoUrl: event.videoUrl || "",
        reels: event.reels || [],
        days: event.days?.map((d: any) => ({
          ...d,
          date: d.date ? new Date(d.date) : undefined
        })) || [],
        ticketTypes: event.ticketTypes || [],
        vouchers: event.vouchers || [],
        ageRestriction: event.ageRestriction || "All Ages",
      });
    }
  }, [event, form]);

  // Remove the duplicate ticketTypes/vouchers useFieldArray calls below if they exist





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
        const sortedDays = [...(values.days || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        payload.date = sortedDays[0]?.date ? format(new Date(sortedDays[0].date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        payload.time = sortedDays[0]?.startTime || "09:00";
        payload.days = sortedDays.map((d) => ({ ...d, date: format(new Date(d.date), "yyyy-MM-dd") }));
        delete payload.slots;
        delete payload.recurrence;
      }

      const { data } = await api.put(`/events/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Event successfully updated.");
      navigate(`/portal/manager/events/${id}/details`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Modification failed.");
    },
  });

  const nextStep = async () => {
    const fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate.push("title", "description", "category", "image", "ageRestriction");
    }
    if (currentStep === 2) {
      fieldsToValidate.push("location.address", "city", "coordinator.name", "coordinator.phone");
      if (scheduleType === "single") fieldsToValidate.push("date", "time");
      else if (scheduleType === "multi_slot") fieldsToValidate.push("date", "slots");
      else if (scheduleType === "recurring") fieldsToValidate.push("date", "time", "recurrence");
      else if (scheduleType === "multi_day") fieldsToValidate.push("days");
    }
    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 2 && scheduleType === "multi_slot" && hasSlotOverlap()) {
        toast.error("Please resolve time slot overlaps.");
        return;
      }
      setCurrentStep((p) => Math.min(p + 1, 3));
      window.scrollTo(0, 0);
    } else {
      toast.error("Please resolve the issues in the current stage.");
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = (values: EventFormValues) => {
    if (currentStep === 3) {
      mutation.mutate(values);
    }
  };

  const bannerInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = () => {
    if (USE_LOCAL_STORAGE) {
      bannerInputRef.current?.click();
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
        croppingAspectRatio: 1.6,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          form.setValue("image", result.info.secure_url);
          toast.success("New asset captured.");
        }
      },
    );
    widget.open();
  };

  const handleLocalBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadImageToBackend(file);
      form.setValue("image", url);
      toast.success("New asset captured.");
    } catch {
      toast.error("Upload failed.");
    }
    e.target.value = "";
  };

  if (isFetching) {
    return (
      <div className="py-20 text-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">
          Recovering Event Data...
        </p>
      </div>
    );
  }

  const categories = [
    "Music",
    "Technology",
    "Business",
    "Entertainment",
    "Health",
    "Sports",
    "Education",
    "Other",
  ];

  const steps = [
    { title: "Basics", icon: Info },
    { title: "Logistics", icon: CalendarIcon },
    { title: "Inventory", icon: Ticket },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />

      <main className="flex-1 container max-w-4xl py-8 px-3 md:px-4 relative z-10">
        <header className="mb-8">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors group mb-6"
          >
            <ArrowLeft className="h-3 w-3 transition-transform group-hover:-translate-x-1" />
            Back to Dashboard
          </button>

          <h1 className="text-2xl md:text-4xl font-black tracking-tighter leading-none text-foreground">
            Edit <span className="text-gradient">Event.</span>
          </h1>

          {/* Stepper Indicator */}
          <div className="mt-8 flex items-center justify-center max-w-2xl mx-auto">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = currentStep === i + 1;
              const isCompleted = currentStep > i + 1;

              return (
                <div key={i} className="flex items-center group">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 border-2",
                        isActive
                          ? "bg-primary border-primary shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-110"
                          : isCompleted
                            ? "bg-primary/20 border-primary/40 text-primary"
                            : "bg-card border-border text-muted-foreground",
                      )}
                    >
                      <StepIcon
                        className={cn(
                          "h-4 w-4",
                          isActive ? "text-primary-foreground" : "",
                        )}
                      />
                    </div>
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest",
                        isActive ? "text-primary" : "text-muted-foreground",
                      )}
                    >
                      {s.title}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "w-12 md:w-20 h-[2px] mx-2 md:mx-4 transition-all duration-700",
                        isCompleted ? "bg-primary" : "bg-border",
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </header>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <AnimatePresence mode="wait">
              {/* Stage 1: Basics */}
              {currentStep === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black text-foreground">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Info className="h-3.5 w-3.5 text-primary" />
                        </div>
                        General Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 p-5">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Event Title
                            </FormLabel>
                            <FormControl>
                              <Input
                                className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm focus:ring-primary shadow-inner"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Category
                              </FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger className="h-14 bg-background/50 border-white/10 rounded-xl font-black">
                                    <SelectValue placeholder="Select Category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-popover border-border shadow-2xl">
                                  {categories.map((cat) => (
                                    <SelectItem
                                      key={cat}
                                      value={cat}
                                      className="font-bold"
                                    >
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-3">
                          <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">
                            Event Banner
                          </FormLabel>
                          <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={handleLocalBannerUpload} />
                          <button
                            type="button"
                            onClick={handleUpload}
                            className="w-full h-11 bg-background/50 border border-dashed border-white/20 rounded-lg flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                          >
                            <ImageIcon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                              {form.watch("image")
                                ? "Change Image"
                                : "Upload Image"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Description
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                className="min-h-[100px] bg-background/50 border-white/10 rounded-lg font-bold text-xs resize-none shadow-inner"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="videoUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                YouTube Video URL
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm shadow-inner"
                                  placeholder="Link URL"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">
                            YouTube Shorts
                          </FormLabel>
                          <div className="space-y-3">
                            {form.watch("reels")?.map((_, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  className="h-12 bg-background/40 border-white/5 rounded-xl font-black shadow-inner text-xs"
                                  placeholder="https://youtube.com/shorts/..."
                                  value={form.watch(`reels.${index}`)}
                                  onChange={(e) => {
                                    const newReels = [
                                      ...(form.getValues("reels") || []),
                                    ];
                                    newReels[index] = e.target.value;
                                    form.setValue("reels", newReels);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  onClick={() => {
                                    const newReels = [
                                      ...(form.getValues("reels") || []),
                                    ];
                                    newReels.splice(index, 1);
                                    form.setValue("reels", newReels);
                                  }}
                                  className="hover:bg-destructive/10 hover:text-destructive h-12 w-12 rounded-xl"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                form.setValue("reels", [
                                  ...(form.getValues("reels") || []),
                                  "",
                                ])
                              }
                              className="w-full h-12 rounded-xl border-dashed border-white/20 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5 hover:border-primary/50"
                            >
                              <Plus className="h-3 w-3" /> Add YouTube Short
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Stage 2: Logistics */}
              {currentStep === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/20 border-b">
                      <CardTitle className="text-base flex items-center gap-3 font-black text-foreground">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <CalendarIcon className="h-3.5 w-3.5 text-primary" />
                        </div>
                        Date & Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-5">
                      <div className="space-y-8">
                        {/* ── Schedule type selector ─────────────────────── */}
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">Event Type</p>
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
                          <div className="grid md:grid-cols-3 gap-5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <FormField control={form.control} name="date" render={({ field }) => (
                              <FormItem className="flex flex-col">
                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button type="button" variant="outline" className={cn("h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm text-left px-3", !field.value && "text-muted-foreground")}>
                                        {field.value instanceof Date ? format(field.value, "PPP") : field.value ? format(new Date(field.value), "PPP") : "Select Date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
                                    <Calendar mode="single" selected={field.value instanceof Date ? field.value : field.value ? new Date(field.value) : undefined} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                  </PopoverContent>
                                </Popover>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="time" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time</FormLabel>
                                <FormControl><Input type="time" className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm shadow-inner" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name="endTime" render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</FormLabel>
                                <FormControl><Input type="time" className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm shadow-inner" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        )}

                        {/* ── Multi-Slot ─────────────────────────────────── */}
                        {scheduleType === "multi_slot" && (
                          <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <FormField control={form.control} name="date" render={({ field }) => (
                              <FormItem className="flex flex-col max-w-xs">
                                <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Event Date</FormLabel>
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button type="button" variant="outline" className={cn("h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm text-left px-3", !field.value && "text-muted-foreground")}>
                                        {field.value instanceof Date ? format(field.value, "PPP") : field.value ? format(new Date(field.value), "PPP") : "Select Date"}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
                                    <Calendar mode="single" selected={field.value instanceof Date ? field.value : field.value ? new Date(field.value) : undefined} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
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
                                <div key={slot.id} className="p-4 border border-white/5 rounded-xl bg-muted/10 space-y-3 glass-card">
                                  <div className="flex items-center justify-between">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Show {index + 1}</span>
                                    <button type="button" onClick={() => removeSlot(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <FormField control={form.control} name={`slots.${index}.startTime`} render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time</FormLabel>
                                        <FormControl><Input type="time" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold px-2" {...field} /></FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`slots.${index}.endTime`} render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</FormLabel>
                                        <FormControl><Input type="time" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold px-2" {...field} /></FormControl>
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`slots.${index}.label`} render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Label</FormLabel>
                                        <FormControl><Input placeholder="e.g. Evening" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold" {...field} /></FormControl>
                                      </FormItem>
                                    )} />
                                    <FormField control={form.control} name={`slots.${index}.capacity`} render={({ field }) => (
                                      <FormItem>
                                        <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Capacity</FormLabel>
                                        <FormControl><Input type="number" placeholder="100" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold" {...field} /></FormControl>
                                      </FormItem>
                                    )} />
                                  </div>
                                </div>
                              ))}
                              <Button type="button" variant="outline" onClick={() => appendSlot({ startTime: "09:00", endTime: "11:00", label: "", capacity: undefined })}
                                className="w-full h-11 rounded-xl border-dashed border-primary/30 text-[9px] font-black uppercase gap-2 hover:bg-primary/5 hover:border-primary">
                                <Plus className="h-3.5 w-3.5" /> Add Show Slot
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* ── Recurring ──────────────────────────────────── */}
                        {scheduleType === "recurring" && (
                          <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="grid md:grid-cols-3 gap-5">
                              <FormField control={form.control} name="date" render={({ field }) => (
                                <FormItem className="flex flex-col">
                                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Date</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button type="button" variant="outline" className={cn("h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm text-left px-3", !field.value && "text-muted-foreground")}>
                                          {field.value instanceof Date ? format(field.value, "PPP") : field.value ? format(new Date(field.value), "PPP") : "Select Date"}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
                                      <Calendar mode="single" selected={field.value instanceof Date ? field.value : field.value ? new Date(field.value) : undefined} onSelect={field.onChange} disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                    </PopoverContent>
                                  </Popover>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="time" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Time</FormLabel>
                                  <FormControl><Input type="time" className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm shadow-inner" {...field} /></FormControl>
                                  <FormMessage />
                                </FormItem>
                              )} />
                              <FormField control={form.control} name="endTime" render={({ field }) => (
                                <FormItem>
                                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</FormLabel>
                                  <FormControl><Input type="time" className="h-11 bg-background/50 border-white/10 rounded-lg font-black text-sm shadow-inner" {...field} /></FormControl>
                                </FormItem>
                              )} />
                            </div>

                            <div className="p-5 border border-white/5 rounded-xl bg-muted/10 space-y-4 glass-card">
                              <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Repeat Frequency</p>
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
                                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Repeat On</p>
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

                              <FormField control={form.control} name="recurrence.endDate" render={({ field }) => (
                                <FormItem className="flex flex-col max-w-xs">
                                  <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">End Date (optional)</FormLabel>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <FormControl>
                                        <Button type="button" variant="outline" className={cn("h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold text-left px-3", !field.value && "text-muted-foreground")}>
                                          {field.value ? format(new Date(field.value), "PPP") : "No end date"}
                                          <CalendarIcon className="ml-auto h-4 w-4 opacity-40" />
                                        </Button>
                                      </FormControl>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0 glass-card" align="start">
                                      <Calendar mode="single" selected={field.value ? new Date(field.value) : undefined}
                                        onSelect={(d) => field.onChange(d || null)}
                                        disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))} initialFocus />
                                    </PopoverContent>
                                  </Popover>
                                </FormItem>
                              )} />
                            </div>
                          </div>
                        )}

                        {/* ── Multi-Day ──────────────────────────────────── */}
                        {scheduleType === "multi_day" && (
                          <div className="space-y-5 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex justify-center">
                              <div className="border border-white/5 rounded-2xl overflow-hidden p-1 bg-muted/10 glass-card">
                                <Calendar
                                  mode="multiple"
                                  selected={dayFields.map((f) => f.date as unknown as Date).filter(Boolean)}
                                  onSelect={(dates: Date[] | undefined) => {
                                    const existing = form.getValues("days") || [];
                                    const newDates = dates || [];
                                    const merged = newDates.map((d) => {
                                      const found = existing.find((e) => e.date && isSameDay(new Date(e.date), d));
                                      return found || { date: d, startTime: "09:00", endTime: "17:00", title: "" };
                                    });
                                    form.setValue("days", merged);
                                  }}
                                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                                  numberOfMonths={1}
                                  className="rounded-xl"
                                />
                              </div>
                            </div>

                            <div className="space-y-3">
                              {dayFields
                                .slice()
                                .sort((a, b) => new Date(a.date as unknown as Date).getTime() - new Date(b.date as unknown as Date).getTime())
                                .map((field, index) => (
                                  <div key={field.id} className="p-4 border border-white/5 rounded-xl bg-muted/10 glass-card">
                                    <div className="flex items-center justify-between mb-3">
                                      <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                        {field.date ? format(new Date(field.date as unknown as Date), "EEE, MMM d") : `Day ${index + 1}`}
                                      </span>
                                    </div>
                                    <div className="grid md:grid-cols-4 gap-4">
                                      <div className="md:col-span-2">
                                        <FormField control={form.control} name={`days.${index}.title`} render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Day Title</FormLabel>
                                            <FormControl><Input placeholder="Keynote" className="h-10 bg-background/50 border-white/5 rounded-lg text-xs font-bold" {...field} /></FormControl>
                                          </FormItem>
                                        )} />
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 md:col-span-2">
                                        <FormField control={form.control} name={`days.${index}.startTime`} render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start</FormLabel>
                                            <FormControl><Input type="time" className="h-10 bg-background/50 border-white/5 rounded-lg text-[10px] font-bold px-2" {...field} /></FormControl>
                                          </FormItem>
                                        )} />
                                        <FormField control={form.control} name={`days.${index}.endTime`} render={({ field }) => (
                                          <FormItem>
                                            <FormLabel className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">End</FormLabel>
                                            <FormControl><Input type="time" className="h-10 bg-background/50 border-white/5 rounded-lg text-[10px] font-bold px-2" {...field} /></FormControl>
                                          </FormItem>
                                        )} />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <Separator className="bg-white/5" />

                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">City</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner">
                                  <SelectValue placeholder="Select city" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {CITIES.map((city) => (
                                  <SelectItem key={city} value={city}>{city}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="location.venueName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Venue Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="location.address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Address
                              </FormLabel>
                              <FormControl>
                                <Input
                                  className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="location.googleMapUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                              Google Maps Link (optional)
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="https://maps.app.goo.gl/... or https://www.google.com/maps/..."
                                className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner"
                                {...field}
                              />
                            </FormControl>
                            <p className="text-[10px] text-muted-foreground ml-1">Paste a Google Maps share link to show the exact pin on the event page.</p>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  <Card className="border border-border/40 shadow-sm bg-card">
                    <CardHeader className="pb-4 border-b border-border/30">
                      <CardTitle className="text-base flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl"><MapPin className="h-4 w-4 text-primary" /></div>
                        Coordinator Details (optional)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-5">
                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="coordinator.name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Coordinator Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. John Doe"
                                  className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="coordinator.phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                Contact Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+919876543210"
                                  className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner"
                                  {...field}
                                />
                              </FormControl>
                              <p className="text-[10px] text-muted-foreground ml-1">Must start with +91 followed by 10 digits (e.g., +919876543210)</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Stage 3: Inventory (Tickets) */}
              {currentStep === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-3 font-black text-foreground">
                          <div className="p-2 bg-primary/10 rounded-xl">
                            <Ticket className="h-4 w-4 text-primary" />
                          </div>
                          Tickets
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            appendTicket({
                              name: "",
                              price: 0,
                              capacity: 100,
                              isSoldOut: false,
                              isFullPass: false,
                            })
                          }
                          className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary"
                        >
                          <Plus className="h-3 w-3" /> Add Tier
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      {ticketFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="p-6 border border-white/5 rounded-2xl bg-background/20 relative group"
                        >
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">
                              Ticket Tier {index + 1}
                            </span>
                            {ticketFields.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeTicket(index)}
                                className="text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="space-y-6">
                            <div className="grid md:grid-cols-4 gap-4">
                              <FormField
                                control={form.control}
                                name={`ticketTypes.${index}.name`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Tier Name</FormLabel>
                                    <FormControl>
                                      <Input className="h-12 bg-background/40 border-white/5 rounded-xl font-bold text-xs" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`ticketTypes.${index}.price`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Base Cost (₹)</FormLabel>
                                    <FormControl>
                                      <Input type="number" className="h-12 bg-background/40 border-white/5 rounded-xl font-black text-xs" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`ticketTypes.${index}.capacity`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Total Capacity</FormLabel>
                                    <FormControl>
                                      <Input type="number" className="h-12 bg-background/40 border-white/5 rounded-xl font-black text-xs" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />
                              <FormField
                                control={form.control}
                                name={`ticketTypes.${index}.isSoldOut`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Status</FormLabel>
                                    <Select
                                      onValueChange={(v) => field.onChange(v === "true")}
                                      value={field.value ? "true" : "false"}
                                    >
                                      <FormControl>
                                        <SelectTrigger className="h-12 bg-background/40 border-white/5 rounded-xl font-bold text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent className="glass-card">
                                        <SelectItem value="false" className="text-xs font-bold uppercase tracking-widest">Active</SelectItem>
                                        <SelectItem value="true" className="text-xs font-bold uppercase tracking-widest text-destructive">Sold Out</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </FormItem>
                                )}
                              />
                            </div>

                            {scheduleType === "multi_day" && (
                              <div className="space-y-6 pt-6 border-t border-white/5 mt-4">
                                <div className="flex flex-wrap items-center gap-8">
                                  <FormField
                                    control={form.control}
                                    name={`ticketTypes.${index}.isFullPass`}
                                    render={({ field }) => (
                                      <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                                        <FormControl>
                                          <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            className="h-5 w-5 rounded-md border-primary/30"
                                          />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                          <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] cursor-pointer text-primary">
                                            Enable Full Pass
                                          </FormLabel>
                                        </div>
                                      </FormItem>
                                    )}
                                  />

                                  {form.watch(`ticketTypes.${index}.isFullPass`) && (
                                    <FormField
                                      control={form.control}
                                      name={`ticketTypes.${index}.fullPassPrice`}
                                      render={({ field }) => (
                                        <FormItem className="flex-1 max-w-[200px] animate-in fade-in slide-in-from-left-2 duration-300">
                                          <FormControl>
                                            <div className="relative">
                                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-primary">₹</span>
                                              <Input 
                                                type="number" 
                                                placeholder="Full Pass Cost" 
                                                className="h-10 pl-7 bg-primary/10 border-primary/20 rounded-xl font-black text-xs text-primary shadow-inner" 
                                                {...field} 
                                              />
                                            </div>
                                          </FormControl>
                                          <FormMessage />
                                        </FormItem>
                                      )}
                                    />
                                  )}
                                </div>

                                <div className="space-y-4">
                                  <div className="flex items-center gap-3">
                                    <LayoutGrid className="h-3 w-3 text-muted-foreground" />
                                    <Label className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground">Daily Rates Configuration</Label>
                                  </div>
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {dayFields.map((day, dayIndex) => (
                                      <div key={day.id} className="p-4 bg-background/40 border border-white/5 rounded-2xl space-y-3 glass-card hover:border-primary/20 transition-colors">
                                        <div className="flex flex-col gap-1">
                                          <span className="text-[8px] font-black uppercase tracking-widest text-primary/70">
                                            {day.date ? format(new Date(day.date), "MMM dd") : `Day ${dayIndex + 1}`}
                                          </span>
                                          <p className="text-[9px] font-bold truncate">
                                            {day.title || "Standard Entry"}
                                          </p>
                                        </div>
                                        <div className="relative">
                                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground/50">₹</span>
                                          <Input
                                            type="number"
                                            className="h-9 pl-6 bg-background/50 border-white/10 rounded-xl text-[10px] font-black shadow-inner"
                                            placeholder="Price"
                                            onChange={(e) => {
                                              const currentPrices = form.getValues(`ticketTypes.${index}.dayWisePrices`) || [];
                                              const existingIndex = currentPrices.findIndex(p => p.dayIndex === dayIndex);
                                              
                                              if (existingIndex > -1) {
                                                currentPrices[existingIndex].price = Number(e.target.value);
                                              } else {
                                                currentPrices.push({ dayIndex, price: Number(e.target.value) });
                                              }
                                              form.setValue(`ticketTypes.${index}.dayWisePrices`, currentPrices);
                                            }}
                                            value={form.watch(`ticketTypes.${index}.dayWisePrices`)?.find(p => p.dayIndex === dayIndex)?.price || ""}
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

                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-3 bg-muted/20 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base flex items-center gap-3 font-black text-foreground">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <Tag className="h-3.5 w-3.5 text-primary" />
                          </div>
                          Vouchers
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            appendVoucher({
                              code: "",
                              discountType: "percentage",
                              discountAmount: 10,
                              isActive: true,
                            })
                          }
                          className="rounded-lg h-9 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary"
                        >
                          <Plus className="h-3 w-3" /> Add Voucher
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-5 p-5">
                      {voucherFields.map((field, index) => (
                        <div
                          key={field.id}
                          className="grid md:grid-cols-4 gap-4 p-4 border border-white/5 rounded-xl bg-background/10"
                        >
                          <FormField
                            control={form.control}
                            name={`vouchers.${index}.code`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    className="uppercase h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px] tracking-widest"
                                    placeholder="CODE"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`vouchers.${index}.discountType`}
                            render={({ field }) => (
                              <FormItem>
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger className="h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px]">
                                      <SelectValue />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="glass-card">
                                    <SelectItem value="percentage">
                                      Percentage (%)
                                    </SelectItem>
                                    <SelectItem value="fixed">
                                      Fixed (₹)
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`vouchers.${index}.discountAmount`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input
                                    type="number"
                                    className="h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px]"
                                    {...field}
                                  />
                                </FormControl>
                              </FormItem>
                            )}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => removeVoucher(index)}
                            className="h-10 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 relative z-20">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-10 flex-1 rounded-lg bg-background border-white/10 font-black uppercase tracking-widest text-[9px] hover:bg-muted transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={mutation.isPending}
                  className="h-10 flex-[2] rounded-lg font-black uppercase tracking-[0.3em] text-[9px] transition-all shadow-2xl bg-primary text-primary-foreground"
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => form.handleSubmit(onSubmit)()}
                  disabled={mutation.isPending}
                  className="h-10 flex-[2] rounded-lg font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  {mutation.isPending ? "Updating..." : "Update Event"}
                </Button>
              )}
            </div>
          </form>
        </Form>
      </main>
    </div>
  );
};

export default EditEventPage;
