import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';  // Import necessary modules
import { List } from '../../List';
import { UiService } from '../../services/ui.service';
import { Subscription } from 'rxjs/internal/Subscription';
import { UserService } from '../../services/user.service';
import { User } from '../../user';

@Component({
  selector: 'app-add-list',
  templateUrl: './add-list.component.html',
  styleUrls: ['./add-list.component.css']
})
export class AddListComponent implements OnInit {
  @Output() onAddList: EventEmitter<List> = new EventEmitter();
  listForm: FormGroup;  
  showAddList: boolean = false;
  subscription: Subscription = new Subscription();
  currentUser: User | null = null;

  constructor(private uiService: UiService, private userService: UserService, private fb: FormBuilder) {
    this.subscription = this.uiService.onToggle().subscribe((value) => (this.showAddList = value));

    // Initialize the form with FormBuilder
    this.listForm = this.fb.group({
      list_name: ['', Validators.required],
      superhero_ids: ['', Validators.required],
      description: [''],
      visibility: [false],
    });
  }

  ngOnInit(): void {
    this.userService.getCurrentUser().subscribe(user => {
      this.currentUser = user;
    });
  }

  onSubmit() {
    if (this.listForm.invalid) {
      alert("Please fill out the required fields!");
      return;
    }
    const newList = {
      user_id: this.currentUser?.user_id!,
      ["list-name"]: this.listForm.value.list_name,
      superhero_ids: JSON.parse(`[${this.listForm.value.superhero_ids}]`),
      description: this.listForm.value.description,
      visibility: this.listForm.value.visibility
    };
    this.onAddList.emit(newList);

    // Reset the form
    this.listForm.reset({
      list_name: '',
      superhero_ids: '',
      description: '',
      visibility: false
    });
  }
}