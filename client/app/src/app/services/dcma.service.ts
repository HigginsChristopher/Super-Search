import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { List } from "../List";
import { Superhero } from '../superhero';
import { User } from '../user';
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

  getEntries(): Observable<Entry[]> {
    this.loadToken();
    const url = `/api/admin/dcma/`;
    return this.http.get<Entry[]>(url, { headers: this.headers })
  }

  createEntry(entry: Entry): Observable<Entry> {
    this.loadToken();
    const url = `/api/admin/dcma/`;
    return this.http.post<Entry>(url, { dcma: entry }, { headers: this.headers })
  }

  updateEntry(entry: Entry): Observable<Entry> {
    this.loadToken();
    const url = `/api/admin/dcma/${entry.claim_id}`;
    return this.http.post<Entry>(url, { dcma: entry }, { headers: this.headers })
  }
}
