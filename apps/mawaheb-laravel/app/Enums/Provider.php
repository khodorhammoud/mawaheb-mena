<?php

namespace App\Enums;

enum Provider: string
{
    case Credentials = 'credentials';
    case SocialAccount = 'social_account';
}
