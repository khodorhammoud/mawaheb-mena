<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Skill extends Model
{
    protected $table = 'skills';
    public $timestamps = false;

    protected $fillable = ['label', 'meta_data', 'is_hot', 'created_at'];

    protected $casts = [
        'is_hot' => 'boolean',
        'created_at' => 'datetime',
    ];
}
