import React from "react";
import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Ticket, User, Shield } from "lucide-react";
import { Event } from "@/types/event";

interface TicketTemplateProps {
  booking: any;
  ticket: {
    type: string;
    quantity: number;
    price: number;
  };
}

const TicketTemplate = React.forwardRef<HTMLDivElement, TicketTemplateProps>(
  ({ booking, ticket }, ref) => {
    const event: Event = booking?.event || {};

    return (
      <div
        ref={ref}
        className="w-[800px] bg-white text-slate-900 p-12 relative overflow-hidden font-sans"
        style={{ minHeight: "500px" }}
      >
        {/* Security Watermark */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03] rotate-[-30deg] flex flex-wrap gap-20 p-10 select-none">
          {Array.from({ length: 12 }).map((_, i) => (
            <span
              key={i}
              className="text-6xl font-black uppercase tracking-widest"
            >
              City Pulse Secure
            </span>
          ))}
        </div>

        <div className="relative z-10 border-4 border-slate-900 rounded-3xl p-8 flex gap-8">
          {/* Left Section - Event Info */}
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Ticket className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                OFFICIAL TICKET
              </h1>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">
                  Event Name
                </p>
                <h2 className="text-2xl font-bold">{event.title || "Deleted Event"}</h2>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">
                    Date & Time
                  </p>
                  <div className="flex items-center gap-2 font-semibold">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span>
                      {event.date ? new Date(event.date).toLocaleDateString() : "Date N/A"} at{" "}
                      {event.time || "Time N/A"}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">
                    Location
                  </p>
                  <div className="flex items-center gap-2 font-semibold">
                    <MapPin className="h-4 w-4 text-indigo-600" />
                    <span className="truncate">
                      {event.location?.venueName || "Location Unavailable"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">
                    Ticket Holder
                  </p>
                  <div className="flex items-center gap-2 font-semibold">
                    <User className="h-4 w-4 text-indigo-600" />
                    <span>{booking.user.name || "Booking Guest"}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold uppercase text-slate-400 tracking-widest mb-1">
                    Ticket Type
                  </p>
                  <div className="flex items-center gap-2 font-semibold">
                    <Badge
                      variant="outline"
                      className="text-lg px-3 py-1 font-bold border-2"
                    >
                      {ticket.quantity}x {ticket.type}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200">
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <Shield className="h-4 w-4 text-green-600" />
                <span>
                  This ticket is unique and valid for one-time admission only.
                </span>
              </div>
            </div>
          </div>

          {/* Right Section - QR Code */}
          <div className="w-[200px] flex flex-col items-center justify-center gap-4 bg-slate-50 rounded-2xl border-l-2 border-dashed border-slate-300 p-6">
            <div className="bg-white p-3 rounded-xl shadow-md">
              <QRCodeSVG
                value={`citypulse://ticket/${booking._id}`}
                size={140}
                level="H"
                includeMargin={true}
              />
            </div>
            <p className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-tighter">
              ID: {booking._id.substring(0, 12)}...
            </p>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="mt-8 text-center text-[10px] text-slate-400 font-medium">
          Generated by City Pulse • Validated via Cryptographic ID • Do not
          share this QR code
        </div>
      </div>
    );
  },
);

// Minimal Badge for the ticket
const Badge = ({ children, variant, className }: any) => (
  <span
    className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${className}`}
  >
    {children}
  </span>
);

export default TicketTemplate;
