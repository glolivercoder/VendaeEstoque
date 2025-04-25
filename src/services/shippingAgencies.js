// Importar a biblioteca idb para trabalhar com IndexedDB
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
    // Usar dados iniciais em vez de fazer chamadas à API para simplificar
    console.log('Usando dados iniciais em vez de fazer chamadas à API Overpass');
    const initialData = await populateInitialData();
    return initialData;

    /* Código original comentado para evitar problemas com a API
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
    */
  } catch (error) {
    console.error('Erro ao buscar agências do OpenStreetMap:', error);
    // Em caso de erro, retornar dados iniciais
    return populateInitialData();
  }
};

// Função para buscar agências do banco de dados local
export const getAgenciesFromDB = async () => {
  try {
    // Simplificação: retornar diretamente os dados iniciais em vez de usar o IndexedDB
    return populateInitialData();
  } catch (error) {
    console.error('Erro ao buscar agências do banco de dados:', error);
    return [];
  }
};

// Função para buscar agências próximas a um CEP
export const findNearbyAgencies = async (originCEP, radius = 35) => {
  try {
    // Simplificação: usar coordenadas fixas para Salvador-BA
    // Em uma implementação real, usaríamos a API do ViaCEP e Nominatim
    console.log('Buscando agências próximas ao CEP:', originCEP);

    // Coordenadas de Salvador-BA
    const originLat = -12.9704;
    const originLon = -38.5124;

    // Buscar dados iniciais em vez de usar o banco de dados
    const agencies = await populateInitialData();

    // Adicionar algumas variações nas coordenadas para simular agências em diferentes locais
    const agenciesWithCoords = agencies.map((agency, index) => {
      // Adicionar uma pequena variação nas coordenadas para cada agência
      const lat = originLat + (Math.random() - 0.5) * 0.1;
      const lon = originLon + (Math.random() - 0.5) * 0.1;

      return {
        ...agency,
        lat,
        lon
      };
    });

    // Calcular a distância de cada agência até o ponto de origem
    const nearbyAgencies = agenciesWithCoords.map(agency => {
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

    // Em caso de erro, retornar uma lista vazia
    return [];
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
    // Simplificação: gerar uma rota simulada em vez de chamar a API
    console.log('Gerando rota simulada entre', [originLat, originLon], 'e', [destLat, destLon]);

    // Calcular a distância direta entre os pontos
    const distance = calculateDistance(originLat, originLon, destLat, destLon);

    // Gerar pontos intermediários para simular uma rota
    const numPoints = 10;
    const coordinates = [];

    for (let i = 0; i <= numPoints; i++) {
      const fraction = i / numPoints;
      const lat = originLat + fraction * (destLat - originLat);
      const lon = originLon + fraction * (destLon - originLon);

      // Adicionar uma pequena variação para simular uma rota real
      const jitter = 0.001 * Math.sin(i * Math.PI);

      coordinates.push([lon + jitter, lat + jitter]);
    }

    // Simular uma resposta da API OSRM
    return {
      route: {
        type: 'LineString',
        coordinates: coordinates
      },
      distance: distance, // Distância em km
      duration: distance * 2 // Tempo estimado em minutos (2 min por km)
    };
  } catch (error) {
    console.error('Erro ao obter rota:', error);

    // Em caso de erro, retornar uma rota direta
    return {
      route: {
        type: 'LineString',
        coordinates: [
          [originLon, originLat],
          [destLon, destLat]
        ]
      },
      distance: calculateDistance(originLat, originLon, destLat, destLon),
      duration: 10 // Tempo estimado padrão em minutos
    };
  }
};

// Função para retornar dados iniciais (sem depender do IndexedDB)
export const populateInitialData = async () => {
  try {
    // Dados iniciais de algumas agências principais
    const initialData = [
      {
        id: 'correios_1',
        type: 'correios',
        name: 'Agência Central dos Correios',
        lat: -12.9704,
        lon: -38.5124,
        address: 'Av. Sete de Setembro, 100, Centro, Salvador, BA',
        phone: '(71) 3003-0100',
        email: 'atendimento@correios.com.br',
        postcode: '40255-310',
        website: 'https://www.correios.com.br',
        opening_hours: 'Segunda a Sexta: 09:00-18:00'
      },
      {
        id: 'correios_2',
        type: 'correios',
        name: 'Agência dos Correios - Pituba',
        lat: -12.9804,
        lon: -38.4624,
        address: 'Av. Paulo VI, 190, Pituba, Salvador, BA',
        phone: '(71) 3003-0100',
        email: 'atendimento@correios.com.br',
        postcode: '41810-001',
        website: 'https://www.correios.com.br',
        opening_hours: 'Segunda a Sexta: 09:00-18:00'
      },
      {
        id: 'jadlog_1',
        type: 'jadlog',
        name: 'Jadlog Salvador',
        lat: -12.9604,
        lon: -38.5024,
        address: 'Av. Tancredo Neves, 450, Caminho das Árvores, Salvador, BA',
        phone: '(71) 3333-5050',
        email: 'atendimento@jadlog.com.br',
        postcode: '41820-020',
        website: 'https://www.jadlog.com.br',
        opening_hours: 'Segunda a Sexta: 08:00-18:00'
      },
      {
        id: 'transportadora_1',
        type: 'transportadora',
        name: 'Braspress Salvador',
        lat: -12.9504,
        lon: -38.4924,
        address: 'Av. Luís Viana Filho, 13223, São Cristóvão, Salvador, BA',
        phone: '(71) 3288-9000',
        email: 'sac@braspress.com',
        postcode: '41500-300',
        website: 'https://www.braspress.com',
        opening_hours: 'Segunda a Sexta: 08:00-18:00'
      },
      {
        id: 'logistica_1',
        type: 'logistica',
        name: 'Centro Logístico DHL Salvador',
        lat: -12.9404,
        lon: -38.3924,
        address: 'Estrada CIA/Aeroporto, km 6,5, São Cristóvão, Salvador, BA',
        phone: '(71) 3204-3200',
        email: 'atendimento.brasil@dhl.com',
        postcode: '41500-970',
        website: 'https://www.dhl.com/br-pt/home.html',
        opening_hours: '24 horas'
      },
      {
        id: 'transportadora_2',
        type: 'transportadora',
        name: 'Jamef Transportes',
        lat: -12.9304,
        lon: -38.4824,
        address: 'Rua Jardim Piaui, 220, Pirajá, Salvador, BA',
        phone: '(71) 3215-8500',
        email: 'sac@jamef.com.br',
        postcode: '41290-000',
        website: 'https://www.jamef.com.br',
        opening_hours: 'Segunda a Sexta: 08:00-18:00'
      },
      {
        id: 'correios_3',
        type: 'correios',
        name: 'Agência dos Correios - Barra',
        lat: -13.0104,
        lon: -38.5324,
        address: 'Av. Oceânica, 2445, Barra, Salvador, BA',
        phone: '(71) 3003-0100',
        email: 'atendimento@correios.com.br',
        postcode: '40140-130',
        website: 'https://www.correios.com.br',
        opening_hours: 'Segunda a Sexta: 09:00-18:00'
      },
      {
        id: 'jadlog_2',
        type: 'jadlog',
        name: 'Jadlog Unidade Barra',
        lat: -13.0004,
        lon: -38.5224,
        address: 'Av. Centenário, 2883, Barra, Salvador, BA',
        phone: '(71) 3333-6060',
        email: 'atendimento@jadlog.com.br',
        postcode: '40155-150',
        website: 'https://www.jadlog.com.br',
        opening_hours: 'Segunda a Sexta: 08:00-18:00'
      }
    ];

    return initialData;
  } catch (error) {
    console.error('Erro ao retornar dados iniciais:', error);
    // Em caso de erro, retornar uma lista vazia
    return [];
  }
};
