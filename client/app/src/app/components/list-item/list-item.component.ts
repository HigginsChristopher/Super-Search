import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { List } from "../../List";
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { Superhero } from '../../superhero';
import { SuperheroService } from '../../services/superhero.service';
import { ListService } from '../../services/list.service';
import { User } from '../../user';
import { UserService } from '../../services/user.service';
import { HeroService } from '../../services/hero.service';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../Review';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.css'
})
export class ListItemComponent implements OnInit {
  faTimes = faTimes;
  @Input() list!: List;
  @Input() listType!: string;
  @Output() onDeleteList: EventEmitter<List> = new EventEmitter();
  @Output() onToggleList: EventEmitter<List> = new EventEmitter();
  @Output() onUpdateList: EventEmitter<List> = new EventEmitter();
  @Output() onCreateReview: EventEmitter<Review> = new EventEmitter();


  superheroes: Superhero[] = [];
  reviews: Review[] = [];
  currentUser: User | null = null;
  formattedDateTime!: string;
  selectedSuperhero: Superhero | null = null;
  selectedList: List | null = null;
  selectedReview: List | null = null;
  expanded: boolean = false;
  private longPressTimer: any;
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  constructor(
    private listService: ListService,
    private userService: UserService,
    private heroService: HeroService,
    private reviewService: ReviewService) { }

  @HostListener('mouseup') onMouseUp() {
    this.clearLongPressTimer();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.clearLongPressTimer();
  }


  startLongPressTimer(event: MouseEvent, list: List): void {
    if (event.button === 0) { // Check left mouse button
      this.longPressTimer = setTimeout(() => {
        this.onToggleList.emit(list);
        this.clearLongPressTimer();
      }, 1000); // Adjust the duration according to your preference
    }
  }

  clearLongPressTimer(): void {
    clearTimeout(this.longPressTimer);
  }

  toggleExpand(list: List): void {
    this.expanded = !this.expanded;
    this.heroService.displayDetails(list.superhero_ids).subscribe((superheroes) => this.superheroes = superheroes);
    this.reviewService.displayReviews(list.list_id).subscribe((reviews) => {
      this.reviews = reviews;
      if (this.reviews.length > 0) {
        for (let review of this.reviews) {
          this.userService.getUserName(review.user_id).subscribe(response => {
            review.username = response.username
          });
        }
      }
    });
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.reviewService.displayReviews(this.list.list_id).subscribe((reviews) => {
      if (Array.isArray(reviews)) {
        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        this.list.rating = totalRatings / reviews.length;
      } else {
        this.list.rating = "No reviews"
      }
      // Create a new Date object and pass the timestamp as an argument
      const date = new Date(this.list.modified);

      // Use various methods of the Date object to extract different components of the date
      const year = date.getFullYear();
      const month = date.getMonth() + 1; // Months are zero-based, so add 1
      const day = date.getDate();
      const hours = date.getHours().toString().padStart(2, '0'); // Ensure leading zero
      const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure leading zero
      const seconds = date.getSeconds().toString().padStart(2, '0'); // Ensure leading zero

      // Format the components using toLocaleString
      this.formattedDateTime = `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
    });
    this.userService.getUserName(this.list.user_id).subscribe(response => {
      this.list.username = response.username
    });
  }

  onDelete(list: List) {
    this.onDeleteList.emit(list);
  }

  onToggle(list: List) {
    this.onToggleList.emit(list);
  }

  updateList(list: List): void {
    this.onUpdateList.emit(list);
    this.toggleExpand(list);
  }

  createReview(review: Review): void {
    this.onCreateReview.emit(review);
  }

  openSuperheroModal(superhero: any): void {
    this.selectedSuperhero = superhero;
  }

  closeSuperheroModal(): void {
    this.selectedSuperhero = null;
  }

  openListModificationModal(list: any): void {
    this.selectedList = list;
  }

  closeListModificationModal(): void {
    this.selectedList = null;
  }

  openCreateReviewModal(list: List): void {
    this.selectedReview = list;
  }

  closeCreateReviewModal(): void {
    this.selectedReview = null;
  }

  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }
  onClosePopup() {
    this.showErrorPopup = false;
  }
}
