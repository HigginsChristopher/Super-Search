// Importing necessary modules and classes from Angular and third-party libraries
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../user';
import { BehaviorSubject, Observable, throwError, catchError } from 'rxjs';

// HTTP options for setting content type
const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}

// Injectable decorator marks the class as a service that can be injected into other components or services
@Injectable({
  providedIn: 'root'
})
// UserService class provides methods for user-related operations
export class UserService {
  // BehaviorSubject for publishing changes in the current user state
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  // Observable for subscribers to listen for changes in the current user state
  public user$: Observable<User | null> = this.userSubject.asObservable();
  // JWT token and headers for making authenticated API requests
  private jwtToken: string | null | undefined = null;
  private headers!: HttpHeaders;

  // Constructor for the service
  constructor(private http: HttpClient) {
    this.loadToken();
  }

  // Method to load the JWT token from local storage and set headers
  private loadToken() {
    let token = localStorage.getItem('token');
    this.jwtToken = token ? JSON.parse(token) : null;
    this.headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.jwtToken}`)
      .set('Content-Type', 'application/json');
  }

  // Method to set the current user state
  setUser(user: User | null): void {
    this.userSubject.next(user);
  }

  // Method to get the current user state as an observable
  getCurrentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  // Method to register a new user
  registerUser(user: User): Observable<any> {
    const url = `/api/open/users/register`;
    return this.http.post<any>(url, { user: user }, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to log in a user
  loginUser(user: any): Observable<any> {
    const url = `/api/open/users/login`;
    return this.http.post<any>(url, { user: user }, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to verify a user's email
  verifyUser(verificationToken: string): Observable<any> {
    const url = `/api/open/users/verify?token=${verificationToken}`
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to get a username by user ID
  getUserName(userId: any): Observable<any> {
    const url = `/api/open/users/${userId}`
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to resend email verification
  resendVerification(user: any): Observable<any> {
    const url = `/api/open/users/verify/resend`
    return this.http.post<any>(url, user, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to get information about all users (admin)
  getAllUserInfo(): Observable<any> {
    this.loadToken();
    const url = `/api/admin/users`;
    return this.http.get<any[]>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to disable a user (admin)
  disableUser(user: any): Observable<any> {
    this.loadToken();
    const url = `/api/admin/users/disable/${user.id}`;
    return this.http.post<any>(url, null, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to grant admin privileges to a user (owner)
  adminUser(user: any): Observable<any> {
    this.loadToken();
    const url = `/api/owner/users/admin/${user.id}`;
    return this.http.post<any>(url, null, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method for initiating the forgot password process
  forgotPassword(user: User): Observable<any> {
    const url = `/api/open/users/recovery`
    return this.http.post<any>(url, { email: user.email }, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  // Method to update the user's password
  updatePassword(password: string): Observable<any> {
    this.loadToken();
    const url = `/api/secure/users/password/`
    return this.http.post<any>(url, { password: password }, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
