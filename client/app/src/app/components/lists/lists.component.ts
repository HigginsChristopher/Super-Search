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
      this.ngOnInit();

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
  };

  expandList(list: List) {

    // get the list based on the new superhero id list
    this.listService.getList(list.list_id).subscribe(
      (response) => {
        response = response.list

        list.superhero_ids = response.superhero_ids;
        list.description = response.description;
        list["list-name"] = response["list-name"];


        // Fetch superhero details
        this.heroService.displayDetails(response.superhero_ids).subscribe(
          (heroResponse) => {
            list.superheroes = heroResponse.heroes;

            // Fetch reviews
            this.reviewService.displayReviews(response.list_id).subscribe(
              (reviewResponse) => {
                if (reviewResponse.reviews) {
                  for (const review of reviewResponse.reviews) {
                    review.formattedDateTime = this.timestampToDate(review.created);
                  }
                }
                list.reviews = reviewResponse.reviews;

                // Update usernames in reviews
                if (list.reviews) {
                  for (let review of list.reviews) {
                    this.userService.getUserName(review.user_id).subscribe(
                      (usernameResponse) => {
                        review.username = usernameResponse.username;
                      },
                      (error) => {
                        console.error("Error fetching username:", error);
                      }
                    );
                  }
                }
              },
              (error) => {
                console.error("Error fetching reviews:", error);
              }
            );
          },
          (error) => {
            console.error("Error fetching superhero details:", error);
          }
        );
      },
      (error) => {
        this.showPopupWithError(error.error.message);
        this.ngOnInit();
      }
    );
  }

  timestampToDate(timestamp: any): string {
    // Create a new Date object and pass the timestamp as an argument
    const date = new Date(timestamp);
    // Use various methods of the Date object to extract different components of the date
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Months are zero-based, so add 1
    const day = date.getDate();
    const hours = date.getHours().toString().padStart(2, '0'); // Ensure leading zero
    const minutes = date.getMinutes().toString().padStart(2, '0'); // Ensure leading zero
    const seconds = date.getSeconds().toString().padStart(2, '0'); // Ensure leading zero

    // Format the components using toLocaleString
    return `${month}/${day}/${year} ${hours}:${minutes}:${seconds}`;
  }
}
