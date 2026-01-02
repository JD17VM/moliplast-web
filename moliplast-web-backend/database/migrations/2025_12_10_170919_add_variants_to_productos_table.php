<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB; 

return new class extends Migration
{
    public function up(): void
    {
        // PASO 1: CORREGIR FECHAS (Para evitar error 1292)
        try {
            DB::statement("UPDATE productos SET created_at = NULL WHERE CAST(created_at AS CHAR) LIKE '0000%'");
            DB::statement("UPDATE productos SET updated_at = NULL WHERE CAST(updated_at AS CHAR) LIKE '0000%'");
        } catch (\Exception $e) {}

        // PASO 2: INTENTAR BORRAR SOLO LA LLAVE FORÁNEA (Aislado)
        // Envolvemos TODO el Schema::table en un try-catch. 
        // Si la llave no existe, Laravel lanzará error, el catch lo atrapa, y el código SIGUE.
        try {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropForeign(['producto_maestro_id']);
            });
        } catch (\Exception $e) {
            // No hacemos nada. Si falló es porque no existía la llave. ¡Mejor!
        }

        // PASO 3: BORRAR LAS COLUMNAS (Si existen)
        // Ahora que sabemos que no hay llave foránea estorbando, borramos las columnas.
        Schema::table('productos', function (Blueprint $table) {
            if (Schema::hasColumn('productos', 'producto_maestro_id')) {
                $table->dropColumn('producto_maestro_id');
            }
            if (Schema::hasColumn('productos', 'nombre_variante')) {
                $table->dropColumn('nombre_variante');
            }
            if (Schema::hasColumn('productos', 'atributos_division')) {
                $table->dropColumn('atributos_division');
            }
            if (Schema::hasColumn('productos', 'atributos_json')) {
                $table->dropColumn('atributos_json');
            }
        });

        // PASO 4: CREAR TODO LIMPIO (El objetivo final)
        Schema::table('productos', function (Blueprint $table) {
            $table->foreignId('producto_maestro_id')
                  ->nullable()
                  ->after('id')
                  ->constrained('productos')
                  ->onDelete('set null');

            $table->string('nombre_variante')->nullable()->after('nombre');
            $table->json('atributos_division')->nullable()->after('nombre_variante');
            $table->json('atributos_json')->nullable()->after('atributos_division');
        });
    }

    public function down(): void
    {
        // Reversión segura
        try {
            Schema::table('productos', function (Blueprint $table) {
                $table->dropForeign(['producto_maestro_id']);
            });
        } catch (\Exception $e) {}

        Schema::table('productos', function (Blueprint $table) {
            $table->dropColumn([
                'producto_maestro_id',
                'nombre_variante',
                'atributos_division',
                'atributos_json'
            ]);
        });
    }
};