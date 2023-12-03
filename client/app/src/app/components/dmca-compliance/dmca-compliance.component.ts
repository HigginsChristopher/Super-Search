// Import Angular core modules and services
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DcmaService } from '../../services/dcma.service';
import { Entry } from '../../Entry';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../Review';
import { UtilityService } from '../../services/utility.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-dmca-compliance',
  templateUrl: './dmca-compliance.component.html',
  styleUrls: ['./dmca-compliance.component.css']
})
export class DmcaComplianceComponent implements OnInit {
  // Current user information
  currentUser: User | null = null;

  // Form group for DMCA compliance
  dmcaForm!: FormGroup;

  // Lists of reviews and DCMA claims
  reviews: Review[] | null = null;
  dcmaClaims: Entry[] | null = null;

  // Flags for error handling in the form
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  // Constructor with dependency injection
  constructor(
    private titleService: TitleService,
    private userService: UserService,
    private fb: FormBuilder,
    private dcmaService: DcmaService,
    private reviewService: ReviewService,
    private utilityService: UtilityService
  ) { }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Set page title
    this.titleService.setTitle("Copyright Enforcement")
    if (this.currentUser?.userType == "owner" || this.currentUser?.userType == "admin") {
      // Fetch current user information
      this.userService.getCurrentUser().subscribe(user => this.currentUser = user);

      // Fetch DCMA entries
      this.dcmaService.getEntries().subscribe(response => { this.dcmaClaims = response.claims },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            console.error(errorResponse.error.message);
          } else {
            console.error('An unexpected error occurred.');
          }
        });
      // Fetch reviews
      this.reviewService.getReviews().subscribe(response => { this.reviews = response.reviews },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            console.error(errorResponse.error.message);
          } else {
            console.error('An unexpected error occurred.');
          }
        })
    }
    // Initialize the DMCA form with validation
    this.dmcaForm = this.fb.group({
      entryAction: ['create', Validators.required],
      existingEntryId: [''],
      dateReceived: ['', Validators.required],
      dateNoticeSent: ['', Validators.required],
      dateDisputeReceived: ['', Validators.required],
      notes: ['', Validators.required],
      reviewIds: this.fb.control([], Validators.required),
      status: ['Active', Validators.required]
    });

  }

  // Method to submit DMCA entry
  submitDmcaEntry() {
    if (this.dmcaForm.valid) {
      // Create new DMCA entry
      const entry = {
        date_recieved: this.dmcaForm.value.dateReceived,
        date_notice_sent: this.dmcaForm.value.dateNoticeSent,
        date_dispute_recieved: this.dmcaForm.value.dateDisputeReceived,
        notes: this.dmcaForm.value.notes,
        reviews: this.dmcaForm.value.reviewIds,
        status: this.dmcaForm.value.status
      }

      // Subscribe to the DMCA service for creating an entry
      this.dcmaService.createEntry(entry).subscribe(response => {
        // Update the claims list and reset the form
        this.dcmaClaims?.push(response.claim)
        this.resetForm();
      },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            console.error(errorResponse.error.message);
          } else {
            console.error('An unexpected error occurred.');
          }
        });
    } else {
      // Show error popup and display form validation errors
      this.showPopupWithError(this.utilityService.getFormValidationErrors(this.dmcaForm));
    }
  }

  // Method to reset the DMCA form
  resetForm() {
    // Reset the form based on the entry action
    if (this.dmcaForm.value.entryAction == "edit") {
      // Reset for editing an existing entry
      this.dmcaForm.reset({
        // Reset form values with data from the selected claim
        entryAction: this.dmcaForm.value.entryAction,
        existingEntryId: this.dcmaClaims![0].claim_id,
        dateReceived: this.dcmaClaims![0].date_notice_sent,
        dateNoticeSent: this.dcmaClaims![0].date_notice_sent,
        dateDisputeReceived: this.dcmaClaims![0].date_dispute_recieved,
        notes: this.dcmaClaims![0].notes,
        reviewIds: this.dcmaClaims![0].reviews,
        status: this.dcmaClaims![0].status,
      });
    } else {
      // Reset for creating a new entry
      this.dmcaForm.reset({
        entryAction: this.dmcaForm.value.entryAction,
        existingEntryId: '',
        dateReceived: '',
        dateNoticeSent: '',
        dateDisputeReceived: '',
        notes: '',
        reviewIds: [],
        status: 'Active'
      });
    }
  }

  // Method to check if a form field is invalid
  isFieldInvalid(field: string): boolean | undefined {
    const control = this.dmcaForm.get(field);
    return control?.touched && control?.hasError('required');
  }

  // Method to hide reviews based on the selected IDs
  hideReviews() {
    // Fetch review IDs from the form
    const review_ids = this.dmcaForm.value.reviewIds;

    // Find matching reviews
    let matchingReviews: Review[] = [];
    this.reviews!.forEach(review => {
      if (review_ids.includes(review.review_id)) {
        matchingReviews.push(review);
      }
    })

    // Hide matching reviews
    for (const review of matchingReviews) {
      if (!review.hidden) {
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
    }
  }

  // Method to restore hidden reviews
  restoreReviews() {
    // Fetch review IDs from the form
    const review_ids = this.dmcaForm.value.reviewIds;

    // Find matching reviews
    let matchingReviews: Review[] = [];
    this.reviews!.forEach(review => {
      if (review_ids.includes(review.review_id)) {
        matchingReviews.push(review);
      }
    })

    // Restore hidden reviews
    for (const review of matchingReviews) {
      if (review.hidden) {
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
    }

    // Fetch updated reviews
    this.reviewService.getReviews().subscribe(response => { this.reviews = response.reviews },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      })
  }

  // Method called when an existing entry is selected
  onExistingEntrySelected() {
    const selectedEntryId = this.dmcaForm.value.existingEntryId;

    if (selectedEntryId) {
      // Find the selected entry
      const selectedEntry = this.dcmaClaims!.find(entry => entry.claim_id == selectedEntryId);

      if (selectedEntry) {
        // Patch form values with data from the selected claim
        this.dmcaForm.patchValue({
          dateReceived: selectedEntry.date_recieved,
          dateNoticeSent: selectedEntry.date_notice_sent,
          dateDisputeReceived: selectedEntry.date_dispute_recieved,
          notes: selectedEntry.notes,
          reviewIds: selectedEntry.reviews,
          status: selectedEntry.status
        });
      }
    }
  }

  // Method to update an existing DMCA entry
  updateDmcaEntry() {
    if (this.dmcaForm.valid) {
      // Create entry object for updating
      const entry = {
        claim_id: this.dmcaForm.value.existingEntryId,
        date_recieved: this.dmcaForm.value.dateReceived,
        date_notice_sent: this.dmcaForm.value.dateNoticeSent,
        date_dispute_recieved: this.dmcaForm.value.dateDisputeReceived,
        notes: this.dmcaForm.value.notes,
        reviews: this.dmcaForm.value.reviewIds,
        status: this.dmcaForm.value.status
      }

      // Subscribe to the DMCA service for updating an entry
      this.dcmaService.updateEntry(entry).subscribe(() => { },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            console.error(errorResponse.error.message);
          } else {
            console.error('An unexpected error occurred.');
          }
        });

      // Fetch updated DCMA entries
      this.dcmaService.getEntries().subscribe(response => { this.dcmaClaims = response.claims },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            console.error(errorResponse.error.message);
          } else {
            console.error('An unexpected error occurred.');
          }
        });
    } else {
      // Show error popup and display form validation errors
      this.showPopupWithError(this.utilityService.getFormValidationErrors(this.dmcaForm));
    }
  }

  // Method to close the error popup
  onClosePopup() {
    this.showErrorPopup = false;
  }

  // Method to show the error popup with a specific message
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }
}
