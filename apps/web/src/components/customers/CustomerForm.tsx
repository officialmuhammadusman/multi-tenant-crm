// src/components/customers/CustomerForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CreateCustomerSchema, UpdateCustomerSchema } from '@crm/types';
import type { Customer } from '@crm/types';
import { customerService } from '@/lib/api/services';
import { extractApiError } from '@/lib/utils';
import { useCurrentUser, useAsync } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form-field';
import { DialogFooter } from '@/components/ui/dialog';

type CreateValues = z.infer<typeof CreateCustomerSchema>;
type UpdateValues = z.infer<typeof UpdateCustomerSchema>;

interface CustomerFormProps {
  mode: 'create' | 'edit';
  customer?: Customer;
  onSuccess: (customer: Customer) => void;
  onCancel: () => void;
}

export function CustomerForm({ mode, customer, onSuccess, onCancel }: CustomerFormProps) {
  const { isLoading, run } = useAsync<Customer>();

  // Use CreateCustomerSchema for create, UpdateCustomerSchema for edit
  const schema = mode === 'create' ? CreateCustomerSchema : UpdateCustomerSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateValues>({
    resolver: zodResolver(schema), // ← schema from @crm/types, not redefined
    defaultValues: customer
      ? { name: customer.name, email: customer.email, phone: customer.phone ?? '' }
      : {},
  });

  const onSubmit = async (data: CreateValues) => {
    const result = await run(
      () =>
        mode === 'create'
          ? customerService.create(data)
          : customerService.update(customer!.id, data),
      {
        onSuccess: (c) => {
          toast.success(mode === 'create' ? 'Customer created' : 'Customer updated');
          onSuccess(c);
        },
        onError: (e) => toast.error(e),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Full name" error={errors.name?.message} required>
        <Input placeholder="Jane Smith" {...register('name')} />
      </FormField>

      <FormField label="Email address" error={errors.email?.message} required>
        <Input type="email" placeholder="jane@example.com" {...register('email')} />
      </FormField>

      <FormField label="Phone number" error={errors.phone?.message}>
        <Input type="tel" placeholder="+1 (555) 000-0000" {...register('phone')} />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? 'Create customer' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}
