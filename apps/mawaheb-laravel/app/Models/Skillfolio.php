<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Skillfolio extends Model
{
    protected $table = 'skillfolios';

    const CREATED_AT = 'created_at';
    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'user_id',
        'domain',
        'field',
        'category',
        'subfield',
        'readiness_score',
        'strengths',
        'weaknesses',
        'gaps',
        'profile',
    ];

    protected $casts = [
        'strengths' => 'array',
        'weaknesses' => 'array',
        'gaps' => 'array',
        'profile' => 'array',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
