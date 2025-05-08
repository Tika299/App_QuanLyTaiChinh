<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Goal;

class GoalSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = \App\Models\User::where('email', 'ng26')->first();
        $user2 = \App\Models\User::where('email', 'tranle@example.com')->first();

        Goal::create([
            'user_id' => $user1->id,
            'name' => 'Quỹ du lịch',
            'target_amount' => 10000000.00,
            'current_amount' => 2000000.00,
            'contribution_period' => 'weekly',
        ]);

        Goal::create([
            'user_id' => $user2->id,
            'name' => 'Mua điện thoại mới',
            'target_amount' => 5000000.00,
            'current_amount' => 1000000.00,
            'contribution_period' => 'daily',
        ]);
    }
}