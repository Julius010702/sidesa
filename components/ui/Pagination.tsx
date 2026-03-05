'use client'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  totalItems?: number
  perPage?: number
}

export default function Pagination({ page, totalPages, onPageChange, totalItems, perPage }: PaginationProps) {
  if (totalPages <= 1) return null

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const start = perPage ? (page - 1) * perPage + 1 : null
  const end = perPage && totalItems ? Math.min(page * perPage, totalItems) : null

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
      {totalItems && start && end && (
        <p className="text-xs text-gray-400">
          Menampilkan {start}–{end} dari {totalItems} data
        </p>
      )}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ‹
        </button>
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium transition-colors ${
              p === page
                ? 'bg-green-600 text-white border border-green-600'
                : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  )
}