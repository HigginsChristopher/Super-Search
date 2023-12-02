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
      this.listService.getPrivateLists().subscribe(response => {
        this.privateLists = response.lists
      });
    }
    this.listService.getPublicLists().subscribe(response => this.publicLists = response.lists);
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
      if (response.message) {
        this.showPopupWithError(response.message);
      } else {
        this.ngOnInit();
      }
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          // Check for specific HTTP error status codes and handle them
          this.showPopupWithError(errorResponse.error.message);
        } else {
          // Handle non-HTTP errors or display a generic error message
          this.showPopupWithError('An unexpected error occurred.');
        }
      });
  }

  createReview(review: Review) {
    this.reviewService.createReview(review).subscribe(
      (response: any) => {
        if (response.message) {
          this.showPopupWithError(response.message);
        } else {
          this.ngOnInit();
        }
      },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          // Check for specific HTTP error status codes and handle them
          this.showPopupWithError(errorResponse.error.message);
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
    this.listService.addList(list).subscribe((response) => {
      if (response.list.visibility) {
        this.publicLists.push(response.list)
      }
      this.privateLists.push(response.list)
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          // Check for specific HTTP error status codes and handle them
          this.showPopupWithError(errorResponse.error.message);
        } else {
          // Handle non-HTTP errors or display a generic error message
          this.showPopupWithError('An unexpected error occurred.');
        }
      }
    );
    this.ngOnInit();
  };

  expandList(list: List){
    // get the list based on the new superhero id list, if the list doesnt exist (visibility has changed or deleted then bring up message and refresh)
    this.heroService.displayDetails(list.superhero_ids).subscribe((response) => list.superheroes = response.heroes);
    this.reviewService.displayReviews(list.list_id).subscribe((response) => {
      list.reviews = response.reviews;
      if (list.reviews) {
        for (let review of list.reviews) {
          this.userService.getUserName(review.user_id).subscribe(response => {
            review.username = response.username
          });
        }
      }
    });
  }
}
