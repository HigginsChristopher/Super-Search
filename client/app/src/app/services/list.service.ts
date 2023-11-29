import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { List } from "../List";
import { Superhero } from '../superhero';
import { User } from '../user';

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

  getPrivateLists(): Observable<List[]> {
    this.loadToken();
    const url = `/api/secure/lists/`;
    return this.http.get<List[]>(url, { headers: this.headers })
  }

  getPublicLists(): Observable<List[]> {
    const url = `/api/open/lists/`;
    return this.http.get<List[]>(url, httpOptions)
  }

  deletePrivateList(list: List): Observable<List> {
    this.loadToken();
    const url = `/api/secure/lists/${list.list_id}`;
    return this.http.delete<List>(url, { headers: this.headers })
  }

  updateList(list: List): Observable<List> {
    this.loadToken();
    const url = `/api/secure/lists/${list.list_id}`;
    return this.http.post<List>(url, list, { headers: this.headers });
  }

  addList(list: List): Observable<List> {
    this.loadToken();
    const url = `/api/secure/lists/`;
    return this.http.post<List>(url, list, { headers: this.headers });
  }
}
