<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\User;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $defaultCategories = [
            ['name' => 'Lương', 'type' => 'income', 'color' => '#4CAF50'],
            ['name' => 'Thưởng', 'type' => 'income', 'color' => '#2196F3'],
            ['name' => 'Thu nhập khác', 'type' => 'income', 'color' => '#8BC34A'],
            ['name' => 'Ăn uống', 'type' => 'expense', 'color' => '#F44336'],
            ['name' => 'Giải trí', 'type' => 'expense', 'color' => '#FF9800'],
            ['name' => 'Trọ', 'type' => 'expense', 'color' => '#9C27B0'],
            ['name' => 'Di chuyển', 'type' => 'expense', 'color' => '#3F51B5'],
            ['name' => 'Mua sắm', 'type' => 'expense', 'color' => '#795548'],
            ['name' => 'Bảo hiểm', 'type' => 'expense', 'color' => '#009688'],
        ];

        $users = User::all();

        foreach ($users as $user) {
            foreach ($defaultCategories as $cat) {
                Category::create([
                    'user_id' => $user->id,
                    'name' => $cat['name'],
                    'type' => $cat['type'],
                    'color' => $cat['color'],
                ]);
            }
        }
    }
}
