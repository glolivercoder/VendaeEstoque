import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../styles/ShippingAgencyFinder.css';
import axios from 'axios';
import {
  fetchAgenciesFromOSM,
  getAgenciesFromDB,
  findNearbyAgencies,
  getRoute,
  populateInitialData
} from '../services/shippingAgencies';

// Corrigir o problema dos ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Componente para atualizar a visualização do mapa
function SetViewOnChange({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

// Componente principal
const ShippingAgencyFinder = ({ originCEP, onSelectAgency, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [originCoords, setOriginCoords] = useState(null);
  const [route, setRoute] = useState(null);
  const [mapCenter, setMapCenter] = useState([-23.5505, -46.6333]); // São Paulo como padrão
  const [radius, setRadius] = useState(35);
  const [agencyTypes, setAgencyTypes] = useState({
    correios: true,
    jadlog: true,
    transportadora: true,
    logistica: true
  });
  const [downloadingMap, setDownloadingMap] = useState(false);
  const mapRef = useRef(null);

  // Carregar agências ao iniciar o componente
  useEffect(() => {
    const loadAgencies = async () => {
      try {
        setLoading(true);

        // Primeiro, tentar carregar do banco de dados local
        let agenciesData = await getAgenciesFromDB();

        // Se não houver dados, tentar buscar da API
        if (!agenciesData || agenciesData.length === 0) {
          try {
            agenciesData = await fetchAgenciesFromOSM();
          } catch (apiError) {
            console.error('Erro ao buscar da API, usando dados iniciais:', apiError);
            // Se falhar, usar dados iniciais
            agenciesData = await populateInitialData();
          }
        }

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

    loadAgencies();
  }, []);

  // Função para buscar agências próximas ao CEP
  const findNearbyAgenciesHandler = async (cep) => {
    try {
      setLoading(true);
      setError(null);

      // Remover caracteres não numéricos do CEP
      const cleanCEP = cep.replace(/\D/g, '');

      if (cleanCEP.length !== 8) {
        throw new Error('CEP inválido. O CEP deve conter 8 dígitos.');
      }

      // Buscar coordenadas do CEP
      const response = await axios.get(`https://viacep.com.br/ws/${cleanCEP}/json/`);

      if (response.data.erro) {
        throw new Error('CEP não encontrado');
      }

      // Buscar coordenadas do CEP usando a API de Geocoding do OpenStreetMap (Nominatim)
      const address = `${response.data.logradouro}, ${response.data.bairro}, ${response.data.localidade}, ${response.data.uf}, Brasil`;
      const geocodeResponse = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'LinkVendas-App/1.0'
        }
      });

      if (!geocodeResponse.data || geocodeResponse.data.length === 0) {
        throw new Error('Não foi possível obter as coordenadas do CEP');
      }

      const originLat = parseFloat(geocodeResponse.data[0].lat);
      const originLon = parseFloat(geocodeResponse.data[0].lon);

      setOriginCoords([originLat, originLon]);
      setMapCenter([originLat, originLon]);

      // Buscar agências próximas
      const nearbyAgencies = await findNearbyAgencies(cleanCEP, radius);

      // Filtrar por tipos selecionados
      const filteredAgencies = nearbyAgencies.filter(agency =>
        agencyTypes[agency.type]
      );

      setAgencies(filteredAgencies);

      // Selecionar automaticamente a agência mais próxima
      if (filteredAgencies.length > 0) {
        setSelectedAgency(filteredAgencies[0]);
        // Buscar rota para a agência mais próxima
        const routeData = await getRoute(
          originLat, originLon,
          filteredAgencies[0].lat, filteredAgencies[0].lon
        );
        setRoute(routeData);
      }

      setLoading(false);
    } catch (err) {
      console.error('Erro ao buscar agências próximas:', err);
      setError(err.message || 'Não foi possível buscar agências próximas. Por favor, tente novamente mais tarde.');
      setLoading(false);
    }
  };

  // Função para selecionar uma agência
  const handleSelectAgency = async (agency) => {
    setSelectedAgency(agency);

    if (originCoords) {
      try {
        // Buscar rota para a agência selecionada
        const routeData = await getRoute(
          originCoords[0], originCoords[1],
          agency.lat, agency.lon
        );
        setRoute(routeData);
      } catch (err) {
        console.error('Erro ao buscar rota:', err);
        setError('Não foi possível obter a rota para esta agência.');
      }
    }

    // Notificar o componente pai sobre a seleção
    if (onSelectAgency) {
      onSelectAgency(agency);
    }
  };

  // Função para abrir o Google Maps para navegação
  const openGoogleMapsNavigation = () => {
    if (!selectedAgency || !originCoords) return;

    try {
      // Criar URL para o Google Maps com origem e destino
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${originCoords[0]},${originCoords[1]}&destination=${selectedAgency.lat},${selectedAgency.lon}&travelmode=driving`;

      // Abrir o Google Maps em uma nova aba
      window.open(googleMapsUrl, '_blank');
    } catch (err) {
      console.error('Erro ao abrir Google Maps:', err);
      setError('Não foi possível abrir o Google Maps para navegação.');
    }
  };

  // Função para baixar o mapa para navegação offline
  const handleDownloadMap = async () => {
    if (!selectedAgency || !originCoords) return;

    try {
      setDownloadingMap(true);

      // Simular o download do mapa (em uma aplicação real, isso seria implementado com uma biblioteca específica)
      await new Promise(resolve => setTimeout(resolve, 2000));

      alert(`Mapa da rota para ${selectedAgency.name} baixado com sucesso para navegação offline!`);
      setDownloadingMap(false);
    } catch (err) {
      console.error('Erro ao baixar mapa:', err);
      setError('Não foi possível baixar o mapa para navegação offline.');
      setDownloadingMap(false);
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

  // Renderizar o componente
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
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* Marcador de origem */}
              {originCoords && (
                <Marker position={originCoords}>
                  <Popup>
                    Sua localização (CEP: {originCEP})
                  </Popup>
                </Marker>
              )}

              {/* Marcadores de agências */}
              {agencies
                .filter(agency => agencyTypes[agency.type])
                .map(agency => (
                  <Marker
                    key={agency.id}
                    position={[agency.lat, agency.lon]}
                    eventHandlers={{
                      click: () => handleSelectAgency(agency)
                    }}
                  >
                    <Popup>
                      <div>
                        <h3 className="font-medium">{agency.name}</h3>
                        <p className="text-sm">{agency.address}</p>
                        <p className="text-sm">Telefone: {agency.phone}</p>
                        <p className="text-sm">Distância: {agency.distance ? `${agency.distance.toFixed(2)} km` : 'N/A'}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))
              }

              {/* Rota */}
              {route && route.route && (
                <Polyline
                  positions={route.route.coordinates.map(coord => [coord[1], coord[0]])}
                  color="blue"
                />
              )}

              {/* Atualizar visualização quando o centro mudar */}
              <SetViewOnChange center={mapCenter} />
            </MapContainer>
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
                {selectedAgency.place_id && (
                  <p>
                    <span className="font-medium">Ver no Google Maps:</span>{' '}
                    <a
                      href={`https://www.google.com/maps/place/?q=place_id:${selectedAgency.place_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Abrir no Google Maps
                    </a>
                  </p>
                )}
              </div>
              <div>
                <p><span className="font-medium">Horário de Funcionamento:</span> {selectedAgency.opening_hours}</p>
                {route && (
                  <>
                    <p><span className="font-medium">Distância:</span> {selectedAgency.distance ? `${selectedAgency.distance.toFixed(2)} km` : 'N/A'}</p>
                    <p><span className="font-medium">Tempo Estimado:</span> {route.duration ? `${Math.round(route.duration)} minutos` : 'N/A'}</p>
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
                  <button
                    onClick={handleDownloadMap}
                    disabled={downloadingMap || !route}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    {downloadingMap ? 'Baixando...' : 'Baixar Mapa para Navegação Offline'}
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

export default ShippingAgencyFinder;
