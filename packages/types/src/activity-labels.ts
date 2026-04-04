// packages/types/src/activity-labels.ts
// Single source of truth for human-readable activity log labels.
// Backend includes these in every ActivityLog response.
// Frontend reads them directly — no computation needed.

export const ACTIVITY_LABELS: Record<string, string> = {
  CUSTOMER_CREATED: 'Customer Created',
  CUSTOMER_UPDATED: 'Customer Updated',
  CUSTOMER_DELETED: 'Customer Deleted',
  CUSTOMER_RESTORED: 'Customer Restored',
  NOTE_ADDED: 'Note Added',
  CUSTOMER_ASSIGNED: 'Customer Assigned',
} as const;

export type ActivityAction = keyof typeof ACTIVITY_LABELS;

export function getActivityLabel(action: string): string {
  return ACTIVITY_LABELS[action] ?? action;
}
