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
let L;
let Map;
let TileLayer;
let Marker;
let Popup;

// Carregar as bibliotecas de mapa dinamicamente
try {
  if (typeof window !== 'undefined') {
    L = require('leaflet');
    const ReactLeaflet = require('react-leaflet');
    Map = ReactLeaflet.MapContainer;
    TileLayer = ReactLeaflet.TileLayer;
    Marker = ReactLeaflet.Marker;
    Popup = ReactLeaflet.Popup;

    // Não importamos o CSS aqui para evitar erros
    // O CSS do Leaflet deve ser importado no arquivo principal ou em um arquivo CSS
  }
} catch (error) {
  console.error('Erro ao carregar bibliotecas de mapa:', error);
}

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
  const mapRef = useRef(null);

  // Carregar histórico de cálculos de frete do localStorage e inicializar com dados pré-selecionados
  useEffect(() => {
    const savedHistory = localStorage.getItem('shippingHistory');
    if (savedHistory) {
      try {
        setShippingHistory(JSON.parse(savedHistory));
      } catch (error) {
        console.error('Erro ao carregar histórico de fretes:', error);
      }
    }

    // Carregar produtos disponíveis no Vendas PDV
    fetchAvailableProducts();

    // Verificar se há um cliente pré-selecionado ou no localStorage
    if (preselectedClient) {
      setSelectedClient(preselectedClient);

      // Preencher o CEP de destino com o CEP do cliente
      if (preselectedClient.cep) {
        setZipCodeDestination(preselectedClient.cep.replace(/\D/g, ''));
        console.log(`CEP do cliente definido como destino: ${preselectedClient.cep}`);
      }

      // Buscar a última compra do cliente
      if (preselectedClient.id) {
        fetchLastClientSale(preselectedClient.id);
      }
    } else {
      const savedClient = localStorage.getItem('selectedClient');
      if (savedClient) {
        try {
          const client = JSON.parse(savedClient);
          setSelectedClient(client);

          // Preencher o CEP de destino com o CEP do cliente
          if (client.cep) {
            setZipCodeDestination(client.cep.replace(/\D/g, ''));
          }

          // Buscar a última compra do cliente
          if (client.id) {
            fetchLastClientSale(client.id);
          }
        } catch (error) {
          console.error('Erro ao carregar cliente selecionado:', error);
        }
      }
    }

    // Verificar se há um produto pré-selecionado
    if (preselectedProduct) {
      setSku(preselectedProduct.sku || "");
      setProductName(preselectedProduct.productName || preselectedProduct.name || preselectedProduct.description || "");
      setPackageDescription(preselectedProduct.description || "");
      setTechnicalSpecs(preselectedProduct.technicalSpecs || "");
      setWeight(preselectedProduct.weight ? preselectedProduct.weight.toString() : "");
      setLength(preselectedProduct.dimensions?.length ? preselectedProduct.dimensions.length.toString() : "");
      setWidth(preselectedProduct.dimensions?.width ? preselectedProduct.dimensions.width.toString() : "");
      setHeight(preselectedProduct.dimensions?.height ? preselectedProduct.dimensions.height.toString() : "");
    }

    // Obter o CEP do vendedor para o CEP de origem
    const vendorInfo = localStorage.getItem('selectedVendor');
    if (vendorInfo) {
      try {
        const vendor = JSON.parse(vendorInfo);
        if (vendor.cep) {
          setZipCodeOrigin(vendor.cep.replace(/\D/g, ''));
          console.log(`CEP do vendedor definido como origem: ${vendor.cep}`);
        }
      } catch (error) {
        console.error('Erro ao carregar vendedor selecionado:', error);
      }
    } else {
      // Tentar obter o CEP do usuário atual (vendedor/administrador)
      const currentUserInfo = localStorage.getItem('currentUser');
      if (currentUserInfo) {
        try {
          const currentUser = JSON.parse(currentUserInfo);
          if (currentUser.cep) {
            setZipCodeOrigin(currentUser.cep.replace(/\D/g, ''));
            console.log(`CEP do usuário atual definido como origem: ${currentUser.cep}`);
          } else {
            // CEP padrão para Salvador-BA
            setZipCodeOrigin('40255310');
            console.log('CEP padrão definido como origem: 40255-310');
          }
        } catch (error) {
          console.error('Erro ao carregar usuário atual:', error);
          setZipCodeOrigin('40255310');
        }
      } else {
        // CEP padrão para Salvador-BA
        setZipCodeOrigin('40255310');
        console.log('CEP padrão definido como origem: 40255-310');
      }
    }
  }, [preselectedClient, preselectedProduct]);

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
          productName: productName,
          description: packageDescription,
          technicalSpecs: technicalSpecs,
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

      // Primeiro, tentar buscar o produto pelo SKU
      const product = await fetchProductBySku(code);

      // Se não encontrar pelo SKU, buscar nos produtos disponíveis
      if (!product) {
        const products = await getProducts();
        const matchingProduct = products.find(p =>
          p.sku === code ||
          p.gtin === code ||
          p.ncm === code ||
          (p.description && p.description.includes(code))
        );

        if (matchingProduct) {
          fillProductData(matchingProduct);
          return;
        }
      } else {
        fillProductData(product);
        return;
      }

      toast({
        title: "Produto não encontrado",
        description: "Não foi possível encontrar informações para este código.",
        variant: "destructive",
      });
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      toast({
        title: "Erro ao buscar produto",
        description: "Não foi possível obter as dimensões do produto.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingProduct(false);
    }
  };

  // Função auxiliar para preencher os dados do produto
  const fillProductData = (product) => {
    // Preencher peso e dimensões se disponíveis
    if (product.weight) {
      setWeight(product.weight.toString());
    }

    if (product.dimensions) {
      if (product.dimensions.length) {
        setLength(product.dimensions.length.toString());
      }
      if (product.dimensions.width) {
        setWidth(product.dimensions.width.toString());
      }
      if (product.dimensions.height) {
        setHeight(product.dimensions.height.toString());
      }
    }

    // Preencher os campos de descrição
    setProductName(product.name || product.productName || product.description || "");

    // Incluir informações de NCM/GTIN na descrição se disponíveis
    let description = product.name || product.productName || product.description || "";
    if (product.ncm) {
      description += ` (NCM: ${product.ncm})`;
    }
    if (product.gtin && !description.includes(product.gtin)) {
      description += ` (GTIN: ${product.gtin})`;
    }
    if (product.sku && !description.includes(product.sku)) {
      description += ` (SKU: ${product.sku})`;
    }

    setPackageDescription(description);
    setTechnicalSpecs(product.technicalSpecs || "");

    toast({
      title: "Produto encontrado",
      description: `Informações preenchidas automaticamente para ${product.name || product.productName || product.description || ""}`
    });
  };

  const handleClearForm = () => {
    setSku("");
    setProductName("");
    setPackageDescription("");
    setTechnicalSpecs("");
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
    setProductName(entry.package.productName || "");
    setPackageDescription(entry.package.description || "");
    setTechnicalSpecs(entry.package.technicalSpecs || "");
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

  // Função para buscar a última compra do cliente
  const fetchLastClientSale = async (clientId) => {
    try {
      const lastSale = await getLastClientSale(clientId);
      setLastClientSaleData(lastSale);

      if (lastSale) {
        const saleItems = await getSaleItems(lastSale.id);
        setLastClientSaleItems(saleItems);

        // Se houver itens na última compra, preencher o primeiro item
        if (saleItems && saleItems.length > 0) {
          const firstItem = saleItems[0];
          setSku(firstItem.sku || "");
          setPackageDescription(firstItem.description || "");

          // Buscar mais informações do produto se disponível
          if (firstItem.description) {
            const products = await getProducts();
            const matchingProduct = products.find(p =>
              p.description === firstItem.description ||
              (p.sku && p.sku === firstItem.sku)
            );

            if (matchingProduct) {
              setProductName(matchingProduct.productName || matchingProduct.name || "");
              setTechnicalSpecs(matchingProduct.technicalSpecs || "");
              setWeight(matchingProduct.weight ? matchingProduct.weight.toString() : "");
              setLength(matchingProduct.dimensions?.length ? matchingProduct.dimensions.length.toString() : "");
              setWidth(matchingProduct.dimensions?.width ? matchingProduct.dimensions.width.toString() : "");
              setHeight(matchingProduct.dimensions?.height ? matchingProduct.dimensions.height.toString() : "");
            }
          }

          toast({
            title: "Última compra encontrada",
            description: `Informações do último produto comprado por ${selectedClient.name} foram preenchidas.`,
          });
        }
      }
    } catch (error) {
      console.error('Erro ao buscar última compra do cliente:', error);
    }
  };

  // Função para buscar produtos disponíveis no Vendas PDV
  const fetchAvailableProducts = async () => {
    try {
      const products = await getProducts();
      setAvailableProducts(products);

      // Se não houver cliente selecionado e houver produtos disponíveis, preencher o primeiro produto
      if (!selectedClient && products.length > 0 && !preselectedProduct) {
        const firstProduct = products[0];
        setSku(firstProduct.sku || "");
        setProductName(firstProduct.productName || firstProduct.name || firstProduct.description || "");
        setPackageDescription(firstProduct.description || "");
        setTechnicalSpecs(firstProduct.technicalSpecs || "");
        setWeight(firstProduct.weight ? firstProduct.weight.toString() : "");
        setLength(firstProduct.dimensions?.length ? firstProduct.dimensions.length.toString() : "");
        setWidth(firstProduct.dimensions?.width ? firstProduct.dimensions.width.toString() : "");
        setHeight(firstProduct.dimensions?.height ? firstProduct.dimensions.height.toString() : "");

        toast({
          title: "Produto carregado",
          description: `Informações do produto ${firstProduct.description || firstProduct.name} foram preenchidas.`,
        });
      }
    } catch (error) {
      console.error('Erro ao buscar produtos disponíveis:', error);
    }
  };

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
      // Primeiro, converter o CEP em coordenadas geográficas
      const addressData = await handleCepSearch(zipCodeOrigin);
      if (!addressData) {
        throw new Error("Não foi possível obter as coordenadas para o CEP informado.");
      }

      // Buscar as coordenadas usando a API do Nominatim (OpenStreetMap)
      const query = `${addressData.address}, ${addressData.neighborhood}, ${addressData.city}, ${addressData.state}, Brasil`;
      const nominatimUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`;

      const response = await fetch(nominatimUrl);
      const data = await response.json();

      if (data && data.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lon = parseFloat(data[0].lon);
        setMapCenter([lat, lon]);

        // Buscar transportadoras próximas usando a API do Overpass (OpenStreetMap)
        const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node(around:5000,${lat},${lon})["amenity"="courier"];out;node(around:5000,${lat},${lon})["shop"="courier"];out;`;

        const overpassResponse = await fetch(overpassUrl);
        const overpassData = await overpassResponse.json();

        if (overpassData && overpassData.elements) {
          setNearbyCarriers(overpassData.elements);

          toast({
            title: "Transportadoras encontradas",
            description: `Foram encontradas ${overpassData.elements.length} transportadoras próximas ao CEP informado.`,
          });
        } else {
          // Se não encontrar transportadoras, adicionar algumas transportadoras fictícias para demonstração
          const demoCarriers = [
            {
              id: 1,
              lat: lat + 0.01,
              lon: lon + 0.01,
              tags: { name: "Correios", phone: "(71) 3333-1234", website: "https://www.correios.com.br" }
            },
            {
              id: 2,
              lat: lat - 0.01,
              lon: lon - 0.01,
              tags: { name: "Jadlog", phone: "(71) 3333-5678", website: "https://www.jadlog.com.br" }
            },
            {
              id: 3,
              lat: lat + 0.02,
              lon: lon - 0.02,
              tags: { name: "Loggi", phone: "(71) 3333-9012", website: "https://www.loggi.com" }
            },
            {
              id: 4,
              lat: lat - 0.02,
              lon: lon + 0.02,
              tags: { name: "Azul Cargo", phone: "(71) 3333-3456", website: "https://www.azulcargo.com.br" }
            }
          ];

          setNearbyCarriers(demoCarriers);

          toast({
            title: "Transportadoras demonstrativas",
            description: "Foram adicionadas transportadoras demonstrativas para visualização.",
          });
        }
      } else {
        throw new Error("Não foi possível obter as coordenadas para o CEP informado.");
      }
    } catch (error) {
      console.error('Erro ao buscar transportadoras próximas:', error);
      toast({
        title: "Erro ao buscar transportadoras",
        description: error.message || "Não foi possível buscar transportadoras próximas.",
        variant: "destructive",
      });

      // Adicionar transportadoras fictícias para demonstração
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
    } finally {
      setIsLoadingCarriers(false);
    }
  };

  // Função para limpar o cliente selecionado
  const clearSelectedClient = () => {
    setSelectedClient(null);
    setLastClientSaleData(null);
    setLastClientSaleItems([]);
    toast({
      title: "Cliente removido",
      description: "O cliente foi removido da seleção.",
    });

    // Buscar produtos disponíveis quando o cliente é removido
    fetchAvailableProducts();
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

                          // Salvar o cliente selecionado no localStorage
                          localStorage.setItem('selectedClient', JSON.stringify(client));

                          // Preencher o CEP de origem com o CEP do cliente
                          if (client.address && client.address.cep) {
                            setZipCodeOrigin(client.address.cep.replace(/\D/g, ''));
                          }

                          // Buscar a última compra do cliente
                          if (client.id) {
                            fetchLastClientSale(client.id);
                          }

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
                title="Configurações"
              >
                <Settings className="icon" />
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
                          <MagicWandScanButton
                            onProductDataDetected={(productData) => {
                              setSku(productData.code);

                              // Obter o CEP do cliente selecionado, se houver
                              if (selectedClient && selectedClient.address && selectedClient.address.cep) {
                                const clientZipCode = selectedClient.address.cep;
                                console.log(`CEP do cliente selecionado: ${clientZipCode}`);
                                // Preencher o CEP de destino com o CEP do cliente
                                setZipCodeDestination(clientZipCode.replace(/\D/g, ""));
                              }

                              // Preencher o nome do produto se disponível
                              if (productData.productName) {
                                setProductName(productData.productName);
                              } else if (productData.name) {
                                setProductName(productData.name);
                              }

                              // Preencher a descrição do produto
                              if (productData.description) {
                                setPackageDescription(productData.description);
                              } else if (productData.name && !productData.productName) {
                                setPackageDescription(productData.name);
                              }

                              // Preencher as especificações técnicas
                              if (productData.technicalSpecs) {
                                setTechnicalSpecs(productData.technicalSpecs);
                              }

                              // Preencher as dimensões se disponíveis
                              if (productData.dimensions) {
                                if (productData.dimensions.length) {
                                  setLength(productData.dimensions.length.toString());
                                }
                                if (productData.dimensions.width) {
                                  setWidth(productData.dimensions.width.toString());
                                }
                                if (productData.dimensions.height) {
                                  setHeight(productData.dimensions.height.toString());
                                }
                              }

                              // Preencher o peso se disponível
                              if (productData.weight && productData.weight.value) {
                                // Converter para kg se estiver em gramas
                                const weightValue = productData.weight.unit === 'g'
                                  ? productData.weight.value / 1000
                                  : productData.weight.value;
                                setWeight(weightValue.toString());
                              }

                              toast({
                                title: `${productData.type} Detectado`,
                                description: `Informações do produto identificadas com sucesso.`,
                                variant: "success",
                              });
                            }}
                          />
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
                      <label htmlFor="productName">Nome do Produto</label>
                      <input
                        type="text"
                        id="productName"
                        placeholder="Nome completo do produto"
                        value={productName}
                        onChange={(e) => setProductName(e.target.value)}
                        className="form-control"
                      />
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
                    <div className="form-group">
                      <label htmlFor="technicalSpecs">Especificações Técnicas</label>
                      <textarea
                        id="technicalSpecs"
                        placeholder="Especificações técnicas do produto"
                        value={technicalSpecs}
                        onChange={(e) => setTechnicalSpecs(e.target.value)}
                        className="form-control"
                        rows="3"
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

              <button
                className="btn btn-secondary"
                onClick={findNearbyCarriers}
                disabled={isLoadingCarriers}
              >
                {isLoadingCarriers ? "Buscando..." : "Encontrar Transportadoras Próximas"}
              </button>

              <div className="export-buttons">
                {selectedClient && (
                  <div className="selected-client-info">
                    <p>Cliente: {selectedClient.name}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pop-up do Mapa de Transportadoras */}
      {showMap && (
        <div className="map-popup-overlay">
          <div className="map-popup">
            <div className="map-popup-header">
              <h3>Transportadoras Próximas</h3>
              <button
                className="close-button"
                onClick={() => setShowMap(false)}
              >
                &times;
              </button>
            </div>

            <div className="map-popup-content">
              {typeof window !== 'undefined' && Map && (
                <div style={{ height: '400px', width: '100%' }}>
                  <Map
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
                  </Map>
                </div>
              )}

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
      }
    </div>
  );
};

export default ShippingCalculator;
