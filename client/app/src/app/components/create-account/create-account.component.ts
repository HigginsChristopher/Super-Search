// Import Angular core modules and services,
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  // Reactive form for user account creation
  createAccountForm: FormGroup;

  // Flag to track if user registration is successful
  registrationSuccess = false;

  // User object created after successful registration
  createdUser: User | null = null;

  // URL for email verification link
  verifyUrl = "";

  // Flag to control visibility of error popup
  showErrorPopup: boolean = false;

  // Array to store error messages
  errorMessages: any = [];

  // Call this function when you want to show the error popup
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  // Constructor with dependency injection
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private titleService: TitleService,
    private router: Router,
    public utilityService: UtilityService
  ) {
    // Initialize the form with email, password, and nickname fields
    this.createAccountForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      nickname: ['', [Validators.required]]
    });
  }

  // Handle form submission
  onSubmit() {
    if (this.createAccountForm.valid && this.utilityService.validateEmail(this.createAccountForm.get('email')?.value)) {
      const email = this.createAccountForm.get('email')?.value;
      const password = this.createAccountForm.get('password')?.value;
      const nickname = this.createAccountForm.get('nickname')?.value;
      const newUser: User = {
        username: nickname,
        password: password,
        email: email,
      };
      this.userService.registerUser(newUser).subscribe(
        // Handle successful registration
        (response) => {
          this.createdUser = response.user;
          this.registrationSuccess = true;
          this.createMockEmail();
        },
        // Handle registration error
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            this.showPopupWithError(errorResponse.error.message);
          } else {
            this.showPopupWithError('An unexpected error occurred.');
          }
        }
      );
    } else {
      this.errorMessages = [];
      // Check for invalid email format
      if (!this.utilityService.validateEmail(this.createAccountForm.get('email')?.value) && this.createAccountForm.get("email")!.value !== "") {
        this.errorMessages.push("Invalid email format")
      }
      this.showErrorPopup = true;
      this.getFormValidationErrors()
      this.showPopupWithError(this.errorMessages);
    }
  };

  // Close the error popup
  onClosePopup() {
    if (this.errorMessages === "Email Verification Successful") {
      this.router.navigate(['/'])
    }
    this.showErrorPopup = false;
  }

  ngOnInit(): void {
    // Set the page title
    this.titleService.setTitle('Create Account');
  }

  // Create a mock email with a verification link
  createMockEmail(): void {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseUrl = `${protocol}//${host}`;
    const url = `${baseUrl}/api/open/users/verify?token=${this.createdUser?.verificationToken}`
    this.verifyUrl = url;
  }

  // Handle user verification
  onVerify() {
    this.userService.verifyUser(this.createdUser!.verificationToken!).subscribe(response => {
      localStorage.setItem('token', JSON.stringify(response.token));
      const user = jwtDecode(response.token)
      localStorage.setItem('userData', JSON.stringify(user));
      this.userService.setUser(user as User);
      this.showPopupWithError("Email Verification Successful");
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Get form validation errors and display corresponding messages
  getFormValidationErrors() {
    const errorMapping: { [key: string]: string } = {
      required: 'is required'
    };

    Object.keys(this.createAccountForm.controls).forEach(key => {
      const controlErrors = this.createAccountForm.get(key)!.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          const message = `${key.charAt(0).toUpperCase() + key.slice(1)} ${errorMapping[keyError as keyof typeof errorMapping]}`;
          this.errorMessages.push(message);
        });
      }
    });
  }
}
