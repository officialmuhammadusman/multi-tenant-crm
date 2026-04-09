import { AlertCircle, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface ErrorBannerProps { message: string; onRetry?: () => void }

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        {message}
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry} className="ml-4 gap-1">
            <RefreshCw className="h-3 w-3" /> Retry
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
}
