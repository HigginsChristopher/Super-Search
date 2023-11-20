import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { User } from '../user';
import { BehaviorSubject, Observable } from 'rxjs';
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
  private apiUrl = "http://localhost:3000/api/"

  constructor(private http: HttpClient) { }

  registerUser(user: User): Observable<User> {
    const url = `${this.apiUrl}register`;
    return this.http.post<User>(url, user, httpOptions);
  }

  loginUser(user: any): Observable<User> {
    const url = `${this.apiUrl}login`;
    return this.http.post<User>(url, user, httpOptions);
  }

  setUser(user: User | null): void {
    this.userSubject.next(user);
  }
}
