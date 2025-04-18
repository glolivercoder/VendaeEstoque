import { useState, useEffect } from "react";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import Label from "../components/ui/label";
import { useToast } from "../components/ui/toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "../components/ui/popover";
import { calculateShipping } from "../lib/shippingApi";
import ShippingOptionCard from "../components/ShippingOptionCard";
import ProductScanner from "../components/ProductScanner";
import { fetchProductBySku } from "../lib/productApi";

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

  const [shippingOptions, setShippingOptions] = useState([]);

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

    setShippingOptions(options);
    return options;
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

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6 text-center">Calculadora de Frete</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PackagePlus className="h-5 w-5 text-primary" />
                  Detalhes do Envio
                </CardTitle>
                <CardDescription>
                  Informe os dados do pacote e os endereços para calcular o frete
                </CardDescription>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Endereços</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="zipCodeOrigin">CEP de Origem</Label>
                        <Input
                          id="zipCodeOrigin"
                          placeholder="00000-000"
                          value={zipCodeOrigin}
                          onChange={(e) => setZipCodeOrigin(e.target.value.replace(/\D/g, ""))}
                          maxLength={8}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="zipCodeDestination">CEP de Destino</Label>
                        <Input
                          id="zipCodeDestination"
                          placeholder="00000-000"
                          value={zipCodeDestination}
                          onChange={(e) => setZipCodeDestination(e.target.value.replace(/\D/g, ""))}
                          maxLength={8}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Produto</h3>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="sku">Código SKU / NCM / GTIN</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <Settings className="h-4 w-4" />
                                <span className="sr-only">Configurações de API</span>
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96">
                              <div className="space-y-4">
                                <h4 className="font-medium">Configurações de APIs</h4>

                                <div className="space-y-2 border-b pb-4">
                                  <h5 className="font-medium text-sm">Portal Único Siscomex</h5>
                                  <p className="text-sm text-muted-foreground">
                                    API oficial do governo para informações fiscais e aduaneiras de produtos.
                                  </p>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Certificado Digital (e-CPF ou e-CNPJ)</li>
                                    <li>Endpoints:
                                      <ul className="ml-6 text-xs">
                                        <li>GET /ext/catp/produto-catalogo/{"{idProduto}"}</li>
                                        <li>GET /ext/catp/produto-catalogo/ncm/{"{codigoNcm}"}</li>
                                      </ul>
                                    </li>
                                  </ul>
                                </div>

                                <div className="space-y-2 border-b pb-4">
                                  <h5 className="font-medium text-sm">GS1 Brasil - Cadastro Nacional de Produtos</h5>
                                  <p className="text-sm text-muted-foreground">
                                    Base oficial para GTINs (códigos de barras) e informações técnicas de produtos.
                                  </p>
                                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                    <li>Necessário cadastro na GS1</li>
                                    <li>Acesso via API REST</li>
                                    <li>Suporte a consultas por GTIN/EAN</li>
                                  </ul>
                                </div>

                                <div className="space-y-2">
                                  <p className="text-sm font-medium">Códigos de Teste:</p>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                    <div>
                                      <p className="font-medium">SKUs:</p>
                                      <ul className="list-none">
                                        <li>123456789 - Smartphone</li>
                                        <li>987654321 - Notebook</li>
                                        <li>456789123 - TV 4K</li>
                                      </ul>
                                    </div>
                                    <div>
                                      <p className="font-medium">NCMs:</p>
                                      <ul className="list-none">
                                        <li>85171231 - Smartphones</li>
                                        <li>84713012 - Notebooks</li>
                                        <li>85287200 - Smart TVs</li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                <div className="pt-2">
                                  <p className="text-xs text-muted-foreground">
                                    Para configurar as integrações com segurança, conecte seu projeto ao Supabase.
                                  </p>
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Input
                            id="sku"
                            placeholder="Digite o código SKU, NCM ou escaneie o código de barras"
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            type="button"
                            onClick={() => setIsScanning(true)}
                            title="Escanear código"
                          >
                            <Camera className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="flex items-end">
                        <Button
                          variant="secondary"
                          onClick={() => lookupProduct(sku)}
                          disabled={!sku || isFetchingProduct}
                          className="mb-0.5"
                        >
                          {isFetchingProduct ? "Buscando..." : "Buscar"}
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="packageDescription">Descrição da Encomenda</Label>
                      <Input
                        id="packageDescription"
                        placeholder="Descrição do produto (preenchido automaticamente pelo código)"
                        value={packageDescription}
                        onChange={(e) => setPackageDescription(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dimensões e Peso</h3>
                    <div>
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        placeholder="0.5"
                        value={weight}
                        onChange={(e) => setWeight(e.target.value)}
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="length">Comprimento (cm)</Label>
                        <Input
                          id="length"
                          type="number"
                          placeholder="20"
                          value={length}
                          onChange={(e) => setLength(e.target.value)}
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="width">Largura (cm)</Label>
                        <Input
                          id="width"
                          type="number"
                          placeholder="15"
                          value={width}
                          onChange={(e) => setWidth(e.target.value)}
                          min="1"
                          step="1"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="height">Altura (cm)</Label>
                        <Input
                          id="height"
                          type="number"
                          placeholder="10"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          min="1"
                          step="1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  onClick={handleCalculateShipping}
                  disabled={isCalculating}
                >
                  <PackageSearch className="mr-2 h-4 w-4" />
                  {isCalculating ? "Calculando..." : "Calcular Frete"}
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div>
            <h2 className="text-xl font-medium mb-4">Opções de Frete</h2>

            <div className="space-y-4">
              {shippingOptions && shippingOptions.length > 0 ? (
                shippingOptions.map((option, index) => (
                  <ShippingOptionCard
                    key={index}
                    option={option}
                    isSelected={selectedOptionId === index}
                    onSelect={() => handleSelectOption(index)}
                  />
                ))
              ) : (
                <Card className="flex flex-col items-center justify-center py-10 text-center">
                  <PackageSearch className="h-12 w-12 text-muted-foreground opacity-30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma opção de frete</h3>
                  <p className="text-muted-foreground max-w-xs">
                    Preencha os dados do pacote e os CEPs de origem e destino para calcular as opções disponíveis.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>

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
