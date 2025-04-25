import React from 'react';
import PropTypes from 'prop-types';

/**
 * Componente para seleção da fonte de imagem (câmera ou arquivo)
 */
const ImageSourceSelector = ({ onSelect, onClose }) => {
  return (
    <div className="image-source-selector-overlay">
      <div className="image-source-selector-modal">
        <div className="image-source-selector-header">
          <h3>Selecionar fonte da imagem</h3>
          <button 
            className="close-button" 
            onClick={onClose}
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>
        
        <div className="image-source-selector-options">
          <button 
            className="source-option camera-option"
            onClick={() => onSelect('camera')}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>Usar Câmera</span>
          </button>
          
          <button 
            className="source-option file-option"
            onClick={() => onSelect('file')}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            <span>Escolher Arquivo</span>
          </button>
        </div>
      </div>
    </div>
  );
};

ImageSourceSelector.propTypes = {
  onSelect: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ImageSourceSelector;
