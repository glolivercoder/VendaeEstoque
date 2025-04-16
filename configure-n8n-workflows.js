/**
 * Script para configurar workflows no n8n para integração PDV Vendas - WooCommerce
 * Este script usa a API do n8n para criar workflows e credenciais
 */
const axios = require('axios');

// Configuração
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJiOWU2YWNlYi00NTE0LTQxMjktOWM0My04ZGY4ZjIzMTkyZTkiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQzMjA0MDM5fQ._3oUdJcOh3IVST1XXtu-enlcxiChCTE5hNcGptxEsJE';
const N8N_BASE_URL = 'http://localhost:5679';

// Credenciais do WooCommerce
const WOOCOMMERCE_URL = 'https://achadinhoshopp.com.br/loja';
const WOOCOMMERCE_CONSUMER_KEY = 'ck_a117i65gmQYOokVzyA8QRLSw';
const WOOCOMMERCE_CONSUMER_SECRET = 'cs_a117i65gmQYOokVzyA8QRLSw';

// Credenciais do WordPress
const WORDPRESS_USERNAME = 'glolivercoder';
const WORDPRESS_EMAIL = 'glolivercoder@gmail.com';

// Criar cliente API
const n8nApi = axios.create({
  baseURL: N8N_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${N8N_API_KEY}`
  }
});

/**
 * Criar uma tag no n8n
 * @param {string} name - Nome da tag
 * @returns {Promise<object>} - Tag criada
 */
async function createTag(name) {
  try {
    console.log(`Criando tag: ${name}`);
    const response = await n8nApi.post('/api/v1/tags', { name });
    console.log(`Tag criada: ${name}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log(`Tag já existe: ${name}`);
      // Obter tag existente
      const tagsResponse = await n8nApi.get('/api/v1/tags');
      const existingTag = tagsResponse.data.data.find(tag => tag.name === name);
      return existingTag;
    }
    console.error(`Erro ao criar tag ${name}:`, error.message);
    throw error;
  }
}

/**
 * Criar credencial no n8n
 * @param {object} credential - Dados da credencial
 * @returns {Promise<object>} - Credencial criada
 */
async function createCredential(credential) {
  try {
    console.log(`Criando credencial: ${credential.name}`);
    const response = await n8nApi.post('/api/v1/credentials', credential);
    console.log(`Credencial criada: ${credential.name}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log(`Credencial já existe: ${credential.name}`);
      // Obter credencial existente
      const credentialsResponse = await n8nApi.get('/api/v1/credentials');
      const existingCredential = credentialsResponse.data.data.find(cred => cred.name === credential.name);
      return existingCredential;
    }
    console.error(`Erro ao criar credencial ${credential.name}:`, error.message);
    throw error;
  }
}

/**
 * Criar workflow no n8n
 * @param {object} workflow - Dados do workflow
 * @returns {Promise<object>} - Workflow criado
 */
async function createWorkflow(workflow) {
  try {
    console.log(`Criando workflow: ${workflow.name}`);
    const response = await n8nApi.post('/api/v1/workflows', workflow);
    console.log(`Workflow criado: ${workflow.name}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 409) {
      console.log(`Workflow já existe: ${workflow.name}`);
      // Obter workflow existente
      const workflowsResponse = await n8nApi.get('/api/v1/workflows');
      const existingWorkflow = workflowsResponse.data.data.find(wf => wf.name === workflow.name);
      return existingWorkflow;
    }
    console.error(`Erro ao criar workflow ${workflow.name}:`, error.message);
    throw error;
  }
}

/**
 * Ativar workflow no n8n
 * @param {string} workflowId - ID do workflow
 * @returns {Promise<object>} - Resultado da ativação
 */
async function activateWorkflow(workflowId) {
  try {
    console.log(`Ativando workflow: ${workflowId}`);
    const response = await n8nApi.post(`/api/v1/workflows/${workflowId}/activate`);
    console.log(`Workflow ativado: ${workflowId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao ativar workflow ${workflowId}:`, error.message);
    throw error;
  }
}

/**
 * Função principal para criar todos os recursos necessários
 */
async function main() {
  try {
    console.log('Iniciando configuração dos workflows no n8n...');

    // Criar tags
    const pdvVendasTag = await createTag('PDV Vendas');
    const wooCommerceTag = await createTag('WooCommerce');
    const integrationTag = await createTag('Integração');

    // Criar credenciais
    // 1. Credenciais do WooCommerce
    const wooCommerceCredential = await createCredential({
      name: 'WooCommerce Achadinho',
      type: 'wooCommerceApi',
      data: {
        url: WOOCOMMERCE_URL,
        consumerKey: WOOCOMMERCE_CONSUMER_KEY,
        consumerSecret: WOOCOMMERCE_CONSUMER_SECRET
      }
    });

    // 2. Credenciais do WordPress
    const wordPressCredential = await createCredential({
      name: 'WordPress Achadinho',
      type: 'wordpressApi',
      data: {
        url: `${WOOCOMMERCE_URL}/wp-json`,
        username: WORDPRESS_USERNAME,
        password: 'senha_do_wordpress' // Substitua pela senha real
      }
    });

    // Criar workflows
    // 1. Workflow de Sincronização de Produtos
    const productSyncWorkflow = await createWorkflow({
      name: 'PDV Vendas - Sincronização de Produtos',
      active: false,
      tags: [
        { id: pdvVendasTag.id },
        { id: wooCommerceTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "pdv-vendas/produtos",
            "options": {
              "responseMode": "lastNode"
            }
          },
          "name": "Webhook",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [
            250,
            300
          ]
        },
        {
          "parameters": {
            "functionCode": "// Processar dados do produto\nconst data = $input.json;\n\n// Verificar se é um único produto ou uma lista\nconst produtos = Array.isArray(data) ? data : [data];\nconst processedProducts = [];\n\nfor (const produto of produtos) {\n  const processedProduct = {\n    name: produto.nome,\n    type: \"simple\",\n    regular_price: produto.preco.toString(),\n    description: produto.descricao || \"\",\n    short_description: produto.descricao_curta || \"\",\n    categories: produto.categorias ? produto.categorias.map(cat => ({id: cat.id})) : [],\n    images: [],\n    sku: produto.codigo || \"\",\n    stock_quantity: produto.estoque || 0,\n    manage_stock: true,\n    status: \"publish\",\n    meta_data: [\n      {\n        key: \"_pdv_vendas_product\",\n        value: \"true\"\n      },\n      {\n        key: \"_pdv_vendas_id\",\n        value: produto.id.toString()\n      }\n    ]\n  };\n  \n  // Processar imagens\n  if (produto.imagens && Array.isArray(produto.imagens)) {\n    for (const imagem of produto.imagens) {\n      processedProduct.images.push({\n        src: imagem.url,\n        name: imagem.nome || `Produto ${produto.nome}`,\n        alt: imagem.alt || `Produto ${produto.nome}`\n      });\n    }\n  }\n  \n  processedProducts.push(processedProduct);\n}\n\nreturn { produtos: processedProducts };"
          },
          "name": "Process Product Data",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [
            450,
            300
          ]
        },
        {
          "parameters": {
            "functionCode": "// Processar imagens\nconst produtos = $input.json.produtos;\nconst processedProducts = [];\n\nfor (const produto of produtos) {\n  // Verificar se as imagens são URLs válidas\n  if (produto.images && produto.images.length > 0) {\n    const validImages = [];\n    \n    for (const image of produto.images) {\n      // Verificar se a URL da imagem é válida\n      if (image.src && image.src.startsWith('http')) {\n        validImages.push(image);\n      } else {\n        // Adicionar uma imagem padrão se a URL não for válida\n        validImages.push({\n          src: \"https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png\",\n          name: image.name,\n          alt: image.alt\n        });\n      }\n    }\n    \n    produto.images = validImages;\n  }\n  \n  processedProducts.push(produto);\n}\n\nreturn { produtos: processedProducts };"
          },
          "name": "Process Images",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [
            650,
            300
          ]
        },
        {
          "parameters": {
            "batchSize": 1,
            "options": {
              "reset": true
            },
            "batches": {
              "batch": "={{ $json.produtos }}"
            }
          },
          "name": "Split In Batches",
          "type": "n8n-nodes-base.splitInBatches",
          "typeVersion": 2,
          "position": [
            850,
            300
          ]
        },
        {
          "parameters": {
            "authentication": "credentials",
            "operation": "upsert",
            "resource": "product",
            "lookupField": "sku",
            "lookupValue": "={{ $json.sku }}",
            "options": {},
            "updateFields": {
              "name": "={{ $json.name }}",
              "type": "={{ $json.type }}",
              "regular_price": "={{ $json.regular_price }}",
              "description": "={{ $json.description }}",
              "short_description": "={{ $json.short_description }}",
              "categories": "={{ $json.categories }}",
              "images": "={{ $json.images }}",
              "stock_quantity": "={{ $json.stock_quantity }}",
              "manage_stock": "={{ $json.manage_stock }}",
              "status": "={{ $json.status }}",
              "meta_data": "={{ $json.meta_data }}"
            }
          },
          "name": "WooCommerce",
          "type": "n8n-nodes-base.wooCommerce",
          "typeVersion": 1,
          "position": [
            1050,
            300
          ],
          "credentials": {
            "wooCommerceApi": {
              "id": "{{ wooCommerceCredential.id }}",
              "name": "WooCommerce Achadinho"
            }
          }
        }
      ],
      "connections": {
        "Webhook": {
          "main": [
            [
              {
                "node": "Process Product Data",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Process Product Data": {
          "main": [
            [
              {
                "node": "Process Images",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Process Images": {
          "main": [
            [
              {
                "node": "Split In Batches",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Split In Batches": {
          "main": [
            [
              {
                "node": "WooCommerce",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      }
    });

    // 2. Workflow de Sincronização de Estoque (PDV Vendas → WooCommerce)
    const inventorySyncPdvToWooWorkflow = await createWorkflow({
      name: 'PDV Vendas - Sincronização de Estoque (PDV → WooCommerce)',
      active: false,
      tags: [
        { id: pdvVendasTag.id },
        { id: wooCommerceTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "pdv-vendas/estoque",
            "options": {
              "responseMode": "lastNode"
            }
          },
          "name": "Webhook",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [
            250,
            300
          ]
        },
        {
          "parameters": {
            "functionCode": "// Processar dados do estoque do PDV Vendas\nconst data = $input.json;\n\n// Verificar se temos o ID do produto\nif (!data.produto_id) {\n  return { success: false, message: \"ID do produto não fornecido\" };\n}\n\nreturn {\n  sku: data.produto_id.toString(),\n  stock_quantity: data.estoque\n};"
          },
          "name": "Process PDV Stock Data",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [
            450,
            300
          ]
        },
        {
          "parameters": {
            "authentication": "credentials",
            "operation": "get",
            "resource": "product",
            "limit": 1,
            "filters": {
              "sku": "={{ $json.sku }}"
            }
          },
          "name": "Find WooCommerce Product",
          "type": "n8n-nodes-base.wooCommerce",
          "typeVersion": 1,
          "position": [
            650,
            300
          ],
          "credentials": {
            "wooCommerceApi": {
              "id": "{{ wooCommerceCredential.id }}",
              "name": "WooCommerce Achadinho"
            }
          }
        },
        {
          "parameters": {
            "authentication": "credentials",
            "operation": "update",
            "resource": "product",
            "productId": "={{ $json.id }}",
            "updateFields": {
              "stock_quantity": "={{ $node[\"Process PDV Stock Data\"].json.stock_quantity }}"
            }
          },
          "name": "Update WooCommerce Stock",
          "type": "n8n-nodes-base.wooCommerce",
          "typeVersion": 1,
          "position": [
            850,
            300
          ],
          "credentials": {
            "wooCommerceApi": {
              "id": "{{ wooCommerceCredential.id }}",
              "name": "WooCommerce Achadinho"
            }
          }
        }
      ],
      "connections": {
        "Webhook": {
          "main": [
            [
              {
                "node": "Process PDV Stock Data",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Process PDV Stock Data": {
          "main": [
            [
              {
                "node": "Find WooCommerce Product",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Find WooCommerce Product": {
          "main": [
            [
              {
                "node": "Update WooCommerce Stock",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      }
    });

    // 3. Workflow de Sincronização de Estoque (WooCommerce → PDV Vendas)
    const inventorySyncWooToPdvWorkflow = await createWorkflow({
      name: 'PDV Vendas - Sincronização de Estoque (WooCommerce → PDV)',
      active: false,
      tags: [
        { id: pdvVendasTag.id },
        { id: wooCommerceTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "woocommerce/estoque",
            "options": {
              "responseMode": "lastNode"
            }
          },
          "name": "Webhook",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [
            250,
            300
          ]
        },
        {
          "parameters": {
            "functionCode": "// Processar dados do estoque\nconst data = $input.json;\n\n// Verificar se é um produto do PDV Vendas\nif (!data.meta_data || !data.meta_data.find(meta => meta.key === \"_pdv_vendas_product\" && meta.value === \"true\")) {\n  return { success: false, message: \"Não é um produto do PDV Vendas\" };\n}\n\nconst pdvVendasId = data.meta_data.find(meta => meta.key === \"_pdv_vendas_id\");\nconst productId = pdvVendasId ? pdvVendasId.value : data.sku;\nconst newStock = data.stock_quantity;\n\nreturn {\n  produto_id: productId,\n  estoque: newStock\n};"
          },
          "name": "Process Stock Data",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [
            450,
            300
          ]
        },
        {
          "parameters": {
            "url": "=http://localhost:3000/api/estoque/atualizar",
            "method": "POST",
            "sendBody": true,
            "bodyParameters": {
              "parameters": [
                {
                  "name": "produto_id",
                  "value": "={{ $json.produto_id }}"
                },
                {
                  "name": "estoque",
                  "value": "={{ $json.estoque }}"
                }
              ]
            }
          },
          "name": "Update PDV Vendas Stock",
          "type": "n8n-nodes-base.httpRequest",
          "typeVersion": 3,
          "position": [
            650,
            300
          ]
        }
      ],
      "connections": {
        "Webhook": {
          "main": [
            [
              {
                "node": "Process Stock Data",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Process Stock Data": {
          "main": [
            [
              {
                "node": "Update PDV Vendas Stock",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      }
    });

    // 4. Workflow de IA Manager
    const aiManagerWorkflow = await createWorkflow({
      name: 'PDV Vendas - IA Manager',
      active: false,
      tags: [
        { id: pdvVendasTag.id },
        { id: integrationTag.id }
      ],
      nodes: [
        {
          "parameters": {
            "httpMethod": "POST",
            "path": "pdv-vendas/ai-manager",
            "options": {
              "responseMode": "lastNode"
            }
          },
          "name": "Webhook",
          "type": "n8n-nodes-base.webhook",
          "typeVersion": 1,
          "position": [
            250,
            300
          ]
        },
        {
          "parameters": {
            "authentication": "apiKey",
            "operation": "completion",
            "model": "gemini-1.5-flash",
            "prompt": "=Você é um assistente especializado em gerenciar a integração entre PDV Vendas e WooCommerce. Sua função é analisar dados, identificar problemas e sugerir soluções.\n\n{{ $json.message }}"
          },
          "name": "Gemini AI",
          "type": "n8n-nodes-base.googleAi",
          "typeVersion": 1,
          "position": [
            450,
            300
          ],
          "credentials": {
            "googleAiApi": {
              "id": "1",
              "name": "Google AI account"
            }
          }
        },
        {
          "parameters": {
            "functionCode": "// Formatar resposta da IA\nconst aiResponse = $input.json;\n\nreturn {\n  success: true,\n  message: \"IA processou a solicitação com sucesso\",\n  ai_response: aiResponse.text || aiResponse.content || aiResponse.choices?.[0]?.message?.content || \"Não foi possível obter uma resposta da IA\",\n  timestamp: new Date().toISOString()\n};"
          },
          "name": "Format AI Response",
          "type": "n8n-nodes-base.function",
          "typeVersion": 1,
          "position": [
            650,
            300
          ]
        }
      ],
      "connections": {
        "Webhook": {
          "main": [
            [
              {
                "node": "Gemini AI",
                "type": "main",
                "index": 0
              }
            ]
          ]
        },
        "Gemini AI": {
          "main": [
            [
              {
                "node": "Format AI Response",
                "type": "main",
                "index": 0
              }
            ]
          ]
        }
      }
    });

    // Ativar workflows
    await activateWorkflow(productSyncWorkflow.id);
    await activateWorkflow(inventorySyncPdvToWooWorkflow.id);
    await activateWorkflow(inventorySyncWooToPdvWorkflow.id);
    await activateWorkflow(aiManagerWorkflow.id);

    console.log('Todos os workflows foram criados e ativados com sucesso!');
    
    // Imprimir URLs dos webhooks
    console.log('\nURLs dos Webhooks:');
    console.log(`Sincronização de Produtos: ${N8N_BASE_URL}/webhook/pdv-vendas/produtos`);
    console.log(`Sincronização de Estoque (PDV → WooCommerce): ${N8N_BASE_URL}/webhook/pdv-vendas/estoque`);
    console.log(`Sincronização de Estoque (WooCommerce → PDV): ${N8N_BASE_URL}/webhook/woocommerce/estoque`);
    console.log(`IA Manager: ${N8N_BASE_URL}/webhook/pdv-vendas/ai-manager`);
    
  } catch (error) {
    console.error('Erro ao criar recursos no n8n:', error);
  }
}

// Executar função principal
main();
