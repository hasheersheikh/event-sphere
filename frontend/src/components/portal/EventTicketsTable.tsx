// Shared "sold tickets" list for the event detail tabs (manager event
// analytics + admin event insights). Both portals flatten their booking
// payloads into one row per ticket line item — a "2x VIP" booking line
// stays a single row, matching how tickets are stored on the booking.

import React from "react";
import { Ticket, Download, Loader2 } from "lucide-react";

/** Canonical booking shape both pages map their API payloads into. */
export interface TicketBookingInput {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  isOffline?: boolean;
  createdAt: string | Date;
  tickets: Array<{
    type: string;
    quantity: number;
    price: number;
    checkedInCount?: number;
  }>;
}

export interface TicketRow {
  key: string;
  bookingId: string;
  holderName: string;
  email: string;
  phone: string;
  type: string;
  quantity: number;
  amount: number;
  checkedIn: number;
  isOffline: boolean;
  bookedAt: string | Date;
}

/** Flatten bookings into one row per ticket line item. */
export function toTicketRows(bookings: TicketBookingInput[]): TicketRow[] {
  return (bookings || []).flatMap((b) =>
    (b.tickets || []).map((t, i) => ({
      key: `${b._id}-${i}`,
      bookingId: String(b._id),
      holderName: b.name || "Anonymous",
      email: b.email || "",
      phone: b.phone || "",
      type: t.type,
      quantity: t.quantity,
      amount: (t.price || 0) * t.quantity,
      checkedIn: t.checkedInCount || 0,
      isOffline: !!b.isOffline,
      bookedAt: b.createdAt,
    }))
  );
}

interface EventTicketsTableProps {
  rows: TicketRow[];
  /** Slot in the card header, e.g. the attendee search box on the manager page. */
  headerExtra?: React.ReactNode;
  /** Slot inside the card below the table, e.g. pagination controls. */
  footer?: React.ReactNode;
  /** Override for the empty-state message. */
  emptyLabel?: string;
  /** When provided, renders a per-row action that downloads the booking's
   *  ticket PDF — for staff to resend tickets the email failed to deliver. */
  onDownloadTicket?: (bookingId: string) => void;
  /** Booking id currently being downloaded (shows a spinner on its rows). */
  downloadingId?: string | null;
}

export function EventTicketsTable({
  rows,
  headerExtra,
  footer,
  emptyLabel,
  onDownloadTicket,
  downloadingId,
}: EventTicketsTableProps) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 border-b border-border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <Ticket className="h-4 w-4 text-primary shrink-0" />
          <h3 className="text-[9px] font-black uppercase tracking-widest text-muted-foreground italic">
            Sold Tickets
          </h3>
          <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/50 italic">
            {rows.length} item{rows.length === 1 ? "" : "s"} on this page
          </span>
        </div>
        {headerExtra}
      </div>

      <div className="overflow-x-auto">
        <table
          className={`w-full text-left border-collapse ${onDownloadTicket ? "min-w-[1000px]" : "min-w-[900px]"}`}
        >
          <thead>
            <tr className="bg-muted/10 text-muted-foreground text-[8px] font-black uppercase tracking-[0.2em] border-b border-border italic">
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Ticket Holder</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3 text-center">Qty</th>
              <th className="px-4 py-3 text-center">Checked In</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-center">Source</th>
              <th className="px-4 py-3">Booked On</th>
              {onDownloadTicket && <th className="px-4 py-3 text-center">Ticket</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {rows.length > 0 ? (
              rows.map((r, idx) => (
                <tr key={r.key} className="hover:bg-muted/10 transition-colors">
                  <td className="px-4 py-3 font-black text-[9px] text-muted-foreground/50 tabular-nums italic">
                    {idx + 1}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="h-7 w-7 rounded-md bg-primary/10 flex items-center justify-center text-primary font-black text-[10px] shrink-0">
                        {r.holderName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-[11px] uppercase tracking-tight text-foreground italic leading-none">
                          {r.holderName}
                        </p>
                        <p className="text-[9px] text-muted-foreground/50 font-mono mt-0.5 truncate max-w-[220px]">
                          {r.email || r.phone || `#${r.bookingId.slice(-8)}`}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-black text-[11px] uppercase tracking-tight text-foreground italic">
                    {r.type}
                  </td>
                  <td className="px-4 py-3 text-center font-black text-[11px] tabular-nums">
                    {r.quantity}
                  </td>
                  <td className="px-4 py-3 text-center font-black text-[11px] tabular-nums">
                    <span
                      className={
                        r.checkedIn >= r.quantity && r.quantity > 0
                          ? "text-emerald-500"
                          : r.checkedIn > 0
                            ? "text-blue-500"
                            : "text-muted-foreground/40"
                      }
                    >
                      {r.checkedIn} / {r.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-black text-emerald-500 tabular-nums italic text-xs">
                    ₹{r.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                        r.isOffline
                          ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      }`}
                    >
                      {r.isOffline ? "Offline" : "Online"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[10px] font-medium text-muted-foreground whitespace-nowrap">
                    {new Date(r.bookedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    <span className="block text-[9px] text-muted-foreground/50">
                      {new Date(r.bookedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </td>
                  {onDownloadTicket && (
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onDownloadTicket(r.bookingId)}
                        disabled={downloadingId === r.bookingId}
                        title="Download this booking's ticket PDF (all tiers + QR)"
                        className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors disabled:opacity-50 mx-auto"
                      >
                        {downloadingId === r.bookingId ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Download className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </td>
                  )}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={onDownloadTicket ? 9 : 8}
                  className="px-6 py-16 text-center text-[10px] font-black uppercase text-muted-foreground/50 italic"
                >
                  {emptyLabel || "No tickets sold yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {footer}
    </div>
  );
}
