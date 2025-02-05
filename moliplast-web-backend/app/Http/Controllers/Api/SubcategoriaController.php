<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Models\Subcategoria;
use App\Models\Categoria;

class SubcategoriaController extends Controller
{
    public function index()
    {
        // Solo obtener subcategorías con estatus true
        $subcategorias = Subcategoria::where('estatus', true)->get();

        if ($subcategorias->isEmpty()){
            return response()->json([
                'message' => 'No hay subcategorias registradas',
                'status' => 404
            ], 404);
        }

        return response()->json($subcategorias, 200);
    }

    public function indexAll()
    {
        // Obtener todas las subcategorías
        $subcategorias = Subcategoria::all();

        if ($subcategorias->isEmpty()){
            return response()->json([
                'message' => 'No hay subcategorias registradas',
                'status' => 404
            ], 404);
        }

        return response()->json($subcategorias, 200);
    }

    public function show($id)
    {
        // Solo obtener subcategoría con estatus true
        $subcategoria = Subcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subcategoria) {
            return response()->json(['message' => 'Subcategoria no encontrada'], 404);
        }

        return response()->json($subcategoria, 200);
    }

    public function showAll($id)
    {
        $subcategoria = Subcategoria::find($id);

        if (!$subcategoria) {
            return response()->json(['message' => 'Subcategoria no encontrada'], 404);
        }

        return response()->json($subcategoria, 200);
    }

    public function subcategoriasByCategoria($id_categoria)
    {
        // Verificar si la categoría existe y tiene estatus true
        $categoria = Categoria::where('id', $id_categoria)->where('estatus', true)->first();
        
        if (!$categoria) {
            return response()->json(['message' => 'Categoria no encontrada'], 404);
        }

        // Obtener subcategorías de la categoría con estatus true
        $subcategorias = Subcategoria::where('id_categoria', $id_categoria)
                                    ->where('estatus', true)
                                    ->get();

        if ($subcategorias->isEmpty()) {
            return response()->json([
                'message' => 'No hay subcategorias para esta categoria',
                'status' => 404
            ], 404);
        }

        return response()->json($subcategorias, 200);
    }

    public function guardar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_categoria' => 'required|integer|exists:categorias,id',
            'nombre' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        // Verificar si la categoría tiene estatus true
        $categoria = Categoria::where('id', $request->id_categoria)->where('estatus', true)->first();
        
        if (!$categoria) {
            return response()->json(['message' => 'La categoria no está activa o no existe'], 404);
        }

        $subcategoria = Subcategoria::create([
            'id_categoria' => $request->id_categoria,
            'nombre' => $request->nombre,
            'estatus' => true, // Asegurar que la nueva subcategoría tenga estatus true
        ]);

        if (!$subcategoria) {
            return response()->json(['message' => 'Error al guardar la subcategoria'], 500);
        }

        return response()->json($subcategoria, 201);
    }

    public function update(Request $request, $id)
    {
        // Solo obtener subcategoría con estatus true
        $subcategoria = Subcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subcategoria) {
            return response()->json(['message' => 'Subcategoria no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_categoria' => 'required|integer|exists:categorias,id',
            'nombre' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        // Verificar si la categoría tiene estatus true
        $categoria = Categoria::where('id', $request->id_categoria)->where('estatus', true)->first();
        
        if (!$categoria) {
            return response()->json(['message' => 'La categoria no está activa o no existe'], 404);
        }

        $subcategoria->id_categoria = $request->id_categoria;
        $subcategoria->nombre = $request->nombre;
        $subcategoria->save();

        return response()->json($subcategoria, 200);
    }

    public function updatePartial(Request $request, $id)
    {
        // Solo obtener subcategoría con estatus true
        $subcategoria = Subcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subcategoria) {
            return response()->json(['message' => 'Subcategoria no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_categoria' => 'integer|exists:categorias,id',
            'nombre' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('id_categoria')) {
            // Verificar si la categoría tiene estatus true
            $categoria = Categoria::where('id', $request->id_categoria)->where('estatus', true)->first();
            
            if (!$categoria) {
                return response()->json(['message' => 'La categoria no está activa o no existe'], 404);
            }

            $subcategoria->id_categoria = $request->id_categoria;
        }

        if ($request->has('nombre')) {
            $subcategoria->nombre = $request->nombre;
        }

        $subcategoria->save();

        return response()->json($subcategoria, 200);
    }

    public function destroy($id)
    {
        // Solo obtener subcategoría con estatus true
        $subcategoria = Subcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subcategoria) {
            return response()->json(['message' => 'Subcategoria no encontrada'], 404);
        }

        $subcategoria->estatus = false;
        $subcategoria->save();

        return response()->json(['message' => 'Subcategoria eliminada'], 200);
    }
}