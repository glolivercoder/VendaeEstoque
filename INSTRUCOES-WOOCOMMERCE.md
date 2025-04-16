# Instruções para Integração com WooCommerce

Este documento contém instruções para configurar e usar a integração entre o PDV Vendas e o WooCommerce.

## Configuração do WooCommerce

1. Certifique-se de que o WooCommerce está instalado e ativado no seu site WordPress.
2. Vá para **WooCommerce > Configurações > Avançado > REST API**.
3. Clique em **Adicionar chave** para criar uma nova chave de API.
4. Preencha os seguintes campos:
   - **Descrição**: PDV Vendas
   - **Permissões**: Leitura/Escrita
5. Clique em **Gerar chave**.
6. Anote as credenciais geradas:
   - **Consumer Key**: `ck_d106765e36b9a6af0d22bd22571388ec3ad67378`
   - **Consumer Secret**: `cs_0d5d0255c002e137d48be4da75d5d87363278bd6`

## Uso da Integração

Para enviar produtos do PDV Vendas para o WooCommerce:

1. No PDV Vendas, vá para a tela principal.
2. Clique no botão **Exportar para Site** no menu lateral.
3. Selecione o método **WooCommerce**.
4. Selecione os produtos que deseja exportar marcando as caixas de seleção.
5. Clique em **Exportar**.
6. Aguarde a conclusão da exportação.
7. Verifique o resultado da exportação na mensagem exibida.

## Verificação no WooCommerce

Após exportar os produtos, você pode verificar se eles foram adicionados corretamente no WooCommerce:

1. Acesse o painel de administração do WordPress.
2. Vá para **Produtos > Todos os Produtos**.
3. Verifique se os produtos exportados estão listados.
4. Clique em um produto para ver os detalhes.

## Solução de Problemas

Se encontrar problemas com a integração, verifique o seguinte:

1. **Credenciais da API**: Certifique-se de que as credenciais da API do WooCommerce estão corretas.
2. **Conexão com a Internet**: Verifique se o computador tem conexão com a Internet.
3. **Firewall**: Verifique se o firewall não está bloqueando a conexão.
4. **Logs do Console**: Verifique os logs do console para identificar erros específicos.

## Logs de Erro Comuns

### Erro de Autenticação

Se você vir um erro como `invalid_username` ou `401 Unauthorized`, verifique se as credenciais da API estão corretas.

### Erro de Formato de Dados

Se você vir um erro como `400 Bad Request`, pode haver um problema com o formato dos dados enviados. Verifique se os produtos têm todas as informações necessárias, como nome, preço e descrição.

### Erro de Conexão

Se você vir um erro como `Network Error` ou `Connection Refused`, verifique sua conexão com a Internet e se o site do WordPress está acessível.

## Suporte

Para obter suporte adicional, entre em contato com a equipe de suporte do PDV Vendas.
