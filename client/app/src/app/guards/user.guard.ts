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
// UserGuard class implements the CanActivate interface to control navigation access for authenticated users
class UserGuard {
  // Constructor to inject necessary services (UserService and Router)
  constructor(private userService: UserService, private router: Router) { }

  // Method to determine if the user is authorized to activate a route
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> {

    // Calling the getCurrentUser method from UserService to check if a user is authenticated
    return this.userService.getCurrentUser().pipe(
      // Using the map operator to transform the user information and return the appropriate boolean or UrlTree
      map((user) => {
        // Checking if the user is authenticated
        if (user) {
          return true;  // Allowing navigation if the user is authenticated
        } else {
          // Redirecting to the home page if the user is not authenticated
          return this.router.createUrlTree(['/']);
        }
      })
    );
  }
}

// Exporting IsUserGuard as a CanActivateFn which can be used in route configurations
export const IsUserGuard: CanActivateFn = (route, state) => {
  // Using the inject function to obtain an instance of the UserGuard service
  return inject(UserGuard).canActivate(route, state);
};
