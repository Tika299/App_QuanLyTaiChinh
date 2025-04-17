@extends('layout')
@section('contents')

    <div class="box">
        <div class="title">
            <h3>Đăng Ký</h3>
        </div>
        <form action="{{ route('user.sigup') }}" method="POST">
            @csrf
            <div class="mb-3">
                <label for="username" class="form-label">Nhập tên Người Dùng</label> <br>
                <input type="text" name="username" class="form-control" id="username" required> <br>
            </div>
            <div class="mb-3">
                <label for="email" class="form-label">Email address</label> <br>
                <input type="email" name="email" class="form-control" id="email" required> <br>
            </div>
            <div class="mb-3">
                <label for="password" class="form-label">Password</label> <br>
                <input type="password" name="password" class="form-control" id="password" required>
            </div>
            <div class="mb-3">
                <label for="password_confirmation" class="form-label">Nhập Lại Password</label> <br>
                <input type="password" name="password_confirmation" class="form-control" id="password_confirmation" required>
            </div>

            <button type="submit" class="btn btn-primary">Đăng Ký</button> <br>
            <p>Đã có tài khoản?</p>
            <a href="{{ route('login') }}">Đăng Nhập</a>
        </form>
    </div>
@endsection