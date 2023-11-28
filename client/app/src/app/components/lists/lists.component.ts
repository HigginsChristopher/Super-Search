import { Component, OnInit } from '@angular/core';
import { ListService } from "../../services/list.service"
import { List } from "../../List";
import { TitleService } from '../../services/title.service';
import { UserService } from '../../services/user.service';
import { User } from '../../user';
import { HttpErrorResponse } from '@angular/common/http';
import { HeroService } from '../../services/hero.service';
import { ReviewService } from '../../services/review.service';
import { Review } from '../../Review';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css'
})
export class ListsComponent implements OnInit {
  privateLists: List[] = [];
  publicLists: List[] = [];
  currentUser: User | null = null;
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  constructor(
    private listService: ListService,
    private titleService: TitleService,
    private userService: UserService,
    private heroService: HeroService,
    private reviewService: ReviewService
  ) {
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
    this.titleService.setTitle('List Manager');
    if (this.currentUser) {
      this.listService.getPrivateLists().subscribe((lists) => this.privateLists = lists);
    }
    this.listService.getPublicLists().subscribe((lists) => this.publicLists = lists);
  }

  deleteList(list: any) {
    this.listService.deletePrivateList(list).subscribe(() => this.privateLists = this.privateLists.filter(l => l.list_id !== list.list_id));
    this.ngOnInit();
  }

  toggleList(list: any) {
    list.visibility = !list.visibility;
    this.updateList(list);
  }

  updateList(list: List) {
    this.listService.updateList(list).subscribe((response: any) => {
      if (response?.message) {
        this.showPopupWithError(response.message);
      }
    },
      (error: any) => {
        if (error instanceof HttpErrorResponse) {
          // Check for specific HTTP error status codes and handle them
          this.showPopupWithError(error.error);
        } else {
          // Handle non-HTTP errors or display a generic error message
          this.showPopupWithError('An unexpected error occurred.');
        }
      });
    this.ngOnInit();
  }

  createReview(review: Review) {
    this.reviewService.createReview(review).subscribe(
      (response: any) => {
        if (response.message) {
          this.showPopupWithError(response.message);
        }
      },
      (error: any) => {
        if (error instanceof HttpErrorResponse) {
          // Check for specific HTTP error status codes and handle them
          this.showPopupWithError(error.error.message);
        } else {
          // Handle non-HTTP errors or display a generic error message
          this.showPopupWithError('An unexpected error occurred.');
        }
      }
    );
  }

  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }
  onClosePopup() {
    this.showErrorPopup = false;
  }

  addList(list: any) {
    this.listService.addList(list).subscribe((res) => {
      if (res.visibility) {
        this.publicLists.push(res)
      }
      this.privateLists.push(res)
    });
    this.ngOnInit();
  }
}
