<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Producto;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Illuminate\Support\Facades\Storage;

class GenerateQRCodes extends Command
{
    protected $signature = 'qr:generate-all';
    protected $description = 'Genera códigos QR para todos los productos existentes.';

    public function handle()
    {
        $productos = Producto::whereNull('enlace_imagen_qr')->get();

        $this->info('Generando códigos QR para ' . $productos->count() . ' productos...');

        foreach ($productos as $producto) {
            $urlRedirect = url('/api/api/producto/redirect/' . $producto->id);
            $qrCode = QrCode::format('png')->size(300)->generate($urlRedirect);
            $qrCodeName = 'qr-' . $producto->id . '.png';
            Storage::disk('public')->put('qr_codes/' . $qrCodeName, $qrCode);
            //Forzar la url correcta.
            $baseUrl = config('app.url');
            $qrImageUrl = $baseUrl . '/api/storage/app/public/qr_codes/' . $qrCodeName;

            $producto->update(['enlace_imagen_qr' => $qrImageUrl]);

            $this->info('Código QR generado para el producto ID: ' . $producto->id);
        }

        $this->info('Todos los códigos QR han sido generados.');
    }
}

//El comando está diseñado para generar códigos QR solo para los productos que no tienen un código QR generado.
// php artisan qr:generate-all