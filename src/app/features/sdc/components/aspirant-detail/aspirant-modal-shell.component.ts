import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Backdrop + card + coloured header shared by the aspirant document dialogs.
 * Project the dialog body/footer as default content and an optional header icon
 * with the `modalIcon` attribute.
 */
@Component({
  selector: 'app-aspirant-modal-shell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        class="bg-white rounded-xl shadow-2xl w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
        [class]="widthClass()"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
      >
        <div class="bg-primary text-white px-5 flex items-center justify-between" [class]="headerClass()">
          <div class="flex items-center gap-2">
            <ng-content select="[modalIcon]"></ng-content>
            <h3 [id]="titleId" class="text-sm font-bold m-0" style="color: #ffffff !important;">{{ heading() }}</h3>
          </div>
          <button type="button" (click)="close.emit()" class="text-white hover:opacity-80 text-lg cursor-pointer" aria-label="Close">✕</button>
        </div>

        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class AspirantModalShellComponent {
  private static nextId = 0;
  readonly titleId = `aspirant-modal-title-${++AspirantModalShellComponent.nextId}`;

  readonly heading = input.required<string>();
  /** Tailwind max-width class of the card. */
  readonly widthClass = input('max-w-md');
  /** Vertical padding class of the header bar. */
  readonly headerClass = input('py-4');
  readonly close = output<void>();
}
