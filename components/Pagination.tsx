"use client";

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  label: string;
};

export function Pagination({
  currentPage,
  pageSize,
  totalItems,
  onPageChange,
  label,
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / pageSize);
  if (totalPages <= 1) return null;

  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);

  return (
    <nav className="pagination" aria-label={`Paginación de ${label}`}>
      <span className="pagination-summary">
        {firstItem}–{lastItem} de {totalItems}
      </span>
      <div className="pagination-controls">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label={`Página anterior de ${label}`}
        >
          ←
        </button>
        <span>
          Página {currentPage} de {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label={`Página siguiente de ${label}`}
        >
          →
        </button>
      </div>
    </nav>
  );
}
