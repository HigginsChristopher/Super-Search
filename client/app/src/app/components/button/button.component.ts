// Import Angular core modules and decorators
import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.css']
})
export class ButtonComponent {
  // Input properties for the button text and color
  @Input() text!: string;
  @Input() color!: string;

  // Output event emitter for button click
  @Output() btnClick = new EventEmitter();

  // Method to handle button click event
  onClick() {
    // Emit the button click event to the parent component
    this.btnClick.emit();
  }
}
