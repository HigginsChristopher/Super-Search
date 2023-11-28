import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../user';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}
@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  public user$: Observable<User | null> = this.userSubject.asObservable();
  private jwtToken: string | null | undefined = null;
  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    let token = localStorage.getItem('token');
    token = token ? JSON.parse(token) : null;
    this.jwtToken = token

    // Initialize headers with the authorization token
    this.headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.jwtToken}`)
      .set('Content-Type', 'application/json');
  }

  registerUser(user: User): Observable<User> {
    const url = `/api/open/users/register`;
    return this.http.post<User>(url, user, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  loginUser(user: any): Observable<User> {
    const url = `/api/open/users/login`;
    return this.http.post<User>(url, user, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  setUser(user: User | null): void {
    this.userSubject.next(user);
  }

  getCurrentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  verifyUser(verificationToken: string): Observable<any> {
    const url = `/api/open/users/verify?token=${verificationToken}`
    return this.http.get<any>(url);
  }

  getUserName(userId: any): Observable<any> {
    const url = `/api/open/users/${userId}`
    return this.http.get<any>(url);
  }

  resendVerification(user: any): Observable<any> {
    const url = `/api/open/users/verify/resend`
    return this.http.post<any>(url,user);
  }

  getAllUserInfo(): Observable<User[]>{
    const url = `/api/admin/users`;
    return this.http.get<User[]>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  disableUser(user: User): Observable<User>{
    const url = `/api/admin/users/disable/${user.user_id}`;
    return this.http.post<User>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  adminUser(user: User): Observable<User>{
    const url = `/api/owner/users/admin/${user.user_id}`;
    return this.http.post<User>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
