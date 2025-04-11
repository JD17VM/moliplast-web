<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Producto;
use PhpOffice\PhpWord\TemplateProcessor;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class generarDocumentoDeQRsController extends Controller
{
    public function generarDocumentoDeQRsCompleto() //demora en cargar
    {
        ini_set('max_execution_time', 300); //maximo tiempo de espera 5 minutos
        // Ruta a tu plantilla
        $templatePath = public_path('plantilla_documentos_qr.docx');

        // Crear una instancia de TemplateProcessor
        $templateProcessor = new TemplateProcessor($templatePath);

        // Obtener los datos de los primeros 100 productos desde la base de datos
        $productos = Producto::where('estatus', true)
            ->select('codigo', 'nombre', 'enlace_imagen_qr')
            ->limit(100)
            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404
            ], 404);
        }

        \Log::info('Generando documento con ' . count($productos) . ' productos (limitado a 100)');

        // Reemplazos para la primera pasada
        $replacements = [];
        foreach ($productos as $index => $producto) {
            $nombreLimpio = str_replace('&', 'y', $producto->nombre);
            $codigoLimpio = str_replace('&', 'y', $producto->codigo);
            $caracteresProblematicos = ['<', '>', '"', '\'', '&'];
            $reemplazos = ['(', ')', '', '', 'y'];
            $nombreLimpio = str_replace($caracteresProblematicos, $reemplazos, $nombreLimpio);
            $codigoLimpio = str_replace($caracteresProblematicos, $reemplazos, $codigoLimpio);

            $replacements[] = [
                'nombre_producto' => $nombreLimpio,
                'descripcion_producto' => $codigoLimpio,
                'imagen_producto' => '${imagen_producto_' . $index . '}' // Placeholder para segunda pasada
            ];
        }

        // Clonar el bloque con los valores
        $templateProcessor->cloneBlock('PRODUCTO', 0, true, false, $replacements);

        // Guardar el documento generado (primera pasada)
        $outputPath = storage_path('app/catalogo_generado.docx');
        $templateProcessor->saveAs($outputPath);

        // Segunda pasada: reemplazo de placeholders de imagen
        $templateProcessor2 = new TemplateProcessor($outputPath);

        foreach ($productos as $index => $producto) {
            $placeholder = 'imagen_producto_' . $index;
            $urlImagen = $producto->enlace_imagen_qr;

            if (strpos($urlImagen, 'https://moliplast.com/api/storage/app/public/') !== false) {
                $rutaRelativa = str_replace('https://moliplast.com/api/storage/app/public/', '', $urlImagen);
                $rutaImagenLocal = storage_path('app/public/' . $rutaRelativa);

                if (file_exists($rutaImagenLocal)) {
                    try {
                        $templateProcessor2->setImageValue($placeholder, [
                            'path' => $rutaImagenLocal,
                            'width' => '2.3cm',
                            'height' => '2.3cm',
                            'ratio' => true
                        ]);
                        \Log::info("Imagen insertada: $rutaImagenLocal (Producto: {$producto->nombre})");
                    } catch (\Exception $e) {
                        \Log::error("Error insertando imagen en segunda pasada ({$producto->nombre}): " . $e->getMessage());
                    }
                } else {
                    \Log::warning("No se encontró la imagen local: $rutaImagenLocal");
                }
            }
        }

        // Guardar documento final con imágenes insertadas
        $templateProcessor2->saveAs($outputPath);

        // Descargar el documento
        return response()->download($outputPath)->deleteFileAfterSend(true);
    }

    public function generarDocumentoDeQRsParaImprimirPorCategoria($categoriaId = null) //si esta null genera los primeros 100
    {
        ini_set('max_execution_time', 300);
        // Ruta a tu plantilla
        $templatePath = public_path('plantilla_documentos_qr_para_imprimir_9.docx');

        // Verificar si la plantilla existe
        if (!file_exists($templatePath)) {
            \Log::error("Plantilla no encontrada: $templatePath");
            return response()->json([
                'message' => 'Plantilla no encontrada',
                'status' => 404
            ], 404);
        }

        // Consulta base para productos
        $query = Producto::where('estatus', true)
            ->select('id', 'codigo', 'nombre', 'enlace_imagen_qr', 'id_categoria')
            ->orderBy('id');

        // Filtrar por categoría si se proporciona un ID
        if ($categoriaId) {
            // Verificar si la categoría existe
            $categoria = Categoria::where('id', $categoriaId)
                                ->where('estatus', true)
                                ->first();

            if (!$categoria) {
                return response()->json([
                    'message' => 'Categoría no encontrada o inactiva',
                    'status' => 404
                ], 404);
            }

            $query->where('id_categoria', $categoriaId);
            \Log::info("Generando documento para la categoría ID: $categoriaId");
        }

        // Obtener los productos (con límite de 100)
        //$productos = $query->limit(100)->get();

        $productos = $query->get();

        if ($productos->isEmpty()) {
            $message = $categoriaId 
                ? 'No hay productos registrados en esta categoría' 
                : 'No hay productos registrados';
                
            return response()->json([
                'message' => $message,
                'status' => 404
            ], 404);
        }

        \Log::info('Generando documento con ' . count($productos) . ' productos');
        \Log::debug('Lista de productos:', $productos->toArray());

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
                            'codigo_formateado' => $codigoFormateado,
                            'imagen' => $producto['enlace_imagen_qr'],
                            'categoria' => $producto['id_categoria']
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
                    \Log::info("Producto: Imagen: {$rutaRelativa}, ID: {$producto->id}, Código: {$producto->codigo}, Nombre: {$producto->nombre}, Categoría: {$producto->id_categoria}");

                    if (file_exists($rutaImagenLocal)) {
                        try {
                            $templateProcessor2->setImageValue($placeholder, [
                                'path' => $rutaImagenLocal,
                                'width' => '4cm',
                                'height' => '4cm',
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

            // Nombre del archivo según si es por categoría o general
            $filename = $categoriaId 
                ? "catalogo_categoria_{$categoriaId}_productos.docx" 
                : "catalogo_productos.docx";

            // Descargar el documento
            return response()->download($finalOutputPath, $filename)
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

    public function generarDocumentoDeQRsPorIds(Request $request)
    {
        ini_set('max_execution_time', 300);
        
        // Ruta a la plantilla
        $templatePath = public_path('plantilla_documentos_qr_para_imprimir_9.docx');

        if (!file_exists($templatePath)) {
            Log::error("Plantilla no encontrada: $templatePath");
            return response()->json([
                'message' => 'Plantilla no encontrada',
                'status' => 404
            ], 404);
        }

        // Validar los IDs de productos
        $validator = Validator::make($request->all(), [
            'ids_productos' => 'required|array|min:1',
            'ids_productos.*' => 'integer|exists:productos,id'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Datos de entrada inválidos',
                'errors' => $validator->errors(),
                'status' => 400
            ], 400);
        }

        // Obtener productos ordenados por ID
        $productos = Producto::whereIn('id', $request->input('ids_productos'))
            ->where('estatus', true)
            ->select('id', 'codigo', 'nombre', 'enlace_imagen_qr')
            ->orderBy('id')
            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron productos activos con los IDs proporcionados',
                'status' => 404
            ], 404);
        }

        Log::info('Generando documento con ' . count($productos) . ' productos seleccionados');

        // Convertir a array para manipulación
        $productosArray = $productos->toArray();
        $productosModificados = [];
        
        // Recorremos los productos y modificamos según sea necesario
        for ($i = 0; $i < count($productosArray); $i++) {
            $productosModificados[] = $productosArray[$i];
            
            // Si este es el décimo producto (índice 9), duplicarlo inmediatamente después
            if ($i === 9 && isset($productosArray[$i])) {
                $productoDecimo = $productosArray[$i];
                $productosModificados[] = $productoDecimo; // Duplicar el producto #10
                Log::debug("Duplicando producto #10 (ID: {$productoDecimo['id']}) en la posición 11");
            }
        }

        // Primera pasada: clonar bloques
        $gruposProductos = array_chunk($productosModificados, 9);
        $replacements = [];
        $globalIndex = 0; // Índice global para imágenes

        foreach ($gruposProductos as $grupoIndex => $grupo) {
            $datosGrupo = [];
            $esDecimoProducto = false; // Variable para rastrear si es el décimo producto original
        
            for ($i = 1; $i <= 9; $i++) {
                $productoIndex = $i - 1;
        
                if (isset($grupo[$productoIndex])) {
                    $producto = $grupo[$productoIndex];
                    $datosGrupo['descripcion_producto_' . $i] = str_pad($this->limpiarTexto($producto['codigo']), 6, '0', STR_PAD_LEFT);
                    $datosGrupo['nombre_producto_' . $i] = $this->limpiarTexto($producto['nombre']);
        
                    // Detectar si este es el décimo producto original (antes de la duplicación en $productosModificados)
                    if ($globalIndex === 9) {
                        $datosGrupo['imagen_producto_' . $i] = ''; // No mostrar la imagen del décimo producto
                        $esDecimoProducto = true;
                        Log::debug("Omitiendo imagen para el primer slot del producto #10 (ID: {$producto['id']})");
                    } else {
                        $datosGrupo['imagen_producto_' . $i] = '${imagen_producto_' . $globalIndex . '}';
                    }
        
                    // Debug para los productos relevantes
                    if ($globalIndex === 8) {
                        Log::debug("Procesando producto #9 (ID: {$producto['id']})", [
                            'grupo' => $grupoIndex + 1,
                            'posicion' => $i,
                            'global_index' => $globalIndex
                        ]);
                    } else if ($globalIndex === 9) {
                        Log::debug("Procesando primer slot del producto #10 (ID: {$producto['id']})", [
                            'grupo' => $grupoIndex + 1,
                            'posicion' => $i,
                            'global_index' => $globalIndex
                        ]);
                    } else if ($globalIndex === 10) {
                        Log::debug("Procesando segundo slot del producto #10 (ID: {$producto['id']})", [
                            'grupo' => $grupoIndex + 1,
                            'posicion' => $i,
                            'global_index' => $globalIndex
                        ]);
                    }
        
                    $globalIndex++;
                } else {
                    $datosGrupo['descripcion_producto_' . $i] = '';
                    $datosGrupo['nombre_producto_' . $i] = '';
                    $datosGrupo['imagen_producto_' . $i] = '';
                }
            }
        
            $replacements[] = $datosGrupo;
        }

        // Procesar plantilla
        $templateProcessor = new TemplateProcessor($templatePath);
        $templateProcessor->cloneBlock('PRODUCTO', 0, true, false, $replacements);

        // Directorio temporal
        $tempDir = storage_path('app/temp');
        if (!file_exists($tempDir)) {
            mkdir($tempDir, 0755, true);
        }

        $tempOutputPath = $tempDir . '/documento_temp_' . time() . '.docx';
        $templateProcessor->saveAs($tempOutputPath);

        try {
            // Segunda pasada: insertar imágenes
            $templateProcessor2 = new TemplateProcessor($tempOutputPath);
            $globalIndex = 0;

            foreach ($productosModificados as $index => $producto) {
                $placeholder = 'imagen_producto_' . $globalIndex;
                
                // Si es el primer slot del producto #10 (índice 9), saltamos la inserción de la imagen
                if ($globalIndex === 9) {
                        Log::debug("Saltando imagen para el primer slot del producto #10 (ID: {$producto['id']})", [
                        'global_index' => $globalIndex,
                        'placeholder' => $placeholder
                    ]);
                    $templateProcessor2->setValue($placeholder, ''); // Vacía el marcador
                    $globalIndex++;
                    continue;
                }
                
                // Debug para el producto #9 y el segundo slot del #10
                if ($globalIndex === 8) {
                    Log::debug("Insertando imagen para producto #9 (ID: {$producto['id']})", [
                        'global_index' => $globalIndex,
                        'placeholder' => $placeholder
                    ]);
                } else if ($globalIndex === 10) {
                    Log::debug("Insertando imagen para segundo slot del producto #10 (ID: {$producto['id']})", [
                        'global_index' => $globalIndex,
                        'placeholder' => $placeholder
                    ]);
                }

                if (filter_var($producto['enlace_imagen_qr'], FILTER_VALIDATE_URL)) {
                    $rutaRelativa = str_replace('https://moliplast.com/api/storage/app/public/', '', $producto['enlace_imagen_qr']);
                    $rutaImagenLocal = storage_path('app/public/' . $rutaRelativa);

                    if (file_exists($rutaImagenLocal)) {
                        try {
                            $templateProcessor2->setImageValue($placeholder, [
                                'path' => $rutaImagenLocal,
                                'width' => '3.8cm',
                                'height' => '3.8cm',
                                'ratio' => true
                            ]);
                        } catch (\Exception $e) {
                            Log::error("Error insertando imagen ID {$producto['id']}: " . $e->getMessage());
                        }
                    } else {
                        Log::warning("Imagen no encontrada para ID {$producto['id']}: $rutaImagenLocal");
                    }
                } else {
                    Log::warning("URL de imagen inválida para ID {$producto['id']}: {$producto['enlace_imagen_qr']}");
                }
                
                $globalIndex++;
            }

            // Guardar documento final
            $finalOutputPath = $tempDir . '/documento_final_' . time() . '.docx';
            $templateProcessor2->saveAs($finalOutputPath);

            return response()->download($finalOutputPath, 'documento_qrs_seleccionados.docx')
                ->deleteFileAfterSend(true);

        } catch (\Exception $e) {
            Log::error("Error al generar documento: " . $e->getMessage());
            return response()->json([
                'message' => 'Error al generar el documento',
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