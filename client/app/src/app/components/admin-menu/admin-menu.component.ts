// Import Angular core modules and services
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { User } from '../../user';
import { UserService } from '../../services/user.service';
import { TitleService } from '../../services/title.service';
import { IconDefinition, faFlag } from "@fortawesome/free-solid-svg-icons";
import { faUser as faUserSolid } from '@fortawesome/free-solid-svg-icons';
import { faUser as faUserHollow } from '@fortawesome/free-regular-svg-icons';
import { Review } from '../../Review';
import { ReviewService } from '../../services/review.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit {
  // Output event emitter for menu item selection
  @Output() menuItemSelected: EventEmitter<string> = new EventEmitter<string>();

  // Current user information
  currentUser: User | null = null;

  // FontAwesome icons for UI elements
  faTimes = faFlag;
  faUserSolid = faUserSolid;
  faUserHollow = faUserHollow;

  // Array of users (or null if not fetched)
  users: User[] | null = null;

  // Flags for error handling in the component
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  // Constructor with dependency injection
  constructor(
    private userService: UserService,
    private titleService: TitleService,
    private reviewService: ReviewService
  ) { }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Set the page title for the admin menu
    this.titleService.setTitle('Admin Menu');

    // Fetch all user information
    this.userService.getAllUserInfo().subscribe(response => {
      this.users = response.users;
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });

    // Fetch the current user information
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);
  }

  // Method to toggle the display of user reviews
  toggleReviews(user: User) {
    user.showReviews = !user.showReviews;
  }

  // Method to flag a user as disabled
  flagUser(user: User) {
    this.userService.disableUser(user).subscribe(response => {
      user.disabled = response.user.disabled;
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Method to flag a review
  flagReview(review: Review) {
    this.reviewService.flagReview(review.review_id).subscribe(response => {
      review.hidden = response.review.hidden;
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Method to toggle the admin status of a user
  toggleAdminStatus(user: User): void {
    this.userService.adminUser(user).subscribe(response => {
      user.userType = response.user.userType;
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Method to get the FontAwesome icon based on the user's admin status
  getAdminIcon(user: User): IconDefinition {
    return user.userType === 'admin' ? faUserSolid : faUserHollow;
  }
}
