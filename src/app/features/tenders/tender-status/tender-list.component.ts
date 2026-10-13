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
      
      <!-- Page Header via Reusable PageHeaderComponent with Built-in Search -->
      <app-page-header
        title="Tender Status"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Tender Status' }]"
        [searchable]="true"
        [(searchQuery)]="searchQuery"
        searchPlaceholder="Search Ref, Scheme, Category..."
      />

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
          submittedStatus: submittedStatusTemplate,
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
          class="font-mono font-normal text-navy hover:underline cursor-pointer text-left transition-colors text-[13px]"
          title="Open Application Details Page"
        >
          {{ tender.appRef }}
        </button>
      </ng-template>

      <!-- Custom Scheme Title Template -->
      <ng-template #schemeTitleTemplate let-tender>
        <span
          (click)="open.emit(tender)"
          class="font-normal text-slate-800 hover:text-navy hover:underline cursor-pointer transition-colors text-[13px]"
          title="Open {{ tender.schemeTitle }}"
        >
          {{ tender.schemeTitle }}
        </span>
      </ng-template>

      <!-- Custom Scheme Category Template -->
      <ng-template #schemeCategoryTemplate let-tender>
        <span class="text-slate-800 font-normal text-[13px] uppercase tracking-wide">{{ tender.schemeCategory || 'GENERAL' }}</span>
      </ng-template>

      <!-- Custom Submitted Status Template (Plain text, not highlighted) -->
      <ng-template #submittedStatusTemplate let-tender>
        <span class="text-slate-800 font-normal text-[13px]">{{ tender.submittedStatus }}</span>
      </ng-template>

      <!-- Custom EOI Stage Template -->
      <ng-template #eoiStatusTemplate let-tender>
        @if (tender.eoiStatus === 'Reviewed') {
          <span class="text-slate-800 font-normal text-[13px]">{{ tender.eoiStatus }}</span>
        } @else if (tender.eoiStatus === 'Under Review') {
          <span class="text-slate-800 font-normal text-[13px]">{{ tender.eoiStatus }}</span>
        } @else {
          <span class="text-slate-500 font-normal text-[13px]">-</span>
        }
      </ng-template>

      <!-- Custom Rejection Reason Template -->
      <ng-template #rejectionReasonTemplate let-tender>
        @if (tender.submittedStatus === 'Rejected') {
          <span class="text-rose-600 text-[13px] leading-tight font-normal block max-w-sm text-left">
            {{ tender.rejectionReason || 'Technical qualification criteria not met.' }}
          </span>
        } @else {
          <span class="text-slate-400 font-normal text-center block text-[13px]">-</span>
        }
      </ng-template>

      <!-- Custom View Action Button Template -->
      <ng-template #viewTemplate let-tender>
        <button
          type="button"
          (click)="open.emit(tender)"
          title="Open Application Details Page"
          class="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-navy hover:bg-navy-dark text-white rounded-md text-[13px] font-normal cursor-pointer shadow-2xs transition-colors"
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
    { key: 'schemeTitle',      label: 'Scheme Name',          cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'schemeCategory',   label: 'Scheme Category',      align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700', type: 'custom' },
    { key: 'appliedDate',      label: 'Applied Date',         align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    {
      key: 'submittedStatus',
      label: 'Submitted Status',
      align: 'center',
      type: 'custom',
      cellClass: 'whitespace-nowrap font-normal text-slate-800'
    },
    { key: 'eoiStatus',        label: 'EOI Stage',            align: 'center', type: 'custom', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'rejectionReason',  label: 'Remarks', align: 'center', type: 'custom', cellClass: 'min-w-[200px]' },
    { key: 'view',             label: 'View',                 align: 'center', width: 'w-20', type: 'custom' }
  ];

  readonly filteredTenders = computed(() => filterTenders(this.tenders(), this.searchQuery()));
}