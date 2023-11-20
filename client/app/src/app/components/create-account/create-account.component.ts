import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../user';

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
    const email = this.createAccountForm.get('email')?.value;
    const password = this.createAccountForm.get('password')?.value;
    const nickname = this.createAccountForm.get('nickname')?.value;

    if (email !== null && password !== null && nickname !== null) {
      console.log("here");
      const newUser: User = {
        username: nickname,
        password: password,
        email: email,
        activated: false,
      };
      this.userService.registerUser(newUser).subscribe(
        (response: any) => {
          this.createdUser = response.user;
          this.registrationSuccess = true;
          this.createMockEmail();
        },
        (error) => {
          console.error('Error creating user:', error);
        }
      );
    } else {
      // Form is invalid, display error messages or handle accordingly
    }
  }

  ngOnInit(): void {
    this.titleService.setTitle('Create Account');
  }

  resendVerification() {
    if (this.createdUser) {
      this.createMockEmail("Resent account confirmation. ")
    }
  }

  createMockEmail(string=""): void {
    const url = `http://localhost:3000/api/verify?token=${this.createdUser?.verificationToken}`
    this.mockEmail = `
      Mock Email:
      From: Do Not Reply <myEmail@myService.myDomain>
      To: <${this.createdUser?.email}>
      Subject: ${string}Please confirm account for SE3316 Lab 4
      Text: Please confirm your account by clicking the following link: 
      ${url}
    `
  }
}