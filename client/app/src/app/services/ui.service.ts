// Importing necessary modules and classes from Angular and third-party libraries
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// UiService class provides methods for managing the UI state
export class UiService {
  // Private variable to track the visibility state of the "Add List" feature
  private showAddList: boolean = false;
  // Subject for publishing changes in the "Add List" visibility state
  private subject = new Subject<any>();

  // Constructor for the service
  constructor() { }

  // Method to toggle the visibility state of the "Add List" feature
  toggleAddList(): void {
    // Invert the current state
    this.showAddList = !this.showAddList;
    // Notify subscribers about the updated state
    this.subject.next(this.showAddList);
  }

  // Method to subscribe to changes in the "Add List" visibility state
  onToggle(): Observable<any> {
    // Return an observable for subscribers to listen for changes
    return this.subject.asObservable();
  }
}
