import React from 'react';
import PropTypes from 'prop-types';

const PaginationControls = ({
  currentPage,
  totalPages,
  onPageChange,
  maxVisiblePages = 5,
  className = '',
}) => {
  // Se não tivermos páginas ou apenas uma página, não exibimos a paginação
  if (!totalPages || totalPages <= 1) {
    return null;
  }

  // Função para gerar o intervalo de páginas visíveis
  const getVisiblePageNumbers = () => {
    // Se o número total de páginas for menor ou igual ao máximo de páginas visíveis
    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    // Número mínimo de páginas antes e depois da página atual
    const minSidePages = Math.floor(maxVisiblePages / 2);

    // Se estamos perto do início
    if (currentPage <= minSidePages) {
      return Array.from({ length: maxVisiblePages }, (_, i) => i + 1);
    }

    // Se estamos perto do fim
    if (currentPage >= totalPages - minSidePages) {
      return Array.from(
        { length: maxVisiblePages },
        (_, i) => totalPages - maxVisiblePages + i + 1
      );
    }

    // Estamos no meio, mostrar páginas em torno da atual
    return Array.from(
      { length: maxVisiblePages },
      (_, i) => currentPage - minSidePages + i
    );
  };

  // Páginas a serem exibidas
  const visiblePageNumbers = getVisiblePageNumbers();

  // Verificar se deve mostrar os links "Primeiro" e "Último"
  const showFirstLink = currentPage > Math.floor(maxVisiblePages / 2) + 1;
  const showLastLink = currentPage < totalPages - Math.floor(maxVisiblePages / 2);

  return (
    <nav className={`flex items-center space-x-1 ${className}`} aria-label="Paginação">
      {/* Botão "Anterior" */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`relative inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${
          currentPage === 1
            ? 'text-light-text-disabled dark:text-dark-text-disabled cursor-not-allowed'
            : 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-background dark:hover:bg-dark-border'
        }`}
        aria-label="Página anterior"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Link para a primeira página */}
      {showFirstLink && (
        <>
          <button
            onClick={() => onPageChange(1)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-background dark:hover:bg-dark-border rounded-md"
          >
            1
          </button>
          {visiblePageNumbers[0] > 2 && (
            <span className="relative inline-flex items-center px-1 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              ...
            </span>
          )}
        </>
      )}

      {/* Páginas numeradas */}
      {visiblePageNumbers.map((pageNumber) => (
        <button
          key={pageNumber}
          onClick={() => onPageChange(pageNumber)}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            currentPage === pageNumber
              ? 'bg-primary text-white'
              : 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-background dark:hover:bg-dark-border'
          }`}
          aria-current={currentPage === pageNumber ? 'page' : undefined}
        >
          {pageNumber}
        </button>
      ))}

      {/* Link para a última página */}
      {showLastLink && (
        <>
          {visiblePageNumbers[visiblePageNumbers.length - 1] < totalPages - 1 && (
            <span className="relative inline-flex items-center px-1 py-2 text-sm font-medium text-light-text-secondary dark:text-dark-text-secondary">
              ...
            </span>
          )}
          <button
            onClick={() => onPageChange(totalPages)}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-light-text-primary dark:text-dark-text-primary hover:bg-light-background dark:hover:bg-dark-border rounded-md"
          >
            {totalPages}
          </button>
        </>
      )}

      {/* Botão "Próxima" */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`relative inline-flex items-center px-2 py-2 rounded-md text-sm font-medium ${
          currentPage === totalPages
            ? 'text-light-text-disabled dark:text-dark-text-disabled cursor-not-allowed'
            : 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-background dark:hover:bg-dark-border'
        }`}
        aria-label="Próxima página"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
};

PaginationControls.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  maxVisiblePages: PropTypes.number,
  className: PropTypes.string,
};

export default PaginationControls;