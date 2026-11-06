import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (items: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5;

    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg" style={{ background: '#ffffff', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e2e8f0' }}>
      {/* Items per page selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm" style={{ color: '#6b7280' }}>Rows per page:</span>
        <select
          value={itemsPerPage}
          onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
          className="px-3 py-2 rounded-lg border text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          style={{ borderColor: '#e2e8f0', color: '#0f172a', background: '#ffffff' }}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
      </div>

      {/* Page info */}
      <div className="text-xs font-medium" style={{ color: '#64748b' }}>
        {startItem}-{endItem} of {totalItems}
      </div>

      {/* Page navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-lg transition-shadow disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm cursor-pointer"
          style={{ color: '#64748b', background: currentPage === 1 ? 'transparent' : '#f8fafc' }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && onPageChange(page)}
              disabled={page === '...'}
              className={`min-w-[2.5rem] h-9 px-3 rounded-lg text-xs font-semibold transition-shadow ${
                page === currentPage
                  ? 'cursor-pointer'
                  : page === '...'
                  ? 'cursor-default'
                  : 'hover:shadow-sm cursor-pointer'
              }`}
              style={{
                background: page === currentPage ? '#1e3a8a' : page === '...' ? 'transparent' : '#f8fafc',
                color: page === currentPage ? '#ffffff' : '#64748b',
              }}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="p-2 rounded-lg transition-shadow disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-sm cursor-pointer"
          style={{ color: '#64748b', background: currentPage === totalPages ? 'transparent' : '#f8fafc' }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
