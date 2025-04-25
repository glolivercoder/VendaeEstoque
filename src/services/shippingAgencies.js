import { openDB } from 'idb';
import axios from 'axios';

// Inicializar o banco de dados
const initDB = async () => {
  return openDB('shippingAgenciesDB', 1, {
    upgrade(db) {
      // Criar store para agências de correios e transportadoras
      if (!db.objectStoreNames.contains('agencies')) {
        const store = db.createObjectStore('agencies', { keyPath: 'id' });
        store.createIndex('type', 'type');
        store.createIndex('name', 'name');
        store.createIndex('lat', 'lat');
        store.createIndex('lon', 'lon');
      }
    }
  });
};

// Função para buscar agências do OpenStreetMap usando a API Overpass
export const fetchAgenciesFromOSM = async () => {
  try {
    // Lista de transportadoras e agências de correios para buscar
    const agencies = [
      { type: 'correios', query: 'amenity=post_office' },
      { type: 'jadlog', query: '"name"="Jadlog"' },
      { type: 'transportadora', query: 'shop=courier' },
      { type: 'logistica', query: '"amenity"="logistics"' }
    ];

    const results = [];

    // Buscar cada tipo de agência
    for (const agency of agencies) {
      const overpassQuery = `
        [out:json];
        area["name"="Brasil"]->.searchArea;
        (
          node[${agency.query}](area.searchArea);
          way[${agency.query}](area.searchArea);
          relation[${agency.query}](area.searchArea);
        );
        out body;
        >;
        out skel qt;
      `;

      const response = await axios.post('https://overpass-api.de/api/interpreter', 
        overpassQuery, 
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      if (response.data && response.data.elements) {
        // Processar os resultados
        const agencyData = response.data.elements
          .filter(element => element.type === 'node' && element.tags)
          .map(element => ({
            id: `${agency.type}_${element.id}`,
            type: agency.type,
            name: element.tags.name || element.tags.brand || agency.type,
            lat: element.lat,
            lon: element.lon,
            address: element.tags['addr:full'] || 
                    (element.tags['addr:street'] ? 
                      `${element.tags['addr:street']}${element.tags['addr:housenumber'] ? ', ' + element.tags['addr:housenumber'] : ''}` : 
                      'Endereço não disponível'),
            phone: element.tags.phone || element.tags['contact:phone'] || 'Telefone não disponível',
            email: element.tags.email || element.tags['contact:email'] || 'Email não disponível',
            postcode: element.tags['addr:postcode'] || 'CEP não disponível',
            website: element.tags.website || element.tags['contact:website'] || '',
            opening_hours: element.tags.opening_hours || 'Horário não disponível'
          }));

        results.push(...agencyData);
      }
    }

    // Salvar os resultados no banco de dados
    const db = await initDB();
    const tx = db.transaction('agencies', 'readwrite');
    
    // Limpar dados antigos
    await tx.objectStore('agencies').clear();
    
    // Adicionar novos dados
    for (const agency of results) {
      await tx.objectStore('agencies').add(agency);
    }
    
    await tx.done;
    
    return results;
  } catch (error) {
    console.error('Erro ao buscar agências do OpenStreetMap:', error);
    throw error;
  }
};

// Função para buscar agências do banco de dados local
export const getAgenciesFromDB = async () => {
  try {
    const db = await initDB();
    return db.getAll('agencies');
  } catch (error) {
    console.error('Erro ao buscar agências do banco de dados:', error);
    throw error;
  }
};

// Função para buscar agências próximas a um CEP
export const findNearbyAgencies = async (originCEP, radius = 35) => {
  try {
    // Primeiro, converter o CEP para coordenadas
    const response = await axios.get(`https://viacep.com.br/ws/${originCEP}/json/`);
    
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
    
    // Buscar todas as agências do banco de dados
    const db = await initDB();
    const agencies = await db.getAll('agencies');
    
    // Calcular a distância de cada agência até o ponto de origem
    const nearbyAgencies = agencies.map(agency => {
      // Calcular distância usando a fórmula de Haversine
      const distance = calculateDistance(
        originLat, originLon,
        agency.lat, agency.lon
      );
      
      return {
        ...agency,
        distance: distance
      };
    })
    // Filtrar apenas as agências dentro do raio especificado (em km)
    .filter(agency => agency.distance <= radius)
    // Ordenar por distância (mais próxima primeiro)
    .sort((a, b) => a.distance - b.distance);
    
    return nearbyAgencies;
  } catch (error) {
    console.error('Erro ao buscar agências próximas:', error);
    throw error;
  }
};

// Função para calcular a distância entre dois pontos usando a fórmula de Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Raio da Terra em km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  const distance = R * c; // Distância em km
  return distance;
}

function deg2rad(deg) {
  return deg * (Math.PI/180);
}

// Função para obter a rota entre dois pontos
export const getRoute = async (originLat, originLon, destLat, destLon) => {
  try {
    const response = await axios.get('https://router.project-osrm.org/route/v1/driving/' +
      `${originLon},${originLat};${destLon},${destLat}?overview=full&geometries=geojson`);
    
    if (response.data && response.data.routes && response.data.routes.length > 0) {
      return {
        route: response.data.routes[0].geometry,
        distance: response.data.routes[0].distance / 1000, // Converter para km
        duration: response.data.routes[0].duration / 60 // Converter para minutos
      };
    }
    
    throw new Error('Não foi possível obter a rota');
  } catch (error) {
    console.error('Erro ao obter rota:', error);
    throw error;
  }
};

// Função para popular o banco de dados com dados iniciais (caso a API falhe)
export const populateInitialData = async () => {
  try {
    const db = await initDB();
    const count = await db.count('agencies');
    
    // Se já existirem dados, não fazer nada
    if (count > 0) return;
    
    // Dados iniciais de algumas agências principais
    const initialData = [
      {
        id: 'correios_1',
        type: 'correios',
        name: 'Agência Central dos Correios',
        lat: -23.5475,
        lon: -46.6361,
        address: 'Av. São João, 100, Centro, São Paulo, SP',
        phone: '(11) 3003-0100',
        email: 'atendimento@correios.com.br',
        postcode: '01035-000',
        website: 'https://www.correios.com.br',
        opening_hours: 'Segunda a Sexta: 09:00-18:00'
      },
      {
        id: 'jadlog_1',
        type: 'jadlog',
        name: 'Jadlog Matriz',
        lat: -23.5505,
        lon: -46.6333,
        address: 'Rua Doutor Freire, 65, Brás, São Paulo, SP',
        phone: '(11) 3138-5050',
        email: 'atendimento@jadlog.com.br',
        postcode: '03008-010',
        website: 'https://www.jadlog.com.br',
        opening_hours: 'Segunda a Sexta: 08:00-18:00'
      },
      {
        id: 'transportadora_1',
        type: 'transportadora',
        name: 'Braspress',
        lat: -23.5295,
        lon: -46.6517,
        address: 'Rua Coronel Marques, 388, Barra Funda, São Paulo, SP',
        phone: '(11) 2188-9000',
        email: 'sac@braspress.com',
        postcode: '01121-040',
        website: 'https://www.braspress.com',
        opening_hours: 'Segunda a Sexta: 08:00-18:00'
      },
      {
        id: 'logistica_1',
        type: 'logistica',
        name: 'Centro Logístico DHL',
        lat: -23.4305,
        lon: -46.4917,
        address: 'Rodovia Presidente Dutra, km 225, Guarulhos, SP',
        phone: '(11) 3618-3200',
        email: 'atendimento.brasil@dhl.com',
        postcode: '07034-000',
        website: 'https://www.dhl.com/br-pt/home.html',
        opening_hours: '24 horas'
      }
    ];
    
    const tx = db.transaction('agencies', 'readwrite');
    for (const agency of initialData) {
      await tx.objectStore('agencies').add(agency);
    }
    await tx.done;
    
    return initialData;
  } catch (error) {
    console.error('Erro ao popular dados iniciais:', error);
    throw error;
  }
};
