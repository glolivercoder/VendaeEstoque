import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';

const Header = ({ openSidebar, title }) => {
  const [showSettings, setShowSettings] = useState(false);
  const { theme } = useTheme();
  
  const openSettings = () => {
    setShowSettings(true);
  };
  
  const closeSettings = () => {
    setShowSettings(false);
  };

  return (
    <header className="bg-white dark:bg-dark-surface border-b border-light-border dark:border-dark-border sticky top-0 z-10">
      <div className="flex justify-between items-center h-16 px-4 md:px-6">
        {/* Botão de menu móvel e título */}
        <div className="flex items-center">
          <button
            onClick={openSidebar}
            className="mr-4 p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-background dark:hover:bg-dark-background md:hidden"
            aria-label="Abrir menu"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth="2" 
                d="M4 6h16M4 12h16M4 18h16" 
              />
            </svg>
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
              {title}
            </h1>
          </div>
        </div>
        
        {/* Controles direitos: configurações e tema */}
        <div className="flex items-center space-x-3">
          {/* Botão de configurações */}
          <button
            onClick={openSettings}
            className="p-2 rounded-md text-light-text-secondary dark:text-dark-text-secondary hover:bg-light-background dark:hover:bg-dark-background"
            aria-label="Configurações"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          </button>
          
          {/* Botão de alternância de tema */}
          <ThemeToggle />
          
          {/* Perfil do usuário */}
          <div className="relative">
            <button
              className="flex items-center"
              aria-label="Perfil"
            >
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                GO
              </div>
              <span className="ml-2 text-light-text-primary dark:text-dark-text-primary hidden md:block">
                Gleidison
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modal de configurações */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white dark:bg-dark-surface rounded-lg shadow-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-light-text-primary dark:text-dark-text-primary">
                Configurações
              </h2>
              <button 
                onClick={closeSettings}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  Notificações
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-light-text-primary dark:text-dark-text-primary">
                  Modo compacto
                </span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                </label>
              </div>
              
              <div className="pt-4 border-t border-light-border dark:border-dark-border">
                <button 
                  className="w-full py-2 px-4 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
                  onClick={closeSettings}
                >
                  Salvar alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
