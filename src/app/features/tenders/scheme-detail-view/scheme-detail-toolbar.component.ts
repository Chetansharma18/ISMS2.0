import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../shared';

/** Top controls of the scheme detail screen: back, download details and apply / closed state. */
@Component({
  selector: 'app-scheme-detail-toolbar',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-1">
      
      <!-- Back to Active Schemes Button -->
      <button appButton variant="outline" size="sm" type="button" (click)="back.emit()" title="Back to Active Schemes">
        <app-icon name="chevron-left" size="sm" />
        <span>Back</span>
      </button>

      <!-- Right Action Buttons -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5">
        <!-- Download Scheme Details Button -->
        <button appButton variant="outline" size="sm" type="button" (click)="downloadDetails.emit()" title="Download Scheme Details PDF">
          <app-icon name="document" />
          <span>Download Scheme Details</span>
        </button>

        <!-- Apply for EOI Button -->
        @if (!hideApplyButton()) {
          @if (!isClosed()) {
            <button appButton size="sm" type="button" (click)="apply.emit()">
              <span>Apply for EOI</span>
              <app-icon name="forward" size="sm" />
            </button>
          } @else {
            <span class="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 rounded-md bg-rose-50 border border-rose-300 text-rose-700 text-xs font-semibold select-none">
              Submission Closed
            </span>
          }
        }
      </div>

    </div>
  `
})
export class SchemeDetailToolbarComponent {
  readonly isClosed = input(false);
  readonly hideApplyButton = input(false);

  readonly back = output<void>();
  readonly downloadDetails = output<void>();
  readonly apply = output<void>();
}
