// Import Angular core modules and services
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../User';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit {
  // Current user information
  currentUser: User | null = null;

  // Constructor with dependency injection
  constructor(private router: Router, private userService: UserService) { }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Fetch current user information
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);
  }

  // Method to navigate to the home route
  routeHome() {
    this.router.navigate(['/']);
  }

  // Method to check if the current route matches the specified route
  hasRoute(route: string) {
    return this.router.url === route;
  }

  // Method to navigate to the admin menu route
  routeAdminMenu() {
    this.router.navigate(['/admin-menu']);
  }
}
