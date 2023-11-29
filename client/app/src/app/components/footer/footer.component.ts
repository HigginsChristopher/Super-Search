import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { User } from '../../user';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.css'
})
export class FooterComponent implements OnInit {
  currentUser: User | null = null;
  constructor(private router: Router, private userService: UserService) { }
  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);
    
  }
  routeHome() {
    this.router.navigate(['/']);
  }
  hasRoute(route: string) {
    return this.router.url === route;
  }

  routeAdminMenu() {
    const currentUrl = this.router.url;
    const listsUrl = currentUrl.endsWith('/admin-menu') ? currentUrl : `${currentUrl}/admin-menu`;
    this.router.navigate([listsUrl]);
  }
}
