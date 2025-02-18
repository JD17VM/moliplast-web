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
        Schema::table('productos', function (Blueprint $table) {
            $table->text('imagen_1')->change();
            $table->text('imagen_2')->nullable()->change();
            $table->text('imagen_3')->nullable()->change();
            $table->text('imagen_4')->nullable()->change();
            $table->text('enlace_imagen_qr')->change();
            $table->text('enlace_ficha_tecnica')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('productos', function (Blueprint $table) {
            $table->string('imagen_1', 50)->change();
            $table->string('imagen_2', 50)->nullable()->change();
            $table->string('imagen_3', 50)->nullable()->change();
            $table->string('imagen_4', 50)->nullable()->change();
            $table->string('enlace_imagen_qr', 50)->change();
            $table->string('enlace_ficha_tecnica', 50)->nullable()->change();
        });
    }
};
