import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const LoginModal = () => {
  const { login, recoverPassword, showLoginModal, setShowLoginModal, currentUser, error: authError } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRecovering, setIsRecovering] = useState(false);
  const [recoveryMessage, setRecoveryMessage] = useState('');

  // Fechar o modal se o usuário já estiver logado
  useEffect(() => {
    if (currentUser) {
      setShowLoginModal(false);
    }
  }, [currentUser, setShowLoginModal]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      await login(username, password);
      setUsername('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Nome de usuário ou senha incorretos');
    }
  };

  const handleRecoverPassword = async (e) => {
    e.preventDefault();
    setRecoveryMessage('');

    if (!username) {
      setError('Por favor, informe seu nome de usuário');
      return;
    }

    try {
      const recoveredPassword = await recoverPassword(username);
      setRecoveryMessage(`Sua senha é: ${recoveredPassword}`);
    } catch (err) {
      setError(err.message || 'Usuário não encontrado');
    }
  };

  if (!showLoginModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {isRecovering ? 'Recuperar Senha' : 'Login'}
          </h2>
          <button
            onClick={() => setShowLoginModal(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {recoveryMessage && (
          <div className="mb-4 p-2 bg-green-100 text-green-700 rounded">
            {recoveryMessage}
          </div>
        )}

        <form onSubmit={isRecovering ? handleRecoverPassword : handleLogin}>
          <div className="mb-4">
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Nome de Usuário
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Seu nome de usuário"
            />
          </div>

          {!isRecovering && (
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Sua senha"
              />
            </div>
          )}

          <div className="flex justify-between items-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsRecovering(!isRecovering);
                setError('');
                setRecoveryMessage('');
              }}
              className="text-primary hover:text-primary-dark text-sm"
            >
              {isRecovering ? 'Voltar ao login' : 'Esqueceu a senha?'}
            </button>

            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
            >
              {isRecovering ? 'Recuperar' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
