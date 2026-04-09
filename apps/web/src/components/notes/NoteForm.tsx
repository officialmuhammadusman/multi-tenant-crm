// src/components/notes/NoteForm.tsx
'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import type { z } from 'zod';
import { CreateNoteSchema } from '@crm/types';
import type { Note } from '@crm/types';
import { noteService } from '@/lib/api/services';
import { useAsync } from '@/hooks';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField } from '@/components/ui/form';

type NoteFormValues = z.infer<typeof CreateNoteSchema>;

interface NoteFormProps {
  customerId: string;
  onSuccess: (note: Note) => void;
}

export function NoteForm({ customerId, onSuccess }: NoteFormProps) {
  const { isLoading, run } = useAsync<Note>();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NoteFormValues>({
    resolver: zodResolver(CreateNoteSchema), // ← from @crm/types
    defaultValues: { content: '', customerId },
  });

  const onSubmit = async (data: NoteFormValues) => {
    await run(() => noteService.create(data), {
      onSuccess: (note) => {
        toast.success('Note added');
        reset({ content: '', customerId });
        onSuccess(note);
      },
      onError: (e) => toast.error(e),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
      <FormField label="Add a note" error={errors.content?.message}>
        <Textarea
          placeholder="Write a note about this customer..."
          rows={3}
          {...register('content')}
        />
      </FormField>
      {/* customerId is hidden — always from props, never typed by user */}
      <input type="hidden" {...register('customerId')} />

      <div className="flex justify-end">
        <Button type="submit" size="sm" isLoading={isLoading}>
          Add note
        </Button>
      </div>
    </form>
  );
}
