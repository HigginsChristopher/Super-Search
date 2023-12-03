// Import Angular core modules and services
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrls: ['./error-popup.component.css']
})
export class ErrorPopupComponent implements OnInit {
  // FontAwesome icon for close button
  faTimes = faTimes;

  // Output events for closing the popup and deleting a list
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  @Output() deleteList: EventEmitter<void> = new EventEmitter<void>();

  // Input properties for error message and current user
  @Input() errorMessage: any = '';
  @Input() currentUser: User | null = null;

  // Mock email and verification URL for testing
  mockEmail = "";
  verifyUrl = "";

  // Flags for registration and forgot password success
  registrationSuccess = false;
  forgotSuccess = false;

  // Constructor with dependency injection
  constructor(
    private userService: UserService,
    private router: Router
  ) { }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Add 'modal-open' class to the body for styling
    document.body.classList.add('modal-open');
  }

  // Method triggered when the close button is clicked
  onCloseButtonClick(): void {
    // Remove 'modal-open' class from the body
    document.body.classList.remove('modal-open');
    // Emit closePopup event
    this.closePopup.emit();
  }

  // Method to check if the error message is an array
  isArray() {
    return Array.isArray(this.errorMessage);
  }

  // Method to create a mock email for verification
  createMockEmail(): void {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseUrl = `${protocol}//${host}`;
    const url = `${baseUrl}/api/open/users/verify?token=${this.currentUser?.verificationToken}`;
    this.verifyUrl = url;
  }

  // Method to resend email verification
  resendVerification() {
    this.userService.resendVerification(this.currentUser).subscribe(response => {
      this.currentUser = response.user;
      this.registrationSuccess = true;
      this.createMockEmail();
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Method to handle user verification
  onVerify() {
    this.userService.verifyUser(this.currentUser!.verificationToken!).subscribe(response => {
      localStorage.setItem('token', JSON.stringify(response.token));
      const user = jwtDecode(response.token);
      localStorage.setItem('userData', JSON.stringify(user));
      this.userService.setUser(user as User);
      this.router.navigate(['/']);
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Method to handle forgot password
  onForgot() {
    this.forgotSuccess = true;
    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseUrl = `${protocol}//${host}`;
    const url = `${baseUrl}/api/open/users/recovery`;
    this.verifyUrl = url;
  }

  // Method to reset password
  onReset() {
    this.userService.forgotPassword(this.currentUser!).subscribe(response => {
      localStorage.setItem('token', JSON.stringify(response.token));
      const user = jwtDecode(response.token);
      localStorage.setItem('userData', JSON.stringify(user));
      this.userService.setUser(user as User);
      this.router.navigate(['/reset-password']);
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          console.error(errorResponse.error.message);
        } else {
          console.error('An unexpected error occurred.');
        }
      });
  }

  // Method triggered when the delete list button is clicked
  onDeleteList() {
    // Remove 'modal-open' class from the body
    document.body.classList.remove('modal-open');
    // Emit deleteList event
    this.deleteList.emit();
  }
}
