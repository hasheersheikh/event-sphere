import api from "./api";

// Error bodies arrive as Blobs when responseType is "blob" — pull the server's
// message out of them instead of showing a generic failure.
const extractMessage = async (data: unknown, fallback: string): Promise<string> => {
  try {
    if (data instanceof Blob) return JSON.parse(await data.text()).message || fallback;
    if (data && typeof data === "object") return (data as any).message || fallback;
  } catch {
    // unreadable body — fall through to the generic message
  }
  return fallback;
};

/**
 * Downloads a confirmed booking's ticket PDF — the exact artifact the
 * confirmation email carries, including the scanner QR. Must go through the
 * api client (Bearer header; there are no cookies, so a plain link would 403).
 * Guests authenticate with the booking's signed download token instead.
 */
export async function downloadTicketPdf(bookingId: string, token?: string): Promise<void> {
  let blob: Blob;
  try {
    const res = await api.get(`/bookings/${bookingId}/ticket`, {
      params: token ? { token } : undefined,
      responseType: "blob",
    });
    blob = res.data as Blob;
  } catch (err: any) {
    throw new Error(await extractMessage(err.response?.data, "Could not download ticket."));
  }

  // A 200 with a JSON body means the server sent an error object, not a PDF.
  if (blob.type === "application/json") {
    throw new Error(await extractMessage(blob, "Could not download ticket."));
  }

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Ticket-${bookingId.slice(-8)}.pdf`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
