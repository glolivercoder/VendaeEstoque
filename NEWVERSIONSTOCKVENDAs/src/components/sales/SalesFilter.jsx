import React from 'react';
import { useAppContext } from '../../context/AppContext';

const SalesFilter = ({ 
  searchTerm, 
  setSearchTerm, 
  sortOption, 
  setSortOption 
}) => {
  const { categories, selectedCategory, filterItemsByCategory } = useAppContext();

  return (
    <div className="bg-white dark:bg-dark-surface p-4 rounded-lg shadow dark:shadow-dark-md">
      <div className="flex flex-col space-y-4 md:flex-row md:items-center md:space-y-0 md:space-x-4">
        {/* Barra de pesquisa */}
        <div className="flex-grow">
          <label htmlFor="search" className="sr-only">Buscar produtos</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg 
                className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary" 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 20 20" 
                fill="currentColor" 
                aria-hidden="true"
              >
                <path 
                  fillRule="evenodd" 
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" 
                  clipRule="evenodd" 
                />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              type="text"
              placeholder="Buscar por nome, descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-input pl-10"
            />
          </div>
        </div>
        
        {/* Seleção de ordenação */}
        <div className="flex-shrink-0 w-full md:w-48">
          <label htmlFor="sort" className="sr-only">Ordenar por</label>
          <select
            id="sort"
            name="sort"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="form-input"
          >
            <option value="default">Ordenar por</option>
            <option value="price-asc">Menor preço</option>
            <option value="price-desc">Maior preço</option>
            <option value="name-asc">Nome (A-Z)</option>
            <option value="name-desc">Nome (Z-A)</option>
            <option value="stock-asc">Menor estoque</option>
            <option value="stock-desc">Maior estoque</option>
          </select>
        </div>
      </div>
      
      {/* Categorias (filtros horizontais) */}
      <div className="mt-4 border-t border-light-border dark:border-dark-border pt-4 overflow-x-auto pb-1">
        <div className="flex space-x-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => filterItemsByCategory(category)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-dark-border text-light-text-primary dark:text-dark-text-primary hover:bg-gray-200 dark:hover:bg-opacity-80'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SalesFilter;