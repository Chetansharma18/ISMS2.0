import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionModalComponent, InputDirective } from '../../../shared';
import { UserManagementItem } from '../../../core/models/user-management.model';
import { BLACKLIST_DURATION_OPTIONS } from '../user-management.util';

export interface BlacklistConfigSubmission {
  scheme: string;
  years: string;
  remarks?: string;
}

@Component({
  selector: 'app-user-blacklist-modal',
  standalone: true,
  imports: [CommonModule, ActionModalComponent, InputDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="true"
      [showAccentBar]="true"
      accentBarClass="bg-rose-600"
      title="Blacklist Training Partner"
      description="Configure the scheme and duration for blacklisting this Training Partner before final confirmation."
      primaryLabel="Next"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-[480px]"
      (primaryAction)="onProceed()"
      (secondaryAction)="cancelled.emit()"
      (close)="cancelled.emit()"
    >
      @if (user(); as u) {
        <!-- Target User Summary Card -->
        <div class="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-sans space-y-1.5 text-left">
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-500 font-medium shrink-0">Training Partner:</span>
            <span class="font-bold text-slate-800 text-right">{{ u.username }}</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-500 font-medium shrink-0">User ID / SSO:</span>
            <span class="tabular-nums font-semibold text-slate-700 text-right">{{ u.userId }} ({{ u.ssoId || 'N/A' }})</span>
          </div>
          <div class="flex items-center justify-between gap-2">
            <span class="text-slate-500 font-medium shrink-0">District:</span>
            <span class="text-slate-700 font-medium text-right">{{ u.districtName || 'All Districts' }}</span>
          </div>
        </div>

        <!-- Configuration Form -->
        <div class="mt-4 space-y-3.5 text-xs font-sans text-left">
          <!-- Scheme Selection -->
          <div>
            <label for="blacklist-scheme-select" class="block font-semibold text-slate-700 mb-1">
              Select Scheme <span class="text-rose-600">*</span>
            </label>
            <select
              id="blacklist-scheme-select"
              appInput
              class="w-full cursor-pointer bg-white"
              [value]="selectedScheme()"
              (change)="selectedScheme.set($any($event.target).value)"
            >
              @for (scheme of resolvedSchemeOptions(); track scheme) {
                <option [value]="scheme" [selected]="scheme === selectedScheme()">{{ scheme }}</option>
              }
            </select>
            <p class="text-[11px] text-slate-500 mt-1 mb-0">
              Select "All Schemes" to enforce a state-wide debarment across all RSLDC schemes.
            </p>
          </div>

          <!-- Years Duration Selection -->
          <div>
            <label for="blacklist-years-select" class="block font-semibold text-slate-700 mb-1">
              Blacklist Duration (Years) <span class="text-rose-600">*</span>
            </label>
            <select
              id="blacklist-years-select"
              appInput
              class="w-full cursor-pointer bg-white"
              [value]="selectedYears()"
              (change)="selectedYears.set($any($event.target).value)"
            >
              @for (opt of yearsOptions; track opt) {
                <option [value]="opt" [selected]="opt === selectedYears()">{{ opt }}</option>
              }
            </select>
            <p class="text-[11px] text-slate-500 mt-1 mb-0">
              Standard guideline duration is 3 years per RSLDC MoU terms.
            </p>
          </div>

          <!-- Order Ref / Justification (Optional) -->
          <div>
            <label for="blacklist-remarks-input" class="block font-semibold text-slate-700 mb-1">
              Order No. / Remarks <span class="text-slate-400 font-normal">(Optional)</span>
            </label>
            <textarea
              id="blacklist-remarks-input"
              appInput
              rows="2"
              class="w-full text-xs"
              placeholder="e.g. Order Ref RSLDC/DEBAR/2026/01 - Irregularities in attendance"
              [value]="remarks()"
              (input)="remarks.set($any($event.target).value)"
            ></textarea>
          </div>
        </div>
      }
    </app-action-modal>
  `
})
export class UserBlacklistModalComponent {
  readonly isOpen = input.required<boolean>();
  readonly user = input<UserManagementItem | null>(null);
  readonly schemeOptions = input<readonly string[]>([]);

  readonly proceed = output<BlacklistConfigSubmission>();
  readonly cancelled = output<void>();

  readonly yearsOptions = BLACKLIST_DURATION_OPTIONS;

  readonly selectedScheme = signal<string>('All Schemes');
  readonly selectedYears = signal<string>('3 Years');
  readonly remarks = signal<string>('');

  readonly resolvedSchemeOptions = computed(() => {
    const custom = this.schemeOptions();
    const list = custom.length > 0 ? Array.from(custom) : [
      'Vishwakarma Yuva Udyami Protsahan Yojana',
      'Mukhyamantri Yuva Swarojgar Yojana (2026)',
      'Mukhyamantri Yuva Sambal Yojana',
      'Mukhya Mantri Yuva Kaushal Yojana'
    ];
    return ['All Schemes', ...list.filter(s => s !== 'All Schemes')];
  });

  onProceed(): void {
    this.proceed.emit({
      scheme: this.selectedScheme() || 'All Schemes',
      years: this.selectedYears() || '3 Years',
      remarks: this.remarks().trim() || undefined
    });
  }
}
