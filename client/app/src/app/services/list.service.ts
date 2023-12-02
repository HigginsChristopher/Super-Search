// Importing necessary modules and classes from Angular and third-party libraries
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { List } from "../List";
import { Observable, throwError, catchError } from 'rxjs';

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
// ListService class provides methods for interacting with the server related to lists
export class ListService {
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

  // Get details of a specific list by list_id
  getList(list_id: any): Observable<any> {
    this.loadToken();
    const url = `/api/open/lists/${list_id}`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Get private lists associated with the current user
  getPrivateLists(): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Get public lists available to all users
  getPublicLists(): Observable<any> {
    const url = `/api/open/lists/`;
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Delete a private list
  deletePrivateList(list: List): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/${list.list_id}`;
    return this.http.delete<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Update an existing list
  updateList(list: List): Observable<any> {
    const newlist = structuredClone(list)
    delete newlist.rating;
    delete newlist.username;
    delete newlist.superheroes;
    delete newlist.modified;
    this.loadToken();
    const url = `/api/secure/lists/${newlist.list_id}`;
    return this.http.post<any>(url, { list: newlist }, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Add a new list
  addList(list: List): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/`;
    return this.http.post<any>(url, { list: list }, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
