<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

use App\Models\Producto;
use App\Models\Categoria;
use App\Models\Subcategoria;
use App\Models\Subsubcategoria;

class ProductoController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 50); // Número de productos por página, por defecto 50
        $page = $request->input('page', 1); // Página actual, por defecto 1
        // Solo obtener productos con estatus true
        $productos = Producto::where('estatus', true)
                                ->orderBy('nombre', 'asc')
                                ->paginate($perPage, ['*'], 'page', $page);

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    /*
    public function index(Request $request)
    {
        // Solo obtener productos con estatus true
        $productos = Producto::where('estatus', true)->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }*/

    public function listarPrecios()
    {
        $resultados = DB::connection('externa')->select('SELECT * FROM precios'); // Reemplaza 'precios' con el nombre correcto de tu tabla

        return response()->json($resultados);
    }

    public function productosDestacados()
    {
        // Obtener productos destacados con estatus true y formatear la respuesta
        $productos = Producto::where('estatus', true)
            ->where('destacados', true)
            ->select('id', 'nombre', 'imagen_1')
            ->get()
            ->map(function ($producto) {
                return [
                    'id' => $producto->id,
                    'nombre' => $producto->nombre,
                    'enlace_imagen' => $producto->imagen_1,
                ];
            });

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404,
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function indexAll()
    {
        // Obtener todos los productos
        $productos = Producto::all();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');
        $words = explode(' ', $query); // Divide la consulta en 
        $firstWord = $words[0]; // Obtiene la primera palabra

        // Lista de palabras vacías en español
        $stopWords = ['de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'a', 'en', 'por', 'para', 'y', 'o'];

        // Filtrar las palabras vacías y eliminar la "s" final
        $filteredWords = array_map(function ($word) use ($stopWords) {
            $word = strtolower($word);
            if (!in_array($word, $stopWords)) {
                return rtrim($word, 's'); // Elimina la "s" final
            }
            return null; // Elimina las palabras vacías
        }, $words);

        $filteredWords = array_filter($filteredWords); // Elimina los elementos nulos (palabras vacías)

        // Obtener la primera palabra filtrada (sin la "s" si la tenía)
        $filteredFirstWord = $filteredWords[0] ?? $firstWord; // Si filteredWords esta vacio, usa la original.

        $productos = Producto::where(function ($queryBuilder) use ($filteredWords) {
            foreach ($filteredWords as $word) {
                $queryBuilder->where('nombre', 'like', '%' . $word . '%');
            }
        })
        ->select('id', 'nombre')
        ->where('estatus', true)
        ->orderByRaw("CASE WHEN nombre LIKE ? THEN 0 ELSE 1 END, nombre", [$filteredFirstWord . '%']) // Usa la primera palabra FILTRADA
        ->limit(10)
        ->get();

        return response()->json($productos);
    }

    public function completeSearch(Request $request)
    {
        $query = $request->input('query');
        $words = explode(' ', $query); // Divide la consulta en palabras
        $firstWord = $words[0]; // Obtiene la primera palabra

        // Lista de palabras vacías en español
        $stopWords = ['de', 'la', 'el', 'los', 'las', 'un', 'una', 'unos', 'unas', 'a', 'en', 'por', 'para', 'y', 'o'];

        // Filtrar las palabras vacías y eliminar la "s" final
        $filteredWords = array_map(function ($word) use ($stopWords) {
            $word = strtolower($word);
            if (!in_array($word, $stopWords)) {
                return rtrim($word, 's'); // Elimina la "s" final
            }
            return null; // Elimina las palabras vacías
        }, $words);

        $filteredWords = array_filter($filteredWords); // Elimina los elementos nulos (palabras vacías)

        // Obtener la primera palabra filtrada (sin la "s" si la tenía)
        $filteredFirstWord = $filteredWords[0] ?? $firstWord; // Si filteredWords esta vacio, usa la original.

        $productos = Producto::where(function ($queryBuilder) use ($filteredWords) {
            foreach ($filteredWords as $word) {
                $queryBuilder->where('nombre', 'like', '%' . $word . '%');
            }
        })
        ->select(
            'id',
            'codigo',
            'nombre',
            'id_categoria',
            'id_subcategoria',
            'id_subsubcategoria',
            'imagen_1',
            'imagen_2',  // Añadir estas tres imágenes
            'imagen_3',
            'imagen_4',
            'destacados',
            'enlace_imagen_qr'
        )
        ->where('estatus', true)
        ->orderByRaw("CASE WHEN nombre LIKE ? THEN 0 ELSE 1 END, nombre", [$filteredFirstWord . '%'])
        ->get();

        return response()->json($productos);
    }

    // Método para filtrar productos por categoría
    public function getByCategoria($categoria)
    {
        // Buscar productos por categoría con estatus true
        $productos = Producto::where('id_categoria', $categoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos en esta categoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    // Método para filtrar productos por categoría y subcategoría
    public function getBySubcategoria($categoria, $subcategoria)
    {
        // Buscar productos por categoría y subcategoría con estatus true
        $productos = Producto::where('id_categoria', $categoria)
                            ->where('id_subcategoria', $subcategoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos en esta subcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    // Método para filtrar productos por categoría, subcategoría y subsubcategoría
    public function getBySubsubcategoria($categoria, $subcategoria, $subsubcategoria)
    {
        // Buscar productos por categoría, subcategoría y subsubcategoría con estatus true
        $productos = Producto::where('id_categoria', $categoria)
                            ->where('id_subcategoria', $subcategoria)
                            ->where('id_subsubcategoria', $subsubcategoria)
                            ->where('estatus', true)
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos en esta subsubcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function getCategoriasConSubcategorias()
    {
        // Obtener todas las categorías con estatus true y sus subcategorías y subsubcategorías
        $categorias = Categoria::where('estatus', true)
            ->with(['subcategorias' => function ($query) {
                $query->where('estatus', true)
                    ->with(['subsubcategorias' => function ($query) {
                        $query->where('estatus', true);
                    }]);
            }])
            ->get();

        // Formatear la respuesta
        $response = $categorias->map(function ($categoria) {
            return [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
                'subcategorias' => $categoria->subcategorias->map(function ($subcategoria) {
                    return [
                        'id' => $subcategoria->id,
                        'nombre' => $subcategoria->nombre,
                        'subsubcategorias' => $subcategoria->subsubcategorias->map(function ($subsubcategoria) {
                            return [
                                'id' => $subsubcategoria->id,
                                'nombre' => $subsubcategoria->nombre,
                            ];
                        }),
                    ];
                }),
            ];
        });

        // Verificar si hay categorías activas
        if ($response->isEmpty()) {
            return response()->json([
                'message' => 'No hay categorías activas',
                'status' => 404
            ], 404);
        }

        return response()->json($response, 200);
    }

    public function getSubcategoriasPorCategoria($nombreCategoria)
    {
        // Buscar la categoría por nombre y con estatus true
        $categoria = Categoria::where('nombre', $nombreCategoria)
                            ->where('estatus', true)
                            ->first();

        // Si no se encuentra la categoría, devolver un error 404
        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener las subcategorías activas de la categoría, con sus subsubcategorías activas
        $subcategorias = Subcategoria::where('id_categoria', $categoria->id)
                                    ->where('estatus', true)
                                    ->with(['subsubcategorias' => function ($query) {
                                        $query->where('estatus', true);
                                    }])
                                    ->get();

        // Si no hay subcategorías activas, devolver un error 404
        if ($subcategorias->isEmpty()) {
            return response()->json([
                'message' => 'No hay subcategorías activas para esta categoría',
                'status' => 404
            ], 404);
        }

        // Formatear la respuesta
        $response = [
            'categoria' => [
                'id' => $categoria->id,
                'nombre' => $categoria->nombre,
            ],
            'subcategorias' => $subcategorias->map(function ($subcategoria) {
                return [
                    'id' => $subcategoria->id,
                    'nombre' => $subcategoria->nombre,
                    'subsubcategorias' => $subcategoria->subsubcategorias->map(function ($subsubcategoria) {
                        return [
                            'id' => $subsubcategoria->id,
                            'nombre' => $subsubcategoria->nombre,
                        ];
                    }),
                ];
            }),
        ];

        return response()->json($response, 200);
    }

    public function show($id)
    {
        // Solo obtener producto con estatus true
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($producto, 200);
    }

    public function showSoftlink($id)
    {
        // Obtener producto de la base de datos local
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Formatear el código para la consulta a la base de datos externa
        $codigoExterno = str_pad($producto->codigo, 6, '0', STR_PAD_LEFT);

        // Consulta a la base de datos externa para obtener el precio
        $precioExterno = DB::connection('externa')
            ->table('precios') // Reemplaza 'precios' con el nombre de tu tabla de precios
            ->where('cod_prod', $codigoExterno)
            ->value('precio_venta'); // Reemplaza 'precio' con el nombre de la columna de precio

        // Agregar el precio al objeto del producto
        if ($precioExterno !== null) {
            $producto->precio_externo = $precioExterno;
        } else {
            $producto->precio_externo = null; // O un valor predeterminado si no se encuentra el precio
        }

        return response()->json($producto, 200);
    }

    public function showAll($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        return response()->json($producto, 200);
    }
    /*
    public function getCartaProductos()
    {
        // Obtener todos los productos con estatus true y seleccionar solo los campos necesarios
        $productos = Producto::where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1') // Seleccionar solo id, nombre e imagen_1
                            ->get();

        // Verificar si hay productos activos
        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos activos',
                'status' => 404
            ], 404);
        }

        // Formatear la respuesta
        $response = $productos->map(function ($producto) {
            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'enlace_imagen' => $producto->imagen_1, // Usar la primera imagen como enlace
            ];
        });

        return response()->json($response, 200);
    }

    public function getCartaProductosPorCategoria($categoriaNombre)
    {
        // Buscar la categoría por nombre
        $categoria = Categoria::where('nombre', $categoriaNombre)
                            ->where('estatus', true)
                            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener productos de la categoría
        $productos = Producto::where('id_categoria', $categoria->id)
                            ->where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1')
                            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos en esta categoría',
                'status' => 404
            ], 404);
        }

        // Formatear la respuesta
        $response = $productos->map(function ($producto) {
            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'enlace_imagen' => $producto->imagen_1,
            ];
        });

        return response()->json($response, 200);
    }

    public function getCartaProductosPorSubcategoria($categoriaNombre, $subcategoriaNombre)
    {
        // Buscar la categoría por nombre
        $categoria = Categoria::where('nombre', $categoriaNombre)
                            ->where('estatus', true)
                            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Buscar la subcategoría por nombre y categoría
        $subcategoria = Subcategoria::where('nombre', $subcategoriaNombre)
                                ->where('id_categoria', $categoria->id)
                                ->where('estatus', true)
                                ->first();

        if (!$subcategoria) {
            return response()->json([
                'message' => 'Subcategoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener productos de la subcategoría
        $productos = Producto::where('id_categoria', $categoria->id)
                            ->where('id_subcategoria', $subcategoria->id)
                            ->where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1')
                            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos en esta subcategoría',
                'status' => 404
            ], 404);
        }

        // Formatear la respuesta
        $response = $productos->map(function ($producto) {
            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'enlace_imagen' => $producto->imagen_1,
            ];
        });

        return response()->json($response, 200);
    }

    public function getCartaProductosPorSubsubcategoria($categoriaNombre, $subcategoriaNombre, $subsubcategoriaNombre)
    {
        // Buscar la categoría por nombre
        $categoria = Categoria::where('nombre', $categoriaNombre)
                            ->where('estatus', true)
                            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Buscar la subcategoría por nombre y categoría
        $subcategoria = Subcategoria::where('nombre', $subcategoriaNombre)
                                ->where('id_categoria', $categoria->id)
                                ->where('estatus', true)
                                ->first();

        if (!$subcategoria) {
            return response()->json([
                'message' => 'Subcategoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Buscar la subsubcategoría por nombre y subcategoría
        $subsubcategoria = Subsubcategoria::where('nombre', $subsubcategoriaNombre)
                                        ->where('id_subcategoria', $subcategoria->id)
                                        ->where('estatus', true)
                                        ->first();

        if (!$subsubcategoria) {
            return response()->json([
                'message' => 'Subsubcategoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener productos de la subsubcategoría
        $productos = Producto::where('id_categoria', $categoria->id)
                            ->where('id_subcategoria', $subcategoria->id)
                            ->where('id_subsubcategoria', $subsubcategoria->id)
                            ->where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1')
                            ->get();

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos en esta subsubcategoría',
                'status' => 404
            ], 404);
        }

        // Formatear la respuesta
        $response = $productos->map(function ($producto) {
            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'enlace_imagen' => $producto->imagen_1,
            ];
        });

        return response()->json($response, 200);
    }*/

    public function getProductosRelacionados($id)
    {
        // Obtener el producto principal
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json([
                'message' => 'Producto no encontrado',
                'status' => 404
            ], 404);
        }

        // Obtener las primeras 3 letras del nombre del producto
        $prefijo = substr($producto->nombre, 0, 3);

        // Buscar productos con el mismo prefijo, excluyendo el producto actual
        // y que estén en la misma categoría si es posible
        $relacionados = Producto::where('id', '!=', $id)
                            ->where('estatus', true)
                            ->where('nombre', 'like', $prefijo . '%')
                            ->where(function($query) use ($producto) {
                                // Priorizar productos de la misma categoría
                                $query->where('id_categoria', $producto->id_categoria)
                                        ->orWhereNotNull('id');
                            })
                            ->select('id', 'nombre', 'imagen_1')
                            ->limit(4)
                            ->get();

        // Si no hay suficientes productos con el mismo prefijo,
        // completar con productos de la misma categoría
        if ($relacionados->count() < 4) {
            $faltantes = 4 - $relacionados->count();
            
            $idsExcluir = $relacionados->pluck('id')->push($id)->toArray();
            
            $adicionales = Producto::where('id', '!=', $id)
                                ->whereNotIn('id', $idsExcluir)
                                ->where('estatus', true)
                                ->where('id_categoria', $producto->id_categoria)
                                ->select('id', 'nombre', 'imagen_1')
                                ->limit($faltantes)
                                ->get();
            
            $relacionados = $relacionados->concat($adicionales);
        }

        // Si aún así no hay 4 productos, completar con otros productos activos
        if ($relacionados->count() < 4) {
            $faltantes = 4 - $relacionados->count();
            
            $idsExcluir = $relacionados->pluck('id')->push($id)->toArray();
            
            $adicionales = Producto::where('id', '!=', $id)
                                ->whereNotIn('id', $idsExcluir)
                                ->where('estatus', true)
                                ->select('id', 'nombre', 'imagen_1')
                                ->limit($faltantes)
                                ->get();
            
            $relacionados = $relacionados->concat($adicionales);
        }

        if ($relacionados->isEmpty()) {
            return response()->json([
                'message' => 'No se encontraron productos relacionados',
                'status' => 404
            ], 404);
        }

        // Formatear la respuesta como en los métodos de carta de productos
        $response = $relacionados->map(function ($producto) {
            return [
                'id' => $producto->id,
                'nombre' => $producto->nombre,
                'enlace_imagen' => $producto->imagen_1,
            ];
        });

        return response()->json($response, 200);
    }

    public function getCartaProductos(Request $request)
    {
        $perPage = $request->input('per_page', 48); // Número de productos por página, por defecto 50
        $page = $request->input('page', 1); // Página actual, por defecto 1

        // Obtener todos los productos con estatus true y seleccionar solo los campos necesarios
        $productos = Producto::where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1')
                            ->paginate($perPage, ['*'], 'page', $page);

        // Verificar si hay productos activos
        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos activos',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function getCartaProductosPorCategoria($categoriaNombre, Request $request)
    {
        $perPage = $request->input('per_page', 48);
        $page = $request->input('page', 1);

        // Buscar la categoría por nombre
        $categoria = Categoria::where('nombre', $categoriaNombre)
                            ->where('estatus', true)
                            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener productos de la categoría
        $productos = Producto::where('id_categoria', $categoria->id)
                            ->where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1')
                            ->paginate($perPage, ['*'], 'page', $page);

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos en esta categoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function getCartaProductosPorSubcategoria($categoriaNombre, $subcategoriaNombre, Request $request)
    {
        $perPage = $request->input('per_page', 48); // Número de productos por página, por defecto 50
        $page = $request->input('page', 1); // Página actual, por defecto 1

        // Buscar la categoría por nombre
        $categoria = Categoria::where('nombre', $categoriaNombre)
                            ->where('estatus', true)
                            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Buscar la subcategoría por nombre y categoría
        $subcategoria = Subcategoria::where('nombre', $subcategoriaNombre)
                                ->where('id_categoria', $categoria->id)
                                ->where('estatus', true)
                                ->first();

        if (!$subcategoria) {
            return response()->json([
                'message' => 'Subcategoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener productos de la subcategoría con paginación
        $productos = Producto::where('id_categoria', $categoria->id)
                            ->where('id_subcategoria', $subcategoria->id)
                            ->where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1')
                            ->paginate($perPage, ['*'], 'page', $page);

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos en esta subcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function getCartaProductosPorSubsubcategoria($categoriaNombre, $subcategoriaNombre, $subsubcategoriaNombre, Request $request)
    {
        $perPage = $request->input('per_page', 48); // Número de productos por página, por defecto 50
        $page = $request->input('page', 1); // Página actual, por defecto 1

        // Buscar la categoría por nombre
        $categoria = Categoria::where('nombre', $categoriaNombre)
                            ->where('estatus', true)
                            ->first();

        if (!$categoria) {
            return response()->json([
                'message' => 'Categoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Buscar la subcategoría por nombre y categoría
        $subcategoria = Subcategoria::where('nombre', $subcategoriaNombre)
                                ->where('id_categoria', $categoria->id)
                                ->where('estatus', true)
                                ->first();

        if (!$subcategoria) {
            return response()->json([
                'message' => 'Subcategoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Buscar la subsubcategoría por nombre y subcategoría
        $subsubcategoria = Subsubcategoria::where('nombre', $subsubcategoriaNombre)
                                        ->where('id_subcategoria', $subcategoria->id)
                                        ->where('estatus', true)
                                        ->first();

        if (!$subsubcategoria) {
            return response()->json([
                'message' => 'Subsubcategoría no encontrada o inactiva',
                'status' => 404
            ], 404);
        }

        // Obtener productos de la subsubcategoría con paginación
        $productos = Producto::where('id_categoria', $categoria->id)
                            ->where('id_subcategoria', $subcategoria->id)
                            ->where('id_subsubcategoria', $subsubcategoria->id)
                            ->where('estatus', true)
                            ->select('id', 'nombre', 'imagen_1')
                            ->paginate($perPage, ['*'], 'page', $page);

        if ($productos->isEmpty()) {
            return response()->json([
                'message' => 'No hay productos en esta subsubcategoría',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    public function guardar(Request $request)
    {
        // Validación
        $validator = Validator::make($request->all(), [
            'id_categoria' => 'nullable|exists:categorias,id',
            'id_subcategoria' => 'nullable|exists:subcategorias,id',
            'id_subsubcategoria' => 'nullable|exists:subsubcategorias,id',
            'nombre' => 'required|string|max:100',
            'descripcion' => 'nullable|string|max:200',
            'imagen_1' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'imagen_2' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'imagen_3' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'imagen_4' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'enlace_ficha_tecnica' => 'nullable|file|mimes:pdf,doc,docx',
            'texto_markdown' => 'nullable|string',
            'destacados' => 'boolean',
            'enlace_imagen_qr' => 'nullable|image|mimes:jpeg,png,jpg,gif',
            'codigo' => 'nullable|string|max:9',
        ]);

        if ($validator->fails()) {
            Log::error('Errores de validación detallados: ' . json_encode($validator->errors()->toArray()));
            return response()->json([
                'message' => 'Error en la validación de los datos', 
                'errors' => $validator->errors()
            ], 400);
        }

        // Guardar las imágenes y el archivo de ficha técnica
        $imagen1Url = null;
        if ($request->hasFile('imagen_1')) {
            $imagen1Path = $request->file('imagen_1')->store('productos', 'public');
            $imagen1Url = url('storage/app/public/' . $imagen1Path);
        }

        $imagen2Url = null;
        if ($request->hasFile('imagen_2')) {
            $imagen2Path = $request->file('imagen_2')->store('productos', 'public');
            $imagen2Url = url('storage/app/public/' . $imagen2Path);
        }

        $imagen3Url = null;
        if ($request->hasFile('imagen_3')) {
            $imagen3Path = $request->file('imagen_3')->store('productos', 'public');
            $imagen3Url = url('storage/app/public/' . $imagen3Path);
        }

        $imagen4Url = null;
        if ($request->hasFile('imagen_4')) {
            $imagen4Path = $request->file('imagen_4')->store('productos', 'public');
            $imagen4Url = url('storage/app/public/' . $imagen4Path);
        }

        $fichaTecnicaUrl = null;
        if ($request->hasFile('enlace_ficha_tecnica')) {
            $fichaTecnicaPath = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
            $fichaTecnicaUrl = url('storage/app/public/' . $fichaTecnicaPath);
        }

        $qrImageUrl = null;
        if ($request->hasFile('enlace_imagen_qr')) {
            $qrImagePath = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
            $qrImageUrl = url('storage/app/public/' . $qrImagePath);
        }

        // Crear el producto
        $producto = Producto::create([
            'id_categoria' => $request->id_categoria,
            'id_subcategoria' => $request->id_subcategoria,
            'id_subsubcategoria' => $request->id_subsubcategoria,
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'imagen_1' => $imagen1Url,
            'imagen_2' => $imagen2Url,
            'imagen_3' => $imagen3Url,
            'imagen_4' => $imagen4Url,
            'enlace_ficha_tecnica' => $fichaTecnicaUrl,
            'texto_markdown' => $request->texto_markdown,
            'destacados' => $request->destacados ?? false,
            'codigo' => $request->codigo,
            'estatus' => true,
        ]);

        // Generar código QR con el ID del producto
        $urlRedirect = url('api/producto/redirect/' . $producto->id);
        $qrCode = QrCode::format('png')->size(300)->generate($urlRedirect);
        $qrCodeName = 'qr-' . $producto->id . '.png';
        Storage::disk('public')->put('qr_codes/' . $qrCodeName, $qrCode);
        $qrImageUrl = url('storage/app/public/qr_codes/' . $qrCodeName);

        // Actualizar el producto con la URL del QR
        $producto->update(['enlace_imagen_qr' => $qrImageUrl]);

        if (!$producto) {
            return response()->json(['message' => 'Error al guardar el producto'], 500);
        }

        return response()->json($producto, 201);
    }

    public function redirect($id)
    {
        $producto = Producto::find($id);

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Construir la URL del producto en el frontend
        $frontendUrl = 'https://www.moliplast.com/productos/producto/' . $producto->id . '?source=softlink'; // Ajusta según tu frontend

        return redirect()->away($frontendUrl);
    }

    public function update(Request $request, $id)
    {
        Log::info('Iniciando actualización de producto', ['id' => $id, 'data' => $request->all()]);
        
        try {
            $producto = Producto::where('id', $id)->where('estatus', true)->first();

            if (!$producto) {
                Log::warning('Producto no encontrado', ['id' => $id]);
                return response()->json(['message' => 'Producto no encontrado'], 404);
            }

            $validator = Validator::make($request->all(), [
                'id_categoria' => 'nullable|exists:categorias,id',
                'id_subcategoria' => 'nullable|exists:subcategorias,id',
                'id_subsubcategoria' => 'nullable|exists:subsubcategorias,id',
                'nombre' => 'required|string|max:100',
                'descripcion' => 'nullable|string|max:200',
                'imagen_1' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_2' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_3' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_4' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'enlace_ficha_tecnica' => 'nullable|file|mimes:pdf,doc,docx',
                'texto_markdown' => 'nullable|string',
                'destacados' => 'boolean',
                'enlace_imagen_qr' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'codigo' => 'nullable|string|max:9',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            // Actualizar las imágenes si se proporcionan
            if ($request->hasFile('imagen_1') && $request->file('imagen_1')->isValid()) {
                if ($producto->imagen_1) {
                    $oldImagePath = 'public/' . str_replace(url('storage/app/public/'), '', $producto->imagen_1);
                    Storage::delete($oldImagePath);
                }
                $imagen1Path = $request->file('imagen_1')->store('productos', 'public');
                $producto->imagen_1 = url('storage/app/public/' . $imagen1Path);
            }

            if ($request->hasFile('imagen_2') && $request->file('imagen_2')->isValid()) {
                if ($producto->imagen_2) {
                    $oldImagePath = 'public/' . str_replace(url('storage/app/public/'), '', $producto->imagen_2);
                    Storage::delete($oldImagePath);
                }
                $imagen2Path = $request->file('imagen_2')->store('productos', 'public');
                $producto->imagen_2 = url('storage/app/public/' . $imagen2Path);
            }

            if ($request->hasFile('imagen_3') && $request->file('imagen_3')->isValid()) {
                if ($producto->imagen_3) {
                    $oldImagePath = 'public/' . str_replace(url('storage/app/public/'), '', $producto->imagen_3);
                    Storage::delete($oldImagePath);
                }
                $imagen3Path = $request->file('imagen_3')->store('productos', 'public');
                $producto->imagen_3 = url('storage/app/public/' . $imagen3Path);
            }

            if ($request->hasFile('imagen_4') && $request->file('imagen_4')->isValid()) {
                if ($producto->imagen_4) {
                    $oldImagePath = 'public/' . str_replace(url('storage/app/public/'), '', $producto->imagen_4);
                    Storage::delete($oldImagePath);
                }
                $imagen4Path = $request->file('imagen_4')->store('productos', 'public');
                $producto->imagen_4 = Storage::url($imagen4Path);
                $producto->imagen_4 = url('storage/app/public/' . $imagen4Path);
            }

            // Actualizar el archivo de ficha técnica si se proporciona
            if ($request->hasFile('enlace_ficha_tecnica') && $request->file('enlace_ficha_tecnica')->isValid()) {
                if ($producto->enlace_ficha_tecnica) {
                    $oldFichaPath = 'public/' . str_replace(url('storage/app/public/'), '', $producto->enlace_ficha_tecnica);
                    Storage::delete($oldFichaPath);
                }
                $fichaTecnicaPath = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
                $producto->enlace_ficha_tecnica = url('storage/app/public/' . $fichaTecnicaPath);
            }

            // Actualizar la imagen QR si se proporciona
            if ($request->hasFile('enlace_imagen_qr') && $request->file('enlace_imagen_qr')->isValid()) {
                if ($producto->enlace_imagen_qr) {
                    $oldQrPath = 'public/' . str_replace(url('storage/app/public/'), '', $producto->enlace_imagen_qr);
                    Storage::delete($oldQrPath);
                }
                $qrImagePath = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
                $producto->enlace_imagen_qr = url('storage/app/public/' . $qrImagePath);
            }

            $producto->id_categoria = $request->id_categoria ?? $producto->id_categoria;
            $producto->id_subcategoria = $request->id_subcategoria ?? $producto->id_subcategoria;
            $producto->id_subsubcategoria = $request->id_subsubcategoria ?? $producto->id_subsubcategoria;
            $producto->nombre = $request->nombre ?? $producto->nombre;
            $producto->descripcion = $request->descripcion ?? $producto->descripcion;
            $producto->texto_markdown = $request->texto_markdown ?? $producto->texto_markdown;
            $producto->destacados = $request->destacados ?? $producto->destacados;
            $producto->codigo = $request->codigo ?? $producto->codigo;
            $producto->save();

            Log::info('Producto actualizado exitosamente', ['id' => $producto->id]);
            return response()->json($producto, 200);
            
        } catch (\Exception $e) {
            Log::error('Error en actualizar producto', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json(['message' => 'Error inesperado: ' . $e->getMessage()], 500);
        }
    }

    public function updatePartial(Request $request, $id)
    {
        Log::info('Iniciando actualización parcial de producto', ['id' => $id, 'data' => $request->all()]);
        
        try {
            $producto = Producto::where('id', $id)->where('estatus', true)->first();

            if (!$producto) {
                Log::warning('Producto no encontrado en actualización parcial', ['id' => $id]);
                return response()->json(['message' => 'Producto no encontrado'], 404);
            }

            // Validamos sin restricciones estrictas para los campos de imagen
            $validator = Validator::make($request->all(), [
                'id_categoria' => 'nullable|exists:categorias,id',
                'id_subcategoria' => 'nullable|exists:subcategorias,id',
                'id_subsubcategoria' => 'nullable|exists:subsubcategorias,id',
                'nombre' => 'nullable|string|max:100',
                'descripcion' => 'nullable|string|max:200',
                'imagen_1' => 'nullable',
                'imagen_2' => 'nullable',
                'imagen_3' => 'nullable',
                'imagen_4' => 'nullable',
                'enlace_ficha_tecnica' => 'nullable',
                'texto_markdown' => 'nullable|string',
                'destacados' => 'nullable|boolean',
                'enlace_imagen_qr' => 'nullable',
                'codigo' => 'nullable|string|max:9',
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida en actualización parcial', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            // Manejo de campos regulares
            if ($request->has('id_categoria')) {
                $producto->id_categoria = $request->id_categoria;
            }

            if ($request->has('id_subcategoria')) {
                $producto->id_subcategoria = $request->id_subcategoria;
            }

            if ($request->has('id_subsubcategoria')) {
                $producto->id_subsubcategoria = $request->id_subsubcategoria;
            }

            if ($request->has('nombre')) {
                $producto->nombre = $request->nombre;
            }

            if ($request->has('descripcion')) {
                $producto->descripcion = $request->descripcion;
            }

            if ($request->has('texto_markdown')) {
                $producto->texto_markdown = $request->texto_markdown;
            }

            if ($request->has('codigo')) {
                $producto->codigo = $request->codigo;
            }

            if ($request->has('destacados')) {
                $producto->destacados = $request->destacados;
            }

            // Manejo de eliminación de imágenes (string vacío)
            $imageFields = [
                'imagen_1',
                'imagen_2',
                'imagen_3',
                'imagen_4',
                'enlace_ficha_tecnica',
                'enlace_imagen_qr'
            ];

            // Modifica la parte de manejo de eliminación de imágenes así:
            foreach ($imageFields as $field) {
                // Verifica si el campo existe y es string vacío o null
                if ($request->has($field) && ($request->input($field) === '' || $request->input($field) === null)) {
                    Log::info("Eliminar imagen: {$field} para producto {$id}");
                    
                    // Si hay una imagen existente, eliminarla del almacenamiento
                    if (!empty($producto->$field)) {
                        try {
                            $relativePath = parse_url($producto->$field, PHP_URL_PATH);
                            // Manejar casos donde parse_url no devuelve lo esperado
                            if ($relativePath) {
                                $storagePath = 'public' . str_replace('/storage', '', $relativePath);
                                
                                if (Storage::exists($storagePath)) {
                                    Storage::delete($storagePath);
                                    Log::info("Archivo eliminado: {$storagePath}");
                                } else {
                                    Log::warning("Archivo no encontrado: {$storagePath}");
                                }
                            } else {
                                Log::warning("No se pudo parsear la URL: {$producto->$field}");
                            }
                        } catch (\Exception $e) {
                            Log::error("Error al procesar la imagen {$field}: " . $e->getMessage());
                        }
                    }
                    
                    // Establecer el campo como null en la base de datos
                    $producto->$field = "";
                }
            }

            // Manejo de subida de nuevas imágenes/archivos
            if ($request->hasFile('imagen_1') && $request->file('imagen_1')->isValid()) {
                // Eliminar imagen antigua si existe
                if ($producto->imagen_1) {
                    $relativePath = parse_url($producto->imagen_1, PHP_URL_PATH);
                    $storagePath = 'public' . str_replace('/storage', '', $relativePath);
                    Storage::delete($storagePath);
                }
                $imagen1Path = $request->file('imagen_1')->store('productos', 'public');
                $producto->imagen_1 = '/storage/' . $imagen1Path;
            }

            if ($request->hasFile('imagen_2') && $request->file('imagen_2')->isValid()) {
                if ($producto->imagen_2) {
                    $relativePath = parse_url($producto->imagen_2, PHP_URL_PATH);
                    $storagePath = 'public' . str_replace('/storage', '', $relativePath);
                    Storage::delete($storagePath);
                }
                $imagen2Path = $request->file('imagen_2')->store('productos', 'public');
                $producto->imagen_2 = '/storage/' . $imagen2Path;
            }

            if ($request->hasFile('imagen_3') && $request->file('imagen_3')->isValid()) {
                if ($producto->imagen_3) {
                    $relativePath = parse_url($producto->imagen_3, PHP_URL_PATH);
                    $storagePath = 'public' . str_replace('/storage', '', $relativePath);
                    Storage::delete($storagePath);
                }
                $imagen3Path = $request->file('imagen_3')->store('productos', 'public');
                $producto->imagen_3 = '/storage/' . $imagen3Path;
            }

            if ($request->hasFile('imagen_4') && $request->file('imagen_4')->isValid()) {
                if ($producto->imagen_4) {
                    $relativePath = parse_url($producto->imagen_4, PHP_URL_PATH);
                    $storagePath = 'public' . str_replace('/storage', '', $relativePath);
                    Storage::delete($storagePath);
                }
                $imagen4Path = $request->file('imagen_4')->store('productos', 'public');
                $producto->imagen_4 = '/storage/' . $imagen4Path;
            }

            if ($request->hasFile('enlace_ficha_tecnica') && $request->file('enlace_ficha_tecnica')->isValid()) {
                if ($producto->enlace_ficha_tecnica) {
                    $relativePath = parse_url($producto->enlace_ficha_tecnica, PHP_URL_PATH);
                    $storagePath = 'public' . str_replace('/storage', '', $relativePath);
                    Storage::delete($storagePath);
                }
                $fichaTecnicaPath = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
                $producto->enlace_ficha_tecnica = '/storage/' . $fichaTecnicaPath;
            }

            if ($request->hasFile('enlace_imagen_qr') && $request->file('enlace_imagen_qr')->isValid()) {
                if ($producto->enlace_imagen_qr) {
                    $relativePath = parse_url($producto->enlace_imagen_qr, PHP_URL_PATH);
                    $storagePath = 'public' . str_replace('/storage', '', $relativePath);
                    Storage::delete($storagePath);
                }
                $qrImagePath = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
                $producto->enlace_imagen_qr = '/storage/' . $qrImagePath;
            }

            $producto->save();

            Log::info('Producto actualizado parcialmente con éxito', ['id' => $producto->id]);
            return response()->json($producto, 200);
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
        // Solo obtener producto con estatus true
        $producto = Producto::where('id', $id)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado'], 404);
        }

        // Eliminar las imágenes y el archivo de ficha técnica
        if ($producto->imagen_1) {
            $imagen1Path = str_replace('/storage/', 'public/', $producto->imagen_1);
            Storage::delete($imagen1Path);
        }

        if ($producto->imagen_2) {
            $imagen2Path = str_replace('/storage/', 'public/', $producto->imagen_2);
            Storage::delete($imagen2Path);
        }

        if ($producto->imagen_3) {
            $imagen3Path = str_replace('/storage/', 'public/', $producto->imagen_3);
            Storage::delete($imagen3Path);
        }

        if ($producto->imagen_4) {
            $imagen4Path = str_replace('/storage/', 'public/', $producto->imagen_4);
            Storage::delete($imagen4Path);
        }

        if ($producto->enlace_ficha_tecnica) {
            $fichaTecnicaPath = str_replace('/storage/', 'public/', $producto->enlace_ficha_tecnica);
            Storage::delete($fichaTecnicaPath);
        }

        if ($producto->enlace_imagen_qr) {
            $qrImagePath = str_replace('/storage/', 'public/', $producto->enlace_imagen_qr);
            Storage::delete($qrImagePath);
        }

        $producto->estatus = false;
        $producto->save();

        return response()->json(['message' => 'Producto eliminado'], 200);
    }
}