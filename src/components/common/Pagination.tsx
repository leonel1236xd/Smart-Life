import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  page,
  totalPages,
  totalCount,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between gap-3 pt-4">
      <p className="text-xs text-slate-400 hidden sm:block">
        {totalCount} registro{totalCount !== 1 ? 's' : ''}
      </p>

      <div className="flex items-center gap-1.5 mx-auto sm:mx-0">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2333] disabled:opacity-30 disabled:pointer-events-none transition-colors active:scale-95"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((p) => {
            if (totalPages <= 5) return true;
            if (p === 1 || p === totalPages) return true;
            if (Math.abs(p - page) <= 1) return true;
            return false;
          })
          .reduce<(number | 'dots')[]>((acc, p, idx, arr) => {
            if (idx > 0 && p - (arr[idx - 1] as number) > 1) {
              acc.push('dots');
            }
            acc.push(p);
            return acc;
          }, [])
          .map((item, idx) =>
            item === 'dots' ? (
              <span key={`dots-${idx}`} className="px-1 text-slate-500 text-sm select-none">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPageChange(item)}
                className={`min-w-[36px] h-9 rounded-lg text-sm font-medium transition-colors active:scale-95 ${
                  item === page
                    ? 'bg-[#0084FF] text-white shadow-md shadow-blue-900/40'
                    : 'text-slate-400 hover:text-white hover:bg-[#1a2333]'
                }`}
              >
                {item}
              </button>
            )
          )}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1a2333] disabled:opacity-30 disabled:pointer-events-none transition-colors active:scale-95"
          aria-label="Página siguiente"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <p className="text-xs text-slate-400 sm:hidden">
        {page}/{totalPages}
      </p>
    </div>
  );
};
