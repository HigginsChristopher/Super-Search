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
  currentUser: User | null = null;

  constructor(private userService: UserService, private uiService: UiService, private router: Router, private titleService: TitleService) {
    this.subscription = this.uiService.onToggle().subscribe(value => this.showAddList = value);
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.updateTitle();
    this.showAddList = false;
  }
  updateTitle() {
    this.titleService.currentTitle$.subscribe((title) => {
      if (this.currentUser) {
        if (this.hasRoute("/")) {
          this.title = `SuperSearch - Homepage`;
        }
        else {
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
    this.router.navigate(["/login"]);
  }

  routeLists() {
    this.router.navigate(["/lists"]);
  }

  routeHero() {
    this.router.navigate(['/hero-search']);
  }

  routeAccount(){
    this.router.navigate(["/account"]);
  }

}
