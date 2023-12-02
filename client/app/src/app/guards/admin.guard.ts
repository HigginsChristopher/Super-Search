// Importing necessary modules and classes from Angular and third-party libraries
import { CanActivateFn } from '@angular/router';
import { ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Injectable, inject } from '@angular/core';
import { UserService } from '../services/user.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// AdminGuard class implements the CanActivate interface to control navigation access
class AdminGuard {
  // Constructor to inject necessary services (UserService and Router)
  constructor(private userService: UserService, private router: Router) { }

  // Method to determine if the user is authorized to activate a route
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    // Calling the getCurrentUser method from UserService to get the current user information
    return this.userService.getCurrentUser().pipe(
      // Using the map operator to transform the user information and return the appropriate boolean or UrlTree
      map((user) => {
        // Checking if the user has admin or owner role
        if (user?.userType === "admin" || user?.userType === "owner") {
          return true;  // Allowing navigation if the user has admin or owner role
        } else {
          // Redirecting to the home page if the user does not have admin or owner role
          return this.router.createUrlTree(['/']);
        }
      })
    );
  }
}

// Exporting IsAdminGuard as a CanActivateFn which can be used in route configurations
export const IsAdminGuard: CanActivateFn = (route, state) => {
  // Using the inject function to obtain an instance of the AdminGuard service
  return inject(AdminGuard).canActivate(route, state);
};
