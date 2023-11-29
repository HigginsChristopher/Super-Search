// admin-menu.component.ts
import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { User } from '../../user';
import { UserService } from '../../services/user.service';
import { TitleService } from '../../services/title.service';
import { IconDefinition, faFlag } from "@fortawesome/free-solid-svg-icons";
import { faUser as faUserSolid } from '@fortawesome/free-solid-svg-icons';
import { faUser as faUserHollow } from '@fortawesome/free-regular-svg-icons';
import { Review } from '../../Review';
import { ReviewService } from '../../services/review.service';

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

  constructor(private userService: UserService, private titleService: TitleService, private reviewService: ReviewService) { }

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
    user.disabled = !user.disabled
    this.userService.disableUser(user).subscribe();
  }

  flagReview(review: Review) {
    review.hidden = !review.hidden;
    this.reviewService.flagReview(review).subscribe()
  }

  toggleAdminStatus(user: User): void {
    user.userType = user.userType === 'admin' ? 'user' : 'admin';
    this.userService.adminUser(user).subscribe();
  }

  getAdminIcon(user: User): IconDefinition {
    return user.userType === 'admin' ? faUserSolid : faUserHollow;
  }

}