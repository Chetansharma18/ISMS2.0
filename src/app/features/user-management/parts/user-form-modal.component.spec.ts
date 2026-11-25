import '@angular/compiler';
import { describe, it, expect } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext, signal } from '@angular/core';
import { UserFormModalComponent } from './user-form-modal.component';
import { createEmptyUserForm } from '../user-management.util';

describe('UserFormModalComponent', () => {
  function createComponent(initialForm = createEmptyUserForm('USR-1001')) {
    const injector = createEnvironmentInjector([], null as any);
    const comp = runInInjectionContext(injector, () => new UserFormModalComponent());

    const formDataSig = signal(initialForm);
    const designationOptionsSig = signal<readonly string[]>([]);
    const schemeOptionsSig = signal<readonly string[]>(['Scheme A', 'Scheme B', 'Scheme C']);
    const editingSig = signal(false);

    // Set signal inputs manually on component instance
    (comp as any).isOpen = signal(true);
    (comp as any).editing = editingSig;
    (comp as any).formData = formDataSig;
    (comp as any).submitted = signal(false);
    (comp as any).schemeOptions = schemeOptionsSig;
    (comp as any).designationOptions = designationOptionsSig;

    return { comp, initialForm, formDataSig, designationOptionsSig, schemeOptionsSig, editingSig };
  }

  it('marks Training Partner as disabled in isRoleDisabled', () => {
    const { comp } = createComponent();
    expect(comp.isRoleDisabled('Training Partner')).toBe(true);
    expect(comp.isRoleDisabled('tp')).toBe(true);
    expect(comp.isRoleDisabled('TP')).toBe(true);
    expect(comp.isRoleDisabled('Super Admin')).toBe(false);
    expect(comp.isRoleDisabled('Department Officer')).toBe(false);
    expect(comp.isRoleDisabled('Scrutiny Officer')).toBe(false);
  });

  it('handles scheme multi-select toggle and All Schemes correctly', () => {
    const form = createEmptyUserForm('USR-1001');
    form.schemeDepartment = '';
    form.schemeNames = [];
    const { comp } = createComponent(form);

    expect(comp.isAllSchemesSelected()).toBe(false);
    expect(comp.getSelectedSchemes()).toEqual([]);
    expect(comp.getSchemeDisplayLabel()).toBe('Select Scheme Name');

    // Toggle All Schemes
    comp.toggleAllSchemes();
    expect(comp.isAllSchemesSelected()).toBe(true);
    expect(comp.isSchemeSelected('Scheme A')).toBe(true);
    expect(comp.isSchemeSelected('Scheme B')).toBe(true);
    expect(comp.isSchemeSelected('Scheme C')).toBe(true);
    expect(comp.getSchemeDisplayLabel()).toBe('All Schemes (3 selected)');

    // Uncheck one scheme: Scheme B
    comp.toggleSchemeOption('Scheme B');
    expect(comp.isAllSchemesSelected()).toBe(false);
    expect(comp.isSchemeSelected('Scheme A')).toBe(true);
    expect(comp.isSchemeSelected('Scheme B')).toBe(false);
    expect(comp.isSchemeSelected('Scheme C')).toBe(true);
    expect(comp.getSchemeDisplayLabel()).toBe('Scheme A, Scheme C');

    // Check Scheme B back
    comp.toggleSchemeOption('Scheme B');
    expect(comp.isAllSchemesSelected()).toBe(true);
    expect(comp.getSchemeDisplayLabel()).toBe('All Schemes (3 selected)');

    // Toggle All Schemes off
    comp.toggleAllSchemes();
    expect(comp.isAllSchemesSelected()).toBe(false);
    expect(comp.getSelectedSchemes()).toEqual([]);
    expect(comp.getSchemeDisplayLabel()).toBe('Select Scheme Name');

    // Select single scheme
    comp.toggleSchemeOption('Scheme A');
    expect(comp.isSchemeSelected('Scheme A')).toBe(true);
    expect(comp.isSchemeSelected('Scheme B')).toBe(false);
    expect(comp.getSchemeDisplayLabel()).toBe('Scheme A');
  });

  it('populates activeDesignationOptions from designationOptions input (Designation Master) with no dummy items', () => {
    const form = createEmptyUserForm('USR-1001');
    const { comp, formDataSig, designationOptionsSig, editingSig } = createComponent(form);

    // Initial empty form has empty designation (no dummy pre-fill)
    expect(form.designation).toBe('');

    // When designationOptions are passed from Designation Master
    const masterDesignations = ['Managing Director', 'Joint Director', 'Deputy Director', 'IT Project Lead'];
    designationOptionsSig.set(masterDesignations);

    // In add mode, only Designation Master options are presented (no dummy items)
    expect(comp.activeDesignationOptions()).toEqual(masterDesignations);
    expect(comp.activeDesignationOptions()).not.toContain('General Manager');
    expect(comp.activeDesignationOptions()).not.toContain('Zone Coordinator');

    // In edit mode with an unlisted designation, it is preserved
    editingSig.set(true);
    formDataSig.set({ ...form, designation: 'Special Consultant' });
    expect(comp.activeDesignationOptions()).toContain('Special Consultant');
    expect(comp.activeDesignationOptions()).toContain('Managing Director');
  });

  it('enforces numeric-only input and limits on mobileNo and aadhaarId', () => {
    const { comp } = createComponent();

    // Keydown numeric filter test
    let prevented = false;
    const digitEvent = { key: '5', preventDefault: () => { prevented = true; } } as any;
    comp.filterNumericKey(digitEvent);
    expect(prevented).toBe(false);

    let alphaPrevented = false;
    const alphaEvent = { key: 'A', preventDefault: () => { alphaPrevented = true; } } as any;
    comp.filterNumericKey(alphaEvent);
    expect(alphaPrevented).toBe(true);

    let backspacePrevented = false;
    const backspaceEvent = { key: 'Backspace', preventDefault: () => { backspacePrevented = true; } } as any;
    comp.filterNumericKey(backspaceEvent);
    expect(backspacePrevented).toBe(false);

    // Mobile input sanitization (10 digits max, numeric only)
    const mockMobileInput = { value: '98765abc4321099' } as HTMLInputElement;
    comp.onMobileInput({ target: mockMobileInput } as any);
    expect(mockMobileInput.value).toBe('9876543210');
    expect(comp.formData().mobileNo).toBe('9876543210');

    // Aadhaar input sanitization (12 digits max, numeric only)
    const mockAadhaarInput = { value: '1234abcd5678efgh9012345' } as HTMLInputElement;
    comp.onAadhaarInput({ target: mockAadhaarInput } as any);
    expect(mockAadhaarInput.value).toBe('123456789012');
    expect(comp.formData().aadhaarId).toBe('123456789012');

    // Date of Birth max attribute
    const today = new Date().toISOString().split('T')[0];
    expect(comp.maxDateOfBirth).toBe(today);
  });
});
