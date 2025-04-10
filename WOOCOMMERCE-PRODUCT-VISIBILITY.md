# Guia de Solução de Problemas - Visibilidade de Produtos no WooCommerce

Este guia ajudará você a resolver problemas específicos de visibilidade de produtos no WooCommerce, quando os produtos sincronizados do PDV Vendas não estão aparecendo na loja.

## Verificações Rápidas

Antes de prosseguir com soluções mais complexas, verifique estes itens básicos:

1. **Status dos Produtos**: Verifique se os produtos estão com status "Publicado" no WooCommerce
2. **Estoque**: Verifique se os produtos têm estoque disponível
3. **Visibilidade**: Verifique se os produtos estão configurados como "Visíveis na loja"
4. **Cache**: Limpe o cache do site e do navegador

## Problemas Comuns e Soluções

### 1. Produtos com Status "Rascunho"

**Problema**: Os produtos são sincronizados, mas ficam como rascunho no WooCommerce.

**Solução**:
1. Acesse o painel do WordPress: `https://achadinhoshopp.com.br/loja/wp-admin/`
2. Vá para **Produtos > Todos os Produtos**
3. Selecione os produtos com status "Rascunho"
4. Use a ação em massa "Editar" e mude o status para "Publicado"
5. Clique em "Atualizar"

**Prevenção**:
- Verifique se o código de sincronização está definindo `status: 'publish'` ao criar produtos
- Verifique se há algum plugin que possa estar alterando o status dos produtos

### 2. Produtos Não Visíveis no Catálogo

**Problema**: Os produtos estão publicados, mas não aparecem na loja.

**Solução**:
1. Acesse o painel do WordPress
2. Vá para **Produtos > Todos os Produtos**
3. Edite cada produto
4. Na seção "Publicidade do catálogo", selecione "Visível na loja"
5. Clique em "Atualizar"

**Prevenção**:
- Verifique se o código de sincronização está definindo `catalog_visibility: 'visible'` ao criar produtos
- Adicione o meta dado `_visibility` com valor `visible` aos produtos

### 3. Produtos Sem Preço

**Problema**: Produtos sem preço podem não aparecer na loja.

**Solução**:
1. Acesse o painel do WordPress
2. Vá para **Produtos > Todos os Produtos**
3. Edite cada produto sem preço
4. Adicione um preço regular
5. Clique em "Atualizar"

**Prevenção**:
- Verifique se o código de sincronização está definindo `regular_price` e `price` ao criar produtos
- Adicione os meta dados `_regular_price` e `_price` aos produtos

### 4. Problemas com Categorias

**Problema**: Produtos em categorias incorretas ou inexistentes.

**Solução**:
1. Acesse o painel do WordPress
2. Vá para **Produtos > Categorias**
3. Verifique se as categorias existem e estão configuradas corretamente
4. Crie as categorias ausentes
5. Edite os produtos e atribua às categorias corretas

**Prevenção**:
- Implemente uma função para verificar e criar categorias antes de sincronizar produtos
- Use IDs de categoria em vez de nomes ao atribuir categorias aos produtos

### 5. Configurações de Visibilidade do Catálogo

**Problema**: Configurações globais do WooCommerce podem afetar a visibilidade dos produtos.

**Solução**:
1. Acesse o painel do WordPress
2. Vá para **WooCommerce > Configurações > Produtos > Geral**
3. Em "Visibilidade do catálogo", selecione "Mostrar produtos e preços"
4. Clique em "Salvar alterações"

### 6. Problemas com Permalinks

**Problema**: Estrutura de permalinks incorreta pode afetar a visibilidade dos produtos.

**Solução**:
1. Acesse o painel do WordPress
2. Vá para **Configurações > Links Permanentes**
3. Selecione qualquer opção exceto "Simples"
4. Clique em "Salvar alterações"

### 7. Problemas com Temas

**Problema**: O tema pode não estar exibindo os produtos corretamente.

**Solução**:
1. Verifique se o tema é compatível com WooCommerce
2. Temporariamente, mude para um tema padrão do WooCommerce, como Storefront
3. Verifique se os produtos aparecem com o tema padrão

### 8. Problemas com Plugins

**Problema**: Plugins podem interferir na exibição de produtos.

**Solução**:
1. Desative temporariamente todos os plugins, exceto WooCommerce
2. Verifique se os produtos aparecem
3. Reative os plugins um por um para identificar o causador do problema

## Verificação Avançada

Se os problemas persistirem, use a ferramenta de verificação de configuração do WooCommerce incluída no PDV Vendas:

1. Acesse o PDV Vendas
2. Vá para a seção "Exportar para o WordPress"
3. Clique em "Verificar Configuração"
4. Siga as recomendações fornecidas pela ferramenta

## Contato para Suporte

Se você continuar enfrentando problemas após seguir este guia, entre em contato com o suporte:

- Email: glolivercoder@gmail.com
- WhatsApp: [Número de contato]
