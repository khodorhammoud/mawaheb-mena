<?php

namespace App\Enums;

enum AccountType: string
{
    case Freelancer = 'freelancer';
    case Employer = 'employer';
    case Admin = 'admin';
}
