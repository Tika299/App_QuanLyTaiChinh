<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up()
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->timestamps(); // Thêm 2 cột created_at và updated_at
        });
    }
    
    public function down()
    {
        Schema::table('goals', function (Blueprint $table) {
            $table->dropTimestamps();
        });
    }
    
};
