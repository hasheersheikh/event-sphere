import Event from '../models/Event.js';

interface TicketQty {
  type: string;
  quantity: number;
}

/**
 * Atomically reserves capacity for each ticket type against the event's current
 * sold/capacity snapshot. Rolls back everything already reserved in this call
 * if any ticket type can't be reserved (sold out or lost the race to another
 * concurrent booking), so a partial reservation never survives a failure.
 */
export async function reserveTickets(eventId: any, tickets: TicketQty[]): Promise<boolean> {
  const event = await Event.findById(eventId);
  if (!event) return false;

  const reserved: TicketQty[] = [];

  for (const item of tickets) {
    const tt = event.ticketTypes.find((t) => t.name === item.type);
    if (!tt) continue;

    if (tt.isSoldOut || tt.capacity - tt.sold < item.quantity) {
      await releaseTickets(eventId, reserved);
      return false;
    }

    const updated = await Event.findOneAndUpdate(
      {
        _id: eventId,
        'ticketTypes.name': item.type,
        'ticketTypes.sold': tt.sold,
      },
      { $inc: { 'ticketTypes.$.sold': item.quantity } },
    );

    if (!updated) {
      await releaseTickets(eventId, reserved);
      return false;
    }
    reserved.push(item);
  }

  return true;
}

/** Releases previously reserved capacity (cancellation, expiry, rollback). */
export async function releaseTickets(eventId: any, tickets: TicketQty[]): Promise<void> {
  for (const item of tickets) {
    await Event.updateOne(
      { _id: eventId, 'ticketTypes.name': item.type },
      { $inc: { 'ticketTypes.$.sold': -item.quantity } },
    );
  }
}
