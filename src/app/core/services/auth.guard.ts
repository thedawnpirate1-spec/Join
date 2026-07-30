import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth-service';

/** Route guard that allows navigation only for authenticated users, redirecting to /login otherwise. */
export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const isLoggedIn = await authService.isLoggedIn();

  if (isLoggedIn) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
