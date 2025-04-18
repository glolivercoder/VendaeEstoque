import React, { useState, useEffect } from 'react';
import '../themes/theme-green.css';
import '../themes/theme-blue.css';
import '../themes/theme-purple.css';
import '../themes/theme-dark-blue.css';
import '../themes/theme-dark-green.css';

const ThemeSelector = () => {
  const [currentTheme, setCurrentTheme] = useState(localStorage.getItem('theme') || 'green');

  // Temas disponíveis
  const themes = [
    { id: 'green', name: 'Verde', color: '#2ECC71' },
    { id: 'blue', name: 'Azul', color: '#4A7AFF' },
    { id: 'purple', name: 'Roxo', color: '#B15CFF' },
    { id: 'dark-blue', name: 'Escuro Azul', color: '#4A7AFF', isDark: true },
    { id: 'dark-green', name: 'Escuro Verde', color: '#2ECC71', isDark: true }
  ];

  // Aplicar o tema quando o componente montar ou o tema mudar
  useEffect(() => {
    // Remover todas as classes de tema anteriores
    document.body.classList.remove(
      'theme-green',
      'theme-blue',
      'theme-purple',
      'theme-dark-blue',
      'theme-dark-green'
    );
    
    // Adicionar a classe do tema atual
    document.body.classList.add(`theme-${currentTheme}`);
    
    // Salvar a preferência no localStorage
    localStorage.setItem('theme', currentTheme);
    
    // Adicionar ou remover a classe dark-mode
    if (currentTheme.includes('dark')) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [currentTheme]);

  // Função para mudar o tema
  const changeTheme = (themeId) => {
    setCurrentTheme(themeId);
  };

  return (
    <div className="theme-selector">
      <h4 className="theme-selector-title">Escolha um Tema</h4>
      <div className="theme-options">
        {themes.map((theme) => (
          <button
            key={theme.id}
            className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
            style={{ 
              backgroundColor: theme.color,
              color: theme.isDark ? '#fff' : '#000',
              border: currentTheme === theme.id ? '3px solid #fff' : '1px solid #ccc'
            }}
            onClick={() => changeTheme(theme.id)}
            aria-label={`Tema ${theme.name}`}
          >
            {theme.name}
          </button>
        ))}
      </div>
      <style jsx>{`
        .theme-selector {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background-color: var(--card-background);
          border-radius: 10px;
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
          padding: 15px;
          z-index: 1000;
          border: 1px solid var(--border-color);
        }
        
        .theme-selector-title {
          margin-top: 0;
          margin-bottom: 10px;
          font-size: 1.2rem;
          text-align: center;
        }
        
        .theme-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .theme-option {
          padding: 10px 15px;
          border-radius: 6px;
          cursor: pointer;
          font-weight: bold;
          transition: all 0.3s ease;
          text-align: center;
          width: 100%;
        }
        
        .theme-option:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        }
        
        .theme-option.active {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ThemeSelector;
