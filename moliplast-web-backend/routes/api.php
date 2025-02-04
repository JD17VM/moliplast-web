<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CatalogoController;

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