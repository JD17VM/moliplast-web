<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subcategoria extends Model
{

    protected $table = 'subcategorias';

    protected $fillable = [
        'id_categoria',
        'nombre',
        'estatus',
    ];

    protected $casts = [
        'estatus' => 'boolean', // Convierte el valor a booleano (true/false)
    ];

    // Relación con la tabla "categoria"
    public function categoria()
    {
        return $this->belongsTo(Categoria::class);
    }

    use HasFactory;
}
