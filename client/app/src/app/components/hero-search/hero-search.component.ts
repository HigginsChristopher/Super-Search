// Import Angular core modules and services
import { Component, OnInit } from '@angular/core';
import { TitleService } from '../../services/title.service';
import { HeroService } from '../../services/hero.service';
import { Superhero } from '../../superhero';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ValidatorFn, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.css']
})
export class HeroSearchComponent implements OnInit {
  // Form group for the hero search form
  searchForm: FormGroup;

  // Array to store search results
  searchResults: Superhero[] = [];

  // Flag to indicate whether a search has been performed
  searched: boolean = false;

  // Flags for error handling in the form
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  // Constructor with dependency injection
  constructor(
    private formBuilder: FormBuilder,
    private titleService: TitleService,
    private heroService: HeroService
  ) {
    // Initialize the hero search form with validation
    this.searchForm = this.formBuilder.group({
      name: [''],
      Race: [''],
      powers: [''],
      Publisher: [''],
      n: ['']
    }, { validator: this.atLeastOneFieldRequired(['name', 'Race', 'powers', 'Publisher']) });
  }

  // Lifecycle hook: Called after the component is initialized
  ngOnInit(): void {
    // Set the title for the page
    this.titleService.setTitle("Hero Search");
  }

  // Method to handle the hero search
  onSearch() {
    if (this.searchForm.valid) {
      // Get search filters from the form
      const filters = this.searchForm.value;

      // Mark that a search has been performed
      this.searched = true;

      // Call the hero service to perform the search
      this.heroService.matchSearch(filters).subscribe(
        (response) => {
          this.searchResults = response.match;
        },
        (errorResponse: any) => {
          // Handle errors from the hero service
          if (errorResponse instanceof HttpErrorResponse) {
            this.showPopupWithError(errorResponse.error.message);
          } else {
            this.showPopupWithError('An unexpected error occurred.');
          }
        }
      );
    } else {
      // Show error popup and display form validation errors
      this.showErrorPopup = true;
      this.showPopupWithError("At least one field (Hero Name, Race, Superpowers, or Publisher) must be filled!");
    }
  }

  // Method to show the error popup with a specific message
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  // Method to close the error popup
  onClosePopup() {
    this.showErrorPopup = false;
  }

  // Method to toggle the visibility of hero details
  toggleHeroDetails(hero: Superhero) {
    hero.showDetails = !hero.showDetails;
  }

  // Custom validator function to ensure at least one field is required
  atLeastOneFieldRequired(fields: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const values = fields.map(field => control.get(field)?.value);
      const isAtLeastOneFieldFilled = values.some(value => value !== null && value !== '');
      return isAtLeastOneFieldFilled ? null : { 'atLeastOneFieldRequired': true };
    };
  }
}
