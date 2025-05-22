@extends('navlayout')

@section('content')
    <div class="container mt-5">
        <h2 class="mb-4">Hồ Sơ Người Dùng</h2>

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

        <!-- Card hồ sơ -->
        <div class="card shadow-sm">
            <div class="card-header bg-primary text-white">
                <h5 class="mb-0">Thông Tin Cá Nhân</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <!-- Ảnh đại diện -->
                    <div class="col-md-3 text-center">
                        <img src="{{ $user->avatar ? asset('storage/' . $user->avatar) : asset('images/default-avatar.png') }}" 
                             alt="Avatar" class="img-fluid rounded-circle mb-3" style="max-width: 150px; height: auto;">
                    </div>
                    <!-- Thông tin -->
                    <div class="col-md-9">
                        <p><strong>Tên người dùng:</strong> {{ $user->username }}</p>
                        <p><strong>Email:</strong> {{ $user->email }}</p>
                        <p><strong>Vai trò:</strong> {{ ucfirst($user->role ?? 'user') }}</p>
                        <p><strong>Số điện thoại:</strong> {{ $user->phone ?? 'Chưa cập nhật' }}</p>
                        <p><strong>Thành phố:</strong> {{ $user->city ?? 'Chưa cập nhật' }}</p>
                        <p><strong>Giới thiệu:</strong> {{ $user->bio ?? 'Chưa cập nhật' }}</p>
                        <p><strong>Ngày đăng ký:</strong> {{ \Carbon\Carbon::parse($user->created_at)->format('d/m/Y H:i') }}</p>
                    </div>
                </div>
            </div>
            <div class="card-footer text-end">
                <a href="{{ route('profile.edit') }}" class="btn btn-primary">Chỉnh Sửa Hồ Sơ</a>
                <a href="{{ route('goals.index') }}" class="btn btn-secondary">Quản Lý Mục Tiêu</a>
            </div>
        </div>
    </div>

    <!-- CSS tùy chỉnh -->
    <style>
        .card-header {
            background-color: #007bff;
        }
        .card-body p {
            margin-bottom: 0.75rem;
        }
        .rounded-circle {
            border: 2px solid #e9ecef;
        }
    </style>
@endsection