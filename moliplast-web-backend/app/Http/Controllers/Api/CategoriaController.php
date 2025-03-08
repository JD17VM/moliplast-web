<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
        // Validación
        $validator = Validator::make($request->all(), [
            'nombre' => 'required|string|max:50',
            'descripcion' => 'nullable|string|max:100',
            'enlace_imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de los datos', 
                'errors' => $validator->errors()
            ], 400);
        }

        // In the guardar method, change:
        $imagenUrl = null;
        if ($request->hasFile('enlace_imagen')) {
            $imagePath = $request->file('enlace_imagen')->store('categorias', 'public');
            $imagenUrl = url('storage/app/public/' . $imagePath);
        }
        
        // Crear la categoría
        $categoria = Categoria::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'enlace_imagen' => $imagenUrl,
            'estatus' => true,
        ]);

        if (!$categoria) {
            return response()->json(['message' => 'Error al guardar la categoria'], 500);
        }

        return response()->json($categoria, 201);
    }

    public function update(Request $request, $id)
    {
        Log::info('Iniciando actualización de categoría', ['id' => $id, 'data' => $request->all()]);
        
        try {
            $categoria = Categoria::where('id', $id)->where('estatus', true)->first();

            if (!$categoria) {
                Log::warning('Categoría no encontrada', ['id' => $id]);
                return response()->json(['message' => 'Categoría no encontrada'], 404);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'required|string|max:50',
                'descripcion' => 'nullable|string|max:100',
                'enlace_imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            // Actualizar la imagen solo si se ha proporcionado una nueva
            if ($request->hasFile('enlace_imagen') && $request->file('enlace_imagen')->isValid()) {
                if ($categoria->enlace_imagen) {
                    $oldImagePath  = 'public/' . str_replace(url('storage/app/public/'), '', $categoria->enlace_imagen);
                    Storage::delete($oldImagePath);
                }

                $imagePath = $request->file('enlace_imagen')->store('categorias', 'public');
                $categoria->enlace_imagen = url('storage/app/public/' . $imagePath);
            }

            $categoria->nombre = $request->nombre;
            $categoria->descripcion = $request->descripcion ?? $request->descripcion;
            $categoria->save();

            return response()->json($categoria, 200);
            
        } catch (\Exception $e) {
            Log::error('Error en actualizar categoría', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    }

    public function updatePartial(Request $request, $id)
    {
        Log::info('Iniciando actualización parcial de categoría', ['id' => $id, 'data' => $request->all()]);
        
        try {
            // Solo obtener categoría con estatus true
            $categoria = Categoria::where('id', $id)->where('estatus', true)->first();

            if (!$categoria) {
                Log::warning('Categoría no encontrada en actualización parcial', ['id' => $id]);
                return response()->json(['message' => 'Categoría no encontrada'], 404);
            }

            $validator = Validator::make($request->all(), [
                'nombre' => 'nullable|string|max:50',
                'descripcion' => 'nullable|string|max:100',
                'enlace_imagen' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida en actualización parcial', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            if ($request->has('nombre')) {
                $categoria->nombre = $request->nombre;
            }

            if ($request->has('descripcion')) {
                $categoria->descripcion = $request->descripcion;
            }

            if ($request->hasFile('enlace_imagen') && $request->file('enlace_imagen')->isValid()) {
                // Obtener la ruta relativa del archivo actual para eliminar
                if ($categoria->enlace_imagen) {
                    $oldImagePath = 'public/' . str_replace(url('storage/app/public/'), '', $categoria->enlace_imagen);
                    Storage::delete($oldImagePath);
                }
                
                // Guardar la nueva imagen
                $imagePath = $request->file('enlace_imagen')->store('categorias', 'public');
                if (!$imagePath) {
                    Log::error('Error al guardar la imagen en actualización parcial');
                    return response()->json(['message' => 'Error al guardar la imagen'], 500);
                }
                $categoria->enlace_imagen = url('storage/app/public/' . $imagePath);
            }

            $categoria->save();

            Log::info('Categoría actualizada parcialmente con éxito', ['id' => $categoria->id]);
            return response()->json($categoria, 200);
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
        // Solo obtener categoría con estatus true
        $categoria = Categoria::where('id', $id)->where('estatus', true)->first();

        if (!$categoria) {
            return response()->json(['message' => 'Categoría no encontrada'], 404);
        }

        // Obtener la ruta relativa del archivo para eliminar
        if ($categoria->enlace_imagen) {
            $imagePath = str_replace('/storage/', 'public/', $categoria->enlace_imagen);
            Storage::delete($imagePath);
        }

        $categoria->estatus = false;
        $categoria->save();

        return response()->json(['message' => 'Categoría eliminada'], 200);
    }
}