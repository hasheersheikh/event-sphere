import * as z from "zod";
import { Calendar as CalendarIcon, RefreshCw, CalendarDays, Layers } from "lucide-react";
import type { FieldErrors } from "react-hook-form";

// ─── Zod schema ─────────────────────────────────────────────────────────────
// Shared by CreateEventPage and EditEventPage — both forms operate on the
// same shape. `image` is validated with .url() since it always comes from
// the upload flow (never a bare non-URL string) on either page.

export const eventSchemaBase = z.object({
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
    // Cleared number inputs yield "" — coerce that to undefined instead of
    // failing min(1) with an error the slot UIs never displayed.
    capacity: z.preprocess(
      (v) => (v === "" || v === null ? undefined : v),
      z.coerce.number().min(1, "Capacity must be at least 1").optional()
    ),
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

// ─── Schedule-type cross-field rules ────────────────────────────────────────
// `date` stays z.any() (Date object on create, ISO string from the API on
// edit) and `time` a plain string, so their required-ness can't be expressed
// per-field — it depends on scheduleType. These rules previously lived only
// in scattered page guards (or nowhere), letting single/recurring events
// through with no date (silently defaulted to today) or no time (00:00).
const scheduleRules = (val: z.infer<typeof eventSchemaBase>, ctx: z.RefinementCtx) => {
  const st = val.scheduleType;

  // multi_day derives its date from days[]; every other type needs one.
  if (st !== "multi_day" && !val.date) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["date"], message: "Date is required" });
  }

  if (st === "single" || st === "recurring") {
    if (!val.time) ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["time"], message: "Start time is required" });
  }

  if (st === "multi_slot" && (val.slots?.length ?? 0) === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["slots"], message: "Add at least one show slot" });
  }

  if (st === "multi_day" && (val.days?.length ?? 0) === 0) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["days"], message: "Select at least one event day" });
  }

  if (st === "recurring") {
    if (val.recurrence?.frequency === "weekly" && (val.recurrence.daysOfWeek?.length ?? 0) === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["recurrence", "daysOfWeek"], message: "Select at least one day of the week" });
    }
    if (val.recurrence?.endDate && val.date) {
      const end = new Date(val.recurrence.endDate);
      const start = new Date(val.date);
      if (!isNaN(end.getTime()) && !isNaN(start.getTime())) {
        // compare at day granularity — same day is fine
        const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate()).getTime();
        const startDay = new Date(start.getFullYear(), start.getMonth(), start.getDate()).getTime();
        if (endDay < startDay) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["recurrence", "endDate"], message: "End date cannot be before the start date" });
        }
      }
    }
  }

  // Offline tickets expose a "Call Coordinator" CTA — a phone number is
  // essential for it to work.
  if (val.offlineTicketsAvailable && !val.coordinator?.phone) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["coordinator", "phone"], message: "Coordinator number is required for offline tickets" });
  }
};

export const eventSchema = eventSchemaBase.superRefine(scheduleRules);

export type EventFormValues = z.infer<typeof eventSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

export const WEEK_DAYS = [
  { label: "Sun", value: 0 },
  { label: "Mon", value: 1 },
  { label: "Tue", value: 2 },
  { label: "Wed", value: 3 },
  { label: "Thu", value: 4 },
  { label: "Fri", value: 5 },
  { label: "Sat", value: 6 },
];

export const SCHEDULE_TYPES = [
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

export const STEP_FIELDS: Record<number, string[]> = {
  1: ["title", "description", "category", "image", "ageRestriction", "lineup", "artist", "videoUrl", "eventVideo", "reels"],
  2: ["location", "city", "date", "time", "endTime", "slots", "days", "recurrence", "coordinator", "offlineTicketsAvailable"],
  3: ["ticketTypes", "vouchers"],
};

export const EVENT_CATEGORIES = ["Music", "Technology", "Business", "Entertainment", "Health", "Sports", "Education", "Exhibition", "Other"];

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const flattenErrors = (errors: any, path = ""): { field: string; message: string }[] => {
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

/** Pairwise overlap check for a list of time slots (missing start/end defaults keep the comparison well-defined). */
export const hasSlotOverlap = (slots: { startTime?: string; endTime?: string }[]): boolean => {
  for (let i = 0; i < slots.length; i++) {
    for (let j = i + 1; j < slots.length; j++) {
      const aStart = slots[i].startTime || "";
      const bStart = slots[j].startTime || "";
      const aEnd = slots[i].endTime || "23:59";
      const bEnd = slots[j].endTime || "23:59";
      if (aStart < bEnd && aEnd > bStart) return true;
    }
  }
  return false;
};

/** Whether any field belonging to a given wizard step currently has a validation error. */
export const stepHasErrors = (errors: FieldErrors<EventFormValues>, stepFields: string[]): boolean =>
  stepFields.some((k) => !!errors[k as keyof typeof errors]);
