/**
 * Unified Email Provider Switch
 * Switches between Resend and MSG91 based on EMAIL_PROVIDER environment variable
 *
 * Set EMAIL_PROVIDER=msg91 to use MSG91, or EMAIL_PROVIDER=resend (default) to use Resend
 */

import * as ResendService from './emailService.js';
import * as MSG91Service from './msg91EmailService.js';

const EMAIL_PROVIDER = process.env.EMAIL_PROVIDER || 'resend';

// Log which provider is being used
console.log(`📧 Email Provider: ${EMAIL_PROVIDER.toUpperCase()}`);

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

export const sendPartnerContractEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendPartnerContractEmail
  : ResendService.sendPartnerContractEmail;

export const sendOtpVerificationEmail = EMAIL_PROVIDER === 'msg91'
  ? MSG91Service.sendOtpVerificationEmail
  : ResendService.sendOtpVerificationEmail;
