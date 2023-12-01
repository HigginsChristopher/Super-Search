import { Component, OnInit } from '@angular/core';
import { TitleService } from './services/title.service';
import { Router } from '@angular/router';
import { UserService } from './services/user.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private titleService: TitleService, private router: Router, private userService: UserService) { }

  ngOnInit(): void {
    this.titleService.setTitle("SuperSearch - Homepage");

    const token = JSON.parse(localStorage.getItem('token')!);
    const currentUser = JSON.parse(localStorage.getItem('userData')!);

    if (!token || !currentUser) {
      return;
    }

    // Check if the token is expired
    const isTokenExpired = this.isTokenExpired(token);

    if (isTokenExpired) {
      // Token is expired, log out the user
      this.logout();
    } else {
      // Token is not expired, set the user
      this.userService.setUser(currentUser);
    }
  }

  isTokenExpired(token: string): boolean {
    const decodedToken: any = jwtDecode(token);

    // Check if the current time is greater than the token's expiration time
    return decodedToken.exp * 1000 < Date.now();
  }

  logout() {
    this.userService.setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    this.router.navigate(['/']);
  }

  hasRoute(route: string) {
    return this.router.url === route;
  }

}
