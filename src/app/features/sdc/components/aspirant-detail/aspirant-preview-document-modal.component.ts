import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { AspirantDocumentItem } from '../../config/aspirant-form.config';
import { ButtonComponent, IconComponent, ModalComponent } from '../../../../shared';

/** Modal: document preview with replace / download actions. */
@Component({
  selector: 'app-aspirant-preview-document-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, IconComponent, ModalComponent],
  template: `
    <app-modal
      [title]="doc().docName"
      size="lg"
      (close)="close.emit()"
    >
  <div class="border border-slate-200 rounded-lg overflow-hidden">
  <!-- Metadata Strip -->
  <div class="bg-slate-100 border-b border-slate-200 px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
    <div class="flex items-center gap-2">
      <span class="text-slate-500">File:</span>
      <span class="font-mono font-bold text-slate-800">{{ doc().fileName }}</span>
      <span class="px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded text-[10px]">{{ doc().fileSize }}</span>
    </div>
    <div class="flex items-center gap-2">
      <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
        AEBAS Verified
      </span>
      <span class="text-[11px] text-slate-400">Uploaded: {{ doc().uploadedAt || '2026-09-02' }}</span>
    </div>
  </div>

  <!-- Document Canvas Visual Preview Mockup -->
  <div class="p-6 bg-slate-50 flex items-center justify-center min-h-[300px]">
    <div class="bg-white border-2 border-slate-300 rounded-lg shadow-md p-6 max-w-md w-full space-y-4 text-center">
      <div class="w-12 h-12 rounded-full bg-slate-100 text-brand font-bold flex items-center justify-center mx-auto text-xl border border-slate-200">
        🏛️
      </div>
      <div>
        <h4 class="text-xs font-bold text-slate-900 uppercase tracking-wider">Government of Rajasthan</h4>
        <p class="text-[11px] text-slate-500">Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</p>
      </div>
      
      <div class="border-t border-b border-slate-100 py-3 space-y-1">
        <span class="text-xs font-bold text-slate-800 block">{{ doc().docType }}</span>
        <span class="font-mono text-[11px] text-slate-600 block">{{ doc().docName }}</span>
        <span class="text-[10px] font-mono text-slate-400 block">Doc Ref: REF-{{ doc().id }}-{{ aspirantId() }}</span>
      </div>

      <div class="flex items-center justify-center gap-2 pt-1">
        <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
        <span class="text-[11px] font-semibold text-emerald-700">Digital Document Authenticated &amp; Validated</span>
      </div>
    </div>
  </div>

  </div>

  <!-- Footer Actions -->
  <ng-container modalFooter>
    <!-- Direct Replace from inside preview modal -->
    <button
      appButton
      variant="outline"
      class="mr-auto"
      type="button"
      (click)="modalReplaceFileInput.click()"
    >
      <app-icon name="upload" size="sm" />
      <span>Replace Document File</span>
    </button>
    <input
      #modalReplaceFileInput
      type="file"
      accept=".pdf,.jpg,.jpeg,.png"
      (change)="onReplaceFileSelected($event)"
      class="hidden"
    />

    <button
      appButton
      variant="outline"
      type="button"
      (click)="download.emit()"
    >
      Download
    </button>
    <button
      appButton
      type="button"
      (click)="close.emit()"
    >
      Close
    </button>
  </ng-container>
    </app-modal>
  `
})
export class AspirantPreviewDocumentModalComponent {
  readonly doc = input.required<AspirantDocumentItem>();
  readonly aspirantId = input<string>();
  readonly replaceFile = output<File>();
  readonly download = output<void>();
  readonly close = output<void>();

  onReplaceFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.replaceFile.emit(input.files[0]);
      input.value = '';
    }
  }
}