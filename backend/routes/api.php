<?php

use App\Http\Controllers\CrudUserController;
use App\Http\Controllers\GoalController;
use App\Http\Controllers\CategoryController;

// Public routes
Route::post('/login', [CrudUserController::class, 'login']);
Route::post('/signup', [CrudUserController::class, 'signup']);
Route::post('/logout', [CrudUserController::class, 'logout']);
Route::get('/categories', [CategoryController::class, 'index']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [CrudUserController::class, 'show']);
    Route::put('/user', [CrudUserController::class, 'update']);

    Route::get('/goals', [GoalController::class, 'index']);
    Route::post('/goals', [GoalController::class, 'store']);
    Route::put('/goals/{id}', [GoalController::class, 'update']);
    Route::delete('/goals/{id}', [GoalController::class, 'destroy']);
    Route::delete('/goals/delete-all', [GoalController::class, 'deleteAll']);
});


