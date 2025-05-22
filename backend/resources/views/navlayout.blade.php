<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Ứng Dụng</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
</head>
<body>
    <nav class="navbar navbar-expand-lg navbar-light bg-light">
        <div class="container">
            <a class="navbar-brand" href="{{ route('home') }}">Ứng Dụng</a>
            <div class="navbar-nav">
                @auth
                    <a class="nav-link" href="{{ route('profile.show') }}">Hồ Sơ</a>
                    <form action="{{ route('logout') }}" method="POST" class="d-inline">
                        @csrf
                        <button type="submit" class="nav-link btn btn-link">Đăng Xuất</button>
                    </form>
                @else
                    <a class="nav-link" href="{{ route('login') }}">Đăng Nhập</a>
                    <a class="nav-link" href="{{ route('register') }}">Đăng Ký</a>
                @endauth
            </div>
        </div>
    </nav>
    <div class="container">
        @yield('content')
    </div>
</body>
</html>