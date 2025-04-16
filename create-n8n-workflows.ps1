# Script PowerShell para criar workflows no n8n

# Configuração
$N8N_API_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIyYWZhMGVkYi1iMTk5LTRmOWYtODY1My0yYWJjZTllMzQyY2YiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwiaWF0IjoxNzQ0NTAyNjMxfQ.RZB0tGBnAtQcid8R2VaKqOoqW2OsnutBEmNWmCoCAsk"
$N8N_BASE_URL = "http://localhost:5679"

# Credenciais atualizadas
$WORDPRESS_USERNAME = "gloliverx"
$WORDPRESS_PASSWORD = "Juli@3110"

# Headers para as requisições
$headers = @{
    "Content-Type" = "application/json"
    "X-N8N-API-KEY" = $N8N_API_KEY
}

Write-Host "Criando tags..."

# Criar tag PDV Vendas
$pdvVendasTagJson = @{
    name = "PDV Vendas"
} | ConvertTo-Json

$pdvVendasTag = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/tags" -Method Post -Headers $headers -Body $pdvVendasTagJson
Write-Host "Tag PDV Vendas criada: $($pdvVendasTag | ConvertTo-Json -Compress)"

# Criar tag WooCommerce
$wooCommerceTagJson = @{
    name = "WooCommerce"
} | ConvertTo-Json

$wooCommerceTag = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/tags" -Method Post -Headers $headers -Body $wooCommerceTagJson
Write-Host "Tag WooCommerce criada: $($wooCommerceTag | ConvertTo-Json -Compress)"

# Criar tag Integration
$integrationTagJson = @{
    name = "Integration"
} | ConvertTo-Json

$integrationTag = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/tags" -Method Post -Headers $headers -Body $integrationTagJson
Write-Host "Tag Integration criada: $($integrationTag | ConvertTo-Json -Compress)"

Write-Host "Criando credenciais..."

# Criar credencial WooCommerce
$wooCommerceCredentialJson = @{
    name = "WooCommerce Achadinho"
    type = "wooCommerceApi"
    data = @{
        url = "https://achadinhoshopp.com.br/loja"
        consumerKey = "ck_a117i65gmQYOokVzyA8QRLSw"
        consumerSecret = "cs_a117i65gmQYOokVzyA8QRLSw"
    }
} | ConvertTo-Json

$wooCommerceCredential = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/credentials" -Method Post -Headers $headers -Body $wooCommerceCredentialJson
Write-Host "Credencial WooCommerce criada: $($wooCommerceCredential | ConvertTo-Json -Compress)"

# Criar credencial WordPress
$wordPressCredentialJson = @{
    name = "WordPress Achadinho"
    type = "wordpressApi"
    data = @{
        url = "https://achadinhoshopp.com.br/loja/wp-json"
        username = $WORDPRESS_USERNAME
        password = $WORDPRESS_PASSWORD
    }
} | ConvertTo-Json

$wordPressCredential = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/credentials" -Method Post -Headers $headers -Body $wordPressCredentialJson
Write-Host "Credencial WordPress criada: $($wordPressCredential | ConvertTo-Json -Compress)"

# Criar credencial PDV Vendas API
$pdvVendasCredentialJson = @{
    name = "PDV Vendas API"
    type = "httpBasicAuth"
    data = @{
        user = $WORDPRESS_USERNAME
        password = $WORDPRESS_PASSWORD
    }
} | ConvertTo-Json

$pdvVendasCredential = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/credentials" -Method Post -Headers $headers -Body $pdvVendasCredentialJson
Write-Host "Credencial PDV Vendas API criada: $($pdvVendasCredential | ConvertTo-Json -Compress)"

Write-Host "Criando workflows..."

# Criar workflow de sincronização de produtos
$productSyncWorkflowJson = @"
{
  "name": "PDV Vendas - Sincronização de Produtos",
  "settings": {},
  "tags": [
    {"id": "$($pdvVendasTag.id)"},
    {"id": "$($wooCommerceTag.id)"},
    {"id": "$($integrationTag.id)"}
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
        "functionCode": "// Processar dados do produto\nconst data = \$input.json;\n\n// Verificar se é um único produto ou uma lista\nconst produtos = Array.isArray(data) ? data : [data];\nconst processedProducts = [];\n\nfor (const produto of produtos) {\n  const processedProduct = {\n    name: produto.nome,\n    type: \"simple\",\n    regular_price: produto.preco.toString(),\n    description: produto.descricao || \"\",\n    short_description: produto.descricao_curta || \"\",\n    categories: produto.categorias ? produto.categorias.map(cat => ({id: cat.id})) : [],\n    images: [],\n    sku: produto.codigo || \"\",\n    stock_quantity: produto.estoque || 0,\n    manage_stock: true,\n    status: \"publish\",\n    meta_data: [\n      {\n        key: \"_pdv_vendas_product\",\n        value: \"true\"\n      },\n      {\n        key: \"_pdv_vendas_id\",\n        value: produto.id.toString()\n      }\n    ]\n  };\n  \n  // Processar imagens\n  if (produto.imagens && Array.isArray(produto.imagens)) {\n    for (const imagem of produto.imagens) {\n      processedProduct.images.push({\n        src: imagem.url,\n        name: imagem.nome || `Produto \${produto.nome}`,\n        alt: imagem.alt || `Produto \${produto.nome}`\n      });\n    }\n  }\n  \n  processedProducts.push(processedProduct);\n}\n\nreturn { produtos: processedProducts };"
      },
      "name": "Process Product Data",
      "type": "n8n-nodes-base.function",
      "typeVersion": 1,
      "position": [450, 300]
    },
    {
      "parameters": {
        "functionCode": "// Processar imagens\nconst produtos = \$input.json.produtos;\nconst processedProducts = [];\n\nfor (const produto of produtos) {\n  // Verificar se as imagens são URLs válidas\n  if (produto.images && produto.images.length > 0) {\n    const validImages = [];\n    \n    for (const image of produto.images) {\n      // Verificar se a URL da imagem é válida\n      if (image.src && image.src.startsWith('http')) {\n        validImages.push(image);\n      } else {\n        // Adicionar uma imagem padrão se a URL não for válida\n        validImages.push({\n          src: \"https://achadinhoshopp.com.br/loja/wp-content/uploads/woocommerce-placeholder.png\",\n          name: image.name,\n          alt: image.alt\n        });\n      }\n    }\n    \n    produto.images = validImages;\n  }\n  \n  processedProducts.push(produto);\n}\n\nreturn { produtos: processedProducts };"
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
          "batch": "={{ \$json.produtos }}"
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
        "lookupValue": "={{ \$json.sku }}",
        "options": {},
        "updateFields": {
          "name": "={{ \$json.name }}",
          "type": "={{ \$json.type }}",
          "regular_price": "={{ \$json.regular_price }}",
          "description": "={{ \$json.description }}",
          "short_description": "={{ \$json.short_description }}",
          "categories": "={{ \$json.categories }}",
          "images": "={{ \$json.images }}",
          "stock_quantity": "={{ \$json.stock_quantity }}",
          "manage_stock": "={{ \$json.manage_stock }}",
          "status": "={{ \$json.status }}",
          "meta_data": "={{ \$json.meta_data }}"
        }
      },
      "name": "WooCommerce",
      "type": "n8n-nodes-base.wooCommerce",
      "typeVersion": 1,
      "position": [1050, 300],
      "credentials": {
        "wooCommerceApi": "$($wooCommerceCredential.id)"
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
}
"@

$productSyncWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows" -Method Post -Headers $headers -Body $productSyncWorkflowJson
Write-Host "Workflow de sincronização de produtos criado: $($productSyncWorkflow | ConvertTo-Json -Compress)"

# Criar workflow de sincronização de estoque (WooCommerce → PDV)
$inventorySyncWooToPdvWorkflowJson = @"
{
  "name": "PDV Vendas - Sincronização de Estoque (WooCommerce → PDV)",
  "settings": {},
  "tags": [
    {"id": "$($pdvVendasTag.id)"},
    {"id": "$($wooCommerceTag.id)"},
    {"id": "$($integrationTag.id)"}
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
        "functionCode": "// Processar dados de estoque do WooCommerce\nconst data = \$input.json;\n\n// Verificar se temos os dados necessários\nif (!data.product_id || data.stock_quantity === undefined) {\n  return { success: false, message: \"Dados de estoque incompletos\" };\n}\n\nreturn {\n  produto_id: data.product_id,\n  estoque: parseInt(data.stock_quantity, 10)\n};"
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
              "value": "={{ \$json.produto_id }}"
            },
            {
              "name": "estoque",
              "value": "={{ \$json.estoque }}"
            }
          ]
        }
      },
      "name": "Update PDV Vendas Stock",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3,
      "position": [650, 300],
      "credentials": {
        "httpBasicAuth": "$($pdvVendasCredential.id)"
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
}
"@

$inventorySyncWooToPdvWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows" -Method Post -Headers $headers -Body $inventorySyncWooToPdvWorkflowJson
Write-Host "Workflow de sincronização de estoque (WooCommerce → PDV) criado: $($inventorySyncWooToPdvWorkflow | ConvertTo-Json -Compress)"

# Criar workflow de sincronização de estoque (PDV → WooCommerce)
$inventorySyncPdvToWooWorkflowJson = @"
{
  "name": "PDV Vendas - Sincronização de Estoque (PDV → WooCommerce)",
  "settings": {},
  "tags": [
    {"id": "$($pdvVendasTag.id)"},
    {"id": "$($wooCommerceTag.id)"},
    {"id": "$($integrationTag.id)"}
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
        "functionCode": "// Processar dados do estoque do PDV Vendas\nconst data = \$input.json;\n\n// Verificar se temos o ID do produto\nif (!data.produto_id) {\n  return { success: false, message: \"ID do produto não fornecido\" };\n}\n\nreturn {\n  sku: data.produto_id.toString(),\n  stock_quantity: data.estoque\n};"
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
        "productId": "={{ \$json.sku }}",
        "updateFields": {
          "stock_quantity": "={{ \$json.stock_quantity }}",
          "manage_stock": true
        }
      },
      "name": "WooCommerce",
      "type": "n8n-nodes-base.wooCommerce",
      "typeVersion": 1,
      "position": [650, 300],
      "credentials": {
        "wooCommerceApi": "$($wooCommerceCredential.id)"
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
}
"@

$inventorySyncPdvToWooWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows" -Method Post -Headers $headers -Body $inventorySyncPdvToWooWorkflowJson
Write-Host "Workflow de sincronização de estoque (PDV → WooCommerce) criado: $($inventorySyncPdvToWooWorkflow | ConvertTo-Json -Compress)"

# Criar workflow de gerenciamento com IA
$aiManagerWorkflowJson = @"
{
  "name": "PDV Vendas - IA Manager",
  "settings": {},
  "tags": [
    {"id": "$($pdvVendasTag.id)"},
    {"id": "$($wooCommerceTag.id)"},
    {"id": "$($integrationTag.id)"}
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
        "functionCode": "// Simular resposta da IA (já que não temos credenciais configuradas)\nconst data = \$input.json;\n\nreturn {\n  success: true,\n  message: \"IA processou a solicitação com sucesso\",\n  ai_response: `Resposta simulada da IA para a consulta: \${data.message || \"Consulta não fornecida\"}`,\n  timestamp: new Date().toISOString()\n};"
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
}
"@

$aiManagerWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows" -Method Post -Headers $headers -Body $aiManagerWorkflowJson
Write-Host "Workflow de gerenciamento com IA criado: $($aiManagerWorkflow | ConvertTo-Json -Compress)"

Write-Host "Ativando workflows..."

# Ativar workflow de sincronização de produtos
$activateProductSyncWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows/$($productSyncWorkflow.id)/activate" -Method Post -Headers $headers
Write-Host "Workflow de sincronização de produtos ativado: $($activateProductSyncWorkflow | ConvertTo-Json -Compress)"

# Ativar workflow de sincronização de estoque (WooCommerce → PDV)
$activateInventorySyncWooToPdvWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows/$($inventorySyncWooToPdvWorkflow.id)/activate" -Method Post -Headers $headers
Write-Host "Workflow de sincronização de estoque (WooCommerce → PDV) ativado: $($activateInventorySyncWooToPdvWorkflow | ConvertTo-Json -Compress)"

# Ativar workflow de sincronização de estoque (PDV → WooCommerce)
$activateInventorySyncPdvToWooWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows/$($inventorySyncPdvToWooWorkflow.id)/activate" -Method Post -Headers $headers
Write-Host "Workflow de sincronização de estoque (PDV → WooCommerce) ativado: $($activateInventorySyncPdvToWooWorkflow | ConvertTo-Json -Compress)"

# Ativar workflow de gerenciamento com IA
$activateAiManagerWorkflow = Invoke-RestMethod -Uri "$N8N_BASE_URL/api/v1/workflows/$($aiManagerWorkflow.id)/activate" -Method Post -Headers $headers
Write-Host "Workflow de gerenciamento com IA ativado: $($activateAiManagerWorkflow | ConvertTo-Json -Compress)"

Write-Host "Todos os workflows foram criados e ativados com sucesso!"

Write-Host "URLs dos webhooks:"
Write-Host "Sincronização de Produtos: $N8N_BASE_URL/webhook/pdv-vendas/produtos"
Write-Host "Sincronização de Estoque (WooCommerce → PDV): $N8N_BASE_URL/webhook/woocommerce/estoque"
Write-Host "Sincronização de Estoque (PDV → WooCommerce): $N8N_BASE_URL/webhook/pdv-vendas/estoque"
Write-Host "Gerenciamento com IA: $N8N_BASE_URL/webhook/pdv-vendas/ai-manager"
