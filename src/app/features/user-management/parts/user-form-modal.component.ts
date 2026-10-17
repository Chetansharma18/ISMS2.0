import { Component, input, output, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActionModalComponent, DropdownComponent, InputDirective } from '../../../shared';
import { UserFormData } from '../user-management.util';
import { DistrictBlockMasterItem } from '../../../core/models/admin-masters.model';

/**
 * Add / edit user form. The form object is owned by the parent and edited in place via ngModel,
 * so this component intentionally stays on default change detection.
 */
@Component({
  selector: 'app-user-form-modal',
  standalone: true,
  imports: [FormsModule, ActionModalComponent, DropdownComponent, InputDirective],
  template: `
    @let f = formData();
    @let isSubmitted = submitted();
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      [reverseButtons]="true"
      [showAccentBar]="false"
      [primaryLabel]="editing() ? 'Save Changes' : 'Submit'"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[780px]"
      (primaryAction)="save.emit()"
      (secondaryAction)="cancelled.emit()"
      (close)="cancelled.emit()"
    >
      <h2 class="m-0 text-navy" style="font-size: 18px; font-weight: 800; line-height: 24px; letter-spacing: -0.01em;">
        {{ editing() ? 'Edit User' : 'Add New User' }}
      </h2>

      <div class="mt-4 font-sans text-[13px] max-h-[75vh] overflow-y-auto pr-1">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3.5">

          <!-- ROW 1 (Col 1: SSO ID*, Col 2: Role Type*) -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">SSO ID*</label>
            <input
              appInput
              size="sm"
              type="text"
              placeholder="e.g. SSO_1008"
              [(ngModel)]="f.ssoId"
              [invalid]="isSubmitted && !f.ssoId"
              class="w-full font-mono"
            />
            @if (isSubmitted && !f.ssoId) {
              <div class="text-xs text-red-500 mt-0.5 font-medium">SSO ID is required</div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Role Type*</label>
            <select
              appInput
              size="sm"
              [(ngModel)]="f.roleType"
              [invalid]="isSubmitted && !f.roleType"
              class="w-full"
            >
              <option value="" disabled selected>Select Role Type</option>
              @for (role of activeRoleOptions(); track role) {
                <option [value]="role" [disabled]="isRoleDisabled(role)">
                  {{ role }}{{ isRoleDisabled(role) ? ' (Disabled)' : '' }}
                </option>
              }
            </select>
            @if (isSubmitted && !f.roleType) {
              <div class="text-xs text-red-500 mt-0.5 font-medium">Role Type is required</div>
            }
          </div>

          <!-- ROW 2 (Col 1: First Name*, Col 2: Last Name*) -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">First Name*</label>
            <input
              appInput
              size="sm"
              type="text"
              placeholder="e.g. John"
              [(ngModel)]="f.firstName"
              [invalid]="isSubmitted && !f.firstName"
              class="w-full"
            />
            @if (isSubmitted && !f.firstName) {
              <div class="text-xs text-red-500 mt-0.5 font-medium">First Name is required</div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Last Name*</label>
            <input
              appInput
              size="sm"
              type="text"
              placeholder="e.g. Doe"
              [(ngModel)]="f.lastName"
              [invalid]="isSubmitted && !f.lastName"
              class="w-full"
            />
            @if (isSubmitted && !f.lastName) {
              <div class="text-xs text-red-500 mt-0.5 font-medium">Last Name is required</div>
            }
          </div>

          <!-- ROW 3 (Col 1: E-Mail*, Col 2: Mobile No.*) -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">E-Mail*</label>
            <input
              appInput
              size="sm"
              type="email"
              placeholder="name@example.com"
              [(ngModel)]="f.email"
              [invalid]="isSubmitted && !f.email"
              class="w-full"
            />
            @if (isSubmitted && !f.email) {
              <div class="text-xs text-red-500 mt-0.5 font-medium">E-Mail is required</div>
            }
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Mobile No.*</label>
            <input
              appInput
              size="sm"
              type="text"
              maxlength="10"
              placeholder="10-digit mobile number"
              [(ngModel)]="f.mobileNo"
              [invalid]="isSubmitted && !f.mobileNo"
              class="w-full"
            />
            @if (isSubmitted && !f.mobileNo) {
              <div class="text-xs text-red-500 mt-0.5 font-medium">Mobile No. is required</div>
            }
          </div>

          <!-- ROW 4 (Col 1: Date Of Birth, Col 2: Aadhaar Id) -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">Date Of Birth</label>
            <input
              appInput
              size="sm"
              type="date"
              [(ngModel)]="f.dateOfBirth"
              class="w-full"
            />
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Aadhaar Id</label>
            <input
              appInput
              size="sm"
              type="text"
              maxlength="12"
              placeholder="12-digit Aadhaar number"
              [(ngModel)]="f.aadhaarId"
              class="w-full font-mono"
            />
          </div>

          <!-- ROW 5 (Col 1: Designation, Col 2: Scheme Name) -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">Designation</label>
            <select
              appInput
              size="sm"
              [(ngModel)]="f.designation"
              class="w-full"
            >
              <option value="" disabled>Select Designation</option>
              @for (desig of activeDesignationOptions(); track desig) {
                <option [value]="desig">{{ desig }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Scheme Name</label>
            <!-- "All Schemes" row first, then the individual schemes from Scheme Master -->
            <app-dropdown
              multiple
              size="sm"
              placeholder="Select Scheme Name"
              selectAllLabel="All Schemes"
              [options]="activeSchemeOptions()"
              [values]="schemeValues()"
              [summary]="getSchemeDisplayLabel()"
              (optionToggled)="toggleSchemeOption($event)"
              (selectAllToggled)="toggleAllSchemes()"
            />
          </div>

          <!-- ROW 6 (Col 1: District, Col 2: Block Name) -->
          <div>
            <label class="block text-slate-700 font-medium mb-1">District</label>
            <select
              appInput
              size="sm"
              [(ngModel)]="f.district"
              (ngModelChange)="onDistrictChange($event)"
              class="w-full"
            >
              <option value="All Districts">All Districts</option>
              @for (district of activeDistrictOptions(); track district) {
                <option [value]="district">{{ district }}</option>
              }
            </select>
          </div>

          <div>
            <label class="block text-slate-700 font-medium mb-1">Block Name</label>
            <select
              appInput
              size="sm"
              [(ngModel)]="f.blockName"
              class="w-full"
            >
              <option value="All Blocks">All Blocks</option>
              @for (block of activeBlockOptions(); track block) {
                <option [value]="block">{{ block }}</option>
              }
            </select>
          </div>

        </div>
      </div>
    </app-action-modal>
  `
})
export class UserFormModalComponent {
  readonly isOpen = input.required<boolean>();
  /** True when editing an existing user (changes title / primary label). */
  readonly editing = input.required<boolean>();
  /** Parent-owned form state, edited in place. */
  readonly formData = input.required<UserFormData>();
  /** Whether the parent has attempted a submit (drives validation styling). */
  readonly submitted = input.required<boolean>();

  readonly roleTypeOptions = input<readonly string[]>([]);
  readonly districtOptions = input<readonly string[]>([]);
  readonly districtMasterItems = input<readonly DistrictBlockMasterItem[]>([]);
  readonly schemeOptions = input<readonly string[]>([]);
  readonly designationOptions = input<readonly string[]>([]);

  readonly save = output<void>();
  readonly cancelled = output<void>();

  isRoleDisabled(role: string): boolean {
    const r = (role || '').trim().toLowerCase();
    return r === 'training partner' || r === 'tp';
  }

  readonly activeDesignationOptions = computed(() => {
    const list = this.designationOptions() ? [...this.designationOptions()] : [];
    const current = (this.formData()?.designation || '').trim();
    if (this.editing() && current && !list.includes(current)) {
      return [current, ...list];
    }
    return list;
  });

  readonly activeSchemeOptions = computed(() => {
    const custom = this.schemeOptions();
    if (custom && custom.length > 0) return custom;
    return [
      'Vishwakarma Yuva Udyami Protsahan Yojana',
      'Mukhyamantri Yuva Swarojgar Yojana (2026)',
      'Mukhyamantri Yuva Sambal Yojana',
      'Mukhya Mantri Yuva Kaushal Yojana'
    ];
  });

  getSelectedSchemes(): string[] {
    const f = this.formData();
    if (Array.isArray(f.schemeNames)) {
      return f.schemeNames;
    }
    if (f.schemeDepartment) {
      if (f.schemeDepartment === 'All Schemes' || f.schemeDepartment === 'ALL' || f.schemeDepartment === 'all') {
        return ['All Schemes'];
      }
      return f.schemeDepartment.split(',').map(s => s.trim()).filter(Boolean);
    }
    return [];
  }

  /** Ticked schemes for the dropdown: every option while "All Schemes" is on, else the chosen ones. */
  schemeValues(): string[] {
    if (this.isAllSchemesSelected()) return [...this.activeSchemeOptions()];
    return this.getSelectedSchemes().filter(s => s !== 'All Schemes' && s !== 'ALL' && s !== 'all');
  }

  isAllSchemesSelected(): boolean {
    const selected = this.getSelectedSchemes();
    if (selected.includes('ALL') || selected.includes('All Schemes') || selected.includes('all')) {
      return true;
    }
    const all = this.activeSchemeOptions();
    return all.length > 0 && all.every(s => selected.includes(s));
  }

  isSchemeSelected(scheme: string): boolean {
    if (this.isAllSchemesSelected()) {
      return true;
    }
    const selected = this.getSelectedSchemes();
    return selected.includes(scheme);
  }

  toggleAllSchemes(): void {
    const f = this.formData();
    if (this.isAllSchemesSelected()) {
      f.schemeNames = [];
      f.schemeDepartment = '';
    } else {
      f.schemeNames = ['All Schemes', ...this.activeSchemeOptions()];
      f.schemeDepartment = 'All Schemes';
    }
  }

  toggleSchemeOption(scheme: string): void {
    const f = this.formData();
    const allOptions = this.activeSchemeOptions();
    let currentSelected: string[];

    if (this.isAllSchemesSelected()) {
      currentSelected = allOptions.filter(s => s !== scheme);
    } else {
      const selected = this.getSelectedSchemes().filter(s => s !== 'All Schemes' && s !== 'ALL' && s !== 'all');
      if (selected.includes(scheme)) {
        currentSelected = selected.filter(s => s !== scheme);
      } else {
        currentSelected = [...selected, scheme];
      }
    }

    if (allOptions.length > 0 && allOptions.every(s => currentSelected.includes(s))) {
      f.schemeNames = ['All Schemes', ...allOptions];
      f.schemeDepartment = 'All Schemes';
    } else {
      f.schemeNames = currentSelected;
      f.schemeDepartment = currentSelected.join(', ');
    }
  }

  getSchemeDisplayLabel(): string {
    if (this.isAllSchemesSelected()) {
      return `All Schemes (${this.activeSchemeOptions().length} selected)`;
    }
    const selected = this.getSelectedSchemes().filter(s => s !== 'All Schemes' && s !== 'ALL' && s !== 'all');
    if (selected.length === 0) {
      return 'Select Scheme Name';
    }
    if (selected.length <= 2) {
      return selected.join(', ');
    }
    return `${selected.length} schemes selected`;
  }

  readonly activeRoleOptions = computed(() => {
    const custom = this.roleTypeOptions();
    if (custom && custom.length > 0) return custom;
    return ['Super Admin', 'Department Officer', 'Scrutiny Officer', 'Training Partner'];
  });

  readonly activeDistrictOptions = computed(() => {
    const custom = this.districtOptions();
    if (custom && custom.length > 0) return custom;
    const items = this.districtMasterItems();
    if (items && items.length > 0) {
      return Array.from(new Set(items.map(i => i.districtName).filter(Boolean)));
    }
    return ['Jaipur', 'Jodhpur', 'Udaipur', 'Ajmer', 'Kota'];
  });

  readonly activeBlockOptions = computed(() => {
    const currentDistrict = this.formData().district;
    const items = this.districtMasterItems();
    if (items && items.length > 0) {
      if (currentDistrict && currentDistrict !== 'All Districts') {
        const matching = items
          .filter(i => i.districtName.toLowerCase() === currentDistrict.toLowerCase())
          .map(i => i.blockName)
          .filter(Boolean);
        if (matching.length > 0) {
          return Array.from(new Set(matching));
        }
      }
      return Array.from(new Set(items.map(i => i.blockName).filter(Boolean)));
    }
    return ['Amber', 'Sanganer', 'Mandore', 'Girwa', 'Kishangarh', 'Ladpura'];
  });

  onDistrictChange(newDist: string): void {
    if (newDist === 'All Districts') {
      this.formData().blockName = 'All Blocks';
    } else {
      const blocks = this.activeBlockOptions();
      if (blocks.length > 0 && !blocks.includes(this.formData().blockName || '')) {
        this.formData().blockName = blocks[0];
      }
    }
  }
}
