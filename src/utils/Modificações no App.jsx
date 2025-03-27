
// Adicione esta linha no topo do arquivo, com as outras importações
import './styles/SalesReport.css';

// Adicionalmente, certifique-se de que o botão está implementado corretamente
// Por exemplo, substitua o botão "Relatório de Vendas" existente por:

<button 
  className="btn-report" 
  onClick={() => {
    console.log("Abrindo relatório de vendas");
    setShowSalesReport(true);
  }}
  style={{
    backgroundColor: '#4CAF50',
    color: 'white',
    fontWeight: 'bold',
    padding: '10px 20px',
    fontSize: '16px',
    borderRadius: '4px',
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
  }}
>
  Relatório de Vendas
</button>

// E certifique-se de que o componente SalesReport está sendo renderizado quando showSalesReport é verdadeiro:
{showSalesReport && (
  <SalesReport 
    showSalesReport={showSalesReport} 
    setShowSalesReport={setShowSalesReport}
    startDate={salesStartDate}
    setStartDate={setSalesStartDate}
    endDate={salesEndDate}
    setEndDate={setSalesEndDate}
    searchQuery={salesSearchQuery}
    setSearchQuery={setSalesSearchQuery}
  />
)}
