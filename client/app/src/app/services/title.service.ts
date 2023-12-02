// Importing necessary modules and classes from Angular and third-party libraries
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// TitleService class provides methods for managing the application title
export class TitleService {
  // BehaviorSubject for maintaining the current title state
  private titleSubject = new BehaviorSubject<string>('SuperSearch - Homepage');
  // Observable that other components can subscribe to for receiving title updates
  currentTitle$ = this.titleSubject.asObservable();

  // Constructor to inject the Router service for handling navigation events
  constructor(private router: Router) {
    // Subscribe to the router events, filter only the NavigationEnd events, and update the title accordingly
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.setTitle('SuperSearch - Homepage');
    });
  }

  // Method to set the application title
  setTitle(title: string) {
    // Update the BehaviorSubject with the new title
    this.titleSubject.next(title);
  }
}
