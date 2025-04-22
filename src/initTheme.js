// Inicializar o tema da aplicação
export function initTheme() {
  // Obter o tema salvo no localStorage ou usar o tema padrão (verde)
  const savedTheme = localStorage.getItem('theme') || 'green';
  
  // Remover todas as classes de tema anteriores
  document.body.classList.remove(
    'theme-green',
    'theme-blue',
    'theme-purple'
  );
  
  // Adicionar a classe do tema atual
  document.body.classList.add(`theme-${savedTheme}`);
  
  // Remover a classe dark-mode se existir
  document.body.classList.remove('dark-mode');
  
  console.log('Tema inicializado:', savedTheme);
}
