import { Injectable } from '@angular/core';
import { Superhero } from '../superhero';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}
@Injectable({
  providedIn: 'root'
})
export class HeroService {

  constructor(private http: HttpClient) { }

  displayDetails(list: any): Observable<Superhero[]> {
    const url = `/api/open/superheros_info?id_list=[${list}]`;
    return this.http.get<Superhero[]>(url, httpOptions);
  }

  matchSearch(filters: any): Observable<Superhero[]> {
    const url = `/api/open/superheros_info/match`;
    return this.http.post<Superhero[]>(url, { filters: filters }, httpOptions);
  }
}
