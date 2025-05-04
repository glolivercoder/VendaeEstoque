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