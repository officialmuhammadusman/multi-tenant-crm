'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/lib/routes';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error('Global error:', error); }, [error]);

  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-2">Something went wrong</h1>
          <p className="text-muted-foreground text-sm">An unexpected error occurred. Our team has been notified.</p>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-left">
              <p className="text-xs font-mono text-destructive break-all">{error.message}</p>
              {error.digest && <p className="text-xs text-muted-foreground mt-1">Digest: {error.digest}</p>}
            </div>
          )}
        </div>
        <div className="flex gap-3 justify-center">
          <Button onClick={reset} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Try again
          </Button>
          {/* No asChild — use plain anchor inside a styled div */}
          <Link
            href={ROUTES.customers.list}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 transition-colors"
          >
            <Home className="w-4 h-4" />
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
