import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

const SearchInput = ({
  value,
  onChange,
  onClear,
  onSearch,
  placeholder = 'Buscar...',
  autoFocus = false,
  className = '',
  inputClassName = '',
  delay = 300,
  ...props
}) => {
  const [localValue, setLocalValue] = useState(value || '');
  const inputRef = useRef(null);
  const debounceRef = useRef(null);
  
  // Sincronizar o valor local com o valor externo
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);
  
  // Auto focus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);
  
  // Lidar com mudanças no input com debounce
  const handleChange = (e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    if (onChange) {
      onChange(e);
    }
    
    // Executar busca com debounce quando há um handler onSearch
    if (onSearch) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      
      debounceRef.current = setTimeout(() => {
        onSearch(newValue);
      }, delay);
    }
  };
  
  // Limpar o input
  const handleClear = () => {
    setLocalValue('');
    
    if (onClear) {
      onClear();
    } else if (onChange) {
      // Simular um evento de change para um input vazio
      onChange({ target: { value: '' } });
    }
    
    // Focar no input após limpar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };
  
  // Lidar com a tecla Escape para limpar o input
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClear();
    } else if (e.key === 'Enter' && onSearch) {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      onSearch(localValue);
    }
    
    // Passar o evento de keydown para props.onKeyDown se existir
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg 
            className="h-5 w-5 text-light-text-secondary dark:text-dark-text-secondary"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
            />
          </svg>
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={localValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`
            w-full pl-10 pr-10 py-2 border border-light-border dark:border-dark-border 
            rounded-md bg-white dark:bg-dark-surface text-light-text-primary dark:text-dark-text-primary 
            placeholder:text-light-text-secondary placeholder:dark:text-dark-text-secondary
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            ${inputClassName}
          `}
          {...props}
        />
        
        {localValue && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="text-light-text-secondary dark:text-dark-text-secondary hover:text-light-text-primary dark:hover:text-dark-text-primary focus:outline-none"
              aria-label="Limpar busca"
            >
              <svg 
                className="h-5 w-5" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onClear: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  autoFocus: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  delay: PropTypes.number,
  onKeyDown: PropTypes.func,
};

export default SearchInput;