import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiService } from '../../core/services/eoi.service';
import { CommitteeService } from '../../core/services/committee.service';
import { ToastService } from '../../core/services/toast.service';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { StatusBadgeComponent } from '../../shared/components/status-badge/status-badge.component';
import { EoiItem, Committee } from '../../core/models/admin.models';

@Component({
  selector: 'admin-committee-assignment',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    StatusBadgeComponent
  ],
  styles: [`
    .eoi-select { transition: box-shadow 0.15s; }
    .eoi-select:focus { box-shadow: 0 0 0 3px rgba(37,99,235,0.18); }
    .member-chip { animation: fadein 0.2s ease; }
    @keyframes fadein { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: none; } }
  `],
  template: `
    <div>
      <admin-page-header
        title="EOI Committee Assignment"
        subtitle="Select an EOI, then assign or replace the designated Approval & Technical Scrutiny Committee"
        icon="groups"
        [breadcrumbs]="[
          { label: 'EOI Management', url: '/admin/eoi' },
          { label: 'Committee Assignment' }
        ]">
        <div header-actions class="flex items-center gap-2">
          <a
            routerLink="/admin/committees"
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
            <span class="material-symbols-outlined text-[16px]">manage_accounts</span>
            Manage Committees
          </a>
          <a
            routerLink="/admin/eoi"
            class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
            ← Back to All EOIs
          </a>
        </div>
      </admin-page-header>

      <!-- STEP 1: EOI SELECTOR -->
      <div class="bg-white rounded-xl border border-slate-200 shadow-xs p-6 mb-6">
        <div class="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
          <span class="material-symbols-outlined text-blue-700 text-[20px]">article</span>
          <div>
            <h3 class="text-sm font-bold text-slate-900">Step 1: Select EOI</h3>
            <p class="text-xs text-slate-500">Choose the Expression of Interest for committee assignment</p>
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
          <div class="lg:col-span-2">
            <label class="block text-xs font-bold text-slate-700 mb-1">
              EOI Reference / Title *
            </label>
            <select
              [(ngModel)]="selectedEoiId"
              (ngModelChange)="onEoiChange()"
              class="eoi-select w-full px-3 py-2.5 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
              <option value="">-- Select an EOI to assign committee --</option>
              <optgroup *ngFor="let grp of eoiGroups()" [label]="grp.status">
                <option *ngFor="let e of grp.items" [value]="e.id">
                  {{ e.referenceNo }} — {{ e.title | slice:0:70 }}{{ e.title.length > 70 ? '…' : '' }}
                  {{ e.committeeName ? ' [' + e.committeeName + ']' : ' [No Committee]' }}
                </option>
              </optgroup>
            </select>
          </div>

          <div class="flex gap-2">
            <a
              routerLink="/admin/eoi/create"
              class="px-3.5 py-2.5 border border-blue-200 bg-blue-50 rounded-lg text-xs font-semibold text-blue-700 hover:bg-blue-100 transition-colors flex items-center gap-1.5 whitespace-nowrap">
              <span class="material-symbols-outlined text-[15px]">add_circle</span>
              New EOI
            </a>
          </div>
        </div>

        <!-- Stats bar -->
        <div class="flex flex-wrap gap-4 mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <span>Total EOIs: <strong class="text-slate-800">{{ allEois().length }}</strong></span>
          <span>With Committee: <strong class="text-green-700">{{ eoiWithCommittee() }}</strong></span>
          <span>Without Committee: <strong class="text-orange-600">{{ eoiWithoutCommittee() }}</strong></span>
        </div>
      </div>

      <!-- MAIN CONTENT (shown after EOI selected) -->
      <div *ngIf="selectedEoi(); else noEoiSelected">

        <!-- EOI CONTEXT BANNER -->
        <div class="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl p-5 mb-6 text-white">
          <div class="flex items-start justify-between gap-4 flex-wrap">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[11px] font-mono bg-white/20 px-2 py-0.5 rounded font-bold tracking-wide">
                  {{ selectedEoi()?.referenceNo }}
                </span>
                <admin-status-badge [status]="selectedEoi()?.status || ''"></admin-status-badge>
              </div>
              <h2 class="text-sm font-bold leading-snug mb-2">{{ selectedEoi()?.title }}</h2>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-1 text-[11px] text-blue-200">
                <div>
                  <span class="block text-[10px] uppercase font-bold text-blue-400">Scheme</span>
                  {{ selectedEoi()?.schemeName || '—' }}
                </div>
                <div>
                  <span class="block text-[10px] uppercase font-bold text-blue-400">Category</span>
                  {{ selectedEoi()?.eoiCategory || '—' }}
                </div>
                <div>
                  <span class="block text-[10px] uppercase font-bold text-blue-400">Published</span>
                  {{ selectedEoi()?.publishedDate || '—' }}
                </div>
                <div>
                  <span class="block text-[10px] uppercase font-bold text-blue-400">Closing</span>
                  {{ selectedEoi()?.closingDate || '—' }}
                </div>
              </div>
            </div>
            <div class="flex flex-col items-end gap-1 text-right text-[11px] shrink-0">
              <span class="text-blue-300 uppercase font-bold text-[10px]">Current Committee</span>
              <span *ngIf="selectedEoi()?.committeeName; else noCommitteeAssigned"
                class="bg-green-400/20 text-green-200 px-2.5 py-1 rounded-full font-semibold border border-green-400/30 flex items-center gap-1.5">
                <span class="material-symbols-outlined text-[14px]">check_circle</span>
                {{ selectedEoi()?.committeeName }}
              </span>
              <ng-template #noCommitteeAssigned>
                <span class="bg-orange-400/20 text-orange-200 px-2.5 py-1 rounded-full font-semibold border border-orange-400/30 flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[14px]">warning</span>
                  Not Assigned
                </span>
              </ng-template>
              <span class="text-blue-400 mt-1">
                <strong class="text-white">{{ selectedEoi()?.applicationCount || 0 }}</strong> Application(s)
              </span>
            </div>
          </div>
        </div>

        <!-- STEP 2 + 3 GRID -->
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">

          <!-- Left: Committee Selector -->
          <div class="lg:col-span-5 space-y-4">

            <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
              <div class="border-b border-slate-100 pb-3 flex items-center gap-2">
                <span class="material-symbols-outlined text-indigo-600 text-[18px]">how_to_reg</span>
                <div>
                  <h3 class="text-sm font-bold text-slate-900">Step 2: Select Approval Committee</h3>
                  <p class="text-xs text-slate-500">Only Active committees are eligible</p>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold text-slate-700 mb-1">
                  Empanelled Evaluation Committee *
                </label>
                <select
                  [(ngModel)]="selectedCommitteeId"
                  (ngModelChange)="onCommitteeSelect()"
                  class="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs bg-white font-medium focus:ring-2 focus:ring-blue-600 focus:outline-hidden">
                  <option value="">-- Choose Committee --</option>
                  <option *ngFor="let c of committees()" [value]="c.id">
                    {{ c.committeeName }} ({{ c.committeeCode }})
                    {{ c.chairpersonName ? ' · Chair: ' + c.chairpersonName : '' }}
                  </option>
                </select>
              </div>

              <!-- Action Buttons -->
              <div class="pt-2 flex flex-wrap items-center gap-3">
                <button
                  (click)="saveAssignment()"
                  [disabled]="!selectedCommitteeId || !selectedEoiId"
                  class="px-5 py-2.5 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs rounded-lg shadow-xs transition-all flex items-center gap-2 cursor-pointer">
                  <span class="material-symbols-outlined text-[18px]">how_to_reg</span>
                  {{ selectedEoi()?.committeeId ? 'Replace Committee Assignment' : 'Confirm Committee Assignment' }}
                </button>

                <button
                  *ngIf="selectedEoi()?.committeeId"
                  (click)="confirmRemoveCommittee()"
                  class="px-4 py-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-semibold text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer">
                  <span class="material-symbols-outlined text-[16px]">group_remove</span>
                  Remove Assignment
                </button>
              </div>

              <div class="flex gap-2 pt-1 border-t border-slate-100">
                <a
                  routerLink="/admin/committees/create"
                  class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px]">add</span>
                  Create New Committee
                </a>
                <a
                  routerLink="/admin/committees"
                  class="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-[15px]">list</span>
                  View All Committees
                </a>
              </div>
            </div>

            <!-- Quick EOI Switcher -->
            <div class="bg-slate-50 rounded-xl border border-slate-200 p-4">
              <h4 class="text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-3">
                Other EOIs Awaiting Committee Assignment
              </h4>
              <div class="space-y-2 max-h-48 overflow-y-auto">
                <div
                  *ngFor="let e of unassignedEois()"
                  (click)="switchEoi(e.id)"
                  class="flex items-center justify-between p-2.5 bg-white rounded-lg border border-orange-100 hover:border-orange-300 cursor-pointer transition-colors group">
                  <div class="min-w-0 flex-1">
                    <span class="text-[11px] font-mono text-orange-700 font-bold block">{{ e.referenceNo }}</span>
                    <span class="text-[11px] text-slate-600 truncate block">{{ e.title | slice:0:50 }}{{ e.title.length > 50 ? '…' : '' }}</span>
                  </div>
                  <span class="material-symbols-outlined text-[16px] text-slate-300 group-hover:text-orange-500 transition-colors shrink-0 ml-2">arrow_forward</span>
                </div>
                <div *ngIf="unassignedEois().length === 0"
                  class="text-center py-4 text-xs text-slate-400">
                  <span class="material-symbols-outlined text-[24px] text-green-300 block mb-1">task_alt</span>
                  All EOIs have committee assignments
                </div>
              </div>
            </div>
          </div>

          <!-- Right: Committee Composition Card -->
          <div class="lg:col-span-7">
            <div *ngIf="activeCommittee(); else noCommitteePreview"
              class="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-xs space-y-4">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-sm font-bold text-blue-900">{{ activeCommittee()?.committeeName }}</h3>
                  <span class="font-mono text-[11px] text-slate-500 font-semibold">{{ activeCommittee()?.committeeCode }}</span>
                </div>
                <admin-status-badge [status]="activeCommittee()?.status || 'Active'"></admin-status-badge>
              </div>

              <div class="grid grid-cols-2 gap-3 text-xs p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Chairperson</span>
                  <span class="font-bold text-slate-800">{{ activeCommittee()?.chairpersonName }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Department</span>
                  <span class="font-medium text-slate-700">{{ activeCommittee()?.department }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Validity Start</span>
                  <span class="font-medium text-slate-700">{{ activeCommittee()?.startDate }}</span>
                </div>
                <div>
                  <span class="text-[10px] uppercase font-bold text-slate-400 block">Validity End</span>
                  <span class="font-medium text-slate-700">{{ activeCommittee()?.endDate }}</span>
                </div>
              </div>

              <div>
                <h4 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Empanelled Committee Members ({{ activeCommittee()?.members?.length }})
                </h4>
                <div class="space-y-2 max-h-72 overflow-y-auto">
                  <div *ngFor="let m of activeCommittee()?.members"
                    class="member-chip p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span class="font-bold text-slate-800 block">{{ m.name }}</span>
                      <span class="text-[11px] text-slate-500">{{ m.designation }} • {{ m.department }}</span>
                    </div>
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold"
                      [ngClass]="{
                        'bg-amber-100 text-amber-900 border border-amber-200': m.role === 'Chairperson',
                        'bg-blue-50 text-blue-800 border border-blue-200': m.role === 'Member',
                        'bg-sky-50 text-sky-800 border border-sky-200': m.role === 'Reviewer',
                        'bg-teal-50 text-teal-800 border border-teal-200': m.role === 'Secretary'
                      }">
                      {{ m.role }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Warning if same committee already assigned -->
              <div *ngIf="selectedEoi()?.committeeId === selectedCommitteeId && selectedCommitteeId"
                class="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <span class="material-symbols-outlined text-[16px] text-amber-600">info</span>
                This committee is already assigned to this EOI. Saving will record a re-confirmation in the audit log.
              </div>
            </div>

            <ng-template #noCommitteePreview>
              <div class="bg-slate-50 border-2 border-dashed border-slate-200 p-16 rounded-xl text-center text-slate-400">
                <span class="material-symbols-outlined text-[40px] text-slate-300 block mb-2">group_off</span>
                <p class="text-xs font-medium">Select a committee from the dropdown to preview its composition and members.</p>
              </div>
            </ng-template>
          </div>
        </div>

      </div>

      <!-- NO EOI SELECTED STATE -->
      <ng-template #noEoiSelected>
        <div class="bg-white rounded-xl border-2 border-dashed border-slate-200 p-20 text-center text-slate-400">
          <span class="material-symbols-outlined text-[52px] text-slate-300 block mb-3">article</span>
          <h3 class="text-sm font-semibold text-slate-500 mb-1">No EOI Selected</h3>
          <p class="text-xs">Select an EOI from the dropdown above to assign or change its committee.</p>
        </div>
      </ng-template>

      <!-- REMOVE CONFIRMATION MODAL -->
      <div *ngIf="showRemoveConfirm()"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div class="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
          <div class="flex items-center gap-3 mb-4">
            <span class="material-symbols-outlined text-red-500 text-[24px]">warning</span>
            <h3 class="text-sm font-bold text-slate-900">Remove Committee Assignment</h3>
          </div>
          <p class="text-xs text-slate-600 mb-4">
            Are you sure you want to remove <strong>{{ selectedEoi()?.committeeName }}</strong> from
            EOI <strong>{{ selectedEoi()?.referenceNo }}</strong>? This action will be recorded in the audit log.
          </p>
          <div class="flex gap-3 justify-end">
            <button
              (click)="showRemoveConfirm.set(false)"
              class="px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer">
              Cancel
            </button>
            <button
              (click)="removeCommittee()"
              class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg cursor-pointer">
              Remove Assignment
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class CommitteeAssignmentComponent implements OnInit {
  private eoiService = inject(EoiService);
  private committeeService = inject(CommitteeService);
  private toastService = inject(ToastService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  allEois = signal<EoiItem[]>([]);
  selectedEoiId = '';
  selectedEoi = signal<EoiItem | null>(null);

  committees = signal<Committee[]>([]);
  selectedCommitteeId = '';
  activeCommittee = signal<Committee | null>(null);

  showRemoveConfirm = signal(false);

  /** Group EOIs by status for <optgroup> */
  eoiGroups = computed(() => {
    const grouped: Record<string, EoiItem[]> = {};
    for (const e of this.allEois()) {
      if (!grouped[e.status]) grouped[e.status] = [];
      grouped[e.status].push(e);
    }
    const order = ['OPEN', 'PUBLISHED', 'DRAFT', 'CLOSED', 'UNDER_REVIEW', 'COMPLETED', 'RESCHEDULED', 'CANCELLED', 'ARCHIVED'];
    return order
      .filter(s => grouped[s]?.length)
      .map(s => ({ status: s, items: grouped[s] }));
  });

  eoiWithCommittee = computed(() => this.allEois().filter(e => !!e.committeeId).length);
  eoiWithoutCommittee = computed(() => this.allEois().filter(e => !e.committeeId).length);

  /** EOIs without a committee assigned (for quick switcher) */
  unassignedEois = computed(() =>
    this.allEois().filter(e => !e.committeeId && e.id !== this.selectedEoiId)
  );

  ngOnInit(): void {
    // Load all EOIs for the selector
    this.eoiService.getEois().subscribe(list => {
      this.allEois.set(list);

      // Pre-select EOI from route param if present
      const idFromRoute = this.route.snapshot.paramMap.get('id');
      if (idFromRoute) {
        this.selectedEoiId = idFromRoute;
        this.loadSelectedEoi();
      }
    });

    // Load all active committees
    this.committeeService.getCommittees().subscribe(list => {
      this.committees.set(list);
      // Re-apply committee preview if already pre-selected
      if (this.selectedCommitteeId) {
        this.onCommitteeSelect();
      }
    });
  }

  onEoiChange(): void {
    this.loadSelectedEoi();
  }

  switchEoi(id: string): void {
    this.selectedEoiId = id;
    this.loadSelectedEoi();
    // Update URL without full navigation
    this.router.navigate(['/admin/eoi', id, 'committee'], { replaceUrl: true });
  }

  private loadSelectedEoi(): void {
    if (!this.selectedEoiId) {
      this.selectedEoi.set(null);
      this.selectedCommitteeId = '';
      this.activeCommittee.set(null);
      return;
    }
    const found = this.allEois().find(e => e.id === this.selectedEoiId);
    if (found) {
      this.selectedEoi.set(found);
      // Pre-populate committee dropdown with current assignment
      this.selectedCommitteeId = found.committeeId || '';
      this.onCommitteeSelect();
    } else {
      this.eoiService.getEoiById(this.selectedEoiId).subscribe(e => {
        this.selectedEoi.set(e || null);
        this.selectedCommitteeId = e?.committeeId || '';
        this.onCommitteeSelect();
      });
    }
  }

  onCommitteeSelect(): void {
    const found = this.committees().find(c => c.id === this.selectedCommitteeId);
    this.activeCommittee.set(found || null);
  }

  saveAssignment(): void {
    const c = this.activeCommittee();
    const eoi = this.selectedEoi();
    if (!c || !eoi) return;

    this.eoiService.assignCommittee(this.selectedEoiId, c.id, c.committeeName).subscribe(success => {
      if (success) {
        this.toastService.success(
          'Committee Assigned',
          `${c.committeeName} assigned to ${eoi.referenceNo}. Recorded in audit log.`
        );
        // Refresh EOI data
        this.eoiService.getEois().subscribe(list => {
          this.allEois.set(list);
          this.loadSelectedEoi();
        });
      }
    });
  }

  confirmRemoveCommittee(): void {
    this.showRemoveConfirm.set(true);
  }

  removeCommittee(): void {
    const eoi = this.selectedEoi();
    if (!eoi) return;
    this.showRemoveConfirm.set(false);

    // Assign empty committee = remove
    this.eoiService.assignCommittee(this.selectedEoiId, '', '').subscribe(() => {
      this.toastService.info('Committee Removed', `Committee assignment removed from ${eoi.referenceNo}.`);
      this.selectedCommitteeId = '';
      this.activeCommittee.set(null);
      this.eoiService.getEois().subscribe(list => {
        this.allEois.set(list);
        this.loadSelectedEoi();
      });
    });
  }
}
