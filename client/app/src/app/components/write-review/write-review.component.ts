// Importing required modules and components from Angular and third-party libraries
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { List } from '../../List';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Review } from '../../Review';
import { UserService } from '../../services/user.service';
import { User } from '../../User';

@Component({
  selector: 'app-write-review',
  templateUrl: './write-review.component.html',
  styleUrls: ['./write-review.component.css']
})
export class WriteReviewComponent implements OnInit {
  // Input property to receive the list for which the review is being written
  @Input() list!: List;

  // Output event to emit the newly created review to the parent component
  @Output() onCreateReview: EventEmitter<Review> = new EventEmitter();

  // Output event to emit the signal to close the modal to the parent component
  @Output() closeModal = new EventEmitter<void>();

  // FontAwesome icon for the close button
  faTimes = faTimes;

  // FormGroup to manage the review creation form
  createReview!: FormGroup;

  // Current user information received from the UserService
  currentUser: User | null = null;

  // Constructor with dependency injection
  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    // Adding a class to the body to prevent background scrolling when the modal is open
    document.body.classList.add('modal-open');

    // Initializing the createReview FormGroup with default values
    this.createReview = this.fb.group({
      rating: [2.5],
      comment: ['']
    });

    // Fetching the current user information
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  // Method to close the modal and remove the 'modal-open' class from the body
  onCloseModal(): void {
    document.body.classList.remove('modal-open');
    this.closeModal.emit();
  }

  // Method to handle the form submission and emit the new review to the parent component
  onSubmit(event: Event): void {
    event.preventDefault();

    // Checking if the form is invalid
    if (this.createReview.invalid) {
      alert("Please fill out the required fields!");
      return;
    }

    // Creating a new Review object with form values
    const newReview: Review = {
      list_id: this.list.list_id!,
      comment: this.createReview.value.comment,
      rating: this.createReview.value["rating"]
    };

    // Emitting the new review to the parent component
    this.onCreateReview.emit(newReview);

    // Closing the modal
    this.onCloseModal();
  }
}
