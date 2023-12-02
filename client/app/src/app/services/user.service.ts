import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../user';
import { BehaviorSubject, Observable, throwError, catchError} from 'rxjs';

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
  private headers!: HttpHeaders;

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  private loadToken() {
    let token = localStorage.getItem('token');
    this.jwtToken = token ? JSON.parse(token) : null;
    this.headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.jwtToken}`)
      .set('Content-Type', 'application/json');
  }

  setUser(user: User | null): void {
    this.userSubject.next(user);
  }

  getCurrentUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  registerUser(user: User): Observable<any> {
    const url = `/api/open/users/register`;
    return this.http.post<any>(url, { user: user }, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  loginUser(user: any): Observable<any> {
    const url = `/api/open/users/login`;
    return this.http.post<any>(url, { user: user }, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  verifyUser(verificationToken: string): Observable<any> {
    const url = `/api/open/users/verify?token=${verificationToken}`
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  getUserName(userId: any): Observable<any> {
    const url = `/api/open/users/${userId}`
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  resendVerification(user: any): Observable<any> {
    const url = `/api/open/users/verify/resend`
    return this.http.post<any>(url, user, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  getAllUserInfo(): Observable<any> {
    this.loadToken();
    const url = `/api/admin/users`;
    return this.http.get<any[]>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  disableUser(user: any): Observable<any> {
    this.loadToken();
    const url = `/api/admin/users/disable/${user.id}`;
    return this.http.post<any>(url, null, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  adminUser(user: any): Observable<any> {
    this.loadToken();
    const url = `/api/owner/users/admin/${user.id}`;
    return this.http.post<any>(url, null, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  forgotPassword(user: User): Observable<any> {
    const url = `/api/open/users/recovery`
    return this.http.post<any>(url, { email: user.email }, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

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
