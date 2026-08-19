/**
 * Sends ONE of every email type through the ACTIVE provider (per EMAIL_PROVIDER
 * in .env) so all templates can be verified at the test recipient.
 *
 * Requires EMAIL_TEST_MODE=true in .env — everything then routes to
 * TEST_EMAIL_RECIPIENT regardless of the "to" addresses used below.
 *
 * Usage: npx tsx scripts/send-test-emails.ts
 */
import PDFDocument from 'pdfkit';
import * as email from '../src/utils/emailProvider.js';

const done: string[] = [];
const failed: string[] = [];

const run = async (name: string, fn: () => Promise<unknown>) => {
  try {
    await fn();
    done.push(name);
  } catch (err) {
    failed.push(`${name}: ${(err as Error).message}`);
  }
};

// Small placeholder PDF for the ticket attachment test
const placeholderPdf = (): Promise<Buffer> =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.fontSize(24).text('CITY PULSE — TEST TICKET PDF', { align: 'center' });
    doc.end();
  });

const testEvent = {
  _id: '68d0f1a2b3c4d5e6f7a8b9c0',
  title: 'Sunburn Festival 2026',
  date: new Date('2026-09-05'),
  time: '19:00',
  location: { venueName: 'Mahalaxmi Race Course, Mumbai', address: 'Mahalaxmi, Mumbai' },
  description: 'Test event',
};

const testOrder = {
  _id: '68d0f1a2b3c4d5e6f7a8b9c1',
  items: [
    { name: 'City Pulse Oversized Tee', price: 1299, quantity: 1, discountPercent: 10 },
    { name: 'Glow Wristband', price: 399, quantity: 2 },
  ],
  totalAmount: 2008,
  customer: {
    name: 'Riya Sharma',
    email: 'riya@example.com',
    phone: '+91 98200 12345',
    address: '221B Bandra West, Mumbai 400050',
  },
};

const main = async () => {
  console.log(`Provider: ${process.env.EMAIL_PROVIDER || 'resend'} | Test mode: ${process.env.EMAIL_TEST_MODE}`);
  console.log(`Recipient: ${email.getTestRecipient()}\n`);

  await run('welcome', () => email.sendWelcomeEmail('user@example.com', 'Aarav'));
  await run('otp', () => email.sendOtpVerificationEmail('user@example.com', '458291'));
  await run('passwordReset', () =>
    email.sendPasswordResetEmail('user@example.com', 'Aarav', 'http://localhost:8080/reset-password?token=demo')
  );
  await run('ticket (with PDF)', async () =>
    email.sendTicketEmail('user@example.com', 'Aarav', testEvent, await placeholderPdf())
  );
  await run('accountSetup (guest checkout)', () =>
    email.sendAccountSetupEmail('guest@example.com', 'Meera', 'http://localhost:8080/set-password?token=demo')
  );
  await run('reminder', () =>
    email.sendReminderEmail('user@example.com', 'Aarav', testEvent.title, '2026-09-04', '19:00')
  );
  await run('review', () => email.sendReviewEmail('user@example.com', 'Aarav', testEvent.title));
  await run('managerSignup (admin notify)', () =>
    email.sendManagerSignUpNotificationToAdmin('Vikram Nair', 'vikram@example.com')
  );
  await run('managerApproval (with terms PDF)', () =>
    email.sendManagerApprovalEmail('vikram@example.com', 'Vikram Nair')
  );
  await run('eventApproval', () =>
    email.sendEventApprovalEmail('vikram@example.com', 'Vikram Nair', testEvent.title)
  );
  await run('eventDecline', () =>
    email.sendEventDeclineEmail('vikram@example.com', 'Vikram Nair', testEvent.title, 'Ticket pricing missing — please add at least one paid tier.')
  );
  await run('storeOrder (to store)', () =>
    email.sendStoreOrderEmail('store@example.com', 'Pulse Merch Store', testOrder)
  );
  await run('customerOrder', () =>
    email.sendCustomerOrderEmail('riya@example.com', 'Riya', 'Pulse Merch Store', testOrder)
  );
  await run('storeOwnerWelcome (with temp password)', () =>
    email.sendStoreOwnerWelcomeEmail('owner@example.com', 'Kabir', 'Pulse Merch Store', 'http://localhost:8080/store-owner/login', 'TempPass9f2a')
  );
  await run('marketingBoost (admin notify)', () =>
    email.sendMarketingBoostRequestEmail('Vikram Nair', 'vikram@example.com', {
      eventTitle: testEvent.title,
      plan: 'gold',
      igHandle: '@sunburn.official',
      phone: '+91 98200 12345',
      message: 'Want to push this across Reels the week before.',
    })
  );

  console.log(`\n✅ Sent (${done.length}):`);
  done.forEach((d) => console.log(`  - ${d}`));
  if (failed.length) {
    console.log(`\n❌ Failed (${failed.length}):`);
    failed.forEach((f) => console.log(`  - ${f}`));
    process.exitCode = 1;
  }
};

main();
