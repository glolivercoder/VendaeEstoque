/**
 * Script para baixar imagens de produtos para teste local
 *
 * Este script baixa as imagens dos produtos do catálogo para a pasta local
 * permitindo testar a importação de catálogo com imagens locais.
 */

const fs = require('fs');
const https = require('https');
const http = require('http');
const path = require('path');

// Lista de URLs de imagens para baixar
const imageUrls = [
  {
    url: 'https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg',
    filename: 'samsung-galaxy-a54.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/18105/pexels-photo.jpg',
    filename: 'dell-inspiron-15.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/6976103/pexels-photo-6976103.jpeg',
    filename: 'lg-tv-50.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/3394650/pexels-photo-3394650.jpeg',
    filename: 'jbl-tune-510bt.png'
  },
  {
    url: 'https://images.pexels.com/photos/51383/photo-camera-subject-photographer-51383.jpeg',
    filename: 'canon-eos-rebel-t7.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/4792733/pexels-photo-4792733.jpeg',
    filename: 'hp-deskjet-2774.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/442576/pexels-photo-442576.jpeg',
    filename: 'playstation-5.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/3689532/pexels-photo-3689532.jpeg',
    filename: 'electrolux-ar-condicionado.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/1334597/pexels-photo-1334597.jpeg',
    filename: 'samsung-galaxy-tab-s8.jpg'
  },
  {
    url: 'https://images.pexels.com/photos/437037/pexels-photo-437037.jpeg',
    filename: 'amazfit-gtr-3-pro.jpg'
  }
];

// Pasta de destino
const outputDir = path.join(__dirname, 'imagens');

// Função para baixar uma imagem
function downloadImage(url, filename) {
  return new Promise((resolve, reject) => {
    console.log(`Baixando ${filename} de ${url}`);

    // Determinar o protocolo (http ou https)
    const client = url.startsWith('https') ? https : http;

    client.get(url, (response) => {
      // Verificar se a resposta é uma redireção
      if (response.statusCode === 301 || response.statusCode === 302) {
        console.log(`Redirecionando para ${response.headers.location}`);
        downloadImage(response.headers.location, filename)
          .then(resolve)
          .catch(reject);
        return;
      }

      // Verificar se a resposta é bem-sucedida
      if (response.statusCode !== 200) {
        reject(new Error(`Falha ao baixar imagem. Status: ${response.statusCode}`));
        return;
      }

      // Criar stream de escrita
      const fileStream = fs.createWriteStream(path.join(outputDir, filename));

      // Pipe da resposta para o arquivo
      response.pipe(fileStream);

      // Manipular eventos
      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Download concluído: ${filename}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(path.join(outputDir, filename), () => {}); // Remover arquivo parcial
        reject(err);
      });

    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Função principal
async function main() {
  // Verificar se a pasta de destino existe
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  console.log(`Iniciando download de ${imageUrls.length} imagens para ${outputDir}`);

  // Baixar imagens sequencialmente
  for (const image of imageUrls) {
    try {
      await downloadImage(image.url, image.filename);
    } catch (error) {
      console.error(`Erro ao baixar ${image.filename}: ${error.message}`);
    }
  }

  console.log('Download de imagens concluído!');
}

// Executar função principal
main().catch(console.error);
