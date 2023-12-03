// Import Angular core modules and services
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../User';
import { jwtDecode } from 'jwt-decode';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  // Form group for login form
  loginForm: FormGroup;

  // Flags for error handling
  showErrorPopup: boolean = false;
  errorMessages: any = [];

  // Current user information
  currentUser: User | null = null;

  // Constructor with dependency injection
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private titleService: TitleService,
    private userService: UserService,
    public utilityService: UtilityService
  ) {
    // Initialize the login form with form controls and validators
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Set the title of the page
    this.titleService.setTitle('Login');
  }

  // Method to handle form submission
  onSubmit() {
    if (this.loginForm.valid && this.utilityService.validateEmail(this.loginForm.get('email')?.value)) {
      // Extract email and password from the form
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;

      // Create a user object
      const user = {
        email: email,
        password: password
      }

      // Call the login service to authenticate the user
      this.userService.loginUser(user).subscribe(
        // Successful login
        (response: any) => {
          // Store token and user data in local storage
          localStorage.setItem('token', JSON.stringify(response.token));
          const user = jwtDecode(response.token)
          localStorage.setItem('userData', JSON.stringify(user));

          // Set the user in the UserService
          this.userService.setUser(user as User);

          // Display a success message
          this.showPopupWithError("Login Successful");
        },
        // Error during login
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            // If it's an HTTP error, store the current user and show the error message
            this.currentUser = {
              email: this.loginForm.get('email')?.value,
              password: this.loginForm.get('password')?.value
            }
            this.showPopupWithError(errorResponse.error.message);
          } else {
            // Show a generic error message for unexpected errors
            this.showPopupWithError('An unexpected error occurred.');
          }
        }
      );
    } else {
      // Validation failed
      this.errorMessages = [];

      // Check for invalid email format
      if (!this.utilityService.validateEmail(this.loginForm.get('email')?.value) && this.loginForm.get("email")!.value !== "") {
        this.errorMessages.push("Invalid email format")
      }

      // Show error popup with validation messages
      this.showErrorPopup = true;
      this.getFormValidationErrors()
      this.showPopupWithError(this.errorMessages);
    }
  }

  // Method to display an error popup with a message
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  // Method to get validation errors from the form
  getFormValidationErrors() {
    const errorMapping: { [key: string]: string } = {
      required: 'is required'
    };

    Object.keys(this.loginForm.controls).forEach(key => {
      const controlErrors = this.loginForm.get(key)!.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          const message = `${key.charAt(0).toUpperCase() + key.slice(1)} ${errorMapping[keyError as keyof typeof errorMapping]}`;
          this.errorMessages.push(message);
        });
      }
    });
  }

  // Method to close the error popup
  onClosePopup() {
    // Redirect to home page if login was successful
    if (this.errorMessages === "Login Successful") {
      this.router.navigate(['/'])
    }
    this.showErrorPopup = false;
  }

}
