import { generateTestData } from './testDataGenerator';

export const runSalesTests = async () => {
  console.log('Iniciando testes de vendas...');
  
  try {
    // Gerar dados de teste
    const testData = generateTestData();
    console.log('Dados de teste gerados:', {
      numClients: testData.clients.length,
      numProducts: testData.products.length,
      numVendors: testData.vendors.length,
      numSales: testData.sales.length
    });

    // Verificar datas das vendas
    console.log('\nVerificando datas das vendas:');
    testData.sales.forEach(sale => {
      console.log(`Venda ID ${sale.id}:`, {
        date: sale.date,
        timestamp: new Date(sale.timestamp).toISOString(),
        client: sale.client,
        total: sale.total,
        products: sale.products.map(p => p.description).join(', ')
      });
    });

    // Testar filtragem por período
    const startDate = '01/01/2024';
    const endDate = '31/03/2024';
    console.log('\nTestando filtragem por período:', startDate, 'até', endDate);
    
    const filteredSales = testData.sales.filter(sale => {
      const [saleDay, saleMonth, saleYear] = sale.date.split('/');
      const saleDate = new Date(saleYear, saleMonth - 1, saleDay);
      
      const [startDay, startMonth, startYear] = startDate.split('/');
      const periodStart = new Date(startYear, startMonth - 1, startDay);
      
      const [endDay, endMonth, endYear] = endDate.split('/');
      const periodEnd = new Date(endYear, endMonth - 1, endDay);
      periodEnd.setHours(23, 59, 59, 999);

      return saleDate >= periodStart && saleDate <= periodEnd;
    });

    console.log('Vendas no período:', filteredSales.length);
    filteredSales.forEach(sale => {
      console.log(`- ${sale.date}: ${sale.client} - R$ ${sale.total.toFixed(2)}`);
    });

    return testData;
  } catch (error) {
    console.error('Erro nos testes:', error);
    throw error;
  }
};
