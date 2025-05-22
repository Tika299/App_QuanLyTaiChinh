@extends('navlayout')

@section('content')
    <div class="container mt-5">
        <h2 class="mb-4">Chỉnh Sửa Hồ Sơ</h2>

        <!-- Thông báo flash -->
        @if (session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                {{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif
        @if (session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                {{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
            </div>
        @endif

        <!-- Form chỉnh sửa -->
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Cập Nhật Thông Tin</h5>
            </div>
            <div class="card-body">
                <form action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')
                    <div class="row">
                        <!-- Thông tin -->
                        <div class="col-md-8">
                            <div class="mb-3">
                                <label for="username" class="form-label">Tên người dùng:</label>
                                <input type="text" name="username" id="username" class="form-control" value="{{ old('username', $user->username) }}" required>
                                @error('username')
                                    <span class="text-danger">{{ $message }}</span>
                                @enderror
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email:</label>
                                <input type="email" name="email" id="email" class="form-control" value="{{ old('email', $user->email) }}" required>
                                @error('email')
                                    <span class="text-danger">{{ $message }}</span>
                                @enderror
                            </div>
                            <div class="mb-3">
                                <label for="phone" class="form-label">Số điện thoại:</label>
                                <input type="text" name="phone" id="phone" class="form-control" value="{{ old('phone', $user->phone) }}" placeholder="VD: 0123456789">
                                @error('phone')
                                    <span class="text-danger">{{ $message }}</span>
                                @enderror
                            </div>
                            <div class="mb-3">
                                <label for="city" class="form-label">Thành phố:</label>
                                <input type="text" name="city" id="city" class="form-control" value="{{ old('city', $user->city) }}" placeholder="VD: Hà Nội">
                                @error('city')
                                    <span class="text-danger">{{ $message }}</span>
                                @enderror
                            </div>
                            <div class="mb-3">
                                <label for="bio" class="form-label">Giới thiệu:</label>
                                <textarea name="bio" id="bio" class="form-control" rows="4" placeholder="Giới thiệu về bạn...">{{ old('bio', $user->bio) }}</textarea>
                                @error('bio')
                                    <span class="text-danger">{{ $message }}</span>
                                @enderror
                            </div>
                        </div>
                        <!-- Ảnh đại diện -->
                        <div class="col-md-4 text-center">
                            <div class="mb-3">
                                <label for="avatar" class="form-label">Ảnh đại diện:</label>
                                <img src="{{ $user->avatar ? asset('storage/' . $user->avatar) : asset('images/default-avatar.png') }}" 
                                     alt="Avatar" class="img-fluid rounded-circle mb-3" style="max-width: 150px; height: auto;">
                                <input type="file" name="avatar" id="avatar" class="form-control" accept="image/*">
                                @error('avatar')
                                    <span class="text-danger">{{ $message }}</span>
                                @enderror
                            </div>
                        </div>
                    </div>
                    <div class="text-end">
                        <button type="submit" class="btn btn-primary">Cập Nhật</button>
                        <a href="{{ route('profile.show') }}" class="btn btn-secondary">Hủy</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
@endsection