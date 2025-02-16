<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable; // Importar Authenticatable
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\Hash; // Importar Hash

class Administrador extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'administradores';

    protected $fillable = [
        'nombres',
        'apellidos',
        'contrasena',
        'estatus',
    ];
    
    protected $hidden = [
        'contrasena',
        'remember_token',
    ];

    protected $casts = [
        'estatus' => 'boolean',
    ];

    // Mutator para hashear la contraseña
    public function setContrasenaAttribute($password) //tiene que ser el nombre literal
    {
        $this->attributes['contrasena'] = Hash::make($password);
    }

    /*
    ¿Qué son los mutators?

    Los mutators son métodos especiales en los modelos de Eloquent que te permiten modificar un atributo antes de que se asigne al modelo o antes de que se guarde en la base de datos. Se definen con el nombre set[NombreDelAtributo]Attribute, donde [NombreDelAtributo] es el nombre del atributo que quieres modificar.
    */
}
