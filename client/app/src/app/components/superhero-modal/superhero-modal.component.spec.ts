import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuperheroModalComponent } from './superhero-modal.component';

describe('SuperheroModalComponent', () => {
  let component: SuperheroModalComponent;
  let fixture: ComponentFixture<SuperheroModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SuperheroModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SuperheroModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
