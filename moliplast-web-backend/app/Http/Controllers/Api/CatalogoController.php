<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Models\Catalogo;

class CatalogoController extends Controller
{
    public function index()
    {
        // Solo obtener catálogos con estatus true
        $catalogos = Catalogo::where('estatus', true)->get();

        if ($catalogos->isEmpty()){
            return response()->json([
                'message' => 'No hay catalogos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($catalogos, 200);
    }

    public function indexAll()
    {
        // Solo obtener catálogos con estatus true
        $catalogos = Catalogo::all(); // Obtener todos los catálogos

        if ($catalogos->isEmpty()){
            return response()->json([
                'message' => 'No hay catalogos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($catalogos, 200);
    }

    public function show($id)
    {
        // Solo obtener catálogo con estatus true
        $catalogo = Catalogo::where('id', $id)->where('estatus', true)->first();

        if (!$catalogo) {
            return response()->json(['message' => 'Catalogo no encontrado'], 404);
        }

        return response()->json($catalogo, 200);
    }

    public function showAll($id)
    {
        $catalogo = Catalogo::find($id);

        if (!$catalogo) {
            return response()->json(['message' => 'Catalogo no encontrado'], 404);
        }

        return response()->json($catalogo, 200);
    }

    public function guardar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'enlace_documento' => 'required|string|max:50',
            'nombre'=> 'required|string|max:50',
            'enlace_imagen_portada'=> 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        $catalogo = Catalogo::create([
            'enlace_documento' => $request->enlace_documento,
            'nombre' => $request->nombre,
            'enlace_imagen_portada' => $request->enlace_imagen_portada,
            'estatus' => true, // Asegurar que el nuevo catálogo tenga estatus true
        ]);

        if (!$catalogo) {
            return response()->json(['message' => 'Error al guardar el catalogo'], 500);
        }

        return response()->json($catalogo, 201);
    }

    public function update(Request $request, $id)
    {
        // Solo obtener catálogo con estatus true
        $catalogo = Catalogo::where('id', $id)->where('estatus', true)->first();

        if (!$catalogo) {
            return response()->json(['message' => 'Catalogo no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'enlace_documento' => 'required|string|max:50',
            'nombre' => 'required|string|max:50',
            'enlace_imagen_portada' => 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        $catalogo->enlace_documento = $request->enlace_documento;
        $catalogo->nombre = $request->nombre;
        $catalogo->enlace_imagen_portada = $request->enlace_imagen_portada;
        $catalogo->save();

        return response()->json($catalogo, 200);
    }

    public function updatePartial(Request $request, $id)
    {
        // Solo obtener catálogo con estatus true
        $catalogo = Catalogo::where('id', $id)->where('estatus', true)->first();

        if (!$catalogo) {
            return response()->json(['message' => 'Catalogo no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'enlace_documento' => 'string|max:50',
            'nombre' => 'string|max:50',
            'enlace_imagen_portada' => 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('enlace_documento')) {
            $catalogo->enlace_documento = $request->enlace_documento;
        }

        if ($request->has('nombre')) {
            $catalogo->nombre = $request->nombre;
        }

        if ($request->has('enlace_imagen_portada')) {
            $catalogo->enlace_imagen_portada = $request->enlace_imagen_portada;
        }

        $catalogo->save();

        return response()->json($catalogo, 200);
    }

    public function destroy($id)
    {
        // Solo obtener catálogo con estatus true
        $catalogo = Catalogo::where('id', $id)->where('estatus', true)->first();

        if (!$catalogo) {
            return response()->json(['message' => 'Catalogo no encontrado'], 404);
        }

        $catalogo->estatus = false;
        $catalogo->save();

        return response()->json(['message' => 'Catalogo eliminado'], 200);
    }
}
