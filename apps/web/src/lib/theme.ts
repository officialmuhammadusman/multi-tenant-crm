// src/lib/theme.ts — single source of truth for visual tokens
// Change here → reflects everywhere. Tailwind config imports this.

export const theme = {
  activityBadges: {
    CUSTOMER_CREATED:  { className: 'bg-success-100 text-success-800',  label: 'Customer Created'  },
    CUSTOMER_UPDATED:  { className: 'bg-gray-100 text-gray-700',        label: 'Customer Updated'  },
    CUSTOMER_DELETED:  { className: 'bg-danger-100 text-danger-800',    label: 'Customer Deleted'  },
    CUSTOMER_RESTORED: { className: 'bg-teal-100 text-teal-800',        label: 'Customer Restored' },
    NOTE_ADDED:        { className: 'bg-info-100 text-info-800',        label: 'Note Added'        },
    CUSTOMER_ASSIGNED: { className: 'bg-warning-100 text-warning-800',  label: 'Customer Assigned' },
  } as Record<string, { className: string; label: string }>,

  roleColors: {
    SUPER_ADMIN: 'bg-danger-100 text-danger-800',
    ADMIN:       'bg-primary-100 text-primary-800',
    MEMBER:      'bg-gray-100 text-gray-700',
  } as Record<string, string>,
} as const;
