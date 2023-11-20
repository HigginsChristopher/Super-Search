import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DmcaComplianceComponent } from './dmca-compliance.component';

describe('DmcaComplianceComponent', () => {
  let component: DmcaComplianceComponent;
  let fixture: ComponentFixture<DmcaComplianceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DmcaComplianceComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DmcaComplianceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
