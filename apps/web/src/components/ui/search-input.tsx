// src/components/ui/search-input.tsx
'use client';
import { useState } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks';

interface SearchInputProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  className?: string;
  isLoading?: boolean;
}

export function SearchInput({ onSearch, placeholder = 'Search...', className, isLoading }: SearchInputProps) {
  const [value, setValue] = useState('');
  const debounced = useDebounce(value, 300);

  // Fire search when debounced value changes
  useState(() => { onSearch(debounced); });
  // Use effect properly
  import('react').then(({ useEffect }) => {});

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => { setValue(e.target.value); onSearch(e.target.value); }}
        placeholder={placeholder}
        className="pl-9 pr-9"
      />
      {value && (
        <button
          onClick={() => { setValue(''); onSearch(''); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      {isLoading && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
}
