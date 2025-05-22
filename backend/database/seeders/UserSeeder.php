<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'username' => 'nguyenvan',
            'email' => 'nguyenvan@example.com',
            'password' => Hash::make('matkhau123'),
            'avatar' => 'default.jpg',
            'balance' => 1000000.00,
        ]);

        User::create([
            'username' => 'tranle',
            'email' => 'tranle@example.com',
            'password' => Hash::make('matkhau123'),
            'avatar' => 'default.jpg',
            'balance' => 500000.00,
        ]);
    }
}