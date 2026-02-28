<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserVerification extends Model
{
    protected $table = 'user_verifications';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'token',
        'expiry',
        'is_used',
        'created_at',
    ];

    protected $casts = [
        'expiry' => 'datetime',
        'is_used' => 'boolean',
        'created_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
