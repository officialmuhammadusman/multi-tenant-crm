// src/components/ui/pagination-bar.tsx
'use client';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './button';

interface PaginationBarProps {
  hasPrev: boolean;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
  isFetching?: boolean;
}

export function PaginationBar({ hasPrev, hasMore, onPrev, onNext, isFetching }: PaginationBarProps) {
  return (
    <div className="flex items-center justify-between mt-4">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev || isFetching} className="gap-1">
        <ChevronLeft className="h-4 w-4" /> Previous
      </Button>
      {isFetching && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      )}
      <Button variant="outline" size="sm" onClick={onNext} disabled={!hasMore || isFetching} className="gap-1">
        Next <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
