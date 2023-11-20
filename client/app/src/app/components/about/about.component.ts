import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrl: './about.component.css'
})
export class AboutComponent implements OnInit{
  constructor(private titleService: TitleService){}
  ngOnInit(): void {
    this.titleService.setTitle('About Page');
  }
}
