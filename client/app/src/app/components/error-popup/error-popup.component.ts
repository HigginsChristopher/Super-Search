import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrl: './error-popup.component.css'
})
export class ErrorPopupComponent implements OnInit {
  faTimes = faTimes;
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  @Input() errorMessage: any = '';
  @Input() currentUser: User | null = null;
  mockEmail = "";
  verifyUrl = "";
  registrationSuccess = false;

  constructor(
    private userService: UserService,
    private router: Router

  ) { }
  ngOnInit(): void {
    document.body.classList.add('modal-open');
  }
  onCloseButtonClick(): void {
    document.body.classList.remove('modal-open');
    this.closePopup.emit();
  }
  isArray() {
    return Array.isArray(this.errorMessage)
  }

  createMockEmail(): void {
    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseUrl = `${protocol}//${host}`;
    const url = `${baseUrl}/api/open/users/verify?token=${this.currentUser?.verificationToken}`
    this.mockEmail = `
      Mock Email:
      From: Do Not Reply <myEmail@myService.myDomain>
      To: <${this.currentUser?.email}>
      Subject: Resent account confirmation. Please confirm account for SE3316 Lab 4
      Text: Please confirm your account by clicking the following link: 
    `
    this.verifyUrl = url;
  }

  resendVerification() {
    this.userService.resendVerification(this.currentUser).subscribe(response => {
      this.currentUser = response.user
      this.registrationSuccess = true;
      this.createMockEmail();
    });
  }

  onVerify() {
    this.userService.verifyUser(this.currentUser!.verificationToken!).subscribe(response => {
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

  onForgot() { }

}
