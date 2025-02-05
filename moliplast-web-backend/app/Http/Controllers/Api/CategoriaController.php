<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Models\Categoria;

class CategoriaController extends Controller
{
    public function index()
    {
        // Solo obtener categorías con estatus true
        $categorias = Categoria::where('estatus', true)->get();

        if ($categorias->isEmpty()){
            return response()->json([
                'message' => 'No hay categorias registradas',
                'status' => 404
            ], 404);
        }

        return response()->json($categorias, 200);
    }

    public function indexAll()
    {
        // Obtener todas las categorías
        $categorias = Categoria::all();

        if ($categorias->isEmpty()){
            return response()->json([
                'message' => 'No hay categorias registradas',
                'status' => 404
            ], 404);
        }

        return response()->json($categorias, 200);
    }

    public function show($id)
    {
        // Solo obtener categoría con estatus true
        $categoria = Categoria::where('id', $id)->where('estatus', true)->first();

        if (!$categoria) {
            return response()->json(['message' => 'Categoria no encontrada'], 404);
        }

        return response()->json($categoria, 200);
    }

    public function showAll($id)
    {
        $categoria = Categoria::find($id);

        if (!$categoria) {
            return response()->json(['message' => 'Categoria no encontrada'], 404);
        }

        return response()->json($categoria, 200);
    }

    public function guardar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50',
            'descripcion' => 'required|string|max:100',
            'enlace_imagen' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        $categoria = Categoria::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'enlace_imagen' => $request->enlace_imagen,
            'estatus' => true, // Asegurar que la nueva categoría tenga estatus true
        ]);

        if (!$categoria) {
            return response()->json(['message' => 'Error al guardar la categoria'], 500);
        }

        return response()->json($categoria, 201);
    }

    public function update(Request $request, $id)
    {
        // Solo obtener categoría con estatus true
        $categoria = Categoria::where('id', $id)->where('estatus', true)->first();

        if (!$categoria) {
            return response()->json(['message' => 'Categoria no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50',
            'descripcion' => 'required|string|max:100',
            'enlace_imagen' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        $categoria->nombre = $request->nombre;
        $categoria->descripcion = $request->descripcion;
        $categoria->enlace_imagen = $request->enlace_imagen;
        $categoria->save();

        return response()->json($categoria, 200);
    }

    public function updatePartial(Request $request, $id)
    {
        // Solo obtener categoría con estatus true
        $categoria = Categoria::where('id', $id)->where('estatus', true)->first();

        if (!$categoria) {
            return response()->json(['message' => 'Categoria no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'nombre' => 'string|max:50',
            'descripcion' => 'string|max:100',
            'enlace_imagen' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('nombre')) {
            $categoria->nombre = $request->nombre;
        }

        if ($request->has('descripcion')) {
            $categoria->descripcion = $request->descripcion;
        }

        if ($request->has('enlace_imagen')) {
            $categoria->enlace_imagen = $request->enlace_imagen;
        }

        $categoria->save();

        return response()->json($categoria, 200);
    }

    public function destroy($id)
    {
        // Solo obtener categoría con estatus true
        $categoria = Categoria::where('id', $id)->where('estatus', true)->first();

        if (!$categoria) {
            return response()->json(['message' => 'Categoria no encontrada'], 404);
        }

        $categoria->estatus = false;
        $categoria->save();

        return response()->json(['message' => 'Categoria eliminada'], 200);
    }
}