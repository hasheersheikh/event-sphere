import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const disposableDomains: string[] = require('disposable-email-domains');

const BLOCKED_DOMAINS = new Set(disposableDomains);

export const isDisposableEmail = (email: string): boolean => {
  const domain = email.split('@')[1]?.toLowerCase().trim();
  if (!domain) return true;
  return BLOCKED_DOMAINS.has(domain);
};
