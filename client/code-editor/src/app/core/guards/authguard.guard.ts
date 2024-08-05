import { Injectable, inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../../shared/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthguardService {
  static canActivate: CanActivateFn = (
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isLoggedIn()) {
      return true;
    } else {
      router.navigate(['']);
      return false;
    }
  };
}
