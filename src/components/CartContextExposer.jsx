import { useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

/**
 * Componente que expõe o contexto do carrinho para scripts externos
 * Este componente não renderiza nada visualmente, apenas expõe o contexto
 */
const CartContextExposer = () => {
  const { 
    items, 
    selectedItems, 
    setSelectedItems, 
    handleMultipleSales 
  } = useAppContext();

  // Expor o contexto para scripts externos
  useEffect(() => {
    // Expor diretamente na janela global
    window.__APP_CONTEXT__ = {
      items,
      selectedItems,
      setSelectedItems,
      handleMultipleSales
    };

    // Criar um elemento de dados para armazenar o contexto
    let contextElement = document.getElementById('app-context-data');
    if (!contextElement) {
      contextElement = document.createElement('div');
      contextElement.id = 'app-context-data';
      contextElement.style.display = 'none';
      document.body.appendChild(contextElement);
    }

    // Armazenar o contexto como um atributo de dados
    contextElement.setAttribute('data-app-context', JSON.stringify({
      items,
      selectedItems,
      setSelectedItems: true, // Não podemos serializar funções, então apenas indicamos que existe
      handleMultipleSales: true // Não podemos serializar funções, então apenas indicamos que existe
    }));

    console.log('Contexto do carrinho exposto para scripts externos');

    // Limpar quando o componente for desmontado
    return () => {
      delete window.__APP_CONTEXT__;
      if (contextElement) {
        contextElement.remove();
      }
    };
  }, [items, selectedItems, setSelectedItems, handleMultipleSales]);

  // Este componente não renderiza nada visualmente
  return null;
};

export default CartContextExposer;
