// Import Angular core modules and services
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TitleService } from '../../services/title.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css']
})
export class AccountComponent implements OnInit {

  // Constructor with dependency injection
  constructor(
    private userService: UserService,
    private titleService: TitleService,
    private router: Router
  ) { }

  // Method to handle user logout
  routeLogout() {
    // Clear user data and token from local storage
    this.userService.setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");

    // Navigate to the home page after logout
    this.router.navigate(["/"]);
  }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Set the page title for the account settings
    this.titleService.setTitle("Account Settings");
  }

  // Method to navigate to the reset password page
  routeResetPassword(): void {
    this.router.navigate(["/reset-password"]);
  }
}
