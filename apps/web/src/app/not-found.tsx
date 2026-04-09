import Link from 'next/link';
import { Search, Home } from 'lucide-react';
import { ROUTES } from '@/lib/routes';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-muted/40 flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <p className="text-8xl font-bold text-muted-foreground/30 select-none">404</p>
        <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
          <Search className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold mb-2">Page not found</h1>
          <p className="text-muted-foreground text-sm">
            This page does not exist, has been moved, or you do not have permission to access it.
          </p>
        </div>
        <Link
          href={ROUTES.customers.list}
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 transition-colors"
        >
          <Home className="w-4 h-4" />
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}
