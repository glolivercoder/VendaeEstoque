import React from 'react';

const SimpleSalesReport = ({
  showSimpleSalesReport,
  setShowSimpleSalesReport,
  clientSearchTerm,
  setClientSearchTerm,
  productSearchTerm,
  setProductSearchTerm,
  getCurrentDateISO,
  salesData,
  formatDateToBrazilian
}) => {
  return (
    showSimpleSalesReport && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-auto py-10">
        <div className="bg-white p-6 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Relatório de Vendas</h2>
            <button
              onClick={() => setShowSimpleSalesReport(false)}
              className="p-1 hover:bg-gray-200 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <input
                type="text"
                value={clientSearchTerm}
                onChange={(e) => setClientSearchTerm(e.target.value)}
                placeholder="Filtrar por cliente"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Produto</label>
              <input
                type="text"
                value={productSearchTerm}
                onChange={(e) => setProductSearchTerm(e.target.value)}
                placeholder="Filtrar por produto"
                className="w-full p-2 border rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data</label>
              <input
                type="date"
                value={getCurrentDateISO()}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {/* Tabela de vendas */}
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 border-b text-left">Data</th>
                  <th className="py-2 px-4 border-b text-left">Cliente</th>
                  <th className="py-2 px-4 border-b text-left">Produto</th>
                  <th className="py-2 px-4 border-b text-left">Quantidade</th>
                  <th className="py-2 px-4 border-b text-left">Valor Unit.</th>
                  <th className="py-2 px-4 border-b text-left">Total</th>
                  <th className="py-2 px-4 border-b text-left">Pagamento</th>
                </tr>
              </thead>
              <tbody>
                {salesData
                  .filter(sale => {
                    // Filtrar por cliente
                    if (clientSearchTerm && !sale.client.toLowerCase().includes(clientSearchTerm.toLowerCase())) {
                      return false;
                    }

                    // Filtrar por produto
                    if (productSearchTerm) {
                      const hasMatchingProduct = sale.items.some(item =>
                        item.description.toLowerCase().includes(productSearchTerm.toLowerCase())
                      );
                      if (!hasMatchingProduct) return false;
                    }

                    return true;
                  })
                  .sort((a, b) => new Date(b.date) - new Date(a.date))
                  .map((sale, index) => (
                    <React.Fragment key={index}>
                      {sale.items.map((item, itemIndex) => {
                        // Filtrar por produto no nível do item
                        if (productSearchTerm && !item.description.toLowerCase().includes(productSearchTerm.toLowerCase())) {
                          return null;
                        }

                        return (
                          <tr key={`${index}-${itemIndex}`} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">{formatDateToBrazilian(sale.date)}</td>
                            <td className="py-2 px-4 border-b">{sale.client}</td>
                            <td className="py-2 px-4 border-b">{item.description}</td>
                            <td className="py-2 px-4 border-b">{item.quantity}</td>
                            <td className="py-2 px-4 border-b">R$ {item.price}</td>
                            <td className="py-2 px-4 border-b">R$ {(item.quantity * item.price).toFixed(2)}</td>
                            <td className="py-2 px-4 border-b">{sale.paymentMethod}</td>
                          </tr>
                        );
                      }).filter(Boolean)}
                    </React.Fragment>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Totais */}
          <div className="mt-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-end">
              <div className="text-right">
                <p className="text-sm text-gray-600 font-semibold">Total de Itens: <span className="font-bold">
                  {salesData.reduce((total, sale) => {
                    return total + sale.items.reduce((itemTotal, item) => itemTotal + item.quantity, 0);
                  }, 0)}
                </span></p>
                <p className="text-sm text-gray-600 font-semibold">Valor Total: <span className="font-bold">
                  R$ {salesData.reduce((total, sale) => {
                    return total + sale.items.reduce((itemTotal, item) => itemTotal + (item.quantity * item.price), 0);
                  }, 0).toFixed(2)}
                </span></p>
              </div>
            </div>
          </div>

          {/* Botões de ação */}
          <div className="flex justify-end mt-6 gap-4">
            <button
              onClick={() => setShowSimpleSalesReport(false)}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Fechar
            </button>
            <button
              onClick={() => {
                // Lógica para exportar o relatório
                alert('Exportação de relatório será implementada em breve!');
              }}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Exportar
            </button>
          </div>
        </div>
      </div>
    )
  );
};

export default SimpleSalesReport;
