// Import Angular core modules and libraries
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { Superhero } from '../../Superhero';

@Component({
  selector: 'app-superhero-modal',
  templateUrl: './superhero-modal.component.html',
  styleUrls: ['./superhero-modal.component.css']
})
export class SuperheroModalComponent implements OnInit {
  // Input property to receive superhero data
  @Input() superhero!: Superhero;

  // Output event to notify the parent component to close the modal
  @Output() closeModal = new EventEmitter<void>();

  // Font Awesome icon for close button
  faTimes = faTimes;

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Add a CSS class to the body to prevent background scrolling when modal is open
    document.body.classList.add('modal-open');
  }

  // Method to handle the close button click and emit the close event
  onCloseModal(): void {
    // Remove the CSS class from the body to enable background scrolling
    document.body.classList.remove('modal-open');

    // Emit the close event to notify the parent component
    this.closeModal.emit();
  }
}
