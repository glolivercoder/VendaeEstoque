import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const LayoutSettings = () => {
  // Estado para armazenar as configurações de layout
  const [layoutConfig, setLayoutConfig] = useLocalStorage('layoutConfig', {
    logoAlignment: 'left', // 'left' ou 'center'
    logoSize: 'medium', // 'small', 'medium', 'large'
    headerColor: '#2c3e50', // Cor do cabeçalho
    buttonColor: '#3498db', // Cor dos botões
    buttonTextColor: '#ffffff', // Cor do texto dos botões
    descriptionTextColor: '#333333', // Cor do texto das descrições
    menuTextColor: '#ffffff', // Cor do texto dos menus
    backgroundColor: '#f5f5f5', // Cor de fundo da aplicação
  });

  // Estado para o upload de logo
  const [logoPreview, setLogoPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Cores do logo para a paleta
  const logoPalette = [
    { name: 'Azul Logo', color: '#3498db' },
    { name: 'Laranja Logo', color: '#f39c12' },
    { name: 'Branco', color: '#ffffff' },
    { name: 'Azul Escuro Logo', color: '#2c3e50' },
  ];

  // Cores já usadas no sistema
  const systemPalette = [
    { name: 'Verde', color: '#2ecc71' },
    { name: 'Vermelho', color: '#e74c3c' },
    { name: 'Roxo', color: '#9b59b6' },
    { name: 'Amarelo', color: '#f1c40f' },
    { name: 'Cinza Claro', color: '#ecf0f1' },
    { name: 'Cinza Escuro', color: '#34495e' },
  ];

  // Removida a paleta de cores HTML conforme solicitado

  // Carregar a logo atual
  useEffect(() => {
    const savedLogo = localStorage.getItem('customLogo');
    if (savedLogo) {
      setLogoPreview(savedLogo);
    }
  }, []);

  // Função para lidar com o upload de logo
  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogoPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Função para salvar a logo
  const handleSaveLogo = () => {
    if (logoPreview) {
      localStorage.setItem('customLogo', logoPreview);
      localStorage.setItem('logoSize', layoutConfig.logoSize);
      alert('Logo salva com sucesso! Atualize a página para ver as alterações.');
      // Forçar atualização da página para mostrar a nova logo
      window.location.reload();
    }
  };

  // Função para atualizar as configurações
  const updateConfig = (key, value) => {
    setLayoutConfig({
      ...layoutConfig,
      [key]: value
    });
  };

  // Função para aplicar as configurações
  const applySettings = () => {
    // Aplicar as configurações ao CSS da aplicação
    document.documentElement.style.setProperty('--header-background', layoutConfig.headerColor);
    document.documentElement.style.setProperty('--primary-color', layoutConfig.buttonColor);
    document.documentElement.style.setProperty('--button-text', layoutConfig.buttonTextColor);
    document.documentElement.style.setProperty('--text-color', layoutConfig.descriptionTextColor);
    document.documentElement.style.setProperty('--sidebar-text', layoutConfig.menuTextColor);
    document.documentElement.style.setProperty('--background-color', layoutConfig.backgroundColor);

    // Aplicar alinhamento do logo
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
      logoContainer.style.justifyContent = layoutConfig.logoAlignment === 'center' ? 'center' : 'flex-start';
    }

    // Salvar o tamanho do logo
    localStorage.setItem('logoSize', layoutConfig.logoSize);

    // Atualizar a página para aplicar todas as alterações
    alert('Configurações aplicadas com sucesso! A página será recarregada para aplicar todas as alterações.');
    window.location.reload();
  };

  // Função para resetar as configurações para o padrão
  const resetSettings = () => {
    const defaultSettings = {
      logoAlignment: 'left',
      logoSize: 'medium',
      headerColor: '#2c3e50',
      buttonColor: '#3498db',
      buttonTextColor: '#ffffff',
      descriptionTextColor: '#333333',
      menuTextColor: '#ffffff',
      backgroundColor: '#f5f5f5',
    };

    setLayoutConfig(defaultSettings);

    // Aplicar configurações padrão
    document.documentElement.style.setProperty('--header-background', defaultSettings.headerColor);
    document.documentElement.style.setProperty('--primary-color', defaultSettings.buttonColor);
    document.documentElement.style.setProperty('--button-text', defaultSettings.buttonTextColor);
    document.documentElement.style.setProperty('--text-color', defaultSettings.descriptionTextColor);
    document.documentElement.style.setProperty('--sidebar-text', defaultSettings.menuTextColor);
    document.documentElement.style.setProperty('--background-color', defaultSettings.backgroundColor);

    alert('Configurações resetadas para o padrão!');
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">Configurações de Layout</h2>

      {/* Upload de Logo */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Logo</h3>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Upload de Logo</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleSaveLogo}
              disabled={!logoPreview}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Salvar Logo
            </button>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">Visualização</label>
            <div className="border rounded p-4 flex items-center justify-center h-32 bg-gray-100">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo Preview" className="max-h-full" />
              ) : (
                <span className="text-gray-500">Nenhuma logo selecionada</span>
              )}
            </div>
          </div>
        </div>

        {/* Alinhamento da Logo */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Alinhamento da Logo</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="logoAlignment"
                value="left"
                checked={layoutConfig.logoAlignment === 'left'}
                onChange={() => updateConfig('logoAlignment', 'left')}
                className="mr-2"
              />
              Esquerda
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="logoAlignment"
                value="center"
                checked={layoutConfig.logoAlignment === 'center'}
                onChange={() => updateConfig('logoAlignment', 'center')}
                className="mr-2"
              />
              Centro
            </label>
          </div>
        </div>

        {/* Tamanho da Logo */}
        <div className="mt-4">
          <label className="block text-sm font-medium mb-1">Tamanho da Logo</label>
          <select
            value={layoutConfig.logoSize}
            onChange={(e) => updateConfig('logoSize', e.target.value)}
            className="w-full p-2 border rounded"
          >
            <option value="small">Pequeno</option>
            <option value="medium">Médio</option>
            <option value="large">Grande</option>
          </select>
        </div>
      </div>

      {/* Cores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Cores</h3>

        {/* Cor do Cabeçalho */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cor do Cabeçalho</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.headerColor}
              onChange={(e) => updateConfig('headerColor', e.target.value)}
              className="w-10 h-10 border-0"
            />
            <input
              type="text"
              value={layoutConfig.headerColor}
              onChange={(e) => updateConfig('headerColor', e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>
        </div>

        {/* Cor dos Botões */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cor dos Botões</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.buttonColor}
              onChange={(e) => updateConfig('buttonColor', e.target.value)}
              className="w-10 h-10 border-0"
            />
            <input
              type="text"
              value={layoutConfig.buttonColor}
              onChange={(e) => updateConfig('buttonColor', e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>
        </div>

        {/* Cor do Texto dos Botões */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cor do Texto dos Botões</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.buttonTextColor}
              onChange={(e) => updateConfig('buttonTextColor', e.target.value)}
              className="w-10 h-10 border-0"
            />
            <input
              type="text"
              value={layoutConfig.buttonTextColor}
              onChange={(e) => updateConfig('buttonTextColor', e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>
        </div>

        {/* Cor do Texto das Descrições */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cor do Texto das Descrições</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.descriptionTextColor}
              onChange={(e) => updateConfig('descriptionTextColor', e.target.value)}
              className="w-10 h-10 border-0"
            />
            <input
              type="text"
              value={layoutConfig.descriptionTextColor}
              onChange={(e) => updateConfig('descriptionTextColor', e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>
        </div>

        {/* Cor do Texto dos Menus */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cor do Texto dos Menus</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.menuTextColor}
              onChange={(e) => updateConfig('menuTextColor', e.target.value)}
              className="w-10 h-10 border-0"
            />
            <input
              type="text"
              value={layoutConfig.menuTextColor}
              onChange={(e) => updateConfig('menuTextColor', e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>
        </div>

        {/* Cor de Fundo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cor de Fundo</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.backgroundColor}
              onChange={(e) => updateConfig('backgroundColor', e.target.value)}
              className="w-10 h-10 border-0"
            />
            <input
              type="text"
              value={layoutConfig.backgroundColor}
              onChange={(e) => updateConfig('backgroundColor', e.target.value)}
              className="w-32 p-2 border rounded"
            />
          </div>
        </div>
      </div>

      {/* Paletas de Cores */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Paletas de Cores</h3>

        {/* Cores do Logo */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cores do Logo</label>
          <div className="flex flex-wrap gap-2">
            {logoPalette.map((color, index) => (
              <div key={index} className="text-center">
                <button
                  className="w-10 h-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                  onClick={() => {
                    const colorPicker = document.querySelector('input[type="color"]:focus');
                    if (colorPicker) {
                      colorPicker.value = color.color;
                      colorPicker.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                  }}
                />
                <span className="text-xs block mt-1">{color.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cores do Sistema */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Cores do Sistema</label>
          <div className="flex flex-wrap gap-2">
            {systemPalette.map((color, index) => (
              <div key={index} className="text-center">
                <button
                  className="w-10 h-10 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                  onClick={() => {
                    const colorPicker = document.querySelector('input[type="color"]:focus');
                    if (colorPicker) {
                      colorPicker.value = color.color;
                      colorPicker.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                  }}
                />
                <span className="text-xs block mt-1">{color.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Paleta HTML removida conforme solicitado */}
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-4 mt-6">
        <button
          onClick={resetSettings}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Resetar
        </button>
        <button
          onClick={applySettings}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

export default LayoutSettings;
