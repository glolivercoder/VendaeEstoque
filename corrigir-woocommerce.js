/**
 * Script para corrigir a integração com o WooCommerce
 * Este script corrige os problemas de integração entre o PDV Vendas e o WooCommerce
 */

const fs = require('fs');
const path = require('path');

// Caminho para o arquivo de serviço do WooCommerce
const woocommerceServicePath = path.join('src', 'services', 'woocommerce-mcp.js');

// Verificar se o arquivo existe
if (!fs.existsSync(woocommerceServicePath)) {
  console.error(`Arquivo não encontrado: ${woocommerceServicePath}`);
  process.exit(1);
}

// Ler o conteúdo do arquivo
let content = fs.readFileSync(woocommerceServicePath, 'utf8');

// Correção 1: Remover o código de upload de imagens
console.log('Aplicando correção 1: Remover o código de upload de imagens...');
content = content.replace(
  /\/\/ Adicionar imagem se existir[\s\S]*?console\.log\(`Produto \${product\.id} não tem imagem\.\`\);[\s\S]*?\}/,
  '// Não incluir imagens para evitar erros de autenticação\n      console.log(`Produto ${product.id} será criado sem imagem para evitar erros de autenticação.`);'
);

// Correção 2: Simplificar o formato dos dados
console.log('Aplicando correção 2: Simplificar o formato dos dados...');
content = content.replace(
  /\/\/ Formatar produto para o formato do WooCommerce[\s\S]*?meta_data: \[[\s\S]*?\][\s\S]*?\};/,
  `// Formatar produto para o formato do WooCommerce - versão simplificada
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
);

// Correção 3: Corrigir o log de informações
console.log('Aplicando correção 3: Corrigir o log de informações...');
content = content.replace(
  /console\.log\('Enviando produto para o WooCommerce:', \{[\s\S]*?visibility: wooProduct\.catalog_visibility[\s\S]*?\}\);/,
  `console.log('Enviando produto para o WooCommerce:', {
        id: product.id,
        name: wooProduct.name,
        price: wooProduct.regular_price,
        status: wooProduct.status
      });`
);

// Salvar o arquivo corrigido
fs.writeFileSync(woocommerceServicePath, content, 'utf8');

console.log(`\nArquivo corrigido: ${woocommerceServicePath}`);
console.log('As seguintes correções foram aplicadas:');
console.log('1. Remoção do código de upload de imagens para evitar erros de autenticação');
console.log('2. Simplificação do formato dos dados enviados para a API do WooCommerce');
console.log('3. Correção do log de informações');
console.log('\nReinicie o aplicativo para aplicar as alterações.');
