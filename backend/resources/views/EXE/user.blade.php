@extends('users') 
@section('content')

    <div class="user-card">

        @if(session('success'))
            <div class="alert alert-success">
                {{ session('success') }}
            </div>
        @endif


        <label class="avatar-wrapper">
            <input type="file" accept="image/*" onchange="previewAvatar(event)" disabled>
            <img src="{{ isset($user) && $user->avatar ? asset('storage/' . $user->avatar) : asset('images/default-avatar.png') }}" alt="Avatar">

        </label>

    
        <div class="username">
            {{ $user->name }}
            <a href="{{ route('profile.edit') }}" class="edit-icon" title="Edit Profile">✎</a>
        </div>

       
        <div class="user-handle">@{{ Str::slug($user->name) }}</div>

        <div class="text-muted">{{ $user->email }}</div>

        <div class="stats-box mt-3">
            <div class="stat">12 Files</div>
            <div class="stat">24$ Spent</div>
            <div class="stat">20GB Used</div>
        </div>
    </div>

    <script>
        function previewAvatar(event) {
            const reader = new FileReader();
            reader.onload = function(){
                const output = document.getElementById('avatarPreview');
                output.src = reader.result;
            };
            reader.readAsDataURL(event.target.files[0]);
        }
    </script>

@endsection
