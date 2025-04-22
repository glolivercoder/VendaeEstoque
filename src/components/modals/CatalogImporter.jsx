import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { getProducts, addProduct } from '../../services/database';
import { syncProductsToWordPress } from '../../services/wordpress';

const CatalogImporter = ({ isOpen, onClose, vendor }) => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProducts, setSelectedProducts] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [importType, setImportType] = useState('manual'); // 'manual' ou 'file'
  const [fileImportStatus, setFileImportStatus] = useState('');
  const [importedProducts, setImportedProducts] = useState([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const allProducts = await getProducts();
        setProducts(allProducts);

        // Extract unique categories
        const uniqueCategories = ['Todos', ...new Set(allProducts.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories);

        setIsLoading(false);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleProductSelection = (productId) => {
    setSelectedProducts(prev => ({
      ...prev,
      [productId]: !prev[productId]
    }));
  };

  const handleSelectAll = () => {
    const newSelectedProducts = {};
    filteredProducts.forEach(product => {
      newSelectedProducts[product.id] = true;
    });
    setSelectedProducts(newSelectedProducts);
  };

  const handleDeselectAll = () => {
    const newSelectedProducts = { ...selectedProducts };
    filteredProducts.forEach(product => {
      delete newSelectedProducts[product.id];
    });
    setSelectedProducts(newSelectedProducts);
  };

  const handleImportFile = () => {
    // Criar um input de arquivo temporário
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.csv,.xml';
    fileInput.style.display = 'none';
    document.body.appendChild(fileInput);

    // Quando o usuário selecionar um arquivo
    fileInput.onchange = (e) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            setFileImportStatus('Processando arquivo...');

            // Processar o arquivo de acordo com o tipo
            if (file.name.endsWith('.xml')) {
              // Processar XML
              const xmlData = event.target.result;
              const parser = new DOMParser();
              const xmlDoc = parser.parseFromString(xmlData, "text/xml");

              // Exemplo de processamento de XML (ajuste conforme a estrutura do seu XML)
              const productNodes = xmlDoc.getElementsByTagName('product');
              const parsedProducts = [];

              for (let i = 0; i < productNodes.length; i++) {
                const node = productNodes[i];
                parsedProducts.push({
                  id: `imported-${Date.now()}-${i}`,
                  description: node.getElementsByTagName('name')[0]?.textContent || 'Produto Importado',
                  price: parseFloat(node.getElementsByTagName('price')[0]?.textContent || '0'),
                  quantity: parseInt(node.getElementsByTagName('quantity')[0]?.textContent || '0'),
                  category: node.getElementsByTagName('category')[0]?.textContent || 'Importados',
                  itemDescription: node.getElementsByTagName('description')[0]?.textContent || '',
                  image: node.getElementsByTagName('image')[0]?.textContent || '',
                  sku: node.getElementsByTagName('sku')[0]?.textContent || '',
                  gtin: node.getElementsByTagName('gtin')[0]?.textContent || '',
                  ncm: node.getElementsByTagName('ncm')[0]?.textContent || '',
                  vendorId: vendor?.id
                });
              }

              setImportedProducts(parsedProducts);
              setFileImportStatus(`Importado com sucesso! ${parsedProducts.length} produtos encontrados.`);
            } else if (file.name.endsWith('.csv')) {
              // Processar CSV
              const csvData = event.target.result;
              const lines = csvData.split('\n');

              if (lines.length > 1) {
                const headers = lines[0].split(',').map(header => header.trim());
                const parsedProducts = [];

                // Mapear índices de colunas importantes
                const nameIndex = headers.findIndex(h => h.toLowerCase().includes('nome') || h.toLowerCase().includes('descrição') || h.toLowerCase() === 'name');
                const priceIndex = headers.findIndex(h => h.toLowerCase().includes('preço') || h.toLowerCase() === 'price');
                const quantityIndex = headers.findIndex(h => h.toLowerCase().includes('quantidade') || h.toLowerCase().includes('estoque') || h.toLowerCase() === 'quantity');
                const categoryIndex = headers.findIndex(h => h.toLowerCase().includes('categoria') || h.toLowerCase() === 'category');
                const descriptionIndex = headers.findIndex(h => h.toLowerCase().includes('descrição detalhada') || h.toLowerCase() === 'description');
                const imageIndex = headers.findIndex(h => h.toLowerCase().includes('imagem') || h.toLowerCase() === 'image');

                // Processar cada linha
                for (let i = 1; i < lines.length; i++) {
                  if (!lines[i].trim()) continue; // Pular linhas vazias

                  const values = lines[i].split(',').map(value => value.trim());

                  // Mapear índices de colunas adicionais
                  const skuIndex = headers.findIndex(h => h.toLowerCase().includes('sku') || h.toLowerCase() === 'codigo');
                  const gtinIndex = headers.findIndex(h => h.toLowerCase().includes('gtin') || h.toLowerCase().includes('ean') || h.toLowerCase().includes('barcode'));
                  const ncmIndex = headers.findIndex(h => h.toLowerCase().includes('ncm'));

                  parsedProducts.push({
                    id: `imported-${Date.now()}-${i}`,
                    description: nameIndex >= 0 ? values[nameIndex] : `Produto Importado ${i}`,
                    price: priceIndex >= 0 ? parseFloat(values[priceIndex]) || 0 : 0,
                    quantity: quantityIndex >= 0 ? parseInt(values[quantityIndex]) || 0 : 0,
                    category: categoryIndex >= 0 ? values[categoryIndex] : 'Importados',
                    itemDescription: descriptionIndex >= 0 ? values[descriptionIndex] : '',
                    image: imageIndex >= 0 ? values[imageIndex] : '',
                    sku: skuIndex >= 0 ? values[skuIndex] : '',
                    gtin: gtinIndex >= 0 ? values[gtinIndex] : '',
                    ncm: ncmIndex >= 0 ? values[ncmIndex] : '',
                    vendorId: vendor?.id
                  });
                }

                setImportedProducts(parsedProducts);
                setFileImportStatus(`Importado com sucesso! ${parsedProducts.length} produtos encontrados.`);
              } else {
                setFileImportStatus('Arquivo CSV vazio ou inválido.');
              }
            } else {
              setFileImportStatus('Formato de arquivo não suportado. Use CSV ou XML.');
            }
          } catch (error) {
            console.error('Erro ao processar arquivo:', error);
            setFileImportStatus(`Erro ao processar o arquivo: ${error.message}`);
          } finally {
            document.body.removeChild(fileInput);
          }
        };

        reader.onerror = () => {
          setFileImportStatus('Erro ao ler o arquivo.');
          document.body.removeChild(fileInput);
        };

        // Ler o arquivo como texto
        reader.readAsText(file);
      } else {
        document.body.removeChild(fileInput);
      }
    };

    // Abrir o seletor de arquivos
    fileInput.click();
  };

  const handleExportToPDV = async () => {
    const selectedProductsList = importType === 'manual'
      ? products.filter(product => selectedProducts[product.id])
      : importedProducts;

    if (selectedProductsList.length === 0) {
      alert('Selecione pelo menos um produto para exportar para o PDV');
      return;
    }

    try {
      // Adicionar cada produto ao PDV
      let successCount = 0;
      let errorCount = 0;

      for (const product of selectedProductsList) {
        try {
          // Preparar dados do produto para adicionar ao banco de dados
          const productData = {
            description: product.description,
            price: parseFloat(product.price),
            quantity: parseInt(product.quantity) || 0,
            sold: 0,
            image: product.image || '',
            itemDescription: product.itemDescription || '',
            category: product.category || 'Importados',
            sku: product.sku || '',
            gtin: product.gtin || '',
            ncm: product.ncm || '',
            vendorId: vendor?.id
          };

          // Adicionar produto ao banco de dados
          await addProduct(productData);
          successCount++;
        } catch (error) {
          console.error(`Erro ao adicionar produto ${product.description}:`, error);
          errorCount++;
        }
      }

      if (errorCount > 0) {
        alert(`${successCount} produtos exportados para o PDV com sucesso!\n${errorCount} produtos não puderam ser adicionados. Verifique o console para mais detalhes.`);
      } else {
        alert(`${successCount} produtos exportados para o PDV com sucesso!`);
      }

      onClose();
    } catch (error) {
      console.error('Erro ao exportar produtos para o PDV:', error);
      alert('Erro ao exportar produtos para o PDV. Verifique o console para mais detalhes.');
    }
  };

  const handleExportToWordPress = async () => {
    try {
      const selectedProductsList = importType === 'manual'
        ? products.filter(product => selectedProducts[product.id])
        : importedProducts;

      if (selectedProductsList.length === 0) {
        alert('Selecione pelo menos um produto para exportar para o WordPress');
        return;
      }

      await syncProductsToWordPress(selectedProductsList);
      alert(`${selectedProductsList.length} produtos exportados para o WordPress com sucesso!`);
    } catch (error) {
      console.error('Erro ao exportar para WordPress:', error);
      alert('Erro ao exportar produtos para o WordPress. Verifique o console para mais detalhes.');
    }
  };

  // Filter products based on category and search query
  const filteredProducts = products.filter(product => {
    const categoryMatch = selectedCategory === 'Todos' || product.category === selectedCategory;
    const searchMatch = !searchQuery ||
      (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (product.itemDescription && product.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()));

    return categoryMatch && searchMatch;
  });

  const selectedCount = Object.values(selectedProducts).filter(Boolean).length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Importar Catálogo para ${vendor?.name || 'Fornecedor'}`}
      size="4xl"
    >
      <div className="space-y-4">
        {/* Informações do Fornecedor */}
        <div className="bg-gray-50 p-4 rounded-lg mb-4">
          <h4 className="text-lg font-medium mb-2">Informações do Fornecedor</h4>
          <p><span className="font-medium">Nome:</span> {vendor?.name}</p>
          {vendor?.description && (
            <p><span className="font-medium">Descrição:</span> {vendor.description}</p>
          )}
        </div>

        {/* Opções de importação */}
        <div className="flex space-x-4 border-b pb-4">
          <button
            onClick={() => setImportType('manual')}
            className={`px-4 py-2 rounded-md ${
              importType === 'manual'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Selecionar Produtos Existentes
          </button>
          <button
            onClick={() => setImportType('file')}
            className={`px-4 py-2 rounded-md ${
              importType === 'file'
                ? 'bg-primary text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Importar de Arquivo
          </button>
        </div>

        {/* Conteúdo baseado no tipo de importação */}
        {importType === 'manual' ? (
          <>
            <div className="p-4 border-b">
              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="Buscar produtos..."
                    className="w-full px-3 py-2 border rounded-md"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    Selecionar Todos
                  </button>
                  <button
                    onClick={handleDeselectAll}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Limpar Seleção
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 rounded-full text-sm ${
                      selectedCategory === category
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto max-h-[400px]">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum produto encontrado.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {filteredProducts.map((product) => (
                    <div
                      key={product.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                        selectedProducts[product.id] ? 'border-primary bg-primary bg-opacity-5' : 'hover:border-gray-300'
                      }`}
                      onClick={() => toggleProductSelection(product.id)}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0">
                          <input
                            type="checkbox"
                            checked={!!selectedProducts[product.id]}
                            onChange={() => {}} // Controlled component
                            className="h-5 w-5 text-primary"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            {product.image && (
                              <img
                                src={product.image}
                                alt={product.description}
                                className="w-12 h-12 object-contain rounded"
                              />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-900 truncate">{product.description}</h3>
                              <p className="text-sm text-gray-500">
                                Preço: R$ {product.price} | Estoque: {product.quantity}
                              </p>
                              <p className="text-xs text-gray-400">
                                Categoria: {product.category || "Sem categoria"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="p-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Importar Catálogo de Produtos</h3>
              <p className="text-gray-500 mb-4">
                Arraste e solte um arquivo CSV ou XML, ou clique para selecionar um arquivo.
                <br />
                <span className="text-sm">Formatos suportados: CSV, XML</span>
              </p>
              <button
                onClick={handleImportFile}
                className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition-colors"
              >
                Selecionar Arquivo
              </button>

              {fileImportStatus && (
                <div className={`mt-4 p-3 rounded ${fileImportStatus.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {fileImportStatus}
                </div>
              )}

              {importedProducts.length > 0 && (
                <div className="mt-6 text-left">
                  <h4 className="font-medium text-gray-900 mb-2">Produtos Importados ({importedProducts.length})</h4>
                  <div className="max-h-[200px] overflow-y-auto border rounded">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estoque</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoria</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">GTIN</th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NCM</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {importedProducts.map((product, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R$ {product.price}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.quantity}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.category}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.sku || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.gtin || '-'}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.ncm || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="p-4 border-t bg-gray-50 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {importType === 'manual'
              ? `${selectedCount} produto(s) selecionado(s)`
              : `${importedProducts.length} produto(s) importado(s)`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
            <button
              onClick={handleExportToPDV}
              disabled={(importType === 'manual' && selectedCount === 0) || (importType === 'file' && importedProducts.length === 0)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar para PDV
            </button>
            <button
              onClick={handleExportToWordPress}
              disabled={(importType === 'manual' && selectedCount === 0) || (importType === 'file' && importedProducts.length === 0)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Exportar para WordPress
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default CatalogImporter;
