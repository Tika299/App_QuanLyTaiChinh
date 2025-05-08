<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $user1 = \App\Models\User::where('email', 'nguyenvan@example.com')->first();
        $user2 = \App\Models\User::where('email', 'tranle@example.com')->first();

        Category::create([
            'user_id' => $user1->id,
            'name' => 'Lương',
            'type' => 'income',
        ]);

        Category::create([
            'user_id' => $user1->id,
            'name' => 'Ăn uống',
            'type' => 'expense',
        ]);

        Category::create([
            'user_id' => $user2->id,
            'name' => 'Thưởng',
            'type' => 'income',
        ]);

        Category::create([
            'user_id' => $user2->id,
            'name' => 'Đi lại',
            'type' => 'expense',
        ]);
    }
}