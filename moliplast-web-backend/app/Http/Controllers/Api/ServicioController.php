<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
        // Validación
        $validator = Validator::make($request->all(), [
            'titulo' => 'required|string|max:50',
            'descripcion' => 'required|string',
            'enlace_imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif', // Imagen opcional
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de los datos', 
                'errors' => $validator->errors()
            ], 400);
        }

        // Guardar la imagen con un nombre único solo si se proporcionó una
        $imageUrl = null;
        if ($request->hasFile('enlace_imagen') && $request->file('enlace_imagen')->isValid()) {
            $imagePath = $request->file('enlace_imagen')->store('servicios', 'public');
            $imageUrl = url('storage/app/public/' . $imagePath);
        }
        
        // Crear el servicio
        $servicio = Servicio::create([
            'titulo' => $request->titulo,
            'descripcion' => $request->descripcion,
            'enlace_imagen' => $imageUrl, // Puede ser null
            'estatus' => true,
        ]);

        if (!$servicio) {
            return response()->json(['message' => 'Error al guardar el servicio'], 500);
        }

        return response()->json($servicio, 201);
    }

    public function update(Request $request, $id)
    {
        Log::info('Iniciando actualización de servicio', ['id' => $id, 'data' => $request->all()]);
        
        try {
            $servicio = Servicio::where('id', $id)->where('estatus', true)->first();

            if (!$servicio) {
                Log::warning('Servicio no encontrado', ['id' => $id]);
                return response()->json(['message' => 'Servicio no encontrado'], 404);
            }

            $validator = Validator::make($request->all(), [
                'titulo' => 'required|string|max:50',
                'descripcion' => 'required|string',
                'enlace_imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif', // Imagen opcional
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            // Actualizar la imagen solo si se ha proporcionado una nueva
            if ($request->hasFile('enlace_imagen') && $request->file('enlace_imagen')->isValid()) {
                if ($servicio->enlace_imagen) {
                    $oldImagePath = 'public/' . str_replace(url('storage/app/public/'), '', $servicio->enlace_imagen);
                    Storage::delete($oldImagePath);
                }

                $imagePath = $request->file('enlace_imagen')->store('servicios', 'public');
                $servicio->enlace_imagen = url('storage/app/public/' . $imagePath);
            }

            $servicio->titulo = $request->titulo;
            $servicio->descripcion = $request->descripcion;
            $servicio->save();

            return response()->json($servicio, 200);
            
        } catch (\Exception $e) {
            Log::error('Error en actualizar servicio', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    }


    public function updatePartial(Request $request, $id)
    {
        Log::info('Iniciando actualización parcial de servicio', ['id' => $id, 'data' => $request->all()]);

        try {
            $servicio = Servicio::where('id', $id)->where('estatus', true)->first();

            if (!$servicio) {
                Log::warning('Servicio no encontrado en actualización parcial', ['id' => $id]);
                return response()->json(['message' => 'Servicio no encontrado'], 404);
            }

            $validator = Validator::make($request->all(), [
                'titulo' => 'nullable|string|max:50',
                'descripcion' => 'nullable|string',
                'enlace_imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif', // Imagen opcional
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida en actualización parcial', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validación de los datos',
                    'errors' => $validator->errors()
                ], 400);
            }

            if ($request->has('titulo')) {
                $servicio->titulo = $request->titulo;
            }

            if ($request->has('descripcion')) {
                $servicio->descripcion = $request->descripcion;
            }

            if ($request->hasFile('enlace_imagen') && $request->file('enlace_imagen')->isValid()) {
                if ($servicio->enlace_imagen) {
                    $oldImagePath = 'public/' . str_replace(url('storage/app/public/'), '', $servicio->enlace_imagen);
                    Storage::delete($oldImagePath);
                }

                $imagePath = $request->file('enlace_imagen')->store('servicios', 'public');
                if (!$imagePath) {
                    Log::error('Error al guardar la imagen en actualización parcial');
                    return response()->json(['message' => 'Error al guardar la imagen'], 500);
                }
                $servicio->enlace_imagen = url('storage/app/public/' . $imagePath);
            }

            $servicio->save();

            Log::info('Servicio actualizado parcialmente con éxito', ['id' => $servicio->id]);
            return response()->json($servicio, 200);
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
        // Solo obtener servicio con estatus true
        $servicio = Servicio::where('id', $id)->where('estatus', true)->first();

        if (!$servicio) {
            return response()->json(['message' => 'Servicio no encontrado'], 404);
        }

        // Obtener la ruta relativa del archivo para eliminar
        if ($servicio->enlace_imagen) {
            $imagePath = str_replace('/storage/', 'public/', $servicio->enlace_imagen);
            Storage::delete($imagePath);
        }

        $servicio->estatus = false;
        $servicio->save();

        return response()->json(['message' => 'Servicio eliminado'], 200);
    }
}