<?php

namespace App\Enums;

enum JobStatus: string
{
    case Draft = 'draft';
    case Active = 'active';
    case Closed = 'closed';
    case Completed = 'completed';
    case Running = 'running';
    case Paused = 'paused';
    case Deleted = 'deleted';
}
