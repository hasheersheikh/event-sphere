import * as z from "zod";
import { Calendar as CalendarIcon, RefreshCw, CalendarDays, Layers } from "lucide-react";
import type { FieldErrors } from "react-hook-form";

// ─── Zod schema ─────────────────────────────────────────────────────────────
// Shared by CreateEventPage and EditEventPage — both forms operate on the
// same shape. `image` is validated with .url() since it always comes from
// the upload flow (never a bare non-URL string) on either page.

export const eventSchema = z.object({
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
