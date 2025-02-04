<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CatalogoController;
use App\Http\Controllers\Api\ServicioController;

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

Route::get('/catalogos',[CatalogoController::class, 'index']);
Route::get('/catalogos-all',[CatalogoController::class, 'indexAll']);
Route::get('/catalogos/{id}',[CatalogoController::class, 'show']);
Route::get('/catalogos-all/{id}',[CatalogoController::class, 'showAll']);
Route::post('/catalogos',[CatalogoController::class, 'guardar']);
Route::put('/catalogos/{id}',[CatalogoController::class, 'update']);
Route::patch('/catalogos/{id}',[CatalogoController::class, 'updatePartial']);
Route::delete('/catalogos/{id}',[CatalogoController::class, 'destroy']);

Route::get('/servicios',[ServicioController::class, 'index']);
Route::get('/servicios-all',[ServicioController::class, 'indexAll']);
Route::get('/servicios/{id}',[ServicioController::class, 'show']);
Route::get('/servicios-all/{id}',[ServicioController::class, 'showAll']);
Route::post('/servicios',[ServicioController::class, 'guardar']);
Route::put('/servicios/{id}',[ServicioController::class, 'update']);
Route::patch('/servicios/{id}',[ServicioController::class, 'updatePartial']);
Route::delete('/servicios/{id}',[ServicioController::class, 'destroy']);