<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use App\Models\Goal;
use App\Models\Category;
use Illuminate\Support\Facades\DB;

class GoalSeeder extends Seeder
{
    public function run(): void
    {
        // Xóa toàn bộ dữ liệu bảng goals
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        Goal::truncate(); // Xóa dữ liệu cũ
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // $user1 = \App\Models\User::where('email', 'admin@gmail.com')->first();
        // $user2 = \App\Models\User::where('email', 'user2@gmail.com')->first();
        $user = User::all();
        if ($user->isEmpty()) {
            throw new \Exception("lỗi");
        }

        foreach ($user as $users) {
            $expenseCategory = Category::where('user_id', $users->id)
                ->where('type', 'expense')
                ->first();
            if (!$expenseCategory) {
                throw new \Exception("lỗi");
            }
            Goal::create([
                'user_id' => $users->id,
                'category_id' => $expenseCategory->id,
                'name' => 'Quỹ du lịch',
                'target_amount' => 10000000.00,
                'current_amount' => 2000000.00,
                'contribution_period' => 'weekly',
                'contribution_type' => 'fixed', // Add this
                'deadline' => '2025-12-31',   // Add this
            ]);

            Goal::create([
                'user_id' => $users->id,
                'category_id' => $expenseCategory->id,
                'name' => 'Mua điện thoại mới',
                'target_amount' => 5000000.00,
                'current_amount' => 1000000.00,
                'contribution_period' => 'daily',
                'contribution_type' => 'flexible', // Add this
                'deadline' => '2025-10-01',      // Add this
            ]);
        }
        // // Find categories for user1
        // $expenseCategoryUser1 = Category::where('user_id', $user1->id)
        //     ->where('type', 'expense')
        //     ->first();

        // // Find categories for user2
        // $expenseCategoryUser2 = Category::where('user_id', $user2->id)
        //     ->where('type', 'expense')
        //     ->first();

        // if (!$expenseCategoryUser1 || !$expenseCategoryUser2) {
        //     throw new \Exception('No expense categories found for one or both users. Please run CategorySeeder first.');
        // }


    }
}