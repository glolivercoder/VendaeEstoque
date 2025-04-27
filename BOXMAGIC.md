# BOXMAGIC - Sistema de Gerenciamento de Objetos em Caixas

## Visão Geral

BOXMAGIC é uma aplicação para catalogar, organizar e rastrear objetos armazenados em caixas. O sistema utiliza tecnologias de reconhecimento visual e OCR para identificar objetos e códigos, permitindo:

1. Reconhecimento de objetos através de imagens
2. Geração automática de descrições breves
3. Leitura de códigos QR, códigos de barras e texto manuscrito
4. Geração de códigos QR e códigos de barras para rastreamento
5. Organização de objetos em grupos e caixas
6. Busca rápida por objetos catalogados

## Tecnologias Utilizadas

O BOXMAGIC integra-se com múltiplas tecnologias:

- **Google Gemini** - Reconhecimento visual e geração de descrições
- **Tesseract OCR** - Reconhecimento de texto manuscrito
- **ZXing ou QuaggaJS** - Leitura e geração de códigos de barras
- **QRCode.js** - Geração de códigos QR
- **MySQL/SQLite** - Armazenamento de dados
- **React/Vite** - Interface de usuário

## Arquitetura do Sistema

O BOXMAGIC é composto por vários componentes principais:

1. **Módulo de Captura** - Responsável por capturar imagens de objetos e códigos
2. **Serviço de Reconhecimento** - Processa as imagens e identifica objetos/códigos
3. **Gerador de Descrições** - Cria descrições concisas dos objetos identificados
4. **Gerador de Códigos** - Cria códigos QR e de barras para rastreamento
5. **Banco de Dados** - Armazena informações sobre objetos e grupos
6. **Interface de Usuário** - Apresenta os dados e opções de interação

## Fluxo de Trabalho

### 1. Cadastro de Objetos

1. O usuário captura uma imagem do objeto usando a câmera ou seleciona do dispositivo
2. O sistema reconhece o objeto e gera uma descrição breve (máximo 2 linhas)
3. O usuário pode editar a descrição, se necessário
4. O sistema armazena a imagem e descrição no banco de dados
5. Um ID sequencial de 4 dígitos é atribuído ao objeto

### 2. Organização em Grupos e Caixas

1. O usuário seleciona objetos cadastrados para formar um grupo por categoria
2. O sistema gera um número sequencial de 4 dígitos para identificar a caixa física
3. O sistema gera um código QR ou código de barras baseado neste número sequencial
4. O usuário imprime o código e afixa-o na caixa física onde os objetos serão armazenados
5. O sistema associa todos os objetos do grupo à caixa identificada pelo código

### 3. Busca e Recuperação

1. O usuário escaneia o código QR/barras da caixa ou digita/escreve o número de 4 dígitos manualmente
2. O sistema identifica a caixa e todos os objetos armazenados nela
3. O sistema exibe a lista completa de objetos contidos na caixa, facilitando a localização do item desejado

## Interface do Usuário

A interface do BOXMAGIC é projetada para ser intuitiva e funcional, oferecendo:

### Tela Principal

```
+-------------------------------------------------------+
|                     BOXMAGIC                          |
+-------------------------------------------------------+
|  [📷] [📁]                           [🔍 Buscar]     |
+-------------------------------------------------------+
|                                                       |
|  [Lista de Objetos Recentes]                          |
|  +-------------------+  +-------------------+         |
|  | [Imagem]          |  | [Imagem]          |         |
|  | Descrição breve   |  | Descrição breve   |         |
|  | #0001   [X] [✎]  |  | #0002   [X] [✎]  |         |
|  +-------------------+  +-------------------+         |
|                                                       |
|  +-------------------+  +-------------------+         |
|  | [Imagem]          |  | [Imagem]          |         |
|  | Descrição breve   |  | Descrição breve   |         |
|  | #0003   [X] [✎]  |  | #0004   [X] [✎]  |         |
|  +-------------------+  +-------------------+         |
|                                                       |
+-------------------------------------------------------+
|  [Grupos]    [Configurações]    [Exportar]            |
+-------------------------------------------------------+
```

### Botões de Captura Rápida

Na parte superior da tela principal, dois botões de ação rápida estão disponíveis:

1. **Botão de Câmera [📷]** - Abre a câmera do dispositivo diretamente
2. **Botão de Arquivo [📁]** - Abre o explorador de arquivos do dispositivo

Ao clicar em qualquer um desses botões, um pop-up de seleção de modo é exibido:

```
+-------------------------------------------------------+
|             Selecione o Modo de Captura               |
+-------------------------------------------------------+
|                                                       |
|  [🔍 MagicBox]        [👁️ ObjectView]                |
|  Ler códigos          Reconhecer objetos              |
|                                                       |
|                [Cancelar]                             |
+-------------------------------------------------------+
```

### Tela de Cadastro de Objeto

```
+-------------------------------------------------------+
|  ← Voltar                 NOVO OBJETO                 |
+-------------------------------------------------------+
|                                                       |
|  [Área para Captura/Visualização de Imagem]           |
|  [Capturar]                                           |
|                                                       |
+-------------------------------------------------------+
|  Descrição:                                           |
|  [________________________] (máx. 2 linhas)           |
|                                                       |
|  ID: #0005 (gerado automaticamente)                   |
|                                                       |
|  [Gerar Código QR]  [Gerar Código de Barras]          |
|                                                       |
|  [      Cancelar      ]    [      Salvar      ]       |
+-------------------------------------------------------+
```

### Tela de Caixas e Categorias

```
+-------------------------------------------------------+
|  ← Voltar                    CAIXAS                   |
+-------------------------------------------------------+
|  [Nova Caixa]                                         |
+-------------------------------------------------------+
|                                                       |
|  Caixa #0001: Ferramentas                             |
|  Categoria: Ferramentas                               |
|  [Ver Código QR/Barras]    [Imprimir Etiqueta]        |
|                                                       |
|  Objetos na caixa:                                    |
|  ☑ Chave de fenda Phillips média                      |
|  ☑ Alicate universal vermelho                         |
|  ☑ Martelo pequeno com cabo de madeira                |
|                                                       |
|  [    Remover Selecionados    ]                       |
|                                                       |
+-------------------------------------------------------+
|  Caixa #0002: Material de Escritório                  |
|  Categoria: Escritório                                |
|  [Ver Código QR/Barras]    [Imprimir Etiqueta]        |
|                                                       |
|  Objetos na caixa:                                    |
|  ☑ Grampeador preto médio                             |
|  ☑ Tesoura de aço inoxidável                          |
|                                                       |
|  [    Remover Selecionados    ]                       |
|                                                       |
+-------------------------------------------------------+
```

### Tela de MagicBox (Leitura de Códigos)

```
+-------------------------------------------------------+
|  ← Voltar                  MAGICBOX                   |
+-------------------------------------------------------+
|                                                       |
|  [Área de Visualização da Câmera]                     |
|                                                       |
|  Posicione o código QR, código de barras ou           |
|  número manuscrito no centro da tela                  |
|                                                       |
+-------------------------------------------------------+
|  Código Detectado: ____                               |
|                                                       |
|  [Digitar Manualmente]                                |
|                                                       |
|  [      Cancelar      ]    [      Buscar      ]       |
+-------------------------------------------------------+
```

### Tela de ObjectView (Reconhecimento de Objetos)

```
+-------------------------------------------------------+
|  ← Voltar                 OBJECTVIEW                  |
+-------------------------------------------------------+
|                                                       |
|  [Área de Visualização da Câmera/Imagem]              |
|                                                       |
|  Posicione o objeto no centro da tela                 |
|  ou selecione uma imagem do dispositivo               |
|                                                       |
+-------------------------------------------------------+
|  Objeto Detectado: Processando...                     |
|                                                       |
|  Descrição Sugerida:                                  |
|  [________________________] (máx. 2 linhas)           |
|                                                       |
|  [      Cancelar      ]    [      Salvar      ]       |
+-------------------------------------------------------+
```

## Implementação Técnica

### Componentes Principais

#### 1. BoxMagicService.js

Este serviço gerencia a comunicação com as APIs de IA e o processamento de imagens:

```javascript
// src/services/BoxMagicService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import Tesseract from 'tesseract.js';
import QRCode from 'qrcode';
import JsBarcode from 'jsbarcode';

class BoxMagicService {
  constructor() {
    // Inicializar APIs
    this.geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
    this.geminiModel = import.meta.env.VITE_GEMINI_MODEL || 'gemini-1.5-flash';
    this.genAI = new GoogleGenerativeAI(this.geminiApiKey);
    this.model = this.genAI.getGenerativeModel({
      model: this.geminiModel,
      generationConfig: {
        temperature: 0.2,
        topK: 1,
        topP: 1,
        maxOutputTokens: 2048,
      }
    });

    // Inicializar banco de dados
    this.initDatabase();
  }

  // Inicializar banco de dados
  async initDatabase() {
    // Implementação do banco de dados (IndexedDB para versão web)
    // ou configuração de conexão MySQL para versão completa
  }

  // Processar imagem para reconhecimento de objeto (ObjectView)
  async processObjectImage(imageFile, source = 'camera') {
    try {
      // Converter imagem para base64
      const base64Image = await this.fileToBase64(imageFile);

      // Criar parte da imagem para o Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      };

      // Definir prompt específico com base na fonte da imagem
      let prompt = '';

      if (source === 'camera') {
        prompt = `Analise esta imagem capturada pela câmera e identifique o objeto principal.
        Forneça uma descrição muito breve (máximo 2 linhas) do objeto.
        A descrição deve ser objetiva e mencionar:
        1. O tipo de objeto
        2. Cor principal
        3. Tamanho aproximado (pequeno, médio, grande)
        4. Uma característica distintiva

        Não inclua informações sobre o fundo ou elementos não relevantes.
        Limite a resposta a no máximo 120 caracteres.`;
      } else {
        prompt = `Analise esta imagem de arquivo e identifique o objeto principal.
        Forneça uma descrição muito breve (máximo 2 linhas) do objeto.
        A descrição deve ser objetiva e mencionar:
        1. O tipo de objeto
        2. Cor principal
        3. Tamanho aproximado (pequeno, médio, grande)
        4. Uma característica distintiva

        Não inclua informações sobre o fundo ou elementos não relevantes.
        Limite a resposta a no máximo 120 caracteres.`;
      }

      // Enviar para o Gemini
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const description = response.text().trim();

      // Limitar a descrição a 2 linhas (aproximadamente 100-120 caracteres)
      const shortDescription = description.length > 120 ?
        description.substring(0, 117) + '...' :
        description;

      return {
        description: shortDescription,
        imageData: base64Image
      };
    } catch (error) {
      console.error("Erro ao processar imagem do objeto:", error);
      throw error;
    }
  }

  // Processar imagem para reconhecimento de código (MagicBox)
  async processCodeImage(imageFile, source = 'camera') {
    try {
      // Definir prompt específico com base na fonte da imagem
      let prompt = '';

      if (source === 'camera') {
        prompt = `Analise esta imagem e identifique qualquer código QR, código de barras ou número manuscrito de 4 dígitos que identifica uma CAIXA de armazenamento.
        Foque especialmente em:
        1. Códigos QR - extraia o conteúdo completo (geralmente um número de 4 dígitos)
        2. Códigos de barras - extraia o número completo (geralmente um número de 4 dígitos)
        3. Números manuscritos de 4 dígitos - reconheça os dígitos com precisão

        Retorne apenas o código/número identificado, sem texto adicional.
        Se encontrar múltiplos códigos, priorize na ordem: QR, código de barras, número manuscrito.
        Lembre-se que estamos buscando identificar CAIXAS, não objetos individuais.`;
      } else {
        prompt = `Analise esta imagem de um documento ou etiqueta e extraia qualquer código numérico visível que identifique uma CAIXA de armazenamento.
        Foque especialmente em números de 4 dígitos que representam o código da caixa.
        Ignore textos e outros elementos que não sejam códigos numéricos de identificação de caixas.

        Retorne apenas o código/número da caixa identificado, sem texto adicional.
        Lembre-se que estamos buscando identificar CAIXAS, não objetos individuais.`;
      }

      // Tentar reconhecer código QR/barras primeiro
      // Implementar com biblioteca como QuaggaJS ou ZXing

      // Converter imagem para base64
      const base64Image = await this.fileToBase64(imageFile);

      // Criar parte da imagem para o Gemini
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      };

      // Enviar para o Gemini
      const result = await this.model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const geminiText = response.text().trim();

      // Extrair apenas números do texto reconhecido pelo Gemini
      const geminiNumbers = geminiText.replace(/[^0-9]/g, '');

      // Se o Gemini não encontrou números, tentar OCR
      if (!geminiNumbers) {
        // Usar Tesseract para OCR
        const tesseractResult = await Tesseract.recognize(
          imageFile,
          'por', // Português
          { logger: m => console.log(m) }
        );

        // Extrair apenas números do texto reconhecido
        const numbersOnly = tesseractResult.data.text.replace(/[^0-9]/g, '');

        return {
          code: numbersOnly,
          confidence: tesseractResult.data.confidence,
          method: 'ocr'
        };
      }

      return {
        code: geminiNumbers,
        confidence: 95, // Valor estimado para Gemini
        method: 'gemini'
      };
    } catch (error) {
      console.error("Erro ao processar código:", error);
      throw error;
    }
  }

  // Gerar código QR
  async generateQRCode(text) {
    try {
      return await QRCode.toDataURL(text);
    } catch (error) {
      console.error("Erro ao gerar código QR:", error);
      throw error;
    }
  }

  // Gerar código de barras
  generateBarcode(text, elementId) {
    try {
      JsBarcode(`#${elementId}`, text, {
        format: "CODE128",
        lineColor: "#000",
        width: 2,
        height: 100,
        displayValue: true
      });
      return true;
    } catch (error) {
      console.error("Erro ao gerar código de barras:", error);
      throw error;
    }
  }

  // Converter arquivo para base64
  async fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64String = reader.result;
        resolve(base64String);
      };
      reader.onerror = error => reject(error);
    });
  }

  // CRUD de objetos
  async saveObject(object) {
    // Implementar salvamento no banco de dados
    // Gerar ID sequencial de 4 dígitos
  }

  async getObject(id) {
    // Implementar busca no banco de dados
  }

  async updateObject(id, data) {
    // Implementar atualização no banco de dados
  }

  async deleteObject(id) {
    // Implementar exclusão no banco de dados
  }

  async getAllObjects() {
    // Implementar listagem de todos os objetos
  }

  // CRUD de caixas
  async createBox(name, category, objectIds) {
    // Implementar criação de caixa no banco de dados
    // Gerar número sequencial de 4 dígitos para a caixa
    // Associar objetos à caixa
  }

  async getBox(boxNumber) {
    // Implementar busca de caixa pelo número de 4 dígitos
  }

  async updateBox(id, data) {
    // Implementar atualização de caixa no banco de dados
  }

  async deleteBox(id) {
    // Implementar exclusão de caixa no banco de dados
  }

  async getAllBoxes() {
    // Implementar listagem de todas as caixas
  }

  async getBoxContents(boxNumber) {
    // Implementar listagem de todos os objetos em uma caixa específica
  }
}

export default new BoxMagicService();
```

#### 2. Estrutura do Banco de Dados

Para a versão com MySQL, a estrutura do banco de dados seria:

```sql
-- Tabela de Objetos
CREATE TABLE objects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  code VARCHAR(10) NOT NULL UNIQUE,
  description VARCHAR(255) NOT NULL,
  image_data LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Caixas
CREATE TABLE boxes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  box_number VARCHAR(4) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de Relacionamento Objeto-Caixa
CREATE TABLE object_box (
  object_id INT,
  box_id INT,
  PRIMARY KEY (object_id, box_id),
  FOREIGN KEY (object_id) REFERENCES objects(id) ON DELETE CASCADE,
  FOREIGN KEY (box_id) REFERENCES boxes(id) ON DELETE CASCADE
);
```

Para a versão web com IndexedDB:

```javascript
// Estrutura do banco de dados IndexedDB
const dbStructure = {
  name: 'boxMagicDB',
  version: 1,
  stores: [
    {
      name: 'objects',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'code', unique: true }
      ]
    },
    {
      name: 'boxes',
      keyPath: 'id',
      autoIncrement: true,
      indexes: [
        { name: 'boxNumber', unique: true },
        { name: 'category', unique: false }
      ]
    },
    {
      name: 'objectBox',
      keyPath: ['objectId', 'boxId'],
      indexes: [
        { name: 'objectId', unique: false },
        { name: 'boxId', unique: false }
      ]
    }
  ]
};
```

## Funcionalidades Principais

### 1. Botões de Captura Rápida

- **Botão de Câmera [📷]** - Acesso direto à câmera do dispositivo
- **Botão de Arquivo [📁]** - Acesso direto ao explorador de arquivos
- Pop-up de seleção entre modos MagicBox e ObjectView
- Prompts especializados para cada modo e fonte de imagem

### 2. MagicBox (Leitura de Códigos)

- Escaneamento de códigos QR e de barras via câmera
- Reconhecimento de números manuscritos de 4 dígitos
- Processamento com IA (Gemini) e OCR (Tesseract)
- Busca automática no banco de dados pelo código reconhecido
- Exibição dos detalhes do objeto ou grupo correspondente

### 3. ObjectView (Reconhecimento de Objetos)

- Captura de imagem via câmera ou seleção de arquivo
- Reconhecimento automático do objeto usando IA
- Geração de descrição concisa (máximo 2 linhas)
- Armazenamento da imagem e descrição no banco de dados

### 4. Geração de Códigos para Caixas

- Geração de ID sequencial de 4 dígitos para cada caixa (não para objetos individuais)
- Criação de código QR contendo o ID da caixa
- Criação de código de barras contendo o ID da caixa
- Opção para imprimir ou salvar os códigos para afixar nas caixas físicas

### 5. Organização em Grupos por Categoria

- Criação de grupos para organizar objetos por categoria (ferramentas, documentos, eletrônicos, etc.)
- Associação de múltiplos objetos a uma caixa física através do grupo
- Atribuição de um número sequencial de 4 dígitos para cada caixa
- Visualização de todos os objetos pertencentes a uma caixa específica

### 6. Busca e Filtros

- Busca por número da caixa, descrição do objeto ou categoria
- Filtros por data de cadastro e categoria
- Ordenação por número da caixa, descrição ou data
- Visualização em lista ou grade com agrupamento por caixa

## Roadmap de Desenvolvimento

### Fase 1: Configuração e Estrutura Básica

1. Configurar ambiente de desenvolvimento (React/Vite)
2. Implementar estrutura de banco de dados
3. Criar componentes básicos da interface
4. Configurar integração com APIs (Gemini, Tesseract)

### Fase 2: Implementação dos Botões de Captura Rápida

1. Desenvolver componentes de botão de câmera e arquivo
2. Implementar pop-up de seleção de modo (MagicBox/ObjectView)
3. Configurar acesso à câmera do dispositivo
4. Configurar acesso ao explorador de arquivos do dispositivo

### Fase 3: Funcionalidades MagicBox

1. Implementar captura de imagem para leitura de códigos
2. Desenvolver reconhecimento de códigos QR e de barras
3. Implementar reconhecimento de números manuscritos
4. Criar sistema de busca por código no banco de dados

### Fase 4: Funcionalidades ObjectView

1. Implementar captura de imagem para reconhecimento de objetos
2. Desenvolver reconhecimento de objetos e geração de descrições
3. Criar CRUD completo de objetos
4. Implementar geração de IDs sequenciais

### Fase 5: Funcionalidades de Códigos

1. Implementar geração de códigos QR
2. Implementar geração de códigos de barras
3. Desenvolver interface para visualização de códigos
4. Implementar funcionalidades de impressão/exportação

### Fase 6: Funcionalidades de Caixas e Categorias

1. Criar CRUD completo de caixas com categorias
2. Implementar associação de objetos às caixas
3. Desenvolver visualização de caixas e seus objetos
4. Implementar geração de códigos sequenciais de 4 dígitos para caixas

### Fase 7: Refinamento e Otimização

1. Melhorar interface do usuário e experiência
2. Otimizar desempenho do banco de dados
3. Implementar exportação e importação de dados
4. Adicionar funcionalidades de backup

## Conclusão

O BOXMAGIC oferece uma solução completa para gerenciamento de objetos em caixas, combinando tecnologias de reconhecimento visual, OCR e geração de códigos. A aplicação é ideal para:

- Organização de coleções pessoais
- Inventário de pequenos negócios
- Gerenciamento de estoque doméstico
- Catalogação de itens em mudanças ou armazenamento

Os botões de captura rápida (câmera e arquivo) com os modos MagicBox e ObjectView proporcionam uma experiência de usuário fluida e eficiente:

- **MagicBox** - Permite identificar rapidamente caixas através de códigos QR, códigos de barras ou números de 4 dígitos manuscritos, mostrando todos os objetos contidos na caixa
- **ObjectView** - Facilita o cadastro de novos objetos com reconhecimento automático e descrições concisas, que serão posteriormente organizados em caixas por categoria

Com uma interface intuitiva e funcionalidades poderosas, o BOXMAGIC simplifica o processo de rastreamento e localização de objetos armazenados em caixas, eliminando a necessidade de abrir cada caixa para encontrar itens específicos.
