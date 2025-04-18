# Plano de Refatoração para Versão Android do PDV Vendas

## Objetivo

Refatorar o código atual do PDV Vendas para uma versão mais limpa e modular, mantendo todas as funcionalidades e aparência, mas tornando-o adequado para ser transformado em um aplicativo Android.

## Análise do Código Atual

O código atual apresenta os seguintes desafios:

1. **Arquivo App.jsx muito grande**: Contém mais de 4600 linhas, misturando lógica de negócio, UI e gerenciamento de estado
2. **Muitos estados e funções em um único componente**: Dificulta a manutenção e aumenta a complexidade
3. **Falta de separação de responsabilidades**: UI, lógica de negócio e acesso a dados estão misturados
4. **Uso inconsistente de estilos**: Mistura de classes Tailwind e CSS personalizado
5. **Gerenciamento de estado centralizado**: Dificulta o reuso de componentes

## Estratégia de Refatoração

### 1. Arquitetura

Adotaremos uma arquitetura em camadas:

```
src/
├── api/              # Serviços de API e comunicação externa
├── components/       # Componentes de UI reutilizáveis
│   ├── common/       # Componentes básicos (botões, inputs, etc.)
│   ├── forms/        # Formulários reutilizáveis
│   ├── layout/       # Componentes de layout
│   └── modals/       # Componentes de modal
├── contexts/         # Contextos React para gerenciamento de estado
├── hooks/            # Hooks personalizados
├── pages/            # Páginas/telas da aplicação
├── services/         # Serviços de negócio
├── styles/           # Estilos globais e temas
├── utils/            # Funções utilitárias
└── App.jsx           # Componente principal (agora muito menor)
```

### 2. Gerenciamento de Estado

Utilizaremos uma combinação de:

1. **Context API**: Para estados globais (temas, autenticação, etc.)
2. **Hooks personalizados**: Para lógica de negócio reutilizável
3. **Estado local**: Para componentes específicos

### 3. Componentes a Serem Criados

#### Páginas Principais

1. **HomePage.jsx**: Página inicial com lista de produtos
2. **SalesPage.jsx**: Página de vendas
3. **ReportPage.jsx**: Página de relatórios
4. **ClientsPage.jsx**: Página de clientes
5. **VendorsPage.jsx**: Página de fornecedores
6. **SettingsPage.jsx**: Página de configurações

#### Componentes de UI

1. **ProductCard.jsx**: Card de produto
2. **ProductList.jsx**: Lista de produtos
3. **SearchBar.jsx**: Barra de busca
4. **CategoryFilter.jsx**: Filtro de categorias
5. **ThemeSelector.jsx**: Seletor de temas
6. **Header.jsx**: Cabeçalho da aplicação
7. **Footer.jsx**: Rodapé da aplicação

#### Modais

1. **AddProductModal.jsx**: Modal para adicionar produto
2. **EditProductModal.jsx**: Modal para editar produto
3. **PaymentModal.jsx**: Modal de pagamento
4. **ClientModal.jsx**: Modal de cliente
5. **VendorModal.jsx**: Modal de fornecedor
6. **ConfirmationModal.jsx**: Modal de confirmação

#### Contextos

1. **ThemeContext.jsx**: Gerenciamento de temas
2. **ProductContext.jsx**: Gerenciamento de produtos
3. **SalesContext.jsx**: Gerenciamento de vendas
4. **ClientContext.jsx**: Gerenciamento de clientes
5. **VendorContext.jsx**: Gerenciamento de fornecedores
6. **BackupContext.jsx**: Gerenciamento de backup

#### Hooks Personalizados

1. **useLocalStorage.jsx**: Hook para gerenciar localStorage
2. **useIndexedDB.jsx**: Hook para gerenciar IndexedDB
3. **useProducts.jsx**: Hook para gerenciar produtos
4. **useSales.jsx**: Hook para gerenciar vendas
5. **useClients.jsx**: Hook para gerenciar clientes
6. **useVendors.jsx**: Hook para gerenciar fornecedores

### 4. Adaptações para Android

#### Capacitor/Cordova

Utilizaremos o Capacitor (ou Cordova) para empacotar a aplicação web como um aplicativo Android:

1. **Instalação do Capacitor**:
   ```bash
   npm install @capacitor/core @capacitor/android
   npx cap init [nome-do-app] [id-do-app]
   npx cap add android
   ```

2. **Plugins Necessários**:
   - `@capacitor/filesystem`: Para acesso ao sistema de arquivos
   - `@capacitor/camera`: Para captura de imagens
   - `@capacitor/storage`: Para armazenamento local
   - `@capacitor/share`: Para compartilhamento
   - `@capacitor/barcode-scanner`: Para leitura de códigos de barras

#### Adaptações de UI

1. **Responsividade**: Garantir que a UI seja responsiva para diferentes tamanhos de tela
2. **Touch-friendly**: Aumentar áreas clicáveis para facilitar o toque
3. **Gestos**: Implementar gestos comuns em aplicativos móveis (swipe, pinch, etc.)
4. **Offline-first**: Garantir que o aplicativo funcione offline

#### Armazenamento

1. **IndexedDB**: Continuar usando para armazenamento principal
2. **Filesystem API**: Usar para armazenamento de arquivos (backups, imagens, etc.)
3. **Sincronização**: Implementar sincronização com WordPress quando online

## Plano de Implementação

### Fase 1: Estruturação e Configuração

1. Criar a nova estrutura de diretórios
2. Configurar o ambiente de desenvolvimento
3. Configurar o Capacitor/Cordova
4. Configurar o sistema de temas

### Fase 2: Componentes Básicos

1. Implementar componentes comuns
2. Implementar contextos
3. Implementar hooks personalizados

### Fase 3: Páginas e Funcionalidades

1. Implementar páginas principais
2. Implementar modais
3. Implementar lógica de negócio

### Fase 4: Integração e Testes

1. Integrar todos os componentes
2. Testar em navegadores
3. Testar em dispositivos Android
4. Corrigir bugs e otimizar desempenho

### Fase 5: Empacotamento e Distribuição

1. Configurar ícones e splash screens
2. Configurar permissões do Android
3. Gerar APK/AAB
4. Preparar para distribuição

## Detalhes de Implementação

### Exemplo de Refatoração do Componente App.jsx

```jsx
// App.jsx (versão refatorada)
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProductProvider } from './contexts/ProductContext';
import { SalesProvider } from './contexts/SalesContext';
import { ClientProvider } from './contexts/ClientContext';
import { VendorProvider } from './contexts/VendorContext';
import { BackupProvider } from './contexts/BackupContext';

import HomePage from './pages/HomePage';
import SalesPage from './pages/SalesPage';
import ReportPage from './pages/ReportPage';
import ClientsPage from './pages/ClientsPage';
import VendorsPage from './pages/VendorsPage';
import SettingsPage from './pages/SettingsPage';

import './styles/global.css';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Inicialização do aplicativo
    const initApp = async () => {
      try {
        // Inicializar banco de dados, carregar configurações, etc.
        // ...
        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao inicializar aplicativo:', error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <ProductProvider>
        <SalesProvider>
          <ClientProvider>
            <VendorProvider>
              <BackupProvider>
                <Router>
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/sales" element={<SalesPage />} />
                    <Route path="/reports" element={<ReportPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/vendors" element={<VendorsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </Router>
              </BackupProvider>
            </VendorProvider>
          </ClientProvider>
        </SalesProvider>
      </ProductProvider>
    </ThemeProvider>
  );
}

export default App;
```

### Exemplo de Hook Personalizado

```jsx
// hooks/useProducts.jsx
import { useState, useEffect, useCallback } from 'react';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../api/productApi';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carregar produtos
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getProducts();
      setProducts(data);
      
      // Extrair categorias únicas
      const uniqueCategories = ['Todos', ...new Set(data.map(item => item.category).filter(Boolean))];
      setCategories(uniqueCategories);
      
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar produtos:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Adicionar produto
  const addNewProduct = useCallback(async (product) => {
    try {
      setIsLoading(true);
      const newProduct = await addProduct(product);
      setProducts(prev => [...prev, newProduct]);
      
      // Atualizar categorias se necessário
      if (product.category && !categories.includes(product.category)) {
        setCategories(prev => [...prev, product.category]);
      }
      
      return newProduct;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao adicionar produto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [categories]);

  // Atualizar produto
  const updateExistingProduct = useCallback(async (product) => {
    try {
      setIsLoading(true);
      const updatedProduct = await updateProduct(product);
      setProducts(prev => prev.map(item => 
        item.id === product.id ? updatedProduct : item
      ));
      
      // Atualizar categorias se necessário
      if (product.category && !categories.includes(product.category)) {
        setCategories(prev => [...prev, product.category]);
      }
      
      return updatedProduct;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao atualizar produto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [categories]);

  // Remover produto
  const removeProduct = useCallback(async (productId) => {
    try {
      setIsLoading(true);
      await deleteProduct(productId);
      setProducts(prev => prev.filter(item => item.id !== productId));
      return true;
    } catch (err) {
      setError(err.message);
      console.error('Erro ao remover produto:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar produtos ao montar o componente
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return {
    products,
    categories,
    isLoading,
    error,
    loadProducts,
    addProduct: addNewProduct,
    updateProduct: updateExistingProduct,
    deleteProduct: removeProduct
  };
}
```

### Exemplo de Contexto

```jsx
// contexts/ProductContext.jsx
import { createContext, useContext } from 'react';
import { useProducts } from '../hooks/useProducts';

const ProductContext = createContext();

export function ProductProvider({ children }) {
  const productData = useProducts();
  
  return (
    <ProductContext.Provider value={productData}>
      {children}
    </ProductContext.Provider>
  );
}

export function useProductContext() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProductContext deve ser usado dentro de um ProductProvider');
  }
  return context;
}
```

### Exemplo de Componente de Página

```jsx
// pages/HomePage.jsx
import { useState } from 'react';
import { useProductContext } from '../contexts/ProductContext';
import Header from '../components/layout/Header';
import SearchBar from '../components/common/SearchBar';
import CategoryFilter from '../components/common/CategoryFilter';
import ProductList from '../components/ProductList';
import AddProductModal from '../components/modals/AddProductModal';
import Footer from '../components/layout/Footer';

function HomePage() {
  const { products, categories, isLoading } = useProductContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [showAddModal, setShowAddModal] = useState(false);

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Header title="Controle de Estoque" />
      
      <main className="max-w-7xl mx-auto mt-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold">Produtos</h1>
          <button 
            onClick={() => setShowAddModal(true)}
            className="btn btn-primary"
          >
            Adicionar Produto
          </button>
        </div>
        
        <SearchBar 
          value={searchQuery} 
          onChange={setSearchQuery} 
          placeholder="Buscar produtos..." 
        />
        
        <CategoryFilter 
          categories={categories} 
          selectedCategory={selectedCategory} 
          onSelectCategory={setSelectedCategory} 
        />
        
        {isLoading ? (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ProductList products={filteredProducts} />
        )}
      </main>
      
      <Footer />
      
      {showAddModal && (
        <AddProductModal 
          onClose={() => setShowAddModal(false)} 
        />
      )}
    </div>
  );
}

export default HomePage;
```

## Adaptações Específicas para Android

### Acesso à Câmera

```jsx
// hooks/useCamera.jsx
import { useCallback } from 'react';
import { Camera } from '@capacitor/camera';

export function useCamera() {
  const takePicture = useCallback(async () => {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: 'dataUrl'
      });
      
      return image.dataUrl;
    } catch (error) {
      console.error('Erro ao capturar imagem:', error);
      throw error;
    }
  }, []);

  return { takePicture };
}
```

### Armazenamento de Arquivos

```jsx
// services/fileService.js
import { Filesystem, Directory } from '@capacitor/filesystem';

// Salvar arquivo
export async function saveFile(fileName, data) {
  try {
    const result = await Filesystem.writeFile({
      path: fileName,
      data: data,
      directory: Directory.Documents,
      encoding: 'utf8'
    });
    
    return result;
  } catch (error) {
    console.error('Erro ao salvar arquivo:', error);
    throw error;
  }
}

// Ler arquivo
export async function readFile(fileName) {
  try {
    const result = await Filesystem.readFile({
      path: fileName,
      directory: Directory.Documents,
      encoding: 'utf8'
    });
    
    return result.data;
  } catch (error) {
    console.error('Erro ao ler arquivo:', error);
    throw error;
  }
}

// Listar arquivos
export async function listFiles() {
  try {
    const result = await Filesystem.readdir({
      path: '',
      directory: Directory.Documents
    });
    
    return result.files;
  } catch (error) {
    console.error('Erro ao listar arquivos:', error);
    throw error;
  }
}
```

### Leitor de Código de Barras

```jsx
// hooks/useBarcodeScanner.jsx
import { useCallback } from 'react';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

export function useBarcodeScanner() {
  const startScan = useCallback(async () => {
    try {
      // Verificar permissão
      const status = await BarcodeScanner.checkPermission({ force: true });
      
      if (!status.granted) {
        throw new Error('Permissão para usar a câmera não concedida');
      }
      
      // Iniciar escaneamento
      await BarcodeScanner.hideBackground();
      document.body.classList.add('scanner-active');
      
      const result = await BarcodeScanner.startScan();
      
      // Verificar resultado
      if (result.hasContent) {
        return result.content;
      } else {
        throw new Error('Nenhum código de barras detectado');
      }
    } catch (error) {
      console.error('Erro ao escanear código de barras:', error);
      throw error;
    } finally {
      document.body.classList.remove('scanner-active');
      await BarcodeScanner.showBackground();
      await BarcodeScanner.stopScan();
    }
  }, []);

  return { startScan };
}
```

## Considerações Finais

### Vantagens da Refatoração

1. **Código mais organizado e manutenível**
2. **Melhor separação de responsabilidades**
3. **Componentes reutilizáveis**
4. **Melhor gerenciamento de estado**
5. **Facilidade para adicionar novas funcionalidades**
6. **Melhor desempenho**
7. **Adaptação para plataforma móvel**

### Desafios

1. **Migração gradual**: Refatorar sem quebrar funcionalidades existentes
2. **Testes**: Garantir que todas as funcionalidades continuem funcionando
3. **Desempenho em dispositivos móveis**: Otimizar para diferentes dispositivos
4. **Adaptação da UI**: Garantir boa experiência em telas menores

### Próximos Passos

1. **Implementar a refatoração**: Seguir o plano de implementação
2. **Testar em dispositivos reais**: Garantir compatibilidade
3. **Otimizar desempenho**: Identificar e corrigir gargalos
4. **Adicionar funcionalidades específicas para Android**: Notificações, integração com hardware, etc.
5. **Preparar para distribuição**: Google Play Store ou distribuição direta

## Recursos e Ferramentas Recomendadas

1. **Capacitor**: Framework para criar aplicativos nativos com tecnologias web
2. **React Navigation**: Navegação para aplicativos React Native
3. **Tailwind CSS**: Continuar usando para estilos
4. **IndexedDB**: Continuar usando para armazenamento local
5. **Capacitor Plugins**: Usar plugins oficiais para funcionalidades nativas
6. **Android Studio**: Para testes e build final do aplicativo
