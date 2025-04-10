# PDV Vendas - WordPress Direct Integration

Integração direta entre o aplicativo PDV Vendas e o WordPress, sem necessidade de ferramentas externas como Fiqon ou n8n.

## Recursos

- Sincronização bidirecional de produtos e estoque
- Captura de itens selecionados no console do navegador do PDV Vendas
- Atualização automática de estoque quando ocorrem vendas no WordPress
- Notificação ao PDV Vendas quando o estoque é alterado no WordPress
- Shortcode para exibir produtos sincronizados em qualquer página do WordPress

## Instalação

1. Faça o upload da pasta `pdv-wordpress-direct-integration` para o diretório `/wp-content/plugins/` do seu WordPress
2. Ative o plugin através do menu 'Plugins' no WordPress
3. Configure a URL do webhook do PDV Vendas em 'PDV Vendas' no menu de administração

## Uso

### No WordPress

1. Configure a URL do webhook do PDV Vendas em 'PDV Vendas' no menu de administração
2. Use o shortcode `[pdv_vendas_products]` em qualquer página ou post para exibir os produtos sincronizados
3. Opções do shortcode:
   - `category`: Filtrar por categoria (ex: `[pdv_vendas_products category="Ferramentas"]`)
   - `limit`: Limitar o número de produtos (ex: `[pdv_vendas_products limit="10"]`)
   - `orderby`: Ordenar por (ex: `[pdv_vendas_products orderby="price"]`)
   - `order`: Ordem (ex: `[pdv_vendas_products order="desc"]`)

### No PDV Vendas

1. Adicione o seguinte código ao final da URL do PDV Vendas: `?pdv_sync=1`
2. Um botão "Sincronizar com WordPress" será adicionado à interface
3. Selecione os produtos desejados usando os checkboxes
4. Clique no botão "Sincronizar com WordPress" para enviar os produtos selecionados para o WordPress

### Sincronização Manual pelo Console

Se preferir, você pode sincronizar manualmente pelo console do navegador:

1. Abra o console do navegador (F12 ou Ctrl+Shift+I)
2. Execute o comando: `PDVWordPressSync.syncSelectedItems()`

## Endpoints da API

O plugin expõe os seguintes endpoints REST:

- `POST /wp-json/pdv-vendas/v1/sync`: Sincronizar produtos
- `POST /wp-json/pdv-vendas/v1/clear`: Limpar produtos existentes
- `POST /wp-json/pdv-vendas/v1/stock`: Atualizar estoque
- `GET /wp-json/pdv-vendas/v1/get-products`: Obter produtos
- `POST /wp-json/pdv-vendas/v1/webhook`: Receber webhooks do PDV Vendas

## Autenticação

Todos os endpoints da API requerem autenticação usando um dos seguintes métodos:

1. Cabeçalho `X-PDV-API-Key` com o valor `OxCq4oUPrd5hqxPEq1zdjEd4`
2. Cabeçalhos `X-PDV-Username` e `X-PDV-Password` com os valores `gloliverx` e `OxCq4oUPrd5hqxPEq1zdjEd4` respectivamente

## Sincronização Bidirecional

### WordPress → PDV Vendas

Quando uma venda é concluída no WordPress, o plugin envia um webhook para o PDV Vendas com os detalhes da venda, incluindo os produtos vendidos e as quantidades. O PDV Vendas pode então atualizar seu estoque de acordo.

### PDV Vendas → WordPress

Quando produtos são selecionados no PDV Vendas e o botão de sincronização é clicado, os produtos são enviados para o WordPress. O WordPress cria ou atualiza os produtos correspondentes, incluindo descrições, preços, estoque e imagens.

## Requisitos

- WordPress 5.0 ou superior
- WooCommerce 4.0 ou superior
- PHP 7.2 ou superior

## Suporte

Para suporte, entre em contato com [suporte@pdvvendas.com](mailto:suporte@pdvvendas.com)

## Licença

Este plugin é licenciado sob a GPL v2 ou posterior.

## Créditos

Desenvolvido por PDV Vendas
