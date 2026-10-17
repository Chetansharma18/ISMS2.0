import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantRecord } from '../../models/aspirant.model';
import { REGEX_PATTERNS } from '../../../../shared/utils/validators.util';
import { InputDirective } from '../../../../shared';
import { PARENT_FORM_VIEW_PROVIDER } from './aspirant-parent-form.provider';

/** Edit-mode card: address and contact details (edits the parent-owned form object). */
@Component({
  selector: 'app-aspirant-address-edit',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [FormsModule, InputDirective],
  viewProviders: [PARENT_FORM_VIEW_PROVIDER],
  template: `
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full"></span>
          <span>2. Edit Address &amp; Contact Details</span>
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Mobile Number *</label>
          <input
            appInput
            type="text"
            [(ngModel)]="form().mobileNo"
            name="mobileNo"
            maxlength="10"
            [pattern]="patterns.MOBILE.source"
            title="10 digits starting with 6, 7, 8 or 9"
            placeholder="10-digit mobile"
            class="w-full"
            required
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Alternate Mobile Number</label>
          <input
            appInput
            type="text"
            [(ngModel)]="form().altMobileNo"
            name="altMobileNo"
            maxlength="10"
            [pattern]="patterns.MOBILE.source"
            title="10 digits starting with 6, 7, 8 or 9"
            placeholder="10-digit alternate mobile"
            class="w-full"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Email Address</label>
          <input
            appInput
            type="email"
            [(ngModel)]="form().email"
            name="email"
            class="w-full"
          />
        </div>
      </div>

      <!-- Permanent Address Inputs -->
      <div class="pt-3 border-t border-slate-100">
        <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">Permanent Address</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label class="block text-[11px] text-slate-600 mb-1">House / Flat No.</label>
            <input
              appInput
              type="text"
              [(ngModel)]="form().permHouseNo"
              name="permHouseNo"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-600 mb-1">Street / Colony</label>
            <input
              appInput
              type="text"
              [(ngModel)]="form().permStreet"
              name="permStreet"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-600 mb-1">Ward / Locality</label>
            <input
              appInput
              type="text"
              [(ngModel)]="form().permWard"
              name="permWard"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-600 mb-1">City / Town</label>
            <input
              appInput
              type="text"
              [(ngModel)]="form().permCity"
              name="permCity"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-600 mb-1">District</label>
            <input
              appInput
              type="text"
              [(ngModel)]="form().permDistrict"
              name="permDistrict"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-600 mb-1">Tehsil</label>
            <input
              appInput
              type="text"
              [(ngModel)]="form().permTehsil"
              name="permTehsil"
              class="w-full"
            />
          </div>
          <div>
            <label class="block text-[11px] text-slate-600 mb-1">Pincode</label>
            <input
              appInput
              type="text"
              [(ngModel)]="form().permPincode"
              name="permPincode"
              maxlength="6"
              [pattern]="patterns.PINCODE.source"
              title="6-digit pincode (not starting with 0)"
              placeholder="6-digit pincode"
              class="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  `
})
export class AspirantAddressEditComponent {
  /** Shared validation patterns, exposed for template [pattern] bindings. */
  readonly patterns = REGEX_PATTERNS;
  readonly form = input.required<Partial<AspirantRecord>>();
}
