import { Component, OnInit } from '@angular/core';
import { ListService } from "../../services/list.service"
import { List } from "../../List";
import { TitleService } from '../../services/title.service';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrl: './lists.component.css'
})
export class ListsComponent implements OnInit {
  lists: List[] = [];
  constructor(private listService: ListService, private titleService: TitleService) { }

  ngOnInit(): void {
    this.titleService.setTitle('List Manager');
    this.listService.getLists().subscribe((lists) => this.lists = lists);
  }

  deleteList(list: List) {
    this.listService.deleteList(list).subscribe(() => this.lists = this.lists.filter(l => l.id !== list.id));
  }

  toggleList(list: List) {
    list.visibility = !list.visibility;
    this.updateList(list);
  }
  
  updateList(list: List){
    this.listService.updateList(list).subscribe();
  }

  addList(list: List) {
    this.listService.addList(list).subscribe((res) => this.lists.push(res));
  }

  displayDetails(list: List){
    this.listService.displayDetails(list).subscribe((res) => console.log(res));
  }

}
