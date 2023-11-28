// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { User } from '../../user';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  showErrorPopup: boolean = false;
  errorMessages: string = '';
  currentUser: User | null = null;


  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private titleService: TitleService,
    private userService: UserService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.titleService.setTitle('Login');
  }

  onSubmit() {
    if (this.loginForm.valid) {
      const email = this.loginForm.get('email')?.value;
      const password = this.loginForm.get('password')?.value;
      const user = {
        email: email,
        password: password
      }
      this.userService.loginUser(user).subscribe(
        (response: any) => {
          localStorage.setItem('token', JSON.stringify(response.token));
          const user = this.decodeJwt(response.token);
          localStorage.setItem('userData', JSON.stringify(user));
          this.userService.setUser(user);
          this.router.navigate(['/'])
        },
        (error: any) => {
          if (error instanceof HttpErrorResponse) {
            // Check for specific HTTP error status codes and handle them
            this.currentUser = {
              email: this.loginForm.get('email')?.value,
              password: this.loginForm.get('password')?.value
            }
            this.showPopupWithError(error.error.message);
          } else {
            // Handle non-HTTP errors or display a generic error message
            this.showPopupWithError('An unexpected error occurred.');
          }
        }
      );
    } else {
      this.showErrorPopup = true;
      this.showPopupWithError(this.getFormValidationErrors());
    }
  }

  // Call this function when you want to show the error popup
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
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

    Object.keys(this.loginForm.controls).forEach(key => {
      const controlErrors = this.loginForm.get(key)!.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          const message = `${key.charAt(0).toUpperCase() + key.slice(1)} ${errorMapping[keyError as keyof typeof errorMapping]}`;
          errorMessages.push(message);
        });
      }
    });
    return errorMessages;
  }

  onClosePopup() {
    this.showErrorPopup = false;
  }

}