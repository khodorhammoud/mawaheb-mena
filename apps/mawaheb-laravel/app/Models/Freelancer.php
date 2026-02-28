<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Freelancer extends Model
{
    protected $table = 'freelancers';
    public $timestamps = false;

    protected $fillable = [
        'account_id',
        'about',
        'fields_of_expertise',
        'portfolio',
        'work_history',
        'cv_link',
        'video_link',
        'video_attachment_id',
        'video_type',
        'certificates',
        'educations',
        'years_of_experience',
        'preferred_project_types',
        'hourly_rate',
        'compensation_type',
        'available_for_work',
        'available_from',
        'jobs_open_to',
        'hours_available_from',
        'hours_available_to',
    ];

    protected $casts = [
        'fields_of_expertise' => 'array',
        'portfolio' => 'array',
        'work_history' => 'array',
        'certificates' => 'array',
        'educations' => 'array',
        'preferred_project_types' => 'array',
        'available_for_work' => 'boolean',
        'jobs_open_to' => 'array',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function videoAttachment(): BelongsTo
    {
        return $this->belongsTo(Attachment::class, 'video_attachment_id');
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'freelancer_skills', 'freelancer_id', 'skill_id')
            ->withPivot('years_of_experience', 'is_starred');
    }

    public function freelancerSkills(): HasMany
    {
        return $this->hasMany(FreelancerSkill::class, 'freelancer_id');
    }

    public function languages(): BelongsToMany
    {
        return $this->belongsToMany(Language::class, 'freelancer_languages', 'freelancer_id', 'language_id');
    }

    public function jobApplications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'freelancer_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'freelancer_id');
    }

    public function timesheetDayEntries(): HasMany
    {
        return $this->hasMany(TimesheetDayEntry::class, 'freelancer_id');
    }

    public function timesheetWeekEntries(): HasMany
    {
        return $this->hasMany(TimesheetWeekEntry::class, 'freelancer_id');
    }
}
