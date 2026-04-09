'use client';
// src/components/layout/Providers.tsx
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import { store } from '@/store';
import { AuthProvider } from './AuthProvider';
import { ErrorBoundary } from './ErrorBoundary';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <ErrorBoundary>
        <AuthProvider>
          {children}
        </AuthProvider>
      </ErrorBoundary>
      {/* Toaster outside AuthProvider — avoids React.Children.only issues */}
      <Toaster position="top-right" richColors closeButton expand={false} />
    </Provider>
  );
}
