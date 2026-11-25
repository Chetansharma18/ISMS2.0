import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';
import { TpUserViewModalComponent } from './tp-user-view-modal.component';
import { TpUserRow } from '../utils/tp-users.util';

describe('TpUserViewModalComponent (Bug 4)', () => {
  let component: TpUserViewModalComponent;
  let fixture: ComponentFixture<TpUserViewModalComponent>;

  const mockUser: TpUserRow = {
    id: 'centerhead-user_tp_01',
    ssoId: 'USER_TP_01',
    name: 'Test Partner User',
    role: 'Center Head',
    extra: '',
    batchIds: [],
    assignedTo: 'SDC Jaipur Central',
    assignedDetail: 'Center ID: SDC-01',
    mobile: '9876543210',
    email: 'tpuser@example.com',
    designation: 'Center Manager',
    assignedOn: '12/01/2026',
    assignments: [
      {
        label: 'SDC Jaipur Central',
        detail: 'Main Center',
        status: 'Active'
      }
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TpUserViewModalComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TpUserViewModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('user', mockUser);
    fixture.detectChanges();
  });

  it('configures S.No as column header instead of # (Bug 4)', () => {
    const columns = (component as any).columns;
    const indexCol = columns.find((c: any) => c.key === '$index');
    expect(indexCol).toBeDefined();
    expect(indexCol?.label).toBe('S.No');
  });

  it('displays only one close control and no duplicate footer close button (Bug 4)', () => {
    const el = fixture.nativeElement as HTMLElement;
    // The top-right close button from app-modal
    const closeButtons = el.querySelectorAll('button[aria-label="Close"], button[title="Close"]');
    expect(closeButtons.length).toBe(1);

    // There should be no modalFooter buttons
    const footerButtons = el.querySelectorAll('[modalFooter] button, .modal-footer button');
    expect(footerButtons.length).toBe(0);
  });
});
