import { useEffect, useRef, useState } from 'react';
import Button from './ui/button';

// Ícones
const X = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

interface ProductScannerProps {
  onScanComplete: (code: string) => void;
  onScanError: (error: Error) => void;
  onClose: () => void;
}

const ProductScanner = ({ onScanComplete, onScanError, onClose }: ProductScannerProps) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();

          // In a real app, we would integrate a proper barcode scanner library here
          // such as QuaggaJS, ZXing, or another JavaScript barcode reading library

          // For demo purposes, we'll simulate a scan after a few seconds
          setTimeout(() => {
            // Simulate scanning a random barcode
            const randomBarcode = Math.floor(Math.random() * 1000000000000).toString();
            onScanComplete(randomBarcode);
          }, 3000);
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setErrorMsg('Não foi possível acessar a câmera. Verifique as permissões.');
        onScanError(new Error('Failed to access camera'));
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
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
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
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductScanner;
