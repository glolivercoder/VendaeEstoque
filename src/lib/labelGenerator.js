/**
 * API para geração de etiquetas de envio
 */
import { shippingConfig } from './shippingConfig';
import * as correiosApi from './carriers/correiosApi';
import * as melhorEnvioApi from './carriers/melhorEnvioApi';

// Função para gerar etiqueta de envio
export const generateLabel = async (shipmentInfo) => {
  try {
    // Validar informações de envio
    if (!shipmentInfo || !shipmentInfo.carrier || !shipmentInfo.service) {
      throw new Error('Informações de envio incompletas');
    }

    // Gerar etiqueta de acordo com a transportadora
    switch (shipmentInfo.carrier) {
      case 'correios':
        return await correiosApi.generateLabel(shipmentInfo);
      case 'melhor-envio':
        return await melhorEnvioApi.generateLabel(shipmentInfo);
      case 'jadlog':
        // Implementar geração de etiqueta Jadlog
        throw new Error('Geração de etiqueta Jadlog não implementada');
      case 'loggi':
        // Implementar geração de etiqueta Loggi
        throw new Error('Geração de etiqueta Loggi não implementada');
      case 'azul-cargo':
        // Implementar geração de etiqueta Azul Cargo
        throw new Error('Geração de etiqueta Azul Cargo não implementada');
      default:
        throw new Error('Transportadora não suportada');
    }
  } catch (error) {
    console.error('Erro ao gerar etiqueta:', error);
    throw error;
  }
};

// Função para salvar histórico de etiquetas
export const saveLabelHistory = (labelInfo) => {
  try {
    // Carregar histórico existente
    const historyJson = localStorage.getItem('labelHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Adicionar nova etiqueta ao histórico
    history.push({
      ...labelInfo,
      generated: new Date().toISOString(),
    });

    // Salvar histórico atualizado
    localStorage.setItem('labelHistory', JSON.stringify(history));
    
    return true;
  } catch (error) {
    console.error('Erro ao salvar histórico de etiquetas:', error);
    return false;
  }
};

// Função para carregar histórico de etiquetas
export const loadLabelHistory = () => {
  try {
    const historyJson = localStorage.getItem('labelHistory');
    return historyJson ? JSON.parse(historyJson) : [];
  } catch (error) {
    console.error('Erro ao carregar histórico de etiquetas:', error);
    return [];
  }
};

// Função para remover item do histórico de etiquetas
export const removeLabelHistoryItem = (trackingCode) => {
  try {
    // Carregar histórico existente
    const historyJson = localStorage.getItem('labelHistory');
    const history = historyJson ? JSON.parse(historyJson) : [];

    // Filtrar o item a ser removido
    const updatedHistory = history.filter(item => item.trackingCode !== trackingCode);

    // Salvar histórico atualizado
    localStorage.setItem('labelHistory', JSON.stringify(updatedHistory));
    
    return true;
  } catch (error) {
    console.error('Erro ao remover item do histórico de etiquetas:', error);
    return false;
  }
};

// Função para limpar todo o histórico de etiquetas
export const clearLabelHistory = () => {
  try {
    localStorage.removeItem('labelHistory');
    return true;
  } catch (error) {
    console.error('Erro ao limpar histórico de etiquetas:', error);
    return false;
  }
};

// Função para imprimir etiqueta
export const printLabel = async (labelData) => {
  try {
    // Verificar se há dados da etiqueta
    if (!labelData) {
      throw new Error('Dados da etiqueta não informados');
    }

    // Em uma implementação real, seria feita a impressão da etiqueta
    // Aqui, apenas simulamos a impressão
    console.log('Imprimindo etiqueta...');
    
    // Simular tempo de impressão
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Se for uma URL, abrir em uma nova janela
    if (labelData.startsWith('http')) {
      window.open(labelData, '_blank');
    } else {
      // Se for dados base64, criar um objeto blob e abrir em uma nova janela
      const blob = new Blob([labelData], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }

    return true;
  } catch (error) {
    console.error('Erro ao imprimir etiqueta:', error);
    throw error;
  }
};
