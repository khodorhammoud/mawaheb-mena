<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PreferredWorkingTime extends Model
{
    protected $table = 'preferred_working_times';
    public $timestamps = false;

    protected $fillable = [
        'account_id',
        'day',
        'start_time',
        'end_time',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }
}
