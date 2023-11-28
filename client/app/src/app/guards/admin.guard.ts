import { CanActivateFn } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
class AdminGuard {
  constructor(private userService: UserService, private router: Router) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    return this.userService.getCurrentUser().pipe(
      map((user) => {
        if (user?.userType==="admin" || user?.userType === "owner") {
          return true;
        } else {
          return this.router.createUrlTree(['/']);
        }
      })
    );
  }
}


export const IsAdminGuard: CanActivateFn = (route, state) => {
  return inject(AdminGuard).canActivate(route, state);
};
