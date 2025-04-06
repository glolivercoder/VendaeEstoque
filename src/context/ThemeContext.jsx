import { createContext, useState, useEffect, useContext } from 'react';

// Criar o contexto de tema
export const ThemeContext = createContext();

// Hook personalizado para usar o contexto de tema
export const useTheme = () => useContext(ThemeContext);

// Provedor do contexto de tema
export const ThemeProvider = ({ children }) => {
  // Verificar se o tema escuro está salvo no localStorage ou se o usuário prefere tema escuro
  const getInitialTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    
    // Se já tiver um tema salvo, use ele
    if (savedTheme) {
      return savedTheme;
    }
    
    // Se o usuário preferir tema escuro no sistema, use tema escuro
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    // Padrão: tema claro
    return 'light';
  };

  // Estado para armazenar o tema atual
  const [theme, setTheme] = useState(getInitialTheme);

  // Aplicar o tema ao body do documento
  useEffect(() => {
    // Salvar o tema no localStorage
    localStorage.setItem('theme', theme);
    
    // Adicionar ou remover a classe 'dark' do body
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Função para alternar entre temas
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  // Função para definir um tema específico
  const setThemeMode = (mode) => {
    if (mode === 'light' || mode === 'dark') {
      setTheme(mode);
    }
  };

  // Expor o tema e as funções através do contexto
  const value = {
    theme,
    isDarkMode: theme === 'dark',
    toggleTheme,
    setThemeMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};