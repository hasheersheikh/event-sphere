# Email Provider Switch Guide

Event-Sphere supports dual email providers - **Resend** (default) and **MSG91**. Both providers are fully implemented and can be switched instantly without code changes.

## Quick Switch

### Use MSG91 Email Service
```bash
# In your backend .env file:
EMAIL_PROVIDER=msg91
MSG91_API_KEY=your_msg91_api_key
MSG91_EMAIL_FROM=noreply@yourdomain.com
```

### Use Resend Email Service (default)
```bash
# In your backend .env file:
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_your_api_key
```

Then restart your backend:
```bash
docker-compose restart backend
```

## Provider Comparison

| Feature | Resend | MSG91 |
|---------|-------|-------|
| **Cost** | Free tier: 3,000 emails/month | Pay-as-you-go, cheaper for India |
| **Deliverability** | Excellent | Good in India |
| **Email Validation** | Not built-in | ✅ Built-in API |
| **CSS Inliner** | Not built-in | ✅ Built-in API |
| **Templates** | HTML only | Template-based |
| **Attachments** | ✅ Supported | ✅ Supported |
| **Best For** | Global audience | India-focused apps |

## MSG91 Features

### Email Validation
Validate if an email address is active/deliverable before sending:
```typescript
import { validateEmail } from '../utils/emailProvider.js';

const result = await validateEmail('user@example.com');
// Returns: { valid: true, deliverable: true, ... }
```

### CSS Inliner
Automatically inline CSS styles within HTML emails:
```typescript
import { inlineEmailCSS } from '../utils/emailProvider.js';

const inlinedHtml = await inlineEmailCSS(yourHtmlTemplate);
```

## Email Types Supported

All email functions work identically regardless of provider:

- ✅ Ticket emails with PDF attachments
- ✅ Reminder emails
- ✅ Review request emails
- ✅ Password reset emails
- ✅ Welcome emails
- ✅ Manager approval emails
- ✅ Event approval/decline emails
- ✅ Store order emails (customer & store)
- ✅ Account setup emails
- ✅ Partner onboarding emails
- ✅ Marketing boost requests

## Configuration Checklist

### For Resend (default):
1. Get API key from https://resend.com
2. Set `RESEND_API_KEY=re_...`
3. Optionally set `EMAIL_FROM=Sender <email@domain.com>`

### For MSG91:
1. Get API key from https://msg91.com
2. Set `EMAIL_PROVIDER=msg91`
3. Set `MSG91_API_KEY=your_key`
4. Set `MSG91_EMAIL_FROM=noreply@yourdomain.com`
5. (Optional) Create templates in MSG91 dashboard for reusable emails

## Monitoring

When the backend starts, it logs which email provider is active:
```
📧 Email Provider: MSG91
```
or
```
📧 Email Provider: RESEND
```

## Reverting

To revert back to Resend from MSG91:
1. Remove or comment out `EMAIL_PROVIDER=msg91` (defaults to resend)
2. Or set `EMAIL_PROVIDER=resend` explicitly
3. Restart backend

## File Structure

```
backend/src/utils/
├── emailService.ts         # Resend implementation
├── msg91EmailService.ts    # MSG91 implementation
└── emailProvider.ts        # Unified switch (imports from above)
```

All controllers import from `emailProvider.ts` which routes to the correct implementation based on `EMAIL_PROVIDER` env var.
