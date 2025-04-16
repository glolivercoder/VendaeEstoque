# Browser-Use Web UI

![Browser Use Web UI](https://github.com/browser-use/web-ui/raw/main/assets/web-ui.png)

## Visão Geral

O Browser-Use Web UI é uma solução avançada para controle de navegadores que resolve problemas de autenticação e permite que agentes de IA interajam com sites de forma eficiente. Esta ferramenta é especialmente útil para automatizar tarefas em sites que requerem autenticação, como o WooCommerce e WordPress.

## Principais Recursos

### Interface Web Amigável
- Construída com Gradio para fácil interação
- Suporte à maioria das funcionalidades do `browser-use`
- Design intuitivo para usuários de todos os níveis

### Suporte Amplo a Modelos de IA
- Integração com diversos LLMs (Large Language Models):
  - Google
  - OpenAI
  - Azure OpenAI
  - Anthropic
  - DeepSeek
  - Ollama
  - E mais...

### Suporte a Navegador Personalizado
- Use seu próprio navegador Chrome
- Elimina a necessidade de fazer login novamente em sites
- Resolve problemas de autenticação
- Suporte a gravação de tela em alta definição

### Sessões Persistentes de Navegador
- Mantenha o navegador aberto entre tarefas de IA
- Visualize o histórico completo e o estado das interações
- Melhora a eficiência em tarefas sequenciais

## Benefícios para Integração com WooCommerce/WordPress

1. **Resolução de Problemas de Autenticação**
   - Supera desafios de login e autenticação em dois fatores
   - Mantém sessões ativas entre interações

2. **Automação de Tarefas Administrativas**
   - Gerenciamento de produtos no WooCommerce
   - Publicação e edição de conteúdo no WordPress
   - Configuração de plugins e temas

3. **Integração com APIs**
   - Facilita a comunicação entre sistemas
   - Automatiza fluxos de trabalho complexos

4. **Solução para Uploads de Imagens**
   - Resolve problemas de upload de imagens no WooCommerce
   - Gerencia galerias de produtos de forma eficiente

## Requisitos do Sistema

- Python 3.11 ou superior
- Git (para clonar o repositório)
- Chrome ou Chromium instalado
- Docker (opcional, para instalação via contêiner)

## Instalação

### Opção 1: Instalação Local

1. **Clone o Repositório**
   ```bash
   git clone https://github.com/browser-use/web-ui.git
   cd web-ui
   ```

2. **Configure o Ambiente Python**
   ```bash
   # Usando uv (recomendado)
   uv venv --python 3.11
   
   # Ative o ambiente virtual (Windows)
   .venv\Scripts\activate
   
   # Ative o ambiente virtual (PowerShell)
   .\\.venv\Scripts\Activate.ps1
   
   # Ative o ambiente virtual (macOS/Linux)
   source .venv/bin/activate
   ```

3. **Instale as Dependências**
   ```bash
   uv pip install -r requirements.txt
   
   # Instale navegadores no Playwright
   playwright install --with-deps chromium
   ```

4. **Configure o Ambiente**
   ```bash
   # Windows
   copy .env.example .env
   
   # macOS/Linux/PowerShell
   cp .env.example .env
   
   # Edite o arquivo .env com suas chaves de API
   ```

### Opção 2: Instalação via Docker

1. **Clone o Repositório**
   ```bash
   git clone https://github.com/browser-use/web-ui.git
   cd web-ui
   ```

2. **Configure o Ambiente**
   ```bash
   # Windows
   copy .env.example .env
   
   # macOS/Linux/PowerShell
   cp .env.example .env
   
   # Edite o arquivo .env com suas chaves de API
   ```

3. **Execute com Docker**
   ```bash
   # Construa e inicie o contêiner (navegador fecha após tarefas)
   docker compose up --build
   
   # Ou execute com navegador persistente
   CHROME_PERSISTENT_SESSION=true docker compose up --build
   ```

4. **Acesse a Aplicação**
   - Interface Web: Abra `http://localhost:7788` no seu navegador
   - Visualizador VNC: Abra `http://localhost:6080/vnc.html`
     - Senha VNC padrão: "youvncpassword"
     - Pode ser alterada definindo `VNC_PASSWORD` no arquivo `.env`

## Uso

### Configuração Local

1. **Execute a WebUI**
   ```bash
   python webui.py --ip 127.0.0.1 --port 7788
   ```

2. **Opções da WebUI**
   - `--ip`: Endereço IP para vincular a WebUI. Padrão: `127.0.0.1`
   - `--port`: Porta para vincular a WebUI. Padrão: `7788`
   - `--theme`: Tema para a interface. Padrão: `Ocean`
   - `--dark-mode`: Ativa o modo escuro

3. **Acesse a WebUI**
   - Abra seu navegador e acesse `http://127.0.0.1:7788`

4. **Use Seu Próprio Navegador (Opcional)**
   - Configure `CHROME_PATH` para o caminho executável do seu navegador
   - Configure `CHROME_USER_DATA` para o diretório de dados do usuário
   - Feche todas as janelas do Chrome
   - Abra a WebUI em um navegador que não seja o Chrome
   - Marque a opção "Use Own Browser" nas configurações

5. **Mantenha o Navegador Aberto (Opcional)**
   - Defina `CHROME_PERSISTENT_SESSION=true` no arquivo `.env`

## Aplicação no Projeto PDV Vendas

O Browser-Use Web UI pode ser utilizado para resolver os problemas de integração entre o PDV Vendas e o WooCommerce/WordPress, especialmente:

1. **Sincronização de Produtos**
   - Automatiza a transferência de produtos selecionados do PDV Vendas para o WooCommerce
   - Resolve problemas de upload de imagens

2. **Autenticação Simplificada**
   - Utiliza o navegador do usuário com sessões já autenticadas
   - Elimina problemas de credenciais e tokens

3. **Monitoramento Visual**
   - Permite visualizar todo o processo de integração em tempo real
   - Facilita a depuração de problemas

4. **Persistência de Sessão**
   - Mantém o estado entre operações de sincronização
   - Reduz a necessidade de reautenticação constante

## Conclusão

O Browser-Use Web UI oferece uma solução robusta para os desafios de automação e integração com sites que requerem autenticação. Sua capacidade de usar o navegador do usuário e manter sessões persistentes o torna ideal para resolver os problemas de integração entre o PDV Vendas e o WooCommerce/WordPress.

---

*Este README foi criado para documentar a implementação do Browser-Use Web UI como solução para os problemas de integração com WooCommerce.*
