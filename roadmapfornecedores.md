# Roadmap para Integração da Aba Fornecedores

## Resumo
Este roadmap detalha as etapas necessárias para implementar completamente a funcionalidade de gerenciamento de fornecedores no aplicativo de estoque, incluindo a integração com a barra lateral (sidebar) e todas as operações CRUD (Criar, Ler, Atualizar, Deletar).

## Progresso Atual
- ✅ Adicionadas funções de banco de dados para fornecedores (addVendor, getVendors)
- ✅ Adicionadas funções de banco de dados para atualizar e excluir fornecedores (updateVendor, deleteVendor)
- ✅ Adicionadas funções de manipulação de fornecedores no App.jsx (handleAddVendor, handleUpdateVendor, handleDeleteVendor)
- ✅ Adicionado botão de Fornecedores na barra lateral
- ✅ Adicionado popup para exibir a aba de Fornecedores

## Tarefas Pendentes

### 1. Criar o Componente Vendors
- **Arquivo**: `src/pages/Vendors.jsx`
- **Descrição**: Criar o componente que exibirá a lista de fornecedores e permitirá adicionar, editar e excluir fornecedores
- **Campos necessários**:
  - Nome
  - Descrição
  - CNPJ (com máscara)
  - URL
  - Email
  - WhatsApp (com máscara)
  - Telegram (com máscara)
  - Instagram
  - Produtos do fornecedor
- **Funcionalidades**:
  - Exibir ícones (favicons) para WhatsApp, Telegram, Instagram, email e URL
  - Ativar aplicativos relacionados ao clicar nos ícones

### 2. Implementar Formulário de Adição de Fornecedor
- **Arquivo**: `src/pages/Vendors.jsx`
- **Descrição**: Criar formulário para adicionar novos fornecedores
- **Funcionalidades**:
  - Validação de campos obrigatórios
  - Máscara para CNPJ, WhatsApp e Telegram
  - Botão para salvar novo fornecedor

### 3. Implementar Formulário de Edição de Fornecedor
- **Arquivo**: `src/pages/Vendors.jsx`
- **Descrição**: Criar formulário para editar fornecedores existentes
- **Funcionalidades**:
  - Preencher formulário com dados do fornecedor selecionado
  - Validação de campos obrigatórios
  - Máscara para CNPJ, WhatsApp e Telegram
  - Botão para salvar alterações

### 4. Implementar Funcionalidade de Exclusão de Fornecedor
- **Arquivo**: `src/pages/Vendors.jsx`
- **Descrição**: Adicionar botão e confirmação para excluir fornecedores
- **Funcionalidades**:
  - Confirmação antes de excluir
  - Atualização da lista após exclusão

### 5. Implementar Listagem de Fornecedores
- **Arquivo**: `src/pages/Vendors.jsx`
- **Descrição**: Exibir lista de fornecedores com opções de filtro e pesquisa
- **Funcionalidades**:
  - Pesquisa por nome ou CNPJ
  - Ordenação por nome, data de criação, etc.
  - Paginação (opcional)

### 6. Implementar Detalhes do Fornecedor
- **Arquivo**: `src/pages/Vendors.jsx`
- **Descrição**: Exibir detalhes completos do fornecedor ao clicar em um item da lista
- **Funcionalidades**:
  - Exibir todos os campos do fornecedor
  - Botões para editar ou excluir
  - Lista de produtos associados ao fornecedor

### 7. Integrar com Produtos
- **Arquivos**: `src/pages/Vendors.jsx` e `src/App.jsx`
- **Descrição**: Permitir associar produtos a fornecedores
- **Funcionalidades**:
  - Selecionar produtos existentes para associar ao fornecedor
  - Exibir produtos associados na visualização de detalhes do fornecedor

### 8. Implementar Funcionalidades de Contato
- **Arquivo**: `src/pages/Vendors.jsx`
- **Descrição**: Adicionar botões para contatar o fornecedor diretamente
- **Funcionalidades**:
  - Botão para enviar WhatsApp (abrir app ou web.whatsapp.com)
  - Botão para enviar email (mailto:)
  - Botão para abrir site do fornecedor
  - Botão para abrir perfil do Instagram
  - Botão para enviar mensagem no Telegram

## Arquivos a Serem Modificados/Criados

1. **src/pages/Vendors.jsx** (Criar)
   - Componente principal para gerenciamento de fornecedores

2. **src/App.jsx** (Modificar)
   - Já modificado para incluir:
     - Estado para controlar a exibição da aba de fornecedores
     - Funções para manipular fornecedores
     - Botão na barra lateral para abrir a aba de fornecedores
     - Popup para exibir o componente Vendors

3. **src/services/database.js** (Modificar)
   - Já modificado para incluir:
     - Funções para adicionar, obter, atualizar e excluir fornecedores

4. **src/components/VendorForm.jsx** (Opcional - Criar)
   - Componente de formulário reutilizável para adicionar/editar fornecedores

## Considerações Técnicas

1. **Máscaras de Input**
   - Utilizar biblioteca como react-input-mask para CNPJ, WhatsApp e Telegram

2. **Validações**
   - Validar formato de email
   - Validar formato de CNPJ
   - Validar formato de números de telefone

3. **Responsividade**
   - Garantir que a interface funcione bem em dispositivos móveis e desktop

4. **Performance**
   - Implementar paginação ou virtualização se a lista de fornecedores for grande

## Próximos Passos Imediatos

1. Criar o componente Vendors.jsx com a estrutura básica
2. Implementar o formulário de adição de fornecedor
3. Implementar a listagem de fornecedores
4. Implementar a edição e exclusão de fornecedores
5. Adicionar funcionalidades de contato e integração com produtos
