// hero-search.component.ts
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
  searchForm: FormGroup;
  searchResults: Superhero[] = [];
  searched: boolean = false;
  showErrorPopup: boolean = false;
  errorMessages: string = '';

  ngOnInit(): void {
    this.titleService.setTitle("Hero Search");
  }
  constructor(private formBuilder: FormBuilder, private titleService: TitleService, private heroService: HeroService) {
    this.searchForm = this.formBuilder.group({
      name: [''],
      Race: [''],
      powers: [''],
      Publisher: [''],
      n: ['']
    }, { validator: this.atLeastOneFieldRequired(['name', 'Race', 'powers', 'Publisher']) });
  }

  onSearch() {
    if (this.searchForm.valid) {
    const filters = this.searchForm.value;
    this.searched = true;
    this.heroService.matchSearch(filters).subscribe(
      (heroes) => {
        this.searchResults = heroes
      },
      (error: any) => {
        if (error instanceof HttpErrorResponse) {
          // Check for specific HTTP error status codes and handle them
          this.showPopupWithError(error.error.message);
        } else {
          // Handle non-HTTP errors or display a generic error message
          this.showPopupWithError('An unexpected error occurred.');
        }
      }
    );
  } else{
    this.showErrorPopup = true;
    this.showPopupWithError("Atleast one field (Hero Name, Race, Superpowers or Publisher) must be filled!");
  }
  }
  // Call this function when you want to show the error popup
  showPopupWithError(message: any) {
    this.errorMessages = message;
    this.showErrorPopup = true;
  }

  onClosePopup() {
    this.showErrorPopup = false;
  }

  // Method to toggle hero details
  toggleHeroDetails(hero: Superhero) {
    hero.showDetails = !hero.showDetails;
  }

  atLeastOneFieldRequired(fields: string[]): ValidatorFn {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const values = fields.map(field => control.get(field)?.value);
      const isAtLeastOneFieldFilled = values.some(value => value !== null && value !== '');
      return isAtLeastOneFieldFilled ? null : { 'atLeastOneFieldRequired': true };
    };
  }

}