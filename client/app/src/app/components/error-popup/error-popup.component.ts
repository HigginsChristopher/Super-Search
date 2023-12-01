import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-error-popup',
  templateUrl: './error-popup.component.html',
  styleUrl: './error-popup.component.css'
})
export class ErrorPopupComponent implements OnInit {
  faTimes = faTimes;
  @Output() closePopup: EventEmitter<void> = new EventEmitter<void>();
  @Output() deleteList: EventEmitter<void> = new EventEmitter<void>();
  @Input() errorMessage: any = '';
  @Input() currentUser: User | null = null;
  mockEmail = "";
  verifyUrl = "";
  registrationSuccess = false;
  forgotSuccess = false;


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
      const user = jwtDecode(response.token)
      localStorage.setItem('userData', JSON.stringify(user));
      this.userService.setUser(user as User);
      this.router.navigate(['/'])
    });
  }


  onForgot() {
    this.forgotSuccess = true;
    const protocol = window.location.protocol;
    const host = window.location.host;
    const baseUrl = `${protocol}//${host}`;
    const url = `${baseUrl}/api/open/users/recovery`
    this.verifyUrl = url;
  }
  
  onReset() {
    this.userService.forgotPassword(this.currentUser!).subscribe(response => {
      localStorage.setItem('token', JSON.stringify(response.token));
      const user = jwtDecode(response.token)
      localStorage.setItem('userData', JSON.stringify(user));
      this.userService.setUser(user as User);
      this.router.navigate(['/reset-password'])
    }
    )
  }

  onDeleteList(){
    document.body.classList.remove('modal-open');
    this.deleteList.emit();
  }
}
