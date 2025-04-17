<?php

namespace App\Http\Controllers;

// use App\Models\User;
// use Hash;
// use Illuminate\Http\Request;
// use Illuminate\Support\Facades\Auth;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;


class CrudUserController extends Controller
{



    //React

    // Đăng ký người dùng
    public function signup(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'avatar' => 'default.png',
        ]);

        return response()->json([
            'message' => 'Đăng ký thành công!',
            'user' => $user,
        ], 201);
    }

    // Đăng nhập
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email hoặc mật khẩu không đúng.'],
            ]);
        }

        Auth::login($user);

        return response()->json([
            'message' => 'Đăng nhập thành công!',
            'user' => $user,
        ]);
    }

    // Đăng xuất
    public function logout(Request $request)
    {
        Auth::logout();

        return response()->json([
            'message' => 'Đăng xuất thành công!'
        ]);
    }


}
