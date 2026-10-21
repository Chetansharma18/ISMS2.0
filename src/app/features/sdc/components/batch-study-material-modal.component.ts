import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import {
  ButtonComponent,
  FilterTabsComponent,
  FormInputComponent,
  FormSectionComponent,
  FormSelectComponent,
  IconComponent,
  ModalComponent,
  TableColumn,
  TableComponent
} from '../../../shared';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';
import { BatchService } from '../services/batch.service';
import {
  ChosenFile,
  STUDY_MATERIAL_KINDS,
  StudyMaterialDraft,
  formatFileSize,
  kindOf,
  sessionLabel,
  validateStudyMaterial
} from '../utils/study-material.util';
import type { StudyMaterial, StudyMaterialType } from '../models/batch.model';

type Tab = 'UPLOAD' | 'UPLOADED';

/** One line of the list of uploaded material, in the words the table shows. */
interface MaterialRow {
  id: string;
  kind: string;
  title: string;
  description: string;
  session: string;
  source: string;
  uploadedOn: string;
}

/**
 * Study Material (E-Campus) of an approved batch, in one dialog with two tabs.
 *  - Upload Material: add E-course content, the syllabus, documents, training videos, digital media or a live training
 *    video, each for the whole course or for one session.
 *  - Uploaded Material: everything uploaded so far, with View, Edit and Remove. Edit opens the material in the upload tab.
 * Only the details are kept for now; the file itself goes to the E-Campus storage when the backend exists.
 */
@Component({
  selector: 'app-batch-study-material-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ButtonComponent,
    FilterTabsComponent,
    FormInputComponent,
    FormSectionComponent,
    FormSelectComponent,
    IconComponent,
    ModalComponent,
    TableComponent
  ],
  template: `
    @if (batch(); as b) {
      <app-modal
        title="Study Material"
        [subtitle]="b.batchCode + ' • ' + b.courseName"
        size="xl"
        [closeOnBackdrop]="false"
        (close)="closed.emit()"
      >
        @let errs = errors();
        <div class="space-y-5">
          <app-filter-tabs [options]="tabs()" [value]="tab()" (valueChange)="onTab($event)" />

          @if (tab() === 'UPLOAD') {
            <app-form-section class="block" [title]="editingId() ? 'Edit Material' : 'Add Material'">
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
                <div class="lg:col-span-6 sm:col-span-1">
                  <app-form-select
                    label="Material Type"
                    [required]="true"
                    [items]="kindItems"
                    [value]="type()"
                    [hint]="kind().hint"
                    (valueChange)="onType($event)"
                  ></app-form-select>
                </div>
                <div class="lg:col-span-6 sm:col-span-1">
                  <app-form-select
                    label="Applies To"
                    [required]="true"
                    [items]="scopeItems"
                    [value]="scope()"
                    hint="The whole course, or one session of it"
                    (valueChange)="scope.set($event === 'SESSION' ? 'SESSION' : 'COURSE')"
                  ></app-form-select>
                </div>

                @if (scope() === 'SESSION') {
                  <div class="lg:col-span-3 sm:col-span-1">
                    <app-form-input
                      label="Session No."
                      type="number"
                      placeholder="e.g. 3"
                      [required]="true"
                      [value]="sessionNo()"
                      (valueChange)="sessionNo.set($event)"
                      [error]="errs['sessionNo']"
                    ></app-form-input>
                  </div>
                  <div class="lg:col-span-9 sm:col-span-1">
                    <app-form-input
                      label="Session Topic"
                      placeholder="e.g. Safety basics"
                      [maxLength]="120"
                      [value]="sessionTopic()"
                      (valueChange)="sessionTopic.set($event)"
                    ></app-form-input>
                  </div>
                }

                <div class="lg:col-span-12 sm:col-span-2">
                  <app-form-input
                    label="Title"
                    placeholder="Name of the material"
                    [required]="true"
                    [maxLength]="120"
                    [value]="title()"
                    (valueChange)="title.set($event)"
                    [error]="errs['title']"
                  ></app-form-input>
                </div>
                <div class="lg:col-span-12 sm:col-span-2">
                  <app-form-input
                    label="Description"
                    placeholder="What the material covers (optional)"
                    [maxLength]="300"
                    [value]="description()"
                    (valueChange)="description.set($event)"
                  ></app-form-input>
                </div>

                @if (kind().mode === 'file') {
                  <div class="lg:col-span-12 sm:col-span-2">
                    <div class="text-xs sm:text-[12.5px] font-medium leading-[18px] text-[#1F2933] mb-1">
                      File <span class="text-rose-600 font-bold">*</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-3">
                      <button appButton variant="outline" size="sm" type="button" (click)="fileInput.click()">
                        <app-icon name="upload" size="sm" />
                        <span>{{ file() ? 'Change File' : 'Choose File' }}</span>
                      </button>
                      <input #fileInput type="file" [accept]="kind().accept" (change)="onFile($event)" class="hidden" />
                      @if (file(); as chosen) {
                        <span class="text-xs text-slate-700 tabular-nums">{{ chosen.name }} • {{ fileSize(chosen) }}</span>
                      } @else {
                        <span class="text-[11px] text-slate-500">Up to {{ kind().maxMb }} MB</span>
                      }
                    </div>
                    @if (errs['file']) {
                      <div class="text-rose-600 font-medium mt-0.5 flex items-center gap-1 leading-tight" style="font-size: 11px !important; line-height: 14px !important;">
                        <app-icon name="error" size="xs" [stroke]="2.5" />
                        <span>{{ errs['file'] }}</span>
                      </div>
                    }
                  </div>
                } @else {
                  <div class="lg:col-span-6 sm:col-span-2">
                    <app-form-input
                      label="Live Session Link"
                      placeholder="https://"
                      [required]="true"
                      [value]="link()"
                      (valueChange)="link.set($event)"
                      [error]="errs['link']"
                    ></app-form-input>
                  </div>
                  <div class="lg:col-span-3 sm:col-span-1">
                    <app-form-input
                      label="Date"
                      type="date"
                      [required]="true"
                      [value]="liveDate()"
                      (valueChange)="liveDate.set($event)"
                      [error]="errs['liveDate']"
                    ></app-form-input>
                  </div>
                  <div class="lg:col-span-3 sm:col-span-1">
                    <app-form-input
                      label="Time"
                      type="time"
                      [required]="true"
                      [value]="liveTime()"
                      (valueChange)="liveTime.set($event)"
                      [error]="errs['liveTime']"
                    ></app-form-input>
                  </div>
                }
              </div>

              <div class="mt-3 flex items-center justify-end gap-2.5">
                @if (editingId()) {
                  <button appButton variant="outline" type="button" (click)="cancelEdit()">Cancel</button>
                }
                <button appButton type="button" (click)="save()">
                  <app-icon [name]="editingId() ? 'check' : 'upload'" size="sm" />
                  <span>{{ saveLabel() }}</span>
                </button>
              </div>
            </app-form-section>
          } @else {
            <app-form-section class="block" [title]="'Uploaded Material (' + rows().length + ')'">
              <app-table
                [columns]="columns"
                [data]="rows()"
                emptyMessage="No study material has been uploaded for this batch yet. Use the Upload Material tab to add some."
                [customTemplates]="{ title: titleTpl, action: actionTpl }"
              />
            </app-form-section>
          }
        </div>

        <ng-container modalFooter>
          <button appButton variant="outline" type="button" (click)="closed.emit()">Close</button>
        </ng-container>
      </app-modal>
    }

    <!-- Title with its description below -->
    <ng-template #titleTpl let-row>
      <div>
        <div class="font-normal text-slate-800 text-[13px] leading-tight">{{ row.title }}</div>
        @if (row.description) {
          <div class="text-[11px] text-secondary leading-tight mt-px">{{ row.description }}</div>
        }
      </div>
    </ng-template>

    <!-- View, Edit and Remove of an uploaded material -->
    <ng-template #actionTpl let-row>
      <div class="flex items-center justify-center gap-1">
        <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="view(row.id)" title="View" aria-label="View">
          <app-icon name="eye" />
        </button>
        <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="edit(row.id)" title="Edit" aria-label="Edit">
          <app-icon name="edit" />
        </button>
        <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="remove(row.id)" title="Remove" aria-label="Remove">
          <app-icon name="trash" />
        </button>
      </div>
    </ng-template>
  `
})
export class BatchStudyMaterialModalComponent {
  private readonly batches = inject(BatchService);
  private readonly docViewer = inject(DocumentViewerService);

  /** Id of the approved batch the material is for. */
  readonly batchId = input.required<string>();
  readonly closed = output<void>();

  protected readonly batch = computed(() => this.batches.getBatchById(this.batchId()));

  protected readonly kindItems = STUDY_MATERIAL_KINDS.map(kind => ({ value: kind.id, label: kind.label }));
  protected readonly scopeItems = [
    { value: 'COURSE', label: 'Whole Course' },
    { value: 'SESSION', label: 'A Specific Session' }
  ];

  protected readonly tab = signal<Tab>('UPLOAD');
  /** Id of the material being edited; none while a new one is being added. */
  protected readonly editingId = signal<string | null>(null);

  protected readonly type = signal<StudyMaterialType>('E_COURSE_CONTENT');
  protected readonly scope = signal<'COURSE' | 'SESSION'>('COURSE');
  protected readonly sessionNo = signal<string>('');
  protected readonly sessionTopic = signal<string>('');
  protected readonly title = signal<string>('');
  protected readonly description = signal<string>('');
  protected readonly file = signal<ChosenFile | null>(null);
  protected readonly link = signal<string>('');
  protected readonly liveDate = signal<string>('');
  protected readonly liveTime = signal<string>('');
  /** Field messages show after the first Save press, then follow the form. */
  private readonly submitted = signal<boolean>(false);

  protected readonly kind = computed(() => kindOf(this.type()));
  protected readonly saveLabel = computed(() => {
    if (this.editingId()) return 'Save Changes';
    return this.kind().mode === 'link' ? 'Add Live Session' : 'Upload';
  });

  protected readonly tabs = computed(() => [
    { id: 'UPLOAD', label: 'Upload Material', count: undefined },
    { id: 'UPLOADED', label: 'Uploaded Material', count: this.rows().length }
  ]);

  private readonly draft = computed<StudyMaterialDraft>(() => ({
    type: this.type(),
    title: this.title(),
    scope: this.scope(),
    sessionNo: this.sessionNo(),
    sessionTopic: this.sessionTopic(),
    file: this.file(),
    link: this.link(),
    liveDate: this.liveDate(),
    liveTime: this.liveTime()
  }));

  protected readonly errors = computed<Record<string, string>>(() => (this.submitted() ? validateStudyMaterial(this.draft()) : {}));

  protected readonly columns: TableColumn<MaterialRow>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'kind', label: 'Type', width: 'min-w-[140px]' },
    { key: 'title', label: 'Title', type: 'custom', width: 'min-w-[190px]' },
    { key: 'session', label: 'Session', width: 'min-w-[150px]' },
    { key: 'source', label: 'File / Link', width: 'min-w-[200px]' },
    { key: 'uploadedOn', label: 'Uploaded On', align: 'center', width: 'w-28' },
    { key: 'action', label: 'Actions', type: 'custom', align: 'center', width: 'w-32' }
  ];

  protected readonly rows = computed<MaterialRow[]>(() =>
    (this.batch()?.studyMaterials ?? []).map(material => this.toRow(material))
  );

  private toRow(material: StudyMaterial): MaterialRow {
    const live = material.type === 'LIVE_VIDEO';
    return {
      id: material.id,
      kind: kindOf(material.type).label,
      title: material.title,
      description: material.description ?? '',
      session: sessionLabel(material),
      source: live
        ? `${material.link ?? ''} (${material.liveDate ?? ''} ${material.liveTime ?? ''})`.trim()
        : `${material.fileName ?? ''}${material.fileSize ? ' • ' + material.fileSize : ''}`,
      uploadedOn: material.uploadedAt.slice(0, 10)
    };
  }

  private materialOf(id: string): StudyMaterial | undefined {
    return this.batch()?.studyMaterials?.find(material => material.id === id);
  }

  protected fileSize(file: ChosenFile): string {
    return file.sizeLabel ?? formatFileSize(file.sizeBytes);
  }

  protected onTab(id: string): void {
    // Leaving the upload tab while editing drops the edit, so the form never holds a half-edited material unseen.
    if (id !== 'UPLOAD' && this.editingId()) this.cancelEdit(false);
    this.tab.set(id === 'UPLOADED' ? 'UPLOADED' : 'UPLOAD');
  }

  /** Another kind needs another file or link, so what was chosen for the last kind is dropped. */
  protected onType(value: string): void {
    this.type.set(value as StudyMaterialType);
    this.file.set(null);
    this.link.set('');
    this.liveDate.set('');
    this.liveTime.set('');
  }

  protected onFile(event: Event): void {
    const input = event.target as HTMLInputElement;
    const picked = input.files?.[0];
    if (picked) this.file.set({ name: picked.name, sizeBytes: picked.size, mimeType: picked.type });
    input.value = '';
  }

  /** Opens a file material in the viewer, or a live session in its own tab. */
  protected view(id: string): void {
    const material = this.materialOf(id);
    if (!material) return;
    if (material.type === 'LIVE_VIDEO' && material.link) {
      window.open(material.link, '_blank', 'noopener');
      return;
    }
    this.docViewer.openDocument({ fileName: material.fileName, fileSize: material.fileSize, status: 'uploaded' }, material.title);
  }

  /** Loads the material into the upload form to change it. */
  protected edit(id: string): void {
    const material = this.materialOf(id);
    if (!material) return;
    this.editingId.set(id);
    this.type.set(material.type);
    this.scope.set(material.sessionNo ? 'SESSION' : 'COURSE');
    this.sessionNo.set(material.sessionNo ? String(material.sessionNo) : '');
    this.sessionTopic.set(material.sessionTopic ?? '');
    this.title.set(material.title);
    this.description.set(material.description ?? '');
    this.link.set(material.link ?? '');
    this.liveDate.set(material.liveDate ?? '');
    this.liveTime.set(material.liveTime ?? '');
    // The file already uploaded stays unless another one is chosen.
    this.file.set(
      material.fileName ? { name: material.fileName, sizeBytes: 0, mimeType: material.fileMime ?? '', sizeLabel: material.fileSize } : null
    );
    this.submitted.set(false);
    this.tab.set('UPLOAD');
  }

  protected cancelEdit(showList = true): void {
    this.editingId.set(null);
    this.resetForm();
    if (showList) this.tab.set('UPLOADED');
  }

  protected save(): void {
    this.submitted.set(true);
    if (Object.keys(validateStudyMaterial(this.draft())).length > 0) return;

    const draft = this.draft();
    const live = this.kind().mode === 'link';
    const session = draft.scope === 'SESSION';
    const file = draft.file;
    const material = {
      type: draft.type,
      title: draft.title.trim(),
      description: this.description().trim() || undefined,
      sessionNo: session ? Number(draft.sessionNo) : undefined,
      sessionTopic: session ? draft.sessionTopic.trim() || undefined : undefined,
      fileName: live ? undefined : file?.name,
      fileSize: live || !file ? undefined : this.fileSize(file),
      fileMime: live ? undefined : file?.mimeType || undefined,
      link: live ? draft.link.trim() : undefined,
      liveDate: live ? draft.liveDate : undefined,
      liveTime: live ? draft.liveTime : undefined
    };

    const editing = this.editingId();
    if (editing) {
      this.batches.updateStudyMaterial(this.batchId(), editing, material);
      this.editingId.set(null);
      this.resetForm();
      // The changed material shows in the list.
      this.tab.set('UPLOADED');
      return;
    }
    this.batches.addStudyMaterial(this.batchId(), material);
    // Ready for the next one: the kind and the course/session choice stay, the rest is cleared.
    this.resetForm();
  }

  protected remove(id: string): void {
    const material = this.materialOf(id);
    if (!material || !confirm(`Remove "${material.title}" from the study material of this batch?`)) return;
    this.batches.removeStudyMaterial(this.batchId(), id);
    if (this.editingId() === id) this.cancelEdit(false);
  }

  private resetForm(): void {
    this.title.set('');
    this.description.set('');
    this.sessionNo.set('');
    this.sessionTopic.set('');
    this.file.set(null);
    this.link.set('');
    this.liveDate.set('');
    this.liveTime.set('');
    this.submitted.set(false);
  }
}
