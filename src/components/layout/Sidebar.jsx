import React, { useMemo } from 'react';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activePage, setActivePage, isMobileOpen, closeMobileSidebar }) => {
  const { items, salesData } = useAppContext();
  const { hasPermission, currentUser, logout } = useAuth();

  // Número de produtos com estoque baixo - usando useMemo para melhorar performance
  const lowStockCount = useMemo(() => {
    return items.filter(item => item.quantity <= 5).length;
  }, [items]);

  // Número de vendas do dia
  const todaySalesCount = useMemo(() => {
    const today = new Date();
    return salesData.filter(sale => {
      if (!sale.date || !sale.date.includes('/')) return false;
      try {
        const [day, month, year] = sale.date.split('/').map(part => parseInt(part, 10));
        if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
        const saleDate = new Date(year, month - 1, day);
        return saleDate.toDateString() === today.toDateString();
      } catch (error) {
        return false;
      }
    }).length;
  }, [salesData]);

  // Classe para links do menu
  const menuItemClass = (page) => `
    flex items-center px-4 py-3 hover:bg-primary-dark dark:hover:bg-primary-dark hover:text-white dark:hover:text-white
    ${activePage === page
      ? 'bg-primary text-white dark:bg-primary dark:text-white'
      : 'text-light-text-primary dark:text-dark-text-primary'}
  `;

  return (
    <>
      {/* Sobreposição para fechar o sidebar no mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-white dark:bg-dark-surface shadow-md dark:shadow-dark-md z-50
          transform transition-transform duration-300 ease-in-out md:translate-x-0 md:relative md:z-0
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-light-border dark:border-dark-border">
          <div className="flex items-center space-x-2">
            <svg
              className="h-8 w-8 text-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V5a2 2 0 00-2-2H5zm4.293 6.707a1 1 0 011.414 0L12 11.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              />
            </svg>
            <h1 className="text-xl font-bold text-primary">VendaEstoque</h1>
          </div>
        </div>

        {/* Menu de navegação */}
        <nav className="mt-4">
          <ul>
            {hasPermission('dashboard') && (
              <li>
                <button
                  className={menuItemClass('dashboard')}
                  onClick={() => setActivePage('dashboard')}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                  </svg>
                  Dashboard
                </button>
              </li>
            )}

            {hasPermission('inventory') && (
              <li>
                <button
                  className={menuItemClass('inventory')}
                  onClick={() => setActivePage('inventory')}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  Estoque
                  {lowStockCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-danger rounded-full">
                      {lowStockCount}
                    </span>
                  )}
                </button>
              </li>
            )}

            {hasPermission('sales') && (
              <li>
                <button
                  className={menuItemClass('sales')}
                  onClick={() => setActivePage('sales')}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Vendas
                  {todaySalesCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-dark-text-primary bg-success rounded-full">
                      {todaySalesCount}
                    </span>
                  )}
                </button>
              </li>
            )}

            {hasPermission('clients') && (
              <li>
                <button
                  className={menuItemClass('clients')}
                  onClick={() => setActivePage('clients')}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  Clientes
                </button>
              </li>
            )}

            {hasPermission('vendors') && (
              <li>
                <button
                  className={menuItemClass('vendors')}
                  onClick={() => setActivePage('vendors')}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Fornecedores
                </button>
              </li>
            )}

            {hasPermission('settings') && (
              <li>
                <button
                  className={menuItemClass('settings')}
                  onClick={() => setActivePage('settings')}
                >
                  <svg className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Configurações
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Informações do usuário e versão do app */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center border-t border-light-border dark:border-dark-border">
          {currentUser && (
            <div className="mb-2">
              <div className="flex items-center justify-center mb-2">
                <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center mr-2 text-xs">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <p className="text-xs text-light-text-primary dark:text-dark-text-primary">
                  {currentUser.name} ({currentUser.type})
                </p>
              </div>
              <button
                onClick={logout}
                className="text-xs px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                Sair
              </button>
            </div>
          )}
          <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
            VendaEstoque v2.0.0
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;