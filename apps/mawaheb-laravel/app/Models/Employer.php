<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Employer extends Model
{
    protected $table = 'employers';
    public $timestamps = false;

    protected $fillable = [
        'account_id',
        'budget',
        'employerAccountType',
        'company_name',
        'employer_name',
        'company_email',
        'about',
        'industry_sector',
        'years_in_business',
        'company_rep_name',
        'company_rep_email',
        'company_rep_position',
        'company_rep_phone',
        'tax_id_number',
        'tax_id_document_link',
        'business_license_link',
        'certification_of_incorporation_link',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(Account::class, 'account_id');
    }

    public function industries(): BelongsToMany
    {
        return $this->belongsToMany(Industry::class, 'employer_industries', 'employer_id', 'industry_id');
    }

    public function jobs(): HasMany
    {
        return $this->hasMany(Job::class, 'employer_id');
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class, 'employer_id');
    }
}
