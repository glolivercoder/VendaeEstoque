# LinkVendas Fast - Android App

Este documento descreve a implementação do aplicativo Android para o LinkVendas Fast, baseado no roadmapandroid.md.

## Visão Geral

O aplicativo Android foi implementado utilizando o Capacitor para empacotar a aplicação web React como um aplicativo nativo Android. Foram feitas melhorias de acessibilidade e adaptações para a interface móvel conforme especificado no roadmap.

## Funcionalidades Implementadas

### Correções de Acessibilidade

- **Elementos Interativos**: Adicionados labels apropriados para todos os botões e implementados aria-labels para elementos sem texto visível.
- **Contraste e Cores**: Ajustado o contraste dos botões primários e melhorado o contraste do texto em botões.
- **Formulários**: Adicionados labels explícitos para checkboxes e implementado feedback visual e tátil para interações.

### Ajustes de Interface Mobile

- **Touch Targets**: Aumentada a área de toque para mínimo de 48x48dp e implementado feedback tátil (ripple effect).
- **Layout**: Implementado grid responsivo e ajustado tamanho de fonte e espaçamentos.
- **Gestos**: Implementado pull-to-refresh, suporte a swipe para navegação e zoom em imagens de produtos.

## Estrutura de Arquivos

```
src/
├── components/
│   ├── common/
│   │   ├── AccessibleButton.jsx
│   │   ├── BarcodeScanner.jsx
│   │   ├── CameraCapture.jsx
│   │   ├── PullToRefresh.jsx
│   │   ├── SwipeableListItem.jsx
│   │   └── ZoomableImage.jsx
│   ├── forms/
│   │   ├── AccessibleCheckbox.jsx
│   │   └── AccessibleInput.jsx
│   └── layout/
│       └── BottomNavigation.jsx
├── hooks/
│   ├── useCamera.js
│   └── useBarcodeScanner.js
├── styles/
│   ├── main.css
│   └── mobileUI.css
└── utils/
    ├── accessibility.js
    ├── fileSystem.js
    ├── mobileUI.js
    ├── sharing.js
    └── storage.js
```

## Plugins Capacitor Utilizados

- **@capacitor/camera**: Para captura de imagens de produtos.
- **@capacitor/filesystem**: Para acesso ao sistema de arquivos (backups, imagens).
- **@capacitor/storage**: Para armazenamento local.
- **@capacitor/share**: Para compartilhamento de produtos e recibos.
- **@capacitor-community/barcode-scanner**: Para leitura de códigos de barras (GTIN/SKU).

## Permissões Android

As seguintes permissões foram adicionadas ao AndroidManifest.xml:

- **INTERNET**: Para comunicação com serviços web.
- **READ_EXTERNAL_STORAGE**: Para acesso a arquivos externos.
- **WRITE_EXTERNAL_STORAGE**: Para salvar arquivos externos.
- **CAMERA**: Para captura de imagens e leitura de códigos de barras.
- **VIBRATE**: Para feedback tátil.

## Configuração da Câmera

Para garantir que a câmera do dispositivo seja aberta corretamente ao clicar nos botões de captura de imagem:

1. **Atributos HTML5 para Acesso à Câmera**:
   ```javascript
   // Configuração correta para abrir a câmera em dispositivos Android
   input.setAttribute('capture', 'environment'); // Usa a câmera traseira
   input.setAttribute('data-capture', 'camera'); // Atributo adicional para frameworks de conversão
   ```

2. **Permissões no AndroidManifest.xml**:
   ```xml
   <uses-permission android:name="android.permission.CAMERA" />
   <uses-feature android:name="android.hardware.camera" android:required="false" />
   <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
   ```

3. **Solicitação de Permissão em Tempo de Execução**:
   O Capacitor gerencia automaticamente a solicitação de permissões em tempo de execução para a câmera.

4. **Considerações Importantes**:
   - Sempre teste em dispositivos reais, não apenas em emuladores
   - Verifique se o botão "Usar Câmera" abre a câmera nativa do dispositivo e não o seletor de arquivos
   - Certifique-se de que as imagens capturadas são processadas corretamente após a captura

## Como Construir o App

1. **Preparar o ambiente**:
   ```
   npm install
   ```

2. **Construir o app**:
   ```
   npm run android:build
   ```

3. **Abrir no Android Studio**:
   ```
   npm run android:open
   ```

4. **Ou usar o script batch**:
   ```
   build-android.bat
   ```

## Testes

Recomenda-se testar o aplicativo em diferentes dispositivos Android para garantir a compatibilidade e o bom funcionamento das adaptações de interface.

## Próximos Passos

1. **Testes em dispositivos reais**: Testar em diferentes tamanhos de tela e versões do Android.
2. **Otimização de desempenho**: Identificar e corrigir possíveis gargalos.
3. **Notificações push**: Implementar notificações para alertas de estoque baixo e vendas.
4. **Modo offline aprimorado**: Melhorar a sincronização quando o dispositivo volta a ficar online.
5. **Distribuição**: Preparar o app para distribuição na Google Play Store.
