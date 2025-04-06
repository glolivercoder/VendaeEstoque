import React from 'react';
import PropTypes from 'prop-types';

const Card = ({
  children,
  title,
  subtitle,
  icon,
  footer,
  actions,
  padding = true,
  border = true,
  shadow = true,
  rounded = true,
  className = '',
  titleClassName = '',
  bodyClassName = '',
  footerClassName = '',
  ...props
}) => {
  return (
    <div 
      className={`
        bg-white dark:bg-dark-surface
        ${rounded ? 'rounded-lg' : ''}
        ${border ? 'border border-light-border dark:border-dark-border' : ''}
        ${shadow ? 'shadow-sm dark:shadow-dark-sm' : ''}
        overflow-hidden
        ${className}
      `}
      {...props}
    >
      {/* Cabeçalho do card (opcional) */}
      {(title || actions) && (
        <div className={`
          ${padding ? 'px-4 py-3' : ''}
          ${border && title ? 'border-b border-light-border dark:border-dark-border' : ''}
          flex justify-between items-center
          ${titleClassName}
        `}>
          <div className="flex items-center">
            {icon && (
              <div className="mr-3">
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="font-medium text-light-text-primary dark:text-dark-text-primary">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          )}
        </div>
      )}
      
      {/* Corpo do card */}
      <div className={`${padding && !title ? 'p-4' : padding ? 'px-4 py-3' : ''} ${bodyClassName}`}>
        {children}
      </div>
      
      {/* Rodapé do card (opcional) */}
      {footer && (
        <div className={`
          ${padding ? 'px-4 py-3' : ''}
          ${border ? 'border-t border-light-border dark:border-dark-border' : ''}
          ${footerClassName}
        `}>
          {footer}
        </div>
      )}
    </div>
  );
};

// Subtipo para itens de estatísticas
const StatItem = ({ 
  label, 
  value, 
  icon, 
  trend, 
  trendValue, 
  color = 'primary', 
  className = '' 
}) => {
  // Cores para os ícones
  const colorClasses = {
    primary: 'bg-primary/10 text-primary dark:bg-primary/20',
    secondary: 'bg-secondary/10 text-secondary dark:bg-secondary/20',
    success: 'bg-success/10 text-success-700 dark:bg-success/20 dark:text-success-400',
    danger: 'bg-danger/10 text-danger-700 dark:bg-danger/20 dark:text-danger-400',
    warning: 'bg-warning/10 text-warning-700 dark:bg-warning/20 dark:text-warning-400',
    info: 'bg-info/10 text-info-700 dark:bg-info/20 dark:text-info-400',
    gray: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
  };

  // Cores para as tendências
  const trendColorClasses = {
    up: 'text-success-600 dark:text-success-400',
    down: 'text-danger-600 dark:text-danger-400',
    neutral: 'text-light-text-secondary dark:text-dark-text-secondary'
  };

  return (
    <div className={`${className}`}>
      <div className="flex items-center">
        {icon && (
          <div className={`p-3 rounded-full ${colorClasses[color]} mr-4`}>
            {icon}
          </div>
        )}
        <div>
          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">{label}</p>
          <p className="text-2xl font-bold text-light-text-primary dark:text-dark-text-primary">{value}</p>
        </div>
      </div>
      
      {trend && (
        <div className="mt-2">
          <div className="flex items-center">
            <span className={`text-xs font-medium ${trendColorClasses[trend]}`}>
              {trendValue}
            </span>
            {trend === 'up' && (
              <svg className="h-3 w-3 ml-1 text-success-600 dark:text-success-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            )}
            {trend === 'down' && (
              <svg className="h-3 w-3 ml-1 text-danger-600 dark:text-danger-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

Card.StatItem = StatItem;

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  icon: PropTypes.node,
  footer: PropTypes.node,
  actions: PropTypes.node,
  padding: PropTypes.bool,
  border: PropTypes.bool,
  shadow: PropTypes.bool,
  rounded: PropTypes.bool,
  className: PropTypes.string,
  titleClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
};

StatItem.propTypes = {
  label: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  icon: PropTypes.node,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.node,
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'gray']),
  className: PropTypes.string,
};

export default Card;