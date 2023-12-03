// Importing necessary modules and services from Angular
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, catchError } from 'rxjs';

// Injectable decorator to make the service injectable throughout the application
@Injectable({
  providedIn: 'root'
})
// FileService class handles file-related operations
export class FileService {
  // Variables to store JWT token and headers
  private jwtToken: string | null | undefined = null;
  private headers!: HttpHeaders;

  // Constructor for the service, injecting HttpClient
  constructor(private http: HttpClient) { }

  // Private method to load the JWT token from localStorage and set headers
  private loadToken() {
    let token = localStorage.getItem('token');
    this.jwtToken = token ? JSON.parse(token) : null;
    this.headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.jwtToken}`);
  }

  // Method to upload a file using a secure API endpoint
  uploadFile(formData: FormData): Observable<any> {
    // Load the JWT token and set headers
    this.loadToken();
    // Define the API endpoint for file upload
    const url = `/api/secure/policies/`;
    // Perform a POST request to upload the file with the specified headers
    return this.http.post<any>(url, formData, { headers: this.headers }).pipe(
      // Catch any errors that occur during the HTTP request
      catchError((error: any) => {
        // Return the error as an observable
        return throwError(() => error);
      })
    );
  }
}
