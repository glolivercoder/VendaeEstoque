import { useState, useEffect, useRef } from "react";
import { calculateShipping } from "../lib/shippingApi";
import ShippingOptionCard from "./ShippingOptionCard";
import ProductScanner from "./ProductScanner";
import { fetchProductBySku } from "../lib/productApi";
import { useToast } from "./ui/toast";
import TrackingPanel from "./TrackingPanel";
import ShippingLabelGenerator from "./ShippingLabelGenerator";
import CarrierConfigPanel from "./CarrierConfigPanel";
import MagicWandScanButton from "./MagicWandScanButton";
import { searchClients, getLastClientSale, getSaleItems, getProducts } from "../services/database";
import "../styles/ShippingCalculator.css";
import "../styles/icon-button.css";

// Ícone de carregamento
const Loader2 = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);

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

const Camera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
    <circle cx="12" cy="13" r="3"></circle>
  </svg>
);

const ShippingCalculator = ({ preselectedClient, preselectedProduct }) => {
  const [zipCodeOrigin, setZipCodeOrigin] = useState("");
  const [zipCodeDestination, setZipCodeDestination] = useState("");
  const [sku, setSku] = useState("");
  const [productName, setProductName] = useState("");
  const [packageDescription, setPackageDescription] = useState("");
  const [technicalSpecs, setTechnicalSpecs] = useState("");
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
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [lastClientSaleData, setLastClientSaleData] = useState(null);
  const [lastClientSaleItems, setLastClientSaleItems] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [showResultsPopup, setShowResultsPopup] = useState(false);
  const [isExportingToPDV, setIsExportingToPDV] = useState(false);
  const [receivedShippingData, setReceivedShippingData] = useState(null);

  const { toast } = useToast();

  // Função para selecionar uma opção de frete
  const handleSelectOption = (optionId) => {
    setSelectedOptionId(optionId);
  };

  // Função para buscar produto por SKU/NCM/GTIN
  const lookupProduct = async (code) => {
    if (!code) return;
    try {
      setIsFetchingProduct(true);
      // Primeiro, tentar buscar o produto pelo SKU
      let product = await fetchProductBySku(code);
      // Se não encontrar, tente buscar por GTIN/NCM
      if (!product && window.fetchProductDetails) {
        product = await window.fetchProductDetails(code);
      }
      if (product) {
        fillProductData(product);
        toast({ title: "Produto encontrado", description: product.name || product.description || code });
      } else {
        toast({ title: "Produto não encontrado", description: `Nenhum produto encontrado para o código ${code}.`, variant: "destructive" });
      }
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast({ title: "Erro", description: "Ocorreu um erro ao buscar o produto. Tente novamente.", variant: "destructive" });
    } finally {
      setIsFetchingProduct(false);
    }
  };

  // Efeito para processar os dados recebidos
  useEffect(() => {
    if (receivedShippingData) {
      console.log("Processando dados recebidos na calculadora de frete:", receivedShippingData);

      // Processar dados do cliente
      if (receivedShippingData.client) {
        const client = receivedShippingData.client;
        setSelectedClient(client);

        // Preencher o CEP de destino com o CEP do cliente
        if (client.cep) {
          const cleanCep = client.cep.replace(/\D/g, '');
          setZipCodeDestination(cleanCep);
          console.log(`CEP do cliente definido como destino: ${client.cep} (limpo: ${cleanCep})`);

          // Forçar atualização do campo de CEP de destino no DOM
          setTimeout(() => {
            // Usar o ID específico para garantir que encontramos o campo correto
            const destInput = document.getElementById('zipCodeDestination');
            if (destInput) {
              destInput.value = cleanCep;
              // Disparar evento de mudança para atualizar o estado
              const event = new Event('input', { bubbles: true });
              destInput.dispatchEvent(event);
              console.log(`Campo de CEP de destino atualizado com: ${cleanCep}`);
            } else {
              // Tentar pelo placeholder como fallback
              const destInputs = document.querySelectorAll('input[placeholder="00000-000"]');
              if (destInputs && destInputs.length > 1) { // O segundo input é o de destino
                const destInput = destInputs[1];
                destInput.value = cleanCep;
                // Disparar evento de mudança para atualizar o estado
                const event = new Event('input', { bubbles: true });
                destInput.dispatchEvent(event);
                console.log(`Campo de CEP de destino atualizado com: ${cleanCep}`);
              } else {
                console.error('Campo de CEP de destino não encontrado no DOM');
              }
            }
          }, 800); // Aumentar o tempo para garantir que o DOM esteja pronto
        } else {
          console.warn("Cliente não possui CEP definido:", client);
          // Lógica para buscar CEP do cliente no localStorage (truncado para economizar espaço)
        }
      }

      // Processar dados do produto
      if (receivedShippingData.product) {
        const product = receivedShippingData.product;
        console.log("Processando dados do produto:", product);

        // Preencher os campos do produto
        setProductName(product.description || product.name || "");
        setPackageDescription(product.description || "");

        if (product.technicalSpecs) {
          setTechnicalSpecs(product.technicalSpecs);
        }

        // Preencher dimensões e peso
        if (product.dimensions) {
          if (product.dimensions.length) {
            setLength(product.dimensions.length.toString());
            console.log(`Comprimento definido como: ${product.dimensions.length}`);
          }
          if (product.dimensions.width) {
            setWidth(product.dimensions.width.toString());
            console.log(`Largura definida como: ${product.dimensions.width}`);
          }
          if (product.dimensions.height) {
            setHeight(product.dimensions.height.toString());
            console.log(`Altura definida como: ${product.dimensions.height}`);
          }
        }

        if (product.weight) {
          setWeight(product.weight.toString());
          console.log(`Peso definido como: ${product.weight}`);
        }
      }
    }
  }, [receivedShippingData]);

  // Expor funções para outros componentes
  useEffect(() => {
    // Expor a função para definir os dados da calculadora de frete
    window.setShippingCalculatorData = (data) => {
      console.log("Dados recebidos para a calculadora de frete:", data);
      setReceivedShippingData(data);
    };

    // Limpar ao desmontar
    return () => {
      window.setShippingCalculatorData = undefined;
    };
  }, []);

  // Efeito para inicializar o CEP de origem com o CEP do vendedor selecionado
  useEffect(() => {
    const vendorInfo = localStorage.getItem('selectedVendor');
    if (vendorInfo) {
      try {
        const vendor = JSON.parse(vendorInfo);
        if (vendor.cep) {
          setZipCodeOrigin(vendor.cep.replace(/\D/g, ''));
        }
      } catch (error) {
        console.error('Erro ao carregar vendedor selecionado:', error);
      }
    } else {
      // CEP padrão para Salvador-BA
      setZipCodeOrigin('40255310');
    }
  }, []);

  // Função para abrir o buscador de agências de transportadoras
  const openAgencyFinder = () => {
    toast({
      title: "Funcionalidade temporariamente desativada",
      description: "A busca de transportadoras próximas está temporariamente desativada.",
    });
  };

  // Função auxiliar para preencher os dados do produto
  const fillProductData = (product) => {
    console.log('Preenchendo dados do produto:', product);
    setSku(product.sku || "");
    setProductName(product.name || product.description || "");
    setPackageDescription(product.description || "");
    setTechnicalSpecs(product.technicalSpecs || "");

    if (product.weight) {
      setWeight(product.weight.toString());
    }

    if (product.dimensions) {
      if (product.dimensions.length) setLength(product.dimensions.length.toString());
      if (product.dimensions.width) setWidth(product.dimensions.width.toString());
      if (product.dimensions.height) setHeight(product.dimensions.height.toString());
    }
  };

  // Função para buscar produtos disponíveis
  const fetchAvailableProducts = async () => {
    try {
      const products = await getProducts();
      setAvailableProducts(products);
    } catch (error) {
      console.error('Erro ao buscar produtos disponíveis:', error);
    }
  };

  // Função para buscar clientes
  const handleSearchClients = async (query) => {
    if (query.length < 2) {
      setFilteredClients([]);
      return;
    }

    try {
      const clients = await searchClients(query);
      setFilteredClients(clients);
    } catch (error) {
      console.error('Erro ao buscar clientes:', error);
    }
  };

  // Função para selecionar um cliente
  const handleSelectClient = (client) => {
    setSelectedClient(client);
    setClientSearchQuery("");
    setFilteredClients([]);
    if (client.cep) {
      setZipCodeDestination(client.cep.replace(/\D/g, ''));
    }
    if (client.id) {
      fetchLastClientSale(client.id);
    }
    localStorage.setItem('selectedClient', JSON.stringify(client));
  };

  // Função para calcular o frete
  const handleCalculateShipping = () => {
    if (!zipCodeOrigin || !zipCodeDestination || !weight || !length || !width || !height) {
      toast({
        title: "Campos obrigatórios",
        description: "Todos os campos são obrigatórios para calcular o frete.",
        variant: "destructive",
      });
      return;
    }

    setIsCalculating(true);
    setTimeout(() => {
      const options = [
        {
          id: 1,
          name: "Correios PAC",
          price: 25.90,
          deliveryTime: "3 a 7 dias úteis",
          carrier: { id: "correios", name: "Correios", logo: "correios.png" }
        },
        {
          id: 2,
          name: "Correios SEDEX",
          price: 45.50,
          deliveryTime: "1 a 3 dias úteis",
          carrier: { id: "correios", name: "Correios", logo: "correios.png" }
        },
        {
          id: 3,
          name: "Jadlog Package",
          price: 32.80,
          deliveryTime: "2 a 5 dias úteis",
          carrier: { id: "jadlog", name: "Jadlog", logo: "jadlog.png" }
        }
      ];

      setShippingOptions(options);
      setIsCalculating(false);
      setShowResultsPopup(true);
    }, 2000);
  };

  // Função para lidar com o escaneamento de código de barras
  const handleScanComplete = (barcode) => {
    setSku(barcode);
    setIsScanning(false);
    fetchProductBySku(barcode)
      .then(product => {
        if (product) {
          fillProductData(product);
        } else {
          toast({
            title: "Produto não encontrado",
            description: `Nenhum produto encontrado com o código ${barcode}.`,
            variant: "destructive",
          });
        }
      })
      .catch(error => {
        console.error('Erro ao buscar produto:', error);
        toast({
          title: "Erro",
          description: "Ocorreu um erro ao buscar o produto. Tente novamente.",
          variant: "destructive",
        });
      });
  };

  // Função para lidar com erros de escaneamento
  const handleScanError = (error) => {
    console.error('Erro ao escanear código de barras:', error);
    setIsScanning(false);
    toast({
      title: "Erro",
      description: "Ocorreu um erro ao escanear o código de barras. Tente novamente.",
      variant: "destructive",
    });
  };

  // Função para buscar a última compra do cliente
  const fetchLastClientSale = async (clientId) => {
    try {
      const lastSale = await getLastClientSale(clientId);
      if (lastSale) {
        setLastClientSaleData(lastSale);
        const items = await getSaleItems(lastSale.id);
        setLastClientSaleItems(items);
      }
    } catch (error) {
      console.error('Erro ao buscar última compra do cliente:', error);
    }
  };
// Função para exportar para o PDV
  const handleExportToPDV = async () => {
    // Verificar se há um produto preenchido
    if (!productName && !sku) {
      toast({
        title: "Erro",
        description: "Preencha os dados do produto antes de exportar para o PDV Vendas.",
        variant: "destructive",
      });
      return;
    }

    // Verificar se há dimensões e peso preenchidos
    if (!weight || !length || !width || !height) {
      toast({
        title: "Erro",
        description: "Preencha as dimensões e peso do produto antes de exportar.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingToPDV(true);

    try {
      // Dados do produto para exportar
      const productData = {
        sku,
        name: productName,
        description: packageDescription,
        technicalSpecs,
        dimensions: {
          length: parseFloat(length),
          width: parseFloat(width),
          height: parseFloat(height)
        },
        weight: parseFloat(weight),
        shippingOptions: selectedOptionId ? shippingOptions.find(option => option.id === selectedOptionId) : null
      };

      // Verificar se há uma função global para exportar para o PDV
      if (window.exportProductToPDV) {
        await window.exportProductToPDV(productData);
        toast({
          title: "Sucesso",
          description: "Produto exportado para o PDV Vendas com sucesso!",
        });
      } else {
        // Simular exportação como fallback
        console.log("Exportando produto para o PDV:", productData);
        
        // Armazenar no localStorage como fallback
        const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
        savedProducts.push(productData);
        localStorage.setItem('products', JSON.stringify(savedProducts));
        
        toast({
          title: "Sucesso",
          description: "Produto exportado para o banco de dados local com sucesso!",
        });
      }
    } catch (error) {
      console.error('Erro ao exportar produto para o PDV:', error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao exportar o produto para o PDV Vendas.",
        variant: "destructive",
      });
    } finally {
      setIsExportingToPDV(false);
    }
  };

  // Renderização do componente
  return (
    <div className="shipping-calculator">
      {/* Scanner de produto */}
      {isScanning && (
        <ProductScanner
          onScanComplete={handleScanComplete}
          onScanError={handleScanError}
          onClose={() => setIsScanning(false)}
        />
      )}
      
      {/* Tabs de navegação */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 0 ? "active" : ""}`}
          onClick={() => setActiveTab(0)}
        >
          Calcular Frete
        </button>
        <button
          className={`tab ${activeTab === 1 ? "active" : ""}`}
          onClick={() => setActiveTab(1)}
        >
          Rastreamento
        </button>
        <button
          className={`tab ${activeTab === 2 ? "active" : ""}`}
          onClick={() => setActiveTab(2)}
        >
          Etiquetas
        </button>
        <button
          className={`tab ${activeTab === 3 ? "active" : ""}`}
          onClick={() => setActiveTab(3)}
        >
          Configurações
        </button>
      </div>

      {/* Conteúdo das tabs */}
      <div className="tab-content">
        {activeTab === 0 && (
          <div className="calculator-tab">
            <div className="form-section">
              <h3>Origem e Destino</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>CEP de Origem</label>
                  <input
                    type="text"
                    placeholder="00000-000"
                    value={zipCodeOrigin}
                    onChange={(e) => setZipCodeOrigin(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div className="form-group">
                  <label>CEP de Destino</label>
                  <input
                    id="zipCodeDestination"
                    type="text"
                    placeholder="00000-000"
                    value={zipCodeDestination}
                    onChange={(e) => setZipCodeDestination(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Produto</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Código SKU/NCM/GTIN</label>
                  <div className="input-with-button">
                    <input
                      type="text"
                      placeholder="Digite o código SKU, NCM ou escaneie o código de barras"
                      value={sku}
                      onChange={(e) => setSku(e.target.value)}
                    />
                    <button
                      className="icon-button"
                      onClick={() => setIsScanning(true)}
                      disabled={isScanning}
                      title="Escanear código"
                    >
                      <Camera />
                    </button>
                    <MagicWandScanButton onProductDataDetected={fillProductData} />
                    <button
                      className="btn btn-secondary"
                      style={{ marginLeft: 8 }}
                      onClick={() => lookupProduct(sku)}
                      disabled={!sku || isFetchingProduct}
                    >
                      {isFetchingProduct ? "Buscando..." : "BUSCAR"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Nome do Produto</label>
                  <input
                    type="text"
                    placeholder="Nome completo do produto"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Descrição do Pacote</label>
                  <textarea
                    placeholder="Descrição do produto (preenchido automaticamente pelo código)"
                    value={packageDescription}
                    onChange={(e) => setPackageDescription(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Especificações Técnicas</label>
                  <textarea
                    placeholder="Especificações técnicas do produto"
                    value={technicalSpecs}
                    onChange={(e) => setTechnicalSpecs(e.target.value)}
                  ></textarea>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3>Dimensões e Peso</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Peso (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Comprimento (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="20"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Largura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="15"
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label>Altura (cm)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    placeholder="10"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button
                className="btn btn-primary"
                onClick={handleCalculateShipping}
                disabled={isCalculating}
              >
                {isCalculating ? (
                  <>
                    <Loader2 />
                    <span>Calculando...</span>
                  </>
                ) : (
                  "Calcular Frete"
                )}
              </button>
              <button
                className="btn btn-secondary"
                onClick={openAgencyFinder}
              >
                Encontrar Transportadoras Próximas
              </button>
            </div>
          </div>
        )}

        {activeTab === 1 && (
          <TrackingPanel />
        )}

        {activeTab === 2 && (
          <ShippingLabelGenerator />
        )}

        {activeTab === 3 && (
          <CarrierConfigPanel
            selectedCarriers={selectedCarriers}
            setSelectedCarriers={setSelectedCarriers}
          />
        )}
      </div>

      {/* Popup de resultados */}
      {showResultsPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Resultados do Cálculo de Frete</h3>
              <button
                className="close-button"
                onClick={() => setShowResultsPopup(false)}
              >
                &times;
              </button>
            </div>
            <div className="shipping-options">
              {shippingOptions.map((option) => (
                <ShippingOptionCard
                  key={option.id}
                  option={option}
                  isSelected={selectedOptionId === option.id}
                  onSelect={() => handleSelectOption(option.id)}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Botões de exportação */}
      <div className="export-buttons-container">
        <div className="export-buttons">
          <button
            className="btn btn-primary"
            disabled={isExportingToPDV}
            onClick={handleExportToPDV}
          >
            {isExportingToPDV ? "Exportando..." : "Exportar para PDV"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShippingCalculator;