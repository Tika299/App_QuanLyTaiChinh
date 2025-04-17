<?php

use App\Http\Controllers\CrudUserController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CrudUserController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group. Make something great!
|
*/

Route::get('/', function () {
    return view('welcome');
});


<<<<<<< HEAD
=======
Route::get('/edit', [CrudUserController::class, 'edit'])->name('profile.edit');
Route::post('/edit', [CrudUserController::class, 'update'])->name('profile.update');

Route::get('/edit', function () {
    return view('exe.edit');
});

Route::get('/user', [CrudUserController::class, 'show'])->name('profile.show');
Route::get('/show', function () {
    return view('exe.user');
});

>>>>>>> phi
