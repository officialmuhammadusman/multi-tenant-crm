// src/components/users/CreateUserForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CreateUserSchema, UserRoleSchema } from '@crm/types';
import type { User } from '@crm/types';
import { userService } from '@/lib/api/services';
import { useAsync } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FormField } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DialogFooter } from '@/components/ui/dialog';
import { Controller } from 'react-hook-form';

type CreateUserValues = z.infer<typeof CreateUserSchema>;

// Only ADMIN and MEMBER roles can be created by an admin
// SUPER_ADMIN is seeded only — never created via UI
const ASSIGNABLE_ROLES = UserRoleSchema.options.filter((r) => r !== 'SUPER_ADMIN');

interface CreateUserFormProps {
  onSuccess: (user: User) => void;
  onCancel: () => void;
}

export function CreateUserForm({ onSuccess, onCancel }: CreateUserFormProps) {
  const { isLoading, run } = useAsync<User>();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CreateUserValues>({
    resolver: zodResolver(CreateUserSchema), // ← from @crm/types
    defaultValues: { role: 'MEMBER' },
  });

  const onSubmit = async (data: CreateUserValues) => {
    await run(() => userService.create(data), {
      onSuccess: (user) => {
        toast.success(`User ${user.name} created`);
        onSuccess(user);
      },
      onError: (e) => toast.error(e),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <FormField label="Full name" error={errors.name?.message} required>
        <Input placeholder="Jane Smith" {...register('name')} />
      </FormField>

      <FormField label="Email address" error={errors.email?.message} required>
        <Input type="email" placeholder="jane@company.com" {...register('email')} />
      </FormField>

      <FormField label="Password" error={errors.password?.message} required hint="Minimum 8 characters">
        <Input type="password" placeholder="••••••••" {...register('password')} />
      </FormField>

      <FormField label="Role" error={errors.role?.message} required>
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {ASSIGNABLE_ROLES.map((role) => (
                  <SelectItem key={role} value={role}>
                    {role === 'ADMIN' ? 'Admin' : 'Member'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FormField>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>Create user</Button>
      </DialogFooter>
    </form>
  );
}
