import { useToast } from "../components/ui/toast";

// Package dimensions type
export type PackageDimensions = {
  weight: number; // in kg
  length: number; // in cm
  width: number; // in cm
  height: number; // in cm
};

// Location info type
export type LocationInfo = {
  zipCodeOrigin: string;
  zipCodeDestination: string;
};

// Shipping carrier type
export type ShippingCarrier = {
  id: string;
  name: string;
  logo: string;
  color: string;
};

// Shipping option type
export type ShippingOption = {
  carrier: ShippingCarrier;
  service: string;
  price: number;
  currency: string;
  deliveryTime: {
    min: number;
    max: number;
    unit: string;
  };
  isExpedited: boolean;
  isCheapest: boolean;
  isFastest: boolean;
};

// Mock carriers data
export const carriers: ShippingCarrier[] = [
  {
    id: "correios",
    name: "Correios",
    logo: "/correios-logo.png",
    color: "hsl(var(--correios))",
  },
  {
    id: "melhor-envio",
    name: "Melhor Envio",
    logo: "/melhor-envio-logo.png",
    color: "hsl(var(--melhor-envio))",
  },
  {
    id: "jadlog",
    name: "Jadlog",
    logo: "/jadlog-logo.png",
    color: "hsl(var(--jadlog))",
  },
  {
    id: "loggi",
    name: "Loggi",
    logo: "/loggi-logo.png",
    color: "hsl(var(--loggi))",
  },
  {
    id: "azul-cargo",
    name: "Azul Cargo",
    logo: "/azul-cargo-logo.png",
    color: "hsl(var(--azul-cargo))",
  },
];

// Function to calculate shipping options
export const calculateShipping = async (
  packageDimensions: PackageDimensions,
  locationInfo: LocationInfo
): Promise<ShippingOption[]> => {
  try {
    // In a real application, this would call actual APIs for each carrier
    // For this demo, we'll use mock data that simulates API responses

    // Simulate API loading time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Generate shipping options based on package dimensions and location
    // In a real implementation, this would parse actual API responses
    const shippingOptions: ShippingOption[] = generateMockShippingOptions(
      packageDimensions,
      locationInfo
    );

    return shippingOptions;
  } catch (error) {
    console.error("Error calculating shipping", error);
    // Erro será tratado no componente que chama esta função
    return [];
  }
};

// Helper function to generate mock shipping options based on package and location
const generateMockShippingOptions = (
  packageDimensions: PackageDimensions,
  locationInfo: LocationInfo
): ShippingOption[] => {
  // Real implementation would call Correios API, Melhor Envio API, etc.
  // For now, let's simulate different carrier rates

  // Calculate volumetric weight (common formula used by carriers)
  const volumetricWeight = (
    (packageDimensions.length * packageDimensions.width * packageDimensions.height) / 6000
  );

  // Use the higher of actual weight vs volumetric weight
  const billableWeight = Math.max(packageDimensions.weight, volumetricWeight);

  // Base price calculation (simplified for demo)
  const basePrice = billableWeight * 10;

  // Generate distance factor based on zip codes (simplified)
  const distanceFactor = Math.abs(
    parseInt(locationInfo.zipCodeOrigin) - parseInt(locationInfo.zipCodeDestination)
  ) / 10000000;

  const options: ShippingOption[] = [
    // Correios PAC
    {
      carrier: carriers[0],
      service: "PAC",
      price: basePrice * (1 + distanceFactor) * 1.2,
      currency: "BRL",
      deliveryTime: {
        min: 3,
        max: 9,
        unit: "dias úteis",
      },
      isExpedited: false,
      isCheapest: false,
      isFastest: false,
    },
    // Correios SEDEX
    {
      carrier: carriers[0],
      service: "SEDEX",
      price: basePrice * (1 + distanceFactor) * 2.5,
      currency: "BRL",
      deliveryTime: {
        min: 1,
        max: 3,
        unit: "dias úteis",
      },
      isExpedited: true,
      isCheapest: false,
      isFastest: false,
    },
    // Melhor Envio
    {
      carrier: carriers[1],
      service: "Econômico",
      price: basePrice * (1 + distanceFactor) * 1.1,
      currency: "BRL",
      deliveryTime: {
        min: 4,
        max: 10,
        unit: "dias úteis",
      },
      isExpedited: false,
      isCheapest: false,
      isFastest: false,
    },
    // Jadlog
    {
      carrier: carriers[2],
      service: "Standard",
      price: basePrice * (1 + distanceFactor) * 1.4,
      currency: "BRL",
      deliveryTime: {
        min: 3,
        max: 7,
        unit: "dias úteis",
      },
      isExpedited: false,
      isCheapest: false,
      isFastest: false,
    },
    // Loggi
    {
      carrier: carriers[3],
      service: "Expresso",
      price: basePrice * (1 + distanceFactor) * 3.2,
      currency: "BRL",
      deliveryTime: {
        min: 1,
        max: 2,
        unit: "dias úteis",
      },
      isExpedited: true,
      isCheapest: false,
      isFastest: false,
    },
  ];

  // Sort options by price
  options.sort((a, b) => a.price - b.price);

  // Mark cheapest option
  if (options.length > 0) {
    options[0].isCheapest = true;
  }

  // Find and mark fastest option
  let fastestOption = options[0];
  options.forEach((option) => {
    if (option.deliveryTime.min < fastestOption.deliveryTime.min) {
      fastestOption = option;
    }
  });
  fastestOption.isFastest = true;

  return options;
};

// Function to format currency (BRL)
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
