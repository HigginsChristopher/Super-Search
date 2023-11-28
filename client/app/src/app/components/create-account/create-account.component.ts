import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { faL } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.component.html',
  styleUrls: ['./create-account.component.css']
})
export class CreateAccountComponent implements OnInit {
  createAccountForm: FormGroup;
  registrationSuccess = false;
  createdUser: User | null = null;
  mockEmail = "";
  verifyUrl = "";
  showErrorPopup: boolean = false;
  errorMessages: string = '';

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
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      nickname: ['', [Validators.required]]
    });
  }

  onSubmit() {
    if (this.createAccountForm.valid) {
      const email = this.createAccountForm.get('email')?.value;
      const password = this.createAccountForm.get('password')?.value;
      const nickname = this.createAccountForm.get('nickname')?.value;
      const newUser: User = {
        username: nickname,
        password: password,
        email: email,
        verified: false,
      };
      this.userService.registerUser(newUser).subscribe(
        (response: any) => {
          this.createdUser = response.user;
          this.registrationSuccess = true;
          this.createMockEmail();
        },
        (error: any) => {
          if (error instanceof HttpErrorResponse) {
            // Check for specific HTTP error status codes and handle them
            this.showPopupWithError(error.error.message);
          } else {
            // Handle non-HTTP errors or display a generic error message
            this.showPopupWithError('An unexpected error occurred.');
          }
        }
      );
    }
    else {
      this.showErrorPopup = true;
      this.showPopupWithError(this.getFormValidationErrors());
    }
  };

  onClosePopup() {
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
    this.mockEmail = `
      Mock Email:
      From: Do Not Reply <myEmail@myService.myDomain>
      To: <${this.createdUser?.email}>
      Subject: Please confirm account for SE3316 Lab 4
      Text: Please confirm your account by clicking the following link: 
    `
    this.verifyUrl = url;
  }
  onVerify() {
    this.userService.verifyUser(this.createdUser!.verificationToken!).subscribe(response => {
      localStorage.setItem('token', JSON.stringify(response.token));
      const user = this.decodeJwt(response.token);
      localStorage.setItem('userData', JSON.stringify(user));
      this.userService.setUser(user);
      this.router.navigate(['/'])
    });
  }

  decodeJwt(token: string) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(jsonPayload);
  }

  getFormValidationErrors(): string[] {
    const errorMessages: string[] = [];
    const errorMapping: { [key: string]: string } = {
      required: 'is required',
      email: 'must be a valid email address'
    };

    Object.keys(this.createAccountForm.controls).forEach(key => {
      const controlErrors = this.createAccountForm.get(key)!.errors;
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

