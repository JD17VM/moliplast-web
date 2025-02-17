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

    // Relación con Categoria
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria');
    }

    // Relación con Subsubcategorias
    public function subsubcategorias()
    {
        return $this->hasMany(Subsubcategoria::class, 'id_subcategoria');
    }

    /*
    public function categoria()
    {
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id');
    }
    */


    use HasFactory;
}
