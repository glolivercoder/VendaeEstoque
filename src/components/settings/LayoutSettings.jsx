import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';

const LayoutSettings = () => {
  // Estado para armazenar as configurações de layout
  const [layoutConfig, setLayoutConfig] = useLocalStorage('layoutConfig', {
    logoAlignment: 'left', // 'left' ou 'center'
    logoHeight: 45, // altura em pixels
    headerHeight: 80, // altura em pixels
    headerColor: '#2c3e50', // Cor do cabeçalho
    buttonColor: '#3498db', // Cor dos botões
    buttonTextColor: '#ffffff', // Cor do texto dos botões
    textColor: '#333333', // Cor do texto geral
  });

  // Estado para o upload de logo
  const [logoPreview, setLogoPreview] = useState(null);

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
      alert('Logo salva com sucesso!');
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
    try {
      // Aplicar as configurações ao CSS da aplicação
      document.documentElement.style.setProperty('--header-background', layoutConfig.headerColor);
      document.documentElement.style.setProperty('--primary-color', layoutConfig.buttonColor);
      document.documentElement.style.setProperty('--button-text', layoutConfig.buttonTextColor);
      document.documentElement.style.setProperty('--text-color', layoutConfig.textColor);

      // Aplicar altura do cabeçalho - corrigido seletor para garantir que funcione
      const header = document.querySelector('div[class*="bg-[#2c3e50]"]');
      if (header) {
        console.log('Aplicando altura do cabeçalho:', layoutConfig.headerHeight);
        header.style.height = `${layoutConfig.headerHeight}px`;
      } else {
        console.warn('Elemento do cabeçalho não encontrado');
      }

      // Aplicar alinhamento e tamanho da logo
      const logoContainer = document.querySelector('.logo-container');
      if (logoContainer) {
        logoContainer.style.justifyContent = layoutConfig.logoAlignment === 'center' ? 'center' : 'flex-start';
        logoContainer.style.width = '50%';
      } else {
        console.warn('Container do logo não encontrado');
      }

      const logoImg = document.querySelector('.logo-container img');
      if (logoImg) {
        console.log('Aplicando altura do logo:', layoutConfig.logoHeight);
        logoImg.style.height = `${layoutConfig.logoHeight}px`;
      } else {
        console.warn('Imagem do logo não encontrada');
      }

      // Salvar as configurações no localStorage
      localStorage.setItem('layoutConfig', JSON.stringify(layoutConfig));

      alert('Configurações aplicadas com sucesso!');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao aplicar configurações:', error);
      alert('Ocorreu um erro ao aplicar as configurações. Verifique o console para mais detalhes.');
    }
  };

  // Função para resetar as configurações para o padrão
  const resetSettings = () => {
    const defaultSettings = {
      logoAlignment: 'left',
      logoHeight: 45,
      headerHeight: 80,
      headerColor: '#2c3e50',
      buttonColor: '#3498db',
      buttonTextColor: '#ffffff',
      textColor: '#333333',
    };

    setLayoutConfig(defaultSettings);
    alert('Configurações resetadas para o padrão!');
  };

  return (
    <div className="p-3 bg-white rounded-lg shadow max-h-[500px] overflow-y-auto text-sm">
      <h1 className="text-lg font-bold mb-2">Configurações de Layout</h1>

      {/* Seção de Logo */}
      <div className="mb-3 pb-2 border-b border-gray-200">
        <h2 className="text-base font-semibold mb-1">Logo</h2>

        {/* Upload e Visualização */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
          <div>
            <input
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              className="w-full p-1 border rounded mb-1 text-xs"
            />
            <button
              onClick={handleSaveLogo}
              disabled={!logoPreview}
              className="w-full px-2 py-1 bg-blue-500 text-white rounded text-xs disabled:opacity-50"
            >
              Salvar Logo
            </button>
          </div>
          <div className="border rounded p-1 flex items-center justify-center h-16 bg-gray-100">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo Preview" className="max-h-full" />
            ) : (
              <span className="text-gray-500 text-xs">Nenhuma logo selecionada</span>
            )}
          </div>
        </div>

        {/* Alinhamento da Logo */}
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Alinhamento</label>
          <div className="flex gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="logoAlignment"
                value="left"
                checked={layoutConfig.logoAlignment === 'left'}
                onChange={() => updateConfig('logoAlignment', 'left')}
                className="mr-1 h-3 w-3"
              />
              <span className="text-xs">Esquerda</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="logoAlignment"
                value="center"
                checked={layoutConfig.logoAlignment === 'center'}
                onChange={() => updateConfig('logoAlignment', 'center')}
                className="mr-1 h-3 w-3"
              />
              <span className="text-xs">Centro</span>
            </label>
          </div>
        </div>

        {/* Altura da Logo */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium">Altura da Logo</label>
            <span className="text-xs text-gray-500">{layoutConfig.logoHeight}px</span>
          </div>
          <input
            type="range"
            min="20"
            max="300"
            step="5"
            value={layoutConfig.logoHeight}
            onChange={(e) => updateConfig('logoHeight', parseInt(e.target.value))}
            className="w-full h-4"
          />
        </div>
      </div>

      {/* Seção de Cabeçalho */}
      <div className="mb-3 pb-2 border-b border-gray-200">
        <h2 className="text-base font-semibold mb-1">Cabeçalho</h2>

        {/* Altura do Cabeçalho */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <label className="block text-xs font-medium">Altura do Cabeçalho</label>
            <span className="text-xs text-gray-500">{layoutConfig.headerHeight}px</span>
          </div>
          <input
            type="range"
            min="60"
            max="300"
            step="5"
            value={layoutConfig.headerHeight}
            onChange={(e) => updateConfig('headerHeight', parseInt(e.target.value))}
            className="w-full h-4"
          />
        </div>

        {/* Cor do Cabeçalho */}
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Cor do Cabeçalho</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.headerColor}
              onChange={(e) => updateConfig('headerColor', e.target.value)}
              className="w-6 h-6 border-0"
            />
            <input
              type="text"
              value={layoutConfig.headerColor}
              onChange={(e) => updateConfig('headerColor', e.target.value)}
              className="w-20 p-1 text-xs border rounded"
            />
          </div>
        </div>
      </div>

      {/* Seção de Cores */}
      <div className="mb-3">
        <h2 className="text-base font-semibold mb-1">Cores</h2>

        {/* Cor dos Botões */}
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Cor dos Botões</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.buttonColor}
              onChange={(e) => updateConfig('buttonColor', e.target.value)}
              className="w-6 h-6 border-0"
            />
            <input
              type="text"
              value={layoutConfig.buttonColor}
              onChange={(e) => updateConfig('buttonColor', e.target.value)}
              className="w-20 p-1 text-xs border rounded"
            />
          </div>
        </div>

        {/* Cor do Texto dos Botões */}
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Cor do Texto dos Botões</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.buttonTextColor}
              onChange={(e) => updateConfig('buttonTextColor', e.target.value)}
              className="w-6 h-6 border-0"
            />
            <input
              type="text"
              value={layoutConfig.buttonTextColor}
              onChange={(e) => updateConfig('buttonTextColor', e.target.value)}
              className="w-20 p-1 text-xs border rounded"
            />
          </div>
        </div>

        {/* Cor do Texto Geral */}
        <div className="mb-2">
          <label className="block text-xs font-medium mb-1">Cor do Texto Geral</label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={layoutConfig.textColor}
              onChange={(e) => updateConfig('textColor', e.target.value)}
              className="w-6 h-6 border-0"
            />
            <input
              type="text"
              value={layoutConfig.textColor}
              onChange={(e) => updateConfig('textColor', e.target.value)}
              className="w-20 p-1 text-xs border rounded"
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      <div className="flex justify-end gap-2 mt-2">
        <button
          onClick={resetSettings}
          className="px-2 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          Resetar
        </button>
        <button
          onClick={applySettings}
          className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

export default LayoutSettings;
