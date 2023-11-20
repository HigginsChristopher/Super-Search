// login.component.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  user: User | null = null;


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
          const currentUser = response.user;
          this.user = response.user;
          localStorage.setItem('currentUser', JSON.stringify({currentUser}));
          this.userService.setUser(this.user);
          this.router.navigate(['/']);
        },
        (error) => {
          console.error('Error logging into user:', error);
        }
      );
    } else {
    }
  }
}