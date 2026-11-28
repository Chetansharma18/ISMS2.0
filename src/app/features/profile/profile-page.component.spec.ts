import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Component, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ProfilePageComponent } from './profile-page.component';
import { AuthService } from '../../core/auth/auth.service';
import { PermissionService } from '../../core/permissions/permission.service';
import { TableAccessService } from '../../core/permissions/table-access.service';
import { OtrRegistrationService } from '../registration/services/otr-registration.service';
import { buildFormDef } from '../registration/otr-form.util';
import { OtrFormDef, OtrFullFormResponse, OtrRecords } from '../registration/models/otr-api.model';
import { SecurityPinCardComponent } from './parts/security-pin-card.component';

/** Stands in for the Security PIN card, which needs auth services the AuthService stub does not have. */
@Component({ selector: 'app-security-pin-card', standalone: true, template: '' })
class SecurityPinCardStubComponent {}

const RESPONSE: OtrFullFormResponse = {
  version: 1, title: 'Organization Registration', description: 'Provide the details.',
  steps: [
    {
      stepKey: 'organisation', stepTitle: 'Organisation Details', stepSubtitle: 'Step 1',
      dynamicFormId: 12, dynamicFormVersion: 1, hasDynamicForm: true,
      dynamicSchema: { title: 'Extra', fields: [{ fieldKey: 'cinNumber', label: 'CIN Number', fieldType: 'text', isRequired: false, displayOrder: 1, colSpan: 6 }] },
      fixedFields: [{ fieldKey: 'organisationName', label: 'Organisation Name', fieldType: 'text', isRequired: true, sectionName: 'Basic' }]
    },
    {
      stepKey: 'bank-details', stepTitle: 'Bank Details', stepSubtitle: 'Step 2',
      dynamicFormId: null, dynamicFormVersion: null, hasDynamicForm: false, dynamicSchema: null,
      fixedFields: [{ fieldKey: 'bankName', label: 'Name of the Bank', fieldType: 'text', isRequired: true, sectionName: 'Bank' }]
    }
  ]
};
const FORM = buildFormDef(RESPONSE, { sectors: [], districts: [] });

describe('ProfilePageComponent (dynamic profile)', () => {
  let fixture: ComponentFixture<ProfilePageComponent>;

  function create(opts: { role: string; backendRole: string; records: OtrRecords; canOtr?: boolean; me?: Record<string, unknown> }) {
    const otr = {
      load: (): Observable<{ form: OtrFormDef; records: OtrRecords }> => of({ form: FORM, records: opts.records }),
      documentBlob: () => of(new Blob())
    };
    TestBed.configureTestingModule({
      imports: [ProfilePageComponent],
      providers: [
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        {
          provide: AuthService,
          useValue: {
            currentUser: signal({ role: opts.role, subLabel: opts.backendRole }),
            isMockAuth: () => false,
            loadProfile: () => undefined,
            profile: signal({ id: 1, SSOID: 'COMPANY1', displayName: 'Company 1', selectedRole: { id: 1, name: opts.backendRole }, ...(opts.me ?? {}) }),
            profileLoading: signal(false),
            sessionRoles: signal({ roles: [], activeRoleId: null })
          }
        },
        { provide: PermissionService, useValue: { hasRole: () => false } },
        { provide: TableAccessService, useValue: { can: () => opts.canOtr ?? true } },
        { provide: OtrRegistrationService, useValue: otr }
      ]
    });
    TestBed.overrideComponent(ProfilePageComponent, {
      remove: { imports: [SecurityPinCardComponent] },
      add: { imports: [SecurityPinCardStubComponent] }
    });
    fixture = TestBed.createComponent(ProfilePageComponent);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  beforeEach(() => TestBed.resetTestingModule());

  it('shows a filled OTR, with its FormManager answers, whatever the role', () => {
    const comp = create({
      role: 'existing_user', backendRole: 'Tp',
      records: { organisation: { id: 1, status: 'Draft', organisationName: 'Company 1', dynamicFormAnswers: { cinNumber: 'U12345' } }, 'bank-details': null }
    });
    expect(comp.mode()).toBe('otr');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Organisation Details');
    expect(text).toContain('CIN Number');
    expect(text).toContain('U12345');
    expect(text).toContain('Continue Registration');
  });

  it('offers the OTR steps to a new user (default role) who has not filled it', () => {
    const comp = create({ role: 'new_user', backendRole: 'User', records: { organisation: null, 'bank-details': null } });
    expect(comp.mode()).toBe('otr-start');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Start Registration');
    expect(text).toContain('Bank Details');
  });

  it('shows the /auth/me account details to other roles without an OTR', () => {
    const comp = create({
      role: 'dept_admin', backendRole: 'admin', records: { organisation: null, 'bank-details': null },
      me: { mailOfficial: 'office@example.gov.in', designation: 'Scheme OIC' }
    });
    expect(comp.mode()).toBe('account');
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Account Details');
    expect(text).toContain('KYC Pending');
    expect(text).toContain('Scheme OIC');
    expect(text).not.toContain('Start Registration');
  });

  it('does not read the OTR without the OtrRegistrations permission', () => {
    const comp = create({ role: 'dept_admin', backendRole: 'admin', records: { organisation: { id: 1, status: 'Draft', organisationName: 'X' } }, canOtr: false });
    expect(comp.mode()).toBe('account');
  });
});
