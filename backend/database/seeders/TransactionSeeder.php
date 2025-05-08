<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Transaction;

class TransactionSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = \App\Models\User::where('email', 'nguyenvan@example.com')->first();
        $user2 = \App\Models\User::where('email', 'tranle@example.com')->first();

        $category1 = \App\Models\Category::where('name', 'Lương')->first();
        $category2 = \App\Models\Category::where('name', 'Ăn uống')->first();
        $category3 = \App\Models\Category::where('name', 'Thưởng')->first();
        $category4 = \App\Models\Category::where('name', 'Đi lại')->first();

        Transaction::create([
            'user_id' => $user1->id,
            'amount' => 5000000.00,
            'category_id' => $category1->id,
            'name' => 'Lương tháng 3',
            'description' => 'Lương tháng 3 năm 2025',
            'created_at' => now(),
        ]);

        Transaction::create([
            'user_id' => $user1->id,
            'amount' => 200000.00,
            'category_id' => $category2->id,
            'name' => 'Ăn tối',
            'description' => 'Ăn tối tại nhà hàng',
            'created_at' => now()->subDays(2),
        ]);

        Transaction::create([
            'user_id' => $user2->id,
            'amount' => 1000000.00,
            'category_id' => $category3->id,
            'name' => 'Thưởng dự án',
            'description' => 'Thưởng hoàn thành dự án',
            'created_at' => now()->subDays(1),
        ]);

        Transaction::create([
            'user_id' => $user2->id,
            'amount' => 50000.00,
            'category_id' => $category4->id,
            'name' => 'Xăng xe',
            'description' => 'Đổ xăng xe máy',
            'created_at' => now(),
        ]);
    }
}