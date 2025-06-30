import { useEffect, useState, useRef } from 'react';
// 1. Importa Html5QrcodeScanType junto con el resto
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';

const QrScanner = (props) => {
  const [scanResult, setScanResult] = useState(null);
  
  // Usamos useRef para mantener la instancia del scanner
  const scannerRef = useRef(null);

  useEffect(() => {
    // ---- INICIO DE LA LÓGICA DEL SCANNER ----

    // Creamos la instancia del scanner y la guardamos en la referencia
    scannerRef.current = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
        // 2. Añade esta línea para especificar que SOLO quieres usar la cámara
        supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    }, false);

    // Función que se llama cuando el escaneo es exitoso
    const onScanSuccess = (decodedText, decodedResult) => {
      // La clave está aquí: simplemente actualizamos el estado con el nuevo resultado.
      // React es lo suficientemente inteligente como para no volver a renderizar si el valor es el mismo.
      // Pero para mayor claridad y control, podemos hacer la comprobación nosotros mismos.
      setScanResult((prevResult) => {
        // Solo actualizamos si el resultado es diferente al anterior
        if (prevResult !== decodedText) {
          console.log("Nuevo QR detectado:", decodedText);
          return decodedText;
        }
        // Si es el mismo, no hacemos nada y retornamos el estado previo
        return prevResult;
      });
    };

    // Función de error (sin cambios)
    const onScanFailure = (error) => {
      // console.warn(`Code scan error = ${error}`);
    };

    // Renderizamos el scanner
    scannerRef.current.render(onScanSuccess, onScanFailure);

    // ---- FUNCIÓN DE LIMPIEZA ----
    // Se ejecuta cuando el componente se desmonta
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(error => {
          console.error("Fallo al limpiar el escaner.", error);
        });
      }
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* El div se mantiene igual, la librería renderizará una UI más simple dentro */}
      <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      
      {scanResult && (
        <div style={{ marginTop: '20px', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}>
          <h3>Último Resultado Válido:</h3>
          <p style={{ wordBreak: 'break-all' }}>
            <a href={scanResult} target="_blank" rel="noopener noreferrer">{scanResult}</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default QrScanner;