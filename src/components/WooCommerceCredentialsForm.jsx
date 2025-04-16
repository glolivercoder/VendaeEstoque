import { useState, useEffect } from 'react';

/**
 * Componente para gerenciar credenciais do WordPress/WooCommerce
 */
const WooCommerceCredentialsForm = () => {
  const [credentials, setCredentials] = useState({
    wpUsername: '',
    wpPassword: '',
    consumerKey: '',
    consumerSecret: '',
    siteUrl: ''
  });

  const [saved, setSaved] = useState(false);

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const wpUsername = localStorage.getItem('wp_username') || '';
    const wpPassword = localStorage.getItem('wp_password') || '';
    const consumerKey = localStorage.getItem('wc_consumer_key') || '';
    const consumerSecret = localStorage.getItem('wc_consumer_secret') || '';
    const siteUrl = localStorage.getItem('wp_site_url') || '';

    setCredentials({
      wpUsername,
      wpPassword,
      consumerKey,
      consumerSecret,
      siteUrl
    });
  }, []);

  // Função para atualizar os campos do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    setSaved(false);
  };

  // Função para salvar as credenciais
  const handleSave = (e) => {
    e.preventDefault();

    // Salvar no localStorage
    localStorage.setItem('wp_username', credentials.wpUsername);
    localStorage.setItem('wp_password', credentials.wpPassword);
    localStorage.setItem('wc_consumer_key', credentials.consumerKey);
    localStorage.setItem('wc_consumer_secret', credentials.consumerSecret);
    localStorage.setItem('wp_site_url', credentials.siteUrl);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <h3 className="text-lg font-semibold mb-4">Configurações do WordPress/WooCommerce</h3>
      
      <form onSubmit={handleSave}>
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="siteUrl">
            URL do Site WordPress
          </label>
          <input
            type="text"
            id="siteUrl"
            name="siteUrl"
            value={credentials.siteUrl}
            onChange={handleChange}
            placeholder="https://seusite.com.br"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <p className="text-xs text-gray-500 mt-1">
            URL completa do seu site WordPress (ex: https://achadinhoshopp.com.br/loja)
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="wpUsername">
            Nome de Usuário do WordPress
          </label>
          <input
            type="text"
            id="wpUsername"
            name="wpUsername"
            value={credentials.wpUsername}
            onChange={handleChange}
            placeholder="admin"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="wpPassword">
            Senha de Aplicativo do WordPress
          </label>
          <input
            type="password"
            id="wpPassword"
            name="wpPassword"
            value={credentials.wpPassword}
            onChange={handleChange}
            placeholder="xxxx xxxx xxxx xxxx xxxx xxxx"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <p className="text-xs text-gray-500 mt-1">
            Gere uma senha de aplicativo no seu perfil do WordPress (Usuários &gt; Seu Perfil &gt; Senhas de Aplicativo)
          </p>
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="consumerKey">
            Consumer Key do WooCommerce
          </label>
          <input
            type="text"
            id="consumerKey"
            name="consumerKey"
            value={credentials.consumerKey}
            onChange={handleChange}
            placeholder="ck_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </div>

        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="consumerSecret">
            Consumer Secret do WooCommerce
          </label>
          <input
            type="password"
            id="consumerSecret"
            name="consumerSecret"
            value={credentials.consumerSecret}
            onChange={handleChange}
            placeholder="cs_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
          <p className="text-xs text-gray-500 mt-1">
            Obtenha suas chaves de API em WooCommerce &gt; Configurações &gt; Avançado &gt; REST API
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Salvar Credenciais
          </button>
          
          {saved && (
            <span className="text-green-500 ml-2">
              Credenciais salvas com sucesso!
            </span>
          )}
        </div>
      </form>
    </div>
  );
};

export default WooCommerceCredentialsForm;
