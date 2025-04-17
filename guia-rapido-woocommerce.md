# Guia Rápido: Configuração do WooCommerce

Este guia rápido contém os principais comandos e ações para configurar o WooCommerce para exibir produtos na página inicial e personalizar a interface para ficar parecida com o app PDV Vendas.

## Comandos Rápidos

### 1. Fazer Backup
```
Execute backup-woocommerce.bat
```

### 2. Configurar Página Inicial
No console do navegador (F12 > Console):
```javascript
// Cole o conteúdo do arquivo configure-woocommerce-homepage.js
```

### 3. Aplicar Estilo Personalizado
No console do navegador (F12 > Console):
```javascript
// Cole o conteúdo do arquivo configure-woocommerce-theme.js
```

### 4. Criar Página Inicial via PHP
Upload do arquivo `create-shop-homepage.php` para a raiz do WordPress e acesse:
```
https://achadinhoshopp.com.br/loja/create-shop-homepage.php
```

## Atalhos do Painel WordPress

- **Configurações de Leitura**: `/wp-admin/options-reading.php`
- **Personalizar Tema**: `/wp-admin/customize.php`
- **Configurações do WooCommerce**: `/wp-admin/admin.php?page=wc-settings`
- **Gerenciar Produtos**: `/wp-admin/edit.php?post_type=product`
- **Adicionar Novo Produto**: `/wp-admin/post-new.php?post_type=product`
- **Gerenciar Páginas**: `/wp-admin/edit.php?post_type=page`
- **Adicionar Nova Página**: `/wp-admin/post-new.php?post_type=page`
- **Gerenciar Menus**: `/wp-admin/nav-menus.php`
- **Gerenciar Widgets**: `/wp-admin/widgets.php`

## Shortcodes Úteis

- **Exibir Produtos**: `[products limit="12" columns="4" orderby="date" order="DESC"]`
- **Exibir Produtos por Categoria**: `[products category="nome-da-categoria" limit="12"]`
- **Exibir Produtos em Promoção**: `[products on_sale="true" limit="12"]`
- **Exibir Produtos em Destaque**: `[products featured="true" limit="12"]`
- **Exibir Produtos Mais Vendidos**: `[products best_selling="true" limit="12"]`
- **Exibir Produtos Mais Recentes**: `[products orderby="date" order="DESC" limit="12"]`

## CSS Personalizado

Para adicionar o CSS personalizado:

1. **Via Plugin**:
   - Instale o plugin "Simple Custom CSS and JS"
   - Vá para **Aparência > CSS & JS Personalizado**
   - Clique em **Adicionar CSS**
   - Cole o conteúdo do arquivo `pdv-vendas-style.css`

2. **Via Personalizador**:
   - Vá para **Aparência > Personalizar**
   - Clique em **CSS Adicional**
   - Cole o conteúdo do arquivo `pdv-vendas-style.css`

## Verificação Rápida

- A página inicial está exibindo produtos? ✓
- O design está parecido com o app PDV Vendas? ✓
- Os produtos estão organizados em uma grade? ✓
- O site é responsivo em dispositivos móveis? ✓
- Os links de navegação estão funcionando? ✓
- O carrinho está funcionando? ✓

## Solução de Problemas Comuns

- **Produtos não aparecem**: Verifique se existem produtos publicados e se o shortcode está correto
- **Estilo não aplicado**: Limpe o cache do site e do navegador
- **Erro 404**: Verifique as configurações de permalinks
- **Imagens não carregam**: Verifique as permissões de upload e o tamanho máximo de upload

## Recursos Adicionais

- [Documentação do WooCommerce](https://docs.woocommerce.com/)
- [Shortcodes do WooCommerce](https://docs.woocommerce.com/document/woocommerce-shortcodes/)
- [Personalização de Temas WordPress](https://developer.wordpress.org/themes/basics/)
