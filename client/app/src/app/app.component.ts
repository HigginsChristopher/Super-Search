// Importing necessary modules and services from Angular
import { Component, OnInit } from '@angular/core';
import { TitleService } from './services/title.service';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { jwtDecode } from 'jwt-decode';

// Component decorator defines the metadata for the component
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
// AppComponent class is the root component of the application
export class AppComponent implements OnInit {

  // Constructor for the component, injecting necessary services
  constructor(private titleService: TitleService, private router: Router, private userService: UserService) { }

  // Lifecycle hook called after the component is initialized
  ngOnInit(): void {
    // Set the initial title for the application
    this.titleService.setTitle("SuperSearch - Homepage");

    // Retrieve the token and current user data from localStorage
    const token = JSON.parse(localStorage.getItem('token')!);
    const currentUser = JSON.parse(localStorage.getItem('userData')!);

    // If either token or currentUser is missing, return
    if (!token || !currentUser) {
      return;
    }

    // Check if the token is expired
    const isTokenExpired = this.isTokenExpired(token);

    // If the token is expired, perform logout
    if (isTokenExpired) {
      this.logout();
    } else {
      // If not expired, set the user using UserService
      this.userService.setUser(currentUser);
    }
  }

  // Method to check if a given JWT token is expired
  isTokenExpired(token: string): boolean {
    const decodedToken: any = jwtDecode(token);

    // Compare the expiration time in the token with the current time
    return decodedToken.exp * 1000 < Date.now();
  }

  // Method to perform user logout
  logout() {
    // Set the user to null, remove token and user data from localStorage, and navigate to the home route
    this.userService.setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['/']);
  }

  // Method to check if the current route matches a specified route
  hasRoute(route: string) {
    return this.router.url === route;
  }
}
