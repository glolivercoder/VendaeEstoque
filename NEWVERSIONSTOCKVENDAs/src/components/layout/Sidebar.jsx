import React from 'react';
import { useAppContext } from '../../context/AppContext';

const Sidebar = ({
  activePage,
  setActivePage,
  isMobileOpen,
  closeMobileSidebar
}) => {
  const { isLoading } = useAppContext();

  // Lista de itens de navegação
  const navItems = [
    {
      id: 'inventory',
      label: 'Estoque',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
          />
        </svg>
      )
    },
    {
      id: 'sales',
      label: 'Vendas',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      )
    },
    {
      id: 'vendors',
      label: 'Fornecedores',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
          />
        </svg>
      )
    },
    {
      id: 'clients',
      label: 'Clientes',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      )
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      )
    }
  ];

  // Classes para a sidebar
  const sidebarClasses = `
    fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-dark-surface transform
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
    md:translate-x-0 transition-transform duration-300 ease-in-out
    border-r border-light-border dark:border-dark-border
    flex flex-col
  `;

  // Função para lidar com o clique em um item do menu
  const handleMenuClick = (pageId) => {
    console.log(`Clicou no menu: ${pageId}`);
    setActivePage(pageId);
    if (isMobileOpen) {
      closeMobileSidebar();
    }
  };

  return (
    <>
      {/* Overlay para dispositivos móveis */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={closeMobileSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={sidebarClasses}>
        {/* Logo / nome do app */}
        <div className="h-16 flex items-center justify-center border-b border-light-border dark:border-dark-border">
          <div className="flex items-center space-x-2 px-4">
            <div className="w-8 h-8 bg-primary text-white rounded flex items-center justify-center font-bold">
              VE
            </div>
            <span className="text-lg font-semibold text-primary">VendaEstoque</span>
          </div>
        </div>

        {/* Links de navegação */}
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto">
          <ul className="px-2 space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id)}
                  disabled={isLoading}
                  className={`w-full flex items-center px-4 py-3 rounded-md transition-colors
                    ${activePage === item.id
                      ? 'bg-primary-light/20 dark:bg-primary-dark/20 text-primary dark:text-primary-light'
                      : 'text-light-text-primary dark:text-dark-text-primary hover:bg-light-background dark:hover:bg-dark-background'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Rodapé do sidebar simplificado */}
        <div className="p-4 border-t border-light-border dark:border-dark-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white mr-3">
              GO
            </div>
            <div>
              <p className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                Gleidison Oliveira
              </p>
              <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                Administrador
              </p>
            </div>
          </div>

          {/* Versão */}
          <div className="mt-4 text-xs text-light-text-secondary dark:text-dark-text-secondary text-center">
            VendaEstoque v2.0
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
