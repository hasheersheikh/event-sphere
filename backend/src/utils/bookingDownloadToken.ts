import jwt from 'jsonwebtoken';

const PURPOSE = 'ticket_download';
const TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

/**
 * Guest bookings belong to a passwordless auto-created user, so the buyer may
 * have no session to authenticate with when they want their ticket PDF. Every
 * confirmed-booking response carries this signed single-purpose token so the
 * buyer (and only the buyer) can download their own ticket — e.g. when the
 * confirmation email failed to arrive. Returns null when JWT_SECRET is unset;
 * session-based auth on the download endpoint still works without it.
 */
export const signTicketDownloadToken = (bookingId: string): string | null => {
  if (!process.env.JWT_SECRET) return null;
  return jwt.sign({ id: bookingId, purpose: PURPOSE }, process.env.JWT_SECRET, {
    expiresIn: TTL_SECONDS,
  });
};

export const verifyTicketDownloadToken = (token: unknown, bookingId: string): boolean => {
  if (!process.env.JWT_SECRET || typeof token !== 'string') return false;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as { id?: string; purpose?: string };
    return decoded.purpose === PURPOSE && decoded.id === bookingId;
  } catch {
    return false;
  }
};
