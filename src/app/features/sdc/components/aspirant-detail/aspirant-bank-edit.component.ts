import { Component, input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantRecord } from '../../models/aspirant.model';
import { REGEX_PATTERNS } from '../../../../shared/utils/validators.util';
import { PARENT_FORM_VIEW_PROVIDER } from './aspirant-parent-form.provider';

/** Edit-mode card: bank / DBT and socio-economic fields (edits the parent-owned form object). */
@Component({
  selector: 'app-aspirant-bank-edit',
  standalone: true,
  host: { class: 'block' },
  imports: [FormsModule],
  viewProviders: [PARENT_FORM_VIEW_PROVIDER],
  template: `
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full"></span>
          <span>3. Edit Bank DBT &amp; Socio-Economic Registrations</span>
        </h3>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Bank Name</label>
          <input
            type="text"
            [(ngModel)]="form().bankName"
            name="bankName"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Account Number</label>
          <input
            type="text"
            [(ngModel)]="form().bankAccountNo"
            name="bankAccountNo"
            maxlength="18"
            [pattern]="patterns.BANK_ACCOUNT.source"
            title="9 to 18 digit bank account number"
            placeholder="9 to 18 digit account number"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">IFSC Code</label>
          <input
            type="text"
            [(ngModel)]="form().ifscCode"
            name="ifscCode"
            maxlength="11"
            [pattern]="patterns.IFSC.source"
            title="11-char IFSC: 4 letters, 0, then 6 alphanumerics (e.g. SBIN0001234)"
            placeholder="e.g. SBIN0001234"
            style="text-transform: uppercase;"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-mono font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Branch Name</label>
          <input
            type="text"
            [(ngModel)]="form().bankBranch"
            name="bankBranch"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Annual Family Income (₹)</label>
          <input
            type="number"
            [(ngModel)]="form().annualFamilyIncome"
            name="annualFamilyIncome"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Economic Status</label>
          <select
            [(ngModel)]="form().economicStatus"
            name="economicStatus"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="APL">APL (Above Poverty Line)</option>
            <option value="BPL">BPL (Below Poverty Line)</option>
            <option value="Antyodaya">Antyodaya</option>
            <option value="EWS">EWS</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">BoCW Registered</label>
          <select
            [(ngModel)]="form().bocwWorker"
            name="bocwWorker"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="No">No</option>
            <option value="Yes">Yes</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Training Status</label>
          <select
            [(ngModel)]="form().trainingStatus"
            name="trainingStatus"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="ENROLLED">ENROLLED</option>
            <option value="IN_TRAINING">IN TRAINING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CERTIFIED">CERTIFIED</option>
          </select>
        </div>
      </div>
    </div>
  `
})
export class AspirantBankEditComponent {
  /** Shared validation patterns, exposed for template [pattern] bindings. */
  readonly patterns = REGEX_PATTERNS;
  readonly form = input.required<Partial<AspirantRecord>>();
}