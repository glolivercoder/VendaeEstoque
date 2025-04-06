import React from 'react';
import PropTypes from 'prop-types';
import Modal from './Modal';
import Button from './Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  onCancel,
  title = 'Confirmação',
  message = 'Tem certeza que deseja realizar esta ação?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  confirmButtonClass = 'bg-primary hover:bg-primary-dark',
  cancelButtonClass = '',
  icon = null,
  size = 'sm',
}) => {
  // Função que executa o cancelamento
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  // Função que executa a confirmação
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size={size}
      footer={
        <div className="flex justify-end space-x-3">
          <Button
            variant="light"
            onClick={handleCancel}
            className={cancelButtonClass}
          >
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            className={confirmButtonClass}
          >
            {confirmText}
          </Button>
        </div>
      }
    >
      <div className="flex items-start">
        {icon && (
          <div className="flex-shrink-0 mr-4">
            {icon}
          </div>
        )}
        <div className="text-light-text-primary dark:text-dark-text-primary">
          {typeof message === 'string' ? (
            <p>{message}</p>
          ) : (
            message
          )}
        </div>
      </div>
    </Modal>
  );
};

ConfirmDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func,
  title: PropTypes.string,
  message: PropTypes.node,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  confirmButtonClass: PropTypes.string,
  cancelButtonClass: PropTypes.string,
  icon: PropTypes.node,
  size: PropTypes.string,
};

export default ConfirmDialog;