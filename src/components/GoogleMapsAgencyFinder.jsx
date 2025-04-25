import React, { useState, useEffect, useCallback, useRef } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow, DirectionsRenderer } from '@react-google-maps/api';
import { getAgenciesFromDB, findNearbyAgencies } from '../services/shippingAgencies';

// Chave da API do Google Maps (em produção, isso deve estar em variáveis de ambiente)
const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // Substitua pela sua chave real

// Estilos para o componente
const containerStyle = {
  width: '100%',
  height: '100%'
};

// Opções do mapa
const mapOptions = {
  disableDefaultUI: false,
  zoomControl: true,
  mapTypeControl: true,
  streetViewControl: false,
  fullscreenControl: true
};

// Componente principal
const GoogleMapsAgencyFinder = ({ originCEP, onSelectAgency, onClose }) => {
  // Carregar a API do Google Maps
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries: ['places', 'geometry', 'directions']
  });

  // Estados
  const [map, setMap] = useState(null);
  const [center, setCenter] = useState({ lat: -12.9704, lng: -38.5124 }); // Salvador-BA como padrão
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [directions, setDirections] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [radius, setRadius] = useState(35); // Raio em km
  const [agencyTypes, setAgencyTypes] = useState({
    correios: true,
    jadlog: true,
    transportadora: true,
    logistica: true
  });
  
  // Referências
  const directionsService = useRef(null);
  const placesService = useRef(null);
  const geocoder = useRef(null);

  // Inicializar serviços quando o mapa for carregado
  const onMapLoad = useCallback((map) => {
    setMap(map);
    directionsService.current = new window.google.maps.DirectionsService();
    placesService.current = new window.google.maps.places.PlacesService(map);
    geocoder.current = new window.google.maps.Geocoder();
  }, []);

  // Limpar quando o componente for desmontado
  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Carregar agências quando o componente for montado
  useEffect(() => {
    const loadAgencies = async () => {
      try {
        setLoading(true);
        
        // Carregar agências do banco de dados
        const agenciesData = await getAgenciesFromDB();
        
        if (originCEP) {
          await findNearbyAgenciesHandler(originCEP);
        } else {
          setAgencies(agenciesData);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Erro ao carregar agências:', err);
        setError('Não foi possível carregar as agências. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };
    
    if (isLoaded) {
      loadAgencies();
    }
  }, [isLoaded, originCEP]);

  // Função para buscar agências próximas ao CEP
  const findNearbyAgenciesHandler = async (cep) => {
    if (!isLoaded || !geocoder.current) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Remover caracteres não numéricos do CEP
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        throw new Error('CEP inválido. O CEP deve conter 8 dígitos.');
      }
      
      // Geocodificar o CEP para obter coordenadas
      geocoder.current.geocode({ address: `${cleanCEP}, Brasil` }, async (results, status) => {
        if (status === 'OK' && results[0]) {
          const location = results[0].geometry.location;
          const originLat = location.lat();
          const originLng = location.lng();
          
          setCenter({ lat: originLat, lng: originLng });
          
          // Buscar agências próximas usando nosso serviço
          const nearbyAgencies = await findNearbyAgencies(cleanCEP, radius);
          
          // Converter para o formato esperado pelo Google Maps
          const formattedAgencies = nearbyAgencies.map(agency => ({
            ...agency,
            position: { lat: agency.lat, lng: agency.lon }
          }));
          
          // Filtrar por tipos selecionados
          const filteredAgencies = formattedAgencies.filter(agency => 
            agencyTypes[agency.type]
          );
          
          setAgencies(filteredAgencies);
          
          // Selecionar automaticamente a agência mais próxima
          if (filteredAgencies.length > 0) {
            handleSelectAgency(filteredAgencies[0]);
          }
          
          setLoading(false);
        } else {
          throw new Error(`Erro ao geocodificar CEP: ${status}`);
        }
      });
    } catch (err) {
      console.error('Erro ao buscar agências próximas:', err);
      setError(err.message || 'Não foi possível buscar agências próximas. Por favor, tente novamente mais tarde.');
      setLoading(false);
    }
  };

  // Função para selecionar uma agência
  const handleSelectAgency = (agency) => {
    setSelectedAgency(agency);
    
    if (directionsService.current && map) {
      // Calcular rota para a agência selecionada
      directionsService.current.route({
        origin: center,
        destination: { lat: agency.lat, lng: agency.lon },
        travelMode: window.google.maps.TravelMode.DRIVING
      }, (result, status) => {
        if (status === 'OK') {
          setDirections(result);
        } else {
          console.error('Erro ao calcular rota:', status);
        }
      });
    }
    
    // Notificar o componente pai sobre a seleção
    if (onSelectAgency) {
      onSelectAgency(agency);
    }
  };

  // Função para abrir o Google Maps para navegação
  const openGoogleMapsNavigation = () => {
    if (!selectedAgency) return;
    
    try {
      // Criar URL para o Google Maps com origem e destino
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${center.lat},${center.lng}&destination=${selectedAgency.lat},${selectedAgency.lon}&travelmode=driving`;
      
      // Abrir o Google Maps em uma nova aba
      window.open(googleMapsUrl, '_blank');
    } catch (err) {
      console.error('Erro ao abrir Google Maps:', err);
      setError('Não foi possível abrir o Google Maps para navegação.');
    }
  };

  // Função para filtrar agências por tipo
  const handleFilterChange = (type) => {
    const newAgencyTypes = { ...agencyTypes, [type]: !agencyTypes[type] };
    setAgencyTypes(newAgencyTypes);
    
    // Reaplicar filtro
    if (agencies.length > 0) {
      const filteredAgencies = agencies.filter(agency => 
        newAgencyTypes[agency.type]
      );
      
      // Se a agência selecionada não estiver mais nos filtros, selecionar a primeira da nova lista
      if (selectedAgency && !newAgencyTypes[selectedAgency.type] && filteredAgencies.length > 0) {
        handleSelectAgency(filteredAgencies[0]);
      }
    }
  };

  // Renderizar mensagem de erro se a API não carregar
  if (loadError) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4 text-red-600">Erro ao carregar o Google Maps</h3>
          <p className="mb-4">Não foi possível carregar a API do Google Maps. Por favor, verifique sua conexão com a internet e tente novamente.</p>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar mensagem de carregamento enquanto a API está sendo carregada
  if (!isLoaded) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-4 rounded-lg shadow-xl max-w-md w-full">
          <h3 className="text-xl font-semibold mb-4">Carregando Google Maps</h3>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar o componente principal
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-xl max-w-6xl w-full h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Encontrar Transportadoras Próximas</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Formulário de busca */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1">CEP de Origem</label>
            <input
              type="text"
              value={originCEP || ''}
              onChange={(e) => {/* Controlado pelo componente pai */}}
              className="w-full p-2 border rounded"
              placeholder="00000-000"
              disabled
            />
          </div>
          <div className="w-24">
            <label className="block text-sm font-medium mb-1">Raio (km)</label>
            <input
              type="number"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full p-2 border rounded"
              min="1"
              max="100"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => findNearbyAgenciesHandler(originCEP)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              disabled={loading || !originCEP}
            >
              {loading ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
        </div>

        {/* Filtros de tipo de agência */}
        <div className="mb-4 flex flex-wrap gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="correios"
              checked={agencyTypes.correios}
              onChange={() => handleFilterChange('correios')}
              className="mr-2"
            />
            <label htmlFor="correios" className="text-sm">Correios</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="jadlog"
              checked={agencyTypes.jadlog}
              onChange={() => handleFilterChange('jadlog')}
              className="mr-2"
            />
            <label htmlFor="jadlog" className="text-sm">Jadlog</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="transportadora"
              checked={agencyTypes.transportadora}
              onChange={() => handleFilterChange('transportadora')}
              className="mr-2"
            />
            <label htmlFor="transportadora" className="text-sm">Transportadoras</label>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="logistica"
              checked={agencyTypes.logistica}
              onChange={() => handleFilterChange('logistica')}
              className="mr-2"
            />
            <label htmlFor="logistica" className="text-sm">Centros de Logística</label>
          </div>
        </div>

        {/* Exibir erro se houver */}
        {error && (
          <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Lista de agências */}
          <div className="md:col-span-1 h-[50vh] overflow-y-auto border rounded p-2">
            <h4 className="font-medium mb-2">Agências Encontradas ({agencies.filter(a => agencyTypes[a.type]).length})</h4>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : agencies.filter(a => agencyTypes[a.type]).length === 0 ? (
              <div className="text-center text-gray-500 py-4">
                Nenhuma agência encontrada no raio de {radius}km.
              </div>
            ) : (
              <ul className="space-y-2">
                {agencies
                  .filter(agency => agencyTypes[agency.type])
                  .map(agency => (
                    <li 
                      key={agency.id}
                      className={`p-2 rounded cursor-pointer ${selectedAgency && selectedAgency.id === agency.id ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-100'}`}
                      onClick={() => handleSelectAgency(agency)}
                    >
                      <div className="font-medium">{agency.name}</div>
                      <div className="text-sm text-gray-600">
                        Tipo: {agency.type === 'correios' ? 'Correios' : 
                              agency.type === 'jadlog' ? 'Jadlog' : 
                              agency.type === 'transportadora' ? 'Transportadora' : 'Centro de Logística'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Distância: {agency.distance ? `${agency.distance.toFixed(2)} km` : 'N/A'}
                      </div>
                      {agency.rating && (
                        <div className="text-sm text-gray-600 flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span>{agency.rating}</span>
                          {agency.total_ratings && (
                            <span className="text-xs text-gray-500 ml-1">({agency.total_ratings})</span>
                          )}
                        </div>
                      )}
                      <div className="text-xs text-gray-500 truncate">{agency.address}</div>
                    </li>
                  ))
                }
              </ul>
            )}
          </div>
          
          {/* Mapa */}
          <div className="md:col-span-2 h-[50vh] border rounded">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={13}
              onLoad={onMapLoad}
              onUnmount={onUnmount}
              options={mapOptions}
            >
              {/* Marcador de origem */}
              <Marker
                position={center}
                icon={{
                  url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
                  scaledSize: new window.google.maps.Size(40, 40)
                }}
              />
              
              {/* Marcadores de agências */}
              {agencies
                .filter(agency => agencyTypes[agency.type])
                .map(agency => (
                  <Marker
                    key={agency.id}
                    position={{ lat: agency.lat, lng: agency.lon }}
                    onClick={() => handleSelectAgency(agency)}
                    icon={{
                      url: agency.type === 'correios' ? 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' :
                           agency.type === 'jadlog' ? 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' :
                           agency.type === 'transportadora' ? 'https://maps.google.com/mapfiles/ms/icons/yellow-dot.png' :
                           'https://maps.google.com/mapfiles/ms/icons/purple-dot.png',
                      scaledSize: new window.google.maps.Size(30, 30)
                    }}
                  >
                    {selectedAgency && selectedAgency.id === agency.id && (
                      <InfoWindow
                        position={{ lat: agency.lat, lng: agency.lon }}
                        onCloseClick={() => setSelectedAgency(null)}
                      >
                        <div className="p-2 max-w-xs">
                          <h3 className="font-medium text-base">{agency.name}</h3>
                          <p className="text-sm">{agency.address}</p>
                          <p className="text-sm">Telefone: {agency.phone}</p>
                          <p className="text-sm">Distância: {agency.distance ? `${agency.distance.toFixed(2)} km` : 'N/A'}</p>
                          {agency.rating && (
                            <p className="text-sm flex items-center">
                              <span className="text-yellow-500 mr-1">★</span>
                              <span>{agency.rating}</span>
                              <span className="text-xs text-gray-500 ml-1">({agency.total_ratings})</span>
                            </p>
                          )}
                        </div>
                      </InfoWindow>
                    )}
                  </Marker>
                ))
              }
              
              {/* Rota */}
              {directions && (
                <DirectionsRenderer
                  directions={directions}
                  options={{
                    suppressMarkers: true,
                    polylineOptions: {
                      strokeColor: '#3B82F6',
                      strokeWeight: 5,
                      strokeOpacity: 0.7
                    }
                  }}
                />
              )}
            </GoogleMap>
          </div>
        </div>

        {/* Detalhes da agência selecionada */}
        {selectedAgency && (
          <div className="mt-4 p-3 border rounded bg-gray-50">
            <h4 className="font-medium mb-2">Detalhes da Agência Selecionada</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p><span className="font-medium">Nome:</span> {selectedAgency.name}</p>
                <p><span className="font-medium">Tipo:</span> {
                  selectedAgency.type === 'correios' ? 'Correios' : 
                  selectedAgency.type === 'jadlog' ? 'Jadlog' : 
                  selectedAgency.type === 'transportadora' ? 'Transportadora' : 'Centro de Logística'
                }</p>
                {selectedAgency.rating && (
                  <p>
                    <span className="font-medium">Avaliação:</span>{' '}
                    <span className="flex items-center">
                      <span className="text-yellow-500 mr-1">★</span>
                      <span>{selectedAgency.rating}</span>
                      {selectedAgency.total_ratings && (
                        <span className="text-sm text-gray-500 ml-1">({selectedAgency.total_ratings} avaliações)</span>
                      )}
                    </span>
                  </p>
                )}
                <p><span className="font-medium">Endereço:</span> {selectedAgency.address}</p>
                <p><span className="font-medium">CEP:</span> {selectedAgency.postcode}</p>
                <p><span className="font-medium">Telefone:</span> {selectedAgency.phone}</p>
                <p><span className="font-medium">Email:</span> {selectedAgency.email}</p>
                {selectedAgency.website && (
                  <p>
                    <span className="font-medium">Website:</span>{' '}
                    <a 
                      href={selectedAgency.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {selectedAgency.website}
                    </a>
                  </p>
                )}
              </div>
              <div>
                <p><span className="font-medium">Horário de Funcionamento:</span> {selectedAgency.opening_hours}</p>
                {directions && directions.routes && directions.routes[0] && (
                  <>
                    <p><span className="font-medium">Distância:</span> {(directions.routes[0].legs[0].distance.value / 1000).toFixed(2)} km</p>
                    <p><span className="font-medium">Tempo Estimado:</span> {Math.round(directions.routes[0].legs[0].duration.value / 60)} minutos</p>
                  </>
                )}
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={openGoogleMapsNavigation}
                    disabled={!selectedAgency}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Abrir no Google Maps
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              if (selectedAgency && onSelectAgency) {
                onSelectAgency(selectedAgency);
                onClose();
              }
            }}
            disabled={!selectedAgency}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            Selecionar Agência
          </button>
        </div>
      </div>
    </div>
  );
};

export default GoogleMapsAgencyFinder;
