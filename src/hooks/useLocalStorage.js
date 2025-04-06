import { useState, useEffect } from 'react';

/**
 * Hook personalizado para gerenciar estado persistente no localStorage
 * @param {string} key - Chave para armazenar o valor no localStorage
 * @param {any} initialValue - Valor inicial se nenhum valor for encontrado no localStorage
 * @returns {Array} - [storedValue, setValue] - valor atual e função para atualizá-lo
 */
export const useLocalStorage = (key, initialValue) => {
  // Função para obter o valor inicial do localStorage ou usar o valor inicial fornecido
  const readValue = () => {
    // Verificar se estamos no navegador
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      // Recuperar do localStorage
      const item = window.localStorage.getItem(key);
      
      // Retornar o valor convertido de JSON ou o valor inicial
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.warn(`Erro ao ler ${key} do localStorage:`, error);
      return initialValue;
    }
  };

  // Estado para armazenar nosso valor
  const [storedValue, setStoredValue] = useState(readValue);

  // Função para atualizar o valor no estado e localStorage
  const setValue = value => {
    try {
      // Permite que value seja uma função para compatibilidade com useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Salvar no estado
      setStoredValue(valueToStore);
      
      // Salvar no localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
        
        // Disparar um evento personalizado para que outros hooks possam responder
        window.dispatchEvent(new Event('local-storage'));
      }
    } catch (error) {
      console.warn(`Erro ao salvar ${key} no localStorage:`, error);
    }
  };

  // Escutar por mudanças no localStorage (para sincronização em múltiplas abas)
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };
    
    // Atualizar o state se o item de localStorage mudar
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange);
    };
  }, [key, readValue]);

  return [storedValue, setValue];
};