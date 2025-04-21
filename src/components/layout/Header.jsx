import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

const Header = ({ openSidebar, title }) => {
  const { theme, toggleTheme } = useTheme();
  const { notifications } = useAppContext();
  const { setShowLoginModal } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  // Filtrar apenas notificações não lidas
  const unreadNotifications = notifications ? notifications.filter(n => !n.read) : [];

  return (
    <header className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border shadow-sm dark:shadow-dark-sm">
      <div className="flex items-center justify-between h-16 px-4">
        {/* Lado esquerdo: Botão do menu (visível apenas em dispositivos móveis) e botão de login */}
        <div className="flex items-center">
          <button
            onClick={openSidebar}
            className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 md:hidden mr-2"
            aria-label="Menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Botão de login - posicionado à esquerda */}
          <div className="ml-2">
            <button
              onClick={() => setShowLoginModal(true)}
              className="flex items-center text-sm font-medium text-gray-700 dark:text-dark-text-primary hover:text-primary dark:hover:text-primary-light bg-gray-100 dark:bg-dark-border px-3 py-1.5 rounded-md transition-colors"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              Entrar
            </button>
          </div>
        </div>

        {/* Título da página */}
        <div className="flex items-center">
          <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary truncate">
            {title}
          </h1>
        </div>

        {/* Botões de ação */}
        <div className="flex items-center space-x-3">
          {/* Botão de notificações */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
              aria-label="Notificações"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>

              {/* Badge de notificações não lidas */}
              {unreadNotifications && unreadNotifications.length > 0 && (
                <span className="absolute top-1 right-1 inline-flex items-center justify-center h-5 w-5 text-xs font-bold text-white bg-danger rounded-full">
                  {unreadNotifications.length > 9 ? '9+' : unreadNotifications.length}
                </span>
              )}
            </button>

            {/* Dropdown de notificações */}
            {showNotifications && notifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-dark-surface rounded-md shadow-lg dark:shadow-dark-lg overflow-hidden z-50 border border-light-border dark:border-dark-border">
                <div className="p-3 border-b border-light-border dark:border-dark-border flex justify-between items-center">
                  <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">Notificações</h3>
                  <button className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light">
                    Marcar todas como lidas
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-3 border-b border-light-border dark:border-dark-border hover:bg-light-background dark:hover:bg-dark-border ${!notification.read ? 'bg-light-background dark:bg-dark-border' : ''}`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                            notification.severity === 'error' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                            notification.severity === 'warning' ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                            'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          }`}>
                            {notification.severity === 'error' ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            ) : notification.severity === 'warning' ? (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                            ) : (
                              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="text-sm font-medium text-light-text-primary dark:text-dark-text-primary">
                              {notification.title}
                            </h4>
                            <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-light-text-disabled dark:text-dark-text-disabled mt-1">
                              {new Date(notification.timestamp).toLocaleString('pt-BR', {
                                day: '2-digit',
                                month: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-light-text-secondary dark:text-dark-text-secondary">
                      Nenhuma notificação
                    </div>
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="p-3 text-center border-t border-light-border dark:border-dark-border">
                    <button className="text-sm text-primary hover:text-primary-dark dark:hover:text-primary-light">
                      Ver todas as {notifications.length} notificações
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botão de tema */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            aria-label={theme === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
          >
            {theme === 'dark' ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Botão do perfil/configurações */}
          <button
            className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-gray-100 dark:hover:bg-dark-border focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            aria-label="Perfil"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;