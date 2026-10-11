import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/** Confirmation dialog shown after an aspirant has been mapped to a batch. */
@Component({
  selector: 'app-aspirant-success-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div
        class="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
        aria-labelledby="aspirant-success-modal-title"
      >
        <div class="bg-linear-to-r from-emerald-600 to-teal-700 p-5 text-white text-center">
          <div class="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-2.5">
            <svg class="w-6 h-6 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 id="aspirant-success-modal-title" class="text-base font-bold m-0 tracking-tight">Aspirant Mapped Successfully!</h2>
          <p class="text-xs text-emerald-100 m-0 mt-0.5">Enrolled into Batch {{ batchCode() }}</p>
        </div>

        <div class="p-5 space-y-4">
          <div class="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Aspirant ID:</span>
              <span class="font-mono font-bold text-slate-900">{{ aspirantId() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Candidate Name:</span>
              <span class="font-semibold text-slate-800">{{ aspirantName() }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Aadhaar (Masked):</span>
              <span class="font-mono text-slate-700">XXXX-XXXX-{{ aadhaarNo().slice(-4) || '9812' }}</span>
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

          <div class="flex flex-col sm:flex-row items-center gap-2 pt-1">
            <button
              type="button"
              (click)="mapAnother.emit()"
              class="w-full sm:w-auto flex-1 py-2.5 px-3 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs text-center"
            >
              Map Another
            </button>

            <button
              type="button"
              (click)="batchList.emit()"
              class="w-full sm:w-auto flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg font-semibold text-xs transition-colors text-center cursor-pointer border border-slate-300"
            >
              Batch List
            </button>

            <button
              type="button"
              (click)="aspirantsList.emit()"
              class="w-full sm:w-auto flex-1 py-2.5 px-3 bg-primary hover:bg-primary-dark text-white rounded-lg font-bold text-xs shadow-xs transition-colors text-center cursor-pointer"
            >
              Aspirants Roster &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>

  `
})
export class AspirantSuccessModalComponent {
  readonly batchCode = input.required<string>();
  readonly aspirantId = input.required<string>();
  readonly aspirantName = input.required<string>();
  readonly aadhaarNo = input.required<string>();

  readonly mapAnother = output<void>();
  readonly batchList = output<void>();
  readonly aspirantsList = output<void>();
}
