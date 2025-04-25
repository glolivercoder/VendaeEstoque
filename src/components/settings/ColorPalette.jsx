import React from 'react';

// Componente reutilizável para paletas de cores
const ColorPalette = ({ label, colors }) => {
  return (
    <div className="mb-3">
      <label className="block text-sm font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-2">
        {colors.map((color, index) => (
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
  );
};

export default ColorPalette;
