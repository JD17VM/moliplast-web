<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
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
    ];

    protected $casts = [
        'destacados' => 'boolean',
        'estatus' => 'boolean',
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

    use HasFactory;
}
