<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Job extends Model
{
    protected $table = 'jobs';
    public $timestamps = false;

    protected $fillable = [
        'employer_id',
        'title',
        'description',
        'job_category_id',
        'working_hours_per_week',
        'location_preference',
        'project_type',
        'budget',
        'expected_hourly_rate',
        'experience_level',
        'status',
        'created_at',
        'fulfilled_at',
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'fulfilled_at' => 'datetime',
    ];

    public function employer(): BelongsTo
    {
        return $this->belongsTo(Employer::class, 'employer_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(JobCategory::class, 'job_category_id');
    }

    public function skills(): BelongsToMany
    {
        return $this->belongsToMany(Skill::class, 'job_skills', 'job_id', 'skill_id')
            ->withPivot('is_starred');
    }

    public function jobSkills(): HasMany
    {
        return $this->hasMany(JobSkill::class, 'job_id');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(JobApplication::class, 'job_id');
    }
}
