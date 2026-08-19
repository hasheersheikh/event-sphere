import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { IBooking } from '../models/Booking.js';
import { IEvent } from '../models/Event.js';

// Left column sits beside the QR code (x >= QR_X); constrain its width so
// event details never run under the QR image.
const LEFT_COL_WIDTH = 320;
const QR_X = 400;
const QR_WIDTH = 140;

export const generateTicketPDF = async (booking: IBooking, event: IEvent): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // Standard PDF fonts cannot render the rupee sign — spell it out.
      const rs = (amount: number) => `Rs.${amount}`;

      // --- Brand Header ---
      doc.rect(0, 0, 595.28, 120).fill('#080808');
      doc.fillColor('#ffffff')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('City Pulse', 50, 40);
      doc.fillColor('#ffffff')
         .fontSize(12)
         .font('Helvetica')
         .text('Official Admission Ticket', 50, 80);

      // --- Event Details (left column, flows downward so long values wrap
      // instead of colliding with the labels below or the QR code beside) ---
      let yPos = 160;
      const field = (label: string, value: string, opts?: { font?: string; size?: number }) => {
        doc.fillColor('#64748b').fontSize(12).font('Helvetica').text(label, 50, yPos);
        yPos += 15;
        doc.fillColor('#1e293b')
           .fontSize(opts?.size ?? 14)
           .font(opts?.font ?? 'Helvetica-Bold')
           .text(value, 50, yPos, { width: LEFT_COL_WIDTH });
        yPos += doc.heightOfString(value, { width: LEFT_COL_WIDTH }) + 20;
      };

      doc.fillColor('#1e293b').fontSize(24).font('Helvetica-Bold')
         .text(event.title, 50, yPos, { width: LEFT_COL_WIDTH });
      yPos += doc.heightOfString(event.title, { width: LEFT_COL_WIDTH }) + 20;

      // Event dates carry IST wall-clock values in their UTC fields; format
      // in UTC so the ticket always shows the day the organizer saved.
      const eventDateStr = new Date(event.date).toLocaleDateString('en-IN', {
        timeZone: 'UTC',
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      field('DATE & TIME', `${eventDateStr} at ${event.time}`);
      field('LOCATION', event.location.venueName || event.location.address);
      field('BOOKING ID', booking._id.toString(), { font: 'Courier-Bold', size: 12 });

      // --- Ticket Types Table ---
      // Columns need explicit widths: with only align:right they all collapse
      // onto the page's right edge and print on top of each other.
      const PRICE_COL = { x: 300, width: 120 };
      const QTY_COL = { x: 460, width: 85 };

      // Table starts below both the left column and the QR caption.
      const tableTop = Math.max(yPos + 15, 350);
      doc.moveTo(50, tableTop).lineTo(545, tableTop).stroke('#e2e8f0');
      let rowY = tableTop + 20;
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('TICKET TYPE', 50, rowY);
      doc.text('PRICE', PRICE_COL.x, rowY, { width: PRICE_COL.width, align: 'right' });
      doc.text('QTY', QTY_COL.x, rowY, { width: QTY_COL.width, align: 'right' });

      rowY += 25;
      booking.tickets.forEach(ticket => {
        doc.font('Helvetica').text(ticket.type, 50, rowY);
        doc.text(rs(ticket.price), PRICE_COL.x, rowY, { width: PRICE_COL.width, align: 'right' });
        doc.text(ticket.quantity.toString(), QTY_COL.x, rowY, { width: QTY_COL.width, align: 'right' });
        rowY += 20;
      });

      // --- Financial Breakdown ---
      rowY += 10;
      doc.moveTo(50, rowY).lineTo(545, rowY).stroke('#e2e8f0');
      rowY += 15;

      const subtotal = booking.subtotal !== undefined && booking.subtotal !== 0
        ? booking.subtotal
        : booking.tickets.reduce((sum, t) => sum + t.price * t.quantity, 0);
      const discount = booking.discount || 0;
      const taxRate = booking.taxRate || 0;
      const taxAmount = booking.taxAmount || 0;
      const totalAmount = booking.totalAmount;

      doc.font('Helvetica').fontSize(10).fillColor('#64748b');

      // Subtotal
      doc.text('Subtotal:', 300, rowY, { align: 'right', width: 100 });
      doc.font('Helvetica-Bold').fillColor('#1e293b').text(rs(subtotal), 410, rowY, { align: 'right', width: 135 });
      rowY += 15;

      // Discount (if any)
      if (discount > 0) {
        doc.font('Helvetica').fillColor('#64748b').text('Discount:', 300, rowY, { align: 'right', width: 100 });
        doc.font('Helvetica-Bold').fillColor('#10b981').text(`-${rs(discount)}`, 410, rowY, { align: 'right', width: 135 });
        rowY += 15;
      }

      // Tax (if any)
      if (taxAmount > 0 || taxRate > 0) {
        doc.font('Helvetica').fillColor('#64748b').text(`Tax (${taxRate}%):`, 300, rowY, { align: 'right', width: 100 });
        doc.font('Helvetica-Bold').fillColor('#1e293b').text(rs(taxAmount), 410, rowY, { align: 'right', width: 135 });
        rowY += 15;
      }

      // Total Paid
      doc.moveTo(350, rowY).lineTo(545, rowY).stroke('#e2e8f0');
      rowY += 10;
      doc.font('Helvetica-Bold').fontSize(11).fillColor('#1e293b').text('Total Paid:', 300, rowY, { align: 'right', width: 100 });
      doc.fontSize(13).fillColor('#4f46e5').text(rs(totalAmount), 410, rowY, { align: 'right', width: 135 });

      // --- QR Code ---
      // Encodes the booking ID as a web URL so the scanner page can resolve it directly
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:8080';
      const qrData = `${frontendUrl}/scanner?ticket=${booking._id}`;
      const qrImageBuffer = await QRCode.toBuffer(qrData, {
        margin: 1,
        width: 150,
        color: { dark: '#080808', light: '#ffffff' },
      });
      doc.image(qrImageBuffer, QR_X, 180, { width: QR_WIDTH });
      doc.fontSize(8).fillColor('#94a3b8')
         .text('SCAN AT ENTRY', QR_X, 180 + QR_WIDTH + 5, { width: QR_WIDTH, align: 'center' });

      // --- Footer / Anti-Copy ---
      doc.fontSize(10)
         .fillColor('#94a3b8')
         .text('This ticket is digitally signed and valid for one-time admission only.', 50, 750, { align: 'center' });
      doc.text('City Pulse © 2026', 50, 765, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
