import { Component, Input, Output, EventEmitter, OnInit, HostListener } from '@angular/core';
import { List } from "../../List";
import { faTimes } from "@fortawesome/free-solid-svg-icons"
import { Superhero } from '../../superhero';
import { SuperheroService } from '../../services/superhero.service';
import { ListService } from '../../services/list.service';


@Component({
  selector: 'app-list-item',
  templateUrl: './list-item.component.html',
  styleUrl: './list-item.component.css'
})
export class ListItemComponent implements OnInit {
  faTimes = faTimes;
  @Input() list!: List;
  @Output() onDeleteList: EventEmitter<List> = new EventEmitter();
  @Output() onToggleList: EventEmitter<List> = new EventEmitter();
  superheroes: Superhero[] = [];

  expanded: boolean = false;
  private longPressTimer: any;

  constructor(private superheroService: SuperheroService, private listService: ListService) { }

  @HostListener('mouseup') onMouseUp() {
    this.clearLongPressTimer();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.clearLongPressTimer();
  }


  startLongPressTimer(event: MouseEvent,list: List): void {
    if (event.button === 0) { // Check left mouse button
      this.longPressTimer = setTimeout(() => {
        this.onToggleList.emit(list);
        this.clearLongPressTimer();
      }, 1000); // Adjust the duration according to your preference
    }
  }

  clearLongPressTimer(): void {
    clearTimeout(this.longPressTimer);
  }

  toggleExpand(list: List): void {
    this.expanded = !this.expanded;
    this.listService.displayDetails(list).subscribe((superheroes) => this.superheroes = superheroes);
  }

  ngOnInit(): void {
  }

  onDelete(list: List) {
    this.onDeleteList.emit(list);
  }

  onToggle(list: List) {
    this.onToggleList.emit(list);
  }

  onDeleteSuperhero(list: List, superhero: Superhero){
    const indexToDelete = list.superhero_ids.indexOf(superhero.id);
    list.superhero_ids.splice(indexToDelete,1)
    this.listService.updateList(list).subscribe();
    this.listService.displayDetails(list).subscribe((superheroes) => this.superheroes = superheroes);
  }

}
