<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CrudUserController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\FinanceController;
use App\Http\Controllers\Api\GoalController;
use App\Http\Controllers\TransactionController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user()->load('roles:id,name');
});






//Các route công khai (không cần đăng nhập)
Route::post('/login', [CrudUserController::class, 'login']);
Route::post('/signup', [CrudUserController::class, 'signup'])->name('user.signup');
Route::post('/forgot-password', [ForgotPasswordController::class, 'sendResetLink']);
Route::post('/reset-password', [ForgotPasswordController::class, 'resetPassword']);

//Các route cần đăng nhập
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [CrudUserController::class, 'logout'])->name('logout');
    Route::get('/listuser', [CrudUserController::class, 'getUsers']);
    Route::get('/listuser/{id}', [CrudUserController::class, 'getUser']);
    Route::put('/update/{id}', [CrudUserController::class, 'updateUser']);
    Route::delete('/delete/{id}', [CrudUserController::class, 'deleteUser']);
    Route::get('/finance', [FinanceController::class, 'getFinance']);
    Route::get('/finance/compare', [FinanceController::class, 'compareFinance']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::get('/transactions/{id}', [TransactionController::class, 'show']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::put('/transactions/{id}', [TransactionController::class, 'update']);
    Route::delete('/transactions/{id}', [TransactionController::class, 'destroy']);
    Route::get('/categories', [TransactionController::class, 'getCategories']);

    Route::get('/goals', [GoalController::class, 'index'])->name('goals.index');
    Route::post('/goals', [GoalController::class, 'store'])->name('goals.store');
    Route::put('/goals/{id}', [GoalController::class, 'update'])->name('goals.update');
    Route::delete('/goals/{id}', [GoalController::class, 'destroy'])->name('goals.destroy');
    Route::delete('/goals/delete-all', [GoalController::class, 'deleteAll'])->name('goals.delete-all');
});