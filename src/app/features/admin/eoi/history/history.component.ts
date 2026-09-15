import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { EoiService } from '../../core/services/eoi.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { EoiVersionHistory, EoiItem } from '../../core/models/admin.models';

@Component({
  selector: 'admin-eoi-history',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent],
  template: `
    <div>
      <admin-page-header 
        [title]="'Version History & Audit: ' + (eoi()?.referenceNo || eoiId)"
        subtitle="Complete chronological lifecycle audit trail showing all version increments, schedule modifications, and tender amendments"
        icon="history"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Version History' }
        ]">
        <div header-actions>
          <a 
            routerLink="/admin/eoi" 
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            ← Back to All EOIs
          </a>
        </div>
      </admin-page-header>

      <!-- Versions Timeline Card -->
      <div class="bg-white rounded-xl shadow-xs border border-slate-200 p-6">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-blue-700 text-[22px]">timeline</span>
            <h3 class="text-sm font-bold text-slate-900">Version Changelog & Diffs</h3>
          </div>
          <span class="text-xs font-semibold text-slate-500">
            Current Version: <strong class="text-blue-900 font-mono">v{{ eoi()?.version || '1.1' }}</strong>
          </span>
        </div>

        <div class="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          <div *ngFor="let h of historyList()" class="relative group">
            <!-- Bullet Point -->
            <div class="absolute -left-[27px] top-1 w-5 h-5 rounded-full bg-white border-4 border-blue-600 shadow-2xs"></div>

            <div class="bg-slate-50/70 p-4 rounded-xl border border-slate-200 hover:border-blue-300 transition-all space-y-2">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="px-2 py-0.5 bg-blue-900 text-white rounded font-mono font-bold text-xs">
                    Version {{ h.version }}
                  </span>
                  <span class="font-bold text-slate-800 text-xs">{{ h.changeType }}</span>
                  <span class="text-[11px] text-slate-500">• By {{ h.changedBy }}</span>
                </div>
                <span class="text-[11px] text-slate-400 font-mono">
                  {{ h.date | date:'dd-MM-yyyy HH:mm:ss' }}
                </span>
              </div>

              <div class="text-xs">
                <span class="font-bold text-slate-700 block mb-0.5">Reason:</span>
                <p class="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">{{ h.reason }}</p>
              </div>

              <!-- Diffs: Old vs New Value -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div class="p-2.5 bg-rose-50/60 border border-rose-200 rounded-lg">
                  <span class="text-[10px] uppercase font-bold text-rose-700 block">Previous State</span>
                  <span class="font-medium text-rose-900">{{ h.oldValue }}</span>
                </div>
                <div class="p-2.5 bg-emerald-50/60 border border-emerald-200 rounded-lg">
                  <span class="text-[10px] uppercase font-bold text-emerald-700 block">Updated State</span>
                  <span class="font-medium text-emerald-900">{{ h.newValue }}</span>
                </div>
              </div>

              <!-- Attached Document if any -->
              <div *ngIf="h.documentTitle" class="pt-1 flex items-center gap-1.5 text-xs text-blue-700 font-semibold">
                <span class="material-symbols-outlined text-[16px]">attachment</span>
                <span>Attached: {{ h.documentTitle }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HistoryComponent implements OnInit {
  private eoiService = inject(EoiService);
  private route = inject(ActivatedRoute);

  eoiId = 'EOI-2025-001';
  eoi = signal<EoiItem | null>(null);
  historyList = signal<EoiVersionHistory[]>([]);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.eoiId = id;
    }
    this.eoiService.getEoiById(this.eoiId).subscribe(e => this.eoi.set(e || null));
    this.eoiService.getVersionHistory(this.eoiId).subscribe(list => this.historyList.set(list));
  }
}
