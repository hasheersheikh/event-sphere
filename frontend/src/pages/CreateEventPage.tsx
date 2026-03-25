import { useState } from "react";
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
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Separator } from "@/components/ui/separator";
import api from "@/lib/api";

const eventSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  category: z.string().min(1, "Please select a category"),
  date: z.any().refine((val) => val instanceof Date, "Please select a date"),
  time: z.string().min(1, "Please select a time"),
  endTime: z.string().optional(),
  location: z.object({
    address: z.string().min(5, "Address must be at least 5 characters"),
    venueName: z.string().optional(),
  }),
  image: z.string().url("Please enter a valid image URL").or(z.literal("")),
  videoUrl: z.string().url("Please enter a valid YouTube URL").or(z.literal("")).optional(),
  reels: z.array(z.string().url("Please enter a valid Reels URL").or(z.literal(""))).optional(),
  ticketTypes: z
    .array(
      z.object({
        name: z.string().min(1, "Ticket name is required"),
        description: z.string().optional(),
        price: z.coerce.number().min(0, "Price cannot be negative"),
        capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
        isSoldOut: z.boolean().optional().default(false),
      }),
    )
    .min(1, "At least one ticket type is required"),
  vouchers: z
    .array(
      z.object({
        code: z.string().min(1, "Code is required"),
        discountType: z.enum(["percentage", "fixed"]),
        discountAmount: z.coerce.number().min(0),
        isActive: z.boolean().default(true),
      }),
    )
    .optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

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
      date: undefined as any,
      time: "",
      location: {
        address: "",
        venueName: "",
      },
      image: "",
      videoUrl: "",
      reels: [],
      ticketTypes: [{ name: "General Admission", price: 0, capacity: 100, isSoldOut: false }],
      vouchers: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "ticketTypes",
    control: form.control,
  });

  const { fields: voucherFields, append: appendVoucher, remove: removeVoucher } = useFieldArray({
    name: "vouchers",
    control: form.control,
  });

  const mutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      const payload = {
        ...values,
        date: values.date ? format(new Date(values.date), "yyyy-MM-dd") : "",
      };
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

  const nextStep = async () => {
    const fieldsToValidate: any[] = [];
    if (currentStep === 1) fieldsToValidate.push("title", "description", "category");
    if (currentStep === 2) fieldsToValidate.push("date", "time", "location.address");

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.error("Please resolve the issues in the current stage.");
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = (values: EventFormValues) => {
    // Only allow submission at the last step
    if (currentStep === 3) {
      mutation.mutate(values);
    }
  };

  const categories = ["Music", "Technology", "Business", "Entertainment", "Health", "Sports", "Education", "Other"];

  const handleUpload = () => {
    // @ts-ignore
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: "demo", 
        uploadPreset: "unsigned_preset",
        sources: ["local", "url", "camera"],
        multiple: false,
        cropping: true,
        croppingAspectRatio: 1.6,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === "success") {
          form.setValue("image", result.info.secure_url);
          toast.success("Visual asset captured.");
        }
      },
    );
    widget.open();
  };

  const steps = [
    { title: "Basics", icon: Info },
    { title: "Logistics", icon: CalendarIcon },
    { title: "Inventory", icon: Ticket },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <Navbar />

      <main className="flex-1 container max-w-4xl py-12 px-4 md:px-6 relative z-10">
        <header className="mb-12">
          <div className="flex items-center gap-3 mb-4 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
            <Plus className="h-4 w-4" />
            Event Creation
          </div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-none text-foreground">
            Create <span className="text-gradient">Event.</span>
          </h1>
          
          {/* Stepper Indicator */}
          <div className="mt-12 flex items-center justify-center max-w-2xl mx-auto">
            {steps.map((s, i) => {
              const StepIcon = s.icon;
              const isActive = currentStep === i + 1;
              const isCompleted = currentStep > i + 1;
              
              return (
                <div key={i} className="flex items-center group">
                  <div className="flex flex-col items-center gap-3">
                    <div className={cn(
                      "h-12 w-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2",
                      isActive ? "bg-primary border-primary shadow-[0_0_20px_rgba(16,185,129,0.3)] scale-110" : 
                      isCompleted ? "bg-primary/20 border-primary/40 text-primary" : "bg-card border-border text-muted-foreground"
                    )}>
                      <StepIcon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "")} />
                    </div>
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}>{s.title}</span>
                  </div>
                  {i < steps.length - 1 && (
                    <div className={cn(
                      "w-20 md:w-32 h-[2px] mx-2 md:mx-4 transition-all duration-700",
                      isCompleted ? "bg-primary" : "bg-border"
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {isUnapprovedManager && (
            <div className="mt-8 mx-auto max-w-2xl p-6 bg-orange-500/5 border border-orange-500/20 rounded-[2rem] flex items-center gap-6 glass-card">
              <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center flex-shrink-0 text-orange-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">Verification Pending</p>
                <p className="text-xs font-bold text-orange-500/80 mt-1">Audit incomplete. Public broadcasting is temporarily disabled.</p>
              </div>
            </div>
          )}
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
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-lg flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Info className="h-4 w-4 text-primary" />
                        </div>
                        General Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Event Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="e.g. Modern Web Summit 2024"
                                className="h-14 bg-background/50 border-white/10 rounded-xl font-bold text-base focus:ring-primary shadow-inner"
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
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Category</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger className="h-14 bg-background/50 border-white/10 rounded-xl font-black">
                                    <SelectValue placeholder="Select Category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent className="bg-popover border-border shadow-2xl">
                                  {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat} className="font-bold">{cat}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">Event Banner</FormLabel>
                          <button
                            type="button"
                            onClick={handleUpload}
                            className="w-full h-14 bg-background/50 border border-dashed border-white/20 rounded-xl flex items-center justify-center gap-3 hover:bg-primary/5 hover:border-primary/50 transition-all group"
                          >
                            <ImageIcon className="h-5 w-5 text-muted-foreground group-hover:text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground group-hover:text-primary">
                              {form.watch("image") ? "Change Image" : "Upload Image"}
                            </span>
                          </button>
                        </div>
                      </div>

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe the event..."
                                className="min-h-[120px] bg-background/50 border-white/10 rounded-xl font-bold text-sm resize-none shadow-inner"
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
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">YouTube Video URL</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="https://youtube.com/..."
                                  className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="space-y-4">
                          <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1 block">Promotional Reels (URLs)</FormLabel>
                          <div className="space-y-3">
                            {form.watch("reels")?.map((_, index) => (
                              <div key={index} className="flex gap-2">
                                <Input
                                  className="h-12 bg-background/50 border-white/10 rounded-xl font-black shadow-inner text-xs"
                                  placeholder="Asset URL"
                                  value={form.watch(`reels.${index}`)}
                                  onChange={(e) => {
                                    const newReels = [...(form.getValues("reels") || [])];
                                    newReels[index] = e.target.value;
                                    form.setValue("reels", newReels);
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    const newReels = [...(form.getValues("reels") || [])];
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
                              onClick={() => {
                                const currentReels = form.getValues("reels") || [];
                                form.setValue("reels", [...currentReels, ""]);
                              }}
                              className="w-full h-12 rounded-xl border-dashed border-white/20 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/5 hover:border-primary/50"
                            >
                              <Plus className="h-3 w-3" /> Add Reel URL
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
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <CardTitle className="text-lg flex items-center gap-3 font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <CalendarIcon className="h-4 w-4 text-primary" />
                        </div>
                        Date & Location
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-8 p-6">
                      <div className="grid md:grid-cols-3 gap-6">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Date</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      type="button"
                                      variant={"outline"}
                                      className={cn(
                                        "h-14 bg-background/50 border-white/10 rounded-xl font-black text-left px-4",
                                        !field.value && "text-muted-foreground"
                                      )}
                                    >
                                      {field.value ? format(field.value, "PPP") : <span>Select Date</span>}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 glass-card border-white/20" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={field.value}
                                    onSelect={field.onChange}
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="time"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Start Time</FormLabel>
                              <FormControl>
                                <Input type="time" className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="endTime"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">End Time</FormLabel>
                              <FormControl>
                                <Input type="time" className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator className="bg-white/5" />

                      <div className="grid md:grid-cols-2 gap-6">
                        <FormField
                          control={form.control}
                          name="location.venueName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Venue Name</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="e.g. Grand Plaza"
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
                              <FormLabel className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Address</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Full Address"
                                  className="h-14 bg-background/50 border-white/10 rounded-xl font-black shadow-inner"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {/* Stage 3: Inventory */}
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
                          onClick={() => append({ name: "", price: 0, capacity: 100, isSoldOut: false })}
                          className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary"
                        >
                          <Plus className="h-3 w-3" /> Add Tier
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      {fields.map((field, index) => (
                        <div key={field.id} className="p-6 border border-white/5 rounded-2xl bg-background/20 relative group">
                          <div className="flex justify-between items-center mb-6">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Ticket Tier {index + 1}</span>
                            {fields.length > 1 && (
                              <button type="button" onClick={() => remove(index)} className="text-muted-foreground hover:text-destructive transition-colors">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid md:grid-cols-3 gap-4">
                            <FormField control={form.control} name={`ticketTypes.${index}.name`} render={({field}) => (
                              <FormItem>
                                <FormLabel className="text-[9px] font-black uppercase">Name</FormLabel>
                                <FormControl><Input className="h-12 bg-background/40 border-white/5 rounded-lg font-bold text-xs" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name={`ticketTypes.${index}.price`} render={({field}) => (
                              <FormItem>
                                <FormLabel className="text-[9px] font-black uppercase">Price (₹)</FormLabel>
                                <FormControl><Input type="number" className="h-12 bg-background/40 border-white/5 rounded-lg font-black text-xs" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                            <FormField control={form.control} name={`ticketTypes.${index}.capacity`} render={({field}) => (
                              <FormItem>
                                <FormLabel className="text-[9px] font-black uppercase">Capacity</FormLabel>
                                <FormControl><Input type="number" className="h-12 bg-background/40 border-white/5 rounded-lg font-black text-xs" {...field} /></FormControl>
                                <FormMessage />
                              </FormItem>
                            )} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card className="border-none shadow-xl glass-card overflow-hidden">
                    <CardHeader className="pb-4 bg-muted/20 border-b">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-lg flex items-center gap-3 font-black text-foreground">
                          <div className="p-2 bg-primary/10 rounded-xl">
                            <Tag className="h-4 w-4 text-primary" />
                          </div>
                          Vouchers
                        </CardTitle>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => appendVoucher({ code: "", discountType: "percentage", discountAmount: 10, isActive: true })}
                          className="rounded-xl h-10 text-[9px] font-black uppercase tracking-[0.2em] gap-2 hover:bg-primary/10 text-primary"
                        >
                          <Plus className="h-3 w-3" /> Add Voucher
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-6 p-6">
                      {voucherFields.map((field, index) => (
                        <div key={field.id} className="grid md:grid-cols-4 gap-4 p-4 border border-white/5 rounded-xl bg-background/10">
                          <FormField control={form.control} name={`vouchers.${index}.code`} render={({field}) => (
                            <FormItem><FormControl><Input placeholder="CODE" className="uppercase h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px] tracking-widest" {...field} /></FormControl></FormItem>
                          )} />
                          <FormField control={form.control} name={`vouchers.${index}.discountType`} render={({field}) => (
                            <FormItem>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger className="h-10 bg-background/40 border-white/5 rounded-lg font-bold text-[10px]"><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent className="bg-popover border-border shadow-2xl">
                                  <SelectItem value="percentage">10%</SelectItem>
                                  <SelectItem value="fixed">₹ Fixed</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name={`vouchers.${index}.discountAmount`} render={({field}) => (
                            <FormItem><FormControl><Input type="number" className="h-10 bg-background/40 border-white/5 rounded-lg font-black text-[10px]" {...field} /></FormControl></FormItem>
                          )} />
                          <Button type="button" variant="ghost" onClick={() => removeVoucher(index)} className="h-10 text-destructive"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-8 relative z-20">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="h-14 flex-1 rounded-xl bg-background border-white/10 font-black uppercase tracking-widest text-[10px] hover:bg-muted transition-all"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
              )}
              {currentStep < 3 ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={mutation.isPending || isUnapprovedManager}
                  className="h-14 flex-[2] rounded-xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl bg-primary text-primary-foreground hover:scale-[1.02]"
                >
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={() => form.handleSubmit(onSubmit)()}
                  disabled={mutation.isPending || isUnapprovedManager}
                  className="h-14 flex-[2] rounded-xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-2xl bg-emerald-500 text-black hover:bg-emerald-400"
                >
                  {mutation.isPending ? "Creating..." : "Create Event"}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => navigate("/")}
                className="flex-1 h-14 rounded-xl border-white/10 bg-muted/20 font-black uppercase tracking-widest hover:bg-muted/40 transition-all hover:border-white/20 text-[10px]"
                disabled={mutation.isPending}
              >
                Abort
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
