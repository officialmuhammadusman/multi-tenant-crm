// src/components/organizations/CreateOrganizationForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CreateOrganizationSchema } from '@crm/types';
import type { Organization } from '@crm/types';
import { organizationService } from '@/lib/api/services';
import { useAsync } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form';
import { DialogFooter } from '@/components/ui/dialog';

type CreateOrgValues = z.infer<typeof CreateOrganizationSchema>;

interface CreateOrganizationFormProps {
  onSuccess: (org: Organization) => void;
  onCancel: () => void;
}

export function CreateOrganizationForm({ onSuccess, onCancel }: CreateOrganizationFormProps) {
  const { isLoading, run } = useAsync<Organization>();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateOrgValues>({
    resolver: zodResolver(CreateOrganizationSchema), // ← from @crm/types
  });

  const onSubmit = async (data: CreateOrgValues) => {
    await run(() => organizationService.create(data), {
      onSuccess: (org) => {
        toast.success(`Organization "${org.name}" created`);
        onSuccess(org);
      },
      onError: (e) => toast.error(e),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Organization name" error={errors.name?.message} required hint="Minimum 2 characters">
        <Input placeholder="Acme Inc." {...register('name')} />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>Create organization</Button>
      </DialogFooter>
    </form>
  );
}
