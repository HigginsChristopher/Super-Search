import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private titleSubject = new BehaviorSubject<string>('SuperSearch - Homepage');
  currentTitle$ = this.titleSubject.asObservable();

  constructor(private router: Router) {
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.setTitle('SuperSearch - Homepage');
    });
  }

  setTitle(title: string) {
    this.titleSubject.next(title);
  }
}
