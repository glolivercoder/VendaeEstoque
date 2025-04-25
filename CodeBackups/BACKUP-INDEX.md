# Índice de Backups do Sistema PDV Vendas

## Backups Individuais

Os seguintes arquivos de backup estão disponíveis:

1. **App.jsx.backup**
   - Arquivo principal da aplicação
   - Contém a lógica central do sistema PDV
   - Data do backup: 24/04/2025

2. **ShippingCalculator.jsx.backup**
   - Componente da calculadora de frete
   - Implementa a funcionalidade de cálculo de frete e integração com transportadoras
   - Data do backup: 24/04/2025

3. **SaleConfirmationPopup.jsx.backup**
   - Componente de confirmação de venda
   - Exibe os detalhes da venda e permite a impressão do recibo
   - Data do backup: 24/04/2025

4. **Vendors.jsx.backup**
   - Componente de gerenciamento de fornecedores
   - Permite adicionar, editar e excluir fornecedores
   - Data do backup: 24/04/2025

5. **ClientManagement.jsx.backup**
   - Componente de gerenciamento de clientes
   - Permite adicionar, editar e excluir clientes
   - Data do backup: 24/04/2025

6. **database.js.backup**
   - Serviço de banco de dados
   - Implementa as operações CRUD para produtos, clientes, fornecedores e vendas
   - Data do backup: 24/04/2025

## Backup Completo

Um backup completo do sistema foi criado em:

- **FullBackup_2025-04-24_18-38-15**
  - Contém todos os componentes principais do sistema
  - Inclui arquivos de estilo e bibliotecas
  - Estrutura de diretórios completa

## Scripts de Backup

Os seguintes scripts estão disponíveis para gerenciar backups:

1. **update-backups.bat**
   - Atualiza os backups individuais com as versões mais recentes dos arquivos
   - Use este script após fazer alterações nos arquivos

2. **restore-backups.bat**
   - Restaura todos os arquivos a partir dos backups individuais
   - Use este script para reverter para a última versão de backup

3. **backup-all-components.bat**
   - Cria um backup completo do sistema com data e hora
   - Inclui todos os componentes, serviços, bibliotecas e estilos
   - Use este script periodicamente para criar snapshots completos do sistema

## Como Usar os Backups

### Restaurar Backups Individuais

Para restaurar um arquivo específico:

```bash
copy /Y CodeBackups\App.jsx.backup src\App.jsx
```

### Restaurar Backup Completo

Para restaurar um backup completo:

1. Navegue até o diretório do backup completo
2. Copie os arquivos para os diretórios correspondentes no projeto

```bash
xcopy /E /Y CodeBackups\FullBackup_2025-04-24_18-38-15\src\* src\
```

## Histórico de Backups

| Data       | Tipo    | Descrição                                      |
|------------|---------|------------------------------------------------|
| 24/04/2025 | Individual | Backup inicial dos componentes principais   |
| 24/04/2025 | Completo   | Backup completo do sistema                  |
