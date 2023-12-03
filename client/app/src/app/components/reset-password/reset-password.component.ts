// Import Angular core modules and services
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent {
  // Form group for password reset
  resetForm!: FormGroup;

  // Current user information
  currentUser: User | null = null;

  // Flags for error handling
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  // Constructor with dependency injection
  constructor(
    private fb: FormBuilder,
    private titleService: TitleService,
    private userService: UserService,
  ) { }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit() {
    // Initialize the form and set the page title
    this.initForm();
    this.titleService.setTitle("Reset-Password");

    // Get the current user
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);
  }

  // Method to initialize the password reset form
  initForm() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator // Custom validator for password match
    });
  }

  // Custom validator function for password match
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')!.value === g.get('confirmPassword')!.value
      ? null : { 'mismatch': true };
  }

  // Method to handle form submission
  onSubmit() {
    if (this.resetForm.valid) {
      // Form is valid, perform password reset logic
      const newPassword = this.resetForm.value.newPassword;

      // Call the service to update the password
      this.userService.updatePassword(newPassword).subscribe(response => {
        // Show a success message in the error popup
        this.showPopupWithError(response.message)
      },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            console.error(errorResponse.error.message);
          } else {
            console.error('An unexpected error occurred.');
          }
        });

      // Reset the form
      this.resetForm.reset({
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      // Form is not valid, handle accordingly
    }
  }

  // Method to show the error popup with a message
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  // Method to close the error popup
  onClosePopup() {
    this.showErrorPopup = false;
  }
}
