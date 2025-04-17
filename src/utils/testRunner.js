import { generateTestData } from './testDataGenerator';
import { formatDateToBrazilian, formatDateToISO } from './dateUtils';

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

export const runDateTests = async () => {
  console.log('Iniciando testes de formatação de datas...');

  try {
    // Testar conversão de datas
    console.log('\nTestando conversão de datas:');

    const testDates = [
      { iso: '2024-01-15', br: '15/01/2024' },
      { iso: '2024-02-29', br: '29/02/2024' },
      { iso: '2024-12-31', br: '31/12/2024' },
      { iso: '2023-05-01', br: '01/05/2023' },
      { iso: '2022-11-10', br: '10/11/2022' }
    ];

    // Testar ISO para BR
    console.log('\nConversão ISO para BR:');
    testDates.forEach(date => {
      const converted = formatDateToBrazilian(date.iso);
      const isCorrect = converted === date.br;
      console.log(`${date.iso} -> ${converted} ${isCorrect ? '✓' : '✗ (esperado: ' + date.br + ')'}`);
    });

    // Testar BR para ISO
    console.log('\nConversão BR para ISO:');
    testDates.forEach(date => {
      const converted = formatDateToISO(date.br);
      const isCorrect = converted === date.iso;
      console.log(`${date.br} -> ${converted} ${isCorrect ? '✓' : '✗ (esperado: ' + date.iso + ')'}`);
    });

    // Testar datas inválidas
    console.log('\nTestando datas inválidas:');
    const invalidDates = [
      '2024/01/15',  // Formato incorreto
      '32/01/2024',  // Dia inválido
      '15/13/2024',  // Mês inválido
      '',            // String vazia
      null,          // Null
      undefined      // Undefined
    ];

    invalidDates.forEach(date => {
      try {
        const toBr = formatDateToBrazilian(date);
        const toIso = formatDateToISO(date);
        console.log(`Entrada: ${date || 'vazio/null/undefined'} -> BR: ${toBr}, ISO: ${toIso}`);
      } catch (e) {
        console.log(`Entrada: ${date || 'vazio/null/undefined'} -> Erro: ${e.message}`);
      }
    });

    return { success: true, message: 'Testes de datas concluídos' };
  } catch (error) {
    console.error('Erro nos testes de datas:', error);
    return { success: false, error: error.message };
  }
};

export const runReportTests = async () => {
  console.log('Iniciando testes de relatórios...');

  try {
    // Gerar dados de teste
    const testData = generateTestData();

    // Testar agrupamento por método de pagamento
    console.log('\nTestando agrupamento por método de pagamento:');
    const paymentMethods = {};

    testData.sales.forEach(sale => {
      const method = sale.paymentMethod;
      if (!paymentMethods[method]) {
        paymentMethods[method] = {
          count: 0,
          total: 0
        };
      }

      paymentMethods[method].count++;
      paymentMethods[method].total += sale.total;
    });

    Object.entries(paymentMethods).forEach(([method, data]) => {
      console.log(`${method}: ${data.count} vendas, total R$ ${data.total.toFixed(2)}`);
    });

    // Testar agrupamento por data
    console.log('\nTestando agrupamento por data:');
    const salesByDate = {};

    testData.sales.forEach(sale => {
      if (!salesByDate[sale.date]) {
        salesByDate[sale.date] = {
          count: 0,
          total: 0
        };
      }

      salesByDate[sale.date].count++;
      salesByDate[sale.date].total += sale.total;
    });

    Object.entries(salesByDate).forEach(([date, data]) => {
      console.log(`${date}: ${data.count} vendas, total R$ ${data.total.toFixed(2)}`);
    });

    // Testar cálculo de totalizadores
    console.log('\nTestando cálculo de totalizadores:');

    const totalSales = testData.sales.length;
    const totalRevenue = testData.sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalRevenue / totalSales;

    console.log(`Total de vendas: ${totalSales}`);
    console.log(`Receita total: R$ ${totalRevenue.toFixed(2)}`);
    console.log(`Ticket médio: R$ ${averageTicket.toFixed(2)}`);

    return {
      success: true,
      data: {
        paymentMethods,
        salesByDate,
        totalSales,
        totalRevenue,
        averageTicket
      }
    };
  } catch (error) {
    console.error('Erro nos testes de relatórios:', error);
    return { success: false, error: error.message };
  }
};
