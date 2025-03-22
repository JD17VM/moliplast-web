<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Producto;
use App\Models\Subcategoria;
use App\Models\Categoria; // Necesitamos el modelo Categoria para validar
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon; // Para obtener la fecha

class generarDocumentoCatalogoPorCategoriaController extends Controller
{
    public function generarDocumentoCatalogoPorCategoriaUnProductoPorIteracion($categoriaId)
    {
        ini_set('max_execution_time', 300); // Máximo tiempo de espera 5 minutos

        // Ruta a tu plantilla para el catálogo individual
        $templatePath = public_path('catalogo_productos_continuos.docx');

        // Verificar si la plantilla existe
        if (!file_exists($templatePath)) {
            \Log::error("Plantilla no encontrada: $templatePath");
            return response()->json([
                'message' => 'Plantilla no encontrada',
                'status' => 404
            ], 404);
        }

        // Verificar si la categoría existe y está activa
        $categoria = Categoria::where('id', $categoriaId)
            ->where('estatus', true)
            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener los productos activos de la categoría dada y ordenarlos por id_subcategoria
        $productos = Producto::where('estatus', true)
            ->where('id_categoria', $categoriaId)
            ->orderBy('id_subcategoria')
            ->limit(25) // Aquí se limita a los primeros 25
            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos activos en esta categoría',
                'status' => 200 // No es un error, simplemente no hay productos
            ], 200);
        }

        \Log::info('Generando documento de catálogo para la categoría ' . $categoria->nombre . ' con ' . count($productos) . ' productos.');

        // Crear una instancia de TemplateProcessor
        $templateProcessor = new TemplateProcessor($templatePath);

        // --- Reemplazo de valores únicos ---
        $templateProcessor->setValue('nombre_categoria', $categoria->nombre);
        $templateProcessor->setValue('fecha_generacion', Carbon::now()->format('Y-m-d H:i:s'));
        $templateProcessor->setValue('conteo_productos', count($productos));
        // --- Fin del reemplazo de valores únicos ---

        $replacements = [];
        foreach ($productos as $producto) {
            $subcategoria = Subcategoria::find($producto->id_subcategoria);
            $nombreSubcategoria = $subcategoria ? $subcategoria->nombre : 'Sin Subcategoría';

            $nombreLimpio = $this->limpiarTexto($producto->nombre);
            $descripcionLimpio = $this->limpiarTexto($producto->descripcion ?? ''); // Asegurarse que la descripción no sea null
            $codigoLimpio = $this->limpiarTexto($producto->codigo);

            $replacements[] = [
                'nombre_producto' => $nombreLimpio,
                'descripcion_producto' => $descripcionLimpio,
                'codigo_producto' => $codigoLimpio,
                'nombre_subcategoria' => $nombreSubcategoria,
                'id_subcategoria' => $producto->id_subcategoria, // Se agregó el id_subcategoria
                'imagen_producto' => '${imagen_producto_' . $producto->id . '}', // Placeholder único por producto
            ];
        }

        // Clonar el bloque con los valores
        $templateProcessor->cloneBlock('PRODUCTO', 0, true, false, $replacements);

        // Directorio temporal para el documento
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $outputPath = $tempDir . '/catalogo_categoria_' . $categoriaId . '_' . time() . '.docx';
        $templateProcessor->saveAs($outputPath);

        // Segunda pasada: reemplazo de imágenes
        $templateProcessor2 = new TemplateProcessor($outputPath);

        foreach ($productos as $producto) {
            $placeholder = 'imagen_producto_' . $producto->id;
            $urlImagen = $producto->enlace_imagen_qr;

            if (filter_var($urlImagen, FILTER_VALIDATE_URL)) {
                $rutaRelativa = str_replace('https://moliplast.com/api/storage/app/public/', '', $urlImagen);
                $rutaImagenLocal = storage_path('app/public/' . $rutaRelativa);

                if (file_exists($rutaImagenLocal)) {
                    try {
                        $templateProcessor2->setImageValue($placeholder, [
                            'path' => $rutaImagenLocal,
                            'width' => '4cm', // Ajusta el tamaño según necesites
                            'height' => '4cm',
                            'ratio' => true,
                        ]);
                        \Log::info("Imagen insertada para el producto ID {$producto->id}: $rutaImagenLocal");
                    } catch (\Exception $e) {
                        \Log::error("Error insertando imagen para el producto ID {$producto->id}: " . $e->getMessage());
                    }
                } else {
                    \Log::warning("No se encontró la imagen local para el producto ID {$producto->id}: $rutaImagenLocal");
                }
            } else {
                \Log::warning("URL de imagen inválida para el producto ID {$producto->id}: {$producto->enlace_imagen_qr}");
            }
        }

        // Guardar el documento final con las imágenes
        $finalOutputPath = $tempDir . '/catalogo_final_categoria_' . $categoriaId . '_' . time() . '.docx';
        $templateProcessor2->saveAs($finalOutputPath);

        // Descargar el documento
        $filename = 'catalogo_categoria_' . $categoria->nombre . '_productos.docx';
        return response()->download($finalOutputPath, $filename)->deleteFileAfterSend(true);
    }

    public function generarDocumentoCatalogoPorCategoriaDosProductosPorIteracion($categoriaId)
    {
        ini_set('max_execution_time', 300); // Máximo tiempo de espera 5 minutos

        // Ruta a tu plantilla para el catálogo individual
        $templatePath = public_path('catalogo_productos_alternados.docx'); // Asegúrate de tener una plantilla adecuada

        // Verificar si la plantilla existe
        if (!file_exists($templatePath)) {
            \Log::error("Plantilla no encontrada: $templatePath");
            return response()->json([
                'message' => 'Plantilla no encontrada',
                'status' => 404
            ], 404);
        }

        // Verificar si la categoría existe y está activa
        $categoria = Categoria::where('id', $categoriaId)
            ->where('estatus', true)
            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener los productos activos de la categoría dada y ordenarlos por id_subcategoria
        $productos = Producto::where('estatus', true)
            ->where('id_categoria', $categoriaId)
            ->orderBy('id_subcategoria')
            //->limit(100) // Aquí se limita a los primeros 25
            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos activos en esta categoría',
                'status' => 200 // No es un error, simplemente no hay productos
            ], 200);
        }

        \Log::info('Generando documento de catálogo alternado para la categoría ' . $categoria->nombre . ' con ' . count($productos) . ' productos.');

        // Crear una instancia de TemplateProcessor
        $templateProcessor = new TemplateProcessor($templatePath);

        // --- Reemplazo de valores únicos ---
        $templateProcessor->setValue('nombre_categoria', $categoria->nombre);
        $templateProcessor->setValue('fecha_generacion', Carbon::now()->format('Y-m-d'));
        $templateProcessor->setValue('conteo_productos', count($productos));
        // --- Fin del reemplazo de valores únicos ---

        $replacements = [];
        $totalProductos = count($productos);
        for ($i = 0; $i < $totalProductos; $i += 2) {
            $producto1 = $productos[$i];
            $subcategoria1 = Subcategoria::find($producto1->id_subcategoria);
            $nombreSubcategoria1 = $subcategoria1 ? $subcategoria1->nombre : 'Sin Subcategoría';
            $nombreLimpio1 = $this->limpiarTexto($producto1->nombre);
            $descripcionLimpio1 = $this->limpiarTexto($producto1->descripcion ?? '');
            $codigoLimpio1 = $this->limpiarTexto($producto1->codigo);
            $codigoFormateado1 = str_pad($codigoLimpio1, 6, '0', STR_PAD_LEFT);

            $dataPar = [
                'nombre_producto_1' => $nombreLimpio1,
                'descripcion_producto_1' => $descripcionLimpio1,
                'codigo_producto_1' => $codigoFormateado1,
                'nombre_subcategoria_1' => $nombreSubcategoria1,
                'id_subcategoria_1' => $producto1->id_subcategoria,
                'imagen_producto_1' => '${imagen_producto_' . $producto1->id . '}',
            ];

            if (isset($productos[$i + 1])) {
                $producto2 = $productos[$i + 1];
                $subcategoria2 = Subcategoria::find($producto2->id_subcategoria);
                $nombreSubcategoria2 = $subcategoria2 ? $subcategoria2->nombre : 'Sin Subcategoría';
                $nombreLimpio2 = $this->limpiarTexto($producto2->nombre);
                $descripcionLimpio2 = $this->limpiarTexto($producto2->descripcion ?? '');
                $codigoLimpio2 = $this->limpiarTexto($producto2->codigo);
                $codigoFormateado2 = str_pad($codigoLimpio2, 6, '0', STR_PAD_LEFT);

                $dataPar += [
                    'nombre_producto_2' => $nombreLimpio2,
                    'descripcion_producto_2' => $descripcionLimpio2,
                    'codigo_producto_2' => $codigoFormateado2,
                    'nombre_subcategoria_2' => $nombreSubcategoria2,
                    'id_subcategoria_2' => $producto2->id_subcategoria,
                    'imagen_producto_2' => '${imagen_producto_' . $producto2->id . '}',
                ];
            } else {
                // Si hay un número impar de productos, asegúrate de que los placeholders del segundo producto estén vacíos
                $dataPar += [
                    'nombre_producto_2' => '',
                    'descripcion_producto_2' => '',
                    'codigo_producto_2' => '',
                    'nombre_subcategoria_2' => '',
                    'id_subcategoria_2' => '',
                    'imagen_producto_2' => '',
                ];
            }
            $replacements[] = $dataPar;
        }

        // Clonar el bloque PRODUCTO (que ahora contendrá los placeholders _1 y _2)
        $templateProcessor->cloneBlock('PRODUCTO', 0, true, false, $replacements);

        // Directorio temporal para el documento
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }
        $outputPath = $tempDir . '/catalogo_alternado_categoria_' . $categoriaId . '_' . time() . '.docx';
        $templateProcessor->saveAs($outputPath);

        // Segunda pasada: reemplazo de imágenes
        $templateProcessor2 = new TemplateProcessor($outputPath);

        foreach ($productos as $producto) {
            $placeholder = 'imagen_producto_' . $producto->id;
            $urlImagen = $producto->imagen_1;
            $defaultImagePath = storage_path('app/public/default_square_img.png');
            $isDefaultImageURL = false;
            $imageInserted = false; // Track if we've inserted an image

            if (!empty($urlImagen) && filter_var($urlImagen, FILTER_VALIDATE_URL)) {
                $rutaRelativa = str_replace('https://moliplast.com/api/storage/app/public/', '', $urlImagen);
                $rutaImagenLocal = storage_path('app/public/' . $rutaRelativa);
                $isDefaultImageURL = strpos($urlImagen, 'default_square_img.png') !== false;

                if (!$isDefaultImageURL && file_exists($rutaImagenLocal)) {
                    try {
                        $templateProcessor2->setImageValue($placeholder, [
                            'path' => $rutaImagenLocal,
                            'width' => '4cm',
                            'height' => '4cm',
                            'ratio' => true,
                        ]);
                        $imageInserted = true;
                        \Log::info("Imagen insertada para el producto ID {$producto->id}: $rutaImagenLocal");
                    } catch (\Exception $e) {
                        \Log::error("Error insertando imagen para el producto ID {$producto->id}: " . $e->getMessage());
                    }
                } elseif (!$isDefaultImageURL) {
                    \Log::warning("No se encontró la imagen local para el producto ID {$producto->id}: $rutaImagenLocal");
                }
            } else {
                if (!empty($urlImagen)) {
                    \Log::warning("URL de imagen inválida para el producto ID {$producto->id}: {$producto->imagen_1}");
                } else {
                    \Log::warning("La URL de imagen está vacía para el producto ID {$producto->id}.");
                }
            }

            // Insert default image if no image was inserted and the default image exists
            if (!$imageInserted && file_exists($defaultImagePath)) {
                try {
                    $templateProcessor2->setImageValue($placeholder, [
                        'path' => $defaultImagePath,
                        'width' => '4cm',
                        'height' => '4cm',
                        'ratio' => true,
                    ]);
                    \Log::info("Imagen predeterminada insertada para el producto ID {$producto->id}");
                } catch (\Exception $e) {
                    \Log::error("Error insertando imagen predeterminada para el producto ID {$producto->id}: " . $e->getMessage());
                }
            }
            // Si la URL apunta a la imagen por defecto o no se cumple ninguna condición, no se hace nada
        }

        // Guardar el documento final con las imágenes
        $finalOutputPath = $tempDir . '/catalogo_final_alternado_categoria_' . $categoriaId . '_' . time() . '.docx';
        $templateProcessor2->saveAs($finalOutputPath);

        // Descargar el documento
        $filename = 'catalogo_alternado_categoria_' . $categoria->nombre . '_productos.docx';
        return response()->download($finalOutputPath, $filename)->deleteFileAfterSend(true);
    }

    private function limpiarTexto($texto)
    {
        $caracteresProblematicos = ['<', '>', '"', '\'', '&'];
        $reemplazos = ['(', ')', '', '', 'y'];
        return str_replace($caracteresProblematicos, $reemplazos, $texto);
    }
}