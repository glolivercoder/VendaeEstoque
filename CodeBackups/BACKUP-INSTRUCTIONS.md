# Instruções de Backup do Sistema PDV Vendas

## Importância dos Backups

Os backups são essenciais para proteger o código-fonte do sistema PDV Vendas contra:

1. **Perda acidental de dados**: Alterações incorretas ou exclusões acidentais de código
2. **Corrupção de arquivos**: Problemas durante a edição ou salvamento de arquivos
3. **Falhas de sistema**: Problemas com o sistema operacional ou hardware
4. **Erros de desenvolvimento**: Alterações que introduzem bugs ou comportamentos inesperados

## Arquivos Críticos

Os seguintes arquivos são considerados críticos para o funcionamento do sistema:

1. **App.jsx**: Contém a lógica principal da aplicação e gerencia o estado global
2. **ShippingCalculator.jsx**: Implementa a calculadora de frete e integração com transportadoras
3. **SaleConfirmationPopup.jsx**: Gerencia a confirmação de vendas e geração de recibos
4. **Vendors.jsx**: Gerencia fornecedores e catálogos de produtos
5. **ClientManagement.jsx**: Gerencia clientes e suas informações
6. **database.js**: Implementa a persistência de dados e operações de banco de dados

## Quando Atualizar os Backups

Recomenda-se atualizar os backups nas seguintes situações:

1. **Antes de implementar novas funcionalidades**: Para garantir que você possa reverter as alterações se necessário
2. **Após correções de bugs**: Para preservar o código que funciona corretamente
3. **Antes de refatorações**: Para manter uma versão estável do código antes de reorganizá-lo
4. **Periodicamente**: Pelo menos uma vez por semana, mesmo sem alterações significativas

## Como Usar os Scripts de Backup

### Atualizar Backups

Para atualizar todos os backups com as versões mais recentes dos arquivos:

1. Abra um prompt de comando no diretório raiz do projeto
2. Execute o script `CodeBackups/update-backups.bat`

```
cd /caminho/para/o/projeto
CodeBackups\update-backups.bat
```

### Restaurar Backups

Para restaurar todos os arquivos a partir dos backups:

1. Abra um prompt de comando no diretório raiz do projeto
2. Execute o script `CodeBackups/restore-backups.bat`

```
cd /caminho/para/o/projeto
CodeBackups\restore-backups.bat
```

### Restaurar Arquivos Específicos

Para restaurar apenas um arquivo específico:

```
copy /Y CodeBackups\App.jsx.backup src\App.jsx
```

## Boas Práticas

1. **Mantenha um histórico de backups**: Considere criar cópias datadas dos backups para manter um histórico de alterações
2. **Documente as alterações**: Mantenha um registro das alterações feitas em cada arquivo
3. **Teste após restauração**: Sempre teste o sistema após restaurar arquivos de backup
4. **Use controle de versão**: Além dos backups locais, mantenha o código em um sistema de controle de versão como Git

## Solução de Problemas

Se encontrar problemas ao restaurar os backups:

1. Verifique se os caminhos dos arquivos estão corretos
2. Certifique-se de que os arquivos de backup existem e não estão corrompidos
3. Verifique se você tem permissões para escrever nos diretórios de destino
4. Se necessário, restaure manualmente copiando e colando o conteúdo dos arquivos

## Contato para Suporte

Em caso de problemas com os backups, entre em contato com o administrador do sistema.
