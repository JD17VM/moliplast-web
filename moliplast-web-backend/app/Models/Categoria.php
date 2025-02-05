<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{

    protected $table = 'categorias';

    protected $fillable = [
        'nombre',
        'descripcion',
        'enlace_imagen',
        'estatus',
    ];

    protected $casts = [
        'estatus' => 'boolean',
    ];

    use HasFactory;
}
