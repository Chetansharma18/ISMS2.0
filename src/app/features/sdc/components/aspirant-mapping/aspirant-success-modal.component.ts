import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, ModalComponent } from '../../../../shared';

/** Confirmation dialog shown after an aspirant has been mapped to a batch. */
@Component({
  selector: 'app-aspirant-success-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, ModalComponent],
  template: `
    <app-modal
      [title]="replacedName() ? 'Replacement Registered' : 'Aspirant Mapped Successfully!'"
      [subtitle]="replacedName() ? 'Takes the seat of ' + replacedName() + ' in Batch ' + batchCode() : 'Enrolled into Batch ' + batchCode()"
      size="sm"
      [showClose]="false"
      [closeOnBackdrop]="false"
    >
        <div class="space-y-4">
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Aspirant ID:</span>
              <span class="tabular-nums font-bold text-slate-900">{{ aspirantId() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Candidate Name:</span>
              <span class="font-semibold text-slate-800">{{ aspirantName() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Aadhaar (Masked):</span>
              <span class="tabular-nums text-slate-700">XXXX-XXXX-{{ aadhaarNo().slice(-4) || '9812' }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Batch Code:</span>
              <span class="font-bold text-blue-700">{{ batchCode() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Batch Status:</span>
              <span class="font-bold text-emerald-700">ENROLLED (Biometric Ready)</span>
            </div>
          </div>

        </div>

        <ng-container modalFooter>
          @if (!replacedName()) {
            <button
              appButton
              variant="outline"
              type="button"
              (click)="mapAnother.emit()"
            >
              Map Another
            </button>
          }

          <button
            appButton
            variant="outline"
            type="button"
            (click)="batchList.emit()"
          >
            Batch List
          </button>

          <button
            appButton
            type="button"
            (click)="aspirantsList.emit()"
          >
            Aspirants Roster &rarr;
          </button>
        </ng-container>
    </app-modal>

  `
})
export class AspirantSuccessModalComponent {
  readonly batchCode = input.required<string>();
  readonly aspirantId = input.required<string>();
  readonly aspirantName = input.required<string>();
  readonly aadhaarNo = input.required<string>();
  /** Name of the dropped student this registration replaces; empty for a normal registration. */
  readonly replacedName = input<string>('');

  readonly mapAnother = output<void>();
  readonly batchList = output<void>();
  readonly aspirantsList = output<void>();
}
