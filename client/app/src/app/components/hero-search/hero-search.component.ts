// hero-search.component.ts
import { Component } from '@angular/core';

interface Hero {
  name: string;
  race: string;
  power: string;
  publisher: string;
}

@Component({
  selector: 'app-hero-search',
  templateUrl: './hero-search.component.html',
  styleUrls: ['./hero-search.component.css']
})
export class HeroSearchComponent {
  searchCriteria: { name: string, race: string, power: string, publisher: string } = {
    name: '',
    race: '',
    power: '',
    publisher: ''
  };

  heroes: Hero[] = [
    { name: 'Superman', race: 'Kryptonian', power: 'Flight, Super Strength', publisher: 'DC Comics' },
    { name: 'Spider-Man', race: 'Human', power: 'Agility, Wall-Crawling', publisher: 'Marvel Comics' },
    // Add more heroes as needed
  ];

  searchResults: Hero[] = [];

  onSearch() {
    this.searchResults = this.heroes.filter(hero =>
      this.matchesCriteria(hero, this.searchCriteria)
    );
  }

  private matchesCriteria(hero: Hero, criteria: { name: string, race: string, power: string, publisher: string }): boolean {
    return (
      this.startsWith(hero.name, criteria.name) &&
      this.startsWith(hero.race, criteria.race) &&
      this.startsWith(hero.power, criteria.power) &&
      this.startsWith(hero.publisher, criteria.publisher)
    );
  }

  private startsWith(value: string, searchString: string): boolean {
    const sanitizedValue = value.toLowerCase().replace(/\s+/g, ''); // Remove whitespace and convert to lowercase
    const sanitizedSearchString = searchString.toLowerCase().replace(/\s+/g, ''); // Remove whitespace and convert to lowercase
  
    return sanitizedValue.startsWith(sanitizedSearchString);
  }
}