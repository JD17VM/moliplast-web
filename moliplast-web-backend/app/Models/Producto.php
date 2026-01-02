<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    use HasFactory;

    protected $table = 'productos';

    protected $fillable = [
        'id_categoria',
        'id_subcategoria',
        'id_subsubcategoria',
        'nombre',
        'descripcion',
        'imagen_1',
        'imagen_2',
        'imagen_3',
        'imagen_4',
        'enlace_ficha_tecnica',
        'texto_markdown',
        'destacados',
        'enlace_imagen_qr',
        'estatus',
        'codigo',

        'producto_maestro_id', // El ID del papá (si es hijo)
        'nombre_variante',     // El nombre del hijo (ej: "Rojo - Talla M")
        'atributos_division',  // Reglas del papá (ej: ["Talla", "Color"])
        'atributos_json',      // Selección del hijo (ej: {"Talla": "M"})
    ];

    protected $casts = [
        'destacados' => 'boolean',
        'estatus'    => 'boolean',
        'atributos_division' => 'array',
        'atributos_json'     => 'array',
    ];

    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    public function subcategoria()
    {
        return $this->belongsTo(Subcategoria::class);
    }

    public function subsubcategoria()
    {
        return $this->belongsTo(Subsubcategoria::class);
    }

    public function variantes()
    {
        return $this->hasMany(Producto::class, 'producto_maestro_id');
    }

    public function maestro()
    {
        return $this->belongsTo(Producto::class, 'producto_maestro_id');
    }

    public function scopeSoloPadres($query)
    {
        return $query->whereNull('producto_maestro_id');
    }
}