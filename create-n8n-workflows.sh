#!/bin/bash

# API Key do n8n
N8N_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWZhMGVkYi1iMTk5LTRmOWYtODY1My0yYWJjZTllMzQyY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ0NTAyNjMxfQ.RZB0tGBnAtQcid8R2VaKqOoqW2OsnutBEmNWmCoCAsk"

# URL base do n8n
N8N_BASE_URL="http://localhost:5679"

# Headers para as requisições
HEADERS=(
  -H "Content-Type: application/json"
  -H "X-N8N-API-KEY: $N8N_API_KEY"
)

echo "Criando tags..."

# Criar tag PDV Vendas
PDV_VENDAS_TAG=$(curl -s -X POST "$N8N_BASE_URL/api/v1/tags" \
  "${HEADERS[@]}" \
  -d '{"name":"PDV Vendas"}')

echo "Tag PDV Vendas criada: $PDV_VENDAS_TAG"
PDV_VENDAS_TAG_ID=$(echo $PDV_VENDAS_TAG | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "ID da tag PDV Vendas: $PDV_VENDAS_TAG_ID"

# Criar tag WooCommerce
WOOCOMMERCE_TAG=$(curl -s -X POST "$N8N_BASE_URL/api/v1/tags" \
  "${HEADERS[@]}" \
  -d '{"name":"WooCommerce"}')

echo "Tag WooCommerce criada: $WOOCOMMERCE_TAG"
WOOCOMMERCE_TAG_ID=$(echo $WOOCOMMERCE_TAG | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "ID da tag WooCommerce: $WOOCOMMERCE_TAG_ID"

# Criar tag Integration
INTEGRATION_TAG=$(curl -s -X POST "$N8N_BASE_URL/api/v1/tags" \
  "${HEADERS[@]}" \
  -d '{"name":"Integration"}')

echo "Tag Integration criada: $INTEGRATION_TAG"
INTEGRATION_TAG_ID=$(echo $INTEGRATION_TAG | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "ID da tag Integration: $INTEGRATION_TAG_ID"

echo "Criando credenciais..."

# Criar credencial WooCommerce
WOOCOMMERCE_CREDENTIAL=$(curl -s -X POST "$N8N_BASE_URL/api/v1/credentials" \
  "${HEADERS[@]}" \
  -d '{
    "name": "WooCommerce Achadinho",
    "type": "wooCommerceApi",
    "data": {
      "url": "https://achadinhoshopp.com.br/loja",
      "consumerKey": "ck_a117i65gmQYOokVzyA8QRLSw",
      "consumerSecret": "cs_a117i65gmQYOokVzyA8QRLSw"
    }
  }')

echo "Credencial WooCommerce criada: $WOOCOMMERCE_CREDENTIAL"
WOOCOMMERCE_CREDENTIAL_ID=$(echo $WOOCOMMERCE_CREDENTIAL | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "ID da credencial WooCommerce: $WOOCOMMERCE_CREDENTIAL_ID"

# Criar credencial WordPress
WORDPRESS_CREDENTIAL=$(curl -s -X POST "$N8N_BASE_URL/api/v1/credentials" \
  "${HEADERS[@]}" \
  -d '{
    "name": "WordPress Achadinho",
    "type": "wordpressApi",
    "data": {
      "url": "https://achadinhoshopp.com.br/loja/wp-json",
      "username": "glolivercoder",
      "password": "OxCq4oUPrd5hqxPEq1zdjEd4"
    }
  }')

echo "Credencial WordPress criada: $WORDPRESS_CREDENTIAL"
WORDPRESS_CREDENTIAL_ID=$(echo $WORDPRESS_CREDENTIAL | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "ID da credencial WordPress: $WORDPRESS_CREDENTIAL_ID"

# Criar credencial PDV Vendas API
PDV_VENDAS_CREDENTIAL=$(curl -s -X POST "$N8N_BASE_URL/api/v1/credentials" \
  "${HEADERS[@]}" \
  -d '{
    "name": "PDV Vendas API",
    "type": "httpBasicAuth",
    "data": {
      "user": "glolivercoder",
      "password": "OxCq4oUPrd5hqxPEq1zdjEd4"
    }
  }')

echo "Credencial PDV Vendas API criada: $PDV_VENDAS_CREDENTIAL"
PDV_VENDAS_CREDENTIAL_ID=$(echo $PDV_VENDAS_CREDENTIAL | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
echo "ID da credencial PDV Vendas API: $PDV_VENDAS_CREDENTIAL_ID"

echo "Criando workflows..."

# Criar workflow de sincronização de produtos
PRODUCT_SYNC_WORKFLOW=$(curl -s -X POST "$N8N_BASE_URL/api/v1/workflows" \
  "${HEADERS[@]}" \
  -d '{
    "name": "PDV Vendas - Sincronização de Produtos",
    "active": false,
    "settings": {},
    "tags": [
      {"id": "'$PDV_VENDAS_TAG_ID'"},
      {"id": "'$WOOCOMMERCE_TAG_ID'"},
      {"id": "'$INTEGRATION_TAG_ID'"}
    ],
    "nodes": [
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
        "position": [250, 300]
      },
      {
        "parameters": {
          "functionCode": "// Processar dados do produto\nconst data = $input.json;\n\n// Verificar se é um único produto ou uma lista\nconst produtos = Array.isArray(data) ? data : [data];\nconst processedProducts = [];\n\nfor (const produto of produtos) {\n  const processedProduct = {\n    name: produto.nome,\n    type: \"simple\",\n    regular_price: produto.preco.toString(),\n    description: produto.descricao || \"\",\n    short_description: produto.descricao_curta || \"\",\n    categories: produto.categorias ? produto.categorias.map(cat => ({id: cat.id})) : [],\n    images: [],\n    sku: produto.codigo || \"\",\n    stock_quantity: produto.estoque || 0,\n    manage_stock: true,\n    status: \"publish\",\n    meta_data: [\n      {\n        key: \"_pdv_vendas_product\",\n        value: \"true\"\n      },\n      {\n        key: \"_pdv_vendas_id\",\n        value: produto.id.toString()\n      }\n    ]\n  };\n  \n  // Processar imagens\n  if (produto.imagens && Array.isArray(produto.imagens)) {\n    for (const imagem of produto.imagens) {\n      processedProduct.images.push({\n        src: imagem.url,\n        name: imagem.nome || `Produto ${produto.nome}`,\n        alt: imagem.alt || `Produto ${produto.nome}`\n      });\n    }\n  }\n  \n  processedProducts.push(processedProduct);\n}\n\nreturn { produtos: processedProducts };"
        },
        "name": "Process Product Data",
        "type": "n8n-nodes-base.function",
        "typeVersion": 1,
        "position": [450, 300]
      },
      {
        "parameters": {
          "functionCode": "// Processar imagens\nconst produtos = $input.json.produtos;\nconst processedProducts = [];\n\nfor (const produto of produtos) {\n  // Verificar se as imagens são URLs válidas\n  if (produto.images && produto.images.length > 0) {\n    const validImages = [];\n    \n    for (const image of produto.images) {\n      // Verificar se a URL da imagem é válida\n      if (image.src && image.src.startsWith(\"http\")) {\n        validImages.push(image);\n      } else {\n        // Adicionar uma imagem padrão se a URL não for válida\n        validImages.push({\n          src: \"https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png\",\n          name: image.name,\n          alt: image.alt\n        });\n      }\n    }\n    \n    produto.images = validImages;\n  }\n  \n  processedProducts.push(produto);\n}\n\nreturn { produtos: processedProducts };"
        },
        "name": "Process Images",
        "type": "n8n-nodes-base.function",
        "typeVersion": 1,
        "position": [650, 300]
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
        "position": [850, 300]
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
        "position": [1050, 300],
        "credentials": {
          "wooCommerceApi": "'$WOOCOMMERCE_CREDENTIAL_ID'"
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
  }')

echo "Workflow de sincronização de produtos criado: $PRODUCT_SYNC_WORKFLOW"
PRODUCT_SYNC_WORKFLOW_ID=$(echo $PRODUCT_SYNC_WORKFLOW | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "ID do workflow de sincronização de produtos: $PRODUCT_SYNC_WORKFLOW_ID"

# Criar workflow de sincronização de estoque (WooCommerce → PDV)
INVENTORY_SYNC_WOO_TO_PDV_WORKFLOW=$(curl -s -X POST "$N8N_BASE_URL/api/v1/workflows" \
  "${HEADERS[@]}" \
  -d '{
    "name": "PDV Vendas - Sincronização de Estoque (WooCommerce → PDV)",
    "active": false,
    "settings": {},
    "tags": [
      {"id": "'$PDV_VENDAS_TAG_ID'"},
      {"id": "'$WOOCOMMERCE_TAG_ID'"},
      {"id": "'$INTEGRATION_TAG_ID'"}
    ],
    "nodes": [
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
        "position": [250, 300]
      },
      {
        "parameters": {
          "functionCode": "// Processar dados de estoque do WooCommerce\nconst data = $input.json;\n\n// Verificar se temos os dados necessários\nif (!data.product_id || data.stock_quantity === undefined) {\n  return { success: false, message: \"Dados de estoque incompletos\" };\n}\n\nreturn {\n  produto_id: data.product_id,\n  estoque: parseInt(data.stock_quantity, 10)\n};"
        },
        "name": "Process Stock Data",
        "type": "n8n-nodes-base.function",
        "typeVersion": 1,
        "position": [450, 300]
      },
      {
        "parameters": {
          "url": "=https://api.pdvvendas.com/webhook/atualizar-estoque",
          "method": "POST",
          "authentication": "predefinedCredentialType",
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
        "position": [650, 300],
        "credentials": {
          "httpBasicAuth": "'$PDV_VENDAS_CREDENTIAL_ID'"
        }
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
  }')

echo "Workflow de sincronização de estoque (WooCommerce → PDV) criado: $INVENTORY_SYNC_WOO_TO_PDV_WORKFLOW"
INVENTORY_SYNC_WOO_TO_PDV_WORKFLOW_ID=$(echo $INVENTORY_SYNC_WOO_TO_PDV_WORKFLOW | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "ID do workflow de sincronização de estoque (WooCommerce → PDV): $INVENTORY_SYNC_WOO_TO_PDV_WORKFLOW_ID"

# Criar workflow de sincronização de estoque (PDV → WooCommerce)
INVENTORY_SYNC_PDV_TO_WOO_WORKFLOW=$(curl -s -X POST "$N8N_BASE_URL/api/v1/workflows" \
  "${HEADERS[@]}" \
  -d '{
    "name": "PDV Vendas - Sincronização de Estoque (PDV → WooCommerce)",
    "active": false,
    "settings": {},
    "tags": [
      {"id": "'$PDV_VENDAS_TAG_ID'"},
      {"id": "'$WOOCOMMERCE_TAG_ID'"},
      {"id": "'$INTEGRATION_TAG_ID'"}
    ],
    "nodes": [
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
        "position": [250, 300]
      },
      {
        "parameters": {
          "functionCode": "// Processar dados do estoque do PDV Vendas\nconst data = $input.json;\n\n// Verificar se temos o ID do produto\nif (!data.produto_id) {\n  return { success: false, message: \"ID do produto não fornecido\" };\n}\n\nreturn {\n  sku: data.produto_id.toString(),\n  stock_quantity: data.estoque\n};"
        },
        "name": "Process PDV Stock Data",
        "type": "n8n-nodes-base.function",
        "typeVersion": 1,
        "position": [450, 300]
      },
      {
        "parameters": {
          "authentication": "credentials",
          "operation": "update",
          "resource": "product",
          "productId": "={{ $json.sku }}",
          "updateFields": {
            "stock_quantity": "={{ $json.stock_quantity }}",
            "manage_stock": true
          }
        },
        "name": "WooCommerce",
        "type": "n8n-nodes-base.wooCommerce",
        "typeVersion": 1,
        "position": [650, 300],
        "credentials": {
          "wooCommerceApi": "'$WOOCOMMERCE_CREDENTIAL_ID'"
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
              "node": "WooCommerce",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }')

echo "Workflow de sincronização de estoque (PDV → WooCommerce) criado: $INVENTORY_SYNC_PDV_TO_WOO_WORKFLOW"
INVENTORY_SYNC_PDV_TO_WOO_WORKFLOW_ID=$(echo $INVENTORY_SYNC_PDV_TO_WOO_WORKFLOW | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "ID do workflow de sincronização de estoque (PDV → WooCommerce): $INVENTORY_SYNC_PDV_TO_WOO_WORKFLOW_ID"

# Criar workflow de gerenciamento com IA
AI_MANAGER_WORKFLOW=$(curl -s -X POST "$N8N_BASE_URL/api/v1/workflows" \
  "${HEADERS[@]}" \
  -d '{
    "name": "PDV Vendas - IA Manager",
    "active": false,
    "settings": {},
    "tags": [
      {"id": "'$PDV_VENDAS_TAG_ID'"},
      {"id": "'$WOOCOMMERCE_TAG_ID'"},
      {"id": "'$INTEGRATION_TAG_ID'"}
    ],
    "nodes": [
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
        "position": [250, 300]
      },
      {
        "parameters": {
          "functionCode": "// Simular resposta da IA (já que não temos credenciais configuradas)\nconst data = $input.json;\n\nreturn {\n  success: true,\n  message: \"IA processou a solicitação com sucesso\",\n  ai_response: `Resposta simulada da IA para a consulta: ${data.message || \"Consulta não fornecida\"}`,\n  timestamp: new Date().toISOString()\n};"
        },
        "name": "Simulate AI Response",
        "type": "n8n-nodes-base.function",
        "typeVersion": 1,
        "position": [450, 300]
      }
    ],
    "connections": {
      "Webhook": {
        "main": [
          [
            {
              "node": "Simulate AI Response",
              "type": "main",
              "index": 0
            }
          ]
        ]
      }
    }
  }')

echo "Workflow de gerenciamento com IA criado: $AI_MANAGER_WORKFLOW"
AI_MANAGER_WORKFLOW_ID=$(echo $AI_MANAGER_WORKFLOW | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "ID do workflow de gerenciamento com IA: $AI_MANAGER_WORKFLOW_ID"

echo "Ativando workflows..."

# Ativar workflow de sincronização de produtos
ACTIVATE_PRODUCT_SYNC=$(curl -s -X PATCH "$N8N_BASE_URL/api/v1/workflows/$PRODUCT_SYNC_WORKFLOW_ID/activate" \
  "${HEADERS[@]}")

echo "Workflow de sincronização de produtos ativado: $ACTIVATE_PRODUCT_SYNC"

# Ativar workflow de sincronização de estoque (WooCommerce → PDV)
ACTIVATE_INVENTORY_SYNC_WOO_TO_PDV=$(curl -s -X PATCH "$N8N_BASE_URL/api/v1/workflows/$INVENTORY_SYNC_WOO_TO_PDV_WORKFLOW_ID/activate" \
  "${HEADERS[@]}")

echo "Workflow de sincronização de estoque (WooCommerce → PDV) ativado: $ACTIVATE_INVENTORY_SYNC_WOO_TO_PDV"

# Ativar workflow de sincronização de estoque (PDV → WooCommerce)
ACTIVATE_INVENTORY_SYNC_PDV_TO_WOO=$(curl -s -X PATCH "$N8N_BASE_URL/api/v1/workflows/$INVENTORY_SYNC_PDV_TO_WOO_WORKFLOW_ID/activate" \
  "${HEADERS[@]}")

echo "Workflow de sincronização de estoque (PDV → WooCommerce) ativado: $ACTIVATE_INVENTORY_SYNC_PDV_TO_WOO"

# Ativar workflow de gerenciamento com IA
ACTIVATE_AI_MANAGER=$(curl -s -X PATCH "$N8N_BASE_URL/api/v1/workflows/$AI_MANAGER_WORKFLOW_ID/activate" \
  "${HEADERS[@]}")

echo "Workflow de gerenciamento com IA ativado: $ACTIVATE_AI_MANAGER"

echo "Todos os workflows foram criados e ativados com sucesso!"

echo "URLs dos webhooks:"
echo "Sincronização de Produtos: $N8N_BASE_URL/webhook/pdv-vendas/produtos"
echo "Sincronização de Estoque (WooCommerce → PDV): $N8N_BASE_URL/webhook/woocommerce/estoque"
echo "Sincronização de Estoque (PDV → WooCommerce): $N8N_BASE_URL/webhook/pdv-vendas/estoque"
echo "Gerenciamento com IA: $N8N_BASE_URL/webhook/pdv-vendas/ai-manager"
