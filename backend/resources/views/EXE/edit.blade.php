@extends('layout')

@section('content')
    <div class="edit-profile-card">
        <h4>Edit Profile</h4>

        <form method="POST" action="{{ route('profile.update') }}" >
            @csrf

            <div class="row mb-3 align-items-center">
                <label class="col-sm-3 col-form-label">Username</label>
                <div class="col-sm-9">
                    <input type="text" name="username" id="username" class="form-control" placeholder="Nhap username" required>
                </div>
            </div>

            <div class="row mb-3 align-items-center">
                <label class="col-sm-3 col-form-label">Email</label>
                <div class="col-sm-9">
                <input type="email" name="email" id="email" class="form-control" placeholder="Nhập email" required>
                </div>
            </div>

            <div class="row mb-3 align-items-center">
                <label class="col-sm-3 col-form-label">Phone</label>
                <div class="col-sm-9">
                    <input type="text" name="phone" id="phone" class="form-control" required >
                </div>
            </div>

            <div class="row mb-3 align-items-center">
                <label class="col-sm-3 col-form-label">Avatar</label>
                <div class="col-sm-9">
                    <input type="file" name="avatar" class="form-control" >
                </div>
            </div>

            <div class="row mb-3 align-items-center">
                <label class="col-sm-3 col-form-label">City</label>
                <div class="col-sm-9">
                    <input type="text" name="city" class="form-control" required>
                </div>
            </div>

            <div class="row mb-4">
                <div class="col-sm-12">
                    <textarea name="bio" class="form-control" rows="4" placeholder="Write something..."></textarea>
                </div>
            </div>

            <div class="d-flex justify-content-center gap-3">
                <a href="{{ url('/') }}" class="btn btn-secondary px-4">Cancel</a>
                <button type="submit" class="btn btn-primary px-4">Save</button>
            </div>
        </form>
    </div>
@endsection
