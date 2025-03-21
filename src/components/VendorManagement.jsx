import { useState } from 'react';
import { addVendor } from '../services/database';

const VendorManagement = ({ 
  vendors, 
  setVendors, 
  showAddVendor, 
  setShowAddVendor,
  newVendor,
  setNewVendor,
  selectedVendor,
  setSelectedVendor
}) => {
  const [searchVendorQuery, setSearchVendorQuery] = useState('');
  const [filteredVendors, setFilteredVendors] = useState([]);

  const handleVendorInputChange = (e) => {
    const { name, value } = e.target;
    setNewVendor({ ...newVendor, [name]: value });
  };

  const handleAddVendorSubmit = async (e) => {
    e.preventDefault();
    try {
      const vendorId = await addVendor(newVendor);
      const vendorWithId = { ...newVendor, id: vendorId };
      setVendors([...vendors, vendorWithId]);
      setFilteredVendors([...filteredVendors, vendorWithId]);
      setNewVendor({ name: '', document: '' });
      setShowAddVendor(false);
    } catch (error) {
      console.error('Erro ao adicionar fornecedor:', error);
      alert(`Erro ao adicionar fornecedor: ${error.message}`);
    }
  };

  const handleVendorSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchVendorQuery(query);
    if (!query) {
      setFilteredVendors(vendors);
    } else {
      const filtered = vendors.filter(
        vendor =>
          vendor.name.toLowerCase().includes(query) ||
          (vendor.document && vendor.document.includes(query))
      );
      setFilteredVendors(filtered);
    }
  };

  const selectVendor = (vendor) => {
    setSelectedVendor(vendor);
    setSearchVendorQuery('');
    setFilteredVendors([]);
  };

  return (
    <div className="vendor-management">
      {showAddVendor ? (
        <div className="add-vendor-form">
          <h3>Novo Fornecedor</h3>
          <form onSubmit={handleAddVendorSubmit}>
            <div className="form-group">
              <label>Nome:</label>
              <input
                type="text"
                name="name"
                value={newVendor.name}
                onChange={handleVendorInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Documento:</label>
              <input
                type="text"
                name="document"
                value={newVendor.document}
                onChange={handleVendorInputChange}
                required
              />
            </div>
            <div className="form-actions">
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setShowAddVendor(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn-save">
                Salvar
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="vendor-selector">
          <div className="vendor-search">
            <input
              type="text"
              placeholder="Buscar fornecedor..."
              value={searchVendorQuery}
              onChange={handleVendorSearch}
            />
            <button
              className="btn-add-vendor"
              onClick={() => setShowAddVendor(true)}
            >
              Novo Fornecedor
            </button>
          </div>
          {searchVendorQuery && filteredVendors.length > 0 && (
            <div className="vendor-results">
              {filteredVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="vendor-item"
                  onClick={() => selectVendor(vendor)}
                >
                  <p>{vendor.name}</p>
                  <p className="vendor-document">{vendor.document}</p>
                </div>
              ))}
            </div>
          )}
          {selectedVendor && (
            <div className="selected-vendor">
              <h3>Fornecedor Selecionado</h3>
              <p><strong>Nome:</strong> {selectedVendor.name}</p>
              <p><strong>Documento:</strong> {selectedVendor.document}</p>
              <button
                className="btn-change-vendor"
                onClick={() => setSelectedVendor(null)}
              >
                Trocar Fornecedor
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default VendorManagement;
