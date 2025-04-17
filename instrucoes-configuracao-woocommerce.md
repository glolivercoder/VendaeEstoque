# Instruções para Configurar o WooCommerce

Este documento contém instruções passo a passo para configurar o WooCommerce para exibir produtos na página inicial e personalizar a interface para ficar parecida com o app PDV Vendas.

## 1. Fazer Backup do Site

Antes de fazer qualquer alteração, é importante criar um backup do site:

1. Execute o arquivo `backup-woocommerce.bat`
2. Siga as instruções para instalar o plugin UpdraftPlus
3. No painel do WordPress, vá para **UpdraftPlus Backups**
4. Clique em **Fazer Backup Agora**
5. Selecione todas as opções e clique em **Fazer Backup Agora**
6. Aguarde o backup ser concluído

## 2. Configurar a Página Inicial para Exibir Produtos

### Método 1: Usando o Script

1. Faça login no painel administrativo do WordPress
2. Abra o Console do navegador (F12 > Console)
3. Cole o conteúdo do arquivo `configure-woocommerce-homepage.js` e pressione Enter
4. Siga as instruções exibidas na tela

### Método 2: Configuração Manual

1. Faça login no painel administrativo do WordPress
2. Vá para **Páginas > Adicionar Nova**
3. Dê o título "Loja" à página
4. No editor, adicione o bloco "Produtos" ou o shortcode `[products limit="12" columns="4" orderby="date" order="DESC"]`
5. Publique a página
6. Vá para **Configurações > Leitura**
7. Selecione "Uma página estática" como página inicial
8. Escolha a página "Loja" que você acabou de criar
9. Salve as alterações

## 3. Personalizar a Aparência do Site

### Método 1: Usando o CSS Personalizado

1. Instale o plugin "Simple Custom CSS and JS"
   - Vá para **Plugins > Adicionar Novo**
   - Pesquise por "Simple Custom CSS and JS"
   - Instale e ative o plugin
2. Vá para **Aparência > CSS & JS Personalizado**
3. Clique em **Adicionar CSS**
4. Cole o conteúdo do arquivo `pdv-vendas-style.css`
5. Marque a opção "Adicionar apenas no front end"
6. Clique em "Publicar"

### Método 2: Usando o Personalizador

1. Vá para **Aparência > Personalizar**
2. Clique em **CSS Adicional**
3. Cole o conteúdo do arquivo `pdv-vendas-style.css`
4. Clique em "Publicar"

## 4. Configurar o Menu Principal

1. Vá para **Aparência > Menus**
2. Crie um novo menu ou edite o menu existente
3. Adicione as seguintes páginas ao menu:
   - Loja (página inicial)
   - Categorias (taxonomia de produto)
   - Minha Conta
   - Carrinho
4. Salve o menu e atribua-o à posição "Menu Principal"

## 5. Configurar o WooCommerce

1. Vá para **WooCommerce > Configurações**
2. Na aba **Produtos > Exibição**:
   - Defina "Página da loja" como a página "Loja" que você criou
   - Defina "Produtos por linha" como 4
   - Defina "Linhas por página" como 3
3. Na aba **Produtos > Inventário**:
   - Ative "Gerenciar estoque"
   - Defina "Notificação de estoque baixo" conforme necessário
4. Salve todas as alterações

## 6. Configurar Widgets

1. Vá para **Aparência > Widgets**
2. Adicione widgets relevantes às áreas de widget disponíveis:
   - Adicione "Filtro de Produtos por Preço" à barra lateral
   - Adicione "Filtro de Produtos por Atributo" à barra lateral
   - Adicione "Categorias de Produtos" à barra lateral

## 7. Verificar e Testar

1. Visite o site para verificar se os produtos estão sendo exibidos na página inicial
2. Teste a navegação e a funcionalidade do carrinho
3. Verifique se o design está parecido com o app PDV Vendas
4. Teste em dispositivos móveis para garantir que o site seja responsivo

## Solução de Problemas

Se os produtos não aparecerem na página inicial:

1. Verifique se o shortcode `[products]` foi adicionado corretamente à página
2. Verifique se a página está definida como página inicial em **Configurações > Leitura**
3. Verifique se existem produtos publicados no WooCommerce
4. Limpe o cache do site e do navegador

Se o estilo não for aplicado corretamente:

1. Verifique se o CSS foi adicionado corretamente
2. Limpe o cache do site e do navegador
3. Verifique se há conflitos com outros plugins ou temas

## Recursos Adicionais

- [Documentação do WooCommerce](https://docs.woocommerce.com/)
- [Shortcodes do WooCommerce](https://docs.woocommerce.com/document/woocommerce-shortcodes/)
- [Personalização de Temas WordPress](https://developer.wordpress.org/themes/basics/)
