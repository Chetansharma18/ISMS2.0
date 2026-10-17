import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, ListPageComponent, TableColumn } from '../../../shared';
import { SubmittedTender } from '../../../core/models/tender.model';
import { filterTenders } from './tender-status.util';
import { openShortfalls, shortfallSummary } from './tender-shortfall.util';

@Component({
  selector: 'app-tender-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ListPageComponent, ButtonComponent, IconComponent],
  host: { class: 'block' },
  template: `
    <!-- Page header with search + status table via the shared list page -->
    <app-list-page
      title="Tender Status"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Tender Status' }]"
      [searchable]="true"
      [(searchQuery)]="searchQuery"
      searchPlaceholder="Search Ref, Scheme, Category..."
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
        shortfall: shortfallTemplate,
        view: viewTemplate
      }"
    >

      <!-- Custom App Ref Template -->
      <ng-template #appRefTemplate let-tender>
        <button
          appButton
          variant="ghost"
          size="sm"
          type="button"
          (click)="open.emit(tender)"
          class="font-mono"
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

      <!-- Revert requests raised by the department -->
      <ng-template #shortfallTemplate let-tender>
        @switch (shortfallState(tender)) {
          @case ('open') {
            <button
              appButton
              variant="secondary"
              size="sm"
              type="button"
              (click)="respond.emit(tender)"
              title="The department has asked for more documents. Click to respond."
            >
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500" aria-hidden="true"></span>
              Respond ({{ openCount(tender) }})
            </button>
          }
          @case ('responded') {
            <button
              appButton
              variant="ghost"
              size="sm"
              type="button"
              (click)="open.emit(tender)"
              title="View the shortfall requests and your responses"
            >
              Responded
            </button>
          }
          @default {
            <span class="text-slate-400 text-[13px]">-</span>
          }
        }
      </ng-template>

      <!-- Custom View Action Button Template -->
      <ng-template #viewTemplate let-tender>
        <button appButton size="sm" type="button" (click)="open.emit(tender)" title="Open Application Details Page">
          <app-icon name="eye" size="sm" />
          <span>View</span>
        </button>
      </ng-template>

    </app-list-page>
  `
})
export class TenderListComponent {
  readonly tenders = input.required<SubmittedTender[]>();
  /** Search text; owned by the container so it survives opening a detail page. */
  readonly searchQuery = model('');
  readonly open = output<SubmittedTender>();
  /** The applicant wants to answer an open revert request. */
  readonly respond = output<SubmittedTender>();

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
    { key: 'shortfall',        label: 'Shortfall Request',    align: 'center', type: 'custom', cellClass: 'whitespace-nowrap' },
    { key: 'view',             label: 'View',                 align: 'center', width: 'w-20', type: 'custom' }
  ];

  protected shortfallState(tender: SubmittedTender): 'open' | 'responded' | 'none' {
    return shortfallSummary(tender);
  }

  protected openCount(tender: SubmittedTender): number {
    return openShortfalls(tender).length;
  }

  readonly filteredTenders = computed(() => filterTenders(this.tenders(), this.searchQuery()));
}