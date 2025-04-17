// Script para executar os testes do PDV Vendas
import { runSalesTests, runDateTests, runReportTests } from './utils/testRunner';

// Função principal para executar todos os testes
const runAllTests = async () => {
  console.log('=== INICIANDO TESTES DO PDV VENDAS ===');
  console.log('Data e hora: ' + new Date().toLocaleString());
  console.log('=======================================\n');

  try {
    // Executar teste de vendas
    console.log('\n=== TESTE DE VENDAS ===');
    const salesTestResult = await runSalesTests();
    console.log('Resultado do teste de vendas:', salesTestResult ? 'OK' : 'FALHA');

    // Executar teste de datas
    console.log('\n=== TESTE DE DATAS ===');
    const dateTestResult = await runDateTests();
    console.log('Resultado do teste de datas:', dateTestResult.success ? 'OK' : 'FALHA');
    if (!dateTestResult.success) {
      console.error('Erro:', dateTestResult.error);
    }

    // Executar teste de relatórios
    console.log('\n=== TESTE DE RELATÓRIOS ===');
    const reportTestResult = await runReportTests();
    console.log('Resultado do teste de relatórios:', reportTestResult.success ? 'OK' : 'FALHA');
    if (!reportTestResult.success) {
      console.error('Erro:', reportTestResult.error);
    }

    console.log('\n=== RESUMO DOS TESTES ===');
    console.log('Teste de Vendas:', salesTestResult ? 'PASSOU' : 'FALHOU');
    console.log('Teste de Datas:', dateTestResult.success ? 'PASSOU' : 'FALHOU');
    console.log('Teste de Relatórios:', reportTestResult.success ? 'PASSOU' : 'FALHOU');

    console.log('\n=== TESTES CONCLUÍDOS ===');
    console.log('Data e hora: ' + new Date().toLocaleString());
    console.log('==========================');
  } catch (error) {
    console.error('Erro ao executar testes:', error);
  }
};

// Executar os testes
runAllTests();

// Exportar a função para uso em outros arquivos
export default runAllTests;
