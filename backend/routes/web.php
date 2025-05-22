<?php

use App\Http\Controllers\CrudUserController;
use App\Http\Controllers\GoalController;
use Illuminate\Support\Facades\Route;


Route::get('/', function () {
    return view('welcome');
})->name('home');

Route::get('/login', [CrudUserController::class, 'showLoginForm'])->name('login');
Route::post('/login', [CrudUserController::class, 'login'])->name('login');
Route::post('/logout', [CrudUserController::class, 'logout'])->name('logout');
Route::get('/register', [CrudUserController::class, 'showRegisterForm'])->name('register');
Route::post('/register', [CrudUserController::class, 'signup'])->name('register');

Route::middleware('auth')->group(function () {
    Route::get('/goals', [GoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [GoalController::class, 'store'])->name('goals.store');
    Route::put('/goals/{id}', [GoalController::class, 'update'])->name('goals.update');
    Route::delete('/goals/{id}', [GoalController::class, 'destroy'])->name('goals.destroy');
    Route::delete('/goals', [GoalController::class, 'deleteAll'])->name('goals.deleteAll');
    Route::get('/user', [CrudUserController::class, 'show'])->name('profile.show');
    Route::get('/edit', [CrudUserController::class, 'edit'])->name('profile.edit');
    Route::put('/edit', [CrudUserController::class, 'update'])->name('profile.update');
});