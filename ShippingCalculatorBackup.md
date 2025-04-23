# Backup Completo do ShippingCalculator.jsx

Este arquivo contém um backup das partes mais importantes do componente ShippingCalculator.jsx, com foco especial no botão "Exportar para VendasPDV" e no componente MagicWandScanButton.

## 1. Estado para Controlar a Exportação

```jsx
// Estado para controlar o processo de exportação para o PDV Vendas
const [isExportingToPDV, setIsExportingToPDV] = useState(false);
```

## 2. Componente MagicWandScanButton

```jsx
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
```

## 3. Botão "Exportar para VendasPDV"

```jsx
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
```

## 4. Estrutura dos Botões de Exportação

```jsx
{/* Botões de exportação */}
<div className="export-buttons-container">
  <div className="export-buttons">
    <button
      className="btn btn-primary"
      disabled={isExportingToPDV}
      onClick={async () => {
        // Código do botão "Exportar para Vendas PDV"
        // ...
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
```

## 5. Problema Identificado no Arquivo Atual

O arquivo atual tem um erro de sintaxe JSX na linha 1600, onde há um `}` extra que está causando o erro:

```jsx
      </div>
      } <!-- Este } extra está causando o erro -->
    </div>
  );
};
```

A estrutura correta deveria ser:

```jsx
      </div>
    </div>
  );
};
```

## 6. Importações Necessárias

```jsx
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

// Ícone de carregamento
const Loader2 = () => (
  <svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
```
