# Backups do Sistema PDV Vendas

Este diretório contém backups dos principais componentes do sistema PDV Vendas. Estes backups foram criados para proteger o código-fonte das funcionalidades essenciais do sistema.

## Arquivos de Backup

1. **App.jsx.backup**
   - Arquivo principal da aplicação
   - Contém a lógica central do sistema PDV
   - Data do backup: 24/04/2025

2. **ShippingCalculator.jsx.backup**
   - Componente da calculadora de frete
   - Implementa a funcionalidade de cálculo de frete e integração com transportadoras
   - Inclui o preenchimento automático do CEP do cliente
   - Data do backup: 24/04/2025

3. **SaleConfirmationPopup.jsx.backup**
   - Componente de confirmação de venda
   - Exibe os detalhes da venda e permite a impressão do recibo
   - Implementa a integração com a calculadora de frete
   - Data do backup: 24/04/2025

4. **Vendors.jsx.backup**
   - Componente de gerenciamento de fornecedores
   - Permite adicionar, editar e excluir fornecedores
   - Implementa a importação de catálogos de produtos
   - Data do backup: 24/04/2025

5. **ClientManagement.jsx.backup**
   - Componente de gerenciamento de clientes
   - Permite adicionar, editar e excluir clientes
   - Implementa a busca de clientes por nome, CPF ou RG
   - Data do backup: 24/04/2025

6. **database.js.backup**
   - Serviço de banco de dados
   - Implementa as operações CRUD para produtos, clientes, fornecedores e vendas
   - Gerencia a persistência de dados no IndexedDB
   - Data do backup: 24/04/2025

## Como Restaurar

Para restaurar um arquivo de backup, copie-o para o local original substituindo o arquivo existente:

```bash
# Exemplo para restaurar o App.jsx
cp CodeBackups/App.jsx.backup src/App.jsx

# Exemplo para restaurar o ShippingCalculator.jsx
cp CodeBackups/ShippingCalculator.jsx.backup src/components/ShippingCalculator.jsx
```

## Observações Importantes

- Estes backups devem ser atualizados regularmente para refletir as alterações mais recentes no código.
- Recomenda-se criar novos backups antes de fazer alterações significativas no código.
- Além destes backups locais, é importante manter um sistema de controle de versão (como Git) atualizado.
