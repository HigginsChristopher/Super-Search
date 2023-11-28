import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { List } from '../List';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs';
import { Review } from '../Review';


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

  displayReviews(list_id: any): Observable<Review[]> {
    const url = `/api/open/reviews/${list_id}`;
    return this.http.get<Review[]>(url, httpOptions).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }


  createReview(review: any): Observable<Review[]> {
    const url = `/api/secure/lists/reviews/`
    return this.http.post<Review[]>(url, review, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

}
