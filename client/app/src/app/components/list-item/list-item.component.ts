// Import Angular core modules and services
import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { List } from "../../List";
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { Superhero } from '../../superhero';
import { User } from '../../user';
import { UserService } from '../../services/user.service';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../Review';
import { UtilityService } from '../../services/utility.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrls: ['./list-item.component.css']
})
export class ListItemComponent implements OnInit {
  // Font Awesome icon for the times symbol
  faTimes = faTimes;

  // Input properties for the list and its type
  @Input() list!: List;
  @Input() listType!: string;

  // Output events to communicate with the parent component
  @Output() onDeleteList: EventEmitter<List> = new EventEmitter();
  @Output() onToggleList: EventEmitter<List> = new EventEmitter();
  @Output() onUpdateList: EventEmitter<List> = new EventEmitter();
  @Output() onExpandList: EventEmitter<List> = new EventEmitter();
  @Output() onCreateReview: EventEmitter<Review> = new EventEmitter();

  // Arrays to store superheroes and reviews
  superheroes: Superhero[] = [];
  reviews: Review[] = [];

  // Current user information
  currentUser: User | null = null;

  // Formatted date and time string
  formattedDateTime!: string;

  // Selected superhero, list, and review for modals
  selectedSuperhero: Superhero | null = null;
  selectedList: List | null = null;
  selectedReview: List | null = null;

  // Flag to indicate whether the list is expanded
  expanded: boolean = false;

  // Timer for long press handling
  private longPressTimer: any;

  // Flags for error handling in the form
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  // Constructor with dependency injection
  constructor(
    private userService: UserService,
    private reviewService: ReviewService,
    private utilityService: UtilityService
  ) { }

  // Host listeners for mouse events
  @HostListener('mouseup') onMouseUp() {
    this.clearLongPressTimer();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.clearLongPressTimer();
  }

  // Method to start the long press timer
  startLongPressTimer(event: MouseEvent, list: List): void {
    if (event.button === 0) {
      this.longPressTimer = setTimeout(() => {
        this.onToggleList.emit(list);
        this.clearLongPressTimer();
      }, 1000);
    }
  }

  // Method to clear the long press timer
  clearLongPressTimer(): void {
    clearTimeout(this.longPressTimer);
  }

  // Method to toggle the expansion of the list
  toggleExpand(list: List): void {
    this.onExpandList.emit(list);
    this.expanded = !this.expanded;
  }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Fetch current user information
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // Display reviews for the list
    this.reviewService.displayReviews(this.list.list_id).subscribe((response) => {
      const reviews = response.reviews as Review[];
      if (Array.isArray(reviews)) {
        // Calculate the average rating for the list
        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        this.list.rating = totalRatings / reviews.length;
      } else {
        this.list.rating = "No reviews"
      }

      // Format the date and time
      this.formattedDateTime = this.utilityService.timestampToDate(this.list.modified);
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          this.showPopupWithError(errorResponse.error.message);
        } else {
          this.showPopupWithError('An unexpected error occurred.');
        }
      });

    // Get the username for the list owner
    this.userService.getUserName(this.list.user_id).subscribe(response => {
      this.list.username = response.username;
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Method to handle the delete action
  onDelete() {
    this.showPopupWithError("Are you sure you want to delete this list?")
  }

  // Method to handle the toggle action
  onToggle(list: List) {
    this.onToggleList.emit(list);
  }

  // Method to update the list
  updateList(list: List): void {
    this.onUpdateList.emit(list);
    this.toggleExpand(list);
  }

  // Method to create a review
  createReview(review: Review): void {
    this.onCreateReview.emit(review);
  }

  // Method to open the superhero modal
  openSuperheroModal(superhero: any): void {
    this.selectedSuperhero = superhero;
  }

  // Method to close the superhero modal
  closeSuperheroModal(): void {
    this.selectedSuperhero = null;
  }

  // Method to open the list modification modal
  openListModificationModal(list: any): void {
    this.selectedList = list;
  }

  // Method to close the list modification modal
  closeListModificationModal(): void {
    this.selectedList = null;
  }

  // Method to open the create review modal
  openCreateReviewModal(list: List): void {
    this.selectedReview = list;
  }

  // Method to close the create review modal
  closeCreateReviewModal(): void {
    this.selectedReview = null;
  }

  // Method to show the error popup with a specific message
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  // Method to close the error popup
  onClosePopup() {
    this.showErrorPopup = false;
  }

  // Method to emit the delete event
  emitDelete(list: any) {
    this.onClosePopup();
    this.onDeleteList.emit(list);
  }
}
