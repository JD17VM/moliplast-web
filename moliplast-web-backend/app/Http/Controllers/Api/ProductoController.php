<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Subcategoria;
use App\Models\Subsubcategoria;

class ProductoController extends Controller
{
    public function index()
    {
        // Solo obtener productos con estatus true
        $productos = Producto::where('estatus', true)->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function indexAll()
    {
        // Obtener todos los productos
        $productos = Producto::all();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    // Método para filtrar productos por categoría
    public function getByCategoria($categoria)
    {
        // Buscar productos por categoría con estatus true
        $productos = Producto::where('id_categoria', $categoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos en esta categoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    // Método para filtrar productos por categoría y subcategoría
    public function getBySubcategoria($categoria, $subcategoria)
    {
        // Buscar productos por categoría y subcategoría con estatus true
        $productos = Producto::where('id_categoria', $categoria)
                            ->where('id_subcategoria', $subcategoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos en esta subcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    // Método para filtrar productos por categoría, subcategoría y subsubcategoría
    public function getBySubsubcategoria($categoria, $subcategoria, $subsubcategoria)
    {
        // Buscar productos por categoría, subcategoría y subsubcategoría con estatus true
        $productos = Producto::where('id_categoria', $categoria)
                            ->where('id_subcategoria', $subcategoria)
                            ->where('id_subsubcategoria', $subsubcategoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos en esta subsubcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function getCategoriasConSubcategorias()
    {
        // Obtener todas las categorías con sus subcategorías y subsubcategorías
        $categorias = Categoria::with(['subcategorias.subsubcategorias'])->get();

        // Formatear la respuesta
        $response = $categorias->map(function ($categoria) {
            return [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
                'subcategorias' => $categoria->subcategorias->map(function ($subcategoria) {
                    return [
                        'id' => $subcategoria->id,
                        'nombre' => $subcategoria->nombre,
                        'subsubcategorias' => $subcategoria->subsubcategorias->map(function ($subsubcategoria) {
                            return [
                                'id' => $subsubcategoria->id,
                                'nombre' => $subsubcategoria->nombre,
                            ];
                        }),
                    ];
                }),
            ];
        });

        return response()->json($response, 200);
    }

    public function show($id)
    {
        // Solo obtener producto con estatus true
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($producto, 200);
    }

    public function showAll($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($producto, 200);
    }

    public function guardar(Request $request)
    {
        // Validación
        $validator = Validator::make($request->all(), [
            'id_categoria' => 'nullable|exists:categorias,id',
            'id_subcategoria' => 'nullable|exists:subcategorias,id',
            'id_subsubcategoria' => 'nullable|exists:subsubcategorias,id',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'imagen_1' => 'required|image|mimes:jpeg,png,jpg,gif',
            'imagen_2' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'imagen_3' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'imagen_4' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'enlace_ficha_tecnica' => 'nullable|file|mimes:pdf,doc,docx',
            'texto_markdown' => 'nullable|string',
            'destacados' => 'boolean',
            'enlace_imagen_qr' => 'required|image|mimes:jpeg,png,jpg,gif',
        ]);

        if ($validator->fails()) {
            Log::error('Errores de validación detallados: ' . json_encode($validator->errors()->toArray()));
            return response()->json([
                'message' => 'Error en la validación de los datos', 
                'errors' => $validator->errors()
            ], 400);
        }

        // Guardar las imágenes y el archivo de ficha técnica
        $imagen1Path = $request->file('imagen_1')->store('productos', 'public');
        $imagen1Url = Storage::url($imagen1Path);

        $imagen2Url = null;
        if ($request->hasFile('imagen_2')) {
            $imagen2Path = $request->file('imagen_2')->store('productos', 'public');
            $imagen2Url = Storage::url($imagen2Path);
        }

        $imagen3Url = null;
        if ($request->hasFile('imagen_3')) {
            $imagen3Path = $request->file('imagen_3')->store('productos', 'public');
            $imagen3Url = Storage::url($imagen3Path);
        }

        $imagen4Url = null;
        if ($request->hasFile('imagen_4')) {
            $imagen4Path = $request->file('imagen_4')->store('productos', 'public');
            $imagen4Url = Storage::url($imagen4Path);
        }

        $fichaTecnicaUrl = null;
        if ($request->hasFile('enlace_ficha_tecnica')) {
            $fichaTecnicaPath = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
            $fichaTecnicaUrl = Storage::url($fichaTecnicaPath);
        }

        $qrImagePath = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
        $qrImageUrl = Storage::url($qrImagePath);

        // Crear el producto
        $producto = Producto::create([
            'id_categoria' => $request->id_categoria,
            'id_subcategoria' => $request->id_subcategoria,
            'id_subsubcategoria' => $request->id_subsubcategoria,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'imagen_1' => $imagen1Url,
            'imagen_2' => $imagen2Url,
            'imagen_3' => $imagen3Url,
            'imagen_4' => $imagen4Url,
            'enlace_ficha_tecnica' => $fichaTecnicaUrl,
            'texto_markdown' => $request->texto_markdown,
            'destacados' => $request->destacados ?? false,
            'enlace_imagen_qr' => $qrImageUrl,
            'estatus' => true,
        ]);

        if (!$producto) {
            return response()->json(['message' => 'Error al guardar el producto'], 500);
        }

        return response()->json($producto, 201);
    }

    public function update(Request $request, $id)
    {
        Log::info('Iniciando actualización de producto', ['id' => $id, 'data' => $request->all()]);
        
        try {
            $producto = Producto::where('id', $id)->where('estatus', true)->first();

            if (!$producto) {
                Log::warning('Producto no encontrado', ['id' => $id]);
                return response()->json(['message' => 'Producto no encontrado'], 404);
            }

            $validator = Validator::make($request->all(), [
                'id_categoria' => 'nullable|exists:categorias,id',
                'id_subcategoria' => 'nullable|exists:subcategorias,id',
                'id_subsubcategoria' => 'nullable|exists:subsubcategorias,id',
                'nombre' => 'required|string|max:100',
                'descripcion' => 'nullable|string|max:200',
                'imagen_1' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_2' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_3' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_4' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'enlace_ficha_tecnica' => 'nullable|file|mimes:pdf,doc,docx',
                'texto_markdown' => 'nullable|string',
                'destacados' => 'boolean',
                'enlace_imagen_qr' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            // Actualizar las imágenes si se proporcionan
            if ($request->hasFile('imagen_1') && $request->file('imagen_1')->isValid()) {
                if ($producto->imagen_1) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_1);
                    Storage::delete($oldImagePath);
                }
                $imagen1Path = $request->file('imagen_1')->store('productos', 'public');
                $producto->imagen_1 = Storage::url($imagen1Path);
            }

            if ($request->hasFile('imagen_2') && $request->file('imagen_2')->isValid()) {
                if ($producto->imagen_2) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_2);
                    Storage::delete($oldImagePath);
                }
                $imagen2Path = $request->file('imagen_2')->store('productos', 'public');
                $producto->imagen_2 = Storage::url($imagen2Path);
            }

            if ($request->hasFile('imagen_3') && $request->file('imagen_3')->isValid()) {
                if ($producto->imagen_3) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_3);
                    Storage::delete($oldImagePath);
                }
                $imagen3Path = $request->file('imagen_3')->store('productos', 'public');
                $producto->imagen_3 = Storage::url($imagen3Path);
            }

            if ($request->hasFile('imagen_4') && $request->file('imagen_4')->isValid()) {
                if ($producto->imagen_4) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_4);
                    Storage::delete($oldImagePath);
                }
                $imagen4Path = $request->file('imagen_4')->store('productos', 'public');
                $producto->imagen_4 = Storage::url($imagen4Path);
            }

            // Actualizar el archivo de ficha técnica si se proporciona
            if ($request->hasFile('enlace_ficha_tecnica') && $request->file('enlace_ficha_tecnica')->isValid()) {
                if ($producto->enlace_ficha_tecnica) {
                    $oldFichaPath = str_replace('/storage/', 'public/', $producto->enlace_ficha_tecnica);
                    Storage::delete($oldFichaPath);
                }
                $fichaTecnicaPath = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
                $producto->enlace_ficha_tecnica = Storage::url($fichaTecnicaPath);
            }

            // Actualizar la imagen QR si se proporciona
            if ($request->hasFile('enlace_imagen_qr') && $request->file('enlace_imagen_qr')->isValid()) {
                if ($producto->enlace_imagen_qr) {
                    $oldQrPath = str_replace('/storage/', 'public/', $producto->enlace_imagen_qr);
                    Storage::delete($oldQrPath);
                }
                $qrImagePath = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
                $producto->enlace_imagen_qr = Storage::url($qrImagePath);
            }

            $producto->id_categoria = $request->id_categoria ?? $producto->id_categoria;
            $producto->id_subcategoria = $request->id_subcategoria ?? $producto->id_subcategoria;
            $producto->id_subsubcategoria = $request->id_subsubcategoria ?? $producto->id_subsubcategoria;
            $producto->nombre = $request->nombre ?? $producto->nombre;
            $producto->descripcion = $request->descripcion ?? $producto->descripcion;
            $producto->texto_markdown = $request->texto_markdown ?? $producto->texto_markdown;
            $producto->destacados = $request->destacados ?? $producto->destacados;
            $producto->save();

            Log::info('Producto actualizado exitosamente', ['id' => $producto->id]);
            return response()->json($producto, 200);
            
        } catch (\Exception $e) {
            Log::error('Error en actualizar producto', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    }

    public function updatePartial(Request $request, $id)
    {
        Log::info('Iniciando actualización parcial de producto', ['id' => $id, 'data' => $request->all()]);
        
        try {
            $producto = Producto::where('id', $id)->where('estatus', true)->first();

            if (!$producto) {
                Log::warning('Producto no encontrado en actualización parcial', ['id' => $id]);
                return response()->json(['message' => 'Producto no encontrado'], 404);
            }

            $validator = Validator::make($request->all(), [
                'id_categoria' => 'nullable|exists:categorias,id',
                'id_subcategoria' => 'nullable|exists:subcategorias,id',
                'id_subsubcategoria' => 'nullable|exists:subsubcategorias,id',
                'nombre' => 'nullable|string|max:100',
                'descripcion' => 'nullable|string|max:200',
                'imagen_1' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_2' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_3' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_4' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'enlace_ficha_tecnica' => 'nullable|file|mimes:pdf,doc,docx',
                'texto_markdown' => 'nullable|string',
                'destacados' => 'nullable|boolean',
                'enlace_imagen_qr' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida en actualización parcial', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            if ($request->has('id_categoria')) {
                $producto->id_categoria = $request->id_categoria;
            }

            if ($request->has('id_subcategoria')) {
                $producto->id_subcategoria = $request->id_subcategoria;
            }

            if ($request->has('id_subsubcategoria')) {
                $producto->id_subsubcategoria = $request->id_subsubcategoria;
            }

            if ($request->has('nombre')) {
                $producto->nombre = $request->nombre;
            }

            if ($request->has('descripcion')) {
                $producto->descripcion = $request->descripcion;
            }

            if ($request->hasFile('imagen_1') && $request->file('imagen_1')->isValid()) {
                if ($producto->imagen_1) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_1);
                    Storage::delete($oldImagePath);
                }
                $imagen1Path = $request->file('imagen_1')->store('productos', 'public');
                $producto->imagen_1 = Storage::url($imagen1Path);
            }

            if ($request->hasFile('imagen_2') && $request->file('imagen_2')->isValid()) {
                if ($producto->imagen_2) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_2);
                    Storage::delete($oldImagePath);
                }
                $imagen2Path = $request->file('imagen_2')->store('productos', 'public');
                $producto->imagen_2 = Storage::url($imagen2Path);
            }

            if ($request->hasFile('imagen_3') && $request->file('imagen_3')->isValid()) {
                if ($producto->imagen_3) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_3);
                    Storage::delete($oldImagePath);
                }
                $imagen3Path = $request->file('imagen_3')->store('productos', 'public');
                $producto->imagen_3 = Storage::url($imagen3Path);
            }

            if ($request->hasFile('imagen_4') && $request->file('imagen_4')->isValid()) {
                if ($producto->imagen_4) {
                    $oldImagePath = str_replace('/storage/', 'public/', $producto->imagen_4);
                    Storage::delete($oldImagePath);
                }
                $imagen4Path = $request->file('imagen_4')->store('productos', 'public');
                $producto->imagen_4 = Storage::url($imagen4Path);
            }

            if ($request->hasFile('enlace_ficha_tecnica') && $request->file('enlace_ficha_tecnica')->isValid()) {
                if ($producto->enlace_ficha_tecnica) {
                    $oldFichaPath = str_replace('/storage/', 'public/', $producto->enlace_ficha_tecnica);
                    Storage::delete($oldFichaPath);
                }
                $fichaTecnicaPath = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
                $producto->enlace_ficha_tecnica = Storage::url($fichaTecnicaPath);
            }

            if ($request->hasFile('enlace_imagen_qr') && $request->file('enlace_imagen_qr')->isValid()) {
                if ($producto->enlace_imagen_qr) {
                    $oldQrPath = str_replace('/storage/', 'public/', $producto->enlace_imagen_qr);
                    Storage::delete($oldQrPath);
                }
                $qrImagePath = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
                $producto->enlace_imagen_qr = Storage::url($qrImagePath);
            }

            if ($request->has('texto_markdown')) {
                $producto->texto_markdown = $request->texto_markdown;
            }

            if ($request->has('destacados')) {
                $producto->destacados = $request->destacados;
            }

            $producto->save();

            Log::info('Producto actualizado parcialmente con éxito', ['id' => $producto->id]);
            return response()->json($producto, 200);
        } catch (\Exception $e) {
            Log::error('Error en actualización parcial', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    }

    public function destroy($id)
    {
        // Solo obtener producto con estatus true
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Eliminar las imágenes y el archivo de ficha técnica
        if ($producto->imagen_1) {
            $imagen1Path = str_replace('/storage/', 'public/', $producto->imagen_1);
            Storage::delete($imagen1Path);
        }

        if ($producto->imagen_2) {
            $imagen2Path = str_replace('/storage/', 'public/', $producto->imagen_2);
            Storage::delete($imagen2Path);
        }

        if ($producto->imagen_3) {
            $imagen3Path = str_replace('/storage/', 'public/', $producto->imagen_3);
            Storage::delete($imagen3Path);
        }

        if ($producto->imagen_4) {
            $imagen4Path = str_replace('/storage/', 'public/', $producto->imagen_4);
            Storage::delete($imagen4Path);
        }

        if ($producto->enlace_ficha_tecnica) {
            $fichaTecnicaPath = str_replace('/storage/', 'public/', $producto->enlace_ficha_tecnica);
            Storage::delete($fichaTecnicaPath);
        }

        if ($producto->enlace_imagen_qr) {
            $qrImagePath = str_replace('/storage/', 'public/', $producto->enlace_imagen_qr);
            Storage::delete($qrImagePath);
        }

        $producto->estatus = false;
        $producto->save();

        return response()->json(['message' => 'Producto eliminado'], 200);
    }
}