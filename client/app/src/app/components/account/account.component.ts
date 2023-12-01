import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { TitleService } from '../../services/title.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-account',
  templateUrl: './account.component.html',
  styleUrl: './account.component.css'
})
export class AccountComponent implements OnInit {
  constructor(
    private userService: UserService,
    private titleService: TitleService,
    private router: Router
  ) { }

  routeLogout() {
    this.userService.setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    this.router.navigate(["/"]);
  }

  ngOnInit(): void {
    this.titleService.setTitle("Account Settings");
  }

  routeResetPassword(): void {
    this.router.navigate(["/reset-password"]);
  }
}
