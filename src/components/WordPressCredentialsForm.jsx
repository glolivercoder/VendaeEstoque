import { useState, useEffect } from 'react';

/**
 * Componente para gerenciar credenciais do WordPress
 */
const WordPressCredentialsForm = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    applicationPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [saved, setSaved] = useState(false);

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const savedUsername = localStorage.getItem('wp_username');
    const savedPassword = localStorage.getItem('wp_password');
    const savedAppPassword = localStorage.getItem('wp_app_password');

    if (savedUsername || savedPassword || savedAppPassword) {
      setCredentials({
        username: savedUsername || '',
        password: savedPassword || '',
        applicationPassword: savedAppPassword || ''
      });
    }
  }, []);

  // Função para salvar credenciais
  const handleSave = () => {
    // Salvar no localStorage
    if (credentials.username) {
      localStorage.setItem('wp_username', credentials.username);
    }
    
    if (credentials.password) {
      localStorage.setItem('wp_password', credentials.password);
    }
    
    if (credentials.applicationPassword) {
      localStorage.setItem('wp_app_password', credentials.applicationPassword);
    }
    
    setSaved(true);
    
    // Limpar mensagem após 3 segundos
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  // Função para limpar credenciais
  const handleClear = () => {
    localStorage.removeItem('wp_username');
    localStorage.removeItem('wp_password');
    localStorage.removeItem('wp_app_password');
    
    setCredentials({
      username: '',
      password: '',
      applicationPassword: ''
    });
    
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  // Função para atualizar credenciais
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Credenciais do WordPress</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome de Usuário
          </label>
          <input
            type="text"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Usuário do WordPress"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={credentials.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Senha do WordPress"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Ocultar" : "Mostrar"}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Senha de Aplicação (opcional)
          </label>
          <input
            type={showPassword ? "text" : "password"}
            name="applicationPassword"
            value={credentials.applicationPassword}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Senha de aplicação do WordPress"
          />
          <p className="mt-1 text-xs text-gray-500">
            As senhas de aplicação são mais seguras para uso em APIs. Você pode criar uma em seu perfil do WordPress.
          </p>
        </div>
        
        <div className="flex space-x-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Salvar Credenciais
          </button>
          
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Limpar Credenciais
          </button>
        </div>
        
        {saved && (
          <div className="mt-2 p-2 bg-green-100 text-green-800 rounded">
            Credenciais atualizadas com sucesso!
          </div>
        )}
      </div>
    </div>
  );
};

export default WordPressCredentialsForm;
