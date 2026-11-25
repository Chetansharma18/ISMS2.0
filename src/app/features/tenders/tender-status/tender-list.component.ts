import { ChangeDetectionStrategy, Component, computed, input, model, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  ButtonComponent,
  IconComponent,
  ListPageComponent,
  MasterFilterBarComponent,
  MasterFilterConfig,
  StatusFilterOption,
  TableColumn
} from '../../../shared';
import { SubmittedTender } from '../../../core/models/tender.model';
import { filterTenders, TenderOpenEvent } from './tender-status.util';

@Component({
  selector: 'app-tender-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, ListPageComponent, ButtonComponent, IconComponent, MasterFilterBarComponent],
  host: { class: 'block' },
  template: `
    <!-- Page header with search + status table via the shared list page -->
    <app-list-page
      title="EOI Status"
      [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'EOI Status' }]"
      [searchable]="false"
      [columns]="tenderColumns"
      [data]="filteredTenders()"
      [pagination]="true"
      [pageSize]="pageSize"
      emptyMessage="No EOI applications match your search query."
      [customTemplates]="{
        appRef: appRefTemplate,
        schemeTitle: schemeTitleTemplate,
        schemeCategory: schemeCategoryTemplate,
        submittedStatus: submittedStatusTemplate,
        view: viewTemplate
      }"
    >

      <!-- Filters Toolbar: Search, Status, Scheme Name & Scheme Category -->
      <app-master-filter-bar
        beforeTable
        [(searchQuery)]="searchQuery"
        searchPlaceholder="Search Ref, Scheme, Category..."
        [(status)]="statusFilter"
        [showStatusFilter]="true"
        [statusOptions]="statusFilterOptions()"
        [filters]="tenderFilters()"
        [(filterValues)]="filterValues"
        (resetFilters)="resetFilters()"
      />

      <!-- Custom App Ref Template -->
      <ng-template #appRefTemplate let-tender>
        <button
          appButton
          variant="ghost"
          size="sm"
          type="button"
          (click)="open.emit({ tender, tab: 'organisation' })"
          class="tabular-nums"
          title="Open Application Details Page"
        >
          {{ tender.appRef }}
        </button>
      </ng-template>

      <!-- Custom Scheme Title Template -->
      <ng-template #schemeTitleTemplate let-tender>
        <span
          (click)="open.emit({ tender, tab: 'organisation' })"
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

      <!-- Custom View Action Button Template -->
      <ng-template #viewTemplate let-tender>
        <button
          appButton
          variant="ghost"
          size="sm"
          iconOnly
          type="button"
          (click)="open.emit({ tender, tab: 'organisation' })"
          title="Open Application Details Page"
          aria-label="View Details"
        >
          <app-icon name="eye" size="sm" />
        </button>
      </ng-template>

    </app-list-page>
  `
})
export class TenderListComponent {
  readonly tenders = input.required<SubmittedTender[]>();
  /** Search text; owned by the container so it survives opening a detail page. */
  readonly searchQuery = model('');
  readonly statusFilter = model('ALL');
  readonly filterValues = model<Record<string, string>>({});

  readonly open = output<TenderOpenEvent>();
  /** The applicant wants to answer an open revert request. */
  readonly respond = output<SubmittedTender>();
  /** The applicant wants to appeal a rejected application. */
  readonly appeal = output<SubmittedTender>();

  readonly pageSize = 6;

  readonly statusFilterOptions = computed<StatusFilterOption[]>(() => [
    { value: 'ALL', label: 'All Status' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Under Review', label: 'Under Review' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ]);

  readonly schemeNameOptions = computed<string[]>(() => {
    const list = this.tenders();
    const set = new Set<string>();
    for (const t of list) {
      if (t.schemeTitle) set.add(t.schemeTitle);
      else if (t.schemeName) set.add(t.schemeName);
    }
    return Array.from(set).sort();
  });

  readonly schemeCategoryOptions = computed<string[]>(() => {
    const list = this.tenders();
    const set = new Set<string>();
    for (const t of list) {
      if (t.schemeCategory) set.add(t.schemeCategory);
    }
    return Array.from(set).sort();
  });

  readonly tenderFilters = computed<MasterFilterConfig[]>(() => [
    {
      key: 'schemeName',
      label: 'Scheme Name',
      options: () => this.schemeNameOptions(),
      placeholder: 'All Scheme Names'
    },
    {
      key: 'schemeCategory',
      label: 'Scheme Category',
      options: () => this.schemeCategoryOptions(),
      placeholder: 'All Scheme Categories'
    }
  ]);

  resetFilters(): void {
    this.searchQuery.set('');
    this.statusFilter.set('ALL');
    this.filterValues.set({});
  }

  // Clean Table Columns without Closing Date / Edits Used / Remarks / Appeal columns
  readonly tenderColumns: TableColumn<SubmittedTender>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'appRef', label: 'Application Ref. No.', cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'schemeTitle', label: 'Scheme Name', cellClass: 'whitespace-nowrap font-normal text-slate-800', type: 'custom' },
    { key: 'schemeCategory', label: 'Scheme Category', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700', type: 'custom' },
    { key: 'appliedDate', label: 'Applied Date', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    {
      key: 'submittedStatus',
      label: 'Status',
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
    { key: 'view', label: 'Action', align: 'center', width: 'w-20', type: 'custom' }
  ];

  readonly filteredTenders = computed(() =>
    filterTenders(this.tenders(), {
      searchQuery: this.searchQuery(),
      status: this.statusFilter(),
      schemeName: this.filterValues()['schemeName'],
      schemeCategory: this.filterValues()['schemeCategory']
    })
  );
}
