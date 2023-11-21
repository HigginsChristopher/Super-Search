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
  private apiUrl = "http://localhost:3000/api/"

  constructor(private http: HttpClient) { }

  getLists(): Observable<List[]> {
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}').currentUser;
    const jwtToken = currentUser ? currentUser.jwtToken : null;

    const headers = new HttpHeaders().set('Authorization', `${jwtToken}`);

    return this.http.get<List[]>(`${this.apiUrl}secure/lists`, { headers })
  }

  deleteList(list: List): Observable<List> {
    // Get your JWT token from wherever it's stored (e.g., localStorage)
    const jwtToken = localStorage.getItem('jwtToken');

    // Set up the headers with the authorization token
    const headers = new HttpHeaders().set('Authorization', `Bearer ${jwtToken}`);

    const url = `${this.apiUrl}/${list.id}`;
    // Make the request with the headers
    return this.http.delete<List>(url, { headers });
  }

  updateList(list: List): Observable<List> {
    const url = `${this.apiUrl}/${list.id}`;
    return this.http.post<List>(url, list, httpOptions);
  }

  addList(list: List): Observable<List> {
    const url = `${this.apiUrl}`;
    return this.http.post<List>(url, list, httpOptions);
  }

  displayDetails(list: List): Observable<Superhero[]> {
    const url = `${this.apiUrl}/details?id_list=[${list.superhero_ids}]`;
    return this.http.get<Superhero[]>(url);
  }
}
