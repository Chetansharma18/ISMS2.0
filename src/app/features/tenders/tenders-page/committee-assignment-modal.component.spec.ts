import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, provideZonelessChangeDetection, runInInjectionContext } from '@angular/core';
import { CommitteeAssignmentModalComponent } from './committee-assignment-modal.component';
import { CommitteeAdmin, SchemeTender } from '../tenders.models';

const injector = createEnvironmentInjector([provideZonelessChangeDetection()], null as any);
function createComponent(): CommitteeAssignmentModalComponent {
  return runInInjectionContext(injector, () => new CommitteeAssignmentModalComponent());
}

const mockAdmins: CommitteeAdmin[] = [
  { id: 'SSO_01', name: 'Committee Member 1', ssoId: 'SSO_01', role: 'Super Admin' },
  { id: 'SSO_02', name: 'Committee Member 2', ssoId: 'SSO_02', role: 'Super Admin' },
  { id: 'SSO_03', name: 'Scheme OIC', ssoId: 'SSO_03', role: 'Scheme OC' }
];

const mockScheme: SchemeTender = {
  sNo: 1,
  refNo: 'RSLDC/EOI/001',
  schemeName: 'VYUPY',
  schemeCategory: 'Rajvik',
  datePublished: '01/01/2026',
  closingDate: '31/12/2026',
  eoiCategory: 'General',
  eoiDescription: 'Test scheme',
  committeeApprover: 'SSO_01',
  committeeMembers: ['SSO_02', 'SSO_03']
};

describe('CommitteeAssignmentModalComponent', () => {
  it('instantiates and initializes signals', () => {
    const comp = createComponent();
    expect(comp.selectedApprover()).toBe('');
    expect(comp.selectedAdminIds()).toEqual([]);
    expect(comp.isApproverDropdownOpen()).toBe(false);
    expect(comp.isMemberDropdownOpen()).toBe(false);
  });

  it('filters approver admins by typed search query', () => {
    const comp = createComponent();
    (comp as any).admins = () => mockAdmins;

    expect(comp.filteredApproverAdmins().length).toBe(3);

    comp.approverSearchQuery.set('member 1');
    expect(comp.filteredApproverAdmins().length).toBe(1);
    expect(comp.filteredApproverAdmins()[0].name).toBe('Committee Member 1');

    comp.approverSearchQuery.set('Super Admin');
    expect(comp.filteredApproverAdmins().length).toBe(2);

    comp.approverSearchQuery.set('nonexistent');
    expect(comp.filteredApproverAdmins().length).toBe(0);
  });

  it('filters member admins by typed search query', () => {
    const comp = createComponent();
    (comp as any).admins = () => mockAdmins;

    expect(comp.filteredMemberAdmins().length).toBe(3);

    comp.memberSearchQuery.set('oic');
    expect(comp.filteredMemberAdmins().length).toBe(1);
    expect(comp.filteredMemberAdmins()[0].name).toBe('Scheme OIC');
  });

  it('allows selecting only 1 approver at a time and clearing it', () => {
    const comp = createComponent();
    (comp as any).admins = () => mockAdmins;

    comp.toggleApproverDropdown();
    expect(comp.isApproverDropdownOpen()).toBe(true);

    comp.selectApprover('SSO_01');
    expect(comp.selectedApprover()).toBe('SSO_01');
    expect(comp.nameOf('SSO_01')).toBe('Committee Member 1');
    expect(comp.nameOf('UNKNOWN')).toBe('UNKNOWN');
    expect(comp.isApproverDropdownOpen()).toBe(false);

    // Selecting a different approver overwrites the previous one
    comp.selectApprover('SSO_02');
    expect(comp.selectedApprover()).toBe('SSO_02');

    comp.clearApprover();
    expect(comp.selectedApprover()).toBe('');
  });

  it('allows selecting multiple members and toggling them', () => {
    const comp = createComponent();
    (comp as any).admins = () => mockAdmins;

    expect(comp.isMemberSelected('SSO_02')).toBe(false);

    comp.toggleMemberSelection('SSO_02');
    expect(comp.isMemberSelected('SSO_02')).toBe(true);
    expect(comp.selectedAdminIds()).toEqual(['SSO_02']);

    comp.toggleMemberSelection('SSO_03');
    expect(comp.selectedAdminIds()).toEqual(['SSO_02', 'SSO_03']);

    // Toggling again removes the member
    comp.toggleMemberSelection('SSO_02');
    expect(comp.selectedAdminIds()).toEqual(['SSO_03']);

    comp.removeAdminSelection('SSO_03');
    expect(comp.selectedAdminIds()).toEqual([]);
  });

  it('emits approver and members on save', () => {
    const comp = createComponent();
    let emittedPayload: { approver?: string; members: string[] } | null = null;
    comp.save.subscribe((val) => {
      emittedPayload = val;
    });

    comp.selectedApprover.set('SSO_01');
    comp.selectedAdminIds.set(['SSO_02', 'SSO_03']);
    comp.onSave();

    expect(emittedPayload).toEqual({
      approver: 'SSO_01',
      members: ['SSO_02', 'SSO_03']
    });
  });

  it('displays validation error and blocks emission when Save Committee is clicked with blank fields', () => {
    const comp = createComponent();
    let emitted = false;
    comp.save.subscribe(() => {
      emitted = true;
    });

    comp.onSave();

    expect(emitted).toBe(false);
    expect(comp.submitted()).toBe(true);
    expect(comp.errorMessage()).toContain('Please select an Approver');
  });
});
