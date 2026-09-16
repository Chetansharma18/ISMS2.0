import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdcFormComponent } from './sdc-form.component';

describe('SdcFormComponent', () => {
  let component: SdcFormComponent;
  let fixture: ComponentFixture<SdcFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdcFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SdcFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
