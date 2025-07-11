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

    public function showByCodigo($codigo)
    {
        // Buscamos el producto por su código en la BD local
        // Asumimos que la columna se llama 'codigo'
        $codigoNumerico = (int) $codigo;
        $producto = Producto::where('codigo', $codigoNumerico)->where('estatus', true)->first();

        if (!$producto) {
            return response()->json(['message' => 'Producto no encontrado con ese código de barras'], 404);
        }

        // Ahora hacemos la misma lógica que showSoftlink para obtener el precio
        $codigoExterno = str_pad($producto->codigo, 6, '0', STR_PAD_LEFT);
        $precioExterno = DB::connection('externa')
            ->table('precios')
            ->where('cod_prod', $codigoExterno)
            ->value('precio_venta');

        if ($precioExterno !== null) {
            $producto->precio_externo = $precioExterno;
        } else {
            $producto->precio_externo = null;
        }

        // Devolvemos el producto completo con su precio
        return response()->json($producto, 200);
    }
    
    // --- VERSIÓN CORREGIDA Y OPTIMIZADA ---
    public function getCategoriaParaCache($id_categoria)
    {
        // 1. Obtén todos los productos de la categoría de la BD local
        $productos = Producto::where('id_categoria', $id_categoria)
                            ->where('estatus', true)
                            ->select('id', 'nombre', 'descripcion', 'imagen_1', 'id_categoria', 'codigo')
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([], 200);
        }

        // 2. Extrae todos los códigos de producto y formatéalos
        $codigosExternos = $productos->map(function ($producto) {
            return str_pad($producto->codigo, 6, '0', STR_PAD_LEFT);
        })->toArray();

        // 3. Haz UNA SOLA CONSULTA a la BD externa para obtener todos los precios
        $precios = DB::connection('externa')
                    ->table('precios')
                    ->whereIn('cod_prod', $codigosExternos) // 'whereIn' es la clave
                    ->pluck('precio_venta', 'cod_prod'); // Obtiene un array asociativo [cod_prod => precio_venta]

        // 4. Asigna los precios a cada producto en un solo bucle (esto es rápido, no hay consultas)
        foreach ($productos as $producto) {
            $codigoExterno = str_pad($producto->codigo, 6, '0', STR_PAD_LEFT);
            // Usa el array de precios que ya obtuvimos. Si no existe, ponle null.
            $producto->precio_externo = $precios[$codigoExterno] ?? null;
            unset($producto->codigo); 
        }

        return response()->json($productos, 200);
    }

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
                'delete_imagen_1' => 'nullable|boolean',
                'delete_imagen_2' => 'nullable|boolean',
                'delete_imagen_3' => 'nullable|boolean',
                'delete_imagen_4' => 'nullable|boolean',
                'delete_enlace_ficha_tecnica' => 'nullable|boolean',
                'delete_enlace_imagen_qr' => 'nullable|boolean', // CORREGIDO: Añadido flag de borrado para QR
            ]);

            if ($validator->fails()) {
                 Log::error('Error de validación en update de producto', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validación de los datos',
                    'errors' => $validator->errors()
                ], 400);
            }

            $imageFields = ['imagen_1', 'imagen_2', 'imagen_3', 'imagen_4'];

            // 1. MANEJO DE IMÁGENES CON BORRADO SEGURO
            foreach ($imageFields as $field) {
                $deleteFlag = 'delete_' . $field;
                if ($request->hasFile($field)) {
                    if ($producto->{$field}) {
                        $this->deleteImageIfNotShared($producto->{$field});
                    }
                    $path = $request->file($field)->store('productos', 'public');
                    $producto->{$field} = url('storage/app/public/' . $path); // CORREGIDO: URL con tu formato
                } elseif ($request->boolean($deleteFlag)) {
                    if ($producto->{$field}) {
                        $this->deleteImageIfNotShared($producto->{$field});
                    }
                    $producto->{$field} = null;
                }
            }

            // 2. MANEJO DE FICHA TÉCNICA (Borrado directo)
            if ($request->hasFile('enlace_ficha_tecnica')) {
                if ($producto->enlace_ficha_tecnica) {
                    Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_ficha_tecnica));
                }
                $path = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
                $producto->enlace_ficha_tecnica = url('storage/app/public/' . $path);
            } elseif ($request->boolean('delete_enlace_ficha_tecnica')) {
                if ($producto->enlace_ficha_tecnica) {
                    Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_ficha_tecnica));
                }
                $producto->enlace_ficha_tecnica = null;
            }

            // 3. MANEJO DE IMAGEN QR (Borrado directo) - SECCIÓN CORREGIDA
            if ($request->hasFile('enlace_imagen_qr')) {
                if ($producto->enlace_imagen_qr) {
                    Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_imagen_qr));
                }
                $path = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
                $producto->enlace_imagen_qr = url('storage/app/public/' . $path);
            } elseif ($request->boolean('delete_enlace_imagen_qr')) {
                if ($producto->enlace_imagen_qr) {
                    Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_imagen_qr));
                }
                $producto->enlace_imagen_qr = null;
            }


            // Actualizar otros campos no-archivo
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
            Log::error('Error en actualizar producto', ['id' => $id, 'message' => $e->getMessage()]);
            return response()->json(['message' => 'Error inesperado al actualizar producto: ' . $e->getMessage()], 500);
        }
    }

    protected function getStoragePathFromUrl(?string $url): ?string
    {
        if (empty($url)) {
            return null;
        }

        // Intenta parsear la URL para obtener solo la ruta (ej. /api/storage/...)
        $path = parse_url($url, PHP_URL_PATH);
        if ($path === false || $path === null) {
             Log::warning("getStoragePathFromUrl: No se pudo parsear la URL para obtener la ruta: {$url}");
             return null;
        }

        // Busca el segmento '/storage/'
        $storageSegment = '/storage/';
        $storagePos = strpos($path, $storageSegment);

        if ($storagePos !== false) {
            // Obtiene la parte de la ruta después de '/storage/'
            $relativePath = substr($path, $storagePos + strlen($storageSegment));

            // La ruta real en el disco 'public' suele empezar con 'public/'.
            // A veces, dependiendo de cómo se configure el link simbólico,
            // la URL podría incluir 'app/public/' o solo 'public/'.
            // Queremos la ruta relativa *dentro* del disco 'public'.
            // Ej: si la URL lleva a .../storage/productos/foto.jpg, la ruta en disco es 'productos/foto.jpg'
            // Ej: si la URL lleva a .../storage/app/public/productos/foto.jpg, la ruta en disco es 'productos/foto.jpg'

            // Normalizamos la ruta. Quitamos 'app/public/' si existe al inicio.
            if (str_starts_with($relativePath, 'app/public/')) {
                 return substr($relativePath, strlen('app/public/'));
            } elseif (str_starts_with($relativePath, 'public/')) {
                 // Si ya empieza con public/, quitamos solo 'public/'
                 return substr($relativePath, strlen('public/'));
            } else {
                // Si no empieza con 'app/public/' ni 'public/', asumimos que la ruta
                // después de '/storage/' es la ruta relativa al disco 'public'.
                // Esto depende mucho de la configuración del symlink y del disco.
                // La mayoría de setups estándar con 'php artisan storage:link' mapean
                // /storage/ a storage/app/public/, así que la parte después de /storage/
                // debería ser la ruta dentro de public.
                 return $relativePath;
            }
             // Nota: En la mayoría de los casos estándar de Laravel, la ruta correcta
             // para Storage::disk('public')->delete() es la parte de la URL *después* de '/storage/',
             // porque el symlink '/storage' apunta a 'storage/app/public'.
             // Por ejemplo, URL `.../storage/productos/foto.jpg` mapea a `storage/app/public/productos/foto.jpg`.
             // Para `Storage::disk('public')->delete()`, la ruta es `productos/foto.jpg`.
             // La lógica simple `substr($path, $storagePos + strlen($storageSegment))` suele ser suficiente
             // si tu symlink es estándar. La versión con `app/public` y `public/` check es más defensiva
             // para URL structures slightly different. Let's simplify to the standard expected format for delete:

            // Simplificado para el caso estándar: la ruta en disco es la parte después de /storage/
            return substr($path, $storagePos + strlen($storageSegment));


        }

         Log::warning("getStoragePathFromUrl: No se encontró el segmento '/storage/' en la ruta de la URL: {$path} (Original URL: {$url})");
        return null; // '/storage/' segment not found
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

            $validator = Validator::make($request->all(), [
                'id_categoria' => 'nullable|exists:categorias,id',
                'id_subcategoria' => 'nullable|exists:subcategorias,id',
                'id_subsubcategoria' => 'nullable|exists:subsubcategorias,id',
                'nombre' => 'nullable|string|max:100',
                'descripcion' => 'nullable|string|max:200',
                'imagen_1' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_2' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_3' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'imagen_4' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'enlace_ficha_tecnica' => 'nullable|file|mimes:pdf,doc,docx',
                'texto_markdown' => 'nullable|string',
                'destacados' => 'nullable|boolean',
                'enlace_imagen_qr' => 'nullable|image|mimes:jpeg,png,jpg,gif',
                'codigo' => 'nullable|string|max:9',
            ]);

            if ($validator->fails()) {
                Log::error('Validación fallida en actualización parcial', ['errors' => $validator->errors()]);
                return response()->json([
                    'message' => 'Error en la validación de los datos', 
                    'errors' => $validator->errors()
                ], 400);
            }

            // Actualizar campos de texto si existen en la petición
            foreach (['nombre', 'descripcion', 'texto_markdown', 'codigo', 'id_categoria', 'id_subcategoria', 'id_subsubcategoria', 'destacados'] as $field) {
                if ($request->has($field)) {
                    $producto->{$field} = $request->input($field);
                }
            }

            // Actualizar archivos de imagen de forma segura si se envían
            $imageFields = ['imagen_1', 'imagen_2', 'imagen_3', 'imagen_4'];
            foreach ($imageFields as $field) {
                if ($request->hasFile($field)) {
                    if ($producto->{$field}) {
                        $this->deleteImageIfNotShared($producto->{$field});
                    }
                    $path = $request->file($field)->store('productos', 'public');
                    $producto->{$field} = url('storage/app/public/' . $path);
                }
            }

            // Actualizar ficha técnica (borrado directo)
            if ($request->hasFile('enlace_ficha_tecnica')) {
                if ($producto->enlace_ficha_tecnica) {
                    Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_ficha_tecnica));
                }
                $path = $request->file('enlace_ficha_tecnica')->store('fichas_tecnicas', 'public');
                $producto->enlace_ficha_tecnica = url('storage/app/public/' . $path);
            }

            // CORREGIDO: Actualizar imagen QR (borrado directo)
            if ($request->hasFile('enlace_imagen_qr')) {
                if ($producto->enlace_imagen_qr) {
                    Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_imagen_qr));
                }
                $path = $request->file('enlace_imagen_qr')->store('qr_images', 'public');
                $producto->enlace_imagen_qr = url('storage/app/public/' . $path);
            }

            $producto->save();

            Log::info('Producto actualizado parcialmente con éxito', ['id' => $producto->id]);
            return response()->json($producto, 200);
        } catch (\Exception $e) {
            Log::error('Error en actualización parcial', ['id' => $id, 'message' => $e->getMessage()]);
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

        // 1. Borrado seguro para las imágenes que pueden ser compartidas
        $imageFields = ['imagen_1', 'imagen_2', 'imagen_3', 'imagen_4'];
        foreach ($imageFields as $field) {
            if ($producto->{$field}) {
                $this->deleteImageIfNotShared($producto->{$field}); // MODIFICADO: Llama a la función de borrado seguro
            }
        }

        // 2. Borrado directo para archivos que no son compartidos
        if ($producto->enlace_ficha_tecnica) {
            Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_ficha_tecnica));
        }

        if ($producto->enlace_imagen_qr) {
            Storage::disk('public')->delete($this->getStoragePathFromUrl($producto->enlace_imagen_qr));
        }

        $producto->estatus = false;
        $producto->save();

        return response()->json(['message' => 'Producto eliminado'], 200);
    }

    /**
     * Permite subir y asociar imágenes masivamente a productos seleccionados.
     * Actualiza solo las imágenes provistas, conservando las no provistas.
     */
    public function bulkImageUpload(Request $request)
    {
        Log::info('Iniciando carga masiva de imágenes', ['data' => $request->all()]);

        // 1. Validación de la solicitud
        $validator = Validator::make($request->all(), [
            // product_ids: requerido y debe ser un JSON string que decodifique a un array de enteros
            'product_ids' => 'required|json',
            // Las imágenes son opcionales individualmente, pero al menos una debe existir para proceder.
            // max:2048 (2MB) es un tamaño razonable, ajusta si es necesario.
            'imagen_1' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'imagen_2' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'imagen_3' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
            'imagen_4' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($validator->fails()) {
            Log::error('Errores de validación en carga masiva de imágenes:', ['errors' => $validator->errors()->toArray()]);
            return response()->json([
                'message' => 'Error en la validación de los datos',
                'errors' => $validator->errors()
            ], 400);
        }

        // Decodificar los IDs de productos. Aseguramos que sea un array.
        $productIds = json_decode($request->input('product_ids'), true);

        if (empty($productIds) || !is_array($productIds)) {
            Log::warning('No se proporcionaron IDs de productos válidos para la carga masiva.');
            return response()->json(['message' => 'Por favor, selecciona al menos un producto.'], 400);
        }

        // 2. Procesar las imágenes que SÍ se subieron en esta petición
        $uploadedImagePaths = [];
        $imageFields = ['imagen_1', 'imagen_2', 'imagen_3', 'imagen_4'];
        $pathsToDeleteIfTransactionFails = []; // Para limpiar si algo sale mal

        foreach ($imageFields as $field) {
            if ($request->hasFile($field) && $request->file($field)->isValid()) {
                $file = $request->file($field);
                $path = $file->store('productos', 'public'); // Guarda en storage/app/public/productos
                // Almacena la URL pública para la base de datos
                $url = url('storage/app/public/' . $path); // Tu formato de URL actual
                $uploadedImagePaths[$field] = $url;
                $pathsToDeleteIfTransactionFails[] = $path; // Guardar la ruta interna para posible eliminación
                Log::info("Archivo {$field} subido: {$url}");
            }
        }

        // Verificar si al menos una imagen fue subida para la operación masiva
        if (empty($uploadedImagePaths)) {
            Log::warning('No se subieron imágenes para la operación masiva.');
            return response()->json(['message' => 'Por favor, selecciona al menos una imagen para subir.'], 400);
        }

        // 3. Iniciar una transacción de base de datos para asegurar atomicidad
        DB::beginTransaction();
        try {
            // Recorrer los IDs de productos y actualizar cada uno
            foreach ($productIds as $id) {
                // Solo busca productos con estatus true
                $producto = Producto::where('id', $id)->where('estatus', true)->first();

                if (!$producto) {
                    Log::warning("Producto con ID {$id} no encontrado o inactivo para la carga masiva. Se omitirá.");
                    continue; // Saltar al siguiente producto si no se encuentra
                }

                // Actualizar solo los campos de imagen que fueron subidos en esta solicitud
                foreach ($uploadedImagePaths as $field => $newImageUrl) {
                    // Si el producto ya tenía una imagen en este campo, borrar la antigua
                    if ($producto->{$field}) {
                        $this->deleteImageIfNotShared($producto->{$field}); // Borrado seguro
                    }
                    // Asignar la nueva URL de la imagen
                    $producto->{$field} = $newImageUrl;
                    Log::info("Producto {$producto->id}, campo {$field} actualizado con nueva URL: {$newImageUrl}");
                }
                $producto->save(); // Guardar los cambios del producto
            }

            DB::commit(); // Confirmar la transacción si todo fue exitoso
            Log::info('Carga masiva de imágenes completada exitosamente.');
            return response()->json(['message' => 'Imágenes subidas y asociadas exitosamente a los productos seleccionados.'], 200);

        } catch (\Exception $e) {
            DB::rollBack(); // Revertir la transacción si ocurre un error
            Log::error('Error en carga masiva de imágenes (transacción revertida): ' . $e->getMessage());

            // Eliminar los archivos que se subieron si la transacción falló para evitar archivos huérfanos
            foreach ($pathsToDeleteIfTransactionFails as $path) {
                if (Storage::disk('public')->exists($path)) {
                    Storage::disk('public')->delete($path);
                    Log::info("Archivo temporal eliminado debido a fallo de transacción: {$path}");
                }
            }
            return response()->json(['message' => 'Error al asociar imágenes masivamente. ' . $e->getMessage()], 500);
        }
    }

    public function getAllProductIdsAndCategoryIds()
    {
        $productos = Producto::where('estatus', true)
                            ->select('id', 'id_categoria') // Selecciona solo las columnas necesarias
                            ->get();

        if ($productos->isEmpty()){
            return response()->json([
                'message' => 'No hay productos activos registrados',
                'status' => 404
            ], 404);
        }

        return response()->json($productos, 200);
    }

    protected function deleteImageIfNotShared(?string $imageUrl): void
    {
        if (!$imageUrl) { // Si no hay URL, no hace nada.
            return;
        }

        // Cuenta cuántas veces se usa esta URL en todos los campos de imagen de todos los productos.
        $count = Producto::where('imagen_1', $imageUrl)
            ->orWhere('imagen_2', $imageUrl)
            ->orWhere('imagen_3', $imageUrl)
            ->orWhere('imagen_4', $imageUrl)
            ->count();

        // Si el conteo es 1 o menos, significa que solo este registro la usa (o ya ninguno), por lo que es seguro borrar el archivo.
        if ($count <= 1) {
            $filePath = $this->getStoragePathFromUrl($imageUrl);
            if ($filePath && Storage::disk('public')->exists($filePath)) {
                Storage::disk('public')->delete($filePath);
                Log::info("Archivo físico eliminado (no compartido): {$filePath}");
            }
        } else {
            Log::info("El archivo con URL {$imageUrl} está siendo usado por {$count} productos. No se eliminará el archivo físico.");
        }
    }
}