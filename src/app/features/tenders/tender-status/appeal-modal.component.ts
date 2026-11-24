import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import type { SubmittedTender, TenderAppeal } from '../../../core/models/tender.model';
import { ActionModalComponent } from '../../../shared/components/action-modal/action-modal.component';
import { ButtonComponent, IconComponent, InputDirective } from '../../../shared';
import { formatDateMedium } from '../../../shared/utils';
import { buildAppeal, MAX_APPEAL_FILES } from './tender-appeal.util';

/**
 * Appeal request confirmation modal:
 * Captures applicant's appeal remarks and proper supporting documents
 * to be submitted within 7 days of application rejection for department approval.
 */
@Component({
  selector: 'app-appeal-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent, ButtonComponent, IconComponent, InputDirective],
  template: `
    <app-action-modal
      [isOpen]="isOpen()"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      [reverseButtons]="true"
      [showAccentBar]="false"
      accentBarClass="bg-navy"
      title="Submit Appeal & Supporting Documents"
      primaryLabel="Submit Appeal"
      secondaryLabel=""
      maxWidthClass="max-w-2xl"
      [disablePrimary]="!canSubmit()"
      (primaryAction)="submit()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (tender(); as t) {
        <div class="space-y-4 text-left text-xs max-h-[62vh] overflow-y-auto pr-1">

          <!-- 1. Rejection Grounds & 7-Day Window Banner -->
          <div class="p-4 rounded-xl border border-rose-200 bg-rose-50/70 text-rose-950 space-y-2">
            <div class="flex items-start gap-2.5">
              <app-icon name="alert-triangle" size="sm" class="text-rose-600 mt-0.5 shrink-0" />
              <div class="space-y-1">
                <h4 class="m-0 text-[13px] font-bold text-rose-900">
                  Rejection Grounds & 7-Day Appeal Window
                </h4>
                <p class="m-0 text-xs text-rose-800 leading-relaxed">
                  Your application <span class="font-semibold">{{ t.appRef }} &bull; {{ t.schemeTitle }}</span> was rejected with remarks:
                </p>
                <p class="m-0 text-xs text-rose-950 font-semibold italic bg-white/90 p-2.5 rounded border border-rose-200">
                  "{{ t.rejectionReason || 'Technical qualification criteria not met.' }}"
                </p>
                <p class="m-0 text-[11.5px] text-rose-700 leading-relaxed pt-0.5 font-medium">
                  &bull; You have 7 days from rejection to appeal and respond with proper supporting documents. Once submitted, the department scrutiny committee will review and approve or reject your appeal.
                </p>
              </div>
            </div>
          </div>

          <!-- 2. Applicant Appeal Remarks -->
          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-800" for="appeal-reply">
              Appeal Remarks / Explanation <span class="text-rose-600">*</span>
            </label>
            <textarea
              appInput
              id="appeal-reply"
              rows="3"
              maxlength="1000"
              [value]="reply()"
              (input)="reply.set($any($event.target).value)"
              placeholder="Explain your justification or clarification against the rejection remarks..."
              class="w-full"
            ></textarea>
          </div>

          <!-- 3. Upload Proper Supporting Documents -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="block text-xs font-semibold text-slate-800">
                Upload Supporting Documents
                <span class="text-slate-500 font-normal text-[11px] ml-1">(Optional / Recommended)</span>
              </label>
              <span class="text-[11px] text-slate-500">Max {{ maxFiles }} files &bull; PDF, JPG, PNG (up to 25 MB each)</span>
            </div>

            <!-- Hidden native file input -->
            <input
              #fileInput
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              (change)="onFilesSelected($event)"
              class="hidden"
            />

            <!-- Upload Dropzone Button -->
            @if (files().length < maxFiles) {
              <div
                (click)="fileInput.click()"
                class="w-full flex items-center justify-between p-3 rounded-lg border border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100/80 transition-colors cursor-pointer group"
              >
                <div class="flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-md bg-white border border-slate-200 text-slate-600 group-hover:text-navy flex items-center justify-center shrink-0">
                    <app-icon name="upload" size="sm" />
                  </div>
                  <div class="text-left">
                    <span class="block text-xs font-semibold text-slate-800 group-hover:text-navy">
                      Click to choose documents to attach
                    </span>
                    <span class="block text-[11px] text-slate-500">
                      Upload verified certificates, UDIN documents, or receipts
                    </span>
                  </div>
                </div>
                <button appButton variant="secondary" size="xs" type="button" class="shrink-0 pointer-events-none">
                  Browse Files
                </button>
              </div>
            }

            <!-- Attached Files List -->
            @if (files().length > 0) {
              <div class="space-y-1.5 pt-1">
                <span class="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
                  Attached Documents ({{ files().length }}):
                </span>
                <div class="space-y-1.5">
                  @for (file of files(); track file.fileName; let idx = $index) {
                    <div class="flex items-center justify-between gap-3 p-2.5 rounded-lg border border-slate-200 bg-white shadow-2xs">
                      <div class="flex items-center gap-2.5 min-w-0">
                        <app-icon name="pdf-badge" solid size="auto" class="w-5 h-5 text-[#E5252A] select-none shrink-0" />
                        <div class="min-w-0">
                          <span class="text-xs font-medium text-slate-900 block truncate" [title]="file.fileName">
                            {{ file.fileName }}
                          </span>
                          <span class="text-[10.5px] text-slate-500 block">{{ file.fileSize }}</span>
                        </div>
                      </div>
                      <button
                        appButton
                        variant="ghost"
                        size="xs"
                        iconOnly
                        type="button"
                        (click)="removeFile(idx)"
                        class="shrink-0"
                        title="Remove Document"
                        aria-label="Remove Document"
                      >
                        <app-icon name="close" size="xs" class="text-rose-600" />
                      </button>
                    </div>
                  }
                </div>
              </div>
            }
          </div>

        </div>
      }
    </app-action-modal>
  `
})
export class AppealModalComponent {
  readonly isOpen = input(false);
  readonly tender = input<SubmittedTender | null>(null);

  readonly submitted = output<TenderAppeal>();
  readonly close = output<void>();

  protected readonly maxFiles = MAX_APPEAL_FILES;
  protected readonly reply = signal('');
  protected readonly files = signal<{ fileName: string; fileSize: string }[]>([]);

  protected readonly canSubmit = computed(() => !!this.tender() && this.reply().trim().length > 0);

  constructor() {
    // Reset remark and files on open
    effect(() => {
      this.tender();
      this.reply.set('');
      this.files.set([]);
    });
  }

  protected onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const currentFiles = [...this.files()];
    for (let i = 0; i < input.files.length; i++) {
      if (currentFiles.length >= this.maxFiles) break;
      const file = input.files[i];
      const fileSize = this.formatFileSize(file.size);
      if (!currentFiles.some(f => f.fileName === file.name)) {
        currentFiles.push({ fileName: file.name, fileSize });
      }
    }

    this.files.set(currentFiles);
    input.value = '';
  }

  protected removeFile(index: number): void {
    const list = [...this.files()];
    list.splice(index, 1);
    this.files.set(list);
  }

  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.submitted.emit(buildAppeal(this.reply().trim(), this.files(), formatDateMedium(new Date(), '-')));
  }
}
