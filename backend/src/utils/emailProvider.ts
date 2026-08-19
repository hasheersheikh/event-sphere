/**
 * Unified Email Provider Switch
 * Switches between Resend and MSG91 based on EMAIL_PROVIDER environment variable
 *
 * Set EMAIL_PROVIDER=msg91 to use MSG91, or EMAIL_PROVIDER=resend (default) to use Resend
 *
 * Test Mode: Set EMAIL_TEST_MODE=true to route all emails to TEST_EMAIL_RECIPIENT (default: pacifista)
 */

import * as ResendService from './emailService.js';
import * as MSG91Service from './msg91EmailService.js';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';
const EMAIL_TEST_MODE = process.env.EMAIL_TEST_MODE === 'true';
const TEST_EMAIL_RECIPIENT = process.env.TEST_EMAIL_RECIPIENT || 'pacifistatechnologies@gmail.com';

// Log which provider is being used
console.log(`📧 Email Provider: ${EMAIL_PROVIDER.toUpperCase()}`);
if (EMAIL_TEST_MODE) {
  console.log(`⚠️ EMAIL TEST MODE ENABLED - All emails will be sent to: ${TEST_EMAIL_RECIPIENT}`);
}

// Export all functions with provider switching
export const sendTicketEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendTicketEmail
  : ResendService.sendTicketEmail;

export const sendReminderEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendReminderEmail
  : ResendService.sendReminderEmail;

export const sendReviewEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendReviewEmail
  : ResendService.sendReviewEmail;

export const sendPasswordResetEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendPasswordResetEmail
  : ResendService.sendPasswordResetEmail;

export const sendWelcomeEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendWelcomeEmail
  : ResendService.sendWelcomeEmail;

export const sendManagerSignUpNotificationToAdmin = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendManagerSignUpNotificationToAdmin
  : ResendService.sendManagerSignUpNotificationToAdmin;

export const sendManagerApprovalEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendManagerApprovalEmail
  : ResendService.sendManagerApprovalEmail;

export const sendEventApprovalEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendEventApprovalEmail
  : ResendService.sendEventApprovalEmail;

export const sendStoreOrderEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendStoreOrderEmail
  : ResendService.sendStoreOrderEmail;

export const sendCustomerOrderEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendCustomerOrderEmail
  : ResendService.sendCustomerOrderEmail;

export const sendAccountSetupEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendAccountSetupEmail
  : ResendService.sendAccountSetupEmail;

export const sendStoreOwnerWelcomeEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendStoreOwnerWelcomeEmail
  : ResendService.sendStoreOwnerWelcomeEmail;

export const sendEventDeclineEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendEventDeclineEmail
  : ResendService.sendEventDeclineEmail;

export const sendMarketingBoostRequestEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendMarketingBoostRequestEmail
  : ResendService.sendMarketingBoostRequestEmail;

export const sendOtpVerificationEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendOtpVerificationEmail
  : ResendService.sendOtpVerificationEmail;

// Export test mode status for checking elsewhere
export const isTestMode = () => EMAIL_TEST_MODE;
export const getTestRecipient = () => TEST_EMAIL_RECIPIENT;
