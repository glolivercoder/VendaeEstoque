// Script para forçar a exposição do contexto do React
(function() {
  console.log('Iniciando expositor de contexto...');
  
  // Função para expor o contexto
  function exposeContext() {
    try {
      // Verificar se o contexto já está exposto
      if (window.__APP_CONTEXT__) {
        console.log('Contexto já está exposto:', window.__APP_CONTEXT__);
        return;
      }
      
      // Tentar encontrar o contexto no React DevTools
      const reactInstances = [];
      
      // Função para percorrer a árvore DOM e encontrar instâncias React
      function findReactInstances(element) {
        // Verificar se o elemento tem propriedades React
        const keys = Object.keys(element);
        const reactKey = keys.find(key => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$'));
        
        if (reactKey) {
          const reactInstance = element[reactKey];
          if (reactInstance) {
            reactInstances.push(reactInstance);
          }
        }
        
        // Verificar filhos
        if (element.children && element.children.length) {
          Array.from(element.children).forEach(findReactInstances);
        }
      }
      
      // Iniciar a busca a partir do body
      findReactInstances(document.body);
      
      console.log(`Encontradas ${reactInstances.length} instâncias React`);
      
      // Tentar encontrar o contexto em cada instância
      let contextFound = false;
      
      reactInstances.forEach(instance => {
        try {
          // Verificar se a instância tem memoizedState
          if (instance.memoizedState && instance.memoizedState.memoizedState) {
            const state = instance.memoizedState.memoizedState;
            
            // Verificar se o estado tem items e selectedItems
            if (state.items && state.selectedItems) {
              console.log('Contexto encontrado em instância React:', state);
              
              // Expor o contexto
              window.__APP_CONTEXT__ = {
                items: state.items,
                selectedItems: state.selectedItems,
                setSelectedItems: function(newSelectedItems) {
                  // Tentar atualizar o estado
                  if (instance.memoizedState.queue && instance.memoizedState.queue.dispatch) {
                    instance.memoizedState.queue.dispatch({
                      type: 'SET_SELECTED_ITEMS',
                      payload: newSelectedItems
                    });
                  }
                }
              };
              
              contextFound = true;
            }
          }
        } catch (error) {
          // Ignorar erros ao processar instâncias
        }
      });
      
      if (!contextFound) {
        console.warn('Contexto não encontrado nas instâncias React');
        
        // Criar um contexto vazio como fallback
        window.__APP_CONTEXT__ = {
          items: [],
          selectedItems: [],
          setSelectedItems: function() {}
        };
      }
    } catch (error) {
      console.error('Erro ao expor contexto:', error);
    }
  }
  
  // Tentar expor o contexto periodicamente
  setInterval(exposeContext, 1000);
  
  // Expor o contexto imediatamente
  exposeContext();
})();
