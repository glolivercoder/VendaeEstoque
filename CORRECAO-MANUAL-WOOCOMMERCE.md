# Correção Manual da Integração com WooCommerce

Este documento contém instruções para corrigir manualmente os problemas de integração entre o PDV Vendas e o WooCommerce.

## Problema 1: Upload de Imagens

O código atual tenta fazer upload de imagens para o WordPress, mas está encontrando erros de autenticação. Vamos remover essa parte do código.

### Arquivo a ser editado: `src/services/woocommerce-mcp.js`

Localize o seguinte trecho de código (por volta da linha 300):

```javascript
// Adicionar imagem se existir
if (product.image) {
  if (product.image.startsWith('data:image')) {
    // Para imagens em base64, tentamos fazer upload para o WordPress
    console.log(`Tentando fazer upload de imagem em base64 para o produto ${product.id}`);

    try {
      // Extrair tipo e dados da imagem base64
      const matches = product.image.match(/^data:([A-Za-z-+\\/]+);base64,(.+)$/);

      if (matches && matches.length === 3) {
        const type = matches[1];
        const data = matches[2];

        // Determinar a extensão do arquivo com base no tipo MIME
        let extension = 'jpg';
        if (type.includes('png')) extension = 'png';
        else if (type.includes('gif')) extension = 'gif';
        else if (type.includes('webp')) extension = 'webp';

        // Nome do arquivo
        const filename = `pdv-product-${product.id}-${Date.now()}.${extension}`;

        // Fazer upload da imagem para o WordPress
        console.log(`Fazendo upload da imagem ${filename} para o WordPress...`);

        // Converter a imagem base64 para um formato que o WordPress possa processar
        const formData = new FormData();

        // Criar um blob a partir dos dados base64
        const byteCharacters = atob(data);
        const byteArrays = [];

        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);

          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }

        const blob = new Blob(byteArrays, {type});

        // Adicionar o arquivo ao formData
        formData.append('file', blob, filename);
        formData.append('title', product.description || product.name);
        formData.append('caption', `Imagem do produto: ${product.description || product.name}`);
        formData.append('alt_text', product.description || product.name);

        // Usar a API do WooCommerce para fazer upload
        const mediaResponse = await woocommerceApi.post(`/media`, formData, {
          headers: {
            'Content-Disposition': `attachment; filename=${filename}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        // Adicionar a imagem ao produto
        if (mediaResponse.data && mediaResponse.data.source_url) {
          wooProduct.images = [
            {
              src: mediaResponse.data.source_url,
              id: mediaResponse.data.id,
              alt: product.description || product.name,
              name: filename
            }
          ];
          console.log(`Imagem enviada com sucesso: ${mediaResponse.data.source_url}`);
        }
      } else {
        console.error('Formato de imagem base64 inválido');
      }
    } catch (imageError) {
      console.error('Erro ao fazer upload da imagem:', imageError.response ? imageError.response.data : imageError.message);
      // Continuar sem a imagem
    }
  } else {
    // Se for uma URL, usar diretamente
    wooProduct.images = [
      {
        src: product.image
      }
    ];
    console.log(`Usando URL de imagem externa: ${product.image}`);
  }
} else {
  console.log(`Produto ${product.id} não tem imagem.`);
}
```

E substitua por:

```javascript
// Não incluir imagens para evitar erros de autenticação
console.log(`Produto ${product.id} será criado sem imagem para evitar erros de autenticação.`);
```

## Problema 2: Formato dos Dados

O formato dos dados enviados para a API do WooCommerce está causando erros. Vamos simplificar esse formato.

### Arquivo a ser editado: `src/services/woocommerce-mcp.js`

Localize o seguinte trecho de código (por volta da linha 240):

```javascript
// Formatar produto para o formato do WooCommerce
const wooProduct = {
  name: product.description || product.name,
  description: product.itemDescription || product.description || product.name,
  short_description: product.description || product.name,
  regular_price: String(product.price),
  price: String(product.price),
  sku: `PDV-${product.id}`,
  manage_stock: true,
  stock_quantity: parseInt(product.quantity) || 0,
  stock_status: (parseInt(product.quantity) || 0) > 0 ? 'instock' : 'outofstock',
  status: 'publish',
  catalog_visibility: 'visible',
  type: 'simple',
  virtual: false,
  purchasable: true,
  categories: (() => {
    const categoryName = product.category || 'Geral';
    const categoryKey = categoryName.toLowerCase();
    const categoryId = categoryMap[categoryKey];

    // Se temos um ID de categoria, usamos ele
    if (categoryId) {
      return [{ id: categoryId }];
    }
    // Caso contrário, usamos o nome (WooCommerce criará uma nova categoria)
    return [{ name: categoryName }];
  })(),
  meta_data: [
    {
      key: '_pdv_vendas_id',
      value: String(product.id)
    },
    {
      key: '_visibility',
      value: 'visible'
    },
    {
      key: '_regular_price',
      value: String(product.price)
    },
    {
      key: '_price',
      value: String(product.price)
    }
  ]
};
```

E substitua por:

```javascript
// Formatar produto para o formato do WooCommerce - versão simplificada
const wooProduct = {
  name: product.description || product.name,
  type: 'simple',
  regular_price: String(product.price),
  description: product.itemDescription || product.description || product.name,
  short_description: product.description || product.name,
  sku: `PDV-${product.id}`,
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
];
```

## Problema 3: Log de Informações

Vamos corrigir o log de informações para mostrar os dados corretos.

### Arquivo a ser editado: `src/services/woocommerce-mcp.js`

Localize o seguinte trecho de código (por volta da linha 280):

```javascript
console.log('Enviando produto para o WooCommerce:', {
  id: product.id,
  name: wooProduct.name,
  price: wooProduct.price,
  status: wooProduct.status,
  visibility: wooProduct.catalog_visibility
});
```

E substitua por:

```javascript
console.log('Enviando produto para o WooCommerce:', {
  id: product.id,
  name: wooProduct.name,
  price: wooProduct.regular_price,
  status: wooProduct.status
});
```

## Após fazer as alterações

Depois de fazer essas alterações, salve o arquivo e reinicie o aplicativo PDV Vendas. As alterações devem resolver os problemas de integração com o WooCommerce.

## Instalação do Plugin WordPress

Para manter o mesmo layout do app PDV Vendas no site WooCommerce, instale o plugin `pdv-vendas-css.zip`:

1. Acesse o painel de administração do WordPress (https://achadinhoshopp.com.br/loja/wp-admin/)
2. Vá para **Plugins > Adicionar Novo > Enviar Plugin**
3. Selecione o arquivo `pdv-vendas-css.zip`
4. Clique em **Instalar Agora**
5. Após a instalação, clique em **Ativar Plugin**

O plugin aplicará automaticamente o estilo do PDV Vendas ao seu site WooCommerce.
