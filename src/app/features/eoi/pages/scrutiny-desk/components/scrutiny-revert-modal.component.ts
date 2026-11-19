import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { ButtonComponent, DropdownComponent, IconComponent, InputDirective, ModalComponent } from '../../../../../shared';
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
  imports: [ButtonComponent, DropdownComponent, IconComponent, InputDirective, ModalComponent, OptionDropdownComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [title]="modalTitle()" [subtitle]="applicantLabel()" size="md" (close)="close.emit()">
        <div class="space-y-5 text-xs">

          <!-- Documents asked for -->
          <div class="space-y-2">
            <label class="block text-xs font-semibold text-slate-800" for="revert-doc">
              {{ docLabel() }} <span class="text-rose-600">*</span>
            </label>
            <!-- Multi-select dropdown -->
            <app-dropdown
              multiple
              inputId="revert-doc"
              placeholder="Select documents"
              [options]="documentOptions()"
              [values]="documents()"
              [maxLabels]="0"
              [footer]="true"
              otherLabel="Other (type your own)"
              [otherSelected]="customDocOpen()"
              (optionToggled)="toggleDoc($event)"
              (other)="customDocOpen.set(!customDocOpen())"
            />

            @if (customDocOpen()) {
              <div class="flex items-center gap-2">
                <input
                  appInput
                  type="text"
                  [value]="customDoc()"
                  (input)="customDoc.set($any($event.target).value)"
                  (keydown.enter)="addCustomDoc(); $event.preventDefault()"
                  placeholder="Type the document name"
                  class="flex-1"
                />
                <button appButton size="sm" (click)="addCustomDoc()" [disabled]="!customDoc().trim()">Add</button>
              </div>
            }

            @if (documents().length > 0) {
              <div class="flex flex-wrap gap-1.5">
                @for (doc of documents(); track doc) {
                  <span class="inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md bg-amber-50 border border-amber-300 text-amber-900 text-xs font-medium">
                    <span>{{ doc }}</span>
                    <button appButton variant="ghost" size="sm" iconOnly class="-my-2" (click)="removeDoc(doc)" [attr.aria-label]="'Remove ' + doc">
                      <app-icon name="close" size="xs" />
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
              <button appButton variant="outline" size="sm" (click)="fileInput.click()">Upload</button>
            </div>
            <input #fileInput type="file" multiple class="hidden" (change)="onFilesPicked($event)" />

            @if (sharedFiles().length > 0) {
              <ul class="m-0 p-0 list-none border border-slate-200 rounded-lg divide-y divide-slate-200 bg-white">
                @for (file of sharedFiles(); track file.fileName) {
                  <li class="flex items-center justify-between gap-3 px-3 py-2">
                    <span class="truncate text-slate-800">
                      {{ file.fileName }} <span class="text-slate-500">({{ file.fileSize }})</span>
                    </span>
                    <button appButton variant="ghost" size="sm" class="shrink-0" (click)="removeFile(file.fileName)">Remove</button>
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
              appInput
              id="revert-days"
              (change)="dueDays.set(+$any($event.target).value)"
              class="w-full cursor-pointer"
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
                appInput
                rows="3"
                [value]="customComment()"
                (input)="customComment.set($any($event.target).value)"
                placeholder="Type your comment"
                class="w-full"
              ></textarea>
            }
          </div>
        </div>

        <ng-container modalFooter>
          <button appButton variant="outline" (click)="close.emit()">Cancel</button>
          <button appButton (click)="submit()" [disabled]="!isValid()">{{ submitLabel() }}</button>
        </ng-container>
    </app-modal>
  `
})
export class ScrutinyRevertModalComponent {
  /** Name of the organisation, shown under the title. */
  readonly applicantLabel = input('');
  /** Standard documents the department can pick from. */
  readonly documentOptions = input<string[]>([]);
  /** Whether this modal was opened from the Accept Appeal flow */
  readonly isAppeal = input<boolean>(true);

  readonly confirmed = output<RevertSubmission>();
  readonly close = output<void>();

  readonly modalTitle = computed(() => (this.isAppeal() ? 'Accept Appeal' : 'Raise Shortfall'));
  readonly submitLabel = computed(() => (this.isAppeal() ? 'Accept' : 'Raise Shortfall'));
  readonly docLabel = computed(() => (this.isAppeal() ? 'Appeal Documents' : 'Shortfall Documents'));

  protected readonly other = OTHER;
  protected readonly dayOptions = RESPONSE_DAY_OPTIONS;
  protected readonly commentPresets = COMMENT_PRESETS;

  protected readonly documents = signal<string[]>([]);
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
