import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NgClass } from '@angular/common';
import { SchemeFormState } from '../scheme-form.state';

/** Step 3: upload the 16 proposal documents. */
@Component({
  selector: 'app-step3-upload-documents',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NgClass],
  host: { class: 'block' },
  template: `
    <div class="space-y-6 font-sans">
      
      <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-6">
        
        <!-- Header Strip with "Attach All Mandated Annexures" -->
        <div class="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 class="text-base sm:text-lg font-bold text-navy tracking-tight">
              Mandatory EOI Proposal Documents Checklist (16 Documents)
            </h3>
            <p class="text-xs text-slate-500 mt-1">
              Separated into Mandatory Statutory Documents, Official Scheme Annexures, and Supporting Documents.
            </p>
          </div>

          <button
            type="button"
            (click)="state.attachAllSampleDocs()"
            class="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          >
            <span>Attach All Mandated Annexures</span>
          </button>
        </div>

        <!-- Filter Tabs matching user screenshot -->
        <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
          
          <button
            type="button"
            (click)="state.selectedDocTab.set('all')"
            class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0"
            [ngClass]="state.selectedDocTab() === 'all' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            All Documents (16)
          </button>

          <button
            type="button"
            (click)="state.selectedDocTab.set('mandatory')"
            class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            [ngClass]="state.selectedDocTab() === 'mandatory' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            <span>1. Mandatory Statutory Documents</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="state.selectedDocTab() === 'mandatory' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 font-bold'">
              {{ state.mandatoryAttachedCount() }}/6
            </span>
          </button>

          <button
            type="button"
            (click)="state.selectedDocTab.set('annexure')"
            class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            [ngClass]="state.selectedDocTab() === 'annexure' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            <span>2. Scheme Annexures</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="state.selectedDocTab() === 'annexure' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700 font-bold'">
              {{ state.annexureAttachedCount() }}/8
            </span>
          </button>

          <button
            type="button"
            (click)="state.selectedDocTab.set('remaining')"
            class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
            [ngClass]="state.selectedDocTab() === 'remaining' ? 'bg-navy text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
          >
            <span>3. Remaining Documents</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="state.selectedDocTab() === 'remaining' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 font-bold'">
              {{ state.remainingAttachedCount() }}/2
            </span>
          </button>

        </div>

        <!-- 16 Document Cards Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-2">
          @for (doc of state.filteredDocuments(); track doc.id) {
            <div class="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs">
              
              <!-- Left: Number badge, title, tag, status -->
              <div class="flex items-start gap-3 min-w-0">
                
                <!-- Number Badge -->
                <span
                  class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                  [ngClass]="{
                    'bg-rose-100 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                    'bg-sky-100 text-sky-700 border border-sky-200': doc.category === 'annexure',
                    'bg-slate-100 text-slate-700 border border-slate-200': doc.category === 'remaining'
                  }"
                >
                  {{ doc.id }}
                </span>

                <!-- Name & Status -->
                <div class="min-w-0">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="font-bold text-slate-800 text-xs sm:text-[12.5px] leading-tight">
                      {{ doc.name }}
                    </span>
                    
                    <!-- Tag Pill -->
                    @if (doc.category === 'mandatory') {
                      <span class="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                        Mandatory
                      </span>
                    } @else if (doc.category === 'annexure') {
                      <span class="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                        Annexure
                      </span>
                    } @else {
                      <span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                        Supporting
                      </span>
                    }
                  </div>

                  @if (doc.status === 'uploaded' && doc.fileName) {
                    <span class="text-[11px] font-mono text-slate-600 block mt-1 truncate" title="{{ doc.fileName }} ({{ doc.fileSize }})">
                      {{ doc.fileName }} ({{ doc.fileSize }})
                    </span>
                  }
                </div>

              </div>

              <!-- Right Action Button -->
              <div class="flex items-center gap-1.5 shrink-0">
                @if (doc.status === 'pending') {
                  <label class="px-3.5 py-1.5 bg-navy hover:bg-navy-dark text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1">
                    <span>Upload PDF</span>
                    <input type="file" (change)="state.onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                  </label>
                } @else {
                  <button
                    type="button"
                    (click)="state.viewDoc(doc.fileName, doc.name, doc.fileSize)"
                    class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer"
                  >
                    View
                  </button>
                  <label class="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-ocean rounded-md text-xs font-medium cursor-pointer">
                    Replace
                    <input type="file" (change)="state.onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                  </label>
                }
              </div>

            </div>
          }
        </div>

      </div>

      <!-- Footer Action Bar -->
      <div class="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
        <button
          type="button"
          (click)="state.goToStep(2)"
          class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
        >
          &larr; Back to OTR Profile
        </button>

        <button
          type="button"
          (click)="state.goToStep(4)"
          class="px-6 py-2.5 bg-navy hover:bg-navy-dark text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          Proceed to Complete Preview &rarr;
        </button>
      </div>

    </div>
  `
})
export class Step3UploadDocumentsComponent {
  protected readonly state = inject(SchemeFormState);
}
