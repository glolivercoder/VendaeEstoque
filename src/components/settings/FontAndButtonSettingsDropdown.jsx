import React, { useState } from 'react';

const FONT_FAMILIES = [
  'Arial', 'Roboto', 'Montserrat', 'Open Sans', 'Lato', 'Poppins', 'Nunito', 'Ubuntu', 'Tahoma', 'Verdana', 'sans-serif'
];

const FONT_CATEGORIES = [
  { label: 'Título Principal (h1)', key: 'h1', defaultSize: 28 },
  { label: 'Título Secundário (h2)', key: 'h2', defaultSize: 22 },
  { label: 'Título Terciário (h3)', key: 'h3', defaultSize: 18 },
  { label: 'Texto do Menu', key: 'menu', defaultSize: 16 },
  { label: 'Texto Padrão', key: 'body', defaultSize: 15 },
  { label: 'Texto de Observação', key: 'small', defaultSize: 13 }
];

const BUTTON_STYLES = [
  { label: 'Primário', key: 'primary' },
  { label: 'Secundário', key: 'secondary' },
  { label: 'Sucesso', key: 'success' },
  { label: 'Aviso', key: 'warning' },
  { label: 'Erro', key: 'danger' }
];

export default function FontAndButtonSettingsDropdown({
  fontConfig,
  setFontConfig,
  buttonConfig,
  setButtonConfig
}) {
  // Estado para controlar qual painel está aberto
  const [openPanel, setOpenPanel] = useState('h1');

  // Atualiza uma categoria específica de fonte
  const updateFont = (catKey, prop, value) => {
    setFontConfig({
      ...fontConfig,
      [catKey]: {
        ...(fontConfig[catKey] || {}),
        [prop]: value
      }
    });
  };

  const isPanelOpen = (key) => openPanel === key;
  const handlePanelClick = (key) => setOpenPanel(openPanel === key ? null : key);

  return (
    <div className="space-y-2">
      {/* Accordions para fontes por categoria */}
      {FONT_CATEGORIES.map(cat => (
        <div key={cat.key} className="rounded border bg-gray-50">
          <button
            className={`w-full flex items-center justify-between px-4 py-2 text-left font-semibold text-sm focus:outline-none ${isPanelOpen(cat.key) ? 'bg-blue-100' : ''}`}
            onClick={() => handlePanelClick(cat.key)}
            aria-expanded={isPanelOpen(cat.key)}
          >
            <span>{cat.label}</span>
            <span className="ml-2">{isPanelOpen(cat.key) ? '▲' : '▼'}</span>
          </button>
          {isPanelOpen(cat.key) && (
            <div className="px-4 py-3 flex flex-wrap gap-3 items-center border-t">
              <label className="text-xs font-medium">Família</label>
              <select
                className="border rounded p-1 min-h-[30px] min-w-[30px]"
                value={fontConfig[cat.key]?.family || 'Roboto'}
                onChange={e => updateFont(cat.key, 'family', e.target.value)}
              >
                {FONT_FAMILIES.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <label className="text-xs font-medium">Tamanho</label>
              <input
                type="number"
                min={10}
                max={48}
                value={fontConfig[cat.key]?.size || cat.defaultSize}
                onChange={e => updateFont(cat.key, 'size', e.target.value)}
                className="w-16 border rounded min-h-[30px] min-w-[30px] p-1"
              />
              <span className="text-xs">px</span>
              <label className="text-xs font-medium">Cor</label>
              <input
                type="color"
                value={fontConfig[cat.key]?.color || '#333333'}
                onChange={e => updateFont(cat.key, 'color', e.target.value)}
                className="w-[30px] h-[30px] border-0"
              />
            </div>
          )}
        </div>
      ))}
      {/* Accordion para botões */}
      <div className="rounded border bg-gray-50">
        <button
          className={`w-full flex items-center justify-between px-4 py-2 text-left font-semibold text-sm focus:outline-none ${isPanelOpen('buttons') ? 'bg-blue-100' : ''}`}
          onClick={() => handlePanelClick('buttons')}
          aria-expanded={isPanelOpen('buttons')}
        >
          <span>Botões do Sistema</span>
          <span className="ml-2">{isPanelOpen('buttons') ? '▲' : '▼'}</span>
        </button>
        {isPanelOpen('buttons') && (
          <div className="px-4 py-3 border-t">
            {BUTTON_STYLES.map(btn => (
              <div key={btn.key} className="mb-2 flex gap-2 items-center">
                <span className="w-20 text-xs font-medium">{btn.label}</span>
                <input
                  type="color"
                  value={buttonConfig[btn.key]?.color || '#3498db'}
                  onChange={e => setButtonConfig({ ...buttonConfig, [btn.key]: { ...buttonConfig[btn.key], color: e.target.value } })}
                  className="w-[30px] h-[30px] border-0"
                />
                <input
                  type="number"
                  min={10}
                  max={32}
                  value={buttonConfig[btn.key]?.fontSize || 14}
                  onChange={e => setButtonConfig({ ...buttonConfig, [btn.key]: { ...buttonConfig[btn.key], fontSize: e.target.value } })}
                  className="w-16 border rounded min-h-[30px] min-w-[30px] p-1"
                />
                <span className="text-xs">px</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
