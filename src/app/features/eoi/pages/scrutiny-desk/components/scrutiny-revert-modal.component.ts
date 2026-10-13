import { ChangeDetectionStrategy, Component, HostListener, computed, input, output, signal } from '@angular/core';
import { OTHER_OPTION, OptionDropdownComponent } from './option-dropdown.component';

/** A file the department shares with the applicant along with the shortfall. */
export interface RevertSharedFile {
  title: string;
  fileName: string;
  fileSize: string;
}

/** What the department fills in when raising a shortfall. */
export interface RevertSubmission {
  documents: string[];
  sharedFiles: RevertSharedFile[];
  /** Days the applicant has to respond. */
  dueDays: number;
  comment: string;
}

const OTHER = OTHER_OPTION;

/** The applicant gets between 3 and 7 days to respond. */
const RESPONSE_DAY_OPTIONS = [3, 4, 5, 6, 7];

const COMMENT_PRESETS = [
  'Please upload the documents listed below.',
  'The document submitted is not legible. Please upload a clear copy.',
  'The document submitted is not valid for the current financial year.',
  'The document is missing the required signature or seal.',
  'The details in the document do not match the registration records.'
];

/** Reply form for the department to ask the applicant for missing or corrected documents. */
@Component({
  selector: 'app-scrutiny-revert-modal',
  standalone: true,
  imports: [OptionDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      style="background: rgba(10,20,40,0.5); backdrop-filter: blur(4px);"
      (click)="close.emit()"
    >
      <div
        class="w-full max-w-xl bg-white rounded-xl border border-slate-200 shadow-2xl relative font-sans overflow-hidden my-auto max-h-[92vh] flex flex-col"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        aria-labelledby="revert-title"
      >
        <div class="h-1.5 w-full bg-navy shrink-0"></div>

        <div class="px-5 sm:px-6 pt-5 pb-4 border-b border-slate-200 flex items-start justify-between gap-3">
          <div>
            <h2 id="revert-title" class="text-base sm:text-lg font-bold text-slate-900 m-0">Raise Shortfall</h2>
            <p class="text-xs text-slate-500 m-0 mt-0.5">{{ applicantLabel() }}</p>
          </div>
          <button
            type="button"
            (click)="close.emit()"
            class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title="Close"
            aria-label="Close"
          >
            <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-5 sm:px-6 py-5 overflow-y-auto flex-1 space-y-5 text-xs" (click)="docPanelOpen.set(false)">

          <!-- Documents asked for -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="revert-doc">
              Shortfall Documents <span class="text-rose-600">*</span>
            </label>
            <!-- Multi-select dropdown -->
            <div class="relative" (click)="$event.stopPropagation()">
              <button
                id="revert-doc"
                type="button"
                (click)="docPanelOpen.update(open => !open)"
                [attr.aria-expanded]="docPanelOpen()"
                aria-haspopup="listbox"
                class="w-full min-h-[38px] px-3 py-2 border rounded-lg bg-white cursor-pointer flex items-center justify-between gap-2 shadow-2xs hover:border-slate-400 text-left"
                [class]="docPanelOpen() ? 'border-navy' : 'border-slate-300'"
              >
                <span [class]="documents().length ? 'text-slate-800 font-medium' : 'text-slate-400'">
                  {{ documents().length ? documents().length + ' selected' : 'Select documents' }}
                </span>
                <svg class="w-4 h-4 text-slate-400 transition-transform" [class.rotate-180]="docPanelOpen()" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              @if (docPanelOpen()) {
                <div class="absolute left-0 right-0 top-full mt-1 z-30 bg-white border border-slate-300 rounded-lg shadow-xl overflow-hidden" role="listbox" aria-multiselectable="true">
                  <div class="max-h-56 overflow-y-auto divide-y divide-slate-100 p-1">
                    @for (title of documentOptions(); track title) {
                      <label class="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          [checked]="documents().includes(title)"
                          (change)="toggleDoc(title)"
                          class="w-4 h-4 rounded text-navy border-slate-300 cursor-pointer shrink-0"
                        />
                        <span class="text-xs text-slate-800">{{ title }}</span>
                      </label>
                    }
                    <label class="flex items-center gap-2.5 p-2 hover:bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        [checked]="customDocOpen()"
                        (change)="customDocOpen.set(!customDocOpen())"
                        class="w-4 h-4 rounded text-navy border-slate-300 cursor-pointer shrink-0"
                      />
                      <span class="text-xs text-slate-800">Other (type your own)</span>
                    </label>
                  </div>
                  <div class="p-2 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px]">
                    <span class="text-slate-500">{{ documents().length }} selected</span>
                    <button
                      type="button"
                      (click)="docPanelOpen.set(false)"
                      class="px-3 py-1 bg-navy hover:bg-[#07243c] rounded text-xs font-semibold cursor-pointer"
                      style="color: #ffffff !important;"
                    >
                      Done
                    </button>
                  </div>
                </div>
              }
            </div>

            @if (customDocOpen()) {
              <div class="flex items-center gap-2">
                <input
                  type="text"
                  [value]="customDoc()"
                  (input)="customDoc.set($any($event.target).value)"
                  (keydown.enter)="addCustomDoc(); $event.preventDefault()"
                  placeholder="Type the document name"
                  class="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 focus:outline-none focus:border-navy shadow-2xs"
                />
                <button
                  type="button"
                  (click)="addCustomDoc()"
                  [disabled]="!customDoc().trim()"
                  class="px-3.5 py-2 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style="color: #ffffff !important;"
                >
                  Add
                </button>
              </div>
            }

            @if (documents().length > 0) {
              <div class="flex flex-wrap gap-1.5">
                @for (doc of documents(); track doc) {
                  <span class="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                    <span>{{ doc }}</span>
                    <button
                      type="button"
                      (click)="removeDoc(doc)"
                      class="w-4 h-4 rounded hover:bg-amber-200/80 text-amber-700 hover:text-amber-900 flex items-center justify-center cursor-pointer"
                      [attr.aria-label]="'Remove ' + doc"
                    >
                      &times;
                    </button>
                  </span>
                }
              </div>
            }
          </div>

          <!-- Files shared by the department -->
          <div class="space-y-2">
            <div class="flex items-center justify-between gap-3">
              <label class="block text-xs font-semibold text-slate-800">
                Attach Documents <span class="text-slate-400 font-normal">(optional)</span>
              </label>
              <button
                type="button"
                (click)="fileInput.click()"
                class="px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer shadow-2xs"
              >
                Upload
              </button>
            </div>
            <input #fileInput type="file" multiple class="hidden" (change)="onFilesPicked($event)" />

            @if (sharedFiles().length > 0) {
              <ul class="m-0 p-0 list-none border border-slate-200 rounded-lg divide-y divide-slate-200 bg-white">
                @for (file of sharedFiles(); track file.fileName) {
                  <li class="flex items-center justify-between gap-3 px-3 py-2">
                    <span class="truncate text-slate-800">
                      {{ file.fileName }} <span class="text-slate-500">({{ file.fileSize }})</span>
                    </span>
                    <button
                      type="button"
                      (click)="removeFile(file.fileName)"
                      class="shrink-0 text-rose-600 hover:text-rose-800 font-medium cursor-pointer"
                    >
                      Remove
                    </button>
                  </li>
                }
              </ul>
            }
          </div>

          <!-- Response time -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="revert-days">
              Response Time <span class="text-rose-600">*</span>
            </label>
            <select
              id="revert-days"
              (change)="dueDays.set(+$any($event.target).value)"
              class="w-full px-2.5 py-2 border border-slate-300 rounded-lg text-xs text-slate-800 bg-white focus:outline-none focus:border-navy cursor-pointer shadow-2xs"
            >
              @for (days of dayOptions; track days) {
                <option [value]="days" [selected]="days === dueDays()">{{ days }} days</option>
              }
            </select>
          </div>

          <!-- Comment -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="revert-comment">
              Comment <span class="text-rose-600">*</span>
            </label>
            <app-option-dropdown
              inputId="revert-comment"
              placeholder="Select a comment"
              [options]="commentPresets"
              [value]="commentChoice()"
              (valueChange)="commentChoice.set($event)"
            />

            @if (commentChoice() === other) {
              <textarea
                rows="3"
                [value]="customComment()"
                (input)="customComment.set($any($event.target).value)"
                placeholder="Type your comment"
                class="w-full p-3 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-navy bg-white shadow-2xs leading-relaxed"
              ></textarea>
            }
          </div>
        </div>

        <div class="px-5 sm:px-6 py-4 border-t border-slate-200 bg-slate-50/70 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
          <button
            type="button"
            (click)="close.emit()"
            class="w-full sm:w-auto px-4 py-2 border border-slate-300 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            (click)="submit()"
            [disabled]="!isValid()"
            class="w-full sm:w-auto px-5 py-2 rounded-lg bg-navy hover:bg-[#07243c] text-white text-xs font-semibold transition-colors cursor-pointer shadow-2xs disabled:opacity-50 disabled:cursor-not-allowed"
            style="color: #ffffff !important;"
          >
            Raise Shortfall
          </button>
        </div>
      </div>
    </div>
  `
})
export class ScrutinyRevertModalComponent {
  /** Name of the organisation, shown under the title. */
  readonly applicantLabel = input('');
  /** Standard documents the department can pick from. */
  readonly documentOptions = input<string[]>([]);

  readonly confirmed = output<RevertSubmission>();
  readonly close = output<void>();

  protected readonly other = OTHER;
  protected readonly dayOptions = RESPONSE_DAY_OPTIONS;
  protected readonly commentPresets = COMMENT_PRESETS;

  protected readonly documents = signal<string[]>([]);
  protected readonly docPanelOpen = signal(false);
  protected readonly customDocOpen = signal(false);
  protected readonly customDoc = signal('');
  protected readonly sharedFiles = signal<RevertSharedFile[]>([]);
  protected readonly dueDays = signal(7);
  protected readonly commentChoice = signal('');
  protected readonly customComment = signal('');

  protected readonly comment = computed(() =>
    (this.commentChoice() === OTHER ? this.customComment() : this.commentChoice()).trim()
  );

  protected readonly isValid = computed(() => this.documents().length > 0 && this.comment().length > 0);

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    this.close.emit();
  }

  protected toggleDoc(title: string): void {
    this.documents.update(list => (list.includes(title) ? list.filter(d => d !== title) : [...list, title]));
  }

  protected addCustomDoc(): void {
    const title = this.customDoc().trim();
    if (!title) return;
    this.addDoc(title);
    this.customDoc.set('');
    this.customDocOpen.set(false);
  }

  protected removeDoc(title: string): void {
    this.documents.update(list => list.filter(d => d !== title));
  }

  protected onFilesPicked(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    if (files.length === 0) return;
    this.sharedFiles.update(current => [
      ...current,
      ...files
        .filter(file => !current.some(c => c.fileName === file.name))
        .map(file => ({
          title: file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' '),
          fileName: file.name,
          fileSize: `${Math.max(1, Math.round(file.size / 1024))} KB`
        }))
    ]);
    input.value = '';
  }

  protected removeFile(fileName: string): void {
    this.sharedFiles.update(current => current.filter(f => f.fileName !== fileName));
  }

  protected submit(): void {
    if (!this.isValid()) return;
    this.confirmed.emit({
      documents: this.documents(),
      sharedFiles: this.sharedFiles(),
      dueDays: this.dueDays(),
      comment: this.comment()
    });
  }

  private addDoc(title: string): void {
    this.documents.update(list => (list.some(d => d.toLowerCase() === title.toLowerCase()) ? list : [...list, title]));
  }
}
