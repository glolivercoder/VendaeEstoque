import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginButton = () => {
  const { currentUser, logout, setShowLoginModal } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Fechar o dropdown quando clicar fora dele
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Se não estiver logado, mostrar botão de login
  if (!currentUser) {
    return (
      <button
        onClick={() => setShowLoginModal(true)}
        className="flex items-center text-sm font-medium text-gray-700 dark:text-dark-text-primary hover:text-primary dark:hover:text-primary-light bg-gray-100 dark:bg-dark-border px-3 py-1.5 rounded-md transition-colors"
      >
        <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
        </svg>
        Entrar
      </button>
    );
  }

  // Se estiver logado, mostrar informações do usuário e dropdown
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center text-sm font-medium text-gray-700 dark:text-dark-text-primary hover:text-primary dark:hover:text-primary-light bg-gray-100 dark:bg-dark-border px-2 py-1 rounded-md transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center mr-2">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <span className="hidden md:block">{currentUser.name}</span>
        <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-surface rounded-md shadow-lg py-1 z-10 border border-gray-200 dark:border-dark-border">
          <div className="px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary border-b border-gray-200 dark:border-dark-border">
            <div className="font-medium">{currentUser.name}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs">{currentUser.username}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1 capitalize">{currentUser.type}</div>
          </div>

          <button
            onClick={() => {
              setShowLoginModal(true);
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-border"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Trocar Usuário
            </div>
          </button>

          <button
            onClick={() => {
              logout();
              setShowDropdown(false);
            }}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-dark-text-primary hover:bg-gray-100 dark:hover:bg-dark-border"
          >
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sair
            </div>
          </button>
        </div>
      )}
    </div>
  );
};

export default LoginButton;
