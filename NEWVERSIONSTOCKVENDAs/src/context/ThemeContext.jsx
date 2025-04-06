import React, { createContext, useState, useEffect } from 'react';

// Criando o contexto de tema
export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Verificar preferência do usuário ou usar 'light' como padrão
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) return savedTheme;
    
    // Verificar preferência do sistema
    return window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? 'dark' 
      : 'light';
  };

  const [theme, setTheme] = useState(getInitialTheme);

  // Atualizar o tema no localStorage e no documento HTML quando ele mudar
  useEffect(() => {
    localStorage.setItem('theme', theme);
    
    // Adicionar ou remover a classe 'dark' no elemento HTML
    const root = window.document.documentElement;
    
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Função para alternar entre temas
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para usar o tema
export const useTheme = () => {
  const context = React.useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};