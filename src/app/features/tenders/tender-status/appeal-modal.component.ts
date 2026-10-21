import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal } from '@angular/core';
import type { AppealFile, SubmittedTender, TenderAppeal } from '../../../core/models/tender.model';
import { ActionModalComponent } from '../../../shared/components/action-modal/action-modal.component';
import { ButtonComponent, IconComponent, InputDirective } from '../../../shared';
import { formatDateMedium } from '../../../shared/utils';
import { MAX_APPEAL_FILES, buildAppeal, isAppealReady } from './tender-appeal.util';
import { formatUploadedFileSize } from './tender-status.util';

/**
 * Appeal against a rejected application: shows the rejection remarks, takes the applicant's answer to them and
 * optional supporting files.
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
      [showAccentBar]="true"
      accentBarClass="bg-navy"
      title="Appeal against Rejection"
      primaryLabel="Submit Appeal"
      secondaryLabel="Cancel"
      maxWidthClass="max-w-2xl"
      [disablePrimary]="!canSubmit()"
      (primaryAction)="submit()"
      (secondaryAction)="close.emit()"
      (close)="close.emit()"
    >
      @if (tender(); as t) {
        <div class="space-y-4 text-left text-xs max-h-[62vh] overflow-y-auto pr-1">
          <div class="p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-900 space-y-1.5">
            <div class="text-[11px] font-semibold">{{ t.appRef }} &bull; {{ t.schemeTitle }}</div>
            <p class="m-0 text-xs leading-relaxed whitespace-pre-line">
              <span class="font-semibold">Rejection remarks: </span>{{ t.rejectionReason || 'Technical qualification criteria not met.' }}
            </p>
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-semibold text-slate-800" for="appeal-reply">
              Your answer to the remarks <span class="text-rose-600">*</span>
            </label>
            <textarea
              appInput
              id="appeal-reply"
              rows="5"
              maxlength="1000"
              [value]="reply()"
              (input)="reply.set($any($event.target).value)"
              placeholder="Explain how the rejection remarks are met"
              class="w-full"
            ></textarea>
          </div>

          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="appeal-files">
              Supporting documents <span class="text-slate-400 font-normal">(optional, up to {{ maxFiles }})</span>
            </label>
            <input
              id="appeal-files"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png"
              (change)="addFiles($event)"
              class="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border file:border-slate-300 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-800"
            />
            @if (files().length > 0) {
              <ul class="m-0 p-0 list-none border border-slate-200 rounded-lg divide-y divide-slate-200 bg-white">
                @for (file of files(); track file.fileName; let i = $index) {
                  <li class="flex items-center justify-between gap-3 px-3 py-2">
                    <span class="min-w-0 truncate">
                      <span class="font-medium text-slate-800">{{ file.fileName }}</span>
                      <span class="text-[11px] text-slate-500"> &bull; {{ file.fileSize }}</span>
                    </span>
                    <button appButton variant="ghost" size="sm" iconOnly type="button" [attr.aria-label]="'Remove ' + file.fileName" (click)="removeFile(i)">
                      <app-icon name="close" size="xs" />
                    </button>
                  </li>
                }
              </ul>
            }
            @if (fileNote()) {
              <p class="m-0 text-[11px] text-rose-600">{{ fileNote() }}</p>
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
  protected readonly files = signal<AppealFile[]>([]);
  protected readonly fileNote = signal('');

  protected readonly canSubmit = computed(() => !!this.tender() && isAppealReady(this.reply()));

  constructor() {
    // Start every appeal with an empty form.
    effect(() => {
      this.tender();
      this.reply.set('');
      this.files.set([]);
      this.fileNote.set('');
    });
  }

  protected addFiles(event: Event): void {
    const input = event.target as HTMLInputElement;
    const chosen = Array.from(input.files ?? []);
    input.value = '';

    const room = MAX_APPEAL_FILES - this.files().length;
    const known = new Set(this.files().map(f => f.fileName));
    const fresh = chosen.filter(f => !known.has(f.name)).slice(0, Math.max(0, room));
    this.fileNote.set(chosen.length > fresh.length ? `Only ${MAX_APPEAL_FILES} different files can be attached.` : '');
    this.files.update(list => [...list, ...fresh.map(f => ({ fileName: f.name, fileSize: formatUploadedFileSize(f.size) }))]);
  }

  protected removeFile(index: number): void {
    this.files.update(list => list.filter((_, i) => i !== index));
    this.fileNote.set('');
  }

  protected submit(): void {
    if (!this.canSubmit()) return;
    this.submitted.emit(buildAppeal(this.reply(), this.files(), formatDateMedium(new Date(), '-')));
  }
}
