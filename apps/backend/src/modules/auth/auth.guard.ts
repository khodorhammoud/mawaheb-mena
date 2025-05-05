// AuthGuard — Temporary placeholder to simulate protected routes
// Right now, it allows all requests. Replace with real auth logic later.

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();

    // For now, just allow all requests
    // In a real app, you would check for authentication here
    return true;
  }
}
