<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FreelancerSkill extends Model
{
    protected $table = 'freelancer_skills';
    public $timestamps = false;

    protected $fillable = [
        'freelancer_id',
        'skill_id',
        'years_of_experience',
        'is_starred',
    ];

    protected $casts = [
        'is_starred' => 'boolean',
    ];

    public function freelancer(): BelongsTo
    {
        return $this->belongsTo(Freelancer::class, 'freelancer_id');
    }

    public function skill(): BelongsTo
    {
        return $this->belongsTo(Skill::class, 'skill_id');
    }
}
