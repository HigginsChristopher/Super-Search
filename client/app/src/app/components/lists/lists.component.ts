// Import Angular core modules and services
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
import { UtilityService } from '../../services/utility.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css'
})
export class ListsComponent implements OnInit {
  // Arrays to store private and public lists
  privateLists: List[] = [];
  publicLists: List[] = [];

  // Current user information
  currentUser: User | null = null;

  // Flags for error handling
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  // Constructor with dependency injection
  constructor(
    private listService: ListService,
    private titleService: TitleService,
    private userService: UserService,
    private heroService: HeroService,
    private reviewService: ReviewService,
    private utilityService: UtilityService
  ) { }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Fetch current user information
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });

    // Set the title of the page
    this.titleService.setTitle('List Manager');

    // Fetch private and public lists based on the current user
    if (this.currentUser) {
      this.listService.getPrivateLists().subscribe(response => {
        this.privateLists = response.lists;
      },
        (errorResponse: any) => {
          if (errorResponse instanceof HttpErrorResponse) {
            this.showPopupWithError(errorResponse.error.message);
          } else {
            this.showPopupWithError('An unexpected error occurred.');
          }
        });
    }
    this.listService.getPublicLists().subscribe(response => { this.publicLists = response.lists },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          this.showPopupWithError(errorResponse.error.message);
        } else {
          this.showPopupWithError('An unexpected error occurred.');
        }
      });
  }

  // Method to delete a private list
  deleteList(list: any) {
    this.listService.deletePrivateList(list).subscribe(() => { this.privateLists = this.privateLists.filter(l => l.list_id !== list.list_id) },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          this.showPopupWithError(errorResponse.error.message);
        } else {
          this.showPopupWithError('An unexpected error occurred.');
        }
      });
    this.ngOnInit();
  }

  // Method to toggle the visibility of a list
  toggleList(list: any) {
    list.visibility = !list.visibility;
    this.updateList(list);
  }

  // Method to update a list
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
          this.showPopupWithError(errorResponse.error.message);
        } else {
          this.showPopupWithError('An unexpected error occurred.');
        }
      });
  }

  // Method to create a review
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
          this.showPopupWithError(errorResponse.error.message);
        } else {
          this.showPopupWithError('An unexpected error occurred.');
        }
      }
    );
  }

  // Method to display an error popup with a message
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  // Method to close the error popup
  onClosePopup() {
    this.showErrorPopup = false;
  }

  // Method to add a new list
  addList(list: any) {
    this.listService.addList(list).subscribe((response) => {
      if (response.list.visibility) {
        this.publicLists.push(response.list);
      }
      this.privateLists.push(response.list);
      this.ngOnInit();
    },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          this.showPopupWithError(errorResponse.error.message);
        } else {
          this.showPopupWithError('An unexpected error occurred.');
        }
      });
  };

  // Method to expand a list and fetch additional details
  expandList(list: List) {
    this.listService.getList(list.list_id).subscribe(
      (response) => {
        response = response.list;

        // Update list properties with details
        list.superhero_ids = response.superhero_ids;
        list.description = response.description;
        list["list-name"] = response["list-name"];

        // Fetch superhero details
        this.heroService.displayDetails(response.superhero_ids).subscribe(
          (heroResponse) => {
            list.superheroes = heroResponse.heroes;

            // Fetch reviews for the list
            this.reviewService.displayReviews(response.list_id).subscribe(
              (reviewResponse) => {
                if (reviewResponse.reviews) {
                  for (const review of reviewResponse.reviews) {
                    review.formattedDateTime = this.utilityService.timestampToDate(review.created);
                  }
                }
                list.reviews = reviewResponse.reviews;

                // Fetch usernames for reviews
                if (list.reviews) {
                  for (let review of list.reviews) {
                    this.userService.getUserName(review.user_id).subscribe(
                      (usernameResponse) => {
                        review.username = usernameResponse.username;
                      },
                      (errorResponse: any) => {
                        if (errorResponse instanceof HttpErrorResponse) {
                          this.showPopupWithError(errorResponse.error.message);
                        } else {
                          this.showPopupWithError('An unexpected error occurred.');
                        }
                      }
                    );
                  }
                }
              },
              (errorResponse: any) => {
                if (errorResponse instanceof HttpErrorResponse) {
                  this.showPopupWithError(errorResponse.error.message);
                } else {
                  this.showPopupWithError('An unexpected error occurred.');
                }
              }
            );
          },
          (errorResponse: any) => {
            if (errorResponse instanceof HttpErrorResponse) {
              this.showPopupWithError(errorResponse.error.message);
            } else {
              this.showPopupWithError('An unexpected error occurred.');
            }
          }
        );
      },
      (errorResponse: any) => {
        if (errorResponse instanceof HttpErrorResponse) {
          this.showPopupWithError(errorResponse.error.message);
        } else {
          this.showPopupWithError('An unexpected error occurred.');
        }
        this.ngOnInit();
      }
    );
  }
}
