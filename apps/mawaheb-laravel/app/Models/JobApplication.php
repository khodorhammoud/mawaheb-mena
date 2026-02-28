<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobApplication extends Model
{
    protected $table = 'job_applications';
    public $timestamps = false;

    protected $fillable = [
        'job_id',
        'freelancer_id',
        'status',
        'created_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
    ];

    public function job(): BelongsTo
    {
        return $this->belongsTo(Job::class, 'job_id');
    }

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(Freelancer::class, 'freelancer_id');
    }

    public function timesheetDayEntries(): HasMany
    {
        return $this->hasMany(TimesheetDayEntry::class, 'job_application_id');
    }

    public function timesheetWeekEntries(): HasMany
    {
        return $this->hasMany(TimesheetWeekEntry::class, 'job_application_id');
    }
}
