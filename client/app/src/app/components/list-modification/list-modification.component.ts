// Import Angular core modules and services
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { List } from '../../List';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-list-modification',
  templateUrl: './list-modification.component.html',
  styleUrls: ['./list-modification.component.css']
})
export class ListModificationComponent implements OnInit {
  // Input property for the list
  @Input() list!: List;

  // Output events to communicate with the parent component
  @Output() onUpdateList: EventEmitter<List> = new EventEmitter<List>();
  @Output() closeModal = new EventEmitter<void>();

  // Font Awesome icon for the times symbol
  faTimes = faTimes;

  // Form group for the list modification form
  editForm!: FormGroup;

  // Constructor with dependency injection
  constructor(private fb: FormBuilder) { }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Add a CSS class to the body to prevent background scrolling when the modal is open
    document.body.classList.add('modal-open');

    // Initialize the form with list properties
    this.editForm = this.fb.group({
      "list-name": [this.list['list-name']],
      superhero_ids: [this.list.superhero_ids],
      description: [this.list.description],
      visibility: [this.list.visibility],
    });
  }

  // Method to close the modal
  onCloseModal(): void {
    // Remove the CSS class from the body to allow background scrolling
    document.body.classList.remove('modal-open');

    // Emit the close modal event to the parent component
    this.closeModal.emit();
  }

  // Method to handle form submission
  onSubmit(event: Event): void {
    // Prevent the default form submission behavior
    event.preventDefault();

    // Check if the form is invalid
    if (this.editForm.invalid) {
      // Display an alert and return if the form is invalid
      alert("Please fill out the required fields!");
      return;
    }

    // Create a new list object with updated values
    const newList = {
      user_id: this.list.user_id,
      list_id: this.list.list_id,
      ["list-name"]: this.editForm.value["list-name"],
      superhero_ids: JSON.parse(`[${this.editForm.value.superhero_ids}]`),
      description: this.editForm.value.description,
      visibility: this.editForm.value.visibility
    };

    // Emit the updated list to the parent component
    this.onUpdateList.emit(newList);

    // Close the modal
    this.onCloseModal();
  }
}
