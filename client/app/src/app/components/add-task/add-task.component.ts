import { Component, Output, EventEmitter } from '@angular/core';
import { Task } from '../../Task';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';

@Component({
  selector: 'app-add-task',
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.css'
})
export class AddTaskComponent {
  @Output() onAddList: EventEmitter<Task> = new EventEmitter();
  list_name: string = "";
  superhero_ids: Array<number> = [];
  description: string = "";
  visibility: boolean = false;
  showAddTask: boolean = false;
  subscription: Subscription = new Subscription();

  constructor(private uiService: UiService) {
    this.subscription = this.uiService.onToggle().subscribe((value) => (this.showAddTask = value));
  }

  onSubmit() {
    if (!this.list_name) {
      alert("Please add a name!")
      return;
    }
    else if (!this.superhero_ids) {
      alert("Please add a list of ids!")
      return;
    }
    try {
      this.superhero_ids = JSON.parse(`[${this.superhero_ids}]`)
    } catch (ignored) { }
    const newList = {
      ["list-name"]: this.list_name,
      superhero_ids: this.superhero_ids,
      description: this.description,
      visibility: this.visibility
    }
    this.onAddList.emit(newList);

    this.list_name = "";
    this.superhero_ids = [];
    this.description = "";
    this.visibility = false;
  }

}
