<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Role;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        $user1 = User::create([
            'username' => 'nguyenvan',
            'email' => 'nguyenvan@example.com',
            'password' => Hash::make('matkhau123'),
            'avatar' => 'default.jpg',
            'balance' => 1000000.00,
        ]);

        $user2 = User::create([
            'username' => 'tranle',
            'email' => 'tranle@example.com',
            'password' => Hash::make('matkhau123'),
            'avatar' => 'default.jpg',
            'balance' => 500000.00,
        ]);

        // Lấy role theo tên, ví dụ "member"
        $memberRole = Role::where('name', 'member')->first();

        if ($memberRole) {
            $user1->roles()->attach($memberRole->id);
            $user2->roles()->attach($memberRole->id);
        }
    }
}
