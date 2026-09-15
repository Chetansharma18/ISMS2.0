import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EoiService } from '../../core/services/eoi.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EoiItem } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-details',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, StatusBadgeComponent],
  template: `
    <div>
      <admin-page-header 
        [title]="eoi()?.referenceNo || 'EOI Details'"
        [subtitle]="eoi()?.title"
        icon="assignment"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: eoi()?.referenceNo || 'Details' }
        ]">
        <div header-actions class="flex items-center gap-2 flex-wrap">
          <admin-status-badge [status]="eoi()?.status || 'DRAFT'"></admin-status-badge>
          
          <a [routerLink]="['/admin/eoi', eoiId, 'form-builder']" class="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold shadow-xs">
            Form Builder
          </a>
          <a [routerLink]="['/admin/eoi', eoiId, 'preview']" class="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs">
            Preview
          </a>
          <a [routerLink]="['/admin/eoi', eoiId, 'reschedule']" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs">
            Reschedule
          </a>
          <a [routerLink]="['/admin/eoi', eoiId, 'responses']" class="px-3 py-1.5 bg-[#131A4D] hover:bg-[#1D246B] text-white rounded-lg text-xs font-bold shadow-xs">
            Responses ({{ eoi()?.applicationCount }})
          </a>
          <a [routerLink]="['/admin/eoi/edit', eoiId]" class="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg text-xs font-bold shadow-xs">
            Edit
          </a>
        </div>
      </admin-page-header>

      <div *ngIf="eoi() as item" class="space-y-6">
        <!-- Key Tender Metadata -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 space-y-4">
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Tender Reference</span>
              <span class="font-mono font-bold text-blue-900 text-sm mt-0.5 block">{{ item.referenceNo }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Version</span>
              <span class="font-mono font-bold text-slate-800 text-sm mt-0.5 block">v{{ item.version }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Scheme</span>
              <span class="font-semibold text-slate-800 text-sm mt-0.5 block truncate">{{ item.schemeName }}</span>
            </div>
            <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <span class="text-[10px] uppercase font-bold text-slate-400 block">Category</span>
              <span class="font-semibold text-slate-800 text-sm mt-0.5 block">{{ item.eoiCategory }}</span>
            </div>
          </div>

          <div>
            <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">Scope & Description</h4>
            <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              {{ item.description }}
            </p>
          </div>
        </div>

        <!-- Schedule & Timeline -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
          <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900 mb-4">Official Timeline</h3>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span class="text-slate-400 block">Published Date:</span>
              <span class="font-bold text-slate-800">{{ item.publishedDate }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Applications Start:</span>
              <span class="font-bold text-slate-800">{{ item.applicationStartDate }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Submission Deadline:</span>
              <span class="font-bold text-amber-900">{{ item.closingDate }}</span>
            </div>
            <div>
              <span class="text-slate-400 block">Tender Opening:</span>
              <span class="font-bold text-slate-800">{{ item.openingDate }}</span>
            </div>
          </div>
        </div>

        <!-- Committee & Governance -->
        <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 class="text-xs font-bold uppercase tracking-wider text-slate-900">Designated Technical Committee</h3>
            <p class="text-sm font-bold text-blue-900 mt-1">{{ item.committeeName || 'No Committee Assigned Yet' }}</p>
          </div>
          <a [routerLink]="['/admin/eoi', eoiId, 'committee']" class="px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold text-xs rounded-lg shadow-2xs">
            Manage Committee Assignment →
          </a>
        </div>
      </div>
    </div>
  `
})
export class EoiDetailsComponent implements OnInit {
  private eoiService = inject(EoiService);
  private route = inject(ActivatedRoute);

  eoiId = 'EOI-2025-001';
  eoi = signal<EoiItem | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
    }
    this.eoiService.getEoiById(this.eoiId).subscribe(e => this.eoi.set(e || null));
  }
}
