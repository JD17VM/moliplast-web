<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Producto;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class GenerateQRCodes extends Command
{
    protected $signature = 'qr:generate-all';
    protected $description = 'Genera códigos QR en formato SVG para todos los productos sin QR.';

    public function handle()
    {
        // Obtener productos sin QR
        $productos = Producto::whereNull('enlace_imagen_qr')
            ->orWhere('enlace_imagen_qr', '')
            ->where('estatus', true)
            ->get();

        if ($productos->isEmpty()) {
            $this->info('No hay productos sin código QR.');
            return;
        }

        $this->info('Generando códigos QR para ' . $productos->count() . ' productos...');

        $bar = $this->output->createProgressBar($productos->count());
        $bar->start();

        $generados = 0;
        $errores = 0;

        foreach ($productos as $producto) {
            try {
                // Generar URL de redirección
                $urlRedirect = url('api/api/producto/redirect/' . $producto->id);
                
                // Generar QR como SVG (no requiere Imagick ni GD)
                $qrSvg = QrCode::format('svg')
                    ->size(300)
                    ->generate($urlRedirect);
                
                $qrCodeName = 'qr-' . $producto->id . '.svg';
                
                // Guardar el archivo SVG
                Storage::disk('public')->put('qr_codes/' . $qrCodeName, $qrSvg);
                
                // Generar URL correcta
                $qrImageUrl = url('storage/app/public/qr_codes/' . $qrCodeName);
                
                // Actualizar el producto
                $producto->update(['enlace_imagen_qr' => $qrImageUrl]);
                
                $generados++;
                
            } catch (\Exception $e) {
                $this->error("\nError generando QR para producto ID {$producto->id}: " . $e->getMessage());
                $errores++;
            }
            
            $bar->advance();
        }

        $bar->finish();
        
        $this->newLine(2);
        $this->info("✓ Códigos QR generados exitosamente: {$generados}");
        
        if ($errores > 0) {
            $this->warn("⚠ Errores encontrados: {$errores}");
        }
        
        $this->info('Proceso completado.');
    }
}

//El comando está diseñado para generar códigos QR solo para los productos que no tienen un código QR generado.
// php artisan qr:generate-all