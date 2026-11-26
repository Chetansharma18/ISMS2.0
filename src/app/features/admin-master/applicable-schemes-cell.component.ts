import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { ButtonComponent, IconComponent, ModalComponent } from '../../shared';

/**
 * "N Schemes" button of a Doc / Annexure Master row; opens the list of the record's applicable schemes.
 * The schemes are changed in the row's Edit dialog.
 */
@Component({
  selector: 'app-applicable-schemes-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, ModalComponent],
  template: `
    <button
      appButton
      variant="outline"
      size="xs"
      type="button"
      [disabled]="schemes().length === 0"
      [title]="schemes().length ? 'Show the ' + schemes().length + ' applicable schemes' : 'No scheme linked'"
      (click)="$event.stopPropagation(); open.set(true)"
    >
      <app-icon name="clipboard-check" size="xs" />
      <span>{{ label() }}</span>
    </button>

    @if (open()) {
      <app-modal [title]="itemName()" subtitle="Applicable schemes" size="md" [showClose]="false" (close)="open.set(false)">
        <ul class="m-0 list-none space-y-1.5 p-0 text-[13px]">
          @for (scheme of schemes(); track scheme) {
            <li class="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-slate-800">
              <app-icon name="check" size="sm" class="shrink-0 text-emerald-600" />
              <span>{{ scheme }}</span>
            </li>
          }
        </ul>
        <p class="m-0 mt-3 text-xs text-slate-500">Use Edit to change the schemes.</p>
        <ng-container modalFooter>
          <button appButton variant="outline" type="button" (click)="open.set(false)">Close</button>
        </ng-container>
      </app-modal>
    }
  `
})
export class ApplicableSchemesCellComponent {
  readonly schemes = input<string[]>([]);
  readonly itemName = input('');

  protected readonly open = signal(false);
  protected readonly label = computed(() => {
    const n = this.schemes().length;
    return n === 1 ? '1 Scheme' : `${n} Schemes`;
  });
}
