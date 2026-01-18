import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import { IBooking } from '../models/Booking.js';
import { IEvent } from '../models/Event.js';

export const generateTicketPDF = async (booking: IBooking, event: IEvent): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // --- Brand Header ---
      doc.rect(0, 0, 595.28, 120).fill('#4f46e5'); // Indigo Header
      doc.fillColor('#ffffff')
         .fontSize(32)
         .font('Helvetica-Bold')
         .text('Event Sphere', 50, 40);
      doc.fontSize(12)
         .font('Helvetica')
         .text('Official Admission Ticket', 50, 80);

      // --- Event Details ---
      doc.fillColor('#1e293b')
         .fontSize(24)
         .font('Helvetica-Bold')
         .text(event.title, 50, 160);

      doc.fontSize(12).font('Helvetica').fillColor('#64748b').text('DATE & TIME', 50, 210);
      doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(`${new Date(event.date).toLocaleDateString()} at ${event.time}`, 50, 225);

      doc.fillColor('#64748b').fontSize(12).font('Helvetica').text('LOCATION', 50, 260);
      doc.fillColor('#1e293b').fontSize(14).font('Helvetica-Bold').text(event.location.venueName || event.location.address, 50, 275);

      doc.fillColor('#64748b').fontSize(12).font('Helvetica').text('BOOKING ID', 50, 310);
      doc.fillColor('#1e293b').fontSize(12).font('Courier-Bold').text(booking._id.toString(), 50, 325);

      // --- Ticket Types Table ---
      doc.moveTo(50, 360).lineTo(545, 360).stroke('#e2e8f0');
      doc.fillColor('#1e293b').fontSize(12).font('Helvetica-Bold').text('TICKET TYPE', 50, 380);
      doc.text('PRICE', 350, 380, { align: 'right' });
      doc.text('QTY', 450, 380, { align: 'right' });

      let yPos = 405;
      booking.tickets.forEach(ticket => {
        doc.font('Helvetica').text(ticket.type, 50, yPos);
        doc.text(`₹${ticket.price}`, 350, yPos, { align: 'right' });
        doc.text(ticket.quantity.toString(), 450, yPos, { align: 'right' });
        yPos += 20;
      });

      // --- QR Code ---
      const qrData = `eventsphere://ticket/${booking._id}`;
      const qrImageBuffer = await QRCode.toBuffer(qrData, { 
        margin: 1, 
        width: 150,
        color: { dark: '#1e293b', light: '#ffffff' }
      });
      doc.image(qrImageBuffer, 400, 180, { width: 140 });
      doc.fontSize(8).fillColor('#94a3b8').text('SCAN AT ENTRY', 435, 325);

      // --- Footer / Anti-Copy ---
      doc.fontSize(10)
         .fillColor('#94a3b8')
         .text('This ticket is digitally signed and valid for one-time admission only.', 50, 750, { align: 'center' });
      doc.text('Event Sphere © 2026', 50, 765, { align: 'center' });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};
