import { useEffect, useRef, useState } from 'react';

// Ícones
const X = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const ProductScanner = ({ onScanComplete, onScanError, onClose }) => {
  const videoRef = useRef(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    let stream = null;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          // Para fins de demonstração, vamos simular uma leitura após alguns segundos
          setTimeout(() => {
            // Simular leitura de um código de barras aleatório
            const randomBarcode = Math.floor(Math.random() * 1000000000000).toString();
            onScanComplete(randomBarcode);
          }, 3000);
        }
      } catch (error) {
        console.error('Erro ao acessar a câmera:', error);
        setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões.');
        onScanError(new Error('Falha ao acessar a câmera'));
      }
    };

    startScanner();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onScanComplete, onScanError]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center">
      <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="font-medium">Escanear Código</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X />
          </button>
        </div>

        <div className="p-4">
          {errorMsg ? (
            <div className="text-red-500 text-center py-8">{errorMsg}</div>
          ) : (
            <div className="aspect-video bg-gray-100 rounded overflow-hidden">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-full w-full flex flex-col items-center justify-center">
                  <div className="w-2/3 h-1/3 border-2 border-red-500 rounded-lg" />
                  <p className="text-white mt-4 px-4 py-1 bg-black bg-opacity-50 rounded text-sm">
                    Posicione o código de barras dentro do retângulo
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 text-center text-sm text-gray-500">
            <p>Simulando leitura de código de barras...</p>
            <p className="mt-1">Nota: Em um aplicativo real, esta funcionalidade usaria uma biblioteca como QuaggaJS ou ZXing para ler códigos de barras.</p>
          </div>
        </div>

        <div className="p-4 border-t flex justify-end">
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
