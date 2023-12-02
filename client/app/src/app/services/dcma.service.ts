// Importing necessary modules and classes from Angular and third-party libraries
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Entry } from '../Entry';

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// DcmaService class provides methods for interacting with the server related to DCMA entries
export class DcmaService {
  // Declaration and initialization of private variables for JWT token and HttpHeaders
  private jwtToken: string | null | undefined = null;
  private headers!: HttpHeaders;

  // Constructor to inject the HttpClient service for making HTTP requests
  constructor(private http: HttpClient) {
    // Initializing the service by loading the JWT token and setting up HttpHeaders
    this.loadToken();
  }

  // Private method to load the JWT token from local storage and set up HttpHeaders
  private loadToken() {
    // Retrieving the JWT token from local storage
    let token = localStorage.getItem('token');
    // Parsing the token or setting it to null if it doesn't exist
    this.jwtToken = token ? JSON.parse(token) : null;
    // Setting up HttpHeaders with the JWT token and content type
    this.headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.jwtToken}`)
      .set('Content-Type', 'application/json');
  }

  // Method to retrieve DCMA entries from the server
  getEntries(): Observable<any> {
    // Reloading the token and constructing the URL
    this.loadToken();
    const url = `/api/admin/dcma/`;
    // Making a GET request to the server with HttpHeaders
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      // Handling errors and returning an observable with the error
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to create a new DCMA entry on the server
  createEntry(entry: Entry): Observable<any> {
    // Reloading the token and constructing the URL
    this.loadToken();
    const url = `/api/admin/dcma/`;
    // Making a POST request to the server with the new entry and HttpHeaders
    return this.http.post<any>(url, { dcma: entry }, { headers: this.headers }).pipe(
      // Handling errors and returning an observable with the error
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to update an existing DCMA entry on the server
  updateEntry(entry: Entry): Observable<any> {
    // Reloading the token and constructing the URL
    this.loadToken();
    const url = `/api/admin/dcma/${entry.claim_id}`;
    // Making a POST request to the server with the updated entry and HttpHeaders
    return this.http.post<any>(url, { dcma: entry }, { headers: this.headers }).pipe(
      // Handling errors and returning an observable with the error
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
