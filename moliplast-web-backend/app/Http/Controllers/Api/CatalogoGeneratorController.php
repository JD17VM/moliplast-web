<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Storage;

class CatalogoGeneratorController extends Controller
{
    public function generarCatalogo()
    {
        ini_set('max_execution_time', 300);
        // Ruta a tu plantilla
        $templatePath = public_path('plantilla_catalogo_3.docx');

        // Verificar si la plantilla existe
        if (!file_exists($templatePath)) {
            \Log::error("Plantilla no encontrada: $templatePath");
            return response()->json([
                'message' => 'Plantilla no encontrada',
                'status' => 404
            ], 404);
        }

        // Obtener los datos completos de los productos
        $productos = Producto::where('estatus', true)
            ->select('id', 'codigo', 'nombre', 'enlace_imagen_qr') // Incluimos el ID
            ->orderBy('id') // Ordenamos por ID para consistencia
            ->limit(100)
            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404
            ], 404);
        }

        \Log::info('Generando catálogo con ' . count($productos) . ' productos');
        \Log::debug('Lista de productos:', $productos->toArray()); // Registramos todos los productos con sus datos

        // Agrupar los productos en bloques de 9
        $gruposProductos = array_chunk($productos->toArray(), 9);
        
        // Reemplazos para la primera pasada
        $replacements = [];
        $globalIndex = 0;
        
        foreach ($gruposProductos as $grupoIndex => $grupo) {
            $datosGrupo = [];
            
            for ($i = 1; $i <= 9; $i++) {
                $productoIndex = $i - 1;
                
                if (isset($grupo[$productoIndex])) {
                    $producto = $grupo[$productoIndex];
                    $nombreLimpio = $this->limpiarTexto($producto['nombre']);
                    $codigoLimpio = $this->limpiarTexto($producto['codigo']);
                    

                    // Formatear el código a 6 cifras con ceros a la izquierda si es necesario
                    $codigoFormateado = str_pad($codigoLimpio, 6, '0', STR_PAD_LEFT);

                    // Debug específico para producto con ID 10
                    if ($producto['id'] == 10) {
                        \Log::debug("PRODUCTO 10 - Grupo: $grupoIndex, Posición: $i, Índice Global: $globalIndex");
                        \Log::debug("Datos producto 10:", [
                            'id' => $producto['id'],
                            'nombre' => $producto['nombre'],
                            'codigo' => $producto['codigo'],
                            'imagen' => $producto['enlace_imagen_qr']
                        ]);
                    }
                    
                    $datosGrupo['descripcion_producto_' . $i] = $codigoFormateado;
                    $datosGrupo['nombre_producto_' . $i] = $nombreLimpio;
                    $datosGrupo['imagen_producto_' . $i] = '${imagen_producto_' . $globalIndex . '}';
                    
                    $globalIndex++;
                } else {
                    $datosGrupo['descripcion_producto_' . $i] = '';
                    $datosGrupo['nombre_producto_' . $i] = '';
                    $datosGrupo['imagen_producto_' . $i] = '';
                }
            }
            
            $replacements[] = $datosGrupo;
        }

        // Clonar el bloque con los valores
        $templateProcessor = new TemplateProcessor($templatePath);
        $templateProcessor->cloneBlock('PRODUCTO', 0, true, false, $replacements);

        // Directorio temporal para el documento
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        // Ruta temporal para el documento
        $outputPath = $tempDir . '/catalogo_generado_' . time() . '.docx';

        try {
            // Guardar el documento generado (primera pasada)
            $templateProcessor->saveAs($outputPath);
        } catch (\Exception $e) {
            \Log::error("Error al guardar documento temporal: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al generar el documento',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }

        // Segunda pasada: reemplazo de imágenes
        try {
            $templateProcessor2 = new TemplateProcessor($outputPath);
            $globalIndex = 0;
            
            foreach ($productos as $producto) {
                $placeholder = 'imagen_producto_' . $globalIndex;
                
                if (filter_var($producto->enlace_imagen_qr, FILTER_VALIDATE_URL)) {
                    $rutaRelativa = str_replace('https://moliplast.com/api/storage/app/public/', '', $producto->enlace_imagen_qr);
                    $rutaImagenLocal = storage_path('app/public/' . $rutaRelativa);

                    // Log específico con la información requerida, incluyendo la ruta relativa
                    \Log::info("Producto: Imagen: {$rutaRelativa}, ID: {$producto->id}, Código: {$producto->codigo}, Nombre: {$producto->nombre}");

                    if (file_exists($rutaImagenLocal)) {
                        try {
                            $templateProcessor2->setImageValue($placeholder, [
                                'path' => $rutaImagenLocal,
                                'width' => '2.6cm',
                                'height' => '2.6cm',
                                'ratio' => true
                            ]);
                        } catch (\Exception $e) {
                            \Log::error("Error insertando imagen ID {$producto->id} - {$producto->nombre}: " . $e->getMessage());
                        }
                    } else {
                        \Log::warning("Imagen no encontrada para ID {$producto->id}: $rutaImagenLocal");
                    }
                } else {
                    \Log::warning("URL de imagen inválida para ID {$producto->id}: {$producto->enlace_imagen_qr}");
                }
                
                $globalIndex++;
            }

            // Guardar documento final
            $finalOutputPath = $tempDir . '/catalogo_final_' . time() . '.docx';
            $templateProcessor2->saveAs($finalOutputPath);

            // Descargar el documento
            return response()->download($finalOutputPath, 'catalogo_productos.docx')
                ->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            \Log::error("Error en segunda pasada: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al procesar imágenes',
                'error' => $e->getMessage(),
                'status' => 500
            ], 500);
        }
    }

    private function limpiarTexto($texto)
    {
        $caracteresProblematicos = ['<', '>', '"', '\'', '&'];
        $reemplazos = ['(', ')', '', '', 'y'];
        return str_replace($caracteresProblematicos, $reemplazos, $texto);
    }
}