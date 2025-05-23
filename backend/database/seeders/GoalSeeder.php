<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Goal;
use App\Models\Category;

class GoalSeeder extends Seeder
{
    public function run(): void
    {
        Goal::truncate(); // Xóa dữ liệu cũ

        $user1 = \App\Models\User::where('email', 'admin@gmail.com')->first();
        $user2 = \App\Models\User::where('email', 'user2@gmail.com')->first();

        // Find categories for user1
        $expenseCategoryUser1 = Category::where('user_id', $user1->id)
            ->where('type', 'expense')
            ->first();

        // Find categories for user2
        $expenseCategoryUser2 = Category::where('user_id', $user2->id)
            ->where('type', 'expense')
            ->first();

        if (!$expenseCategoryUser1 || !$expenseCategoryUser2) {
            throw new \Exception('No expense categories found for one or both users. Please run CategorySeeder first.');
        }

        Goal::create([
            'user_id' => $user1->id,
            'category_id' => $expenseCategoryUser1->id,
            'name' => 'Quỹ du lịch',
            'target_amount' => 10000000.00,
            'current_amount' => 2000000.00,
            'contribution_period' => 'weekly',
            'contribution_type' => 'fixed', // Add this
            'deadline' => '2025-12-31',   // Add this
        ]);

        Goal::create([
            'user_id' => $user2->id,
            'category_id' => $expenseCategoryUser2->id,
            'name' => 'Mua điện thoại mới',
            'target_amount' => 5000000.00,
            'current_amount' => 1000000.00,
            'contribution_period' => 'daily',
            'contribution_type' => 'flexible', // Add this
            'deadline' => '2025-10-01',      // Add this
        ]);
    }
}