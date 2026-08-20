// Shared pagination helpers for the event attendee/booking list endpoints
// (admin event insights + manager event analytics). Both must slice
// identically so their list behaviour never drifts.

export interface ListParams {
  page: number;
  limit: number; // 0 = return all rows (export sentinel)
  search: string;
}

export function parseListParams(query: Record<string, unknown>): ListParams {
  const page = Math.max(1, parseInt(query.page as string) || 1);
  const rawLimit = parseInt(query.limit as string);
  const limit = Number.isNaN(rawLimit) ? 20 : Math.max(0, rawLimit);
  const search = String(query.search ?? '').trim().toLowerCase();
  return { page, limit, search };
}

export function matchesBookingSearch(b: any, search: string): boolean {
  if (!search) return true;
  const u = b.user as { name?: string; email?: string } | null | undefined;
  return [b.contactName, b.email, b.phoneNumber, u?.name, u?.email].some(
    (v) => typeof v === 'string' && v.toLowerCase().includes(search)
  );
}

export function paginate<T>(rows: T[], page: number, limit: number) {
  const total = rows.length;
  const pages = limit === 0 ? 1 : Math.max(1, Math.ceil(total / limit));
  const safePage = limit === 0 ? 1 : Math.min(page, pages);
  const items = limit === 0 ? rows : rows.slice((safePage - 1) * limit, safePage * limit);
  return { items, pagination: { total, page: safePage, limit, pages } };
}
