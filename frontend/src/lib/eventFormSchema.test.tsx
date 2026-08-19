// Regression guard for the multi-slot "Please add at least one time slot" bug.
// Root cause: CreateEventPage/EditEventPage registered their own
// useFieldArray for the same names ("slots", "days", "lineup",
// "ticketTypes") as the step components. With react-hook-form 7.61, a
// second field-array instance on the same control does not observe appends
// made through the first — the page-level copy stays empty and the step
// guard rejected valid forms. The pages now read counts via
// form.getValues() instead, which this test proves stays in sync.
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useForm, useFormContext, useFieldArray, FormProvider, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, type EventFormValues } from "./eventFormSchema";

// ─── Schedule-rule validation (all four schedule types) ─────────────────────
const validBase = {
  title: "Test Event Title",
  description: "A description that is definitely longer than twenty characters",
  category: "Music",
  image: "https://example.com/banner.jpg",
  city: "Mumbai",
  location: { address: "123 Some Street", venueName: "", googleMapUrl: "" },
  ticketTypes: [{ name: "General", price: 100, capacity: 10 }],
};

const issuePaths = (r: ReturnType<typeof eventSchema.safeParse>) =>
  r.success ? [] : r.error.issues.map((i) => i.path.join("."));

describe("schedule-type validation rules", () => {
  it("single without date and time is rejected on both", () => {
    const r = eventSchema.safeParse({ ...validBase, scheduleType: "single", date: undefined, time: "" });
    expect(r.success).toBe(false);
    expect(issuePaths(r)).toContain("date");
    expect(issuePaths(r)).toContain("time");
  });

  it("single with date and time passes", () => {
    const r = eventSchema.safeParse({ ...validBase, scheduleType: "single", date: new Date(), time: "18:00" });
    expect(r.success).toBe(true);
  });

  it("multi_slot requires a date and at least one slot", () => {
    const noSlots = eventSchema.safeParse({ ...validBase, scheduleType: "multi_slot", date: new Date(), time: "" });
    expect(issuePaths(noSlots)).toContain("slots");
    const noDate = eventSchema.safeParse({
      ...validBase, scheduleType: "multi_slot", date: undefined,
      slots: [{ startTime: "10:00", endTime: "12:00", label: "", capacity: undefined }],
    });
    expect(issuePaths(noDate)).toContain("date");
    const ok = eventSchema.safeParse({
      ...validBase, scheduleType: "multi_slot", date: new Date(),
      slots: [{ startTime: "10:00", endTime: "12:00", label: "", capacity: undefined }],
    });
    expect(ok.success).toBe(true);
  });

  it("multi_day needs no base date but requires at least one day", () => {
    const noDays = eventSchema.safeParse({ ...validBase, scheduleType: "multi_day", date: undefined, days: [] });
    expect(issuePaths(noDays)).toContain("days");
    const ok = eventSchema.safeParse({
      ...validBase, scheduleType: "multi_day", date: undefined,
      days: [{ date: new Date(), startTime: "09:00", endTime: "17:00", title: "" }],
    });
    expect(ok.success).toBe(true);
  });

  it("recurring weekly requires at least one day of week", () => {
    const r = eventSchema.safeParse({
      ...validBase, scheduleType: "recurring", date: new Date(), time: "10:00",
      recurrence: { frequency: "weekly", daysOfWeek: [] },
    });
    expect(issuePaths(r)).toContain("recurrence.daysOfWeek");
  });

  it("recurring daily passes with date and time", () => {
    const r = eventSchema.safeParse({
      ...validBase, scheduleType: "recurring", date: new Date(), time: "10:00",
      recurrence: { frequency: "daily", daysOfWeek: [] },
    });
    expect(r.success).toBe(true);
  });

  it("recurring endDate before start date is rejected", () => {
    const r = eventSchema.safeParse({
      ...validBase, scheduleType: "recurring", date: new Date(2030, 5, 15), time: "10:00",
      recurrence: { frequency: "daily", daysOfWeek: [], endDate: new Date(2030, 5, 10) },
    });
    expect(issuePaths(r)).toContain("recurrence.endDate");
  });

  it("offline tickets require a coordinator phone", () => {
    const r = eventSchema.safeParse({
      ...validBase, scheduleType: "single", date: new Date(), time: "18:00",
      offlineTicketsAvailable: true, coordinator: { name: "John", phone: "" },
    });
    expect(issuePaths(r)).toContain("coordinator.phone");
  });

  it("cleared capacity input ('') is treated as unset, 0 is rejected", () => {
    const cleared = eventSchema.safeParse({
      ...validBase, scheduleType: "multi_slot", date: new Date(),
      slots: [{ startTime: "10:00", endTime: "12:00", label: "", capacity: "" as unknown as number }],
    });
    expect(cleared.success).toBe(true);
    const zero = eventSchema.safeParse({
      ...validBase, scheduleType: "multi_slot", date: new Date(),
      slots: [{ startTime: "10:00", endTime: "12:00", label: "", capacity: 0 }],
    });
    expect(issuePaths(zero).some((p) => p.startsWith("slots.0.capacity"))).toBe(true);
  });
});

type Values = { slots: { startTime: string; endTime?: string; label?: string }[] };

// Mirrors CreateEventScheduleStep — owns the only useFieldArray for "slots"
function StepComponent() {
  const form = useFormContext<Values>();
  const { fields, append } = useFieldArray({ name: "slots", control: form.control });
  return (
    <div>
      <div data-testid="child-count">{fields.length}</div>
      <button onClick={() => append({ startTime: "09:00", endTime: "11:00", label: "" })}>add</button>
    </div>
  );
}

let readSlots: (() => Values["slots"]) | null = null;

// Mirrors the page-level guard source: form.getValues("slots")
function Page() {
  const form = useForm<Values>({ defaultValues: { slots: [] } });
  readSlots = () => form.getValues("slots") || [];
  return (
    <FormProvider {...form}>
      <StepComponent />
    </FormProvider>
  );
}

describe("multi-slot step guard", () => {
  it("slot count read via getValues reflects slots added in the step component", () => {
    render(<Page />);
    fireEvent.click(screen.getByText("add"));
    fireEvent.click(screen.getByText("add"));
    expect(screen.getByTestId("child-count").textContent).toBe("2");
    expect(readSlots!().length).toBe(2);
    expect(readSlots!()[1].startTime).toBe("09:00");
  });
});

// ─── zodResolver wiring — trigger() must surface the cross-field rules ───────
describe("step-2 trigger wiring", () => {
  it('trigger("date") fails for a single event with no date', async () => {
    let formRef: UseFormReturn<EventFormValues> | null = null;
    function Harness() {
      const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: { ...validBase, scheduleType: "single", date: undefined, time: "18:00" },
      });
      formRef = form;
      return null;
    }
    render(<Harness />);
    expect(await formRef!.trigger("date")).toBe(false);
  });

  it('trigger("slots") fails for a multi_slot event with no slots', async () => {
    let formRef: UseFormReturn<EventFormValues> | null = null;
    function Harness() {
      const form = useForm<EventFormValues>({
        resolver: zodResolver(eventSchema),
        defaultValues: { ...validBase, scheduleType: "multi_slot", date: new Date(), slots: [] },
      });
      formRef = form;
      return null;
    }
    render(<Harness />);
    expect(await formRef!.trigger("slots")).toBe(false);
  });
});
