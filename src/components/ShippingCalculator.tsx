import { useState, useEffect } from "react";
import { calculateShipping } from "../lib/shippingApi";
import ShippingOptionCard from "../components/ShippingOptionCard";
import ProductScanner from "../components/ProductScanner";
import { fetchProductBySku } from "../lib/productApi";
import { useToast } from "../components/ui/toast";

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
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
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

    // Mudar para a aba de resultados após o cálculo
    setActiveTab(1);
  };

  const handleSelectOption = (index: number) => {
    setSelectedOptionId(index);
  };

  const handleScanComplete = (code: string) => {
    setIsScanning(false);
    setSku(code);
    lookupProduct(code);
  };

  const handleScanError = (error: Error) => {
    setIsScanning(false);
    toast({
      title: "Erro ao escanear",
      description: error.message,
      variant: "destructive",
    });
  };

  const lookupProduct = async (code: string) => {
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
    setActiveTab(1); // Mudar para a aba de resultados
  };

  return (
    <div className="shipping-calculator">
      <div className="card">
        <div className="card-header">
          <h2 className="text-xl font-bold">Calculadora de Frete</h2>
          <p className="text-sm">Calcule o valor do frete para seus produtos</p>
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
                <PackageSearch className="icon" />
                <span>Resultados</span>
              </button>
              <button
                className={`tab-button ${activeTab === 2 ? 'active' : ''}`}
                onClick={() => setActiveTab(2)}
              >
                <Settings className="icon" />
                <span>Configurações</span>
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

              {/* Aba de Resultados */}
              {activeTab === 1 && (
                <div className="tab-pane">
                  <h3 className="section-title">Opções de Frete</h3>
                  <div className="shipping-options">
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
                          Preencha os dados do pacote e os CEPs de origem e destino para calcular as opções disponíveis.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Aba de Configurações */}
              {activeTab === 2 && (
                <div className="tab-pane">
                  <h3 className="section-title">Transportadoras</h3>
                  <div className="carriers-config">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="correios"
                        checked={selectedCarriers.correios}
                        onChange={(e) => setSelectedCarriers({...selectedCarriers, correios: e.target.checked})}
                        className="form-check-input"
                      />
                      <label htmlFor="correios" className="form-check-label">Correios</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="melhorEnvio"
                        checked={selectedCarriers.melhorEnvio}
                        onChange={(e) => setSelectedCarriers({...selectedCarriers, melhorEnvio: e.target.checked})}
                        className="form-check-input"
                      />
                      <label htmlFor="melhorEnvio" className="form-check-label">Melhor Envio</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="jadlog"
                        checked={selectedCarriers.jadlog}
                        onChange={(e) => setSelectedCarriers({...selectedCarriers, jadlog: e.target.checked})}
                        className="form-check-input"
                      />
                      <label htmlFor="jadlog" className="form-check-label">Jadlog</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="loggi"
                        checked={selectedCarriers.loggi}
                        onChange={(e) => setSelectedCarriers({...selectedCarriers, loggi: e.target.checked})}
                        className="form-check-input"
                      />
                      <label htmlFor="loggi" className="form-check-label">Loggi</label>
                    </div>
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="azulCargo"
                        checked={selectedCarriers.azulCargo}
                        onChange={(e) => setSelectedCarriers({...selectedCarriers, azulCargo: e.target.checked})}
                        className="form-check-input"
                      />
                      <label htmlFor="azulCargo" className="form-check-label">Azul Cargo</label>
                    </div>
                  </div>

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
    </div>
  );
};

export default ShippingCalculator;
