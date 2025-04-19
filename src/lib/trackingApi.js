/**
 * API unificada para rastreamento de encomendas
 */
import { shippingConfig } from './shippingConfig';
import * as correiosApi from './carriers/correiosApi';
import * as melhorEnvioApi from './carriers/melhorEnvioApi';

// Função para identificar a transportadora pelo código de rastreamento
const identifyCarrier = (trackingCode) => {
  if (!trackingCode) {
    return null;
  }

  // Correios: começa com 2 letras, seguido de 9 números e BR no final
  if (/^[A-Z]{2}[0-9]{9}BR$/i.test(trackingCode)) {
    return 'correios';
  }

  // Melhor Envio: começa com ME, seguido de números e BR no final
  if (/^ME[0-9]+BR$/i.test(trackingCode)) {
    return 'melhor-envio';
  }

  // Jadlog: começa com JL, seguido de números
  if (/^JL[0-9]+$/i.test(trackingCode)) {
    return 'jadlog';
  }

  // Loggi: começa com LG, seguido de números
  if (/^LG[0-9]+$/i.test(trackingCode)) {
    return 'loggi';
  }

  // Azul Cargo: começa com AZ, seguido de números
  if (/^AZ[0-9]+$/i.test(trackingCode)) {
    return 'azul-cargo';
  }

  // Se não identificar, assumir Correios (mais comum)
  return 'correios';
};

// Função para rastrear encomenda
export const trackPackage = async (trackingCode) => {
  try {
    // Validar código de rastreamento
    if (!trackingCode) {
      throw new Error('Código de rastreamento não informado');
    }

    // Identificar a transportadora
    const carrier = identifyCarrier(trackingCode);

    // Rastrear de acordo com a transportadora
    switch (carrier) {
      case 'correios':
        return await correiosApi.trackPackage(trackingCode);
      case 'melhor-envio':
        return await melhorEnvioApi.trackPackage(trackingCode);
      case 'jadlog':
        // Implementar rastreamento Jadlog
        throw new Error('Rastreamento Jadlog não implementado');
      case 'loggi':
        // Implementar rastreamento Loggi
        throw new Error('Rastreamento Loggi não implementado');
      case 'azul-cargo':
        // Implementar rastreamento Azul Cargo
        throw new Error('Rastreamento Azul Cargo não implementado');
      default:
        throw new Error('Transportadora não identificada');
    }
  } catch (error) {
    console.error('Erro ao rastrear encomenda:', error);
    throw error;
  }
};

// Função para salvar histórico de rastreamento
export const saveTrackingHistory = (trackingInfo) => {
  try {
    // Carregar histórico existente
    const historyJson = localStorage.getItem('trackingHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Verificar se o código já existe no histórico
    const existingIndex = history.findIndex(item => item.code === trackingInfo.code);
    
    if (existingIndex >= 0) {
      // Atualizar item existente
      history[existingIndex] = {
        ...history[existingIndex],
        ...trackingInfo,
        lastUpdated: new Date().toISOString(),
      };
    } else {
      // Adicionar novo item
      history.push({
        ...trackingInfo,
        added: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      });
    }

    // Salvar histórico atualizado
    localStorage.setItem('trackingHistory', JSON.stringify(history));
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar histórico de rastreamento:', error);
    return false;
  }
};

// Função para carregar histórico de rastreamento
export const loadTrackingHistory = () => {
  try {
    const historyJson = localStorage.getItem('trackingHistory');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico de rastreamento:', error);
    return [];
  }
};

// Função para remover item do histórico de rastreamento
export const removeTrackingHistoryItem = (trackingCode) => {
  try {
    // Carregar histórico existente
    const historyJson = localStorage.getItem('trackingHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Filtrar o item a ser removido
    const updatedHistory = history.filter(item => item.code !== trackingCode);

    // Salvar histórico atualizado
    localStorage.setItem('trackingHistory', JSON.stringify(updatedHistory));
    
    return true;
  } catch (error) {
    console.error('Erro ao remover item do histórico de rastreamento:', error);
    return false;
  }
};

// Função para limpar todo o histórico de rastreamento
export const clearTrackingHistory = () => {
  try {
    localStorage.removeItem('trackingHistory');
    return true;
  } catch (error) {
    console.error('Erro ao limpar histórico de rastreamento:', error);
    return false;
  }
};
