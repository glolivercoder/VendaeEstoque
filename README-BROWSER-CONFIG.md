# Configuração do Browser-Use Web UI para Usar o Navegador Padrão

Este guia explica como configurar o Browser-Use Web UI para usar o navegador Chrome padrão em vez do navegador interno.

## Pré-requisitos

- Google Chrome instalado (caminho padrão: `C:\Program Files\Google\Chrome\Application\chrome.exe`)
- Browser-Use Web UI instalado e funcionando

## Passos para Configuração

### 1. Instalar a Extensão Browser-Use Helper

A extensão Browser-Use Helper é necessária para permitir que o UI Agent controle o Chrome.

Para instalar a extensão:

1. Execute o arquivo `install-extension.bat` ou use o comando:
   ```bash
   npm run install-extension
   ```

2. Siga as instruções na tela:
   - Clique em "Adicionar ao Chrome"
   - Confirme a instalação clicando em "Adicionar extensão"
   - Após a instalação, reinicie o Chrome

### 2. Configurar o Arquivo .env

O arquivo `.env` na pasta `web-ui` já foi configurado com as seguintes configurações:

```
CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe
CHROME_PERSISTENT_SESSION=true
```

Se o seu Chrome estiver instalado em um local diferente, edite o caminho conforme necessário.

### 3. Reiniciar o UI Agent

Após instalar a extensão e configurar o arquivo `.env`, reinicie o UI Agent:

1. Feche o UI Agent se estiver em execução
2. Execute o arquivo `start-webui.bat` ou use o comando:
   ```bash
   npm run start-webui
   ```

### 4. Configurar o UI Agent para Usar o Navegador Próprio

Quando o UI Agent iniciar:

1. Acesse a interface web em `http://127.0.0.1:7788`
2. Clique em "Settings" no canto superior direito
3. Marque a opção "Use Own Browser"
4. Clique em "Save"

## Verificação

Para verificar se a configuração foi bem-sucedida:

1. Inicie uma nova conversa clicando em "New Chat"
2. Digite uma instrução simples como "Abra o Google"
3. O Chrome padrão deve abrir e navegar até o Google

## Solução de Problemas

### O Chrome não abre

- Verifique se o caminho do Chrome no arquivo `.env` está correto
- Certifique-se de que a extensão Browser-Use Helper está instalada
- Reinicie o Chrome e o UI Agent

### Erro de Conexão com o Chrome

- Verifique se o Chrome está fechado antes de iniciar o UI Agent
- Certifique-se de que a porta de depuração (9222) não está sendo usada por outro aplicativo
- Tente definir `CHROME_USER_DATA` para um diretório específico no arquivo `.env`

### A Extensão Não Aparece no Chrome

- Verifique se você está usando o Chrome e não outro navegador
- Acesse `chrome://extensions/` para verificar se a extensão está instalada e ativada
- Reinstale a extensão se necessário

---

*Este guia foi criado para facilitar a configuração do Browser-Use Web UI para usar o navegador Chrome padrão.*
