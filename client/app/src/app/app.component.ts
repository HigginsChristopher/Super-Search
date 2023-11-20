import { Component, OnInit } from '@angular/core';
import { TitleService } from './services/title.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  constructor(private titleService: TitleService, private router: Router) { }
  
  ngOnInit(): void {
    this.titleService.setTitle("Homepage");
  }
  
  hasRoute(route: string) {
    return this.router.url === route;
  }

  routeHome() {
    this.router.navigate(['/']);
  }
}
