# Catálogos de Fornecedores para Teste

Este diretório contém arquivos de catálogo de produtos para testar a funcionalidade "Importar catálogo" na aba Fornecedores do aplicativo VendaEstoque.

## Arquivos Disponíveis

### Arquivos com URLs de Imagens Originais
1. **catalogo_produtos.xml** - Catálogo em formato XML com URLs de imagens originais
2. **catalogo_produtos_nome_corrigido.xml** - Catálogo em formato XML com tag `<name>` corrigida
3. **catalogo_produtos.csv** - Catálogo em formato CSV com URLs de imagens originais
4. **catalogo_produtos.json** - Catálogo em formato JSON com URLs de imagens originais
5. **catalogo_produtos.html** - Catálogo em formato HTML para visualização

### Arquivos com URLs de Imagens Corrigidas (Recomendado)
6. **catalogo_produtos_imagens_corrigidas.xml** - Catálogo em formato XML com URLs de imagens que funcionam
7. **catalogo_produtos_imagens_corrigidas.json** - Catálogo em formato JSON com URLs de imagens que funcionam
8. **catalogo_produtos_imagens_corrigidas.csv** - Catálogo em formato CSV com URLs de imagens que funcionam

### Arquivos para Imagens Locais
9. **catalogo_produtos_local.xml** - Catálogo em formato XML com referências a imagens locais (usa tag `<n>`)
10. **catalogo_produtos_local_corrigido.xml** - Catálogo em formato XML com referências a imagens locais (usa tag `<name>`)
11. **baixar_imagens.bat** - Script para baixar as imagens dos produtos para a pasta local
12. **download_images.js** - Script Node.js para download das imagens

## Como Usar

1. Acesse a aba "Fornecedores" no aplicativo
2. Selecione um fornecedor existente ou crie um novo
3. Clique no botão "Importar Catálogo"
4. Selecione um dos arquivos de catálogo disponíveis nesta pasta
   - **Recomendação**: Use os arquivos com "imagens_corrigidas" no nome para evitar problemas de carregamento de imagens
5. Siga as instruções na tela para importar os produtos

## Problemas Conhecidos com Imagens

Alguns dos URLs de imagens nos arquivos originais podem não carregar corretamente devido a:

1. **URLs inválidos ou desatualizados (erro 404)**: Algumas imagens não existem mais nos servidores originais.
2. **Proteção contra hotlinking (erro 403)**: Alguns sites (como Dell e Kabum) bloqueiam o acesso direto às suas imagens.

Para evitar esses problemas, use os arquivos com "imagens_corrigidas" no nome, que contêm URLs de imagens do Pexels, um site que permite o uso livre de suas imagens sem restrições de hotlinking.

## Informações dos Produtos

Todos os arquivos contêm os mesmos 10 produtos com informações reais:

- Smartphone Samsung Galaxy A54 5G
- Notebook Dell Inspiron 15
- Smart TV LG 50" 4K UHD
- Fone de Ouvido JBL Tune 510BT
- Câmera Digital Canon EOS Rebel T7+
- Impressora Multifuncional HP DeskJet 2774
- Console PlayStation 5 Sony
- Ar Condicionado Split Inverter Electrolux 12000 BTUs
- Tablet Samsung Galaxy Tab S8
- Smartwatch Amazfit GTR 3 Pro

Cada produto inclui:
- Nome
- Descrição detalhada
- Preço
- Quantidade
- Categoria
- SKU (código interno)
- GTIN (código de barras)
- NCM (código fiscal)
- Imagem (URL)

## Formatos Suportados

- **XML**: Estrutura hierárquica com tags para cada campo
- **CSV**: Valores separados por vírgula com cabeçalho
- **JSON**: Formato de objeto JavaScript com arrays e objetos aninhados
- **HTML**: Formato de visualização para navegadores web

## Imagens Locais

Para testar a importação com imagens locais:

1. Execute o arquivo `baixar_imagens.bat` para baixar as imagens para a pasta `imagens/`
2. Use o arquivo `catalogo_produtos_local_corrigido.xml` que referencia as imagens locais

Isso permite testar a importação mesmo sem conexão com a internet.
