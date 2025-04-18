/**
 * Função para limpar o localStorage e reiniciar a aplicação
 * Isso pode ajudar a resolver problemas de corrupção de dados
 */
export const clearLocalStorage = () => {
  try {
    // Fazer backup dos dados importantes
    const backupData = {};
    
    // Lista de chaves a serem preservadas (opcional)
    const keysToPreserve = ['theme']; 
    
    // Salvar dados das chaves a serem preservadas
    keysToPreserve.forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        backupData[key] = value;
      }
    });
    
    // Limpar todo o localStorage
    localStorage.clear();
    
    // Restaurar dados preservados
    Object.keys(backupData).forEach(key => {
      localStorage.setItem(key, backupData[key]);
    });
    
    console.log('localStorage limpo com sucesso!');
    
    // Recarregar a página para reiniciar a aplicação
    window.location.reload();
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error);
  }
};
