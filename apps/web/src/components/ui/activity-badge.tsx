// src/components/ui/activity-badge.tsx
import { cn } from '@/lib/utils';
import { theme } from '@/lib/theme';

interface ActivityBadgeProps { action: string; className?: string }

export function ActivityBadge({ action, className }: ActivityBadgeProps) {
  const config = theme.activityBadges[action] ?? { className: 'bg-gray-100 text-gray-700', label: action };
  return (
    <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold', config.className, className)}>
      {config.label}
    </span>
  );
}
