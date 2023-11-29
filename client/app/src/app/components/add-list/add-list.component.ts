import { Component, Output, EventEmitter, OnInit, Input } from '@angular/core';
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
  @Output() closeModal = new EventEmitter<void>();
  listForm: FormGroup;
  showAddList: boolean = false;
  subscription: Subscription = new Subscription();
  currentUser: User | null = null;
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  constructor(private uiService: UiService, private userService: UserService, private fb: FormBuilder) {
    this.subscription = this.uiService.onToggle().subscribe((value) => (this.showAddList = value));

    // Initialize the form with FormBuilder
    this.listForm = this.fb.group({
      list_name: ['', [Validators.required]],
      superhero_ids: ['', [Validators.required]],
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
    if (this.listForm.valid) {
      let superhero_ids = this.listForm.value.superhero_ids;
      try {
        superhero_ids = JSON.parse(`[${this.listForm.value.superhero_ids}]`)
      } catch (ignored) { }
      const newList = {
        user_id: this.currentUser?.id!,
        ["list-name"]: this.listForm.value.list_name,
        superhero_ids: superhero_ids,
        description: this.listForm.value.description,
        visibility: this.listForm.value.visibility
      };
      this.onAddList.emit(newList);
      this.onClosePopup();
    }
    else {
      this.showErrorPopup = true;
      this.showPopupWithError(this.getFormValidationErrors());
    }
  }

  onClosePopup() {
    this.showErrorPopup = false;
  }

  // Call this function when you want to show the error popup
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  getFormValidationErrors(): string[] {
    const errorMessages: string[] = [];
    const errorMapping: { [key: string]: string } = {
      required: 'is required',
      email: 'must be a valid email address'
    };

    Object.keys(this.listForm.controls).forEach(key => {
      const controlErrors = this.listForm.get(key)!.errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          const message = `${key.charAt(0).toUpperCase() + key.slice(1)} ${errorMapping[keyError as keyof typeof errorMapping]}`;
          errorMessages.push(message);
        });
      }
    });
    return errorMessages;
  }
}