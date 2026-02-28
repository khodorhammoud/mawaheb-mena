<?php

namespace App\Enums;

enum ProjectType: string
{
    case ShortTerm = 'short-term';
    case LongTerm = 'long-term';
    case PerProjectBasis = 'per-project-basis';
}
