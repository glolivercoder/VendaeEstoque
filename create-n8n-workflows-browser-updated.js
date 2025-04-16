/**
 * Script para criar workflows no n8n usando a API do navegador
 * Para usar:
 * 1. Abra o n8n no navegador: http://localhost:5679
 * 2. Faça login com as credenciais (admin/admin)
 * 3. Abra o console do navegador (F12)
 * 4. Cole este script no console e pressione Enter
 */

// Configuração
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWZhMGVkYi1iMTk5LTRmOWYtODY1My0yYWJjZTllMzQyY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ0NTAyNjMxfQ.RZB0tGBnAtQcid8R2VaKqOoqW2OsnutBEmNWmCoCAsk';
const N8N_BASE_URL = 'http://localhost:5679';

// Credenciais atualizadas
const WORDPRESS_USERNAME = 'gloliverx';
const WORDPRESS_PASSWORD = 'Juli@3110';

// Função para fazer requisições à API do n8n
async function n8nApiRequest(endpoint, method = 'GET', data = null) {
  const response = await fetch(`${N8N_BASE_URL}/api/v1/${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-N8N-API-KEY': N8N_API_KEY
    },
    body: data ? JSON.stringify(data) : null
  });
  
  return response.json();
}

// Função para criar uma tag
async function createTag(name) {
  console.log(`Criando tag: ${name}`);
  try {
    const response = await n8nApiRequest('tags', 'POST', { name });
    console.log(`Tag criada: ${name}`);
    return response;
  } catch (error) {
    console.error(`Erro ao criar tag ${name}:`, error);
    // Tentar obter a tag existente
    const tags = await n8nApiRequest('tags');
    const existingTag = tags.data.find(tag => tag.name === name);
    if (existingTag) {
      console.log(`Tag já existe: ${name}`);
      return existingTag;
    }
    throw error;
  }
}

// Função para criar uma credencial
async function createCredential(data) {
  console.log(`Criando credencial: ${data.name}`);
  try {
    const response = await n8nApiRequest('credentials', 'POST', data);
    console.log(`Credencial criada: ${data.name}`);
    return response;
  } catch (error) {
    console.error(`Erro ao criar credencial ${data.name}:`, error);
    // Tentar obter a credencial existente
    const credentials = await n8nApiRequest('credentials');
    const existingCredential = credentials.data.find(cred => cred.name === data.name);
    if (existingCredential) {
      console.log(`Credencial já existe: ${data.name}`);
      return existingCredential;
    }
    throw error;
  }
}

// Função para criar um workflow
async function createWorkflow(data) {
  console.log(`Criando workflow: ${data.name}`);
  try {
    const response = await n8nApiRequest('workflows', 'POST', data);
    console.log(`Workflow criado: ${data.name}`);
    return response;
  } catch (error) {
    console.error(`Erro ao criar workflow ${data.name}:`, error);
    throw error;
  }
}

// Função para ativar um workflow
async function activateWorkflow(id) {
  console.log(`Ativando workflow: ${id}`);
  try {
    const response = await n8nApiRequest(`workflows/${id}/activate`, 'POST');
    console.log(`Workflow ativado: ${id}`);
    return response;
  } catch (error) {
    console.error(`Erro ao ativar workflow ${id}:`, error);
    throw error;
  }
}

// Função principal
async function main() {
  try {
    console.log('Iniciando criação de recursos no n8n...');
    
    // Criar tags
    const pdvVendasTag = await createTag('PDV Vendas');
    const wooCommerceTag = await createTag('WooCommerce');
    const integrationTag = await createTag('Integration');
    
    // Criar credenciais
    const wooCommerceCredential = await createCredential({
      name: 'WooCommerce Achadinho',
      type: 'wooCommerceApi',
      data: {
        url: 'https://achadinhoshopp.com.br/loja',
        consumerKey: 'ck_a117i65gmQYOokVzyA8QRLSw',
        consumerSecret: 'cs_a117i65gmQYOokVzyA8QRLSw'
      }
    });
    
    const wordPressCredential = await createCredential({
      name: 'WordPress Achadinho',
      type: 'wordpressApi',
      data: {
        url: 'https://achadinhoshopp.com.br/loja/wp-json',
        username: WORDPRESS_USERNAME,
        password: WORDPRESS_PASSWORD
      }
    });
    
    const pdvVendasCredential = await createCredential({
      name: 'PDV Vendas API',
      type: 'httpBasicAuth',
      data: {
        user: WORDPRESS_USERNAME,
        password: WORDPRESS_PASSWORD
      }
    });
    
    // Criar workflow de sincronização de produtos
    const productSyncWorkflow = await createWorkflow({
      name: 'PDV Vendas - Sincronização de Produtos',
      settings: {},
      tags: [
        { id: pdvVendasTag.id },
        { id: wooCommerceTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'pdv-vendas/produtos',
            options: {
              responseMode: 'lastNode'
            }
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `// Processar dados do produto
const data = $input.json;

// Verificar se é um único produto ou uma lista
const produtos = Array.isArray(data) ? data : [data];
const processedProducts = [];

for (const produto of produtos) {
  const processedProduct = {
    name: produto.nome,
    type: "simple",
    regular_price: produto.preco.toString(),
    description: produto.descricao || "",
    short_description: produto.descricao_curta || "",
    categories: produto.categorias ? produto.categorias.map(cat => ({id: cat.id})) : [],
    images: [],
    sku: produto.codigo || "",
    stock_quantity: produto.estoque || 0,
    manage_stock: true,
    status: "publish",
    meta_data: [
      {
        key: "_pdv_vendas_product",
        value: "true"
      },
      {
        key: "_pdv_vendas_id",
        value: produto.id.toString()
      }
    ]
  };
  
  // Processar imagens
  if (produto.imagens && Array.isArray(produto.imagens)) {
    for (const imagem of produto.imagens) {
      processedProduct.images.push({
        src: imagem.url,
        name: imagem.nome || \`Produto \${produto.nome}\`,
        alt: imagem.alt || \`Produto \${produto.nome}\`
      });
    }
  }
  
  processedProducts.push(processedProduct);
}

return { produtos: processedProducts };`
          },
          name: 'Process Product Data',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [450, 300]
        },
        {
          parameters: {
            functionCode: `// Processar imagens
const produtos = $input.json.produtos;
const processedProducts = [];

for (const produto of produtos) {
  // Verificar se as imagens são URLs válidas
  if (produto.images && produto.images.length > 0) {
    const validImages = [];
    
    for (const image of produto.images) {
      // Verificar se a URL da imagem é válida
      if (image.src && image.src.startsWith('http')) {
        validImages.push(image);
      } else {
        // Adicionar uma imagem padrão se a URL não for válida
        validImages.push({
          src: "https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png",
          name: image.name,
          alt: image.alt
        });
      }
    }
    
    produto.images = validImages;
  }
  
  processedProducts.push(produto);
}

return { produtos: processedProducts };`
          },
          name: 'Process Images',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [650, 300]
        },
        {
          parameters: {
            batchSize: 1,
            options: {
              reset: true
            },
            batches: {
              batch: '={{ $json.produtos }}'
            }
          },
          name: 'Split In Batches',
          type: 'n8n-nodes-base.splitInBatches',
          typeVersion: 2,
          position: [850, 300]
        },
        {
          parameters: {
            authentication: 'credentials',
            operation: 'upsert',
            resource: 'product',
            lookupField: 'sku',
            lookupValue: '={{ $json.sku }}',
            options: {},
            updateFields: {
              name: '={{ $json.name }}',
              type: '={{ $json.type }}',
              regular_price: '={{ $json.regular_price }}',
              description: '={{ $json.description }}',
              short_description: '={{ $json.short_description }}',
              categories: '={{ $json.categories }}',
              images: '={{ $json.images }}',
              stock_quantity: '={{ $json.stock_quantity }}',
              manage_stock: '={{ $json.manage_stock }}',
              status: '={{ $json.status }}',
              meta_data: '={{ $json.meta_data }}'
            }
          },
          name: 'WooCommerce',
          type: 'n8n-nodes-base.wooCommerce',
          typeVersion: 1,
          position: [1050, 300],
          credentials: {
            wooCommerceApi: wooCommerceCredential.id
          }
        }
      ],
      connections: {
        Webhook: {
          main: [
            [
              {
                node: 'Process Product Data',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Process Product Data': {
          main: [
            [
              {
                node: 'Process Images',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Process Images': {
          main: [
            [
              {
                node: 'Split In Batches',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Split In Batches': {
          main: [
            [
              {
                node: 'WooCommerce',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    });
    
    // Criar workflow de sincronização de estoque (WooCommerce → PDV)
    const inventorySyncWooToPdvWorkflow = await createWorkflow({
      name: 'PDV Vendas - Sincronização de Estoque (WooCommerce → PDV)',
      settings: {},
      tags: [
        { id: pdvVendasTag.id },
        { id: wooCommerceTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'woocommerce/estoque',
            options: {
              responseMode: 'lastNode'
            }
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `// Processar dados de estoque do WooCommerce
const data = $input.json;

// Verificar se temos os dados necessários
if (!data.product_id || data.stock_quantity === undefined) {
  return { success: false, message: "Dados de estoque incompletos" };
}

return {
  produto_id: data.product_id,
  estoque: parseInt(data.stock_quantity, 10)
};`
          },
          name: 'Process Stock Data',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [450, 300]
        },
        {
          parameters: {
            url: '=https://api.pdvvendas.com/webhook/atualizar-estoque',
            method: 'POST',
            authentication: 'predefinedCredentialType',
            sendBody: true,
            bodyParameters: {
              parameters: [
                {
                  name: 'produto_id',
                  value: '={{ $json.produto_id }}'
                },
                {
                  name: 'estoque',
                  value: '={{ $json.estoque }}'
                }
              ]
            }
          },
          name: 'Update PDV Vendas Stock',
          type: 'n8n-nodes-base.httpRequest',
          typeVersion: 3,
          position: [650, 300],
          credentials: {
            httpBasicAuth: pdvVendasCredential.id
          }
        }
      ],
      connections: {
        Webhook: {
          main: [
            [
              {
                node: 'Process Stock Data',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Process Stock Data': {
          main: [
            [
              {
                node: 'Update PDV Vendas Stock',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    });
    
    // Criar workflow de sincronização de estoque (PDV → WooCommerce)
    const inventorySyncPdvToWooWorkflow = await createWorkflow({
      name: 'PDV Vendas - Sincronização de Estoque (PDV → WooCommerce)',
      settings: {},
      tags: [
        { id: pdvVendasTag.id },
        { id: wooCommerceTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'pdv-vendas/estoque',
            options: {
              responseMode: 'lastNode'
            }
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `// Processar dados do estoque do PDV Vendas
const data = $input.json;

// Verificar se temos o ID do produto
if (!data.produto_id) {
  return { success: false, message: "ID do produto não fornecido" };
}

return {
  sku: data.produto_id.toString(),
  stock_quantity: data.estoque
};`
          },
          name: 'Process PDV Stock Data',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [450, 300]
        },
        {
          parameters: {
            authentication: 'credentials',
            operation: 'update',
            resource: 'product',
            productId: '={{ $json.sku }}',
            updateFields: {
              stock_quantity: '={{ $json.stock_quantity }}',
              manage_stock: true
            }
          },
          name: 'WooCommerce',
          type: 'n8n-nodes-base.wooCommerce',
          typeVersion: 1,
          position: [650, 300],
          credentials: {
            wooCommerceApi: wooCommerceCredential.id
          }
        }
      ],
      connections: {
        Webhook: {
          main: [
            [
              {
                node: 'Process PDV Stock Data',
                type: 'main',
                index: 0
              }
            ]
          ]
        },
        'Process PDV Stock Data': {
          main: [
            [
              {
                node: 'WooCommerce',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    });
    
    // Criar workflow de gerenciamento com IA
    const aiManagerWorkflow = await createWorkflow({
      name: 'PDV Vendas - IA Manager',
      settings: {},
      tags: [
        { id: pdvVendasTag.id },
        { id: wooCommerceTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          parameters: {
            httpMethod: 'POST',
            path: 'pdv-vendas/ai-manager',
            options: {
              responseMode: 'lastNode'
            }
          },
          name: 'Webhook',
          type: 'n8n-nodes-base.webhook',
          typeVersion: 1,
          position: [250, 300]
        },
        {
          parameters: {
            functionCode: `// Simular resposta da IA (já que não temos credenciais configuradas)
const data = $input.json;

return {
  success: true,
  message: "IA processou a solicitação com sucesso",
  ai_response: \`Resposta simulada da IA para a consulta: \${data.message || "Consulta não fornecida"}\`,
  timestamp: new Date().toISOString()
};`
          },
          name: 'Simulate AI Response',
          type: 'n8n-nodes-base.function',
          typeVersion: 1,
          position: [450, 300]
        }
      ],
      connections: {
        Webhook: {
          main: [
            [
              {
                node: 'Simulate AI Response',
                type: 'main',
                index: 0
              }
            ]
          ]
        }
      }
    });
    
    // Ativar workflows
    await activateWorkflow(productSyncWorkflow.id);
    await activateWorkflow(inventorySyncWooToPdvWorkflow.id);
    await activateWorkflow(inventorySyncPdvToWooWorkflow.id);
    await activateWorkflow(aiManagerWorkflow.id);
    
    console.log('Todos os workflows foram criados e ativados com sucesso!');
    
    // Exibir URLs dos webhooks
    console.log('URLs dos webhooks:');
    console.log(`Sincronização de Produtos: ${N8N_BASE_URL}/webhook/pdv-vendas/produtos`);
    console.log(`Sincronização de Estoque (WooCommerce → PDV): ${N8N_BASE_URL}/webhook/woocommerce/estoque`);
    console.log(`Sincronização de Estoque (PDV → WooCommerce): ${N8N_BASE_URL}/webhook/pdv-vendas/estoque`);
    console.log(`Gerenciamento com IA: ${N8N_BASE_URL}/webhook/pdv-vendas/ai-manager`);
    
    return {
      success: true,
      message: 'Todos os workflows foram criados e ativados com sucesso!',
      webhooks: {
        productSync: `${N8N_BASE_URL}/webhook/pdv-vendas/produtos`,
        inventorySyncWooToPdv: `${N8N_BASE_URL}/webhook/woocommerce/estoque`,
        inventorySyncPdvToWoo: `${N8N_BASE_URL}/webhook/pdv-vendas/estoque`,
        aiManager: `${N8N_BASE_URL}/webhook/pdv-vendas/ai-manager`
      }
    };
  } catch (error) {
    console.error('Erro ao criar recursos no n8n:', error);
    return {
      success: false,
      message: 'Erro ao criar recursos no n8n',
      error: error.message
    };
  }
}

// Executar a função principal
main().then(result => {
  console.log('Resultado final:', result);
}).catch(error => {
  console.error('Erro na execução:', error);
});
