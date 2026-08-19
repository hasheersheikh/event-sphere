import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatPrice = (price?: number) => {
  if (price === 0 || price === undefined) return "Free";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Event dates from the API carry IST wall-clock values in their UTC fields
// (e.g. `2026-08-21T20:00:00Z` means "Aug 21, 8:00 PM IST"). Rendering them
// with the browser's local timezone shifts them (an IST browser adds 5h30m,
// rolling evening events onto the next day), so always format event dates in
// UTC to show the stored wall-clock components exactly as saved.
export const formatEventDate = (
  value: string | number | Date,
  options: Intl.DateTimeFormatOptions = {}
) =>
  new Date(value).toLocaleDateString("en-US", {
    timeZone: "UTC",
    ...options,
  });
