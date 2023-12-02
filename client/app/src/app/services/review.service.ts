import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { List } from '../List';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs';
import { Review } from '../Review';
import { User } from '../user';


const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
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

  displayReviews(list_id: any): Observable<any> {
    const url = `/api/open/reviews/${list_id}`;
    return this.http.get<any>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }


  createReview(review: any): Observable<any> {
    this.loadToken();
    const url = `/api/secure/lists/reviews/`
    return this.http.post<any>(url, {review: review}, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  flagReview(review_id: any): Observable<any> {
    this.loadToken();
    const url = `/api/admin/reviews/flag/${review_id}`
    return this.http.post<any>(url, null, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  getReviews(): Observable<any> {
    this.loadToken();
    const url = `/api/admin/reviews/`
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
