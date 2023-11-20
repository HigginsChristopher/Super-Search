import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  private showAddList: boolean = false;
  private subject = new Subject<any>();
  constructor() { }

  toggleAddList(): void{
    this.showAddList = !this.showAddList;
    this.subject.next(this.showAddList);
  }

  onToggle(): Observable<any> {
    return this.subject.asObservable();
  }
}
