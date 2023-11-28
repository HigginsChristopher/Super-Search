import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListModificationComponent } from './list-modification.component';

describe('ListModificationComponent', () => {
  let component: ListModificationComponent;
  let fixture: ComponentFixture<ListModificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListModificationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ListModificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
