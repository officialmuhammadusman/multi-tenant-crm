// src/components/customers/AssignCustomerDropdown.tsx
'use client';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { z } from 'zod';
import { AssignCustomerSchema } from '@crm/types';
import type { Customer, User } from '@crm/types';
import { customerService, userService } from '@/lib/api/services';
import { useAsync, useCurrentUser } from '@/hooks';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

// Validate the payload with the same schema used on the backend
type AssignValues = z.infer<typeof AssignCustomerSchema>;

interface AssignCustomerDropdownProps {
  customer: Customer;
  onAssigned: (updated: Customer) => void;
}

export function AssignCustomerDropdown({ customer, onAssigned }: AssignCustomerDropdownProps) {
  const { isAdmin, isSuperAdmin } = useCurrentUser();
  const { isLoading, run } = useAsync<Customer>();
  const [users, setUsers]   = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  // Admins and super admins see this — members do not
  const canAssign = isAdmin || isSuperAdmin;

  useEffect(() => {
    if (!canAssign) return;
    setLoadingUsers(true);
    userService.list()
      .then(setUsers)
      .catch(() => toast.error('Could not load users'))
      .finally(() => setLoadingUsers(false));
  }, [canAssign]);

  if (!canAssign) return null;

  const handleAssign = async (userId: string) => {
    // Validate with shared schema before sending
    const parsed = AssignCustomerSchema.safeParse({ userId });
    if (!parsed.success) { toast.error('Invalid user selection'); return; }

    await run(
      () => customerService.assign(customer.id, parsed.data),
      {
        onSuccess: (updated) => {
          toast.success('Customer assigned successfully');
          onAssigned(updated);
        },
        onError: (e) => toast.error(e), // Shows exact server message e.g. "User has reached the maximum of 5 active customers"
      },
    );
  };

  if (loadingUsers) return <Skeleton className="h-10 w-48" />;

  return (
    <Select
      defaultValue={customer.assignedTo ?? undefined}
      onValueChange={handleAssign}
      disabled={isLoading}
    >
      <SelectTrigger className="w-48">
        <SelectValue placeholder="Assign to user..." />
      </SelectTrigger>
      <SelectContent>
        {users.map((u) => (
          <SelectItem key={u.id} value={u.id}>
            {u.name} ({u.role === 'ADMIN' ? 'Admin' : 'Member'})
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
