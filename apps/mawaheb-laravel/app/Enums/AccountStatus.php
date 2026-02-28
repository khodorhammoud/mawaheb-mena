<?php

namespace App\Enums;

enum AccountStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case Published = 'published';
    case Closed = 'closed';
    case Suspended = 'suspended';
    case Deleted = 'deleted';
    case Deactivated = 'deactivated';
}
