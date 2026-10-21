import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent } from '../../components/button/button.component';
import { IconComponent } from '../../components/icon/icon.component';

/**
 * A screen that edits or shows an official letter (sanction order, IPA, MoU): a Back button, the
 * title with a status badge, the paper sheet, and a bar of actions under it.
 *
 *   <app-document-page title="Draft IPA" badge="Draft" subtitle="Review the letter, then release it."
 *                      [toast]="toastMessage()" (back)="goBack()">
 *     ...letter content...
 *     <ng-container actions>
 *       <button appButton variant="outline" size="lg" (click)="save()">Save</button>
 *       <button appButton size="lg" (click)="sign()">E-Sign</button>
 *     </ng-container>
 *     <app-esign-modal overlay ... />
 *   </app-document-page>
 *
 * The toolbar and the action bar are hidden when printing; only the sheet is printed.
 */
@Component({
  selector: 'app-document-page',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <div class="w-full min-h-screen bg-slate-50 text-[#1F2933] font-sans py-6 px-3 sm:px-6 lg:px-8 print:bg-white print:p-0">

      @if (toast()) {
        <div class="fixed top-5 right-5 z-50 px-4 py-3 bg-navy text-white rounded-lg shadow-xl text-xs sm:text-sm font-semibold" role="status">
          {{ toast() }}
        </div>
      }

      <div class="w-full max-w-6xl mx-auto space-y-4">

        <div class="font-sans print:hidden space-y-3">
          <button appButton variant="outline" size="sm" (click)="back.emit()">
            <app-icon name="back" />
            <span>{{ backLabel() }}</span>
          </button>

          <div class="flex items-center gap-3 flex-wrap">
            <h1 class="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight m-0">{{ title() }}</h1>
            @if (badge()) {
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">{{ badge() }}</span>
            }
          </div>
          @if (subtitle()) {
            <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">{{ subtitle() }}</p>
          }
        </div>

        <div class="document-sheet w-full bg-white p-6 sm:p-10 lg:p-12 print:p-0 text-[#111827] font-serif leading-relaxed text-xs sm:text-sm border border-slate-300 shadow-sm rounded-lg print:border-none print:shadow-none">
          <ng-content />
        </div>

        <div class="flex items-center justify-end gap-2.5 font-sans print:hidden pt-2 empty:hidden">
          <ng-content select="[actions]" />
        </div>
      </div>

      <ng-content select="[overlay]" />
    </div>
  `
})
export class DocumentPageComponent {
  readonly title = input.required<string>();
  readonly badge = input('');
  readonly subtitle = input('');
  readonly backLabel = input('Back');
  /** A short message shown top right, for example "Draft saved." Empty hides it. */
  readonly toast = input('');

  readonly back = output<void>();
}
