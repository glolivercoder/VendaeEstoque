# Browser-Use Web UI - Guia de Instalação e Uso

Este guia explica como instalar, configurar e usar o Browser-Use Web UI para automatizar tarefas no navegador.

## Pré-requisitos

- Node.js 14 ou superior
- Python 3.11 ou superior
- Git
- Chrome ou Chromium instalado

## Instalação Rápida

1. **Instalar o Web UI**:
   ```bash
   npm run setup-webui
   ```

2. **Iniciar o Web UI**:
   ```bash
   npm run start-webui
   ```
   
   Ou simplesmente clique duas vezes no arquivo `start-webui.bat`.

## Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `npm run setup-webui` | Instala e configura o Browser-Use Web UI |
| `npm run start-webui` | Inicia o servidor Web UI |
| `npm run configure-chevereto` | Configura o Chevereto e o subdomínio "imagens" |

## Uso do Web UI

Após iniciar o Web UI, você pode acessá-lo em `http://127.0.0.1:7788` no seu navegador.

### Configuração para Usar o Chrome Instalado

1. Abra o Web UI em um navegador que não seja o Chrome
2. Clique em "Settings" no canto superior direito
3. Marque a opção "Use Own Browser"
4. Clique em "Save"

### Criação de Scripts

1. Clique em "New Chat" para iniciar uma nova conversa
2. Digite suas instruções para o agente de IA
3. O agente usará o navegador para executar as tarefas solicitadas

## Solução de Problemas

### O Web UI não inicia

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

### Erro ao usar o navegador próprio

Certifique-se de que:
1. Todas as janelas do Chrome estão fechadas
2. O caminho para o Chrome está correto no arquivo `.env`
3. Você está acessando o Web UI em um navegador que não seja o Chrome

## Recursos Adicionais

- [Documentação oficial do Browser-Use Web UI](https://github.com/browser-use/web-ui)
- [Guia de configuração do Chevereto](README-CHEVERETO-SETUP.md)
- [Documentação de integração WordPress/WooCommerce](README-WordPress-WooCommerce-API.md)

---

*Este guia foi criado para facilitar o uso do Browser-Use Web UI para automação de tarefas no navegador.*
