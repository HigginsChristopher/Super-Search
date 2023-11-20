import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable} from 'rxjs';
import { List } from "../List";
import { Superhero } from '../superhero';

const httpOptions = {
  headers: new HttpHeaders({
    "Content-Type": "application/json"
  })
}

@Injectable({
  providedIn: 'root'
})
export class ListService {
  private apiUrl = "http://localhost:3000/api/lists"

  constructor(private http: HttpClient) {}

  getLists(): Observable<List[]> {
    return this.http.get<List[]>(this.apiUrl)
  }

  deleteList(list: List): Observable<List>{
    const url = `${this.apiUrl}/${list.id}`;
    return this.http.delete<List>(url);
  }

  updateList(list: List): Observable<List>{
    const url = `${this.apiUrl}/${list.id}`;
    return this.http.post<List>(url,list,httpOptions);
  }

  addList(list: List): Observable<List>{
    const url = `${this.apiUrl}`;
    return this.http.post<List>(url,list,httpOptions);
  }

  displayDetails(list: List): Observable<Superhero[]>{
    const url = `${this.apiUrl}/details?id_list=[${list.superhero_ids}]`;
    return this.http.get<Superhero[]>(url);
  }
}
