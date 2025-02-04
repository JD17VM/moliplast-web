<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::get('/catalogos',function (){ return 'Lista de Catálogos'; });
Route::get('/catalogos/{id}',function (){ return 'Elemento Catálogo'; });
Route::post('/catalogos',function (){ return 'Catálogo Creado'; });
Route::put('/catalogos/{id}',function (){ return 'Catálogo Actualizado Completamente'; });
Route::patch('/catalogos/{id}',function (){ return 'Elemento de Catálogo Actualizado'; });
Route::delete('/catalogos/{id}',function (){ return 'Catálogo Eliminado'; });