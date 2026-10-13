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
});
