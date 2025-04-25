import React from 'react';

// Componente reutilizável para controles deslizantes
const SliderControl = ({ label, value, min, max, step, onChange, id, unit = 'px' }) => {
  return (
    <div className="mb-3">
      <div className="flex justify-between items-center mb-1">
        <label className="block text-sm font-medium">{label}</label>
        <span className="text-sm text-gray-500">{value}{unit}</span>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(id, parseInt(e.target.value))}
          className="w-full"
        />
      </div>
    </div>
  );
};

export default SliderControl;
