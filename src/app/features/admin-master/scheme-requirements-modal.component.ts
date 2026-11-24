import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  IconComponent,
  InputDirective
} from '../../shared';
import { SchemeRequirementsService } from '../../core/services/scheme-requirements.service';
import {
  SchemeRequirementMapping,
  SchemeCustomField,
  EoiRequirementSnapshot
} from '../../core/models/scheme-requirements.model';
import { SchemeMasterItem, DocMasterItem, AnnexureMasterItem } from '../../core/models/admin-masters.model';
import { MOCK_DOC_MASTER_ITEMS, MOCK_ANNEXURE_MASTER_ITEMS } from '../../core/mock/data/admin-masters.mock';
import { DataEngineService } from '../../core/services/data-engine.service';

@Component({
  selector: 'app-scheme-requirements-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    ButtonComponent,
    IconComponent,
    InputDirective
  ],
  template: `
    <div class="space-y-5 animate-in fade-in duration-150 font-sans">
      <!-- Top Navigation Bar: Back & Done -->
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <button
          appButton
          variant="outline"
          size="sm"
          type="button"
          (click)="closeModal()"
          class="group inline-flex items-center gap-2"
        >
          <app-icon name="back" size="sm" />
          <span>Back to Scheme Master</span>
        </button>

        <button
          appButton
          size="sm"
          type="button"
          (click)="closeModal()"
          class="inline-flex items-center gap-1.5"
        >
          <app-icon name="check" size="xs" />
          <span>Done</span>
        </button>
      </div>

      <!-- Main White Container Card -->
      <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6">
        <!-- Header -->
        <div class="border-b border-slate-200 pb-4">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div class="flex items-center gap-3">
              <span class="w-10 h-10 rounded-lg bg-[#F8EDF1] text-[#7C0E44] flex items-center justify-center shrink-0">
                <app-icon name="clipboard-check" size="lg" />
              </span>
              <div class="min-w-0">
                <h1 class="m-0 text-xl sm:text-2xl font-bold text-[#7C0E44] tracking-tight leading-tight">
                  Scheme Documents, Annexures &amp; Field Configuration
                </h1>
                <div class="flex items-center gap-2.5 mt-1.5 flex-wrap">
                  <span class="text-xs text-slate-500 font-medium">Scheme:</span>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-semibold bg-[#F8EDF1] text-[#7C0E44] border border-[#EADCE2]">
                    {{ scheme()?.schemeName }}
                  </span>
                  @if (scheme()?.schemeCategory) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      Category: {{ scheme()?.schemeCategory }}
                    </span>
                  }
                  @if (scheme()?.categoryName) {
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                      EOI Category: {{ scheme()?.categoryName }}
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>

          <!-- Tab Bar -->
          <div class="mt-5 flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
            <button
              appButton
              [variant]="activeTab() === 'docs' ? 'primary' : 'ghost'"
              size="sm"
              type="button"
              (click)="activeTab.set('docs')"
            >
              Documents ({{ documents().length }})
            </button>
            <button
              appButton
              [variant]="activeTab() === 'annexures' ? 'primary' : 'ghost'"
              size="sm"
              type="button"
              (click)="activeTab.set('annexures')"
            >
              Annexures ({{ annexures().length }})
            </button>
            <button
              appButton
              [variant]="activeTab() === 'fields' ? 'primary' : 'ghost'"
              size="sm"
              type="button"
              (click)="activeTab.set('fields')"
            >
              Proposal Fields ({{ customFields().length }})
            </button>
            <button
              appButton
              [variant]="activeTab() === 'snapshots' ? 'primary' : 'ghost'"
              size="sm"
              type="button"
              (click)="activeTab.set('snapshots')"
            >
              EOI Usage &amp; History
            </button>
          </div>
        </div>

      <!-- Tab 1: Documents -->
      @if (activeTab() === 'docs') {
        <div class="space-y-4 pt-3">
          <div class="max-h-[46vh] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg shadow-2xs bg-white">
            @if (documents().length === 0) {
              <div class="p-5 text-center text-xs text-slate-500">
                No documents currently mapped to this scheme. Add one from the library below.
              </div>
            } @else {
              @for (doc of documents(); track doc.id; let idx = $index) {
                <div class="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <div class="min-w-0">
                      <span class="text-xs font-semibold text-slate-800 block truncate" [title]="doc.masterItemName">
                        {{ doc.masterItemName }}
                      </span>
                      <span class="text-[11px] text-slate-400">
                        Max size: {{ doc.maxSizeMb || 25 }} MB &bull; Formats: {{ (doc.acceptedFormats || ['PDF']).join(', ') }}
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2.5 shrink-0">
                    <button
                      appButton
                      [variant]="doc.isMandatory ? 'primary' : 'outline'"
                      size="xs"
                      type="button"
                      (click)="toggleDocMandatory(doc)"
                    >
                      <span>{{ doc.isMandatory ? 'Mandatory' : 'Optional' }}</span>
                    </button>

                    <button
                      appButton
                      variant="ghost"
                      size="xs"
                      iconOnly
                      type="button"
                      (click)="removeDocMapping(doc)"
                      title="Unlink document"
                      aria-label="Unlink document"
                    >
                      <app-icon name="trash" size="xs" class="text-rose-500 hover:text-rose-700" />
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Add Document from Library -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span class="text-xs font-bold text-slate-800 block">Add Document from Library</span>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                appInput
                size="sm"
                [(ngModel)]="selectedDocToAdd"
                class="flex-1 text-xs"
              >
                <option value="" disabled selected>Select document from Doc Master library...</option>
                @for (d of availableDocsLibrary(); track d.id) {
                  <option [value]="d.docName">{{ d.docName }}</option>
                }
              </select>
              <label class="flex items-center gap-1.5 text-xs text-slate-700 select-none cursor-pointer whitespace-nowrap px-1">
                <input
                  type="checkbox"
                  [(ngModel)]="newDocMandatory"
                  class="w-3.5 h-3.5 rounded border-slate-300 text-[#7C0E44] focus:ring-[#7C0E44]"
                />
                <span>Mandatory</span>
              </label>
              <button
                appButton
                size="sm"
                type="button"
                [disabled]="!selectedDocToAdd"
                (click)="addDocumentToScheme()"
                class="shrink-0"
              >
                <app-icon name="plus" size="xs" />
                <span>Add Document</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Tab 2: Annexures -->
      @if (activeTab() === 'annexures') {
        <div class="space-y-4 pt-3">
          <div class="max-h-[46vh] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg shadow-2xs bg-white">
            @if (annexures().length === 0) {
              <div class="p-5 text-center text-xs text-slate-500">
                No annexures currently mapped to this scheme. Add one from the library below.
              </div>
            } @else {
              @for (annex of annexures(); track annex.id; let idx = $index) {
                <div class="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <div class="min-w-0">
                      <span class="text-xs font-semibold text-slate-800 block truncate" [title]="annex.masterItemName">
                        {{ annex.masterItemName }}
                      </span>
                      <span class="text-[11px] text-emerald-700 font-medium">
                        &check; Official Template Attached (PDF) &bull; Mode: Download &amp; Upload
                      </span>
                    </div>
                  </div>

                  <div class="flex items-center gap-2.5 shrink-0">
                    <button
                      appButton
                      [variant]="annex.isMandatory ? 'primary' : 'outline'"
                      size="xs"
                      type="button"
                      (click)="toggleAnnexMandatory(annex)"
                    >
                      <span>{{ annex.isMandatory ? 'Mandatory' : 'Optional' }}</span>
                    </button>

                    <button
                      appButton
                      variant="ghost"
                      size="xs"
                      iconOnly
                      type="button"
                      (click)="removeAnnexMapping(annex)"
                      title="Unlink annexure"
                      aria-label="Unlink annexure"
                    >
                      <app-icon name="trash" size="xs" class="text-rose-500 hover:text-rose-700" />
                    </button>
                  </div>
                </div>
              }
            }
          </div>

          <!-- Add Annexure from Library -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <span class="text-xs font-bold text-slate-800 block">Add Annexure from Library</span>
            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <select
                appInput
                size="sm"
                [(ngModel)]="selectedAnnexToAdd"
                class="flex-1 text-xs"
              >
                <option value="" disabled selected>Select annexure from Annexure Master library...</option>
                @for (a of availableAnnexuresLibrary(); track a.id) {
                  <option [value]="a.annexureName">{{ a.annexureName }}</option>
                }
              </select>
              <label class="flex items-center gap-1.5 text-xs text-slate-700 select-none cursor-pointer whitespace-nowrap px-1">
                <input
                  type="checkbox"
                  [(ngModel)]="newAnnexMandatory"
                  class="w-3.5 h-3.5 rounded border-slate-300 text-[#7C0E44] focus:ring-[#7C0E44]"
                />
                <span>Mandatory</span>
              </label>
              <button
                appButton
                size="sm"
                type="button"
                [disabled]="!selectedAnnexToAdd"
                (click)="addAnnexureToScheme()"
                class="shrink-0"
              >
                <app-icon name="plus" size="xs" />
                <span>Add Annexure</span>
              </button>
            </div>
          </div>
        </div>
      }

      <!-- Tab 3: Custom Proposal Dynamic Fields -->
      @if (activeTab() === 'fields') {
        <div class="space-y-4 pt-3">
          <div class="max-h-[42vh] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg shadow-2xs bg-white">
            @if (customFields().length === 0) {
              <div class="p-5 text-center text-xs text-slate-500">
                No scheme-specific custom fields configured. Add fields below to display Step 2 "Scheme Proposal Details" in the EOI form.
              </div>
            } @else {
              @for (field of customFields(); track field.id; let idx = $index) {
                <div class="p-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <span class="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold flex items-center justify-center shrink-0">
                      {{ idx + 1 }}
                    </span>
                    <div class="min-w-0">
                      <span class="text-xs font-semibold text-slate-800 block truncate" [title]="field.label">
                        {{ field.label }}
                        @if (field.mandatory) {
                          <span class="text-rose-600 font-bold">*</span>
                        }
                      </span>
                      <span class="text-[11px] text-slate-400">
                        Type: <strong class="text-slate-600">{{ field.type }}</strong> &bull; Key: <code>{{ field.fieldKey }}</code>
                        @if (field.options && field.options.length) {
                          &bull; Options: ({{ field.options.length }})
                        }
                      </span>
                    </div>
                  </div>

                  <button
                    appButton
                    variant="ghost"
                    size="xs"
                    iconOnly
                    type="button"
                    (click)="deleteField(field)"
                    title="Delete custom field"
                    aria-label="Delete field"
                  >
                    <app-icon name="trash" size="xs" class="text-rose-500 hover:text-rose-700" />
                  </button>
                </div>
              }
            }
          </div>

          <!-- Add Custom Field Form -->
          <div class="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3 text-xs">
            <span class="font-bold text-slate-800 block">Add Scheme-Specific Custom Field</span>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Field Label *</label>
                <input
                  appInput
                  size="sm"
                  [(ngModel)]="newFieldLabel"
                  placeholder="e.g. Center Training Capacity"
                  class="w-full text-xs"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Field Key (Identifier) *</label>
                <input
                  appInput
                  size="sm"
                  [(ngModel)]="newFieldKey"
                  placeholder="e.g. centerCapacity"
                  class="w-full text-xs"
                />
              </div>

              <div>
                <label class="block text-[11px] font-semibold text-slate-600 mb-1">Field Type *</label>
                <select
                  appInput
                  size="sm"
                  [(ngModel)]="newFieldType"
                  class="w-full text-xs"
                >
                  <option value="text">Text Input</option>
                  <option value="number">Number Input</option>
                  <option value="dropdown">Dropdown (Select)</option>
                  <option value="switch">Yes/No Switch (Boolean)</option>
                  <option value="textarea">Textarea (Multiline)</option>
                </select>
              </div>

              @if (newFieldType === 'dropdown') {
                <div>
                  <label class="block text-[11px] font-semibold text-slate-600 mb-1">Options (comma-separated)</label>
                  <input
                    appInput
                    size="sm"
                    [(ngModel)]="newFieldOptionsText"
                    placeholder="Option 1, Option 2, Option 3"
                    class="w-full text-xs"
                  />
                </div>
              }

              <div class="sm:col-span-2 flex items-center justify-between pt-1">
                <label class="flex items-center gap-1.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    [(ngModel)]="newFieldMandatory"
                    class="w-3.5 h-3.5 rounded border-slate-300 text-[#7C0E44] focus:ring-[#7C0E44]"
                  />
                  <span class="font-medium text-slate-700">Mandatory (Applicant must complete)</span>
                </label>

                <button
                  appButton
                  size="sm"
                  type="button"
                  [disabled]="!newFieldLabel || !newFieldKey"
                  (click)="createCustomField()"
                >
                  <app-icon name="plus" size="xs" />
                  <span>Add Field</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Tab 4: EOI Usage & History -->
      @if (activeTab() === 'snapshots') {
        <div class="space-y-3 pt-3 text-xs">
          <div class="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-900 leading-relaxed">
            <strong>Immutable Tender Protection:</strong> When an EOI is published for this scheme, an immutable requirement snapshot is frozen. Subsequent edits to master templates will not distort active tenders.
          </div>

          <div class="max-h-[300px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg">
            @if (schemeSnapshots().length === 0) {
              <div class="p-6 text-center text-slate-500">
                No tenders currently published under this scheme.
              </div>
            } @else {
              @for (snap of schemeSnapshots(); track snap.eoiRefNo) {
                <div class="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                  <div>
                    <span class="font-bold text-slate-900 block">{{ snap.eoiRefNo }}</span>
                    <span class="text-[11px] text-slate-500">
                      Snapshotted on {{ snap.publishedAt | date:'medium' }}
                    </span>
                  </div>
                  <div class="text-right">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {{ snap.documents.length }} Docs &bull; {{ snap.annexures.length }} Annexures &bull; {{ snap.customFields.length }} Custom
                    </span>
                  </div>
                </div>
              }
            }
          </div>
        </div>
      }
      </div>
    </div>
  `
})
export class SchemeRequirementsModalComponent {
  private schemeReqService = inject(SchemeRequirementsService);
  private dataEngine = inject(DataEngineService);

  readonly isOpen = input<boolean>(false);
  readonly scheme = input<SchemeMasterItem | null>(null);
  readonly close = output<void>();

  readonly activeTab = signal<'docs' | 'annexures' | 'fields' | 'snapshots'>('docs');

  readonly documents = signal<SchemeRequirementMapping[]>([]);
  readonly annexures = signal<SchemeRequirementMapping[]>([]);
  readonly customFields = signal<SchemeCustomField[]>([]);

  // Add Document State
  readonly availableDocsLibrary = signal<DocMasterItem[]>([]);
  selectedDocToAdd = '';
  newDocMandatory = true;

  // Add Annexure State
  readonly availableAnnexuresLibrary = signal<AnnexureMasterItem[]>([]);
  selectedAnnexToAdd = '';
  newAnnexMandatory = true;

  // Add Custom Field State
  newFieldLabel = '';
  newFieldKey = '';
  newFieldType: SchemeCustomField['type'] = 'text';
  newFieldOptionsText = '';
  newFieldMandatory = true;

  readonly schemeSnapshots = computed(() => {
    const sName = this.scheme()?.schemeName?.trim().toLowerCase();
    if (!sName) return [];
    return this.schemeReqService.snapshots().filter(s => s.schemeName.trim().toLowerCase() === sName);
  });

  constructor() {
    this.loadLibraries();

    effect(() => {
      const open = this.isOpen();
      const s = this.scheme();
      if (open && s) {
        this.schemeReqService.syncWithMasters();
        this.loadLibraries();
        this.loadSchemeRequirements(s);
      }
    });
  }

  private loadLibraries(): void {
    try {
      this.dataEngine.for<DocMasterItem>('DOC_MASTERS', { idKey: 'id' }).getAll().subscribe({
        next: docs => {
          if (docs && docs.length > 0) {
            this.availableDocsLibrary.set(docs);
          } else {
            this.availableDocsLibrary.set(MOCK_DOC_MASTER_ITEMS);
          }
        },
        error: () => {
          this.availableDocsLibrary.set(MOCK_DOC_MASTER_ITEMS);
        }
      });
      this.dataEngine.for<AnnexureMasterItem>('ANNEXURE_MASTERS', { idKey: 'id' }).getAll().subscribe({
        next: annexes => {
          if (annexes && annexes.length > 0) {
            this.availableAnnexuresLibrary.set(annexes);
          } else {
            this.availableAnnexuresLibrary.set(MOCK_ANNEXURE_MASTER_ITEMS);
          }
        },
        error: () => {
          this.availableAnnexuresLibrary.set(MOCK_ANNEXURE_MASTER_ITEMS);
        }
      });
    } catch {
      this.availableDocsLibrary.set(MOCK_DOC_MASTER_ITEMS);
      this.availableAnnexuresLibrary.set(MOCK_ANNEXURE_MASTER_ITEMS);
    }
  }

  private loadSchemeRequirements(s: SchemeMasterItem): void {
    const reqs = this.schemeReqService.getRequirementsForScheme(s.schemeName);
    this.documents.set(reqs.documents);
    this.annexures.set(reqs.annexures);
    this.customFields.set(reqs.customFields);
  }

  toggleDocMandatory(doc: SchemeRequirementMapping): void {
    this.schemeReqService.toggleMandatory(doc.id);
    const s = this.scheme();
    if (s) this.loadSchemeRequirements(s);
  }

  removeDocMapping(doc: SchemeRequirementMapping): void {
    this.schemeReqService.removeMapping(doc.id);
    const s = this.scheme();
    if (s) {
      const foundDoc = this.availableDocsLibrary().find(d => d.id === doc.masterItemId || d.docName === doc.masterItemName);
      if (foundDoc && foundDoc.schemes?.some(sch => sch.trim().toLowerCase() === s.schemeName.trim().toLowerCase())) {
        const updatedSchemes = foundDoc.schemes.filter(sch => sch.trim().toLowerCase() !== s.schemeName.trim().toLowerCase());
        this.dataEngine.for<DocMasterItem>('DOC_MASTERS', { idKey: 'id' }).update(foundDoc.id, { schemes: updatedSchemes }).subscribe();
      }
      this.loadSchemeRequirements(s);
    }
  }

  addDocumentToScheme(): void {
    const s = this.scheme();
    if (!s || !this.selectedDocToAdd) return;

    const foundDoc = this.availableDocsLibrary().find(d => d.docName === this.selectedDocToAdd);
    const masterId = foundDoc?.id || `doc-${Date.now()}`;

    this.schemeReqService.addMapping({
      schemeId: s.id,
      schemeName: s.schemeName,
      schemeCode: s.categoryName || 'GENERAL',
      requirementType: 'DOCUMENT',
      masterItemId: masterId,
      masterItemCode: `DOC-${masterId.toUpperCase()}`,
      masterItemName: this.selectedDocToAdd,
      category: 'Standard',
      isMandatory: this.newDocMandatory,
      applicantCategory: 'ALL',
      displayOrder: this.documents().length + 1,
      maxSizeMb: 25,
      acceptedFormats: ['PDF', 'JPEG', 'PNG'],
      status: 'Active'
    });

    if (foundDoc && !foundDoc.schemes?.includes(s.schemeName)) {
      const updatedSchemes = [...(foundDoc.schemes || []), s.schemeName];
      this.dataEngine.for<DocMasterItem>('DOC_MASTERS', { idKey: 'id' }).update(foundDoc.id, { schemes: updatedSchemes }).subscribe();
    }

    this.selectedDocToAdd = '';
    this.loadSchemeRequirements(s);
  }

  toggleAnnexMandatory(annex: SchemeRequirementMapping): void {
    this.schemeReqService.toggleMandatory(annex.id);
    const s = this.scheme();
    if (s) this.loadSchemeRequirements(s);
  }

  removeAnnexMapping(annex: SchemeRequirementMapping): void {
    this.schemeReqService.removeMapping(annex.id);
    const s = this.scheme();
    if (s) {
      const foundAnnex = this.availableAnnexuresLibrary().find(a => a.id === annex.masterItemId || a.annexureName === annex.masterItemName);
      if (foundAnnex && foundAnnex.schemes?.some(sch => sch.trim().toLowerCase() === s.schemeName.trim().toLowerCase())) {
        const updatedSchemes = foundAnnex.schemes.filter(sch => sch.trim().toLowerCase() !== s.schemeName.trim().toLowerCase());
        this.dataEngine.for<AnnexureMasterItem>('ANNEXURE_MASTERS', { idKey: 'id' }).update(foundAnnex.id, { schemes: updatedSchemes }).subscribe();
      }
      this.loadSchemeRequirements(s);
    }
  }

  addAnnexureToScheme(): void {
    const s = this.scheme();
    if (!s || !this.selectedAnnexToAdd) return;

    const foundAnnex = this.availableAnnexuresLibrary().find(a => a.annexureName === this.selectedAnnexToAdd);
    const masterId = foundAnnex?.id || `annex-${Date.now()}`;

    this.schemeReqService.addMapping({
      schemeId: s.id,
      schemeName: s.schemeName,
      schemeCode: s.categoryName || 'GENERAL',
      requirementType: 'ANNEXURE',
      masterItemId: masterId,
      masterItemCode: `ANNEX-${masterId.toUpperCase()}`,
      masterItemName: this.selectedAnnexToAdd,
      category: 'Official Format',
      isMandatory: this.newAnnexMandatory,
      applicantCategory: 'ALL',
      displayOrder: this.annexures().length + 1,
      templateFileName: `${this.selectedAnnexToAdd.replace(/[^a-zA-Z0-9_-]/g, '_')}_Format.pdf`,
      templateVersion: '1.0',
      completionMethod: 'DOWNLOAD_UPLOAD',
      maxSizeMb: 25,
      acceptedFormats: ['PDF', 'DOCX'],
      status: 'Active'
    });

    if (foundAnnex && !foundAnnex.schemes?.includes(s.schemeName)) {
      const updatedSchemes = [...(foundAnnex.schemes || []), s.schemeName];
      this.dataEngine.for<AnnexureMasterItem>('ANNEXURE_MASTERS', { idKey: 'id' }).update(foundAnnex.id, { schemes: updatedSchemes }).subscribe();
    }

    this.selectedAnnexToAdd = '';
    this.loadSchemeRequirements(s);
  }

  createCustomField(): void {
    const s = this.scheme();
    if (!s || !this.newFieldLabel || !this.newFieldKey) return;

    const options = this.newFieldType === 'dropdown' && this.newFieldOptionsText
      ? this.newFieldOptionsText.split(',').map(o => o.trim()).filter(Boolean)
      : undefined;

    this.schemeReqService.createCustomField({
      schemeId: s.id,
      schemeCode: s.categoryName || 'GENERAL',
      schemeName: s.schemeName,
      fieldKey: this.newFieldKey.trim(),
      label: this.newFieldLabel.trim(),
      type: this.newFieldType,
      mandatory: this.newFieldMandatory,
      options,
      order: this.customFields().length + 1,
      status: 'Active'
    });

    this.newFieldLabel = '';
    this.newFieldKey = '';
    this.newFieldOptionsText = '';
    this.loadSchemeRequirements(s);
  }

  deleteField(field: SchemeCustomField): void {
    this.schemeReqService.deleteCustomField(field.id);
    const s = this.scheme();
    if (s) this.loadSchemeRequirements(s);
  }

  closeModal(): void {
    this.close.emit();
  }
}
