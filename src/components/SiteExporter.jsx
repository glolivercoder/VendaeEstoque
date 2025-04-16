import { useState } from 'react';
import { syncProductsToHostinger } from '../services/hostinger';
import { syncProductsToWooCommerce } from '../services/woocommerce-basic';
import WooCommerceMCP from './WooCommerceMCP';

const SiteExporter = ({
  showSiteExporter,
  setShowSiteExporter,
  items,
  hostingerConfig,
  exportType,
  setExportType,
  exportMethod,
  setExportMethod,
  contactInfo,
  setContactInfo,
  showContactForm,
  setShowContactForm,
  editingContact,
  setEditingContact
}) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState(null);

  const handleExportTypeChange = (e) => {
    setExportType(e.target.value);
  };

  const handleExportMethodChange = (e) => {
    setExportMethod(e.target.value);
  };

  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo({ ...contactInfo, [name]: value });
  };

  const handleSaveContactInfo = () => {
    localStorage.setItem('contactInfo', JSON.stringify(contactInfo));
    setShowContactForm(false);
    setEditingContact(false);
  };

  const toggleItemSelection = (itemId) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter(id => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  const selectAllItems = () => {
    if (selectedItems.length === items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(items.map(item => item.id));
    }
  };

  const handleExport = async () => {
    if (exportMethod === 'hostinger' && (!hostingerConfig.site_url || !hostingerConfig.api_key)) {
      alert('Por favor, configure as informações do Hostinger antes de exportar.');
      return;
    }

    const itemsToExport = items.filter(item => selectedItems.includes(item.id));
    if (itemsToExport.length === 0) {
      alert('Por favor, selecione pelo menos um produto para exportar.');
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    try {
      if (exportMethod === 'hostinger') {
        const result = await syncProductsToHostinger(itemsToExport, hostingerConfig);
        setExportResult({
          success: true,
          message: `Exportação concluída com sucesso! ${result.syncedCount} produtos sincronizados.`
        });
      } else if (exportMethod === 'woocommerce') {
        const result = await syncProductsToWooCommerce(itemsToExport);
        setExportResult({
          success: true,
          message: `Exportação para WooCommerce concluída! ${result.created} produtos criados, ${result.updated} atualizados.`
        });
      } else if (exportMethod === 'json') {
        // Export as JSON file
        const jsonData = JSON.stringify(itemsToExport, null, 2);
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'produtos-estoque.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportResult({
          success: true,
          message: `${itemsToExport.length} produtos exportados como JSON com sucesso!`
        });
      } else if (exportMethod === 'csv') {
        // Export as CSV file
        const headers = ['id', 'description', 'price', 'quantity', 'category'];
        const csvContent = [
          headers.join(','),
          ...itemsToExport.map(item => {
            return [
              item.id,
              `"${item.description.replace(/"/g, '""')}"`,
              item.price,
              item.quantity,
              `"${(item.category || '').replace(/"/g, '""')}"`
            ].join(',');
          })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'produtos-estoque.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        setExportResult({
          success: true,
          message: `${itemsToExport.length} produtos exportados como CSV com sucesso!`
        });
      }
    } catch (error) {
      console.error('Erro na exportau00e7u00e3o:', error);
      setExportResult({
        success: false,
        message: `Erro na exportau00e7u00e3o: ${error.message}`
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (!showSiteExporter) return null;

  return (
    <div className="site-exporter-container">
      <div className="exporter-header">
        <h2>Exportar Produtos</h2>
        <button className="btn-close" onClick={() => setShowSiteExporter(false)}>
          Fechar
        </button>
      </div>

      <div className="exporter-options">
        <div className="option-group">
          <h3>Tipo de Exportau00e7u00e3o</h3>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="exportType"
                value="all"
                checked={exportType === 'all'}
                onChange={handleExportTypeChange}
              />
              Todos os Produtos
            </label>
            <label>
              <input
                type="radio"
                name="exportType"
                value="selected"
                checked={exportType === 'selected'}
                onChange={handleExportTypeChange}
              />
              Produtos Selecionados
            </label>
          </div>
        </div>

        <div className="option-group">
          <h3>Mu00e9todo de Exportau00e7u00e3o</h3>
          <div className="radio-options">
            <label>
              <input
                type="radio"
                name="exportMethod"
                value="hostinger"
                checked={exportMethod === 'hostinger'}
                onChange={handleExportMethodChange}
              />
              Hostinger
            </label>
            <label>
              <input
                type="radio"
                name="exportMethod"
                value="woocommerce"
                checked={exportMethod === 'woocommerce'}
                onChange={handleExportMethodChange}
              />
              WooCommerce
            </label>
            <label>
              <input
                type="radio"
                name="exportMethod"
                value="json"
                checked={exportMethod === 'json'}
                onChange={handleExportMethodChange}
              />
              Arquivo JSON
            </label>
            <label>
              <input
                type="radio"
                name="exportMethod"
                value="csv"
                checked={exportMethod === 'csv'}
                onChange={handleExportMethodChange}
              />
              Arquivo CSV
            </label>
          </div>
        </div>

        {(exportMethod === 'hostinger' || exportMethod === 'woocommerce') && (
          <div className="contact-info">
            <h3>Informau00e7u00f5es de Contato</h3>
            {showContactForm ? (
              <div className="contact-form">
                <div className="form-group">
                  <label>WhatsApp:</label>
                  <input
                    type="text"
                    name="whatsapp"
                    value={contactInfo.whatsapp}
                    onChange={handleContactInfoChange}
                    placeholder="(00) 00000-0000"
                  />
                </div>
                <div className="form-group">
                  <label>Email:</label>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactInfoChange}
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="form-actions">
                  <button
                    className="btn-cancel"
                    onClick={() => {
                      setShowContactForm(false);
                      setEditingContact(false);
                    }}
                  >
                    Cancelar
                  </button>
                  <button className="btn-save" onClick={handleSaveContactInfo}>
                    Salvar
                  </button>
                </div>
              </div>
            ) : (
              <div className="contact-display">
                {contactInfo.whatsapp || contactInfo.email ? (
                  <>
                    {contactInfo.whatsapp && (
                      <p><strong>WhatsApp:</strong> {contactInfo.whatsapp}</p>
                    )}
                    {contactInfo.email && (
                      <p><strong>Email:</strong> {contactInfo.email}</p>
                    )}
                    <button
                      className="btn-edit-contact"
                      onClick={() => {
                        setShowContactForm(true);
                        setEditingContact(true);
                      }}
                    >
                      Editar
                    </button>
                  </>
                ) : (
                  <button
                    className="btn-add-contact"
                    onClick={() => setShowContactForm(true)}
                  >
                    Adicionar Informau00e7u00f5es de Contato
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="products-selection">
        <div className="selection-header">
          <h3>Selecionar Produtos</h3>
          <button className="btn-select-all" onClick={selectAllItems}>
            {selectedItems.length === items.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
          </button>
        </div>

        <div className="products-grid">
          {items.map((item) => (
            <div
              key={item.id}
              className={`product-card ${selectedItems.includes(item.id) ? 'selected' : ''}`}
              onClick={() => toggleItemSelection(item.id)}
            >
              {item.image && (
                <div className="product-image">
                  <img src={item.image} alt={item.description} />
                </div>
              )}
              <div className="product-info">
                <h4>{item.description}</h4>
                <p className="product-price">R$ {parseFloat(item.price).toFixed(2)}</p>
                <p className="product-quantity">Estoque: {item.quantity}</p>
                {item.category && item.category !== 'Todos' && (
                  <p className="product-category">Categoria: {item.category}</p>
                )}
              </div>
              <div className="selection-indicator">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => {}}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="export-actions">
        <button
          className="btn-export"
          onClick={handleExport}
          disabled={isExporting || selectedItems.length === 0}
        >
          {isExporting ? 'Exportando...' : 'Exportar'}
        </button>
      </div>

      {exportResult && (
        <div className={`export-result ${exportResult.success ? 'success' : 'error'}`}>
          <p>{exportResult.message}</p>
        </div>
      )}

      {exportMethod === 'woocommerce' && (
        <WooCommerceMCP selectedItems={selectedItems} items={items} />
      )}
    </div>
  );
};

export default SiteExporter;
