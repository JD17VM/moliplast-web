<?php
/**
 * Ejecutar desde el navegador: https://www.moliplast.com/api/generar-qrs.php
 * IMPORTANTE: Eliminar este archivo después de usarlo por seguridad
 */

// Configuración
ini_set('max_execution_time', 300); // 5 minutos
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>Generador de Códigos QR</h1>";
echo "<p>Iniciando proceso...</p>";
flush();

// Cargar Laravel
require __DIR__.'/vendor/autoload.php';
$app = require_once __DIR__.'/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

// Importar clases necesarias
use App\Models\Producto;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

try {
    // Obtener productos sin QR
    $productos = Producto::whereNull('enlace_imagen_qr')
        ->orWhere('enlace_imagen_qr', '')
        ->where('estatus', true)
        ->get();

    if ($productos->isEmpty()) {
        echo "<p style='color: blue;'>✓ No hay productos sin código QR.</p>";
        exit;
    }

    echo "<p>Se encontraron <strong>{$productos->count()}</strong> productos sin QR.</p>";
    echo "<hr>";
    flush();

    $generados = 0;
    $errores = 0;

    foreach ($productos as $producto) {
        echo "<div style='padding: 5px; border-left: 3px solid #ddd; margin: 10px 0;'>";
        echo "<strong>Producto ID {$producto->id}:</strong> {$producto->nombre}<br>";
        
        try {
            // Generar URL de redirección
            $urlRedirect = url('api/api/producto/redirect/' . $producto->id);
            
            // Generar QR como SVG
            $qrSvg = QrCode::format('svg')
                ->size(300)
                ->generate($urlRedirect);
            
            $qrCodeName = 'qr-' . $producto->id . '.svg';
            
            // Guardar el archivo SVG
            Storage::disk('public')->put('qr_codes/' . $qrCodeName, $qrSvg);
            
            // Generar URL correcta
            $qrImageUrl = url('api/storage/app/public/qr_codes/' . $qrCodeName);
            
            // Actualizar el producto
            $producto->update(['enlace_imagen_qr' => $qrImageUrl]);
            
            echo "<span style='color: green;'>✓ QR generado: {$qrCodeName}</span><br>";
            echo "<span style='color: #666;'>URL: {$qrImageUrl}</span>";
            
            $generados++;
            
        } catch (\Exception $e) {
            echo "<span style='color: red;'>✗ Error: {$e->getMessage()}</span>";
            $errores++;
        }
        
        echo "</div>";
        flush();
    }

    echo "<hr>";
    echo "<h2 style='color: green;'>✓ Proceso completado</h2>";
    echo "<p><strong>Códigos QR generados:</strong> {$generados}</p>";
    
    if ($errores > 0) {
        echo "<p style='color: orange;'><strong>⚠ Errores encontrados:</strong> {$errores}</p>";
    }
    
    echo "<hr>";
    echo "<p style='color: red; font-weight: bold;'>⚠ IMPORTANTE: Elimina este archivo (generar-qrs.php) por seguridad.</p>";

} catch (\Exception $e) {
    echo "<p style='color: red;'><strong>ERROR FATAL:</strong> {$e->getMessage()}</p>";
    echo "<pre>" . $e->getTraceAsString() . "</pre>";
}