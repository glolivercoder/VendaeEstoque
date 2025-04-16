/**
 * Script para testar os webhooks do n8n
 */
import axios from 'axios';

// Configuração
const N8N_BASE_URL = 'http://localhost:5679';

// Função para enviar uma requisição para um webhook
async function testWebhook(path, data) {
  try {
    console.log(`Testando webhook: ${path}`);
    console.log(`Dados: ${JSON.stringify(data, null, 2)}`);

    const response = await axios.post(`${N8N_BASE_URL}/webhook/${path}`, data);

    console.log(`Resposta: ${JSON.stringify(response.data, null, 2)}`);
    console.log('Teste concluído com sucesso!');

    return response.data;
  } catch (error) {
    console.error(`Erro ao testar webhook: ${error.message}`);
    if (error.response) {
      console.error('Detalhes do erro:', error.response.data);
    }
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando testes de webhooks...');

    // Testar webhook de sincronização de produtos
    await testWebhook('pdv-vendas/produtos', {
      nome: 'Produto de Teste',
      preco: 99.99,
      descricao: 'Este é um produto de teste para verificar a integração com o WooCommerce.',
      descricao_curta: 'Produto de teste',
      categorias: [{ id: 1 }],
      imagens: [
        {
          url: 'https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png',
          nome: 'Imagem de teste',
          alt: 'Imagem de teste'
        }
      ],
      codigo: 'TESTE123',
      estoque: 10
    });

    // Testar webhook de sincronização de estoque (PDV → WooCommerce)
    await testWebhook('pdv-vendas/estoque', {
      produto_id: 'TESTE123',
      estoque: 5
    });

    // Testar webhook de gerenciamento com IA
    await testWebhook('pdv-vendas/ai-manager', {
      message: 'Qual é o prazo de entrega para o CEP 12345-678?',
      customer_id: 'cliente123'
    });

    // Testar webhook de análise de produtos
    await testWebhook('pdv-vendas/analise-produto', {
      nome: 'Smartphone XYZ',
      descricao: 'Smartphone com 128GB de armazenamento, 6GB de RAM, tela de 6.5 polegadas e câmera de 48MP.',
      preco: 1299.99,
      categorias: ['Eletrônicos', 'Smartphones'],
      imagens: [
        {
          url: 'https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png',
          nome: 'Smartphone XYZ',
          alt: 'Smartphone XYZ - Vista frontal'
        }
      ]
    });

    console.log('Todos os testes concluídos com sucesso!');
  } catch (error) {
    console.error('Erro durante os testes de webhooks:', error);
  }
}

// Executar o script
main();
