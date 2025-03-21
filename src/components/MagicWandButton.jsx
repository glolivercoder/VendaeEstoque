import { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import GeminiService from '../services/GeminiService';

const MagicWandButton = ({ onDataExtracted }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // Processar a imagem com o GeminiService
      const analysisResult = await GeminiService.processImage(file);
      
      console.log("Dados extraídos do documento:", analysisResult);
      
      // Salvar a análise no localStorage
      GeminiService.saveAnalysisToStorage(analysisResult);
      
      // Mapear os campos para o formato do formulário de cliente
      const clientData = GeminiService.mapFieldsToClientForm(analysisResult);
      
      console.log("Dados mapeados para o formulário:", clientData);
      
      // Chamar o callback com os dados extraídos
      if (onDataExtracted) {
        onDataExtracted(clientData);
      }
      
      // Mostrar feedback visual mais detalhado
      const preenchidos = Object.keys(clientData).length;
      const mensagem = `Dados extraídos com sucesso!\n\n${preenchidos} campos foram preenchidos automaticamente.`;
      
      // Listar os campos preenchidos
      const camposPreenchidos = Object.entries(clientData).map(([key, value]) => {
        const labels = {
          name: 'Nome',
          cpf: 'CPF',
          rg: 'RG',
          issueDate: 'Data de Expedição',
          birthDate: 'Data de Nascimento',
          birthPlace: 'Naturalidade',
          fatherName: 'Nome do Pai',
          motherName: 'Nome da Mãe'
        };
        return `${labels[key] || key}: ${value}`;
      }).join('\n');
      
      alert(`${mensagem}\n\nCampos preenchidos:\n${camposPreenchidos}`);
    } catch (err) {
      console.error('Erro ao processar imagem:', err);
      setError(err.message || 'Erro ao processar a imagem. Tente novamente.');
      alert(`Erro: ${err.message || 'Falha ao processar a imagem'}`);
    } finally {
      setIsLoading(false);
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      e.target.value = '';
    }
  };

  return (
    <div className="magic-wand-container">
      <button
        className="magic-wand-button"
        onClick={handleButtonClick}
        disabled={isLoading}
        title="Extrair dados de documento com OCR"
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#8a2be2',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          padding: '6px 12px',
          cursor: isLoading ? 'wait' : 'pointer',
          opacity: isLoading ? 0.7 : 1,
        }}
      >
        {/* Ícone de varinha mágica */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ marginRight: '5px' }}
        >
          <path d="M15 4V2" />
          <path d="M15 16v-2" />
          <path d="M8 9h2" />
          <path d="M20 9h2" />
          <path d="M17.8 11.8L19 13" />
          <path d="M15 9h0" />
          <path d="M17.8 6.2L19 5" />
          <path d="M3 21l9-9" />
          <path d="M12.2 6.2L11 5" />
        </svg>
        {isLoading ? 'Processando...' : 'OCR'}
      </button>
      
      {/* Input de arquivo oculto */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
        capture="environment"
      />
      
      {/* Mensagem de erro */}
      {error && (
        <div style={{ color: 'red', marginTop: '5px', fontSize: '12px' }}>
          {error}
        </div>
      )}
    </div>
  );
};

MagicWandButton.propTypes = {
  onDataExtracted: PropTypes.func
};

export default MagicWandButton; 