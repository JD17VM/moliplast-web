<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

use App\Models\Servicio;

class ServicioController extends Controller
{
    public function index()
    {
        $servicios = Servicio::where('estatus', true)->get();

        if ($servicios->isEmpty()){
            return response()->json([
                'message' => 'No hay servicios registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($servicios, 200);
    }

    public function indexAll()
    {
        $servicios = Servicio::all();

        if ($servicios->isEmpty()){
            return response()->json([
                'message' => 'No hay servicios registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($servicios, 200);
    }

    public function show($id)
    {
        $servicios = Servicio::where('id', $id)->where('estatus', true)->first();

        if (!$servicios) {
            return response()->json(['message' => 'Servicio no encontrado'], 404);
        }

        return response()->json($servicios, 200);
    }

    public function showAll($id)
    {
        $servicios = Servicio::find($id);

        if (!$servicios) {
            return response()->json(['message' => 'Servicio no encontrado'], 404);
        }

        return response()->json($servicios, 200);
    }

    public function guardar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:50',
            'descripcion'=> 'required|string',
            'enlace_imagen'=> 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        $servicio = Servicio::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'enlace_imagen' => $request->enlace_imagen,
            'estatus' => true,
        ]);

        if (!$servicio) {
            return response()->json(['message' => 'Error al guardar el servicio'], 500);
        }

        return response()->json($servicio, 201);
    }

    public function update(Request $request, $id)
    {
        $servicio = Servicio::where('id', $id)->where('estatus', true)->first();

        if (!$servicio) {
            return response()->json(['message' => 'Servicio no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:50',
            'descripcion'=> 'required|string',
            'enlace_imagen'=> 'required|string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        $servicio->titulo = $request->titulo;
        $servicio->descripcion = $request->descripcion;
        $servicio->enlace_imagen = $request->enlace_imagen;
        $servicio->save();

        return response()->json($servicio, 200);
    }

    public function updatePartial(Request $request, $id)
    {
        // Solo obtener catálogo con estatus true
        $servicio = Servicio::where('id', $id)->where('estatus', true)->first();

        if (!$servicio) {
            return response()->json(['message' => 'Servicio no encontrado'], 404);
        }

        $validator = Validator::make($request->all(), [
            'titulo' => 'string|max:50',
            'descripcion'=> 'string',
            'enlace_imagen'=> 'string|max:50',
        ]);

        if ($validator->fails()) {
            return response()->json(['message' => 'Error en la validacion de los datos', 'errors' => $validator->errors()], 400);
        }

        if ($request->has('titulo')) {
            $servicio->titulo = $request->titulo;
        }

        if ($request->has('descripcion')) {
            $servicio->descripcion = $request->descripcion;
        }

        if ($request->has('enlace_imagen')) {
            $servicio->enlace_imagen = $request->enlace_imagen;
        }

        $servicio->save();

        return response()->json($servicio, 200);
    }

    public function destroy($id)
    {
        // Solo obtener catálogo con estatus true
        $servicio = Servicio::where('id', $id)->where('estatus', true)->first();

        if (!$servicio) {
            return response()->json(['message' => 'Servicio no encontrado'], 404);
        }

        $servicio->estatus = false;
        $servicio->save();

        return response()->json(['message' => 'Servicio eliminado'], 200);
    }
}
