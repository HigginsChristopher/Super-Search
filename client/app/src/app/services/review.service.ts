// Importing necessary modules and classes from Angular and third-party libraries
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// HttpHeaders configuration for HTTP requests
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// ReviewService class provides methods for interacting with the server related to reviews
export class ReviewService {
  // JWT token for authentication
  private jwtToken: string | null | undefined = null;
  // HttpHeaders for setting authorization and content type
  private headers!: HttpHeaders;

  // Constructor to inject the HttpClient service for making HTTP requests
  constructor(private http: HttpClient) {
    // Load the JWT token and initialize HttpHeaders
    this.loadToken();
  }

  // Private method to load the JWT token from localStorage
  private loadToken() {
    // Retrieve the JWT token from localStorage
    let token = localStorage.getItem('token');
    // Set the JWT token or null if it's not available
    this.jwtToken = token ? JSON.parse(token) : null;
    // Initialize HttpHeaders with authorization and content type
    this.headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.jwtToken}`)
      .set('Content-Type', 'application/json');
  }

  // Get reviews for a specific list by list_id
  displayReviews(list_id: any): Observable<any> {
    const url = `/api/open/reviews/${list_id}`;
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Create a new review for a list
  createReview(review: any): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/reviews/`
    return this.http.post<any>(url, { review: review }, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Flag a review for administrative review
  flagReview(review_id: any): Observable<any> {
    this.loadToken();
    const url = `/api/admin/reviews/flag/${review_id}`
    return this.http.post<any>(url, null, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Get all reviews for administrative purposes
  getReviews(): Observable<any> {
    this.loadToken();
    const url = `/api/admin/reviews/`
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
