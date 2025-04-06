import { useState, useEffect } from 'react';

/**
 * Hook personalizado para usar localStorage com estado React
 * @param {string} key - A chave para o item no localStorage
 * @param {any} initialValue - O valor inicial caso não exista item no localStorage
 * @returns {Array} - [storedValue, setValue] - Estado atual e função para atualizar
 */
function useLocalStorage(key, initialValue) {
  // Função para obter o valor inicial do localStorage
  const readValue = () => {
    try {
      // Obter do localStorage pelo key
      const item = window.localStorage.getItem(key);
      
      // Analisar o item armazenado ou retornar initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  // Estado para armazenar nosso valor
  const [storedValue, setStoredValue] = useState(readValue);

  // Função para retornar um valor atualizado
  const setValue = (value) => {
    try {
      // Permitir que value seja uma função para seguir o mesmo padrão do useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salvar o estado
      setStoredValue(valueToStore);
      
      // Salvar no localStorage
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.warn(`Erro ao definir localStorage key "${key}":`, error);
    }
  };

  // Escutar mudanças em storageEvent (se o localStorage for atualizado em outra janela)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === key && event.newValue) {
        setStoredValue(JSON.parse(event.newValue));
      }
    };

    // Este é um listener que permite sincronizar entre abas
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key]);

  return [storedValue, setValue];
}

export default useLocalStorage;