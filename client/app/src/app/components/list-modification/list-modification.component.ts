import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { List } from '../../List';
import { FormBuilder, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-list-modification',
  templateUrl: './list-modification.component.html',
  styleUrls: ['./list-modification.component.css']
})
export class ListModificationComponent implements OnInit {
  @Input() list!: List;
  @Output() onUpdateList: EventEmitter<List> = new EventEmitter<List>();
  @Output() closeModal = new EventEmitter<void>();
  faTimes = faTimes;
  editForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    document.body.classList.add('modal-open');
    // Initialize the form with default values or values passed from the parent component
    this.editForm = this.fb.group({
      "list-name": [this.list['list-name']], // Provide default or initial value
      superhero_ids: [this.list.superhero_ids],
      description: [this.list.description],
      visibility: [this.list.visibility],
    });
  }

  onCloseModal(): void {
    document.body.classList.remove('modal-open');
    this.closeModal.emit();
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    if (this.editForm.invalid) {
      alert("Please fill out the required fields!");
      return;
    }
    const newList = {
      user_id: this.list.user_id,
      list_id: this.list.list_id,
      ["list-name"]: this.editForm.value["list-name"],
      superhero_ids: JSON.parse(`[${this.editForm.value.superhero_ids}]`),
      description: this.editForm.value.description,
      visibility: this.editForm.value.visibility
    };
    this.onUpdateList.emit(newList);
    this.onCloseModal();
  }
}
