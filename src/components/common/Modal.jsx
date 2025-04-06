import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  showOverlay = true,
  closeOnOverlayClick = true,
  closeOnEsc = true,
  footer = null,
  className = '',
  overlayClassName = '',
  contentClassName = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
}) => {
  // Referência para o modal
  const modalRef = useRef(null);
  
  // Tamanhos do modal
  const sizeClasses = {
    xs: 'max-w-xs',
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full',
  };
  
  // Fechar modal com tecla Esc
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && closeOnEsc) {
        onClose();
      }
    };
    
    if (isOpen && closeOnEsc) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose, closeOnEsc]);
  
  // Impedir scroll do body quando o modal estiver aberto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  
  // Focar no modal quando abrir (para acessibilidade)
  useEffect(() => {
    if (isOpen && modalRef.current) {
      // Criar um timer para garantir que o modal esteja visível
      const timer = setTimeout(() => {
        modalRef.current.focus();
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isOpen]);
  
  // Clicar no overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };
  
  // Se o modal não estiver aberto, não renderize nada
  if (!isOpen) return null;
  
  // Renderize o modal como um portal
  return createPortal(
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center ${overlayClassName}`}
      onClick={handleOverlayClick}
      aria-modal="true"
      role="dialog"
    >
      {/* Overlay */}
      {showOverlay && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
          aria-hidden="true"
        />
      )}
      
      {/* Modal */}
      <div 
        ref={modalRef}
        className={`
          relative bg-white dark:bg-dark-surface rounded-lg shadow-xl 
          overflow-hidden w-full transform transition-all
          ${sizeClasses[size]} ${className}
        `}
        tabIndex={-1}
      >
        {/* Cabeçalho */}
        {(title || showCloseButton) && (
          <div className={`px-6 py-4 border-b border-light-border dark:border-dark-border flex justify-between items-center ${headerClassName}`}>
            {title && (
              <h3 className="text-lg font-medium text-light-text-primary dark:text-dark-text-primary">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary transition-colors"
                aria-label="Fechar"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Corpo do modal */}
        <div className={`px-6 py-4 max-h-[calc(100vh-14rem)] overflow-y-auto ${bodyClassName}`}>
          {children}
        </div>
        
        {/* Rodapé (opcional) */}
        {footer && (
          <div className={`px-6 py-4 border-t border-light-border dark:border-dark-border ${footerClassName}`}>
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node,
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', 'full']),
  showCloseButton: PropTypes.bool,
  showOverlay: PropTypes.bool,
  closeOnOverlayClick: PropTypes.bool,
  closeOnEsc: PropTypes.bool,
  footer: PropTypes.node,
  className: PropTypes.string,
  overlayClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
};

export default Modal;