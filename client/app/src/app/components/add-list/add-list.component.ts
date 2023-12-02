// Import Angular core modules and services
import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';  // Import necessary modules
import { List } from '../../List';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-add-list',
  templateUrl: './add-list.component.html',
  styleUrls: ['./add-list.component.css']
})
export class AddListComponent implements OnInit {
  // Output event emitter for adding a new list and closing the modal
  @Output() onAddList: EventEmitter<List> = new EventEmitter();
  @Output() closeModal = new EventEmitter<void>();

  // Form group for the list creation form
  listForm: FormGroup;

  // Flag to control the visibility of the add-list component
  showAddList: boolean = false;

  // Subscription to toggle the visibility of the add-list component
  subscription: Subscription = new Subscription();

  // Current user information
  currentUser: User | null = null;

  // Flags for error handling in the form
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  // Constructor with dependency injection
  constructor(
    private uiService: UiService,
    private userService: UserService,
    private fb: FormBuilder,
    private utilityService: UtilityService) {

    // Subscribe to toggle events to control the visibility of the component
    this.subscription = this.uiService.onToggle().subscribe((value) => (this.showAddList = value));

    // Initialize the form with list name, superhero ids, description and visability fields
    this.listForm = this.fb.group({
      list_name: ['', [Validators.required]],
      superhero_ids: ['', [Validators.required]],
      description: [''],
      visibility: [false],
    });
  }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Fetch current user information
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  // Method to handle form submission
  onSubmit() {
    if (this.listForm.valid) {
      // Parse superhero_ids to handle possible input variations
      let superhero_ids = this.listForm.value.superhero_ids;
      try {
        superhero_ids = JSON.parse(`[${this.listForm.value.superhero_ids}]`)
      } catch (ignored) { }

      // Create a new list object
      const newList = {
        user_id: this.currentUser?.id!,
        ["list-name"]: this.listForm.value.list_name,
        superhero_ids: superhero_ids,
        description: this.listForm.value.description,
        visibility: this.listForm.value.visibility
      };

      // Emit the new list to the parent component
      this.onAddList.emit(newList);

      // Close the modal after adding the list
      this.onClosePopup();
    }
    else {
      // Show error popup and display form validation errors
      this.showErrorPopup = true;
      this.showPopupWithError(this.utilityService.getFormValidationErrors(this.listForm));
    }
  }

  // Method to close the error popup
  onClosePopup() {
    this.showErrorPopup = false;
  }

  // Call this function when you want to show the error popup
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

}
