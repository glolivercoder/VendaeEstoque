import React from 'react';

// Componente reutilizável para seleção de cores
const ColorPicker = ({ label, value, onChange, id }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className="w-10 h-10 border-0"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(id, e.target.value)}
          className="w-32 p-2 border rounded"
        />
      </div>
    </div>
  );
};

export default ColorPicker;
