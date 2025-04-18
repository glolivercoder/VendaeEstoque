import { useState, useEffect, useRef } from 'react';
import Quagga from 'quagga';

const ProductScanner = ({ onScanComplete, onScanError, onClose }) => {
  const [scanning, setScanning] = useState(false);
  const scannerRef = useRef(null);

  useEffect(() => {
    // Inicializar o scanner quando o componente for montado
    initScanner();

    // Limpar o scanner quando o componente for desmontado
    return () => {
      if (scanning) {
        Quagga.stop();
      }
    };
  }, []);

  const initScanner = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      setScanning(true);

      Quagga.init(
        {
          inputStream: {
            name: 'Live',
            type: 'LiveStream',
            target: scannerRef.current,
            constraints: {
              width: 640,
              height: 480,
              facingMode: 'environment' // Usar a câmera traseira em dispositivos móveis
            }
          },
          locator: {
            patchSize: 'medium',
            halfSample: true
          },
          numOfWorkers: navigator.hardwareConcurrency || 4,
          decoder: {
            readers: [
              'ean_reader',
              'ean_8_reader',
              'code_39_reader',
              'code_128_reader',
              'upc_reader',
              'upc_e_reader'
            ]
          },
          locate: true
        },
        (err) => {
          if (err) {
            console.error('Erro ao inicializar o scanner:', err);
            setScanning(false);
            onScanError(new Error('Não foi possível inicializar a câmera. Verifique as permissões.'));
            return;
          }

          // Iniciar o scanner
          Quagga.start();

          // Adicionar evento para detectar códigos de barras
          Quagga.onDetected((result) => {
            if (result && result.codeResult && result.codeResult.code) {
              const code = result.codeResult.code;
              console.log('Código detectado:', code);
              
              // Parar o scanner
              Quagga.stop();
              setScanning(false);
              
              // Chamar o callback com o código detectado
              onScanComplete(code);
            }
          });
        }
      );
    } else {
      onScanError(new Error('Seu navegador não suporta acesso à câmera.'));
    }
  };

  return (
    <div className="scanner-overlay">
      <div className="scanner-container">
        <div className="scanner-header">
          <h3 className="text-lg font-medium">Escanear Código de Barras</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="scanner-content">
          <div className="scanner-video-container">
            <div ref={scannerRef} className="relative w-full h-full">
              {scanning && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="scanner-target"></div>
                </div>
              )}
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Posicione o código de barras dentro da área destacada.
          </p>
        </div>
        <div className="scanner-footer">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductScanner;
