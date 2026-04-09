import { Badge } from '@/components/ui/badge';

const activityConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  CREATED:  { label: 'Created',  variant: 'default'     },
  UPDATED:  { label: 'Updated',  variant: 'secondary'   },
  DELETED:  { label: 'Deleted',  variant: 'destructive' },
  ASSIGNED: { label: 'Assigned', variant: 'outline'     },
};

interface ActivityBadgeProps { action: string; className?: string }

export function ActivityBadge({ action }: ActivityBadgeProps) {
  const config = activityConfig[action] ?? { label: action, variant: 'outline' as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
