/**
 * Configurações para APIs de transportadoras
 */

// Configurações padrão para APIs de transportadoras
const defaultConfig = {
  // Configurações dos Correios
  correios: {
    enabled: true,
    username: '',
    password: '',
    postalCard: '',
    contract: '',
    services: {
      PAC: {
        code: '04510',
        enabled: true,
        name: 'PAC',
        description: 'Entrega econômica',
      },
      SEDEX: {
        code: '04014',
        enabled: true,
        name: 'SEDEX',
        description: 'Entrega expressa',
      },
      SEDEX_10: {
        code: '04790',
        enabled: false,
        name: 'SEDEX 10',
        description: 'Entrega até às 10h',
      },
      SEDEX_12: {
        code: '04782',
        enabled: false,
        name: 'SEDEX 12',
        description: 'Entrega até às 12h',
      },
      SEDEX_HOJE: {
        code: '04804',
        enabled: false,
        name: 'SEDEX Hoje',
        description: 'Entrega no mesmo dia',
      },
    },
    defaultOriginZipCode: '',
  },

  // Configurações do Melhor Envio
  melhorEnvio: {
    enabled: true,
    clientId: '',
    clientSecret: '',
    token: '',
    sandbox: true,
    services: {
      ECONOMICO: {
        enabled: true,
        name: 'Econômico',
        description: 'Entrega econômica',
      },
      EXPRESS: {
        enabled: true,
        name: 'Expresso',
        description: 'Entrega expressa',
      },
    },
    defaultOriginZipCode: '',
  },

  // Configurações da Jadlog
  jadlog: {
    enabled: true,
    token: '',
    cnpj: '',
    services: {
      PACKAGE: {
        enabled: true,
        name: 'Package',
        modalidade: '0',
        description: 'Entrega econômica',
      },
      EXPRESS: {
        enabled: true,
        name: 'Expresso',
        modalidade: '4',
        description: 'Entrega expressa',
      },
    },
    defaultOriginZipCode: '',
  },

  // Configurações da Loggi
  loggi: {
    enabled: true,
    email: '',
    apiKey: '',
    services: {
      EXPRESS: {
        enabled: true,
        name: 'Expresso',
        description: 'Entrega expressa',
      },
    },
    defaultOriginZipCode: '',
  },

  // Configurações da Azul Cargo
  azulCargo: {
    enabled: true,
    token: '',
    cnpj: '',
    services: {
      STANDARD: {
        enabled: true,
        name: 'Standard',
        description: 'Entrega padrão',
      },
      EXPRESS: {
        enabled: true,
        name: 'Expresso',
        description: 'Entrega expressa',
      },
    },
    defaultOriginZipCode: '',
  },

  // Configurações gerais
  general: {
    defaultOriginZipCode: '',
    defaultPackage: {
      weight: 1,
      length: 16,
      width: 11,
      height: 5,
    },
    packages: [
      {
        name: 'Envelope',
        weight: 0.3,
        length: 26,
        width: 36,
        height: 2,
      },
      {
        name: 'Caixa Pequena',
        weight: 1,
        length: 16,
        width: 11,
        height: 5,
      },
      {
        name: 'Caixa Média',
        weight: 3,
        length: 32,
        width: 22,
        height: 10,
      },
      {
        name: 'Caixa Grande',
        weight: 10,
        length: 50,
        width: 40,
        height: 20,
      },
    ],
  },
};

// Carregar configurações do localStorage
const loadConfig = () => {
  try {
    const savedConfig = localStorage.getItem('shippingConfig');
    if (savedConfig) {
      return { ...defaultConfig, ...JSON.parse(savedConfig) };
    }
  } catch (error) {
    console.error('Erro ao carregar configurações de frete:', error);
  }
  return defaultConfig;
};

// Salvar configurações no localStorage
const saveConfig = (config) => {
  try {
    localStorage.setItem('shippingConfig', JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Erro ao salvar configurações de frete:', error);
    return false;
  }
};

// Exportar configurações
export const shippingConfig = loadConfig();

// Exportar função para salvar configurações
export const updateShippingConfig = (newConfig) => {
  const updatedConfig = { ...shippingConfig, ...newConfig };
  if (saveConfig(updatedConfig)) {
    Object.assign(shippingConfig, updatedConfig);
    return true;
  }
  return false;
};

// Exportar função para resetar configurações
export const resetShippingConfig = () => {
  if (saveConfig(defaultConfig)) {
    Object.assign(shippingConfig, defaultConfig);
    return true;
  }
  return false;
};
