<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

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
        // Validación
        $validator = Validator::make($request->all(), [
            'enlace_documento' => 'required|file|mimes:pdf,doc,docx',
            'nombre' => 'required|string|max:50',
            'enlace_imagen_portada' => 'required|image|mimes:jpeg,png,jpg,gif',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Error en la validación de los datos', 
                'errors' => $validator->errors()
            ], 400);
        }

        // Guardar el documento con un nombre único
        $documentPath = $request->file('enlace_documento')->store('documents', 'public');
        $documentUrl = Storage::url($documentPath);

        // Guardar la imagen con un nombre único
        $imagePath = $request->file('enlace_imagen_portada')->store('images', 'public');
        $imageUrl = Storage::url($imagePath);

        // Crear el catálogo
        $catalogo = Catalogo::create([
            'enlace_documento' => $documentUrl,
            'nombre' => $request->nombre,
            'enlace_imagen_portada' => $imageUrl,
            'estatus' => true,
        ]);

        if (!$catalogo) {
            return response()->json(['message' => 'Error al guardar el catalogo'], 500);
        }

        return response()->json($catalogo, 201);
    }

    public function update(Request $request, $id)
    {
        Log::info('Iniciando actualización de catálogo', ['id' => $id, 'data' => $request->all()]);
        
        try {
            // Solo obtener catálogo con estatus true
            $catalogo = Catalogo::where('id', $id)->where('estatus', true)->first();

            if (!$catalogo) {
                Log::warning('Catálogo no encontrado', ['id' => $id]);
                return response()->json(['message' => 'Catalogo no encontrado'], 404);
            }

            $validator = Validator::make($request->all(), [
                'enlace_documento' => 'nullable|file|mimes:pdf,doc,docx',
                'nombre' => 'required|string|max:50',
                'enlace_imagen_portada' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida en actualización', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validacion de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            // Actualizar el documento si se proporciona uno nuevo
            if ($request->hasFile('enlace_documento') && $request->file('enlace_documento')->isValid()) {
                // Obtener la ruta relativa del archivo actual para eliminar
                if ($catalogo->enlace_documento) {
                    $oldDocumentPath = str_replace('/storage/', 'public/', $catalogo->enlace_documento);
                    Storage::delete($oldDocumentPath);
                }
                
                // Guardar el nuevo documento
                $documentPath = $request->file('enlace_documento')->store('documents', 'public');
                if (!$documentPath) {
                    Log::error('Error al guardar el documento en actualización');
                    return response()->json(['message' => 'Error al guardar el documento'], 500);
                }
                $catalogo->enlace_documento = Storage::url($documentPath);
            }

            // Actualizar la imagen si se proporciona una nueva
            if ($request->hasFile('enlace_imagen_portada') && $request->file('enlace_imagen_portada')->isValid()) {
                // Obtener la ruta relativa del archivo actual para eliminar
                if ($catalogo->enlace_imagen_portada) {
                    $oldImagePath = str_replace('/storage/', 'public/', $catalogo->enlace_imagen_portada);
                    Storage::delete($oldImagePath);
                }
                
                // Guardar la nueva imagen
                $imagePath = $request->file('enlace_imagen_portada')->store('images', 'public');
                if (!$imagePath) {
                    Log::error('Error al guardar la imagen en actualización');
                    return response()->json(['message' => 'Error al guardar la imagen'], 500);
                }
                $catalogo->enlace_imagen_portada = Storage::url($imagePath);
            }

            $catalogo->nombre = $request->nombre;
            $catalogo->save();

            Log::info('Catálogo actualizado exitosamente', ['id' => $catalogo->id]);
            return response()->json($catalogo, 200);
            
        } catch (\Exception $e) {
            Log::error('Error en actualizar catálogo', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    }

    public function updatePartial(Request $request, $id)
    {
        Log::info('Iniciando actualización parcial de catálogo', ['id' => $id, 'data' => $request->all()]);
        
        try {
            // Solo obtener catálogo con estatus true
            $catalogo = Catalogo::where('id', $id)->where('estatus', true)->first();

            if (!$catalogo) {
                Log::warning('Catálogo no encontrado en actualización parcial', ['id' => $id]);
                return response()->json(['message' => 'Catalogo no encontrado'], 404);
            }

            $validator = Validator::make($request->all(), [
                'enlace_documento' => 'nullable|file|mimes:pdf,doc,docx',
                'nombre' => 'nullable|string|max:50',
                'enlace_imagen_portada' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida en actualización parcial', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            if ($request->has('nombre')) {
                $catalogo->nombre = $request->nombre;
            }

            if ($request->hasFile('enlace_documento') && $request->file('enlace_documento')->isValid()) {
                // Obtener la ruta relativa del archivo actual para eliminar
                if ($catalogo->enlace_documento) {
                    $oldDocumentPath = str_replace('/storage/', 'public/', $catalogo->enlace_documento);
                    Storage::delete($oldDocumentPath);
                }
                
                // Guardar el nuevo documento
                $documentPath = $request->file('enlace_documento')->store('documents', 'public');
                if (!$documentPath) {
                    Log::error('Error al guardar el documento en actualización parcial');
                    return response()->json(['message' => 'Error al guardar el documento'], 500);
                }
                $catalogo->enlace_documento = Storage::url($documentPath);
            }

            if ($request->hasFile('enlace_imagen_portada') && $request->file('enlace_imagen_portada')->isValid()) {
                // Obtener la ruta relativa del archivo actual para eliminar
                if ($catalogo->enlace_imagen_portada) {
                    $oldImagePath = str_replace('/storage/', 'public/', $catalogo->enlace_imagen_portada);
                    Storage::delete($oldImagePath);
                }
                
                // Guardar la nueva imagen
                $imagePath = $request->file('enlace_imagen_portada')->store('images', 'public');
                if (!$imagePath) {
                    Log::error('Error al guardar la imagen en actualización parcial');
                    return response()->json(['message' => 'Error al guardar la imagen'], 500);
                }
                $catalogo->enlace_imagen_portada = Storage::url($imagePath);
            }

            $catalogo->save();

            Log::info('Catálogo actualizado parcialmente con éxito', ['id' => $catalogo->id]);
            return response()->json($catalogo, 200);
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
        // Solo obtener catálogo con estatus true
        $catalogo = Catalogo::where('id', $id)->where('estatus', true)->first();

        if (!$catalogo) {
            return response()->json(['message' => 'Catalogo no encontrado'], 404);
        }

        // Obtener las rutas relativas de los archivos para eliminar
        if ($catalogo->enlace_documento) {
            $documentPath = str_replace('/storage/', 'public/', $catalogo->enlace_documento);
            Storage::delete($documentPath);
        }
        
        if ($catalogo->enlace_imagen_portada) {
            $imagePath = str_replace('/storage/', 'public/', $catalogo->enlace_imagen_portada);
            Storage::delete($imagePath);
        }

        $catalogo->estatus = false;
        $catalogo->save();

        return response()->json(['message' => 'Catalogo eliminado'], 200);
    }
}