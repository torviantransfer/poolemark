/**
 * Shared Meta event_id builders.
 * Keep event ids deterministic where deduplication is required.
 */

export function getPurchaseEventId(orderId: string): string {
  return `purchase_${orderId}`;
}
