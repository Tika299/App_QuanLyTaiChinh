<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        Category::truncate(); // Xóa dữ liệu cũ

        $users = User::all(); // Lấy tất cả 10 người dùng
        $categories = [
            // Danh mục thu nhập
            ['type' => 'income', 'name' => 'Lương', 'color' => '#4CAF50'],
            ['type' => 'income', 'name' => 'Thưởng', 'color' => '#66BB6A'],
            ['type' => 'income', 'name' => 'Thu nhập khác', 'color' => '#81C784'],
            // Danh mục chi tiêu
            ['type' => 'expense', 'name' => 'Ăn uống', 'color' => '#FF5722'],
            ['type' => 'expense', 'name' => 'Mua sắm', 'color' => '#F06292'],
            ['type' => 'expense', 'name' => 'Bảo hiểm', 'color' => '#0288D1'],
            ['type' => 'expense', 'name' => 'Trọ', 'color' => '#0288D1'],
            ['type' => 'expense', 'name' => 'Di chuyển', 'color' => '#7B1FA2'],
            ['type' => 'expense', 'name' => 'Giải trí', 'color' => '#FFCA28'],
        ];

        foreach ($users as $user) {
            foreach ($categories as $category) {
                Category::create([
                    'user_id' => $user->id,
                    'type' => $category['type'],
                    'name' => $category['name'],
                    'color' => $category['color'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}