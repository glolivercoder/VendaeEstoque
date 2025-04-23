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

// Importar bibliotecas para o mapa
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

// Corrigir o problema dos ícones do Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Configurar ícones padrão do Leaflet
let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

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

  // Estados para a busca de clientes
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [filteredClients, setFilteredClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [lastClientSaleData, setLastClientSaleData] = useState(null);
  const [lastClientSaleItems, setLastClientSaleItems] = useState([]);
  const [availableProducts, setAvailableProducts] = useState([]);

  // Estados para o pop-up de resultados
  const [showResultsPopup, setShowResultsPopup] = useState(false);

  // Estados para o mapa e localização de transportadoras
  const [showMap, setShowMap] = useState(false);
  const [mapCenter, setMapCenter] = useState([-12.9704, -38.5124]); // Salvador-BA
  const [nearbyCarriers, setNearbyCarriers] = useState([]);
  const [isLoadingCarriers, setIsLoadingCarriers] = useState(false);
  const [isExportingToPDV, setIsExportingToPDV] = useState(false);
  const mapRef = useRef(null);

  const { toast } = useToast();

  // Função para buscar transportadoras próximas usando a API do OpenStreetMap
  const findNearbyCarriers = async () => {
    if (!zipCodeOrigin) {
      toast({
        title: "CEP de origem necessário",
        description: "Informe o CEP de origem para buscar transportadoras próximas.",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingCarriers(true);
    setShowMap(true);

    try {
      // Simulação de busca de transportadoras
      setTimeout(() => {
        const demoCarriers = [
          {
            id: 1,
            lat: -12.9704 + 0.01,
            lon: -38.5124 + 0.01,
            tags: { name: "Correios", phone: "(71) 3333-1234", website: "https://www.correios.com.br" }
          },
          {
            id: 2,
            lat: -12.9704 - 0.01,
            lon: -38.5124 - 0.01,
            tags: { name: "Jadlog", phone: "(71) 3333-5678", website: "https://www.jadlog.com.br" }
          },
          {
            id: 3,
            lat: -12.9704 + 0.02,
            lon: -38.5124 - 0.02,
            tags: { name: "Loggi", phone: "(71) 3333-9012", website: "https://www.loggi.com" }
          },
          {
            id: 4,
            lat: -12.9704 - 0.02,
            lon: -38.5124 + 0.02,
            tags: { name: "Azul Cargo", phone: "(71) 3333-3456", website: "https://www.azulcargo.com.br" }
          }
        ];

        setNearbyCarriers(demoCarriers);
        setIsLoadingCarriers(false);
      }, 1500);
    } catch (error) {
      console.error('Erro ao buscar transportadoras próximas:', error);
      setIsLoadingCarriers(false);
    }
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

  // Função para buscar a última compra do cliente
  const fetchLastClientSale = async (clientId) => {
    try {
      const lastSale = await getLastClientSale(clientId);
      if (lastSale) {
        setLastClientSaleData(lastSale);

        // Buscar os itens da última venda
        const items = await getSaleItems(lastSale.id);
        setLastClientSaleItems(items);
      }
    } catch (error) {
      console.error('Erro ao buscar última compra do cliente:', error);
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

    // Preencher o CEP de destino com o CEP do cliente
    if (client.cep) {
      setZipCodeDestination(client.cep.replace(/\D/g, ''));
    }

    // Buscar a última compra do cliente
    if (client.id) {
      fetchLastClientSale(client.id);
    }

    // Salvar o cliente selecionado no localStorage
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

    // Simulação de cálculo de frete
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

  return (
    <div className="shipping-calculator">
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
                    >
                      <Camera />
                    </button>
                    <MagicWandScanButton onProductDataDetected={fillProductData} />
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
                onClick={findNearbyCarriers}
                disabled={isLoadingCarriers}
              >
                {isLoadingCarriers ? (
                  <>
                    <Loader2 />
                    <span>Buscando...</span>
                  </>
                ) : (
                  "Encontrar Transportadoras Próximas"
                )}
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
              {shippingOptions.map((option, index) => (
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

      {showMap && (
        <div className="popup-overlay">
          <div className="popup-content">
            <div className="popup-header">
              <h3>Transportadoras Próximas</h3>
              <button
                className="close-button"
                onClick={() => setShowMap(false)}
              >
                &times;
              </button>
            </div>
            <div className="map-popup-content">
              <div style={{ height: '400px', width: '100%' }}>
                <MapContainer
                  center={mapCenter}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                  ref={mapRef}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />

                  {/* Marcador para o CEP de origem */}
                  <Marker position={mapCenter}>
                    <Popup>
                      <strong>Sua localização</strong><br />
                      CEP: {zipCodeOrigin}
                    </Popup>
                  </Marker>

                  {/* Marcadores para as transportadoras próximas */}
                  {nearbyCarriers.map((carrier, index) => (
                    <Marker
                      key={carrier.id || index}
                      position={[carrier.lat, carrier.lon]}
                    >
                      <Popup>
                        <strong>{carrier.tags?.name || `Transportadora ${index + 1}`}</strong><br />
                        {carrier.tags?.phone && <div>Telefone: {carrier.tags.phone}</div>}
                        {carrier.tags?.website && (
                          <div>
                            <a href={carrier.tags.website} target="_blank" rel="noopener noreferrer">
                              Visitar site
                            </a>
                          </div>
                        )}
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>

              {isLoadingCarriers && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Buscando transportadoras próximas...</p>
                </div>
              )}

              {!isLoadingCarriers && nearbyCarriers.length > 0 && (
                <div className="carriers-list">
                  <h4>Transportadoras Encontradas</h4>
                  <ul>
                    {nearbyCarriers.map((carrier, index) => (
                      <li key={carrier.id || index}>
                        <strong>{carrier.tags?.name || `Transportadora ${index + 1}`}</strong>
                        {carrier.tags?.phone && <div>Telefone: {carrier.tags.phone}</div>}
                        {carrier.tags?.website && (
                          <div>
                            <a href={carrier.tags.website} target="_blank" rel="noopener noreferrer">
                              Visitar site
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
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
            onClick={async () => {
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
                  title: "Dados incompletos",
                  description: "Preencha o peso e as dimensões do produto para exportar para o PDV Vendas.",
                  variant: "destructive",
                });
                return;
              }

              try {
                setIsExportingToPDV(true);

                // Criar objeto do produto com os dados preenchidos
                const productToExport = {
                  description: productName,
                  productName: productName,
                  itemDescription: packageDescription,
                  technicalSpecs: technicalSpecs,
                  sku: sku,
                  price: 0, // Valor padrão, será editado no PDV
                  quantity: 1, // Valor padrão, será editado no PDV
                  weight: weight ? parseFloat(weight) : null,
                  dimensions: {
                    length: length ? parseFloat(length) : null,
                    width: width ? parseFloat(width) : null,
                    height: height ? parseFloat(height) : null
                  }
                };

                // Verificar se a função global está disponível
                if (typeof window.handleSelectProductsForPDV === 'function') {
                  // Chamar a função global para adicionar o produto ao PDV
                  await window.handleSelectProductsForPDV([productToExport]);

                  toast({
                    title: "Produto Exportado",
                    description: `${productName} foi adicionado ao PDV Vendas com sucesso.`,
                  });
                } else {
                  console.error('Função handleSelectProductsForPDV não encontrada no escopo global');
                  toast({
                    title: "Erro",
                    description: "Não foi possível adicionar o produto ao PDV Vendas. Tente novamente.",
                    variant: "destructive",
                  });
                }
              } catch (error) {
                console.error('Erro ao exportar produto para PDV Vendas:', error);
                toast({
                  title: "Erro",
                  description: "Ocorreu um erro ao exportar o produto. Tente novamente.",
                  variant: "destructive",
                });
              } finally {
                setIsExportingToPDV(false);
              }
            }}
          >
            {isExportingToPDV ? (
              <>
                <Loader2 />
                <span>Exportando...</span>
              </>
            ) : (
              "Exportar para Vendas PDV"
            )}
          </button>

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
  );
};

export default ShippingCalculator;
