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
  { id: 'adm-1', name: 'Ramesh Suresh', ssoId: 'SSO_01', role: 'Super Admin' },
  { id: 'adm-2', name: 'Ram Shyaam', ssoId: 'SSO_02', role: 'Super Admin' },
  { id: 'adm-3', name: 'Siddesh', ssoId: 'SSO_03', role: 'Scheme OC' }
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
  committeeApprover: 'Ramesh Suresh',
  committeeMembers: ['Ram Shyaam', 'Siddesh']
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

    comp.approverSearchQuery.set('ramesh');
    expect(comp.filteredApproverAdmins().length).toBe(1);
    expect(comp.filteredApproverAdmins()[0].name).toBe('Ramesh Suresh');

    comp.approverSearchQuery.set('Super Admin');
    expect(comp.filteredApproverAdmins().length).toBe(2);

    comp.approverSearchQuery.set('nonexistent');
    expect(comp.filteredApproverAdmins().length).toBe(0);
  });

  it('filters member admins by typed search query', () => {
    const comp = createComponent();
    (comp as any).admins = () => mockAdmins;

    expect(comp.filteredMemberAdmins().length).toBe(3);

    comp.memberSearchQuery.set('siddesh');
    expect(comp.filteredMemberAdmins().length).toBe(1);
    expect(comp.filteredMemberAdmins()[0].name).toBe('Siddesh');
  });

  it('allows selecting only 1 approver at a time and clearing it', () => {
    const comp = createComponent();
    (comp as any).admins = () => mockAdmins;

    comp.toggleApproverDropdown();
    expect(comp.isApproverDropdownOpen()).toBe(true);

    comp.selectApprover('Ramesh Suresh');
    expect(comp.selectedApprover()).toBe('Ramesh Suresh');
    expect(comp.isApproverDropdownOpen()).toBe(false);

    // Selecting a different approver overwrites the previous one
    comp.selectApprover('Ram Shyaam');
    expect(comp.selectedApprover()).toBe('Ram Shyaam');

    comp.clearApprover();
    expect(comp.selectedApprover()).toBe('');
  });

  it('allows selecting multiple members and toggling them', () => {
    const comp = createComponent();
    (comp as any).admins = () => mockAdmins;

    expect(comp.isMemberSelected('Ram Shyaam')).toBe(false);

    comp.toggleMemberSelection('Ram Shyaam');
    expect(comp.isMemberSelected('Ram Shyaam')).toBe(true);
    expect(comp.selectedAdminIds()).toEqual(['Ram Shyaam']);

    comp.toggleMemberSelection('Siddesh');
    expect(comp.selectedAdminIds()).toEqual(['Ram Shyaam', 'Siddesh']);

    // Toggling again removes the member
    comp.toggleMemberSelection('Ram Shyaam');
    expect(comp.selectedAdminIds()).toEqual(['Siddesh']);

    comp.removeAdminSelection('Siddesh');
    expect(comp.selectedAdminIds()).toEqual([]);
  });

  it('emits approver and members on save', () => {
    const comp = createComponent();
    let emittedPayload: { approver?: string; members: string[] } | null = null;
    comp.save.subscribe((val) => {
      emittedPayload = val;
    });

    comp.selectedApprover.set('Ramesh Suresh');
    comp.selectedAdminIds.set(['Ram Shyaam', 'Siddesh']);
    comp.onSave();

    expect(emittedPayload).toEqual({
      approver: 'Ramesh Suresh',
      members: ['Ram Shyaam', 'Siddesh']
    });
  });
});
