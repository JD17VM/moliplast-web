<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Api\CatalogoController;
use App\Http\Controllers\Api\ServicioController;
use App\Http\Controllers\Api\CategoriaController;
use App\Http\Controllers\Api\SubcategoriaController;
use App\Http\Controllers\Api\SubSubcategoriaController;

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

Route::get('/categorias',[CategoriaController::class, 'index']); // X X
Route::get('/categorias-all',[CategoriaController::class, 'indexAll']); // X X
Route::get('/categorias/{id}',[CategoriaController::class, 'show']); // X X
Route::get('/categorias-all/{id}',[CategoriaController::class, 'showAll']); // X X
Route::post('/categorias',[CategoriaController::class, 'guardar']); // X X
Route::put('/categorias/{id}',[CategoriaController::class, 'update']); // X X
Route::patch('/categorias/{id}',[CategoriaController::class, 'updatePartial']); // X X
Route::delete('/categorias/{id}',[CategoriaController::class, 'destroy']); // X X

Route::get('/subcategorias',[SubcategoriaController::class, 'index']); // X X
Route::get('/subcategorias-all',[SubcategoriaController::class, 'indexAll']); // X X
Route::get('/subcategorias/{id}',[SubcategoriaController::class, 'show']); // X X
Route::get('/subcategorias-all/{id}',[SubcategoriaController::class, 'showAll']); // X X
Route::post('/subcategorias',[SubcategoriaController::class, 'guardar']); // X X
Route::put('/subcategorias/{id}',[SubcategoriaController::class, 'update']); // X
Route::patch('/subcategorias/{id}',[SubcategoriaController::class, 'updatePartial']); // X
Route::delete('/subcategorias/{id}',[SubcategoriaController::class, 'destroy']); // X X

Route::get('/subsubcategorias',[SubsubcategoriaController::class, 'index']); // X X
Route::get('/subsubcategorias-all',[SubsubcategoriaController::class, 'indexAll']); // X
Route::get('/subsubcategorias/{id}',[SubsubcategoriaController::class, 'show']); // X
Route::get('/subsubcategorias-all/{id}',[SubsubcategoriaController::class, 'showAll']); // X
Route::post('/subsubcategorias',[SubsubcategoriaController::class, 'guardar']); // X
Route::put('/subsubcategorias/{id}',[SubsubcategoriaController::class, 'update']); // X
Route::patch('/subsubcategorias/{id}',[SubsubcategoriaController::class, 'updatePartial']); // X
Route::delete('/subsubcategorias/{id}',[SubsubcategoriaController::class, 'destroy']); // X