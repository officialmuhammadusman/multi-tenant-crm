// src/components/ui/error-banner.tsx
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './button';

interface ErrorBannerProps { message: string; onRetry?: () => void }

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
      <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
      <p className="text-sm text-destructive flex-1">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="gap-1 flex-shrink-0">
          <RefreshCw className="h-3 w-3" /> Retry
        </Button>
      )}
    </div>
  );
}
