import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { EoiEmpanelmentEditorComponent } from './eoi-empanelment-editor.component';
import { EmpanelmentOrderService } from '../../services/empanelment-order.service';
import { EoiStorage } from '../../services/eoi-state.storage';

describe('EoiEmpanelmentEditorComponent', () => {
  let component: EoiEmpanelmentEditorComponent;
  let fixture: ComponentFixture<EoiEmpanelmentEditorComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EoiEmpanelmentEditorComponent],
      providers: [
        provideRouter([]),
        {
          provide: EoiStorage,
          useValue: {
            getString: () => null,
            setString: () => {},
            getItem: () => null,
            setItem: () => {}
          }
        },
        {
          provide: EmpanelmentOrderService,
          useValue: {
            getOrderBySchemeId: () => of(undefined),
            saveOrder: () => {},
            openOrderPdf: () => Promise.resolve()
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(EoiEmpanelmentEditorComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('initializes with 10 companies by default in draft state', () => {
    expect(component.tableRows.length).toBe(10);
    expect(component.tableRows[0].agencyName).toBe('Company 1');
    expect(component.tableRows[9].agencyName).toBe('Company 10');
    expect(component.tableRows.every(r => r.fileStatus === 'Eligible')).toBe(true);
    expect(component.isSigned()).toBe(false);
  });

  it('allows adding and removing agency rows', () => {
    component.addCompanyRow();
    expect(component.tableRows.length).toBe(11);
    expect(component.tableRows[10].agencyName).toBe('Company 11');

    component.removeCompanyRow(10);
    expect(component.tableRows.length).toBe(10);
  });

  it('handles multi-party committee OTP authentication sequentially', () => {
    component.openEsignModal();
    expect(component.showEsign()).toBe(true);
    expect(component.committeeMembers().length).toBe(4);
    expect(component.allSignatoriesVerified()).toBe(false);

    // Verify all 4 committee members
    for (let i = 0; i < 4; i++) {
      expect(component.activeSignatoryIndex()).toBe(i);
      component.fillTestOtp();
      component.verifyCurrentOtp();
    }

    expect(component.allSignatoriesVerified()).toBe(true);

    // Release Order
    component.releaseOrder();
    expect(component.isSigned()).toBe(true);
    expect(component.rajKajRefNo()).toContain('RK-EMP-');
    expect(component.showEsign()).toBe(false);
  });
});
