# VendaEstoque WooCommerce Theme

Um tema personalizado para WooCommerce que exibe produtos na página inicial e suporta vídeos de produtos.

## Requisitos

- WordPress 5.0 ou superior
- WooCommerce 4.0 ou superior
- Plugin "Product Video Gallery for WooCommerce" instalado e ativado

## Arquivos Incluídos

Este pacote contém os seguintes arquivos:

1. **Arquivos do Tema**
   - Arquivos essenciais para o funcionamento do tema
   - Suporte completo ao WooCommerce
   - Exibição de produtos na página inicial

2. **Scripts de Instalação**
   - Scripts para empacotar e instalar o tema
   - Scripts para configurar o plugin de vídeo

3. **Documentação**
   - Instruções de instalação e configuração
   - Plano de implementação

## Instruções de Instalação

### Método 1: Instalação Manual

1. Execute um dos scripts de empacotamento para criar o arquivo ZIP do tema:
   - No Linux/Mac: `bash package-theme.sh`
   - No Windows: `.\package-theme.ps1` (Execute no PowerShell)

2. Faça login no painel administrativo do WordPress
3. Vá para Aparência > Temas > Adicionar novo > Enviar tema
4. Selecione o arquivo ZIP gerado e clique em "Instalar agora"
5. Após a instalação, clique em "Ativar"

### Método 2: Instalação via Script (Requer Node.js)

1. Instale as dependências necessárias:
   ```
   npm install axios form-data
   ```

2. Execute o script de instalação:
   ```
   node install-theme.js
   ```

## Configuração do Plugin de Vídeo

1. Certifique-se de que o plugin "Product Video Gallery for WooCommerce" está instalado e ativado
2. Execute o script de configuração:
   ```
   node configure-video-plugin.js
   ```

## Configuração da Página Inicial

Para exibir produtos na página inicial:

1. Vá para Configurações > Leitura
2. Em "Sua página inicial exibe", selecione "Uma página estática"
3. Para "Página inicial", selecione a página "Loja" (ou "Shop")
4. Clique em "Salvar alterações"

## Personalização do Tema

O tema pode ser personalizado através do Personalizador do WordPress:

1. Vá para Aparência > Personalizar
2. Explore as opções em "Opções do Tema" e "Opções do WooCommerce"
3. Ajuste as cores, layouts e outras configurações conforme necessário

## Adicionando Vídeos aos Produtos

1. Edite um produto no WooCommerce
2. Role para baixo até encontrar a seção "Product Video URL"
3. Insira a URL do YouTube do vídeo
4. Atualize o produto

## Suporte

Para suporte ou dúvidas, entre em contato através do email: glolivercoder@gmail.com
