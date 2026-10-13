import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PageHeaderComponent, TableComponent, TableColumn } from '../../../shared';
import { SubmittedTender } from '../../../core/models/tender.model';
import { filterTenders } from './tender-status.util';

@Component({
  selector: 'app-tender-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, PageHeaderComponent, TableComponent],
  host: { class: 'block' },
  template: `
    <div class="p-4 sm:p-5 space-y-4 font-sans">
      
      <!-- Page Header via Reusable PageHeaderComponent -->
      <app-page-header
        title="Tender Status"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Tender Status' }]"
      >
        <!-- Search Input -->
        <div class="relative w-full sm:w-80">
          <svg class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            placeholder="Search Ref, Scheme, Category..."
            class="w-full pl-9 pr-7 py-2 text-[13px] bg-white border border-slate-300 rounded-md placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-navy transition-colors font-normal shadow-2xs"
          />
          @if (searchQuery()) {
            <button
              type="button"
              (click)="searchQuery.set('')"
              class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
            >
              ✕
            </button>
          }
        </div>
      </app-page-header>

      <!-- Main Status Table via Reusable TableComponent -->
      <app-table
        [columns]="tenderColumns"
        [data]="filteredTenders()"
        [pagination]="true"
        [pageSize]="pageSize"
        emptyMessage="No tender applications match your search query."
        [customTemplates]="{
          appRef: appRefTemplate,
          schemeTitle: schemeTitleTemplate,
          schemeCategory: schemeCategoryTemplate,
          eoiStatus: eoiStatusTemplate,
          rejectionReason: rejectionReasonTemplate,
          view: viewTemplate
        }"
      >
      </app-table>

      <!-- Custom App Ref Template -->
      <ng-template #appRefTemplate let-tender>
        <button
          type="button"
          (click)="open.emit(tender)"
          class="font-mono font-bold text-navy hover:underline cursor-pointer text-left transition-colors"
          title="Open Application Details Page"
        >
          {{ tender.appRef }}
        </button>
      </ng-template>

      <!-- Custom Scheme Title Template -->
      <ng-template #schemeTitleTemplate let-tender>
        <span
          (click)="open.emit(tender)"
          class="font-semibold text-slate-800 hover:text-navy hover:underline cursor-pointer transition-colors"
          title="Open {{ tender.schemeTitle }}"
        >
          {{ tender.schemeTitle }}
        </span>
      </ng-template>      <!-- Custom Scheme Category Template -->
      <ng-template #schemeCategoryTemplate let-tender>
        <span class="text-slate-800 font-medium text-xs uppercase tracking-wide">{{ tender.schemeCategory || 'GENERAL' }}</span>
      </ng-template>

      <!-- Custom EOI Stage Template -->
      <ng-template #eoiStatusTemplate let-tender>
        @if (tender.eoiStatus === 'Reviewed') {
          <span class="text-slate-800 font-bold text-xs">{{ tender.eoiStatus }}</span>
        } @else if (tender.eoiStatus === 'Under Review') {
          <span class="text-amber-800 font-bold text-xs">{{ tender.eoiStatus }}</span>
        } @else {
          <span class="text-slate-500 font-normal text-xs">-</span>
        }
      </ng-template>

      <!-- Custom Rejection Reason Template -->
      <ng-template #rejectionReasonTemplate let-tender>
        @if (tender.submittedStatus === 'Rejected') {
          <span class="text-rose-600 text-xs leading-tight font-medium block max-w-sm text-left">
            {{ tender.rejectionReason || 'Technical qualification criteria not met.' }}
          </span>
        } @else {
          <span class="text-slate-400 font-normal text-center block">-</span>
        }
      </ng-template>

      <!-- Custom View Action Button Template -->
      <ng-template #viewTemplate let-tender>
        <button
          type="button"
          (click)="open.emit(tender)"
          title="Open Application Details Page"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-navy hover:bg-navy-dark text-white rounded-md text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
        >
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>View</span>
        </button>
      </ng-template>

    </div>
  `
})
export class TenderListComponent {
  readonly tenders = input.required<SubmittedTender[]>();
  /** Search text; owned by the container so it survives opening a detail page. */
  readonly searchQuery = model('');
  readonly open = output<SubmittedTender>();

  readonly pageSize = 6;

  // Clean Table Columns without Closing Date / Edits Used
  readonly tenderColumns: TableColumn<SubmittedTender>[] = [
    { key: '$index',           label: 'S. No.',               type: 'number', align: 'center', width: 'w-12' },
    { key: 'appRef',           label: 'Application Ref. No.', cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'schemeTitle',      label: 'Scheme Name',          cellClass: 'whitespace-nowrap font-medium text-slate-800', type: 'custom' },
    { key: 'schemeCategory',   label: 'Scheme Category',      align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700', type: 'custom' },
    { key: 'appliedDate',      label: 'Applied Date',         align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    {
      key: 'submittedStatus',
      label: 'Submitted Status',
      align: 'center',
      type: 'status',
      badgeVariantMap: {
        'Submitted': 'info',
        'Under Review': 'warning',
        'Approved': 'success',
        'Accepted': 'success',
        'Rejected': 'danger'
      }
    },
    { key: 'eoiStatus',        label: 'EOI Stage',            align: 'center', type: 'custom', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'rejectionReason',  label: 'Remarks', align: 'center', type: 'custom', cellClass: 'min-w-[200px]' },
    { key: 'view',             label: 'View',                 align: 'center', width: 'w-20', type: 'custom' }
  ];

  readonly filteredTenders = computed(() => filterTenders(this.tenders(), this.searchQuery()));
}