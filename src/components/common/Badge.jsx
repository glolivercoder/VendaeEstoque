import React from 'react';
import PropTypes from 'prop-types';

const Badge = ({
  text,
  color = 'default',
  size = 'md',
  variant = 'solid',
  rounded = 'md',
  withDot = false,
  className = '',
  ...props
}) => {
  // Cores disponíveis
  const colorClasses = {
    default: {
      solid: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      outline: 'border border-gray-300 text-gray-800 dark:border-gray-600 dark:text-gray-200',
      light: 'bg-gray-100/50 text-gray-800 dark:bg-gray-700/50 dark:text-gray-200',
    },
    primary: {
      solid: 'bg-primary text-white',
      outline: 'border border-primary text-primary',
      light: 'bg-primary/10 text-primary dark:bg-primary/20',
    },
    secondary: {
      solid: 'bg-secondary text-white',
      outline: 'border border-secondary text-secondary',
      light: 'bg-secondary/10 text-secondary dark:bg-secondary/20',
    },
    success: {
      solid: 'bg-success text-white',
      outline: 'border border-success text-success',
      light: 'bg-success/10 text-success-800 dark:bg-success/20 dark:text-success-400',
    },
    danger: {
      solid: 'bg-danger text-white',
      outline: 'border border-danger text-danger',
      light: 'bg-danger/10 text-danger-800 dark:bg-danger/20 dark:text-danger-400',
    },
    warning: {
      solid: 'bg-warning text-gray-900',
      outline: 'border border-warning text-warning-800 dark:text-warning-500',
      light: 'bg-warning/10 text-warning-800 dark:bg-warning/20 dark:text-warning-500',
    },
    info: {
      solid: 'bg-info text-white',
      outline: 'border border-info text-info',
      light: 'bg-info/10 text-info-800 dark:bg-info/20 dark:text-info-400',
    },
    green: {
      solid: 'bg-green-500 text-white',
      outline: 'border border-green-500 text-green-600 dark:text-green-500',
      light: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    },
    red: {
      solid: 'bg-red-500 text-white',
      outline: 'border border-red-500 text-red-600 dark:text-red-500',
      light: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    },
    yellow: {
      solid: 'bg-yellow-500 text-white',
      outline: 'border border-yellow-500 text-yellow-600 dark:text-yellow-500',
      light: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    },
    blue: {
      solid: 'bg-blue-500 text-white',
      outline: 'border border-blue-500 text-blue-600 dark:text-blue-500', 
      light: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    },
    purple: {
      solid: 'bg-purple-500 text-white',
      outline: 'border border-purple-500 text-purple-600 dark:text-purple-500',
      light: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    },
  };
  
  // Tamanhos disponíveis
  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1',
  };
  
  // Arredondamento
  const roundedClasses = {
    none: 'rounded-none',
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    full: 'rounded-full',
  };
  
  // Criar classe para o estilo escolhido
  const badgeClasses = `
    inline-flex items-center font-medium
    ${colorClasses[color][variant]}
    ${sizeClasses[size]}
    ${roundedClasses[rounded]}
    ${className}
  `;

  return (
    <span className={badgeClasses} {...props}>
      {withDot && (
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 inline-block bg-current`}></span>
      )}
      {text}
    </span>
  );
};

Badge.propTypes = {
  text: PropTypes.node.isRequired,
  color: PropTypes.oneOf([
    'default', 'primary', 'secondary', 'success', 
    'danger', 'warning', 'info', 'green', 'red', 
    'yellow', 'blue', 'purple'
  ]),
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['solid', 'outline', 'light']),
  rounded: PropTypes.oneOf(['none', 'sm', 'md', 'lg', 'full']),
  withDot: PropTypes.bool,
  className: PropTypes.string,
};

export default Badge;