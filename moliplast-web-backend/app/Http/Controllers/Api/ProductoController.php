<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

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

    public function productosByCategoria($id_categoria)
    {
        // Verificar si la categoría existe y tiene estatus true
        $categoria = Categoria::where('id', $id_categoria)->where('estatus', true)->first();
        
        if (!$categoria) {
            return response()->json(['message' => 'Categoria no encontrada'], 404);
        }

        // Obtener productos de la categoría con estatus true
        $productos = Producto::where('id_categoria', $id_categoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos para esta categoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function productosBySubcategoria($id_subcategoria)
    {
        // Verificar si la subcategoría existe y tiene estatus true
        $subcategoria = Subcategoria::where('id', $id_subcategoria)->where('estatus', true)->first();
        
        if (!$subcategoria) {
            return response()->json(['message' => 'Subcategoria no encontrada'], 404);
        }

        // Obtener productos de la subcategoría con estatus true
        $productos = Producto::where('id_subcategoria', $id_subcategoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos para esta subcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function productosBySubsubcategoria($id_subsubcategoria)
    {
        // Verificar si la subsubcategoría existe y tiene estatus true
        $subsubcategoria = Subsubcategoria::where('id', $id_subsubcategoria)->where('estatus', true)->first();
        
        if (!$subsubcategoria) {
            return response()->json(['message' => 'Subsubcategoria no encontrada'], 404);
        }

        // Obtener productos de la subsubcategoría con estatus true
        $productos = Producto::where('id_subsubcategoria', $id_subsubcategoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos para esta subsubcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function productosDestacados()
    {
        // Obtener productos destacados con estatus true
        $productos = Producto::where('destacados', true)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos destacados',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function guardar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_categoria' => 'nullable|integer|exists:categorias,id',
            'id_subcategoria' => 'nullable|integer|exists:subcategorias,id',
            'id_subsubcategoria' => 'nullable|integer|exists:subsubcategorias,id',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'imagen_1' => 'required|string|max:50',
            'imagen_2' => 'nullable|string|max:50',
            'imagen_3' => 'nullable|string|max:50',
            'imagen_4' => 'nullable|string|max:50',
            'enlace_ficha_tecnica' => 'nullable|string|max:50',
            'texto_markdown' => 'nullable|string',
            'destacados' => 'boolean',
            'enlace_imagen_qr' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        // Verificaciones de existencia y estatus para referencias externas
        if ($request->id_categoria) {
            $categoria = Categoria::where('id', $request->id_categoria)->where('estatus', true)->first();
            if (!$categoria) {
                return response()->json(['message' => 'La categoría no está activa o no existe'], 404);
            }
        }

        if ($request->id_subcategoria) {
            $subcategoria = Subcategoria::where('id', $request->id_subcategoria)->where('estatus', true)->first();
            if (!$subcategoria) {
                return response()->json(['message' => 'La subcategoría no está activa o no existe'], 404);
            }
        }

        if ($request->id_subsubcategoria) {
            $subsubcategoria = Subsubcategoria::where('id', $request->id_subsubcategoria)->where('estatus', true)->first();
            if (!$subsubcategoria) {
                return response()->json(['message' => 'La subsubcategoría no está activa o no existe'], 404);
            }
        }

        // Preparar los datos para crear el producto
        $productoData = $request->only([
            'id_categoria',
            'id_subcategoria',
            'id_subsubcategoria',
            'nombre',
            'descripcion',
            'imagen_1',
            'imagen_2',
            'imagen_3',
            'imagen_4',
            'enlace_ficha_tecnica',
            'texto_markdown',
            'enlace_imagen_qr',
        ]);

        // Manejar el campo booleano 'destacados'
        $productoData['destacados'] = $request->has('destacados') ? $request->destacados : false;
        $productoData['estatus'] = true; // Asegurar que el nuevo producto tenga estatus true

        $producto = Producto::create($productoData);

        if (!$producto) {
            return response()->json(['message' => 'Error al guardar el producto'], 500);
        }

        return response()->json($producto, 201);
    }

    public function update(Request $request, $id)
    {
        // Solo obtener producto con estatus true
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_categoria' => 'nullable|integer|exists:categorias,id',
            'id_subcategoria' => 'nullable|integer|exists:subcategorias,id',
            'id_subsubcategoria' => 'nullable|integer|exists:subsubcategorias,id',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'imagen_1' => 'required|string|max:50',
            'imagen_2' => 'nullable|string|max:50',
            'imagen_3' => 'nullable|string|max:50',
            'imagen_4' => 'nullable|string|max:50',
            'enlace_ficha_tecnica' => 'nullable|string|max:50',
            'texto_markdown' => 'nullable|string',
            'destacados' => 'boolean',
            'enlace_imagen_qr' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        // Verificaciones de existencia y estatus para referencias externas
        if ($request->id_categoria) {
            $categoria = Categoria::where('id', $request->id_categoria)->where('estatus', true)->first();
            if (!$categoria) {
                return response()->json(['message' => 'La categoría no está activa o no existe'], 404);
            }
        }

        if ($request->id_subcategoria) {
            $subcategoria = Subcategoria::where('id', $request->id_subcategoria)->where('estatus', true)->first();
            if (!$subcategoria) {
                return response()->json(['message' => 'La subcategoría no está activa o no existe'], 404);
            }
        }

        if ($request->id_subsubcategoria) {
            $subsubcategoria = Subsubcategoria::where('id', $request->id_subsubcategoria)->where('estatus', true)->first();
            if (!$subsubcategoria) {
                return response()->json(['message' => 'La subsubcategoría no está activa o no existe'], 404);
            }
        }

        // Actualizar los campos del producto
        $producto->id_categoria = $request->id_categoria;
        $producto->id_subcategoria = $request->id_subcategoria;
        $producto->id_subsubcategoria = $request->id_subsubcategoria;
        $producto->nombre = $request->nombre;
        $producto->descripcion = $request->descripcion;
        $producto->imagen_1 = $request->imagen_1;
        $producto->imagen_2 = $request->imagen_2;
        $producto->imagen_3 = $request->imagen_3;
        $producto->imagen_4 = $request->imagen_4;
        $producto->enlace_ficha_tecnica = $request->enlace_ficha_tecnica;
        $producto->texto_markdown = $request->texto_markdown;
        $producto->destacados = $request->destacados;
        $producto->enlace_imagen_qr = $request->enlace_imagen_qr;
        $producto->save();

        return response()->json($producto, 200);
    }

    public function updatePartial(Request $request, $id)
    {
        // Solo obtener producto con estatus true
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_categoria' => 'nullable|integer|exists:categorias,id',
            'id_subcategoria' => 'nullable|integer|exists:subcategorias,id',
            'id_subsubcategoria' => 'nullable|integer|exists:subsubcategorias,id',
            'nombre' => 'string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'imagen_1' => 'string|max:50',
            'imagen_2' => 'nullable|string|max:50',
            'imagen_3' => 'nullable|string|max:50',
            'imagen_4' => 'nullable|string|max:50',
            'enlace_ficha_tecnica' => 'nullable|string|max:50',
            'texto_markdown' => 'nullable|string',
            'destacados' => 'boolean',
            'enlace_imagen_qr' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        // Verificaciones para referencias externas cuando se proporcionan
        if ($request->has('id_categoria')) {
            $categoria = Categoria::where('id', $request->id_categoria)->where('estatus', true)->first();
            if (!$categoria && $request->id_categoria !== null) {
                return response()->json(['message' => 'La categoría no está activa o no existe'], 404);
            }
            $producto->id_categoria = $request->id_categoria;
        }

        if ($request->has('id_subcategoria')) {
            $subcategoria = Subcategoria::where('id', $request->id_subcategoria)->where('estatus', true)->first();
            if (!$subcategoria && $request->id_subcategoria !== null) {
                return response()->json(['message' => 'La subcategoría no está activa o no existe'], 404);
            }
            $producto->id_subcategoria = $request->id_subcategoria;
        }

        if ($request->has('id_subsubcategoria')) {
            $subsubcategoria = Subsubcategoria::where('id', $request->id_subsubcategoria)->where('estatus', true)->first();
            if (!$subsubcategoria && $request->id_subsubcategoria !== null) {
                return response()->json(['message' => 'La subsubcategoría no está activa o no existe'], 404);
            }
            $producto->id_subsubcategoria = $request->id_subsubcategoria;
        }

        // Actualizar los demás campos si se proporcionan
        if ($request->has('nombre')) {
            $producto->nombre = $request->nombre;
        }
        
        if ($request->has('descripcion')) {
            $producto->descripcion = $request->descripcion;
        }
        
        if ($request->has('imagen_1')) {
            $producto->imagen_1 = $request->imagen_1;
        }
        
        if ($request->has('imagen_2')) {
            $producto->imagen_2 = $request->imagen_2;
        }
        
        if ($request->has('imagen_3')) {
            $producto->imagen_3 = $request->imagen_3;
        }
        
        if ($request->has('imagen_4')) {
            $producto->imagen_4 = $request->imagen_4;
        }
        
        if ($request->has('enlace_ficha_tecnica')) {
            $producto->enlace_ficha_tecnica = $request->enlace_ficha_tecnica;
        }
        
        if ($request->has('texto_markdown')) {
            $producto->texto_markdown = $request->texto_markdown;
        }
        
        if ($request->has('destacados')) {
            $producto->destacados = $request->destacados;
        }
        
        if ($request->has('enlace_imagen_qr')) {
            $producto->enlace_imagen_qr = $request->enlace_imagen_qr;
        }

        $producto->save();

        return response()->json($producto, 200);
    }

    public function destroy($id)
    {
        // Solo obtener producto con estatus true
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        $producto->estatus = false;
        $producto->save();

        return response()->json(['message' => 'Producto eliminado'], 200);
    }
}