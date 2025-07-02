import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import styles from './assets/styles/estilos_scannerqr.module.scss';

import ProductoScannerResultado from './widgets/ProductoScannerResultado';

const QrScanner = () => {
  const [scanResult, setScanResult] = useState(null);
  const [scannerStatus, setScannerStatus] = useState('STOPPED');

  const qrCodeRef = useRef(null);
  const readerId = "qr-reader";

  // Función que se llama cuando el escaneo es exitoso
  const onScanSuccess = useCallback((decodedText) => {
    const expectedPrefix = "https://moliplast.com/api/api/producto/redirect/";
    if (decodedText.startsWith(expectedPrefix)) {
      setScanResult(decodedText);
      // Opcional: Detener el escáner automáticamente después de un escaneo exitoso
      // handleStop(); 
    }
  }, []); // El array vacío asegura que esta función no se recree innecesariamente

  const startScanner = useCallback(() => {
    // Evita iniciar si ya está activo o si el ref no está listo
    if (scannerStatus !== 'STOPPED' || !qrCodeRef.current) return;

    const config = {
      fps: 10,
      qrbox: (viewfinderWidth, viewfinderHeight) => {
        const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          // Calculamos el 80% del lado más corto
        const size = Math.floor(minEdge * 0.8);
        const qrboxSize = Math.max(size, 150);
        return { width: qrboxSize, height: qrboxSize };
      },
      experimentalFeatures: {
        useBarCodeDetectorIfSupported: true,
      },
      aspectRatio: 1.0
    };

    qrCodeRef.current.start(
      { facingMode: "environment" },
      config,
      onScanSuccess, // Pasamos la función de callback
      (errorMessage) => { /* Ignorar */ }
    )
    .then(() => {
      setScannerStatus('SCANNING');
    })
    .catch((err) => {
      console.error("No se pudo iniciar el escáner.", err);
      setScannerStatus('STOPPED');
    });
  }, [scannerStatus, onScanSuccess]);

  const handlePause = useCallback(() => {
    if (scannerStatus === 'SCANNING' && qrCodeRef.current?.isScanning) {
      qrCodeRef.current.pause(true);
      setScannerStatus('PAUSED');
    }
  }, [scannerStatus]);

  const handleResume = useCallback(() => {
    if (scannerStatus === 'PAUSED' && qrCodeRef.current) {
      qrCodeRef.current.resume();
      setScannerStatus('SCANNING');
    }
  }, [scannerStatus]);

  const handleStop = useCallback(() => {
    if ((scannerStatus === 'SCANNING' || scannerStatus === 'PAUSED') && qrCodeRef.current?.isScanning) {
      qrCodeRef.current.stop()
        .then(() => {
          setScannerStatus('STOPPED');
          setScanResult(null); // Limpiamos el resultado anterior al detener
        })
        .catch(err => console.error("Fallo al detener.", err));
    }
  }, [scannerStatus]);

  // useEffect para crear y limpiar la instancia del escáner
  useEffect(() => {
    // Si la instancia no existe, la creamos al montar el componente.
    // Pasamos 'verbose: false' para evitar logs excesivos en la consola.
    if (!qrCodeRef.current) {
      qrCodeRef.current = new Html5Qrcode(readerId, { verbose: false });
    }

    // --- FUNCIÓN DE LIMPIEZA ---
    // Se ejecuta cuando el componente se desmonta (ej. el usuario cambia de ruta).
    // Esto es CRUCIAL para apagar la cámara y evitar errores.
    return () => {
      if (qrCodeRef.current?.isScanning) {
        qrCodeRef.current.stop()
          .catch(err => {
            console.error("Error al limpiar el escáner al desmontar el componente.", err);
          });
      }
    };
  }, []); // El array vacío asegura que esto solo se ejecute al montar y desmontar

  return (
    
    <div className={styles.qrScannerComponent}>
      <div id={readerId} className={styles.scannerContainer}></div>
      
      {/* Muestra un indicador de carga mientras el escáner no está activo */}
      {scannerStatus === 'STOPPED' && !scanResult && (
        <div className={styles.qr_loading}>
            <p>Apunte la cámara al código QR</p>
        </div>
      )}
      <div className={styles.controlsContainer}>
        {scannerStatus === 'STOPPED' && (
          <button onClick={startScanner} className={styles.controlButton}>
            Iniciar Escaneo
          </button>
        )}
        
        {scannerStatus === 'SCANNING' && (
          <>
            <button onClick={handlePause} className={styles.controlButton}>Pausar</button>
            <button onClick={handleStop} className={`${styles.controlButton} ${styles.stopButton}`}>Detener</button>
          </>
        )}

        {scannerStatus === 'PAUSED' && (
          <>
            <button onClick={handleResume} className={styles.controlButton}>Reanudar</button>
            <button onClick={handleStop} className={`${styles.controlButton} ${styles.stopButton}`}>Detener</button>
          </>
        )}
      </div>

      {/* Muestra el resultado solo si hay un scanResult */}
      {scanResult && (
        <ProductoScannerResultado route={scanResult}/>
      )}
    </div>
  );
};

export default QrScanner;