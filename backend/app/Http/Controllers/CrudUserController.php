<?php
namespace App\Http\Controllers;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class CrudUserController extends Controller
{
    public function showLoginForm()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        if (Auth::attempt($request->only('email', 'password'))) {
            return response()->json(['message' => 'Đăng nhập thành công!'], 200);
        }

        throw ValidationException::withMessages([
            'email' => ['Email hoặc mật khẩu không đúng.'],
        ]);
    }

    public function showRegisterForm()
    {
        return view('auth.register');
    }

    public function logout(Request $request)
    {
        Auth::logout();
        return response()->json(['message' => 'Đăng xuất thành công!'], 200);
    }

    public function signup(Request $request)
    {
        $request->validate([
            'username' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:6|confirmed',
        ]);

        $user = User::create([
            'username' => $request->username,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
            'avatar' => 'default.png',
        ]);

        Auth::login($user);
        return response()->json(['message' => 'Đăng ký thành công!'], 201);
    }

    public function show(Request $request)
{
    $user = \App\Models\User::first(); // Lấy user đầu tiên
    return response()->json($user ?: ['error' => 'Không có user']);
}

    public function update(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['error' => 'Vui lòng đăng nhập.'], 401);
        }

        try {
            $request->validate([
                'username' => 'required|string|max:255',
                'email' => [
                    'required',
                    'email',
                    'max:255',
                    Rule::unique('users', 'email')->ignore($user->id),
                ],
                'phone' => [
                    'nullable',
                    'regex:/^0\d{9}$/',
                ],
                'city' => [
                    'nullable',
                    'string',
                    'max:255',
                    'regex:/^[a-zA-Z\sÀ-ỹ]+$/u',
                ],
                'bio' => 'nullable|string|max:1000',
                'avatar' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ], [
                'username.required' => 'Tên người dùng không được để trống.',
                'email.required' => 'Email không được để trống.',
                'email.email' => 'Email không đúng định dạng.',
                'email.unique' => 'Email đã tồn tại, hãy nhập email khác.',
                'phone.regex' => 'Số điện thoại phải là 10 chữ số và bắt đầu bằng 0.',
                'city.regex' => 'Thành phố chỉ được chứa chữ cái, khoảng trắng và dấu tiếng Việt.',
                'city.max' => 'Thành phố không được vượt quá 255 ký tự.',
                'bio.max' => 'Giới thiệu không được vượt quá 1000 ký tự.',
                'avatar.image' => 'Ảnh đại diện phải là hình ảnh.',
                'avatar.mimes' => 'Ảnh đại diện phải có định dạng jpeg, png, jpg, hoặc gif.',
                'avatar.max' => 'Ảnh đại diện không được vượt quá 2MB.',
            ]);

            $data = [
                'username' => $request->username,
                'email' => $request->email,
                'phone' => $request->phone,
                'city' => $request->city,
                'bio' => $request->bio,
            ];

            if ($request->hasFile('avatar')) {
                if ($user->avatar && $user->avatar !== 'default.png' && Storage::exists('public/' . $user->avatar)) {
                    Storage::delete('public/' . $user->avatar);
                }
                $data['avatar'] = $request->file('avatar')->store('avatars', 'public');
            }

            $user->update($data);
            return response()->json(['message' => 'Hồ sơ đã được cập nhật!', 'user' => $user], 200);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation error: ' . json_encode($e->errors()));
            return response()->json(['errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            \Log::error('Update user error: ' . $e->getMessage());
            return response()->json(['error' => 'Có lỗi xảy ra: ' . $e->getMessage()], 500);
        }
    }
}