/**
 * City Pulse Manager Terms & Conditions PDF Generator
 * Professional onboarding document for event managers
 */

import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateManagerTermsPdf = async (): Promise<Buffer> => {
  return new Promise(async (resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
        info: {
          Title: 'City Pulse Manager Agreement',
          Author: 'City Pulse',
          Subject: 'Terms and Conditions for Event Managers',
          Creator: 'City Pulse Platform',
        },
      });

      const buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));

      // =====================================================================
      // COVER PAGE
      // =====================================================================

      // Black background header
      doc.rect(0, 0, 595.28, 200).fill('#050505');

      // Logo/Title
      doc.fillColor('#ffffff')
         .fontSize(42)
         .font('Helvetica-Bold')
         .text('CITY PULSE', 50, 60, { align: 'left' });

      doc.fontSize(14)
         .font('Helvetica')
         .fillColor('#94a3b8')
         .text('EVENT MANAGER AGREEMENT', 50, 110, { align: 'left' });

      // Date
      const currentDate = new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
      doc.fontSize(11)
         .fillColor('#ffffff')
         .text(`Effective Date: ${currentDate}`, 50, 750, { align: 'left' });

      doc.addPage();

      // =====================================================================
      // CONTENT PAGES
      // =====================================================================

      let yPosition = 50;

      // Section Header Helper
      const sectionHeader = (title: string, number: string) => {
        if (yPosition > 650) {
          doc.addPage();
          yPosition = 50;
        }

        // Section number
        doc.fontSize(48)
           .font('Helvetica-Bold')
           .fillColor('#f1f5f9')
           .text(number, 50, yPosition);

        // Section title with underline
        doc.fontSize(18)
           .font('Helvetica-Bold')
           .fillColor('#050505')
           .text(title, 100, yPosition + 28);

        doc.moveTo(100, yPosition + 50)
           .lineTo(545, yPosition + 50)
           .lineWidth(2)
           .stroke('#050505');

        yPosition += 70;
      };

      // Subsection Helper
      const subsection = (title: string) => {
        doc.fontSize(13)
           .font('Helvetica-Bold')
           .fillColor('#1e293b')
           .text(title, 50, yPosition);
        yPosition += 20;
      };

      // Body Text Helper
      const bodyText = (text: string) => {
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#475569')
           .text(text, 50, yPosition, {
             width: 495,
             align: 'justify',
             lineGap: 4,
           });

        const height = doc.heightOfString(text, {
          width: 495,
          align: 'justify',
          lineGap: 4,
        });

        yPosition += height + 12;
      };

      // List Helper
      const listItem = (text: string, indent: number = 20) => {
        doc.fontSize(11)
           .font('Helvetica')
           .fillColor('#475569')
           .text(text, 50 + indent, yPosition, {
             width: 495 - indent,
             lineGap: 4,
           });

        const height = doc.heightOfString(text, {
          width: 495 - indent,
          lineGap: 4,
        });

        yPosition += height + 8;
      };

      // =====================================================================
      // SECTION 1: INTRODUCTION
      // =====================================================================

      sectionHeader('AGREEMENT OVERVIEW', '01');

      bodyText(
        'This Agreement ("Agreement") is entered into between City Pulse ("Platform") ' +
        'and the Event Manager ("Manager") who has been approved to create and manage ' +
        'events on the City Pulse platform.'
      );

      bodyText(
        'By accessing and using the Manager Portal, you agree to be bound by the terms ' +
        'and conditions outlined in this document. If you do not agree with these terms, ' +
        'please discontinue use of the platform immediately.'
      );

      // =====================================================================
      // SECTION 2: MANAGER RESPONSIBILITIES
      // =====================================================================

      sectionHeader('MANAGER RESPONSIBILITIES', '02');

      subsection('2.1 Event Creation & Management');
      bodyText(
        'As a Manager, you are responsible for creating accurate event listings, ' +
        'maintaining up-to-date information, and ensuring all events comply with ' +
        'platform guidelines.'
      );

      listItem('• Provide accurate event details including date, time, venue, and description');
      listItem('• Upload high-quality images that represent the event appropriately');
      listItem('• Respond to customer inquiries within 24 hours');
      listItem('• Honor all confirmed bookings and tickets');
      listItem('• Maintain professional conduct at all times');

      subsection('2.2 Content Guidelines');
      bodyText('All event content must adhere to the following standards:');

      listItem('• No illegal or prohibited activities');
      listItem('• No misleading or false information');
      listItem('• No offensive or discriminatory content');
      listItem('• Appropriate categorization and tagging');
      listItem('• Compliance with local laws and regulations');

      // =====================================================================
      // SECTION 3: COMMISSION & PAYMENTS
      // =====================================================================

      sectionHeader('COMMISSION & PAYMENTS', '03');

      subsection('3.1 Commission Structure');
      bodyText(
        'City Pulse charges a commission on all ticket sales made through the platform. ' +
        'The standard commission rate is applied to the total transaction value.'
      );

      // Commission Table
      if (yPosition > 500) {
        doc.addPage();
        yPosition = 50;
      }

      const tableTop = yPosition;
      const colWidths = [200, 150, 195];
      const rowHeight = 30;

      // Table Header
      doc.rect(50, tableTop, 495, rowHeight).fill('#050505');
      doc.fillColor('#ffffff')
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('TIER', 60, tableTop + 10);
      doc.text('SALES VOLUME', 260, tableTop + 10);
      doc.text('COMMISSION RATE', 410, tableTop + 10);

      // Table Rows
      const tiers = [
        ['Starter', 'Rs.0 - Rs.50,000/month', '15%'],
        ['Growth', 'Rs.50,001 - Rs.2,00,000/month', '12%'],
        ['Scale', 'Above Rs.2,00,000/month', '10%'],
      ];

      tiers.forEach((tier, i) => {
        const y = tableTop + rowHeight + (i * rowHeight);
        if (i % 2 === 0) {
          doc.rect(50, y, 495, rowHeight).fill('#f8fafc');
        }
        doc.fillColor('#1e293b')
           .font('Helvetica')
           .fontSize(10)
           .text(tier[0], 60, y + 10);
        doc.text(tier[1], 260, y + 10);
        doc.text(tier[2], 410, y + 10);
      });

      yPosition = tableTop + (tiers.length * rowHeight) + 30;

      subsection('3.2 Payment Schedule');
      bodyText(
        'Payouts are processed on a weekly basis. All confirmed bookings from the ' +
        'previous week are consolidated and transferred to your registered bank account ' +
        'within 7-10 business days.'
      );

      bodyText(
        'Minimum payout threshold: Rs.1,000. Amounts below this threshold will be ' +
        'carried forward to the next payout cycle.'
      );

      // =====================================================================
      // SECTION 4: REFUNDS & CANCELLATIONS
      // =====================================================================

      sectionHeader('REFUNDS & CANCELLATIONS', '04');

      subsection('4.1 Customer Refunds');
      bodyText(
        'Refund requests are processed according to the event-specific refund policy ' +
        'set by the Manager. City Pulse facilitates refund processing but the final ' +
        'decision rests with the Manager.'
      );

      listItem('• Automatic refund for events cancelled by Manager');
      listItem('• Full refund if requested 48+ hours before event');
      listItem('• No refund for requests within 24 hours of event');
      listItem('• Processing fees may apply to refunds');

      subsection('4.2 Event Cancellations');
      bodyText(
        'Managers may cancel events up to 24 hours before the scheduled time. ' +
        'Cancellations within 24 hours require approval from City Pulse support ' +
        'and may affect your Manager rating.'
      );

      // =====================================================================
      // SECTION 5: PLATFORM FEES
      // =====================================================================

      sectionHeader('PLATFORM FEES', '05');

      subsection('5.1 Transaction Fees');
      bodyText(
        'A payment gateway fee of 2% + Rs.3 per transaction is applied to all ticket ' +
        'purchases. This fee is passed through from the payment processor.'
      );

      subsection('5.2 Service Fee');
      bodyText(
        'A nominal platform service fee may be charged to customers. This fee is ' +
        'separate from Manager commission and is not deducted from your earnings.'
      );

      // =====================================================================
      // SECTION 6: CONTENT MODERATION
      // =====================================================================

      sectionHeader('CONTENT MODERATION', '06');

      bodyText(
        'All events are subject to review by City Pulse moderation team before ' +
        'publication. Events that violate guidelines will be declined with specific ' +
        'feedback for corrections.'
      );

      subsection('6.1 Approval Process');
      listItem('• Events submitted for review within 24 hours');
      listItem('• Approval or decline notification via email');
      listItem('• Opportunity to revise and resubmit declined events');
      listItem('• Expedited review for verified Managers');

      subsection('6.2 Violations');
      bodyText(
        'Repeated violations of content guidelines may result in suspension or ' +
        'termination of Manager privileges.'
      );

      // =====================================================================
      // SECTION 7: LIABILITY & INDEMNIFICATION
      // =====================================================================

      sectionHeader('LIABILITY & INDEMNIFICATION', '07');

      subsection('7.1 Platform Liability');
      bodyText(
        'City Pulse acts as a facilitation platform and is not liable for event ' +
        'content, attendee safety, venue issues, or any disputes arising between ' +
        'Managers and attendees.'
      );

      subsection('7.2 Manager Indemnification');
      bodyText(
        'Managers agree to indemnify and hold harmless City Pulse from any claims, ' +
        'damages, or losses arising from their events or conduct.'
      );

      // =====================================================================
      // SECTION 8: TERM & TERMINATION
      // =====================================================================

      sectionHeader('TERM & TERMINATION', '08');

      subsection('8.1 Agreement Term');
      bodyText(
        'This Agreement remains in effect indefinitely unless terminated by either ' +
        'party with 30 days written notice.'
      );

      subsection('8.2 Termination');
      bodyText(
        'City Pulse may terminate this Agreement immediately for violation of terms, ' +
        'fraudulent activity, or conduct that harms the platform reputation.'
      );

      // =====================================================================
      // SECTION 9: SUPPORT & CONTACT
      // =====================================================================

      sectionHeader('SUPPORT & CONTACT', '09');

      bodyText(
        'For questions about this Agreement or any platform-related matters, please ' +
        'contact our support team.'
      );

      listItem('• Email: support@citypulse.in');
      listItem('• Phone: +91 XXXXX XXXXX');
      listItem('• Response Time: Within 24 hours');

      // =====================================================================
      // SIGNATURE PAGE
      // =====================================================================

      doc.addPage();

      // Signature Header
      doc.rect(0, 0, 595.28, 120).fill('#050505');
      doc.fillColor('#ffffff')
         .fontSize(28)
         .font('Helvetica-Bold')
         .text('ACCEPTANCE OF TERMS', 50, 40);

      doc.fontSize(12)
         .font('Helvetica')
         .fillColor('#94a3b8')
         .text('By continuing to use the Manager Portal, you acknowledge that you have', 50, 80);
      doc.text('read, understood, and agreed to be bound by this Agreement.', 50, 95);

      // Electronic Signature Notice
      doc.fontSize(11)
         .fillColor('#475569')
         .font('Helvetica')
         .text(
           'This Agreement is executed electronically. Your continued use of the City Pulse ' +
           'Manager Portal after the effective date constitutes your acceptance of these terms.',
           50,
           200,
           { width: 495, align: 'justify', lineGap: 4 }
         );

      // Contact Info Footer
      doc.moveTo(50, 700)
         .lineTo(545, 700)
         .lineWidth(1)
         .stroke('#e2e8f0');

      doc.fontSize(10)
         .fillColor('#94a3b8')
         .text('City Pulse © 2026', 50, 720);
      doc.text('This document is legally binding.', 50, 735);

      // Finalize PDF
      doc.end();

    } catch (err) {
      reject(err);
    }
  });
};

/**
 * Caches the PDF in memory for reuse across multiple approvals
 */
let cachedPdf: Buffer | null = null;
let cacheTimestamp: number | null = null;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export const getCachedManagerTermsPdf = async (): Promise<Buffer> => {
  const now = Date.now();

  if (cachedPdf && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedPdf;
  }

  cachedPdf = await generateManagerTermsPdf();
  cacheTimestamp = now;
  return cachedPdf;
};

/**
 * Clears the PDF cache (call after updating terms)
 */
export const clearManagerTermsCache = (): void => {
  cachedPdf = null;
  cacheTimestamp = null;
};
