import React from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  fullWidth = false,
  disabled = false,
  icon = null,
  iconPosition = 'left',
  onClick,
  className = '',
  ...props
}) => {
  // Definição das classes baseadas nas propriedades
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-md focus:outline-none transition-colors';
  
  // Classes para variantes de cor
  const variantClasses = {
    primary: 'bg-primary hover:bg-primary-dark text-white',
    secondary: 'bg-secondary hover:bg-secondary-dark text-white',
    success: 'bg-success hover:bg-green-600 text-white',
    danger: 'bg-danger hover:bg-red-600 text-white',
    warning: 'bg-warning hover:bg-yellow-500 text-black',
    info: 'bg-info hover:bg-cyan-500 text-white',
    light: 'bg-white dark:bg-dark-surface hover:bg-light-background dark:hover:bg-dark-border text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border',
    outline: 'bg-transparent hover:bg-light-background dark:hover:bg-dark-border text-light-text-primary dark:text-dark-text-primary border border-light-border dark:border-dark-border',
  };
  
  // Classes para tamanhos
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-2.5 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-4 py-2 text-base',
    xl: 'px-6 py-3 text-base',
  };
  
  // Espaçamento para ícones
  const iconSpacingClasses = {
    left: children ? 'mr-2' : '',
    right: children ? 'ml-2' : '',
  };
  
  // Largura total
  const widthClasses = fullWidth ? 'w-full' : '';
  
  // Estado desabilitado
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${widthClasses}
        ${disabledClasses}
        ${className}
      `}
      {...props}
    >
      {icon && iconPosition === 'left' && (
        <span className={iconSpacingClasses[iconPosition]}>
          {icon}
        </span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className={iconSpacingClasses[iconPosition]}>
          {icon}
        </span>
      )}
    </button>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  variant: PropTypes.oneOf([
    'primary', 
    'secondary', 
    'success', 
    'danger', 
    'warning', 
    'info', 
    'light', 
    'outline'
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  fullWidth: PropTypes.bool,
  disabled: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default Button;