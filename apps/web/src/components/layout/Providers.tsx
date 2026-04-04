// src/components/layout/Providers.tsx
'use client';
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
          <Toaster position="top-right" richColors closeButton expand={false} />
        </AuthProvider>
      </ErrorBoundary>
    </Provider>
  );
}
