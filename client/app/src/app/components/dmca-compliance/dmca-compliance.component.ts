// dmca-compliance.component.ts
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DcmaService } from '../../services/dcma.service';
import { Entry } from '../../Entry';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../Review';

@Component({
  selector: 'app-dmca-compliance',
  templateUrl: './dmca-compliance.component.html',
  styleUrls: ['./dmca-compliance.component.css']
})
export class DmcaComplianceComponent implements OnInit {
  currentUser: User | null = null;
  dmcaForm!: FormGroup;
  reviews: Review[] | null = null;
  dcmaClaims: Entry[] | null = null;
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  constructor(
    private titleService: TitleService,
    private userService: UserService,
    private fb: FormBuilder,
    private dcmaService: DcmaService,
    private reviewService: ReviewService
  ) { }

  ngOnInit(): void {
    this.titleService.setTitle("Copyright Enforcement")
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);
    this.dcmaService.getEntries().subscribe(claims => this.dcmaClaims = claims);
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
    this.reviewService.getReviews().subscribe(reviews => this.reviews = reviews)
  }

  // Implement methods for submitting DMCA entries and managing reviews
  submitDmcaEntry() {
    if (this.dmcaForm.valid) {
      const entry = {
        date_recieved: this.dmcaForm.value.dateReceived,
        date_notice_sent: this.dmcaForm.value.dateNoticeSent,
        date_dispute_recieved: this.dmcaForm.value.dateDisputeReceived,
        notes: this.dmcaForm.value.notes,
        reviews: this.dmcaForm.value.reviewIds,
        status: this.dmcaForm.value.status
      }
      this.dcmaService.createEntry(entry).subscribe(dcma => {
        this.dcmaClaims?.push(dcma)
        this.resetForm();
      });
    } else {
      this.showPopupWithError(this.getFormValidationErrors());
    }
  }

  resetForm() {
    if (this.dmcaForm.value.entryAction == "edit") {
      this.dmcaForm.reset({
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

  isFieldInvalid(field: string): boolean | undefined {
    const control = this.dmcaForm.get(field);
    return control?.touched && control?.hasError('required');
  }

  hideReviews() {
    const review_ids = this.dmcaForm.value.reviewIds;
    let matchingReviews: Review[] = [];
    this.reviews!.forEach(review => {
      if (review_ids.includes(review.review_id)) {
        matchingReviews.push(review);
      }
    })
    for (const review of matchingReviews) {
      if (!review.hidden) {
        this.reviewService.flagReview(review.review_id).subscribe(resp => console.log(resp))
      }
    }
    this.reviewService.getReviews().subscribe(reviews => this.reviews = reviews)
  }

  restoreReviews() {
    const review_ids = this.dmcaForm.value.reviewIds;
    let matchingReviews: Review[] = [];
    this.reviews!.forEach(review => {
      if (review_ids.includes(review.review_id)) {
        matchingReviews.push(review);
      }
    })
    for (const review of matchingReviews) {
      if (review.hidden) {
        this.reviewService.flagReview(review.review_id).subscribe();
      }
    }
    this.reviewService.getReviews().subscribe(reviews => this.reviews = reviews)
  }

  onExistingEntrySelected() {
    const selectedEntryId = this.dmcaForm.value.existingEntryId;

    // Call your service method to get the details of the selected entry
    if (selectedEntryId) {

      const selectedEntry = this.dcmaClaims!.find(entry => entry.claim_id == selectedEntryId);

      // If the selected entry is found, populate the form fields
      if (selectedEntry) {
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
  updateDmcaEntry() {
    if (this.dmcaForm.valid) {
      const entry = {
        claim_id: this.dmcaForm.value.existingEntryId,
        date_recieved: this.dmcaForm.value.dateReceived,
        date_notice_sent: this.dmcaForm.value.dateNoticeSent,
        date_dispute_recieved: this.dmcaForm.value.dateDisputeReceived,
        notes: this.dmcaForm.value.notes,
        reviews: this.dmcaForm.value.reviewIds,
        status: this.dmcaForm.value.status
      }
      this.dcmaService.updateEntry(entry).subscribe();
      this.dcmaService.getEntries().subscribe(claims => this.dcmaClaims = claims);
    } else {
      this.showPopupWithError(this.getFormValidationErrors());
    }
  }


  onClosePopup() {
    this.showErrorPopup = false;
  }

  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  getFormValidationErrors(): string[] {
    const errorMessages: string[] = [];
    const errorMapping: { [key: string]: string } = {
      required: 'is required'
    };

    Object.keys(this.dmcaForm.controls).forEach(key => {
      const controlErrors = this.dmcaForm.get(key)!.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          const message = `${key.charAt(0).toUpperCase() + key.slice(1)} ${errorMapping[keyError as keyof typeof errorMapping]}`;
          errorMessages.push(message);
        });
      }
    });
    return errorMessages;
  }
}