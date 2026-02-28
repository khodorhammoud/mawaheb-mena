<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JobCategory extends Model
{
    protected $table = 'job_categories';
    public $timestamps = false;

    protected $fillable = ['label', 'timestamp'];

    protected $casts = [
        'timestamp' => 'datetime',
    ];
}
