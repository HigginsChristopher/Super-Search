// admin-menu.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { User } from '../../user';
import { UserService } from '../../services/user.service';
import { TitleService } from '../../services/title.service';
import { IconDefinition, faFlag } from "@fortawesome/free-solid-svg-icons";
import { faUser as faUserSolid } from '@fortawesome/free-solid-svg-icons';
import { faUser as faUserHollow } from '@fortawesome/free-regular-svg-icons';
import { Review } from '../../Review';

@Component({
  selector: 'app-admin-menu',
  templateUrl: './admin-menu.component.html',
  styleUrls: ['./admin-menu.component.css']
})
export class AdminMenuComponent implements OnInit {
  @Output() menuItemSelected: EventEmitter<string> = new EventEmitter<string>();
  currentUser: User | null = null;
  faTimes = faFlag;
  faUserSolid = faUserSolid;
  faUserHollow = faUserHollow;
  users: User[] | null = null;

  constructor(private userService: UserService, private titleService: TitleService) { }

  ngOnInit(): void {
    this.titleService.setTitle('Admin Menu');
    this.userService.getAllUserInfo().subscribe(users => {
      this.users = users
    });
    this.userService.getCurrentUser().subscribe(user => this.currentUser = user);
  }

  toggleReviews(user: User) {
    user.showReviews = !user.showReviews;
  }

  flagUser(user: User) {
    console.log(`Flagging user: ${user.username}`);
    user.disabled = !user.disabled
    this.userService.disableUser(user).subscribe();
  }

  flagReview(user: User, review: Review) {
    review.hidden = !review.hidden;
    console.log(`Flagging review (ID: ${review.review_id}) for user: ${user.username}`);
  }

  toggleAdminStatus(user: User): void {
    user.userType = user.userType === 'admin' ? 'user' : 'admin';
    this.userService.adminUser(user).subscribe();
  }

  getAdminIcon(user: User): IconDefinition {
    return user.userType === 'admin' ? faUserSolid : faUserHollow;
  }

 

}