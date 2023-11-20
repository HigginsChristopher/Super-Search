import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { Superhero } from '../superhero';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}

@Injectable({
  providedIn: 'root'
})
export class SuperheroService {
  private apiUrl = "http://localhost:3000/api/superheros_info"
  constructor(private http: HttpClient) {}
}
