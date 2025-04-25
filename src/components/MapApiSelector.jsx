import React, { useState } from 'react';
import GoogleMapsAgencyFinder from './GoogleMapsAgencyFinder';
import HereMapsAgencyFinder from './HereMapsAgencyFinder';

const MapApiSelector = ({ originCEP, onSelectAgency, onClose }) => {
  const [selectedApi, setSelectedApi] = useState('google'); // 'google' ou 'here'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Selecionar API de Mapas</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Selecione a API de mapas que você deseja usar para encontrar transportadoras próximas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Google Maps */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedApi === 'google' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
              onClick={() => setSelectedApi('google')}
            >
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 mr-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <path d="M12 12C12 9.79086 10.2091 8 8 8C5.79086 8 4 9.79086 4 12C4 14.2091 5.79086 16 8 16C10.2091 16 12 14.2091 12 12Z" fill="#34A853"/>
                    <path d="M12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12Z" fill="#FBBC05"/>
                    <path d="M12 12C12 9.79086 10.2091 8 8 8C5.79086 8 4 9.79086 4 12" fill="#EA4335"/>
                    <path d="M12 12C12 14.2091 10.2091 16 8 16C5.79086 16 4 14.2091 4 12" fill="#C5221F"/>
                    <path d="M12 12C12 14.2091 13.7909 16 16 16C18.2091 16 20 14.2091 20 12" fill="#4285F4"/>
                    <path d="M12 12C12 9.79086 13.7909 8 16 8C18.2091 8 20 9.79086 20 12" fill="#1A73E8"/>
                  </svg>
                </div>
                <h4 className="font-medium">Google Maps</h4>
              </div>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                <li>Maior cobertura de POIs</li>
                <li>Navegação precisa</li>
                <li>Informações de tráfego em tempo real</li>
                <li>Avaliações e fotos de locais</li>
              </ul>
            </div>
            
            {/* HERE Maps */}
            <div 
              className={`p-4 border rounded-lg cursor-pointer transition-all ${selectedApi === 'here' ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-300'}`}
              onClick={() => setSelectedApi('here')}
            >
              <div className="flex items-center mb-2">
                <div className="w-6 h-6 mr-2 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">
                    <rect width="24" height="24" rx="4" fill="#48DAD0" />
                    <path d="M7 7H11V17H7V7Z" fill="#000000" />
                    <path d="M13 7H17V17H13V7Z" fill="#000000" />
                  </svg>
                </div>
                <h4 className="font-medium">HERE Maps</h4>
              </div>
              <ul className="text-xs text-gray-600 list-disc list-inside">
                <li>Plano gratuito com 250.000 transações/mês</li>
                <li>Rotas otimizadas para diferentes veículos</li>
                <li>Cálculo de custos com pedágios</li>
                <li>Integração com sistemas TMS, CRM, WMS</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            onClick={() => {
              if (selectedApi === 'google') {
                onClose();
                setTimeout(() => {
                  const event = new CustomEvent('openGoogleMapsAgencyFinder', {
                    detail: { originCEP, onSelectAgency, onClose }
                  });
                  window.dispatchEvent(event);
                }, 100);
              } else {
                onClose();
                setTimeout(() => {
                  const event = new CustomEvent('openHereMapsAgencyFinder', {
                    detail: { originCEP, onSelectAgency, onClose }
                  });
                  window.dispatchEvent(event);
                }, 100);
              }
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Continuar
          </button>
        </div>
      </div>
    </div>
  );
};

export default MapApiSelector;
