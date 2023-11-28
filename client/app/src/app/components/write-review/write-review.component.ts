import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { List } from '../../List';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Review } from '../../Review';
import { UserService } from '../../services/user.service';
import { User } from '../../user';

@Component({
  selector: 'app-write-review',
  templateUrl: './write-review.component.html',
  styleUrl: './write-review.component.css'
})
export class WriteReviewComponent implements OnInit{
  @Input() list!: List;
  @Output() onCreateReview: EventEmitter<Review> = new EventEmitter();
  @Output() closeModal = new EventEmitter<void>();
  faTimes = faTimes;
  createReview!: FormGroup;
  currentUser: User | null = null;

  constructor(private fb: FormBuilder, private userService: UserService) { }
  
  ngOnInit(): void {
    document.body.classList.add('modal-open');
    // Initialize the form with default values or values passed from the parent component
    this.createReview = this.fb.group({
      rating: [2.5],
      comment: ['']
    });
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  onCloseModal(): void {
    document.body.classList.remove('modal-open');
    this.closeModal.emit();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.createReview.invalid) {
      alert("Please fill out the required fields!");
      return;
    }
    const newReview: Review = {
      list_id: this.list.list_id!,
      comment: this.createReview.value.comment,
      rating: this.createReview.value["rating"],
    };
    this.onCreateReview.emit(newReview);
    this.onCloseModal();
  }
}
