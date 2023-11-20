import { Component, Input, OnInit } from '@angular/core';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  @Input() title: string = "";
  showAddList: boolean = false;
  subscription: Subscription = new Subscription();
  userDetails$ = this.userService.user$;
  user: User | null = null;

  constructor(private userService: UserService, private uiService: UiService, private router: Router, private titleService: TitleService) {
    this.subscription = this.uiService.onToggle().subscribe(value => this.showAddList = value);
  }

  ngOnInit(): void {
    this.userDetails$.subscribe((user) => {
      this.user = user;
    });
    this.updateTitle();
  }
  updateTitle(){
    this.titleService.currentTitle$.subscribe((title) => {
      if (this.user) {
        if(this.hasRoute("/")){
          this.title = `${title} - Welcome back ${this.user.username}!`;
          console.log("here 2")
        }
        else{
          this.title = title;
        }
      }
      else {
        this.title = title;
      }
    });
  }
  toggleAddList() {
    this.uiService.toggleAddList();
  }

  hasRoute(route: string) {
    return this.router.url === route;
  }

  routeLogin() {
    const currentUrl = this.router.url;
    const listsUrl = currentUrl.endsWith('/login') ? currentUrl : `${currentUrl}/login`;
    this.router.navigate([listsUrl]);
  }

  routeLists() {
    const currentUrl = this.router.url;
    const listsUrl = currentUrl.endsWith('/lists') ? currentUrl : `${currentUrl}/lists`;
    this.router.navigate([listsUrl]);
  }

  routeHero() {
    const currentUrl = this.router.url;
    const listsUrl = currentUrl.endsWith('/hero-search') ? currentUrl : `${currentUrl}/hero-search`;
    this.router.navigate([listsUrl]);
  }
  routeLogout(){
    this.user = null;
    localStorage.setItem('currentUser', "");
    this.updateTitle();
  }
}
