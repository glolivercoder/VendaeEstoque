import { useState, useEffect } from 'react';
import { generateLabel, saveLabelHistory, loadLabelHistory, printLabel, removeLabelHistoryItem } from '../lib/labelGenerator';
import { carriers } from '../lib/shippingApi';
import { useToast } from '../components/ui/toast';

// Ícones
const PrinterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"></polyline>
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
    <rect x="6" y="14" width="12" height="8"></rect>
  </svg>
);

const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18"></path>
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
  </svg>
);

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const LabelGenerator = () => {
  const [shipmentInfo, setShipmentInfo] = useState({
    carrier: 'correios',
    service: 'PAC',
    sender: {
      name: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
    },
    recipient: {
      name: '',
      street: '',
      number: '',
      complement: '',
      district: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
    },
    package: {
      weight: '',
      length: '',
      width: '',
      height: '',
      description: '',
    },
  });
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [labelResult, setLabelResult] = useState(null);
  const [labelHistory, setLabelHistory] = useState([]);
  const { toast } = useToast();

  // Carregar histórico de etiquetas
  useEffect(() => {
    const history = loadLabelHistory();
    setLabelHistory(history);
  }, []);

  // Função para gerar etiqueta
  const handleGenerateLabel = async () => {
    // Validar informações de envio
    if (!shipmentInfo.carrier || !shipmentInfo.service) {
      toast({
        title: 'Informações incompletas',
        description: 'Por favor, selecione a transportadora e o serviço.',
        variant: 'destructive',
      });
      return;
    }

    if (!shipmentInfo.recipient.name || !shipmentInfo.recipient.zipCode) {
      toast({
        title: 'Informações do destinatário incompletas',
        description: 'Por favor, preencha pelo menos o nome e o CEP do destinatário.',
        variant: 'destructive',
      });
      return;
    }

    if (!shipmentInfo.package.weight || !shipmentInfo.package.length || !shipmentInfo.package.width || !shipmentInfo.package.height) {
      toast({
        title: 'Informações do pacote incompletas',
        description: 'Por favor, preencha as dimensões e o peso do pacote.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    setLabelResult(null);

    try {
      const result = await generateLabel(shipmentInfo);
      setLabelResult(result);
      
      // Salvar no histórico
      saveLabelHistory(result);
      
      // Atualizar histórico local
      setLabelHistory(loadLabelHistory());
      
      toast({
        title: 'Etiqueta gerada com sucesso',
        description: `Etiqueta para ${result.trackingCode} gerada com sucesso.`,
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Erro ao gerar etiqueta',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Função para imprimir etiqueta
  const handlePrintLabel = async (labelData) => {
    try {
      await printLabel(labelData);
      
      toast({
        title: 'Etiqueta enviada para impressão',
        description: 'A etiqueta foi enviada para impressão.',
        variant: 'success',
      });
    } catch (error) {
      toast({
        title: 'Erro ao imprimir etiqueta',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  // Função para remover item do histórico
  const handleRemoveFromHistory = (trackingCode) => {
    removeLabelHistoryItem(trackingCode);
    setLabelHistory(loadLabelHistory());
    
    toast({
      title: 'Item removido',
      description: `Etiqueta ${trackingCode} removida do histórico.`,
      variant: 'success',
    });
  };

  // Função para formatar data
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Função para atualizar informações de envio
  const handleInputChange = (section, field, value) => {
    setShipmentInfo(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  // Função para atualizar transportadora ou serviço
  const handleShipmentInfoChange = (field, value) => {
    setShipmentInfo(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="label-generator">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">Geração de Etiquetas</h2>
          <p className="text-sm">Gere etiquetas para suas encomendas</p>
        </div>

        <div className="card-body">
          <div className="form-section">
            <h3 className="section-title">Transportadora e Serviço</h3>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="carrier">Transportadora</label>
                <select
                  id="carrier"
                  value={shipmentInfo.carrier}
                  onChange={(e) => handleShipmentInfoChange('carrier', e.target.value)}
                  className="form-control"
                >
                  <option value="correios">Correios</option>
                  <option value="melhor-envio">Melhor Envio</option>
                  <option value="jadlog">Jadlog</option>
                  <option value="loggi">Loggi</option>
                  <option value="azul-cargo">Azul Cargo</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="service">Serviço</label>
                <select
                  id="service"
                  value={shipmentInfo.service}
                  onChange={(e) => handleShipmentInfoChange('service', e.target.value)}
                  className="form-control"
                >
                  {shipmentInfo.carrier === 'correios' && (
                    <>
                      <option value="PAC">PAC</option>
                      <option value="SEDEX">SEDEX</option>
                      <option value="SEDEX 10">SEDEX 10</option>
                      <option value="SEDEX 12">SEDEX 12</option>
                      <option value="SEDEX Hoje">SEDEX Hoje</option>
                    </>
                  )}
                  {shipmentInfo.carrier === 'melhor-envio' && (
                    <>
                      <option value="Econômico">Econômico</option>
                      <option value="Expresso">Expresso</option>
                    </>
                  )}
                  {shipmentInfo.carrier === 'jadlog' && (
                    <>
                      <option value="Package">Package</option>
                      <option value="Expresso">Expresso</option>
                    </>
                  )}
                  {shipmentInfo.carrier === 'loggi' && (
                    <>
                      <option value="Expresso">Expresso</option>
                    </>
                  )}
                  {shipmentInfo.carrier === 'azul-cargo' && (
                    <>
                      <option value="Standard">Standard</option>
                      <option value="Expresso">Expresso</option>
                    </>
                  )}
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Informações do Remetente</h3>
            <div className="form-row">
              <div className="form-group flex-grow">
                <label htmlFor="senderName">Nome</label>
                <input
                  type="text"
                  id="senderName"
                  placeholder="Nome do remetente"
                  value={shipmentInfo.sender.name}
                  onChange={(e) => handleInputChange('sender', 'name', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderZipCode">CEP</label>
                <input
                  type="text"
                  id="senderZipCode"
                  placeholder="00000-000"
                  value={shipmentInfo.sender.zipCode}
                  onChange={(e) => handleInputChange('sender', 'zipCode', e.target.value.replace(/\D/g, ''))}
                  maxLength={8}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group flex-grow">
                <label htmlFor="senderStreet">Endereço</label>
                <input
                  type="text"
                  id="senderStreet"
                  placeholder="Rua, Avenida, etc."
                  value={shipmentInfo.sender.street}
                  onChange={(e) => handleInputChange('sender', 'street', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderNumber">Número</label>
                <input
                  type="text"
                  id="senderNumber"
                  placeholder="Número"
                  value={shipmentInfo.sender.number}
                  onChange={(e) => handleInputChange('sender', 'number', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="senderComplement">Complemento</label>
                <input
                  type="text"
                  id="senderComplement"
                  placeholder="Complemento"
                  value={shipmentInfo.sender.complement}
                  onChange={(e) => handleInputChange('sender', 'complement', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderDistrict">Bairro</label>
                <input
                  type="text"
                  id="senderDistrict"
                  placeholder="Bairro"
                  value={shipmentInfo.sender.district}
                  onChange={(e) => handleInputChange('sender', 'district', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="senderCity">Cidade</label>
                <input
                  type="text"
                  id="senderCity"
                  placeholder="Cidade"
                  value={shipmentInfo.sender.city}
                  onChange={(e) => handleInputChange('sender', 'city', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderState">Estado</label>
                <input
                  type="text"
                  id="senderState"
                  placeholder="UF"
                  value={shipmentInfo.sender.state}
                  onChange={(e) => handleInputChange('sender', 'state', e.target.value)}
                  maxLength={2}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="senderPhone">Telefone</label>
                <input
                  type="text"
                  id="senderPhone"
                  placeholder="(00) 00000-0000"
                  value={shipmentInfo.sender.phone}
                  onChange={(e) => handleInputChange('sender', 'phone', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="senderEmail">E-mail</label>
                <input
                  type="email"
                  id="senderEmail"
                  placeholder="email@exemplo.com"
                  value={shipmentInfo.sender.email}
                  onChange={(e) => handleInputChange('sender', 'email', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Informações do Destinatário</h3>
            <div className="form-row">
              <div className="form-group flex-grow">
                <label htmlFor="recipientName">Nome *</label>
                <input
                  type="text"
                  id="recipientName"
                  placeholder="Nome do destinatário"
                  value={shipmentInfo.recipient.name}
                  onChange={(e) => handleInputChange('recipient', 'name', e.target.value)}
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientZipCode">CEP *</label>
                <input
                  type="text"
                  id="recipientZipCode"
                  placeholder="00000-000"
                  value={shipmentInfo.recipient.zipCode}
                  onChange={(e) => handleInputChange('recipient', 'zipCode', e.target.value.replace(/\D/g, ''))}
                  maxLength={8}
                  className="form-control"
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group flex-grow">
                <label htmlFor="recipientStreet">Endereço</label>
                <input
                  type="text"
                  id="recipientStreet"
                  placeholder="Rua, Avenida, etc."
                  value={shipmentInfo.recipient.street}
                  onChange={(e) => handleInputChange('recipient', 'street', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientNumber">Número</label>
                <input
                  type="text"
                  id="recipientNumber"
                  placeholder="Número"
                  value={shipmentInfo.recipient.number}
                  onChange={(e) => handleInputChange('recipient', 'number', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipientComplement">Complemento</label>
                <input
                  type="text"
                  id="recipientComplement"
                  placeholder="Complemento"
                  value={shipmentInfo.recipient.complement}
                  onChange={(e) => handleInputChange('recipient', 'complement', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientDistrict">Bairro</label>
                <input
                  type="text"
                  id="recipientDistrict"
                  placeholder="Bairro"
                  value={shipmentInfo.recipient.district}
                  onChange={(e) => handleInputChange('recipient', 'district', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipientCity">Cidade</label>
                <input
                  type="text"
                  id="recipientCity"
                  placeholder="Cidade"
                  value={shipmentInfo.recipient.city}
                  onChange={(e) => handleInputChange('recipient', 'city', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientState">Estado</label>
                <input
                  type="text"
                  id="recipientState"
                  placeholder="UF"
                  value={shipmentInfo.recipient.state}
                  onChange={(e) => handleInputChange('recipient', 'state', e.target.value)}
                  maxLength={2}
                  className="form-control"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="recipientPhone">Telefone</label>
                <input
                  type="text"
                  id="recipientPhone"
                  placeholder="(00) 00000-0000"
                  value={shipmentInfo.recipient.phone}
                  onChange={(e) => handleInputChange('recipient', 'phone', e.target.value)}
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="recipientEmail">E-mail</label>
                <input
                  type="email"
                  id="recipientEmail"
                  placeholder="email@exemplo.com"
                  value={shipmentInfo.recipient.email}
                  onChange={(e) => handleInputChange('recipient', 'email', e.target.value)}
                  className="form-control"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3 className="section-title">Informações do Pacote</h3>
            <div className="form-group">
              <label htmlFor="packageDescription">Descrição do Conteúdo</label>
              <input
                type="text"
                id="packageDescription"
                placeholder="Descrição do conteúdo do pacote"
                value={shipmentInfo.package.description}
                onChange={(e) => handleInputChange('package', 'description', e.target.value)}
                className="form-control"
              />
            </div>
            <div className="form-group">
              <label htmlFor="packageWeight">Peso (kg) *</label>
              <input
                type="number"
                id="packageWeight"
                placeholder="0.5"
                value={shipmentInfo.package.weight}
                onChange={(e) => handleInputChange('package', 'weight', e.target.value)}
                min="0.01"
                step="0.01"
                className="form-control"
                required
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="packageLength">Comprimento (cm) *</label>
                <input
                  type="number"
                  id="packageLength"
                  placeholder="20"
                  value={shipmentInfo.package.length}
                  onChange={(e) => handleInputChange('package', 'length', e.target.value)}
                  min="1"
                  step="1"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="packageWidth">Largura (cm) *</label>
                <input
                  type="number"
                  id="packageWidth"
                  placeholder="15"
                  value={shipmentInfo.package.width}
                  onChange={(e) => handleInputChange('package', 'width', e.target.value)}
                  min="1"
                  step="1"
                  className="form-control"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="packageHeight">Altura (cm) *</label>
                <input
                  type="number"
                  id="packageHeight"
                  placeholder="10"
                  value={shipmentInfo.package.height}
                  onChange={(e) => handleInputChange('package', 'height', e.target.value)}
                  min="1"
                  step="1"
                  className="form-control"
                  required
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn btn-primary btn-lg btn-block"
              onClick={handleGenerateLabel}
              disabled={isGenerating}
            >
              <TagIcon className="icon" />
              {isGenerating ? 'Gerando...' : 'Gerar Etiqueta'}
            </button>
          </div>

          {labelResult && (
            <div className="label-result">
              <div className="result-header">
                <h3 className="section-title">Etiqueta Gerada</h3>
                <div className="result-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handlePrintLabel(labelResult.labelData)}
                    title="Imprimir etiqueta"
                  >
                    <PrinterIcon />
                    Imprimir
                  </button>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => window.open(labelResult.labelUrl, '_blank')}
                    title="Baixar etiqueta"
                  >
                    <DownloadIcon />
                    Baixar
                  </button>
                </div>
              </div>
              <div className="result-details">
                <div className="result-info">
                  <p><strong>Código de Rastreamento:</strong> {labelResult.trackingCode}</p>
                  <p><strong>Transportadora:</strong> {labelResult.carrier}</p>
                  <p><strong>Serviço:</strong> {labelResult.service}</p>
                  <p><strong>Valor:</strong> {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(labelResult.price)}</p>
                </div>
                <div className="result-preview">
                  <img src={labelResult.labelUrl || 'https://via.placeholder.com/300x200?text=Etiqueta+Gerada'} alt="Prévia da etiqueta" />
                </div>
              </div>
            </div>
          )}

          <div className="label-history">
            <h3 className="section-title">Histórico de Etiquetas</h3>
            
            {labelHistory.length > 0 ? (
              <div className="history-list">
                {labelHistory.map((item, index) => (
                  <div key={index} className="history-item">
                    <div className="history-info">
                      <TagIcon className="history-icon" />
                      <div className="history-details">
                        <h4 className="history-code">{item.trackingCode}</h4>
                        <p className="history-carrier">{item.carrier} - {item.service}</p>
                        <p className="history-date">Gerada em: {formatDate(item.generated)}</p>
                      </div>
                    </div>
                    <div className="history-actions">
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handlePrintLabel(item.labelData)}
                        title="Imprimir etiqueta"
                      >
                        <PrinterIcon />
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => window.open(item.labelUrl, '_blank')}
                        title="Baixar etiqueta"
                      >
                        <DownloadIcon />
                      </button>
                      <button
                        className="btn btn-outline btn-sm"
                        onClick={() => handleRemoveFromHistory(item.trackingCode)}
                        title="Remover do histórico"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <TagIcon className="empty-icon" />
                <h3>Nenhuma etiqueta gerada</h3>
                <p>
                  Preencha as informações acima para gerar uma etiqueta de envio.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LabelGenerator;
