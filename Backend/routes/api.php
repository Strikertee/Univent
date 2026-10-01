<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DivisionController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProductController;
use App\Http\Controllers\Api\RoomController;
use App\Http\Controllers\Api\FacilityController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\DailySaleController;
use App\Http\Controllers\Api\UploadController;

// Health check (frontend uses this to show API connected / demo mode)
Route::get('/health', fn() => response()->json(['success' => true, 'data' => ['service' => 'univent-api', 'time' => now()->toIso8601String()]]));

// Public
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login', [AuthController::class, 'login']);
Route::post('/auth/forgot-password', [AuthController::class, 'forgotPassword']);
Route::post('/auth/reset-password', [AuthController::class, 'resetPassword']);

Route::get('/divisions', [DivisionController::class, 'index']);
Route::get('/divisions/{slug}', [DivisionController::class, 'show']);
Route::get('/categories', [CategoryController::class, 'index']);
Route::get('/products', [ProductController::class, 'index']);
Route::get('/products/{slug}', [ProductController::class, 'show']);
Route::get('/rooms', [RoomController::class, 'index']);
Route::get('/rooms/{slug}', [RoomController::class, 'show']);
Route::get('/rooms/{id}/availability', [RoomController::class, 'availability']);
Route::get('/facilities', [FacilityController::class, 'index']);

// Authenticated
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/profile', [AuthController::class, 'profile']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::post('/bookings', [BookingController::class, 'store']);
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/orders', [OrderController::class, 'store']);
    Route::get('/orders', [OrderController::class, 'index']);
    Route::get('/orders/{id}', [OrderController::class, 'show']);
    Route::post('/upload/receipt', [UploadController::class, 'receipt']);
    Route::get('/sales', [DailySaleController::class, 'index']);
    Route::post('/sales', [DailySaleController::class, 'store']);
    Route::delete('/sales/{id}', [DailySaleController::class, 'destroy']);

    // Division admin + super admin
    Route::middleware('role:super_admin,division_admin')->group(function () {
        Route::apiResource('users', UserController::class)->only(['index', 'show', 'store', 'update']);
        Route::post('/divisions', [DivisionController::class, 'store'])->middleware('role:super_admin');
        Route::put('/divisions/{id}', [DivisionController::class, 'update']);
        Route::apiResource('categories', CategoryController::class)->only(['store', 'update', 'destroy']);
        Route::post('/products', [ProductController::class, 'store']);
        Route::put('/products/{id}', [ProductController::class, 'update']);
        Route::delete('/products/{id}', [ProductController::class, 'destroy']);
        Route::post('/rooms', [RoomController::class, 'store']);
        Route::put('/rooms/{id}', [RoomController::class, 'update']);
        Route::apiResource('facilities', FacilityController::class)->only(['store', 'update', 'destroy']);
        Route::put('/bookings/{id}', [BookingController::class, 'update']);
        Route::put('/orders/{id}', [OrderController::class, 'update']);
        Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
    });
});
