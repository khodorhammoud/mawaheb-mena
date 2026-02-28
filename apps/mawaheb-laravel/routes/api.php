<?php

use App\Http\Controllers\Api\NotificationApiController;
use App\Http\Controllers\Api\SkillApiController;
use App\Http\Controllers\SkillfolioController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Skills
    Route::get('/skills', [SkillApiController::class, 'index']);
    Route::get('/skills/search', [SkillApiController::class, 'search']);
    Route::post('/skills', [SkillApiController::class, 'store']);

    // Notifications
    Route::get('/notifications/user/{userId}', [NotificationApiController::class, 'index']);
    Route::post('/notifications', [NotificationApiController::class, 'create']);

    // Skillfolio (for background job triggers)
    Route::post('/skillfolio/seed-knowledge-graph', [SkillfolioController::class, 'seedKnowledgeGraph']);
});
