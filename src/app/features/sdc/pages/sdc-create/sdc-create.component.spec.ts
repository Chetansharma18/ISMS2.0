import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdcCreateComponent } from './sdc-create.component';

describe('SdcCreateComponent', () => {
  let component: SdcCreateComponent;
  let fixture: ComponentFixture<SdcCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdcCreateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SdcCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
