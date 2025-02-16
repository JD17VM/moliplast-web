<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Administrador;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash; // Importamos Hash para la verificación

class AdministradorController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:50',
            'apellidos' => 'required|string|max:50',
            'contrasena' => 'required|string|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // No hasheamos aquí, el mutador en el modelo lo hace
        $data = $request->all();

        $administrador = Administrador::create($data);

        return response()->json([
            'message' => 'Administrador creado',
            'administrador' => $administrador,
            'status' => 201,
        ], 201);
    }

    public function index()
    {
        $administradores = Administrador::all();

        return response()->json([
            'administradores' => $administradores,
            'status' => 200,
        ], 200);
    }

    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string',
            'contrasena' => 'required|string'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $administrador = Administrador::where('nombres', $request->nombres)->first();

        if (!$administrador || !Hash::check($request->contrasena, $administrador->contrasena)) { // Usamos Hash::check()
            return response()->json([
                'lacontra' => $request->contrasena,
                'tucontra' => $administrador->contrasena,
                'message' => 'Credenciales incorrectas',
                'status' => 401
            ], 401);
        }

        // Utilizamos el ID del administrador como token simple
        $token = $administrador->id;

        return response()->json([
            'message' => 'Login exitoso',
            'administrador' => $administrador,
            'token' => $token,
            'status' => 200,
        ], 200);
    }

    public function perfil(Request $request)
    {
        return response()->json([
            'administrador' => $request->administrador,
            'status' => 200,
        ], 200);
    }
}