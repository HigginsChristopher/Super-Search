import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { List } from "../List";
import { Superhero } from '../superhero';
import { User } from '../user';
import { Observable, throwError, catchError } from 'rxjs';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}
@Injectable({
  providedIn: 'root'
})
export class ListService {
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

  getPrivateLists(): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  getPublicLists(): Observable<any> {
    const url = `/api/open/lists/`;
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  deletePrivateList(list: List): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/${list.list_id}`;
    return this.http.delete<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  updateList(list: List): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/${list.list_id}`;
    return this.http.post<any>(url, { list: list }, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

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
