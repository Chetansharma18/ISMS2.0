import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../../core/services/eoi.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { CorrigendumAmendment, EoiItem } from '../../core/models/admin.models';

@Component({
  selector: 'admin-amendments',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    PageHeaderComponent, 
    StatusBadgeComponent, 
    ModalComponent
  ],
  template: `
    <div>
      <admin-page-header 
        [title]="'Corrigendum & Amendments: ' + (eoi()?.referenceNo || eoiId)"
        subtitle="Historical archive of official Gazetted Corrigendum notices, scope modifications, and tender clarifications"
        icon="history_edu"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Corrigendum & Amendments' }
        ]">
        <div header-actions class="flex items-center gap-2">
          <a 
            [routerLink]="['/admin/eoi', eoiId, 'reschedule']" 
            class="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors">
            <span class="material-symbols-outlined text-[18px]">update</span>
            Reschedule & Issue Corrigendum
          </a>
        </div>
      </admin-page-header>

      <!-- Table View -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-600 border-collapse">
            <thead class="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th class="px-4 py-3.5">Version</th>
                <th class="px-4 py-3.5">Type</th>
                <th class="px-4 py-3.5">Document Number</th>
                <th class="px-4 py-3.5">Title / Subject</th>
                <th class="px-4 py-3.5">Published Date</th>
                <th class="px-4 py-3.5">Attachment</th>
                <th class="px-4 py-3.5">Published By</th>
                <th class="px-4 py-3.5">Status</th>
                <th class="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              <tr *ngFor="let c of corrigendums()" class="hover:bg-slate-50/80 transition-colors">
                <td class="px-4 py-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                  v{{ c.version }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <span 
                    class="px-2 py-0.5 rounded-full text-[10px] font-bold"
                    [ngClass]="c.type === 'Corrigendum' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-indigo-100 text-indigo-900 border border-indigo-300'">
                    {{ c.type }}
                  </span>
                </td>
                <td class="px-4 py-3 font-mono font-semibold text-slate-800 whitespace-nowrap">
                  {{ c.documentNumber }}
                </td>
                <td class="px-4 py-3 max-w-sm">
                  <div class="font-bold text-slate-900 line-clamp-1">{{ c.title }}</div>
                  <div class="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{{ c.description }}</div>
                </td>
                <td class="px-4 py-3 whitespace-nowrap text-slate-600">
                  {{ c.publishedDate }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <div class="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 cursor-pointer">
                    <span class="material-symbols-outlined text-[16px]">picture_as_pdf</span>
                    <span class="font-semibold underline truncate max-w-[140px]">{{ c.attachmentFileName }}</span>
                  </div>
                </td>
                <td class="px-4 py-3 text-slate-600 whitespace-nowrap">
                  {{ c.publishedBy }}
                </td>
                <td class="px-4 py-3 whitespace-nowrap">
                  <admin-status-badge [status]="c.status"></admin-status-badge>
                </td>
                <td class="px-4 py-3 text-right whitespace-nowrap">
                  <div class="flex items-center justify-end gap-1">
                    <button 
                      (click)="viewDoc(c)"
                      class="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="View Details">
                      <span class="material-symbols-outlined text-[18px]">visibility</span>
                    </button>
                    <button 
                      (click)="downloadDoc(c)"
                      class="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-slate-100 rounded-md transition-colors"
                      title="Download Notification PDF">
                      <span class="material-symbols-outlined text-[18px]">download</span>
                    </button>
                  </div>
                </td>
              </tr>

              <tr *ngIf="corrigendums().length === 0">
                <td colspan="9" class="py-12 text-center text-slate-400">
                  <span class="material-symbols-outlined text-[36px] text-slate-300 block mb-1">history_edu</span>
                  No Corrigendums or Amendments issued for this EOI.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- View Modal -->
      <admin-modal 
        [isOpen]="isModalOpen()" 
        [title]="selectedDoc()?.title || 'Notice Details'" 
        icon="history_edu"
        maxWidth="lg"
        (close)="isModalOpen.set(false)">
        <div modal-body *ngIf="selectedDoc() as doc" class="space-y-4 text-xs text-slate-700">
          <div class="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Doc Number</span>
              <span class="font-mono font-bold text-slate-900">{{ doc.documentNumber }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Version Tag</span>
              <span class="font-bold text-blue-900">Version {{ doc.version }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Published Date</span>
              <span class="font-semibold text-slate-800">{{ doc.publishedDate }}</span>
            </div>
            <div>
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Signatory</span>
              <span class="font-semibold text-slate-800">{{ doc.publishedBy }}</span>
            </div>
          </div>

          <div>
            <h4 class="font-bold text-slate-900 mb-1">Reason & Content</h4>
            <p class="text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200">
              {{ doc.description }}
            </p>
          </div>

          <div class="p-3 bg-blue-50 rounded-lg border border-blue-200 flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="material-symbols-outlined text-[20px] text-blue-700">description</span>
              <div>
                <span class="font-bold text-blue-900 block">{{ doc.attachmentFileName }}</span>
                <span class="text-[10px] text-blue-700">{{ doc.attachmentFileSize }}</span>
              </div>
            </div>
            <button 
              (click)="downloadDoc(doc)"
              class="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold shadow-2xs flex items-center gap-1">
              <span class="material-symbols-outlined text-[14px]">download</span>
              Download
            </button>
          </div>
        </div>

        <div modal-footer>
          <button (click)="isModalOpen.set(false)" class="px-4 py-1.5 border border-slate-300 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-100">
            Close
          </button>
        </div>
      </admin-modal>

    </div>
  `
})
export class AmendmentsComponent implements OnInit {
  private eoiService = inject(EoiService);
  private toastService = inject(ToastService);
  private route = inject(ActivatedRoute);

  eoiId = 'EOI-2025-001';
  eoi = signal<EoiItem | null>(null);
  corrigendums = signal<CorrigendumAmendment[]>([]);

  selectedDoc = signal<CorrigendumAmendment | null>(null);
  isModalOpen = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
    }
    this.eoiService.getEoiById(this.eoiId).subscribe(e => this.eoi.set(e || null));
    this.loadCorrigendums();
  }

  loadCorrigendums(): void {
    this.eoiService.getCorrigendums(this.eoiId).subscribe(list => this.corrigendums.set(list));
  }

  viewDoc(doc: CorrigendumAmendment): void {
    this.selectedDoc.set(doc);
    this.isModalOpen.set(true);
  }

  downloadDoc(doc: CorrigendumAmendment): void {
    this.toastService.success('Download Initiated', `Downloading ${doc.attachmentFileName}`);
  }
}
