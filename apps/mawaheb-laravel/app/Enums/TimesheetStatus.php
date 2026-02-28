<?php

namespace App\Enums;

enum TimesheetStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case Approved = 'approved';
    case Rejected = 'rejected';
    case Resubmitted = 'resubmitted';
}
