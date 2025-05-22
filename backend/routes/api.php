<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\CrudUserController;
use App\Http\Controllers\Auth\ForgotPasswordController;
use App\Http\Controllers\Api\FinanceController;

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

//Các route cần đăng nhập
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [CrudUserController::class, 'logout'])->name('logout');
    Route::get('/finance', [FinanceController::class, 'getFinance']);
    Route::get('/finance/compare', [FinanceController::class, 'compareFinance']);
});