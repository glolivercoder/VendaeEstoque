import { useState, useEffect } from "react";
import { calculateShipping } from "../lib/shippingApi";
import ShippingOptionCard from "./ShippingOptionCard";
import ProductScanner from "./ProductScanner";
import { fetchProductBySku } from "../lib/productApi";
import { useToast } from "./ui/toast";
import TrackingPanel from "./TrackingPanel";
import ShippingLabelGenerator from "./ShippingLabelGenerator";
import CarrierConfigPanel from "./CarrierConfigPanel";
import { searchClients } from "../services/database";

// Ícones
const PackagePlus = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16v-2"></path>
    <path d="m3.3 7 8.7 5 8.7-5"></path>
    <path d="M12 22V12"></path>
    <path d="M19 15v6"></path>
    <path d="M16 18h6"></path>
  </svg>
);

const PackageSearch = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l2-1.14"></path>
    <path d="m3.3 7 8.7 5 8.7-5"></path>
    <path d="M12 22V12"></path>
    <circle cx="18.5" cy="15.5" r="2.5"></circle>
    <path d="M20.3 19.3 22 21"></path>
  </svg>
);

const Settings = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const Camera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);

const Truck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 17h4V5H2v12h3"></path>
    <path d="M20 17h2v-3.34a4 4 0 0 0-1.17-2.83L19 9h-5v8h1"></path>
    <circle cx="7.5" cy="17.5" r="2.5"></circle>
    <circle cx="17.5" cy="17.5" r="2.5"></circle>
  </svg>
);

const Tag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
    <line x1="7" y1="7" x2="7.01" y2="7"></line>
  </svg>
);

const Search = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const ShippingCalculator = () => {
  const [zipCodeOrigin, setZipCodeOrigin] = useState("");
  const [zipCodeDestination, setZipCodeDestination] = useState("");
  const [sku, setSku] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [weight, setWeight] = useState("");
  const [length, setLength] = useState("");
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [isCalculating, setIsCalculating] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isFetchingProduct, setIsFetchingProduct] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [shippingOptions, setShippingOptions] = useState([]);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [shippingHistory, setShippingHistory] = useState([]);
  const [selectedCarriers, setSelectedCarriers] = useState({
    correios: true,
    melhorEnvio: true,
    jadlog: true,
    loggi: true,
    azulCargo: true
  });

  // Estados para a busca de clientes
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);

  // Estados para o pop-up de resultados
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  // Carregar histórico de cálculos de frete do localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('shippingHistory');
    if (savedHistory) {
      try {
        setShippingHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erro ao carregar histórico de fretes:', error);
      }
    }
  }, []);

  const fetchShippingOptions = async () => {
    if (!zipCodeOrigin || !zipCodeDestination || !weight || !length || !width || !height) {
      return [];
    }

    const options = await calculateShipping(
      {
        weight: Number(weight),
        length: Number(length),
        width: Number(width),
        height: Number(height),
      },
      {
        zipCodeOrigin,
        zipCodeDestination,
      }
    );

    // Filtrar transportadoras desativadas
    const filteredOptions = options.filter(option => {
      const carrierId = option.carrier.id;
      if (carrierId === 'correios') return selectedCarriers.correios;
      if (carrierId === 'melhor-envio') return selectedCarriers.melhorEnvio;
      if (carrierId === 'jadlog') return selectedCarriers.jadlog;
      if (carrierId === 'loggi') return selectedCarriers.loggi;
      if (carrierId === 'azul-cargo') return selectedCarriers.azulCargo;
      return true;
    });

    setShippingOptions(filteredOptions);

    // Salvar no histórico
    if (filteredOptions.length > 0) {
      const historyEntry = {
        id: Date.now(),
        date: new Date().toISOString(),
        origin: zipCodeOrigin,
        destination: zipCodeDestination,
        package: {
          description: packageDescription,
          weight: Number(weight),
          dimensions: {
            length: Number(length),
            width: Number(width),
            height: Number(height)
          }
        },
        options: filteredOptions
      };

      const updatedHistory = [historyEntry, ...shippingHistory].slice(0, 10); // Manter apenas os 10 mais recentes
      setShippingHistory(updatedHistory);
      localStorage.setItem('shippingHistory', JSON.stringify(updatedHistory));
    }

    return filteredOptions;
  };

  const { toast } = useToast();

  const handleCalculateShipping = async () => {
    if (!zipCodeOrigin || !zipCodeDestination || !weight || !length || !width || !height) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios para calcular o frete.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    await fetchShippingOptions();
    setIsCalculating(false);

    // Mostrar o pop-up de resultados em vez de mudar para a aba de resultados
    setShowResultsPopup(true);
  };

  const handleSelectOption = (index) => {
    setSelectedOptionId(index);
  };

  const handleScanComplete = (code) => {
    setIsScanning(false);
    setSku(code);
    lookupProduct(code);
  };

  const handleScanError = (error) => {
    setIsScanning(false);
    toast({
      title: "Erro ao escanear",
      description: error.message,
      variant: "destructive",
    });
  };

  const lookupProduct = async (code) => {
    try {
      setIsFetchingProduct(true);
      const product = await fetchProductBySku(code);

      if (product) {
        setWeight(product.weight.toString());
        setLength(product.dimensions.length.toString());
        setWidth(product.dimensions.width.toString());
        setHeight(product.dimensions.height.toString());
        setPackageDescription(
          product.ncm
            ? `${product.name} (NCM: ${product.ncm})`
            : product.name
        );

        toast({
          title: "Produto encontrado",
          description: `Dimensões preenchidas automaticamente para ${product.name}`,
        });
      } else {
        toast({
          title: "Produto não encontrado",
          description: "Não foi possível encontrar informações para este código.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao buscar produto",
        description: "Não foi possível obter as dimensões do produto.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingProduct(false);
    }
  };

  const handleClearForm = () => {
    setSku("");
    setPackageDescription("");
    setWeight("");
    setLength("");
    setWidth("");
    setHeight("");
    setShippingOptions([]);
    setSelectedOptionId(null);
  };

  const handleLoadHistoryEntry = (entry) => {
    setZipCodeOrigin(entry.origin);
    setZipCodeDestination(entry.destination);
    setPackageDescription(entry.package.description);
    setWeight(entry.package.weight.toString());
    setLength(entry.package.dimensions.length.toString());
    setWidth(entry.package.dimensions.width.toString());
    setHeight(entry.package.dimensions.height.toString());
    setShippingOptions(entry.options);
    // Mostrar o pop-up de resultados em vez de mudar para a aba de resultados
    setShowResultsPopup(true);
  };

  // Função para buscar clientes
  const handleClientSearch = async (query) => {
    if (query.trim() === '') {
      setFilteredClients([]);
      return;
    }

    try {
      const searchResults = await searchClients(query);
      setFilteredClients(searchResults);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
      toast({
        title: "Erro na busca",
        description: "Não foi possível buscar os clientes.",
        variant: "destructive",
      });
    }
  };

  // Função para formatar CEP
  const formatCep = (value) => {
    return value
      .replace(/\D/g, '')
      .replace(/(\d{5})(\d)/, '$1-$2')
      .replace(/(-\d{3})\d+?$/, '$1');
  };

  // Função para buscar endereço pelo CEP
  const handleCepSearch = async (cepValue) => {
    try {
      const cep = cepValue.replace(/\D/g, '');
      if (cep.length !== 8) return;

      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        return {
          address: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || ''
        };
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast({
        title: "Erro ao buscar CEP",
        description: "Não foi possível obter o endereço para este CEP.",
        variant: "destructive",
      });
      return null;
    }
  };

  // Função para usar o CEP do cliente selecionado
  const useClientAddress = async () => {
    if (!selectedClient || !selectedClient.cep) {
      toast({
        title: "Endereço indisponível",
        description: "O cliente selecionado não possui CEP cadastrado.",
        variant: "destructive",
      });
      return;
    }

    setZipCodeOrigin(selectedClient.cep.replace(/\D/g, ''));

    // Se o cliente tiver endereço completo, podemos usar diretamente
    if (selectedClient.address) {
      toast({
        title: "Endereço utilizado",
        description: `Endereço de ${selectedClient.name} definido como origem.`,
      });
    } else {
      // Caso contrário, tentamos buscar pelo CEP
      const addressData = await handleCepSearch(selectedClient.cep);
      if (addressData) {
        toast({
          title: "Endereço encontrado",
          description: `Endereço de ${selectedClient.name} definido como origem.`,
        });
      }
    }
  };

  // Função para limpar o cliente selecionado
  const clearSelectedClient = () => {
    setSelectedClient(null);
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido da seleção.",
    });
  };

  return (
    <div className="shipping-calculator">
      <div className="card">
        <div className="card-header">
          <div className="header-content">
            <div className="header-title">
              <h2 className="text-xl font-bold">Calculadora de Frete</h2>
              <p className="text-sm">Calcule o valor do frete para seus produtos</p>
            </div>

            <div className="client-search-container">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar cliente por nome ou documento..."
                  value={clientSearchQuery}
                  onChange={(e) => {
                    setClientSearchQuery(e.target.value);
                    handleClientSearch(e.target.value);
                  }}
                  className="client-search-input"
                />
                <div className="search-icon">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>

                {/* Lista de resultados da busca */}
                {filteredClients.length > 0 && (
                  <div className="client-search-results">
                    {filteredClients.map((client) => (
                      <div
                        key={client.id}
                        className="client-search-item"
                        onClick={() => {
                          setSelectedClient(client);
                          setClientSearchQuery("");
                          setFilteredClients([]);
                          toast({
                            title: "Cliente selecionado",
                            description: `${client.name} foi selecionado com sucesso.`,
                          });
                        }}
                      >
                        <div className="client-info">
                          <div className="client-name">{client.name}</div>
                          <div className="client-document">{client.document || client.cpf}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cliente selecionado */}
              {selectedClient && (
                <div className="selected-client">
                  <span className="client-label">Cliente:</span>
                  <span className="client-value">{selectedClient.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="card-body">
          {/* Abas de navegação */}
          <div className="shipping-tabs">
            <div className="tab-header">
              <button
                className={`tab-button ${activeTab === 0 ? 'active' : ''}`}
                onClick={() => setActiveTab(0)}
              >
                <PackagePlus className="icon" />
                <span>Calcular</span>
              </button>
              <button
                className={`tab-button ${activeTab === 1 ? 'active' : ''}`}
                onClick={() => setActiveTab(1)}
              >
                <Settings className="icon" />
                <span>Configurações</span>
              </button>
              <button
                className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
                onClick={() => setActiveTab(2)}
              >
                <Search className="icon" />
                <span>Rastreamento</span>
              </button>
              <button
                className={`tab-button ${activeTab === 3 ? 'active' : ''}`}
                onClick={() => setActiveTab(3)}
              >
                <Tag className="icon" />
                <span>Etiquetas</span>
              </button>
            </div>

            <div className="tab-content">
              {/* Aba de Cálculo */}
              {activeTab === 0 && (
                <div className="tab-pane">
                  <div className="form-section">
                    <h3 className="section-title">Endereços</h3>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="zipCodeOrigin">CEP de Origem</label>
                        <input
                          type="text"
                          id="zipCodeOrigin"
                          placeholder="00000-000"
                          value={zipCodeOrigin}
                          onChange={(e) => setZipCodeOrigin(e.target.value.replace(/\D/g, ""))}
                          maxLength={8}
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="zipCodeDestination">CEP de Destino</label>
                        <input
                          type="text"
                          id="zipCodeDestination"
                          placeholder="00000-000"
                          value={zipCodeDestination}
                          onChange={(e) => setZipCodeDestination(e.target.value.replace(/\D/g, ""))}
                          maxLength={8}
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">Produto</h3>
                    <div className="form-row">
                      <div className="form-group flex-grow">
                        <label htmlFor="sku">Código SKU / NCM / GTIN</label>
                        <div className="input-group">
                          <input
                            type="text"
                            id="sku"
                            placeholder="Digite o código SKU, NCM ou escaneie o código de barras"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="form-control"
                          />
                          <button
                            className="btn btn-outline"
                            onClick={() => setIsScanning(true)}
                            title="Escanear código"
                          >
                            <Camera />
                          </button>
                        </div>
                      </div>
                      <div className="form-group">
                        <label>&nbsp;</label>
                        <button
                          className="btn btn-secondary"
                          onClick={() => lookupProduct(sku)}
                          disabled={!sku || isFetchingProduct}
                        >
                          {isFetchingProduct ? "Buscando..." : "Buscar"}
                        </button>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="packageDescription">Descrição da Encomenda</label>
                      <input
                        type="text"
                        id="packageDescription"
                        placeholder="Descrição do produto (preenchido automaticamente pelo código)"
                        value={packageDescription}
                        onChange={(e) => setPackageDescription(e.target.value)}
                        className="form-control"
                      />
                    </div>
                  </div>

                  <div className="form-section">
                    <h3 className="section-title">Dimensões e Peso</h3>
                    <div className="form-group">
                      <label htmlFor="weight">Peso (kg)</label>
                      <input
                        type="number"
                        id="weight"
                        placeholder="0.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        min="0.01"
                        step="0.01"
                        className="form-control"
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="length">Comprimento (cm)</label>
                        <input
                          type="number"
                          id="length"
                          placeholder="20"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          min="1"
                          step="1"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="width">Largura (cm)</label>
                        <input
                          type="number"
                          id="width"
                          placeholder="15"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          min="1"
                          step="1"
                          className="form-control"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="height">Altura (cm)</label>
                        <input
                          type="number"
                          id="height"
                          placeholder="10"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          min="1"
                          step="1"
                          className="form-control"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      className="btn btn-primary btn-lg btn-block"
                      onClick={handleCalculateShipping}
                      disabled={isCalculating}
                    >
                      <PackageSearch className="icon" />
                      {isCalculating ? "Calculando..." : "Calcular Frete"}
                    </button>
                    <button
                      className="btn btn-secondary"
                      onClick={handleClearForm}
                    >
                      Limpar
                    </button>
                  </div>
                </div>
              )}



              {/* Aba de Configurações */}
              {activeTab === 1 && (
                <div className="tab-pane">
                  <CarrierConfigPanel />

                  <h3 className="section-title mt-4">Histórico de Cálculos</h3>
                  <div className="history-list">
                    {shippingHistory.length > 0 ? (
                      <div className="table-container">
                        <table className="table">
                          <thead>
                            <tr>
                              <th>Data</th>
                              <th>Origem</th>
                              <th>Destino</th>
                              <th>Produto</th>
                              <th>Ações</th>
                            </tr>
                          </thead>
                          <tbody>
                            {shippingHistory.map((entry) => (
                              <tr key={entry.id}>
                                <td>{new Date(entry.date).toLocaleDateString()}</td>
                                <td>{entry.origin}</td>
                                <td>{entry.destination}</td>
                                <td>{entry.package.description || 'Sem descrição'}</td>
                                <td>
                                  <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => handleLoadHistoryEntry(entry)}
                                  >
                                    Carregar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="empty-state">
                        <p>Nenhum cálculo de frete realizado ainda.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aba de Rastreamento */}
              {activeTab === 2 && (
                <div className="tab-pane">
                  <TrackingPanel />
                </div>
              )}

              {/* Aba de Etiquetas */}
              {activeTab === 3 && (
                <div className="tab-pane">
                  <ShippingLabelGenerator />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {isScanning && (
        <ProductScanner
          onScanComplete={handleScanComplete}
          onScanError={handleScanError}
          onClose={() => setIsScanning(false)}
        />
      )}

      {/* Pop-up de Resultados */}
      {showResultsPopup && (
        <div className="results-popup-overlay">
          <div className="results-popup">
            <div className="results-popup-header">
              <h3>Resultados do Cálculo de Frete</h3>
              <button
                className="close-button"
                onClick={() => setShowResultsPopup(false)}
              >
                &times;
              </button>
            </div>

            <div className="results-popup-content">
              {shippingOptions && shippingOptions.length > 0 ? (
                <div className="shipping-options-list">
                  {shippingOptions.map((option, index) => (
                    <ShippingOptionCard
                      key={index}
                      option={option}
                      isSelected={selectedOptionId === index}
                      onSelect={() => handleSelectOption(index)}
                    />
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <PackageSearch className="empty-icon" />
                  <h3>Nenhuma opção de frete</h3>
                  <p>
                    Não foram encontradas opções de frete para os dados informados.
                  </p>
                </div>
              )}
            </div>

            <div className="results-popup-footer">
              <div className="shipping-info">
                <p><strong>Origem:</strong> {zipCodeOrigin}</p>
                <p><strong>Destino:</strong> {zipCodeDestination}</p>
                <p><strong>Produto:</strong> {packageDescription || 'Não especificado'}</p>
              </div>

              <div className="export-buttons">
                {selectedClient && (
                  <div className="selected-client-info">
                    <p>Cliente: {selectedClient.name}</p>
                  </div>
                )}

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    toast({
                      title: "PDF Exportado",
                      description: selectedClient
                        ? `Cotação enviada para ${selectedClient.name} por e-mail.`
                        : "Cotação exportada como PDF.",
                    });
                  }}
                >
                  Exportar PDF
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    toast({
                      title: "Imagem Exportada",
                      description: selectedClient
                        ? `Cotação enviada para ${selectedClient.name} por WhatsApp.`
                        : "Cotação exportada como imagem.",
                    });
                  }}
                >
                  Exportar Imagem
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShippingCalculator;
