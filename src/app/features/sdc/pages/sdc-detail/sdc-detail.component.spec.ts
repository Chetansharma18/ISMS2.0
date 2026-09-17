import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdcDetailComponent } from './sdc-detail.component';

describe('SdcDetailComponent', () => {
  let component: SdcDetailComponent;
  let fixture: ComponentFixture<SdcDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdcDetailComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SdcDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
