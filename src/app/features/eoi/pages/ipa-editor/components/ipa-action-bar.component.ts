import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent, PageHeaderComponent } from '../../../../../shared';

/** Top action bar of the IPA editor: page header, save / print actions and status banner. */
@Component({
  selector: 'app-ipa-action-bar',
  standalone: true,
  imports: [PageHeaderComponent, ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="p-4 sm:p-5 print:hidden space-y-4 max-w-6xl mx-auto font-sans">
      <app-page-header
        title="In-Principle Approval (IPA) Document Editor"
        [breadcrumbs]="[
          { label: 'Home', url: '/' },
          { label: 'Sanction Order', url: '/admin/sanction-orders' },
          { label: 'IPA Document Editor' }
        ]"
        [backUrl]="'/admin/sanction-order/' + schemeId()"
        backTitle="Back to Allocated Targets"
      >
        <div class="flex items-center gap-2">
          <button appButton size="sm" (click)="save.emit()">
            <app-icon name="check" />
            <span>{{ isSaved() ? '✓ Saved &amp; Issued' : 'Save &amp; Finalize IPA' }}</span>
          </button>

          <button appButton variant="outline" size="sm" (click)="print.emit()">
            <app-icon name="print" />
            <span>Print / Export IPA</span>
          </button>
        </div>
      </app-page-header>

      @if (savedNotification()) {
        <div class="p-3 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-900 flex items-center justify-between animate-fade-in shadow-xs">
          <span class="font-semibold flex items-center gap-1.5">
            <app-icon name="check" [stroke]="2" class="text-emerald-600" />
            In-Principle Approval (IPA) Saved &amp; Updated Successfully! Redirecting...
          </span>
          <span class="text-[11px] font-mono bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">Saved</span>
        </div>
      } @else {
        <div class="p-3 bg-amber-50 border border-amber-200 rounded text-xs text-amber-900 flex items-center justify-between">
          <span>&check; <strong>Live IPA Editor Mode (IPA.pdf format):</strong> Click any text, date, reference number, course table row, or clause below to edit directly before saving or exporting.</span>
          <span class="text-[11px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded">RSLDC Official IPA Format</span>
        </div>
      }
    </div>
  `
})
export class IpaActionBarComponent {
  readonly schemeId = input<string>('');
  readonly isSaved = input<boolean>(false);
  readonly savedNotification = input<boolean>(false);
  readonly save = output<void>();
  readonly print = output<void>();
}
