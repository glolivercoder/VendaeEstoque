/**
 * API para cálculo de frete
 */
import { shippingConfig } from './shippingConfig';
import * as correiosApi from './carriers/correiosApi';
import * as melhorEnvioApi from './carriers/melhorEnvioApi';

// Função para formatar valores monetários
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Tipos de transportadoras
export const carriers = {
  correios: {
    id: 'correios',
    name: 'Correios',
    color: '#003399'
  },
  melhorEnvio: {
    id: 'melhor-envio',
    name: 'Melhor Envio',
    color: '#00A650'
  },
  jadlog: {
    id: 'jadlog',
    name: 'Jadlog',
    color: '#FF0000'
  },
  loggi: {
    id: 'loggi',
    name: 'Loggi',
    color: '#FFCC00'
  },
  azulCargo: {
    id: 'azul-cargo',
    name: 'Azul Cargo',
    color: '#0033CC'
  }
};

// Função para calcular o frete
export const calculateShipping = async (packageInfo, addressInfo) => {
  try {
    // Validar informações do pacote
    if (!packageInfo || !packageInfo.weight || !packageInfo.length || !packageInfo.width || !packageInfo.height) {
      throw new Error('Informações do pacote incompletas');
    }

    // Validar informações de endereço
    if (!addressInfo || !addressInfo.zipCodeOrigin || !addressInfo.zipCodeDestination) {
      throw new Error('Informações de endereço incompletas');
    }

    // Array para armazenar todas as opções de frete
    let allOptions = [];

    // Calcular frete dos Correios
    if (shippingConfig.correios.enabled) {
      try {
        const correiosOptions = await correiosApi.calculateShipping(packageInfo, addressInfo);
        allOptions = [...allOptions, ...correiosOptions];
      } catch (error) {
        console.error('Erro ao calcular frete dos Correios:', error);
      }
    }

    // Calcular frete do Melhor Envio
    if (shippingConfig.melhorEnvio.enabled) {
      try {
        const melhorEnvioOptions = await melhorEnvioApi.calculateShipping(packageInfo, addressInfo);
        allOptions = [...allOptions, ...melhorEnvioOptions];
      } catch (error) {
        console.error('Erro ao calcular frete do Melhor Envio:', error);
      }
    }

    // Se não houver opções de transportadoras reais, usar simulação
    if (allOptions.length === 0) {
      console.log('Usando simulação de frete...');

      // Calcular o valor do frete com base no peso e dimensões
      const volume = packageInfo.length * packageInfo.width * packageInfo.height;
      const basePrice = packageInfo.weight * 5 + volume * 0.000001;

      // Gerar opções de frete simuladas
      allOptions = [
        // Correios
        {
          carrier: carriers.correios,
          service: 'PAC',
          price: basePrice * 1.0,
          deliveryTime: {
            min: 5,
            max: 8,
            unit: 'dias úteis'
          },
          features: ['Rastreamento'],
          discount: 0
        },
        {
          carrier: carriers.correios,
          service: 'SEDEX',
          price: basePrice * 1.8,
          deliveryTime: {
            min: 1,
            max: 3,
            unit: 'dias úteis'
          },
          features: ['Rastreamento', 'Entrega Rápida'],
          isExpedited: true,
          discount: basePrice * 0.1
        },

        // Melhor Envio
        {
          carrier: carriers.melhorEnvio,
          service: 'Econômico',
          price: basePrice * 1.1,
          deliveryTime: {
            min: 4,
            max: 7,
            unit: 'dias úteis'
          },
          features: ['Rastreamento', 'Seguro Incluso'],
          discount: 0
        },

        // Jadlog
        {
          carrier: carriers.jadlog,
          service: 'Package',
          price: basePrice * 1.3,
          deliveryTime: {
            min: 3,
            max: 5,
            unit: 'dias úteis'
          },
          features: ['Rastreamento', 'Seguro Incluso'],
          discount: 0
        },

        // Loggi
        {
          carrier: carriers.loggi,
          service: 'Expresso',
          price: basePrice * 2.0,
          deliveryTime: {
            min: 1,
            max: 2,
            unit: 'dias úteis'
          },
          features: ['Rastreamento', 'Entrega Rápida', 'Seguro Premium'],
          isExpedited: true,
          discount: 0
        },

        // Azul Cargo
        {
          carrier: carriers.azulCargo,
          service: 'Azul Cargo',
          price: basePrice * 2.5,
          deliveryTime: {
            min: 2,
            max: 3,
            unit: 'dias úteis'
          },
          features: ['Rastreamento', 'Entrega Aérea', 'Seguro Premium'],
          isExpedited: true,
          discount: basePrice * 0.2
        }
      ];
    }

    // Ordenar por preço
    allOptions.sort((a, b) => a.price - b.price);

    // Marcar a opção mais barata
    if (allOptions.length > 0) {
      allOptions[0].isCheapest = true;
    }

    // Encontrar e marcar a opção mais rápida
    if (allOptions.length > 0) {
      let fastestOption = allOptions[0];
      let fastestTime = fastestOption.deliveryTime.min;

      allOptions.forEach(option => {
        if (option.deliveryTime.min < fastestTime) {
          fastestTime = option.deliveryTime.min;
          fastestOption = option;
        }
      });

      fastestOption.isFastest = true;
    }

    return allOptions;
  } catch (error) {
    console.error('Erro ao calcular frete:', error);
    throw error;
  }
};

// Tipo de dados para opções de frete
export const ShippingOption = {
  carrier: {
    id: String,
    name: String,
    color: String
  },
  service: String,
  price: Number,
  deliveryTime: {
    min: Number,
    max: Number,
    unit: String
  },
  features: [String],
  isCheapest: Boolean,
  isFastest: Boolean,
  isExpedited: Boolean,
  discount: Number
};
