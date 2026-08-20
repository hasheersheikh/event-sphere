/**
 * Self-service cancellation eligibility — single source of truth.
 *
 * Used by BOTH the self-cancel endpoint (authoritative) and getMyBookings
 * (attaches a computed `cancellation` object so the frontend never
 * re-implements the business rules).
 *
 * ── Timezone contract (load-bearing) ────────────────────────────────────────
 * Event date/time/days/slots fields carry IST WALL-CLOCK values stored in UTC
 * fields (e.g. date=2026-08-21T00:00:00Z + time="20:00" means 8:00 PM IST).
 * But `booking.createdAt` is a TRUE UTC instant. The two eligibility rules
 * therefore compare in different frames and must never be mixed:
 *
 *   Rule (a) — 2h before event start: BOTH sides in the IST-wall-clock frame
 *              ("now" shifted by +5.5h, read via getUTC*).
 *   Rule (b) — 12h after booking:     BOTH sides true UTC instants.
 */

export const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
export const CANCEL_CUTOFF_BEFORE_START_MS = 2 * 60 * 60 * 1000; // 2h before start
export const CANCEL_WINDOW_AFTER_BOOKING_MS = 12 * 60 * 60 * 1000; // 12h after createdAt

/** "now" shifted into the IST-wall-clock frame — compare ONLY against event
 *  date/time/days/slots values, and read with getUTC* methods. */
export const nowISTWallClock = (now: Date = new Date()): Date =>
  new Date(now.getTime() + IST_OFFSET_MS);

/** Parses "HH:MM[:SS]" — tolerant of missing/garbage strings, clamped. */
const parseClock = (s?: string): { h: number; m: number } => {
  const parts = (s || '').split(':').map(Number);
  const h = Number.isFinite(parts[0]) ? parts[0] : 0;
  const m = Number.isFinite(parts[1]) ? parts[1] : 0;
  return { h: Math.min(23, Math.max(0, h)), m: Math.min(59, Math.max(0, m)) };
};

/** Wall-clock instant from a stored IST date (UTC components only) + IST clock string. */
const wallClock = (date: Date, clock?: string): Date => {
  const { h, m } = parseClock(clock);
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), h, m)
  );
};

const earliestOf = (candidates: Date[]): Date | null => {
  const valid = candidates.filter(Boolean);
  if (!valid.length) return null;
  return new Date(Math.min(...valid.map((d) => d.getTime())));
};

/** True when the calendar day (UTC components) of `a` matches any exception date. */
const isExceptionDay = (a: Date, exceptions?: Date[]): boolean =>
  (exceptions || []).some(
    (e) =>
      a.getUTCFullYear() === e.getUTCFullYear() &&
      a.getUTCMonth() === e.getUTCMonth() &&
      a.getUTCDate() === e.getUTCDate()
  );

/**
 * Next recurring occurrence at/after `fromWall`, honoring frequency /
 * daysOfWeek (0=Sun…6=Sat) / exceptions. Bounded by recurrence.endDate and a
 * 60-day horizon so an unsatisfiable rule can't loop forever.
 */
const nextRecurringOccurrence = (event: any, fromWall: Date): Date | null => {
  const rec = event.recurrence || {};
  const timeStr = event.time;
  const cursor = new Date(
    Date.UTC(fromWall.getUTCFullYear(), fromWall.getUTCMonth(), fromWall.getUTCDate())
  );
  const horizon = new Date(cursor.getTime() + 60 * 24 * 60 * 60 * 1000);
  const end = rec.endDate ? new Date(Date.UTC(
    new Date(rec.endDate).getUTCFullYear(),
    new Date(rec.endDate).getUTCMonth(),
    new Date(rec.endDate).getUTCDate()
  )) : null;
  const allowedDows = Array.isArray(rec.daysOfWeek) && rec.daysOfWeek.length
    ? new Set<number>(rec.daysOfWeek)
    : null; // null → every day allowed (daily with no daysOfWeek)

  for (let i = 0; i < 60; i++) {
    const dayStart = new Date(cursor.getTime() + i * 24 * 60 * 60 * 1000);
    if (dayStart.getTime() > horizon.getTime()) break;
    if (end && dayStart.getTime() > end.getTime()) break;
    if (isExceptionDay(dayStart, rec.exceptions)) continue;
    if (allowedDows && !allowedDows.has(dayStart.getUTCDay())) continue;

    const occurrence = wallClock(dayStart, timeStr);
    // Same-day occurrences already started don't count as "next".
    if (occurrence.getTime() >= fromWall.getTime()) return occurrence;
  }
  return null;
};

/**
 * IST-wall-clock start of the EARLIEST session this booking covers.
 * Returns null only when the event has no resolvable date at all.
 */
export const getBookingSessionStart = (event: any, booking: any, now: Date = new Date()): Date | null => {
  if (!event?.date) return null;
  const baseDate = new Date(event.date);
  const fallback = () => wallClock(baseDate, event.time);

  if (event.scheduleType === 'multi_day') {
    const days: Date[] = (event.days || []).map((d: any) => new Date(d.date));
    // 0-based indices into event.days, collected across all ticket lines.
    const picked = new Set<number>();
    (booking?.tickets || []).forEach((t: any) =>
      (t.selectedDays || []).forEach((i: number) => picked.add(i))
    );
    const candidates = picked.size
      ? [...picked]
          .filter((i) => days[i] && event.days[i])
          .map((i) => wallClock(days[i], event.days[i].startTime))
      : days.map((d: Date, i: number) => wallClock(d, event.days[i].startTime));
    return earliestOf(candidates) ?? fallback();
  }

  if (event.scheduleType === 'multi_slot') {
    // The chosen slot isn't persisted on the booking — use the earliest slot
    // so the window never stays open past the first session (conservative).
    const starts = (event.slots || [])
      .map((s: any) => parseClock(s.startTime))
      .map(({ h, m }: { h: number; m: number }) => h * 60 + m);
    if (!starts.length) return fallback();
    const min = Math.min(...starts);
    const hh = String(Math.floor(min / 60)).padStart(2, '0');
    const mm = String(min % 60).padStart(2, '0');
    return wallClock(baseDate, `${hh}:${mm}`);
  }

  if (event.scheduleType === 'recurring') {
    const first = fallback();
    const nowWall = nowISTWallClock(now);
    if (first.getTime() > nowWall.getTime()) return first;
    return nextRecurringOccurrence(event, nowWall) ?? first;
  }

  // 'single' + unknown schedule types
  return fallback();
};

export type CancellationReasonCode =
  | 'ELIGIBLE'
  | 'NOT_CONFIRMED'
  | 'ALREADY_CANCELLED'
  | 'ALREADY_REFUNDED'
  | 'OFFLINE_TICKET'
  | 'CHECKED_IN'
  | 'NO_PAYMENT_ON_FILE'
  | 'WITHIN_2_HOURS'
  | 'WINDOW_CLOSED'
  | 'EVENT_MISSING';

export interface CancellationEligibility {
  eligible: boolean;
  reasonCode: CancellationReasonCode;
  /** Human-ready — rendered verbatim by the frontend. */
  reasonMessage: string;
  /** Full refund amount in rupees (0 for free bookings). */
  refundAmount: number;
  /** IST-wall-clock instant — frontend renders with timeZone:"UTC". */
  eventStart: string | null;
  /** IST-wall-clock instant (eventStart − 2h) — frontend renders with timeZone:"UTC". */
  cutoffAt: string | null;
  /** TRUE UTC instant (createdAt + 12h) — frontend renders with timeZone:"Asia/Kolkata". */
  windowExpiresAt: string | null;
}

export const evaluateCancellationEligibility = (
  booking: any,
  event: any,
  now: Date = new Date()
): CancellationEligibility => {
  const windowExpiresAt = booking?.createdAt
    ? new Date(new Date(booking.createdAt).getTime() + CANCEL_WINDOW_AFTER_BOOKING_MS)
    : null;

  const base: CancellationEligibility = {
    eligible: false,
    reasonCode: 'EVENT_MISSING',
    reasonMessage: 'This event is no longer available.',
    refundAmount: booking?.totalAmount ?? 0,
    eventStart: null,
    cutoffAt: null,
    windowExpiresAt: windowExpiresAt ? windowExpiresAt.toISOString() : null,
  };

  // ── Status / booking-shape guards (first failure wins) ────────────────────
  if (!event) return base;

  const startWall = getBookingSessionStart(event, booking, now);
  const eventStartIso = startWall ? startWall.toISOString() : null;
  const cutoffWall = startWall
    ? new Date(startWall.getTime() - CANCEL_CUTOFF_BEFORE_START_MS)
    : null;

  const withTimes: CancellationEligibility = {
    ...base,
    eventStart: eventStartIso,
    cutoffAt: cutoffWall ? cutoffWall.toISOString() : null,
  };

  if (booking.status === 'pending' || booking.status === 'expired') {
    return {
      ...withTimes,
      reasonCode: 'NOT_CONFIRMED',
      reasonMessage: "Payment for this booking hasn't been completed.",
    };
  }
  if (booking.status === 'cancelled') {
    return { ...withTimes, reasonCode: 'ALREADY_CANCELLED', reasonMessage: 'This booking is already cancelled.' };
  }
  if (booking.status === 'refunded') {
    return { ...withTimes, reasonCode: 'ALREADY_REFUNDED', reasonMessage: 'This booking is already cancelled and refunded.' };
  }
  if (booking.status !== 'confirmed') {
    return { ...withTimes, reasonCode: 'NOT_CONFIRMED', reasonMessage: 'This booking cannot be cancelled.' };
  }
  if (booking.isOffline === true) {
    return {
      ...withTimes,
      reasonCode: 'OFFLINE_TICKET',
      reasonMessage: 'Offline tickets are cancelled by the organizer.',
    };
  }
  if ((booking.tickets || []).some((t: any) => (t.checkedInCount || 0) > 0)) {
    return {
      ...withTimes,
      reasonCode: 'CHECKED_IN',
      reasonMessage: 'Tickets already scanned at the venue cannot be cancelled.',
    };
  }
  if (booking.totalAmount > 0 && !booking.paymentId) {
    return {
      ...withTimes,
      reasonCode: 'NO_PAYMENT_ON_FILE',
      reasonMessage: 'No online payment on record for this booking — contact the organizer.',
    };
  }

  // ── Rule (a): more than 2h before the session start (IST-wall-clock frame) ─
  const nowWall = nowISTWallClock(now);
  if (!startWall || nowWall.getTime() + CANCEL_CUTOFF_BEFORE_START_MS >= startWall.getTime()) {
    return {
      ...withTimes,
      reasonCode: 'WITHIN_2_HOURS',
      reasonMessage: 'Cancellation closed 2 hours before the event start.',
    };
  }

  // ── Rule (b): within 12h of booking (true-UTC frame) ──────────────────────
  if (!booking.createdAt || now.getTime() - new Date(booking.createdAt).getTime() >= CANCEL_WINDOW_AFTER_BOOKING_MS) {
    return {
      ...withTimes,
      reasonCode: 'WINDOW_CLOSED',
      reasonMessage: 'The 12-hour self-cancellation window for this booking has passed.',
    };
  }

  return {
    ...withTimes,
    eligible: true,
    reasonCode: 'ELIGIBLE',
    reasonMessage: 'This booking can be cancelled for a full refund.',
  };
};
