import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { formatEventDate } from "@/lib/utils";

interface TicketTemplateProps {
  booking: any;
  ticket: {
    type: string;
    quantity: number;
    price: number;
  };
}

const NEON = "#C4F000";
const DARK = "#0d0d0d";
const BORDER = "#282828";

const TicketTemplate = React.forwardRef<HTMLDivElement, TicketTemplateProps>(
  ({ booking, ticket }, ref) => {
    const event = booking?.event || {};
    const user = booking?.user || {};

    const dateStr = event.date
      ? formatEventDate(event.date, {
          weekday: "short", day: "numeric", month: "long", year: "numeric",
        })
      : "Date unavailable";

    const venue = event.location?.venueName || event.location?.address || "Venue unavailable";

    return (
      <div
        ref={ref}
        style={{
          width: 800,
          backgroundColor: DARK,
          fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Security watermark */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          opacity: 0.022, display: "flex", flexWrap: "wrap", gap: 40,
          padding: 20, transform: "rotate(-25deg)", transformOrigin: "center",
          userSelect: "none", overflow: "hidden",
        }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <span key={i} style={{ fontSize: 28, fontWeight: 900, color: NEON, whiteSpace: "nowrap", letterSpacing: 8 }}>
              CITY PULSE
            </span>
          ))}
        </div>

        {/* Top accent stripe */}
        <div style={{ height: 4, background: `linear-gradient(90deg, ${NEON}, #aaee00, ${NEON})` }} />

        {/* Main body */}
        <div style={{ display: "flex", padding: "32px 36px 28px 36px", gap: 0, alignItems: "stretch" }}>

          {/* ── Left: Event info ── */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 22, paddingRight: 30 }}>

            {/* Brand row */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 7, backgroundColor: NEON,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 11, fontWeight: 900, color: "#000", letterSpacing: -0.5 }}>CP</span>
                </div>
                <span style={{ fontSize: 9, fontWeight: 800, color: "#555", letterSpacing: 5, textTransform: "uppercase" }}>
                  City Pulse
                </span>
              </div>
              <span style={{ fontSize: 8, fontWeight: 700, color: "#444", letterSpacing: 3, textTransform: "uppercase" }}>
                Admission Ticket
              </span>
            </div>

            {/* Event title */}
            <div>
              <span style={{ fontSize: 8, fontWeight: 900, color: NEON, letterSpacing: 5, textTransform: "uppercase", display: "block", marginBottom: 7 }}>
                Event
              </span>
              <span style={{ fontSize: 24, fontWeight: 900, color: "#ffffff", lineHeight: 1.15, letterSpacing: -0.5, display: "block" }}>
                {event.title || "Deleted Event"}
              </span>
            </div>

            {/* Info grid — 2×2, no boxes */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 28px" }}>
              <InfoCell label="Date" value={dateStr} />
              <InfoCell label="Time" value={event.time || "TBA"} />
              <InfoCell label="Venue" value={venue} />
              <InfoCell label="Ticket Holder" value={user.name || "Guest"} />
            </div>

            {/* Ticket type row — plain text, no box */}
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div>
                <span style={{ fontSize: 7, fontWeight: 900, color: "#555", letterSpacing: 4, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                  Ticket Type
                </span>
                <span style={{ fontSize: 14, fontWeight: 900, color: NEON, letterSpacing: 1, textTransform: "uppercase" }}>
                  {ticket.quantity}× {ticket.type}
                </span>
              </div>
              {ticket.price > 0 && (
                <div style={{ borderLeft: `1px solid ${BORDER}`, paddingLeft: 16 }}>
                  <span style={{ fontSize: 7, fontWeight: 900, color: "#555", letterSpacing: 4, textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                    Amount Paid
                  </span>
                  <span style={{ fontSize: 14, fontWeight: 900, color: "#aaa", letterSpacing: 0.5 }}>
                    ₹{(ticket.price * ticket.quantity).toFixed(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Footer note */}
            <div style={{ marginTop: "auto", paddingTop: 14, borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: NEON, flexShrink: 0 }} />
              <span style={{ fontSize: 8, color: "#444", fontWeight: 700, letterSpacing: 0.5 }}>
                Valid for one-time admission only · Do not duplicate or share
              </span>
            </div>
          </div>

          {/* ── Perforation ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 1 }}>
            <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: DARK, border: `1px solid ${BORDER}`, marginTop: -32, flexShrink: 0 }} />
            <div style={{ flex: 1, borderLeft: `2px dashed ${BORDER}`, margin: "3px 0" }} />
            <div style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: DARK, border: `1px solid ${BORDER}`, marginBottom: -28, flexShrink: 0 }} />
          </div>

          {/* ── Right: QR ── */}
          <div style={{
            width: 190,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            gap: 14, paddingLeft: 30,
          }}>
            <div style={{
              backgroundColor: "#fff", padding: 10, borderRadius: 12,
              border: `2.5px solid ${NEON}`,
              boxShadow: `0 0 20px ${NEON}28`,
            }}>
              <QRCodeSVG
                value={`citypulse://ticket/${booking._id}`}
                size={128}
                level="H"
                includeMargin={false}
              />
            </div>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 7, fontWeight: 900, color: "#444", letterSpacing: 4, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
                Booking ID
              </span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#777", letterSpacing: 1, display: "block" }}>
                #{booking._id.slice(-10).toUpperCase()}
              </span>
            </div>

            <span style={{ fontSize: 8, fontWeight: 900, color: "#555", letterSpacing: 3, textTransform: "uppercase" }}>
              Scan at entry
            </span>
          </div>
        </div>

        {/* Bottom rule + footer */}
        <div style={{ height: 1, backgroundColor: BORDER, margin: "0 36px" }} />
        <div style={{ padding: "12px 36px 14px", textAlign: "center" }}>
          <span style={{ fontSize: 8, color: "#383838", letterSpacing: 3, fontWeight: 700, textTransform: "uppercase" }}>
            citypulse.in · Cryptographically verified · Do not share this QR code
          </span>
        </div>
      </div>
    );
  }
);

const InfoCell = ({ label, value }: { label: string; value: string }) => (
  <div>
    <span style={{ fontSize: 7, fontWeight: 900, color: "#555", letterSpacing: 4, textTransform: "uppercase", display: "block", marginBottom: 5 }}>
      {label}
    </span>
    <span style={{ fontSize: 11, fontWeight: 700, color: "#bbb", lineHeight: 1.35, display: "block" }}>
      {value}
    </span>
  </div>
);

TicketTemplate.displayName = "TicketTemplate";

export default TicketTemplate;
