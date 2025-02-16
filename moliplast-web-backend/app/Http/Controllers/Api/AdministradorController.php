<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Models\Administrador;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;

class AdministradorController extends Controller
{
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombres' => 'required|string|max:50',
            'apellidos' => 'required|string|max:50',
            'contrasena' => 'required|string|min:8',
            //'password' => 'required|string|min:8|confirmed', // Cambiado a 'password' y añadido 'confirmed'
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $administrador = Administrador::create($request->all());

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

        if (!$administrador || !Hash::check($request->contrasena, $administrador->contrasena)) {
            return response()->json([
                'message' => 'Credenciales incorrectas',
                'status' => 401
            ], 401);
        }

        return response()->json([
            'message' => 'Login exitoso',
            'administrador' => $administrador,
            'status' => 200,
        ], 200);
    }
}
