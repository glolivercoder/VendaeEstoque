// Script para executar os testes do PDV Vendas no terminal (versão CommonJS)
// Execute com: node run-tests.cjs

// Importar módulos necessários
require('@babel/register')({
  presets: ['@babel/preset-env', '@babel/preset-react'],
  plugins: ['@babel/plugin-transform-runtime']
});

// Importar funções de teste
const testRunner = require('./src/utils/testRunner');
const { runSalesTests, runDateTests, runReportTests } = testRunner;

// Função principal para executar todos os testes
const runAllTests = async () => {
  console.log('\x1b[36m%s\x1b[0m', '=== INICIANDO TESTES DO PDV VENDAS ===');
  console.log('\x1b[36m%s\x1b[0m', 'Data e hora: ' + new Date().toLocaleString());
  console.log('\x1b[36m%s\x1b[0m', '=======================================\n');

  try {
    // Executar teste de vendas
    console.log('\n\x1b[33m%s\x1b[0m', '=== TESTE DE VENDAS ===');
    const salesTestResult = await runSalesTests();
    console.log('\x1b[33m%s\x1b[0m', 'Resultado do teste de vendas:', salesTestResult ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFALHA\x1b[0m');

    // Executar teste de datas
    console.log('\n\x1b[33m%s\x1b[0m', '=== TESTE DE DATAS ===');
    const dateTestResult = await runDateTests();
    console.log('\x1b[33m%s\x1b[0m', 'Resultado do teste de datas:', dateTestResult.success ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFALHA\x1b[0m');
    if (!dateTestResult.success) {
      console.error('\x1b[31m%s\x1b[0m', 'Erro:', dateTestResult.error);
    }

    // Executar teste de relatórios
    console.log('\n\x1b[33m%s\x1b[0m', '=== TESTE DE RELATÓRIOS ===');
    const reportTestResult = await runReportTests();
    console.log('\x1b[33m%s\x1b[0m', 'Resultado do teste de relatórios:', reportTestResult.success ? '\x1b[32mOK\x1b[0m' : '\x1b[31mFALHA\x1b[0m');
    if (!reportTestResult.success) {
      console.error('\x1b[31m%s\x1b[0m', 'Erro:', reportTestResult.error);
    }

    console.log('\n\x1b[36m%s\x1b[0m', '=== RESUMO DOS TESTES ===');
    console.log('\x1b[36m%s\x1b[0m', 'Teste de Vendas:', salesTestResult ? '\x1b[32mPASSOU\x1b[0m' : '\x1b[31mFALHOU\x1b[0m');
    console.log('\x1b[36m%s\x1b[0m', 'Teste de Datas:', dateTestResult.success ? '\x1b[32mPASSOU\x1b[0m' : '\x1b[31mFALHOU\x1b[0m');
    console.log('\x1b[36m%s\x1b[0m', 'Teste de Relatórios:', reportTestResult.success ? '\x1b[32mPASSOU\x1b[0m' : '\x1b[31mFALHOU\x1b[0m');

    console.log('\n\x1b[36m%s\x1b[0m', '=== TESTES CONCLUÍDOS ===');
    console.log('\x1b[36m%s\x1b[0m', 'Data e hora: ' + new Date().toLocaleString());
    console.log('\x1b[36m%s\x1b[0m', '==========================');

    // Retornar código de saída baseado no resultado dos testes
    const allTestsPassed = salesTestResult && dateTestResult.success && reportTestResult.success;
    process.exit(allTestsPassed ? 0 : 1);
  } catch (error) {
    console.error('\x1b[31m%s\x1b[0m', 'Erro ao executar testes:', error);
    process.exit(1);
  }
};

// Executar os testes
runAllTests();
