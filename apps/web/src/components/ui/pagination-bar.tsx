'use client';
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';

interface PaginationBarProps {
  hasPrev: boolean;
  hasMore: boolean;
  onPrev: () => void;
  onNext: () => void;
  isFetching?: boolean;
}

export function PaginationBar({ hasPrev, hasMore, onPrev, onNext, isFetching }: PaginationBarProps) {
  return (
    <Pagination className="mt-4">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={onPrev}
            aria-disabled={!hasPrev || isFetching}
            className={(!hasPrev || isFetching) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
        {isFetching && (
          <PaginationItem>
            <div className="flex items-center gap-2 px-4 text-sm text-muted-foreground">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          </PaginationItem>
        )}
        <PaginationItem>
          <PaginationNext
            onClick={onNext}
            aria-disabled={!hasMore || isFetching}
            className={(!hasMore || isFetching) ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
