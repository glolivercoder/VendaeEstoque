import React, { useState, useEffect, useRef } from 'react';
import { getAgenciesFromDB, findNearbyAgencies } from '../services/shippingAgencies';

// Chave da API da HERE Maps (em produção, isso deve estar em variáveis de ambiente)
const HERE_API_KEY = 'YOUR_HERE_API_KEY'; // Substitua pela sua chave real

// Componente principal
const HereMapsAgencyFinder = ({ originCEP, onSelectAgency, onClose }) => {
  // Estados
  const [map, setMap] = useState(null);
  const [platform, setPlatform] = useState(null);
  const [center, setCenter] = useState({ lat: -12.9704, lng: -38.5124 }); // Salvador-BA como padrão
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [route, setRoute] = useState(null);
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
  const mapRef = useRef(null);
  const markersGroup = useRef(null);
  const routeGroup = useRef(null);

  // Inicializar o mapa quando o componente for montado
  useEffect(() => {
    // Carregar o script da HERE Maps API
    const loadHereMapsScript = () => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `https://js.api.here.com/v3/3.1/mapsjs-core.js`;
      script.async = true;
      script.onload = () => {
        const script2 = document.createElement('script');
        script2.type = 'text/javascript';
        script2.src = `https://js.api.here.com/v3/3.1/mapsjs-service.js`;
        script2.async = true;
        script2.onload = () => {
          const script3 = document.createElement('script');
          script3.type = 'text/javascript';
          script3.src = `https://js.api.here.com/v3/3.1/mapsjs-mapevents.js`;
          script3.async = true;
          script3.onload = () => {
            const script4 = document.createElement('script');
            script4.type = 'text/javascript';
            script4.src = `https://js.api.here.com/v3/3.1/mapsjs-ui.js`;
            script4.async = true;
            script4.onload = () => {
              const link = document.createElement('link');
              link.rel = 'stylesheet';
              link.type = 'text/css';
              link.href = `https://js.api.here.com/v3/3.1/mapsjs-ui.css`;
              document.head.appendChild(link);
              
              initializeMap();
            };
            document.head.appendChild(script4);
          };
          document.head.appendChild(script3);
        };
        document.head.appendChild(script2);
      };
      document.head.appendChild(script);
    };

    // Inicializar o mapa
    const initializeMap = () => {
      try {
        // Inicializar a plataforma HERE com a chave de API
        const herePlatform = new window.H.service.Platform({
          apikey: HERE_API_KEY
        });
        setPlatform(herePlatform);

        // Obter os tipos de mapa padrão da plataforma
        const defaultLayers = herePlatform.createDefaultLayers();

        // Inicializar o mapa
        const newMap = new window.H.Map(
          mapRef.current,
          defaultLayers.vector.normal.map,
          {
            center: center,
            zoom: 13,
            pixelRatio: window.devicePixelRatio || 1
          }
        );
        setMap(newMap);

        // Adicionar controles de interação ao mapa
        const behavior = new window.H.mapevents.Behavior(new window.H.mapevents.MapEvents(newMap));

        // Adicionar UI ao mapa
        const ui = new window.H.ui.UI.createDefault(newMap, defaultLayers);

        // Criar grupos para marcadores e rotas
        markersGroup.current = new window.H.map.Group();
        routeGroup.current = new window.H.map.Group();
        newMap.addObject(markersGroup.current);
        newMap.addObject(routeGroup.current);

        // Carregar agências
        loadAgencies();
      } catch (err) {
        console.error('Erro ao inicializar o mapa:', err);
        setError('Não foi possível inicializar o mapa. Por favor, tente novamente mais tarde.');
        setLoading(false);
      }
    };

    loadHereMapsScript();

    // Limpar quando o componente for desmontado
    return () => {
      if (map) {
        map.dispose();
      }
    };
  }, []);

  // Carregar agências
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

  // Função para buscar agências próximas ao CEP
  const findNearbyAgenciesHandler = async (cep) => {
    if (!platform) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Remover caracteres não numéricos do CEP
      const cleanCEP = cep.replace(/\D/g, '');
      
      if (cleanCEP.length !== 8) {
        throw new Error('CEP inválido. O CEP deve conter 8 dígitos.');
      }
      
      // Geocodificar o CEP para obter coordenadas
      const geocoder = platform.getSearchService();
      
      geocoder.geocode(
        {
          q: `${cleanCEP}, Brasil`
        },
        async (result) => {
          try {
            if (result.items && result.items.length > 0) {
              const location = result.items[0].position;
              const originLat = location.lat;
              const originLng = location.lng;
              
              // Atualizar o centro do mapa
              setCenter({ lat: originLat, lng: originLng });
              map.setCenter({ lat: originLat, lng: originLng });
              
              // Adicionar marcador para a origem
              markersGroup.current.removeAll();
              const originMarker = new window.H.map.Marker({ lat: originLat, lng: originLng });
              markersGroup.current.addObject(originMarker);
              
              // Buscar agências próximas usando nosso serviço
              const nearbyAgencies = await findNearbyAgencies(cleanCEP, radius);
              
              // Filtrar por tipos selecionados
              const filteredAgencies = nearbyAgencies.filter(agency => 
                agencyTypes[agency.type]
              );
              
              setAgencies(filteredAgencies);
              
              // Adicionar marcadores para as agências
              filteredAgencies.forEach(agency => {
                const marker = new window.H.map.Marker({ lat: agency.lat, lng: agency.lon });
                marker.setData(agency);
                marker.addEventListener('tap', (evt) => {
                  handleSelectAgency(evt.target.getData());
                });
                markersGroup.current.addObject(marker);
              });
              
              // Selecionar automaticamente a agência mais próxima
              if (filteredAgencies.length > 0) {
                handleSelectAgency(filteredAgencies[0]);
              }
              
              setLoading(false);
            } else {
              throw new Error('Não foi possível encontrar as coordenadas para o CEP informado.');
            }
          } catch (err) {
            console.error('Erro ao processar resultado da geocodificação:', err);
            setError(err.message || 'Não foi possível buscar agências próximas. Por favor, tente novamente mais tarde.');
            setLoading(false);
          }
        },
        (error) => {
          console.error('Erro na geocodificação:', error);
          setError('Não foi possível encontrar as coordenadas para o CEP informado.');
          setLoading(false);
        }
      );
    } catch (err) {
      console.error('Erro ao buscar agências próximas:', err);
      setError(err.message || 'Não foi possível buscar agências próximas. Por favor, tente novamente mais tarde.');
      setLoading(false);
    }
  };

  // Função para selecionar uma agência
  const handleSelectAgency = (agency) => {
    setSelectedAgency(agency);
    
    if (platform && map) {
      // Calcular rota para a agência selecionada
      const router = platform.getRoutingService(null, 8);
      
      const routingParameters = {
        'routingMode': 'fast',
        'transportMode': 'car',
        'origin': `${center.lat},${center.lng}`,
        'destination': `${agency.lat},${agency.lon}`,
        'return': 'polyline,summary,actions,instructions'
      };
      
      router.calculateRoute(
        routingParameters,
        (result) => {
          if (result.routes.length) {
            const route = result.routes[0];
            
            // Limpar rotas anteriores
            routeGroup.current.removeAll();
            
            // Criar linha da rota
            const routeLineString = new window.H.geo.LineString();
            route.sections[0].polyline.points.forEach((point) => {
              const parts = point.split(',');
              routeLineString.pushLatLngAlt(parts[0], parts[1]);
            });
            
            const routeLine = new window.H.map.Polyline(routeLineString, {
              style: { strokeColor: '#3B82F6', lineWidth: 5 }
            });
            
            routeGroup.current.addObject(routeLine);
            
            // Ajustar o zoom para mostrar toda a rota
            map.getViewModel().setLookAtData({
              bounds: routeGroup.current.getBoundingBox()
            });
            
            // Salvar informações da rota
            setRoute({
              distance: route.sections[0].summary.length / 1000, // Converter para km
              duration: route.sections[0].summary.duration / 60 // Converter para minutos
            });
          }
        },
        (error) => {
          console.error('Erro ao calcular rota:', error);
        }
      );
    }
    
    // Notificar o componente pai sobre a seleção
    if (onSelectAgency) {
      onSelectAgency(agency);
    }
  };

  // Função para abrir o HERE WeGo para navegação
  const openHereNavigation = () => {
    if (!selectedAgency) return;
    
    try {
      // Criar URL para o HERE WeGo com origem e destino
      const hereWeGoUrl = `https://wego.here.com/directions/drive/${center.lat},${center.lng}/${selectedAgency.lat},${selectedAgency.lon}`;
      
      // Abrir o HERE WeGo em uma nova aba
      window.open(hereWeGoUrl, '_blank');
    } catch (err) {
      console.error('Erro ao abrir HERE WeGo:', err);
      setError('Não foi possível abrir o HERE WeGo para navegação.');
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
      
      // Atualizar marcadores
      markersGroup.current.removeAll();
      
      // Adicionar marcador para a origem
      if (center) {
        const originMarker = new window.H.map.Marker({ lat: center.lat, lng: center.lng });
        markersGroup.current.addObject(originMarker);
      }
      
      // Adicionar marcadores para as agências filtradas
      filteredAgencies.forEach(agency => {
        const marker = new window.H.map.Marker({ lat: agency.lat, lng: agency.lon });
        marker.setData(agency);
        marker.addEventListener('tap', (evt) => {
          handleSelectAgency(evt.target.getData());
        });
        markersGroup.current.addObject(marker);
      });
      
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
          <h3 className="text-xl font-semibold">Encontrar Transportadoras Próximas (HERE Maps)</h3>
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
            <div ref={mapRef} style={{ width: '100%', height: '100%' }}>
              {!map && (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-2">Carregando mapa...</span>
                </div>
              )}
            </div>
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
                {route && (
                  <>
                    <p><span className="font-medium">Distância:</span> {route.distance.toFixed(2)} km</p>
                    <p><span className="font-medium">Tempo Estimado:</span> {Math.round(route.duration)} minutos</p>
                  </>
                )}
                <div className="mt-3 flex flex-col gap-2">
                  <button
                    onClick={openHereNavigation}
                    disabled={!selectedAgency}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Abrir no HERE WeGo
                  </button>
                  <button
                    onClick={openGoogleMapsNavigation}
                    disabled={!selectedAgency}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 flex items-center justify-center"
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

export default HereMapsAgencyFinder;
