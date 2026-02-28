<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $table = 'reviews';
    public $timestamps = false;

    protected $fillable = [
        'employer_id',
        'freelancer_id',
        'rating',
        'comment',
        'review_type',
        'created_at',
    ];

    protected $casts = [
        'rating' => 'float',
        'created_at' => 'datetime',
    ];

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class, 'employer_id');
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(Freelancer::class, 'freelancer_id');
    }
}
