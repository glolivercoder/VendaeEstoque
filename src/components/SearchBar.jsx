import React from 'react';

const SearchBar = ({ value, onChange, placeholder }) => {
  return (
    <div className="flex justify-center mb-4">
      <div className="w-full max-w-md">
        <input
          type="text"
          placeholder={placeholder || "Buscar..."}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default SearchBar;
