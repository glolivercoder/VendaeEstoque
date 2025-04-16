# Configuração do Chevereto com Browser-Use Web UI

Este guia explica como configurar o Chevereto e o subdomínio "imagens" usando o Browser-Use Web UI.

## Pré-requisitos

- Node.js 14 ou superior
- Python 3.11 ou superior
- Git
- Chrome ou Chromium instalado
- Conta na Hostinger com acesso ao domínio achadinhoshopp.com.br

## Arquivos Incluídos

1. **setup-web-ui.js**: Script para instalar e configurar o Browser-Use Web UI
2. **configure-chevereto-webui.js**: Script para configurar o Chevereto e o subdomínio "imagens"

## Passo 1: Instalar e Configurar o Browser-Use Web UI

Execute o script para instalar e configurar o Browser-Use Web UI:

```bash
npm run setup-webui
```

Este script irá:
- Clonar o repositório Browser-Use Web UI
- Criar um ambiente virtual Python
- Instalar as dependências necessárias
- Configurar o arquivo .env
- Instalar os navegadores necessários
- Iniciar o Web UI (opcional)

## Passo 2: Configurar o Chevereto e o Subdomínio "imagens"

Execute o script para configurar o Chevereto e o subdomínio "imagens":

```bash
npm run configure-chevereto
```

Este script irá:
- Criar um script Python para o Browser-Use Web UI
- Fazer login no painel da Hostinger
- Criar o banco de dados para o Chevereto
- Criar o subdomínio "imagens"
- Fornecer instruções para completar a instalação

Durante a execução, você será solicitado a fornecer as seguintes informações:
- Email da Hostinger
- Senha da Hostinger
- Domínio principal (padrão: achadinhoshopp.com.br)
- Subdomínio para o Chevereto (padrão: imagens)
- Nome do banco de dados (padrão: chevereto)
- Usuário do banco de dados (padrão: gloliverx)
- Senha do banco de dados (padrão: Fml/N?|ZP*r9)

## Passo 3: Completar a Instalação do Chevereto

Após a execução do script, você precisará:

1. Fazer upload dos arquivos do Chevereto para o diretório `public_html/imagens/` no servidor da Hostinger
2. Acessar `https://imagens.achadinhoshopp.com.br/install` para iniciar o assistente de instalação
3. Usar as credenciais do banco de dados fornecidas durante a configuração

## Solução de Problemas

### O Browser-Use Web UI não inicia

Verifique se o Python está instalado corretamente:
```bash
python --version
```

Verifique se o ambiente virtual foi criado:
```bash
cd web-ui
.venv\Scripts\activate  # Windows
source .venv/bin/activate  # Linux/Mac
```

### Erro de login na Hostinger

Verifique se as credenciais da Hostinger estão corretas. Se necessário, redefina sua senha.

### Erro ao criar banco de dados ou subdomínio

Verifique se você tem permissões para criar bancos de dados e subdomínios na sua conta da Hostinger.

## Integração com WordPress/WooCommerce

Após a instalação do Chevereto, você pode integrá-lo com o WordPress/WooCommerce usando as credenciais configuradas no arquivo .env:

```
VITE_WORDPRESS_URL=https://achadinhoshopp.com.br/loja
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_40b4a1a674084d504579a2ba2d51530c260d3645
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_8fa4b36ab57ddb02415e4fc346451791ab1782f9
VITE_WORDPRESS_USERNAME=gloliverx
VITE_WORDPRESS_APP_PASSWORD=0lr4 umHb 8pfx 5Cqf v7KW oq8S
```

Para mais informações sobre a integração, consulte o arquivo `README-WordPress-WooCommerce-API.md`.

---

*Este guia foi criado para facilitar a configuração do Chevereto e sua integração com WordPress/WooCommerce.*
