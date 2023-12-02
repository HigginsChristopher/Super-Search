import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, catchError } from 'rxjs';
import { Entry } from '../Entry';


const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}
@Injectable({
  providedIn: 'root'
})
export class DcmaService {
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

  getEntries(): Observable<any> {
    this.loadToken();
    const url = `/api/admin/dcma/`;
    return this.http.get<any>(url, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  createEntry(entry: Entry): Observable<any> {
    this.loadToken();
    const url = `/api/admin/dcma/`;
    return this.http.post<any>(url, { dcma: entry }, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }

  updateEntry(entry: Entry): Observable<any> {
    this.loadToken();
    const url = `/api/admin/dcma/${entry.claim_id}`;
    return this.http.post<any>(url, { dcma: entry }, { headers: this.headers }).pipe(
      catchError((error: any) => {
        return throwError(() => error);
      })
    );
  }
}
