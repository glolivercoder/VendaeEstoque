# Roadmap: Implementação da Aba de Fornecedores

## Visão Geral
Este roadmap detalha a implementação de uma nova aba "Fornecedores" no aplicativo VendaEstoque, com campos específicos e funcionalidades para gerenciar fornecedores e seus produtos.

## Requisitos
- Adicionar uma aba chamada "Fornecedores" na interface principal do aplicativo
- Implementar os seguintes campos para cadastro de fornecedores:
  - Nome (não obrigatório)
  - Descrição (não obrigatório)
  - CNPJ com máscara (não obrigatório)
  - URL (não obrigatório)
  - Email (não obrigatório)
  - WhatsApp com máscara (não obrigatório)
  - Telegram com máscara (não obrigatório)
  - Instagram (não obrigatório)
  - Produtos do fornecedor (mesmos campos da aba "Adicionar Novo Item")
- Adicionar favicons para WhatsApp, Telegram, Instagram, Email e URL
- Implementar funcionalidade para que os favicons ativem os aplicativos relacionados no dispositivo

## Plano de Implementação

### 1. Criar o componente VendorPage.jsx
- Desenvolver um novo componente React para a página de Fornecedores
- Implementar a estrutura básica da página com layout responsivo
- Adicionar título e descrição da página

### 2. Adicionar os campos solicitados
- Implementar campo para Nome do fornecedor
- Implementar campo para Descrição do fornecedor
- Implementar campo para CNPJ com máscara de formatação
- Implementar campo para URL do site do fornecedor
- Implementar campo para Email do fornecedor
- Implementar campo para WhatsApp com máscara de formatação
- Implementar campo para Telegram com máscara de formatação
- Implementar campo para Instagram do fornecedor
- Garantir que nenhum campo seja marcado como obrigatório

### 3. Adicionar favicons e funcionalidades de ativação
- Adicionar favicon para WhatsApp que ativa o aplicativo WhatsApp
- Adicionar favicon para Telegram que ativa o aplicativo Telegram
- Adicionar favicon para Instagram que ativa o aplicativo Instagram
- Adicionar favicon para Email que ativa o cliente de email padrão
- Adicionar favicon para URL que abre o navegador com o site do fornecedor
- Implementar funções de manipulação para cada tipo de ativação

### 4. Implementar funcionalidade para produtos do fornecedor
- Criar seção para adicionar produtos do fornecedor
- Reutilizar os mesmos campos da aba "Adicionar Novo Item"
- Implementar funcionalidade para adicionar múltiplos produtos
- Implementar funcionalidade para editar produtos existentes
- Implementar funcionalidade para remover produtos

### 5. Integrar a página ao sistema de navegação
- Adicionar a nova aba "Fornecedores" ao menu de navegação principal
- Implementar a lógica de roteamento para a nova página
- Garantir que a navegação funcione corretamente em dispositivos móveis e desktop

### 6. Atualizar o banco de dados
- Modificar o esquema do banco de dados para suportar os novos campos de fornecedores
- Implementar funções para salvar, atualizar e recuperar dados de fornecedores
- Garantir a integridade dos dados entre fornecedores e seus produtos

### 7. Testes e Validação
- Testar a funcionalidade de todos os campos
- Verificar se as máscaras de formatação funcionam corretamente
- Testar a ativação dos aplicativos através dos favicons
- Validar a integração com o restante do aplicativo
- Testar em diferentes dispositivos e tamanhos de tela

## Detalhes Técnicos

### Máscaras de Formatação
- CNPJ: Formato XX.XXX.XXX/XXXX-XX
- WhatsApp: Formato (XX) XXXXX-XXXX
- Telegram: Formato semelhante ao WhatsApp

### Ativação de Aplicativos
- WhatsApp: Usar protocolo `whatsapp://send?phone=NUMERO`
- Telegram: Usar protocolo `tg://resolve?domain=USUARIO`
- Instagram: Usar protocolo `instagram://user?username=USUARIO`
- Email: Usar protocolo `mailto:EMAIL`
- URL: Abrir no navegador padrão

### Armazenamento de Dados
- Utilizar o IndexedDB existente no aplicativo
- Criar uma nova store para fornecedores
- Estabelecer relacionamento entre fornecedores e produtos

## Cronograma Estimado
1. Criação do componente e estrutura básica: 1 dia
2. Implementação dos campos e máscaras: 1 dia
3. Adição de favicons e funcionalidades de ativação: 1 dia
4. Implementação da seção de produtos: 2 dias
5. Integração com o sistema de navegação: 1 dia
6. Atualização do banco de dados: 1 dia
7. Testes e ajustes finais: 1 dia

**Tempo total estimado: 8 dias**
