import { Injectable } from '@angular/core';
import { Superhero } from '../superhero';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';

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

  displayDetails(list: any): Observable<any> {
    const url = `/api/open/superheros_info?id_list=[${list}]`;
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  matchSearch(filters: any): Observable<any> {
    const url = `/api/open/superheros_info/match`;
    return this.http.post<any>(url, { filters: filters }, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
