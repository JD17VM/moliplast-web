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

    // Relación con Subcategorias
    public function subcategorias()
    {
        return $this->hasMany(Subcategoria::class, 'id_categoria');
    }

    //¡Buena pregunta! Las relaciones inversas en Eloquent (como belongsTo y hasMany) están diseñadas para trabajar de manera segura y eficiente siempre y cuando estén correctamente configuradas. No afectarán negativamente tu aplicación si se definen adecuadamente. De hecho, son fundamentales para que Eloquent pueda cargar datos relacionados de manera eficiente.Voy a explicarte en detalle cómo funcionan las relaciones inversas y por qué no deberían causar problemas si las defines correctamente.

}
