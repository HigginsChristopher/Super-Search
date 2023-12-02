import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  resetForm!: FormGroup;
  currentUser: User | null = null;
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  constructor(
    private fb: FormBuilder,
    private titleService: TitleService,
    private userService: UserService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.titleService.setTitle("Reset-Password");
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);

  }
  initForm() {
    this.resetForm = this.fb.group({
      newPassword: ['', [Validators.required]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator // custom validator for password match
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')!.value === g.get('confirmPassword')!.value
      ? null : { 'mismatch': true };
  }
  onSubmit() {
    if (this.resetForm.valid) {
      // Perform password reset logic here
      const newPassword = this.resetForm.value.newPassword;
      this.userService.updatePassword(newPassword).subscribe(response => {
        this.showPopupWithError(response.message)
      })
      this.resetForm.reset({
        newPassword: "",
        confirmPassword: ""
      });
    } else {
      // Form is not valid, handle accordingly
    }
  }

  // Call this function when you want to show the error popup
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }
  onClosePopup() {
    this.showErrorPopup = false;
  }
}
