import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SdcTimelineComponent } from './sdc-timeline.component';

describe('SdcTimelineComponent', () => {
  let component: SdcTimelineComponent;
  let fixture: ComponentFixture<SdcTimelineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SdcTimelineComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SdcTimelineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
