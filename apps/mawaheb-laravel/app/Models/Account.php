<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Account extends Model
{
    protected $table = 'accounts';
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'slug',
        'account_type',
        'country',
        'address',
        'region',
        'account_status',
        'phone',
        'website_url',
        'social_media_links',
        'is_creation_complete',
    ];

    protected $casts = [
        'social_media_links' => 'array',
        'is_creation_complete' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function freelancer(): HasOne
    {
        return $this->hasOne(Freelancer::class, 'account_id');
    }

    public function employer(): HasOne
    {
        return $this->hasOne(Employer::class, 'account_id');
    }

    public function preferredWorkingTimes(): HasMany
    {
        return $this->hasMany(PreferredWorkingTime::class, 'account_id');
    }

    public function languages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'account_languages', 'account_id', 'language_id');
    }
}
