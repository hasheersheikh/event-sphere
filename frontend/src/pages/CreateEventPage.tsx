import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import {
  Plus,
  Info,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Ticket,
  Calendar as CalendarIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Stepper } from "@/components/shared/Stepper";
import { CreateEventBasicsStep } from "@/components/events/CreateEventBasicsStep";
import { CreateEventScheduleStep } from "@/components/events/CreateEventScheduleStep";
import { CreateEventTicketsStep } from "@/components/events/CreateEventTicketsStep";
import {
  eventSchema,
  STEP_FIELDS,
  flattenErrors,
  hasSlotOverlap,
  stepHasErrors,
  type EventFormValues,
} from "@/lib/eventFormSchema";
import api from "@/lib/api";
import { resetSessionUploads, getSessionUploads, deleteUnusedUploads, collectEventMediaUrls } from "@/lib/uploadSession";

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

  // ── Orphaned upload cleanup ────────────────────────────────────────────────
  // Media uploaded at step 1 belongs to no event until this form is submitted.
  // If the wizard is abandoned (route change, cancel, back, refresh, close),
  // ask the backend to delete everything uploaded in this session — it
  // verifies ownership and that nothing references the files before removing.
  const submittedRef = useRef(false);
  useEffect(() => {
    resetSessionUploads();
    const cleanupAbandonedUploads = () => {
      if (submittedRef.current) return;
      deleteUnusedUploads(getSessionUploads());
    };
    // pagehide covers refresh/close, where React unmount never runs
    window.addEventListener("pagehide", cleanupAbandonedUploads);
    return () => {
      window.removeEventListener("pagehide", cleanupAbandonedUploads);
      cleanupAbandonedUploads();
    };
  }, []);

  // NOTE: array counts for step-navigation validation are read via
  // form.getValues() at click time. Registering useFieldArray here for the
  // same names as the step components creates a second RHF field-array
  // instance that desyncs (parent copy stays empty), which used to trip the
  // "Please add at least one time slot" guard even with slots added.

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
      console.groupEnd();

      const { data } = await api.post("/events", payload);
      return data;
    },
    onSuccess: (data, values) => {
      submittedRef.current = true;
      // Uploads made this session that the created event doesn't reference
      // (e.g. a banner that was uploaded, then replaced) are orphans too.
      const used = collectEventMediaUrls(values);
      deleteUnusedUploads(getSessionUploads().filter((u) => !used.includes(u)));
      toast.success("Event created successfully!");
      navigate(`/events/${data._id}/success`);
    },
    onError: (error: any) => {
      console.group("❌ CreateEvent — API error");
      console.groupEnd();
      toast.error(error.response?.data?.message || "Something went wrong.");
    },
  });

  // ── Step validation ────────────────────────────────────────────────────────
  const nextStep = async () => {
    const fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate.push("title", "description", "category", "image", "ageRestriction");
      (form.getValues("lineup") || []).forEach((_, i) => fieldsToValidate.push(`lineup.${i}.name`));
    }
    if (currentStep === 2) {
      fieldsToValidate.push("location.address", "city");
      if (scheduleType === "single") fieldsToValidate.push("date", "time");
      else if (scheduleType === "multi_slot") fieldsToValidate.push("date", "slots");
      else if (scheduleType === "recurring") {
        fieldsToValidate.push("date", "time");
        if ((form.getValues("slots") || []).length > 0) fieldsToValidate.push("slots");
      }
      else if (scheduleType === "multi_day") fieldsToValidate.push("days");
      if (form.getValues("offlineTicketsAvailable")) fieldsToValidate.push("coordinator.phone");
    }
    const isValid = await form.trigger(fieldsToValidate);

    console.group(`🔍 CreateEvent — nextStep (step ${currentStep} → ${currentStep + 1})`);
    if (!isValid) {
    }
    console.groupEnd();

    if (isValid) {
      if (currentStep === 2) {
        if (scheduleType === "multi_slot") {
          if ((form.getValues("slots") || []).length === 0) { toast.error("Please add at least one time slot."); return; }
          if (hasSlotOverlap(form.getValues("slots") || [])) { toast.error("Please resolve time slot overlaps."); return; }
        }
        if (scheduleType === "recurring" && hasSlotOverlap(form.getValues("slots") || [])) {
          toast.error("Please resolve time slot overlaps."); return;
        }
        if (scheduleType === "recurring") {
          const freq = form.getValues("recurrence.frequency");
          if (freq === "weekly" && (form.getValues("recurrence.daysOfWeek") || []).length === 0) {
            toast.error("Please select at least one day of the week for the recurring event."); return;
          }
        }
        if (scheduleType === "multi_day" && (form.getValues("days") || []).length === 0) {
          toast.error("Please select at least one event day."); return;
        }
      }
      setCurrentStep((p) => Math.min(p + 1, 3));
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fix the highlighted fields before continuing.");
    }
  };

  const prevStep = () => setCurrentStep((p) => Math.max(p - 1, 1));
  const onSubmit = (values: EventFormValues) => { mutation.mutate(values); };

  const handleFinalSubmit = async () => {
    const isValid = await form.trigger();

    console.group("🔍 CreateEvent — handleFinalSubmit");
    console.groupEnd();

    if (!isValid) {
      const errors = form.formState.errors;
      for (let step = 1; step <= 3; step++) {
        const keys = STEP_FIELDS[step];
        if (keys.some((k) => errors[k as keyof typeof errors])) {
          setCurrentStep(step); window.scrollTo(0, 0);
          const stepName = ["Basics", "When & Where", "Tickets"][step - 1];
          toast.error(`Step ${step} (${stepName}): please fix the highlighted fields.`);
          return;
        }
      }
      toast.error("Please fix all errors before submitting.");
      return;
    }
    form.handleSubmit(onSubmit)();
  };

  const steps = [
    { title: "Basics", icon: Info },
    { title: "When & Where", icon: CalendarIcon },
    { title: "Tickets", icon: Ticket },
  ];

  // Read formState.errors synchronously here (not lazily inside Stepper's
  // callback) so react-hook-form's proxy correctly registers the subscription.
  const stepErrorFlags = [1, 2, 3].map((n) => stepHasErrors(form.formState.errors, STEP_FIELDS[n]));

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

          <Stepper steps={steps} currentStep={currentStep} hasError={(i) => stepErrorFlags[i]} />

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
              {currentStep === 1 && <CreateEventBasicsStep />}
              {currentStep === 2 && <CreateEventScheduleStep />}
              {currentStep === 3 && <CreateEventTicketsStep />}
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
