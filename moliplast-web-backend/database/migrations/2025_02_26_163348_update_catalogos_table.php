<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('catalogos', function (Blueprint $table) {
            $table->text('enlace_documento')->change();
            $table->text('enlace_imagen_portada')->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('catalogos', function (Blueprint $table) {
            $table->string('enlace_documento', 50)->change();
            $table->string('enlace_imagen_portada', 50)->change();
        });
    }
};
