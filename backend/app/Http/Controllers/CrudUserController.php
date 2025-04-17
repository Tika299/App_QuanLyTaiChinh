<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Validation\Rule;

class CrudUserController extends Controller
{
    public function edit()
    {
        $user = User::find(1);
        return view('exe.edit', compact('user'));
    }

    // Cập nhật thông tin người dùng
    public function update(Request $request)
    {
        $user = User::find(1);

        if (!$user) {
            return redirect()->back()->withErrors(['user' => 'Người dùng không tồn tại']);
        }

        $request->validate([
            'username' => 'required|string|max:255',

            'email' => [
                'required',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id), // Đảm bảo $user tồn tại
            ],

            'phone' => [
                'required',
                'regex:/^\d{10}$/',
            ],

            'city' => [
                'nullable',
                'string',
                'regex:/^[a-zA-Z\s]+$/',
            ],

            'bio' => 'nullable|string',

            'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ], [
            'username.required' => 'Ô này không được để trống',
            'email.required' => 'Ô này không được để trống',
            'email.email' => 'Email không đúng định dạng',
            'email.unique' => 'Email đã tồn tại hãy nhập email khác',
            'phone.required' => 'Ô này không được để trống',
            'phone.regex' => 'Số điện thoại phải chứa tối đa 10 chữ số và chỉ được chứa ký tự số',
            'city.regex' => 'Trường nhập thành phố không được chứa các ký tự đặc biệt :@#$%^?',
            'avatar.image' => 'Ảnh đại diện phải là hình ảnh',
            'avatar.mimes' => 'Ảnh đại diện phải có định dạng jpeg, png, jpg, hoặc gif',
            'avatar.max' => 'Ảnh đại diện không được vượt quá 2MB',
        ]);

        // Cập nhật dữ liệu
        $user->update([
            'name' => $request->username,
            'email' => $request->email,
            'phone' => $request->phone,
            'city' => $request->city,
            'bio' => $request->bio,
        ]);

        if ($request->hasFile('avatar')) {
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $user->avatar = $avatarPath;
            $user->save();
        }

        return redirect()->route('profile.show')->with('success', 'Cập nhật thành công!');
    }
    public function show()
    {
        $user = User::find(1); // hoặc Auth::user() nếu dùng auth
        return view('exe.user', compact('user'));
    }


}
