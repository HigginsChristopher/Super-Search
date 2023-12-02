import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  createAccountForm: FormGroup;
  registrationSuccess = false;
  createdUser: User | null = null;
  verifyUrl = "";
  showErrorPopup: boolean = false;
  errorMessages: any = [];

  // Call this function when you want to show the error popup
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private titleService: TitleService,
    private router: Router
  ) {
    this.createAccountForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      nickname: ['', [Validators.required]]
    });
  }

  validateEmail(email: string): boolean {
    const regexp = new RegExp(/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    const serchfind = regexp.test(email);
    return serchfind
  }

  onSubmit() {
    if (this.createAccountForm.valid && this.validateEmail(this.createAccountForm.get('email')?.value)) {
      const email = this.createAccountForm.get('email')?.value;
      const password = this.createAccountForm.get('password')?.value;
      const nickname = this.createAccountForm.get('nickname')?.value;
      const newUser: User = {
        username: nickname,
        password: password,
        email: email,
      };
      this.userService.registerUser(newUser).subscribe(
        (response) => {
          this.createdUser = response.user;
          this.registrationSuccess = true;
          this.createMockEmail();
        },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            // Check for specific HTTP error status codes and handle them
            this.showPopupWithError(errorResponse.error.message);
          } else {
            // Handle non-HTTP errors or display a generic error message
            this.showPopupWithError('An unexpected error occurred.');
          }
        }
      );
    }
    else {
      this.errorMessages = [];
      if (!this.validateEmail(this.createAccountForm.get('email')?.value) && this.createAccountForm.get("email")!.value !== "") {
        this.errorMessages.push("Invalid email format")
      }
      this.showErrorPopup = true;
      this.getFormValidationErrors()
      this.showPopupWithError(this.errorMessages);
    }
  };

  onClosePopup() {
    if(this.errorMessages==="Email Verification Successful"){
      this.router.navigate(['/'])
    }
    this.showErrorPopup = false;
  }

  ngOnInit(): void {
    this.titleService.setTitle('Create Account');
  }

  createMockEmail(): void {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseUrl = `${protocol}//${host}`;
    const url = `${baseUrl}/api/open/users/verify?token=${this.createdUser?.verificationToken}`
    this.verifyUrl = url;
  }

  onVerify() {
    this.userService.verifyUser(this.createdUser!.verificationToken!).subscribe(response => {
      localStorage.setItem('token', JSON.stringify(response.token));
      const user = jwtDecode(response.token)
      localStorage.setItem('userData', JSON.stringify(user));
      this.userService.setUser(user as User);
      this.showPopupWithError("Email Verification Successful");
    });
  }

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

