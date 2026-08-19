// Session-scoped ledger of files uploaded through the backend /upload routes
// during the current wizard visit. The event wizard uploads media at step 1,
// but the event that would reference those files may never be created — the
// user can abandon at step 2/3, navigate away, or refresh. Everything still
// in this set at that point is an orphan the server can safely delete
// (it double-checks ownership + references before removing anything).
//
// Module-level on purpose: the upload hook lives in step components that
// unmount when the user moves between wizard steps — the set must outlive
// them. Pages reset it on mount so stale entries from a previous visit never
// leak into the next one.

const sessionUploads = new Set<string>();

export const trackSessionUpload = (url?: string) => {
  if (url) sessionUploads.add(url);
};

export const getSessionUploads = (): string[] => [...sessionUploads];

export const resetSessionUploads = () => sessionUploads.clear();

/** All upload URLs an event form's current values reference. */
export const collectEventMediaUrls = (values: {
  image?: string;
  eventVideo?: string;
  videoUrl?: string;
  artist?: { profileImage?: string };
  reels?: string[];
  lineup?: { image?: string }[];
}): string[] => {
  const urls = [values.image, values.eventVideo, values.videoUrl, values.artist?.profileImage, ...(values.reels || [])];
  (values.lineup || []).forEach((l) => urls.push(l.image));
  return urls.filter((u): u is string => !!u);
};

/**
 * Ask the backend to delete uploads that ended up unused. Fire-and-forget:
 * called from unmount/pagehide paths where the result can't be shown, using
 * `keepalive` so the request survives the page being torn down. The backend
 * only deletes files the caller uploaded that nothing references.
 */
export const deleteUnusedUploads = (urls: string[]) => {
  const relevant = urls.filter(Boolean);
  if (relevant.length === 0) return;

  const base = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  try {
    const stored = localStorage.getItem('user');
    const token = stored ? JSON.parse(stored)?.token : null;
    if (token) headers.Authorization = `Bearer ${token}`;
  } catch {
    // Not logged in — the backend would reject the call anyway
    return;
  }

  fetch(`${base}/upload/unused`, {
    method: 'DELETE',
    keepalive: true,
    headers,
    body: JSON.stringify({ urls: relevant.slice(0, 50) }),
  }).catch(() => {
    // Best-effort only — the orphan sweep cron catches anything this misses
  });
};
