import { useEffect, useRef, useState, useCallback } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import styles from './assets/styles/estilos_scannerqr.module.scss';

import ProductoScannerResultado from './widgets/ProductoScannerResultado';

const QrScanner = (props) => {
  const [scanResult, setScanResult] = useState(null);
  const [scannerStatus, setScannerStatus] = useState('STOPPED');

  const qrCodeRef = useRef(null);
  const readerId = "qr-reader";

  // Lógica de escaneo: Valida ANTES de actualizar el estado.
  const onScanSuccess = (decodedText) => {
    const expectedPrefix = "https://moliplast.com/api/api/producto/redirect/";
    
    // Solo actualiza el estado si el QR tiene el formato esperado.
    // Si no, lo ignora, y el último resultado válido se queda en pantalla.
    if (decodedText.startsWith(expectedPrefix)) {
      setScanResult(decodedText);
    }
  };

  const startScanner = useCallback(() => {
    // Evita iniciar si ya está activo o si el ref no está listo
    if (scannerStatus !== 'STOPPED' || !qrCodeRef.current) return;

    qrCodeRef.current.start(
      { facingMode: "environment" },
      {
        fps: 10,
        qrbox: (viewfinderWidth, viewfinderHeight) => {
          const minEdge = Math.min(viewfinderWidth, viewfinderHeight);
          // Calculamos el 80% del lado más corto
          const size = Math.floor(minEdge * 0.8);
          
          // 2. SOLUCIÓN para el error 'minimum size':
          // Nos aseguramos de que el qrbox nunca sea más pequeño que un mínimo práctico (ej. 120px)
          // Esto es más seguro que el mínimo absoluto de 50px de la librería.
          const qrboxSize = Math.max(size, 120); 

          return { width: qrboxSize, height: qrboxSize };
        }
      },
      (decodedText) => {
        setScanResult(decodedText);
      },
      (errorMessage) => { /* Ignorar */ }
    )
    .then(() => {
      setScannerStatus('SCANNING');
    })
    .catch((err) => {
      console.error("No se pudo iniciar el escáner.", err);
      setScannerStatus('STOPPED');
    });
  }, [scannerStatus]);

  const handlePause = useCallback(() => {
    if (scannerStatus === 'SCANNING') {
      qrCodeRef.current?.pause(true);
      setScannerStatus('PAUSED');
    }
  }, [scannerStatus]);

  const handleResume = useCallback(() => {
    if (scannerStatus === 'PAUSED') {
      qrCodeRef.current?.resume();
      setScannerStatus('SCANNING');
    }
  }, [scannerStatus]);

  const handleStop = useCallback(() => {
    if ((scannerStatus === 'SCANNING' || scannerStatus === 'PAUSED') && qrCodeRef.current) {
      qrCodeRef.current.stop()
        .then(() => {
          setScannerStatus('STOPPED');
        })
        .catch(err => console.error("Fallo al detener.", err));
    }
  }, [scannerStatus, onScanSuccess]);

  // useEffect para el ciclo de vida del componente
  useEffect(() => {
    // 1. SOLUCIÓN para el error 'Cannot transition':
    // El useEffect ahora solo crea la instancia y maneja la limpieza final.
    // Ya NO inicia el escáner automáticamente. El usuario tiene el control total.
    if (!qrCodeRef.current) {
      qrCodeRef.current = new Html5Qrcode(readerId);
    }

    return () => {
      if (qrCodeRef.current?.isScanning) {
        qrCodeRef.current.stop().catch(err => {});
      }
    };
  }, []);

  return (
    <div className={styles.qrScannerComponent}>
      <div id={readerId} className={styles.scannerContainer}></div>
      
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

      {scanResult && scannerStatus !== 'STOPPED' && (
        <>
        <div className={styles.resultContainer}>
        <h3>Último Resultado Válido:</h3>
          <p><a href={scanResult} target="_blank" rel="noopener noreferrer">{scanResult}</a></p>
        </div>
        <ProductoScannerResultado route={scanResult}/>
        </>
      )}
    </div>
  );
};

export default QrScanner;