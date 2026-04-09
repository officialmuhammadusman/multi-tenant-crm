// src/components/auth/LoginForm.tsx — pure UI, logic in useAuth hook
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { z } from 'zod';
import { LoginSchema } from '@crm/types';
import { useAuth } from '@/hooks';
import { Button }    from '@/components/ui/button';
import { Input }     from '@/components/ui/input';
import { FormField } from '../ui/form-field';

type LoginFormValues = z.infer<typeof LoginSchema>;

export function LoginForm() {
  const { login, isLoading } = useAuth();

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(LoginSchema),
  });

  return (
    <form onSubmit={handleSubmit(login)} className="space-y-4" noValidate>
      <FormField label="Email address" error={errors.email?.message} required>
        <Input type="email" autoComplete="email" placeholder="you@example.com" {...register('email')} />
      </FormField>
      <FormField label="Password" error={errors.password?.message} required>
        <Input type="password" autoComplete="current-password" placeholder="••••••••" {...register('password')} />
      </FormField>
      <Button type="submit" className="w-full" isLoading={isLoading}>
        {isLoading ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
}
