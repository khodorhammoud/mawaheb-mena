<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class TimesheetWeekEntry extends Model
{
    protected $table = 'timesheet_week_entries';

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    protected $fillable = [
        'freelancer_id',
        'job_application_id',
        'week_start',
        'week_end',
        'submission_date',
        'total_hours',
        'status',
    ];

    protected $casts = [
        'submission_date' => 'datetime',
        'total_hours' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(Freelancer::class, 'freelancer_id');
    }

    public function jobApplication(): BelongsTo
    {
        return $this->belongsTo(JobApplication::class, 'job_application_id');
    }

    public function dayEntries(): BelongsToMany
    {
        return $this->belongsToMany(
            TimesheetDayEntry::class,
            'timesheet_week_day_entries',
            'week_id',
            'day_entry_id'
        );
    }
}
