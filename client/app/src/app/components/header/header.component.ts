// Import Angular core modules and services
import { Component, Input, OnInit } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  // Input property for the header title
  @Input() title: string = "";

  // Flag to control the visibility of the "Add List" component
  showAddList: boolean = false;

  // Subscription to toggle events for "Add List" visibility
  subscription: Subscription = new Subscription();

  // Current user information
  currentUser: User | null = null;

  // Constructor with dependency injection
  constructor(
    private userService: UserService,
    private uiService: UiService,
    private router: Router,
    private titleService: TitleService
  ) {
    // Subscribe to toggle events for "Add List" visibility
    this.subscription = this.uiService.onToggle().subscribe(value => this.showAddList = value);
  }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Fetch current user information
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // Update the title and initialize "Add List" visibility
    this.updateTitle();
    this.showAddList = false;
  }

  // Method to update the header title based on the current route
  updateTitle() {
    this.titleService.currentTitle$.subscribe((title) => {
      if (this.currentUser) {
        if (this.hasRoute("/")) {
          this.title = `SuperSearch - Homepage`;
        }
        else {
          this.title = title;
        }
      }
      else {
        this.title = title;
      }
    });
  }

  // Method to toggle the visibility of the "Add List" component
  toggleAddList() {
    this.uiService.toggleAddList();
  }

  // Method to check if the current route matches the specified route
  hasRoute(route: string) {
    return this.router.url === route;
  }

  // Method to navigate to the login route
  routeLogin() {
    this.router.navigate(['/login']);
  }

  // Method to navigate to the lists route
  routeLists() {
    this.router.navigate(['/lists']);
  }

  // Method to navigate to the hero search route
  routeHero() {
    this.router.navigate(['/hero-search']);
  }

  // Method to navigate to the account route
  routeAccount() {
    this.router.navigate(['/account']);
  }
}
