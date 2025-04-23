import { useCallback } from 'react';

/**
 * Hook para exibir notificações toast
 * @returns {Function} Função para exibir toast
 */
export const useToast = () => {
  /**
   * Exibe uma notificação toast
   * @param {Object} options - Opções do toast
   * @param {string} options.title - Título do toast
   * @param {string} options.description - Descrição do toast
   * @param {string} options.type - Tipo do toast (success, error, warning, info)
   * @param {number} options.duration - Duração em ms (padrão: 3000)
   */
  const toast = useCallback(({ title, description, type = 'success', duration = 3000 }) => {
    // Criar elemento toast
    const toastElement = document.createElement('div');
    toastElement.className = `toast toast-${type}`;
    toastElement.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background-color: white;
      color: #333;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      z-index: 9999;
      max-width: 350px;
      animation: toast-slide-in 0.3s ease-out forwards;
      border-left: 4px solid #2196F3;
    `;

    // Adicionar conteúdo
    const titleElement = document.createElement('div');
    titleElement.className = 'toast-title';
    titleElement.textContent = title;
    titleElement.style.cssText = `
      font-weight: 600;
      margin-bottom: 4px;
      color: #2196F3;
    `;

    const descriptionElement = document.createElement('div');
    descriptionElement.className = 'toast-description';
    descriptionElement.textContent = description;
    descriptionElement.style.cssText = `
      font-size: 0.9rem;
      color: #555;
    `;

    // Adicionar estilos específicos por tipo
    if (type === 'error') {
      toastElement.style.borderLeftColor = '#f44336';
      titleElement.style.color = '#f44336';
    } else if (type === 'warning') {
      toastElement.style.borderLeftColor = '#ff9800';
      titleElement.style.color = '#ff9800';
    } else if (type === 'info') {
      toastElement.style.borderLeftColor = '#2196F3';
      titleElement.style.color = '#2196F3';
    } else {
      toastElement.style.borderLeftColor = '#4caf50';
      titleElement.style.color = '#4caf50';
    }

    // Adicionar elementos ao toast
    toastElement.appendChild(titleElement);
    toastElement.appendChild(descriptionElement);

    // Adicionar animação CSS
    const style = document.createElement('style');
    style.textContent = `
      @keyframes toast-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes toast-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }
    `;
    document.head.appendChild(style);

    // Adicionar ao DOM
    document.body.appendChild(toastElement);

    // Remover após a duração
    setTimeout(() => {
      toastElement.style.animation = 'toast-slide-out 0.3s ease-in forwards';
      setTimeout(() => {
        document.body.removeChild(toastElement);
      }, 300);
    }, duration);
  }, []);

  return toast;
};
