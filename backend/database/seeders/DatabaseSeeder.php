<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Goal;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Gọi CategorySeeder
        $this->call(CategorySeeder::class);

        // // Thêm dữ liệu mục tiêu mẫu
        // $category = Category::where('name', 'Tiết Kiệm')->first();
        // for ($i = 1; $i <= 20; $i++) {
        //     Goal::create([
        //         'name' => 'Mục tiêu ' . $i,
        //         'category_id' => $category->id,
        //         'target_amount' => 10000 * $i,
        //         'due_date' => '2025-12-31',
        //         'note' => 'Ghi chú ' . $i,
        //     ]);
        // }
    }
}