<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Models\Subsubcategoria;
use App\Models\Subcategoria;

class SubsubcategoriaController extends Controller
{
    public function index()
    {
        // Solo obtener subsubcategorías con estatus true
        $subsubcategorias = Subsubcategoria::where('estatus', true)->get();

        if ($subsubcategorias->isEmpty()){
            return response()->json([
                'message' => 'No hay subsubcategorias registradas',
                'status' => 404
            ], 404);
        }

        return response()->json($subsubcategorias, 200);
    }

    public function indexAll()
    {
        // Obtener todas las subsubcategorías
        $subsubcategorias = Subsubcategoria::all();

        if ($subsubcategorias->isEmpty()){
            return response()->json([
                'message' => 'No hay subsubcategorias registradas',
                'status' => 404
            ], 404);
        }

        return response()->json($subsubcategorias, 200);
    }

    public function show($id)
    {
        // Solo obtener subsubcategoría con estatus true
        $subsubcategoria = Subsubcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subsubcategoria) {
            return response()->json(['message' => 'Subsubcategoria no encontrada'], 404);
        }

        return response()->json($subsubcategoria, 200);
    }

    public function showAll($id)
    {
        $subsubcategoria = Subsubcategoria::find($id);

        if (!$subsubcategoria) {
            return response()->json(['message' => 'Subsubcategoria no encontrada'], 404);
        }

        return response()->json($subsubcategoria, 200);
    }

    public function subsubcategoriasBySubcategoria($id_subcategoria)
    {
        // Verificar si la subcategoría existe y tiene estatus true
        $subcategoria = Subcategoria::where('id', $id_subcategoria)->where('estatus', true)->first();
        
        if (!$subcategoria) {
            return response()->json(['message' => 'Subcategoria no encontrada'], 404);
        }

        // Obtener subsubcategorías de la subcategoría con estatus true
        $subsubcategorias = Subsubcategoria::where('id_subcategoria', $id_subcategoria)
                                          ->where('estatus', true)
                                          ->get();

        if ($subsubcategorias->isEmpty()) {
            return response()->json([
                'message' => 'No hay subsubcategorias para esta subcategoria',
                'status' => 404
            ], 404);
        }

        return response()->json($subsubcategorias, 200);
    }

    public function guardar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_subcategoria' => 'required|integer|exists:subcategorias,id',
            'nombre' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        // Verificar si la subcategoría tiene estatus true
        $subcategoria = Subcategoria::where('id', $request->id_subcategoria)->where('estatus', true)->first();
        
        if (!$subcategoria) {
            return response()->json(['message' => 'La subcategoria no está activa o no existe'], 404);
        }

        $subsubcategoria = Subsubcategoria::create([
            'id_subcategoria' => $request->id_subcategoria,
            'nombre' => $request->nombre,
            'estatus' => true, // Asegurar que la nueva subsubcategoría tenga estatus true
        ]);

        if (!$subsubcategoria) {
            return response()->json(['message' => 'Error al guardar la subsubcategoria'], 500);
        }

        return response()->json($subsubcategoria, 201);
    }

    public function update(Request $request, $id)
    {
        // Solo obtener subsubcategoría con estatus true
        $subsubcategoria = Subsubcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subsubcategoria) {
            return response()->json(['message' => 'Subsubcategoria no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_subcategoria' => 'required|integer|exists:subcategorias,id',
            'nombre' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        // Verificar si la subcategoría tiene estatus true
        $subcategoria = Subcategoria::where('id', $request->id_subcategoria)->where('estatus', true)->first();
        
        if (!$subcategoria) {
            return response()->json(['message' => 'La subcategoria no está activa o no existe'], 404);
        }

        $subsubcategoria->id_subcategoria = $request->id_subcategoria;
        $subsubcategoria->nombre = $request->nombre;
        $subsubcategoria->save();

        return response()->json($subsubcategoria, 200);
    }

    public function updatePartial(Request $request, $id)
    {
        // Solo obtener subsubcategoría con estatus true
        $subsubcategoria = Subsubcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subsubcategoria) {
            return response()->json(['message' => 'Subsubcategoria no encontrada'], 404);
        }

        $validator = Validator::make($request->all(), [
            'id_subcategoria' => 'integer|exists:subcategorias,id',
            'nombre' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('id_subcategoria')) {
            // Verificar si la subcategoría tiene estatus true
            $subcategoria = Subcategoria::where('id', $request->id_subcategoria)->where('estatus', true)->first();
            
            if (!$subcategoria) {
                return response()->json(['message' => 'La subcategoria no está activa o no existe'], 404);
            }

            $subsubcategoria->id_subcategoria = $request->id_subcategoria;
        }

        if ($request->has('nombre')) {
            $subsubcategoria->nombre = $request->nombre;
        }

        $subsubcategoria->save();

        return response()->json($subsubcategoria, 200);
    }

    public function destroy($id)
    {
        // Solo obtener subsubcategoría con estatus true
        $subsubcategoria = Subsubcategoria::where('id', $id)->where('estatus', true)->first();

        if (!$subsubcategoria) {
            return response()->json(['message' => 'Subsubcategoria no encontrada'], 404);
        }

        $subsubcategoria->estatus = false;
        $subsubcategoria->save();

        return response()->json(['message' => 'Subsubcategoria eliminada'], 200);
    }
}