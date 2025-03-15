<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use PhpOffice\PhpWord\TemplateProcessor;

class CatalogoGeneratorController extends Controller
{
    public function generarCatalogo()
    {
        // Ruta a tu plantilla
        $templatePath = public_path('plantilla_catalogo.docx');

        // Crear una instancia de TemplateProcessor
        $templateProcessor = new TemplateProcessor($templatePath);

        // Obtener los datos de los productos (ejemplo)
        $productos = [
            ['nombre' => 'Producto 1', 'descripcion' => 'Descripción del producto 1'],
            ['nombre' => 'Producto 2', 'descripcion' => 'Descripción del producto 2'],
            ['nombre' => 'Producto 3', 'descripcion' => 'Descripción del producto 3'],
            // ... más productos
        ];

        $rutaImagen = storage_path('app/public/qr_codes/qr-5175.png');

        // Preparar los valores para el reemplazo en bloque
        $replacements = [];
        foreach ($productos as $producto) {
            $replacements[] = [
                'nombre_producto' => $producto['nombre'],
                'descripcion_producto' => $producto['descripcion']
            ];
        }

        // Clonar el bloque con los valores
        $templateProcessor->cloneBlock('PRODUCTO', 0, true, false, $replacements);

        // Asegúrate de que la imagen existe antes de procesarla
        if (file_exists($rutaImagen)) {
            // Incluir la imagen en el documento de Word
            $templateProcessor->setImageValue('imagen_producto', [
                'path' => $rutaImagen,
                'width' => "2.3cm",    // ancho en pixels
                'height' => "2.3cm",   // alto en pixels
                'ratio' => true    // mantener la proporción (true) o forzar tamaño exacto (false)
            ]);
            
        } else {
            // Si la imagen no existe, puedes usar una imagen por defecto
            $rutaImagenDefault = public_path('images/no-image.jpg');
            $templateProcessor->setImageValue('imagen_producto', $rutaImagenDefault);
        }

        // Guardar el documento generado
        $outputPath = storage_path('app/catalogo_generado.docx');
        $templateProcessor->saveAs($outputPath);

        // Descargar el documento
        return response()->download($outputPath)->deleteFileAfterSend(true);
    }
}

/*
// Para un archivo en el storage público
$rutaImagen = storage_path('app/public/' . $nombreArchivo);

// Para un archivo en el storage privado
$rutaImagen = storage_path('app/' . $nombreArchivo);
*/