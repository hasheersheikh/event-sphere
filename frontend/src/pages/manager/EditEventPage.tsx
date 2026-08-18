import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Info,
  Calendar as CalendarIcon,
  Ticket,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Stepper } from "@/components/shared/Stepper";
import { EditEventBasicsStep } from "@/components/events/EditEventBasicsStep";
import { EditEventLogisticsStep } from "@/components/events/EditEventLogisticsStep";
import { EditEventInventoryStep } from "@/components/events/EditEventInventoryStep";
import {
  eventSchema,
  STEP_FIELDS,
  flattenErrors,
  hasSlotOverlap,
  stepHasErrors,
  type EventFormValues,
} from "@/lib/eventFormSchema";
import api from "@/lib/api";

const EditEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const formInitialized = useRef(false);

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
    shouldUnregister: false,
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
      offlineTicketsAvailable: false,
      coordinator: {
        name: "",
        phone: "",
      },
      image: "",
      videoUrl: "",
      eventVideo: "",
      reels: [],
      artist: { name: "", instagramHandle: "", profileImage: "" },
      days: [],
      ticketTypes: [],
      vouchers: [],
      lineup: [],
    },
  });

  const scheduleType = form.watch("scheduleType");

  // NOTE: array counts for step-navigation validation are read via
  // form.getValues() at click time. Registering useFieldArray here for the
  // same names as the step components creates a second RHF field-array
  // instance that desyncs (parent copy stays empty), which used to trip the
  // "Please add at least one time slot" guard even with slots added.

  useEffect(() => {
    if (event && !formInitialized.current) {
      formInitialized.current = true;
      form.reset({
        title: event.title,
        description: event.description,
        category: event.category,
        scheduleType: event.scheduleType || (event.isMultiDay ? "multi_day" : "single"),
        date: event.date,
        time: event.time,
        endTime: event.endTime || "",
        slots: event.slots || [],
        // Always supply frequency — old events may have a recurrence object stored
        // without frequency (e.g. multi_slot events). If frequency is missing, default to "daily"
        // so the enum validator never fires "Required" on a non-recurring event.
        recurrence: {
          frequency: event.recurrence?.frequency || "daily",
          daysOfWeek: event.recurrence?.daysOfWeek || [],
          endDate: event.recurrence?.endDate || undefined,
        },
        city: event.city || "",
        location: {
          address: event.location?.address || "",
          venueName: event.location?.venueName || "",
          googleMapUrl: event.location?.googleMapUrl || "",
        },
        offlineTicketsAvailable: event.offlineTicketsAvailable || false,
        coordinator: {
          name: event.coordinator?.name || "",
          phone: event.coordinator?.phone || "",
        },
        image: event.image || "",
        videoUrl: event.videoUrl || "",
        eventVideo: (event as any).eventVideo || "",
        reels: event.reels || [],
        artist: {
          name: event.artist?.name || "",
          instagramHandle: event.artist?.instagramHandle || "",
          profileImage: event.artist?.profileImage || "",
        },
        days: event.days?.map((d: any) => ({
          ...d,
          date: d.date ? new Date(d.date) : undefined
        })) || [],
        ticketTypes: event.ticketTypes || [],
        vouchers: event.vouchers || [],
        // Normalise lineup — undefined fields from MongoDB become "" to avoid bare "Required" Zod errors
        lineup: (event.lineup || []).map((l: any) => ({
          name: l.name ?? "",
          role: l.role ?? "",
          instagramUrl: l.instagramUrl ?? "",
          image: l.image ?? "",
        })),
        ageRestriction: event.ageRestriction || "All Ages",
      });
    }
  }, [event]); // eslint-disable-line react-hooks/exhaustive-deps

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
        const sortedDays = [...(values.days || [])].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        payload.date = sortedDays[0]?.date ? format(new Date(sortedDays[0].date), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
        payload.time = sortedDays[0]?.startTime || "09:00";
        payload.days = sortedDays.map((d) => ({ ...d, date: format(new Date(d.date), "yyyy-MM-dd") }));
        delete payload.slots;
        delete payload.recurrence;
      }

      console.group("🚀 EditEvent — API payload");
      console.groupEnd();

      const { data } = await api.put(`/events/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      toast.success("Event successfully updated.");
      if (user?.role === "admin") {
        navigate(`/portal/admin/events/${id}`);
      } else {
        navigate(`/portal/manager/events/${id}/details`);
      }
    },
    onError: (error: any) => {
      console.group("❌ EditEvent — API error");
      console.groupEnd();
      toast.error(error.response?.data?.message || "Modification failed.");
    },
  });

  const nextStep = async () => {
    const fieldsToValidate: any[] = [];
    if (currentStep === 1) {
      fieldsToValidate.push("title", "description", "category", "image", "ageRestriction");
      (form.getValues("lineup") || []).forEach((_, i) => fieldsToValidate.push(`lineup.${i}.name`));
    }
    if (currentStep === 2) {
      fieldsToValidate.push("location.address", "city");
      if (scheduleType === "single") fieldsToValidate.push("date", "time");
      else if (scheduleType === "multi_slot") fieldsToValidate.push("date");
      else if (scheduleType === "recurring") fieldsToValidate.push("date", "time");
      else if (scheduleType === "multi_day") fieldsToValidate.push("days");
      const coordPhone = form.getValues("coordinator.phone");
      if (coordPhone) fieldsToValidate.push("coordinator.phone");
    }
    const isValid = await form.trigger(fieldsToValidate as any);
    if (isValid) {
      if (currentStep === 2) {
        if (scheduleType === "multi_slot") {
          if ((form.getValues("slots") || []).length === 0) { toast.error("Please add at least one time slot."); return; }
          if (hasSlotOverlap(form.getValues("slots") || [])) { toast.error("Please resolve time slot overlaps."); return; }
        }
        if (scheduleType === "multi_day" && (form.getValues("days") || []).length === 0) {
          toast.error("Please select at least one day on the calendar."); return;
        }
        if (scheduleType === "recurring") {
          const freq = form.getValues("recurrence.frequency");
          if (freq === "weekly" && (form.getValues("recurrence.daysOfWeek") || []).length === 0) {
            toast.error("Please select at least one day of the week for the recurring event."); return;
          }
        }
      }
      setCurrentStep((p) => Math.min(p + 1, 3));
      window.scrollTo(0, 0);
    } else {
      toast.error("Please fix the highlighted fields before continuing.");
    }
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const onSubmit = (values: EventFormValues) => {
    if (currentStep === 3) mutation.mutate(values);
  };

  const handleFinalSubmit = async () => {
    if ((form.getValues("ticketTypes") || []).length === 0) {
      toast.error("Please add at least one ticket type before saving.");
      return;
    }
    const isValid = await form.trigger();

    console.group("🔍 EditEvent — handleFinalSubmit");
    console.groupEnd();

    if (!isValid) {
      const errors = form.formState.errors;
      for (let step = 1; step <= 3; step++) {
        const stepFieldKeys = STEP_FIELDS[step];
        if (stepFieldKeys.some((k) => errors[k as keyof typeof errors])) {
          setCurrentStep(step); window.scrollTo(0, 0);
          const stepName = ["Basics", "Logistics", "Inventory"][step - 1];
          toast.error(`Step ${step} (${stepName}): please fix the highlighted fields.`);
          return;
        }
      }
      toast.error("Please fix all errors before submitting.");
      return;
    }
    form.handleSubmit(onSubmit)();
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

  const steps = [
    { title: "Basics", icon: Info },
    { title: "Logistics", icon: CalendarIcon },
    { title: "Inventory", icon: Ticket },
  ];

  // Read formState.errors synchronously here (not lazily inside Stepper's
  // callback) so react-hook-form's proxy correctly registers the subscription.
  const stepErrorFlags = [1, 2, 3].map((n) => stepHasErrors(form.formState.errors, STEP_FIELDS[n]));

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

          <Stepper steps={steps} currentStep={currentStep} hasError={(i) => stepErrorFlags[i]} />

          <p className="mt-3 text-[10px] text-muted-foreground font-medium">
            Fields marked <span className="text-destructive font-black">*</span> are required
          </p>
        </header>

        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 1 && <EditEventBasicsStep />}
              {currentStep === 2 && <EditEventLogisticsStep />}
              {currentStep === 3 && <EditEventInventoryStep />}
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
                  onClick={handleFinalSubmit}
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
