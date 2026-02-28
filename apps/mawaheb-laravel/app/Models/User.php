<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Relations\HasMany;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'first_name',
        'last_name',
        'email',
        'password_hash',
        'is_verified',
        'is_onboarded',
        'provider',
        'role',
        'deletion_requested_at',
        'final_deletion_at',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected $casts = [
        'is_verified' => 'boolean',
        'is_onboarded' => 'boolean',
        'deletion_requested_at' => 'datetime',
        'final_deletion_at' => 'datetime',
    ];

    public $timestamps = false;

    public function getAuthPassword(): string
    {
        return $this->password_hash ?? '';
    }

    public function account(): HasOne
    {
        return $this->hasOne(Account::class, 'user_id');
    }

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class, 'user_id');
    }

    public function verifications(): HasMany
    {
        return $this->hasMany(UserVerification::class, 'user_id');
    }

    public function identification(): HasOne
    {
        return $this->hasOne(UserIdentification::class, 'user_id');
    }

    public function notifications(): HasMany
    {
        return $this->hasMany(Notification::class, 'user_id');
    }

    public function skillfolio(): HasOne
    {
        return $this->hasOne(Skillfolio::class, 'user_id');
    }

    public function exitFeedback(): HasMany
    {
        return $this->hasMany(ExitFeedback::class, 'user_id');
    }
}
