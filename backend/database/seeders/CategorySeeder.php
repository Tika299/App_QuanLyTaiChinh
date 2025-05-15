<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::create(['name' => 'Tiết Kiệm']);
        Category::create(['name' => 'Đầu Tư']);
        Category::create(['name' => 'Chi Tiêu']);
    }
}