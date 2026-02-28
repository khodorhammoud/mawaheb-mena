<?php

namespace App\Enums;

enum NotificationType: string
{
    case Message = 'message';
    case Alert = 'alert';
    case Reminder = 'reminder';
    case StatusUpdate = 'status_update';
}
