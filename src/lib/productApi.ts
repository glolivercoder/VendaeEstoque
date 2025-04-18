// Removendo importação não utilizada

export type Product = {
  sku: string;
  name: string;
  ncm?: string;  // Nomenclatura Comum do Mercosul
  weight: number; // in kg
  dimensions: {
    length: number; // in cm
    width: number;  // in cm
    height: number; // in cm
  };
};

// Mock product database with NCM codes
const mockProducts: Product[] = [
  {
    sku: "123456789",
    name: "Smartphone XYZ",
    ncm: "85171231",
    weight: 0.3,
    dimensions: {
      length: 15,
      width: 7.5,
      height: 1,
    },
  },
  {
    sku: "987654321",
    name: "Notebook ABC",
    ncm: "84713012",
    weight: 2.5,
    dimensions: {
      length: 35,
      width: 25,
      height: 2.5,
    },
  },
  {
    sku: "456789123",
    name: "Televisão 4K 55\"",
    ncm: "85287200",
    weight: 15,
    dimensions: {
      length: 123,
      width: 75,
      height: 8,
    },
  }
];

/**
 * Fetches product information by SKU, barcode, or NCM
 * This is a mock implementation that simulates an API call
 */
export const fetchProductBySku = async (code: string): Promise<Product | null> => {
  // Simulate API call with delay
  return new Promise((resolve) => {
    setTimeout(() => {
      // Search by SKU, barcode, or NCM
      const product = mockProducts.find(
        p => p.sku === code || p.ncm === code
      );

      if (product) {
        resolve(product);
      } else {
        resolve(null);
      }
    }, 800);
  });
};

// Example endpoints from Portal Único that could be implemented in the future:
// GET /ext/catp/produto-catalogo/{idProduto}
// GET /ext/catp/produto-catalogo/ncm/{codigoNcm}
// GET /ext/catp/produto-catalogo/codigo-interno/{codigoInterno}

export const productApis = [
  {
    name: "Open Food Facts",
    description: "API gratuita com informações de produtos alimentícios",
    url: "https://world.openfoodfacts.org/api/v0/product/[barcode].json",
    free: true,
  },
  {
    name: "UPC Item DB",
    description: "Banco de dados de produtos com código de barras",
    url: "https://api.upcitemdb.com/prod/trial/lookup?upc=[barcode]",
    free: "Versão limitada gratuita",
  },
  {
    name: "Barcode Monster",
    description: "API simples para pesquisa de códigos de barras",
    url: "https://barcodemonster.com/api/[barcode]",
    free: "Versão limitada gratuita",
  },
  {
    name: "Barcode Lookup",
    description: "API comercial para busca de informações de produtos",
    url: "https://api.barcodelookup.com/v3/products?barcode=[barcode]",
    free: false,
  },
  {
    name: "Dabas API",
    description: "API para informações de produtos na Suécia",
    url: "https://api.dabas.com/DABASService/V2/article/[gtin]",
    free: "Com registro",
  },
  {
    name: "EAN Data",
    description: "API paga para informações de produtos",
    url: "https://eandata.com/feed/?v=3&keycode=[key]&mode=json&find=[barcode]",
    free: false,
  }
];
