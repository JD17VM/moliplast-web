import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

// Props que el componente podría recibir en el futuro, por ahora no las usamos.
const QrScanner = (props) => {
  // Estado para almacenar el resultado del escaneo
  const [scanResult, setScanResult] = useState(null);

  useEffect(() => {
    // Creamos una instancia del escaner.
    // El primer argumento es el ID del elemento donde se renderizará el escaner.
    // El segundo es un objeto de configuración opcional.
    // El tercero es un booleano para activar el modo verbose (logs detallados).
    const scanner = new Html5QrcodeScanner('qr-reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5, // Fotogramas por segundo para el escaneo.
    }, false);

    let isScanning = true;

    // Función que se llama cuando el escaneo es exitoso
    function onScanSuccess(decodedText, decodedResult) {
      // Para evitar múltiples disparos de la función, verificamos si ya estamos manejando un escaneo.
      if (isScanning) {
        isScanning = false; // Bloqueamos nuevos escaneos
        
        // Actualizamos el estado con el texto decodificado
        setScanResult(decodedText);
        
        // Opcional: Detener el escáner después de una lectura exitosa
        // scanner.clear().catch(error => {
        //   console.error("Fallo al limpiar el escaner.", error);
        // });
      }
    }

    // Función que se llama si hay un error en el escaneo (opcional)
    function onScanFailure(error) {
      // Puedes ignorar los errores comunes como "QR code not found."
      // console.warn(`Code scan error = ${error}`);
    }

    // Renderizamos el escaner con las funciones de callback
    scanner.render(onScanSuccess, onScanFailure);

    // Función de limpieza que se ejecuta cuando el componente se desmonta
    return () => {
      // Nos aseguramos de limpiar el escaner para liberar la cámara
      scanner.clear().catch(error => {
        console.error("Fallo al limpiar el escaner.", error);
      });
    };
  }, []); // El array vacío asegura que este efecto se ejecute solo una vez (al montar el componente)

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {/* Elemento contenedor donde se renderizará el lector de QR */}
      <div id="qr-reader" style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}></div>
      
      {/* Mostramos el resultado del escaneo si existe */}
      {scanResult && (
        <div style={{ marginTop: '20px' }}>
          <h3>Resultado del Escaneo:</h3>
          {/* Mostramos el texto como un enlace clickeable para verificar */}
          <p>
            <a href={scanResult} target="_blank" rel="noopener noreferrer">{scanResult}</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default QrScanner;