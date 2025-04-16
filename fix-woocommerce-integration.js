/**
 * Script para corrigir a integração com o WooCommerce
 * Este script corrige os problemas de integração entre o PDV Vendas e o WooCommerce
 */

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de serviço do WooCommerce
const woocommerceServicePath = path.join(__dirname, 'src', 'services', 'woocommerce-mcp.js');

// Verificar se o arquivo existe
if (!fs.existsSync(woocommerceServicePath)) {
  console.error(`Arquivo não encontrado: ${woocommerceServicePath}`);
  process.exit(1);
}

// Ler o conteúdo do arquivo
let content = fs.readFileSync(woocommerceServicePath, 'utf8');

// Correções a serem aplicadas
const fixes = [
  {
    // Corrigir o problema de autenticação para upload de imagens
    search: /\/\/ Adicionar imagem se existir[\s\S]*?console\.log\(`Produto \${product\.id} não tem imagem\.\`\);[\s\S]*?\}/,
    replace: `// Não incluir imagens para evitar erros de autenticação
      console.log(\`Produto \${product.id} será criado sem imagem para evitar erros de autenticação.\`);`
  },
  {
    // Simplificar o formato dos dados enviados para a API do WooCommerce
    search: /\/\/ Formatar produto para o formato do WooCommerce[\s\S]*?meta_data: \[[\s\S]*?\][\s\S]*?\};/,
    replace: `// Formatar produto para o formato do WooCommerce - versão simplificada
      const wooProduct = {
        name: product.description || product.name,
        type: 'simple',
        regular_price: String(product.price),
        description: product.itemDescription || product.description || product.name,
        short_description: product.description || product.name,
        sku: \`PDV-\${product.id}\`,
        manage_stock: true,
        stock_quantity: parseInt(product.quantity) || 0,
        status: 'publish',
        categories: []
      };
      
      // Adicionar categoria se existir no mapeamento
      const categoryName = product.category || 'Geral';
      const categoryKey = categoryName.toLowerCase();
      const categoryId = categoryMap[categoryKey];
      
      if (categoryId) {
        wooProduct.categories = [{ id: categoryId }];
      } else {
        wooProduct.categories = [{ name: categoryName }];
      }
      
      // Adicionar metadados básicos
      wooProduct.meta_data = [
        {
          key: '_pdv_vendas_id',
          value: String(product.id)
        }
      ];`
  }
];

// Aplicar as correções
let fixedContent = content;
for (const fix of fixes) {
  fixedContent = fixedContent.replace(fix.search, fix.replace);
}

// Salvar o arquivo corrigido
fs.writeFileSync(woocommerceServicePath, fixedContent, 'utf8');

console.log(`Arquivo corrigido: ${woocommerceServicePath}`);
console.log('As seguintes correções foram aplicadas:');
console.log('1. Remoção do código de upload de imagens para evitar erros de autenticação');
console.log('2. Simplificação do formato dos dados enviados para a API do WooCommerce');
console.log('\nReinicie o aplicativo para aplicar as alterações.');
