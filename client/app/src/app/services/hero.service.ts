// Importing necessary modules and classes from Angular and third-party libraries
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';

// HTTP options for setting content type to JSON
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// HeroService class provides methods for interacting with the server related to superheroes
export class HeroService {

  // Constructor to inject the HttpClient service for making HTTP requests
  constructor(private http: HttpClient) { }

  // Method to retrieve details of superheroes based on the provided list
  displayDetails(list: any): Observable<any> {
    // Constructing the URL for the GET request with the superhero IDs
    const url = `/api/open/superheros_info?id_list=[${list}]`;
    // Making a GET request to the server with HttpHeaders
    return this.http.get<any>(url, httpOptions).pipe(
      // Handling errors and returning an observable with the error
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to search for superheroes based on the provided filters
  matchSearch(filters: any): Observable<any> {
    // Constructing the URL for the POST request for searching superheroes
    const url = `/api/open/superheros_info/match`;
    // Making a POST request to the server with filters and HttpHeaders
    return this.http.post<any>(url, { filters: filters }, httpOptions).pipe(
      // Handling errors and returning an observable with the error
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
