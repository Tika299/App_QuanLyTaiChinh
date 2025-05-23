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

        $categoryNames = [
            'Lương',
            'Ăn uống',
            'Trọ',
            'Di chuyển',
            'Giải trí',
            'Mua sắm',
            'Bảo hiểm',
            'Thưởng',
            'Thu nhập khác',
        ];

        $users = User::all();

        foreach ($users as $user) {
            foreach ($categoryNames as $name) {
                Category::create([
                    'user_id' => $user->id,
                    'name' => $name,
                ]);
            }
        }

        // Tùy chọn: tạo các danh mục chung không thuộc user nào
        foreach ($categoryNames as $name) {
            Category::create([
                'user_id' => null,
                'name' => $name,
            ]);
        }
    }
}
