import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AspirantService } from '../services/aspirant.service';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { AspirantRecord, AspirantTrainingStatus } from '../models/aspirant.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { TableComponent } from '../../../shared/components/table/table.component';
import { TableColumn } from '../../../shared/components/table/table.types';
import { ButtonComponent, FilterTabsComponent, IconComponent, InputDirective, PageShellComponent } from '../../../shared';

@Component({
  selector: 'app-aspirant-list',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FilterTabsComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    PageHeaderComponent,
    TableComponent,
    ButtonComponent,
    IconComponent,
    InputDirective,
    PageShellComponent
  ],
  template: `
    <app-page-shell>

        <!-- Page Header -->
        <app-page-header
          title="Aspirants Management"
          [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Aspirants Management' }]"
          [searchable]="true"
          [(searchQuery)]="searchQuery"
          searchPlaceholder="Search Aspirant ID, Name, Aadhaar, SDC, Batch..."
        >
          <div class="flex items-center gap-2">
            <!-- Export CSV Button -->
            <button
              appButton
              size="sm"
              variant="outline"
              type="button"
              (click)="exportToCsv()"
              title="Export roster to CSV"
            >
              <app-icon name="download" size="sm" />
              <span>Export CSV</span>
            </button>
          </div>
        </app-page-header>

        <!-- Success Toast Notification -->
        @if (successMessage()) {
          <div class="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <span class="font-bold text-emerald-700">Success:</span>
              <span>{{ successMessage() }}</span>
            </div>
            <button appButton variant="ghost" size="sm" iconOnly aria-label="Dismiss" (click)="successMessage.set('')"><app-icon name="close" size="xs" /></button>
          </div>
        }

        <!-- Filter & Search Controls (Matching ISMS 2.0 Toolbar) -->
        <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 space-y-3 shadow-2xs">
          
          <!-- Row 1: SDC Center Dropdown + Scheme Dropdown + Batch Dropdown + Status Filter -->
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            
            <!-- SDC Center Filter (Prompt: "and also all the sdc can be seen") -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by SDC Center:
              </label>
              <select
                appInput
                size="sm"
                [ngModel]="selectedSdc()"
                (ngModelChange)="selectedSdc.set($event)"
                class="w-full"
              >
                <option value="All">All SDC Centers ({{ allSdcOptions.length - 1 }})</option>
                @for (opt of allSdcOptions.slice(1); track opt.code) {
                  <option [value]="opt.code">{{ opt.name }} ({{ opt.code }}) - {{ opt.district }}</option>
                }
              </select>
            </div>

            <!-- Scheme Filter -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Scheme:
              </label>
              <select
                appInput
                size="sm"
                [ngModel]="selectedScheme()"
                (ngModelChange)="selectedScheme.set($event)"
                class="w-full"
              >
                <option value="All">All Schemes ({{ allSchemeOptions.length - 1 }})</option>
                @for (sc of allSchemeOptions.slice(1); track sc) {
                  <option [value]="sc">{{ sc }}</option>
                }
              </select>
            </div>

            <!-- Batch Filter -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Filter by Batch:
              </label>
              <select
                appInput
                size="sm"
                [ngModel]="selectedBatch()"
                (ngModelChange)="selectedBatch.set($event)"
                class="w-full"
              >
                <option value="All">All Batches ({{ allBatchOptions.length - 1 }})</option>
                @for (b of allBatchOptions.slice(1); track b.code) {
                  <option [value]="b.code">{{ b.code }} - {{ b.course }}</option>
                }
              </select>
            </div>

            <!-- Status Filter -->
            <div>
              <label class="block text-[10.5px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                Training Status:
              </label>
              <select
                appInput
                size="sm"
                [ngModel]="selectedStatus()"
                (ngModelChange)="selectedStatus.set($event)"
                class="w-full"
              >
                <option value="All">All Statuses</option>
                <option value="ENROLLED">Enrolled</option>
                <option value="IN_TRAINING">In Training</option>
                <option value="COMPLETED">Completed</option>
                <option value="CERTIFIED">Certified</option>
              </select>
            </div>

          </div>

          <!-- Row 2: Status Quick Filter Pills -->
          <div class="flex items-center justify-between gap-3 pt-2 border-t border-slate-200">
            
            <!-- Quick Category/Filter Pills -->
            <app-filter-tabs [options]="quickFilterTabs()" [value]="activeQuickTab()" (valueChange)="setQuickTab($event)" />

          </div>

        </div>

        <!-- Aspirants Data Table via Reusable TableComponent -->
        <app-table
          [columns]="aspirantColumns"
          [data]="filteredAspirants()"
          [pagination]="true"
          [pageSize]="pageSize"
          itemUnit="aspirants"
          emptyMessage="No aspirants match the selected filters or search query."
          [customTemplates]="{
            aspirantInfo: aspirantInfoTemplate,
            candidate: candidateTemplate,
            identity: identityTemplate,
            sdcCenter: sdcCenterTemplate,
            batchCourse: batchCourseTemplate,
            scheme: schemeTemplate,
            status: statusTemplate,
            actions: actionsTemplate
          }"
        >
        </app-table>

        <!-- Template: Aspirant ID & Reg Date -->
        <ng-template #aspirantInfoTemplate let-a>
          <div class="font-mono text-[13px] whitespace-nowrap">
            <a [routerLink]="['/aspirants', a.id]" class="font-normal text-brand hover:underline block cursor-pointer whitespace-nowrap" title="View details of {{ a.aspirantName }}">{{ a.id }}</a>
            <span class="text-[11px] text-slate-500 font-normal block mt-0.5 whitespace-nowrap">Enrolled: {{ a.enrollmentDate }}</span>
          </div>
        </ng-template>

        <!-- Template: Candidate Details (Name, Father/Relation Name, Age/Gender, Category) -->
        <ng-template #candidateTemplate let-a>
          <div class="py-1 min-w-0">
            <a [routerLink]="['/aspirants', a.id]" class="font-normal text-slate-800 hover:text-brand hover:underline text-[13px] leading-snug block cursor-pointer" title="View details of {{ a.aspirantName }}">
              {{ a.aspirantName }}
            </a>
            <div class="text-[11px] text-slate-500 leading-tight mt-0.5">
              <span class="text-slate-400 font-normal">{{ a.relationType || 'Father' }}:</span>
              <span class="text-slate-700 font-normal ml-1">{{ a.relationName }}</span>
            </div>
            <div class="flex items-center gap-1.5 mt-1">
              <span class="text-[10.5px] text-slate-500 font-normal">{{ a.gender }}, {{ a.age }} yrs</span>
              <span class="w-1 h-1 rounded-full bg-slate-300"></span>
              <span class="px-1.5 py-0.2 rounded text-[9.5px] font-normal bg-slate-100 text-slate-700 border border-slate-200">
                {{ a.category }}
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Identity & Contact (Aadhaar Masked, Mobile, Email) -->
        <ng-template #identityTemplate let-a>
          <div class="text-[13px] space-y-0.5">
            <div class="flex items-center gap-1 font-mono text-slate-800 font-normal">
              <app-icon name="identification" size="sm" [stroke]="2" class="text-blue-600 shrink-0" />
              <span>{{ a.aadhaarMasked }}</span>
            </div>
            <div class="text-slate-600 text-[11px] flex items-center gap-1">
              <span>{{ a.mobileNo }}</span>
            </div>
            @if (a.email) {
              <div class="text-slate-400 text-[10.5px] truncate max-w-[140px]" [title]="a.email">
                {{ a.email }}
              </div>
            }
          </div>
        </ng-template>

        <!-- Template: SDC Center (Prompt: "and also all the sdc can be seen") -->
        <ng-template #sdcCenterTemplate let-a>
          <div class="min-w-[150px]">
            <div class="font-normal text-slate-800 text-[13px] leading-snug">
              {{ a.sdcName }}
            </div>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span class="text-[10.5px] font-mono text-slate-700 font-normal">{{ a.sdcCode }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-300"></span>
              <span class="px-1.5 py-0.2 rounded text-[10px] font-normal bg-slate-100 text-slate-600 border border-slate-200">
                {{ a.sdcDistrict }}
              </span>
            </div>
          </div>
        </ng-template>

        <!-- Template: Batch & Course -->
        <ng-template #batchCourseTemplate let-a>
          <div class="min-w-[150px]">
            <div class="flex items-center gap-1.5">
              <span class="font-mono font-normal text-[13px] text-slate-800">
                {{ a.batchCode }}
              </span>
              <span class="text-[11px] text-slate-500 truncate">{{ a.sector }}</span>
            </div>
            <div class="font-normal text-slate-800 text-[13px] mt-1 leading-snug">
              {{ a.courseName }}
            </div>
          </div>
        </ng-template>

        <!-- Template: Scheme (All schemes black same) -->
        <ng-template #schemeTemplate let-a>
          <div class="text-center">
            <span class="font-normal text-[13px] tracking-wider uppercase text-slate-800">
              {{ a.scheme }}
            </span>
          </div>
        </ng-template>

        <!-- Template: Status -->
        <ng-template #statusTemplate let-a>
          <div class="text-center">
            @if (a.trainingStatus === 'IN_TRAINING') {
              <span class="font-normal text-[13px] text-sky-700 tracking-wider uppercase">
                IN TRAINING
              </span>
            } @else if (a.trainingStatus === 'CERTIFIED') {
              <span class="font-normal text-[13px] text-emerald-700 tracking-wider uppercase">
                CERTIFIED
              </span>
            } @else {
              <span class="font-normal text-[13px] text-slate-600 tracking-wider uppercase">
                ENROLLED
              </span>
            }
          </div>
        </ng-template>

        <!-- Template: Actions -->
        <ng-template #actionsTemplate let-a>
          <div class="flex items-center justify-end gap-1.5 whitespace-nowrap">
            <button
              appButton
              size="sm"
              class="shrink-0"
              type="button"
              (click)="viewDetails(a)"
              title="View & Edit Aspirant Details"
            >
              <app-icon name="eye" size="sm" />
              <span>View Details</span>
            </button>
          </div>
        </ng-template>

    </app-page-shell>
  `
})
export class AspirantListComponent {
  readonly aspirantService = inject(AspirantService);
  readonly batchService = inject(BatchService);
  readonly sdcService = inject(SdcService);
  readonly router = inject(Router);

  // Search & Filter Reactive Signals
  readonly searchQuery = signal<string>('');
  readonly appliedSearch = signal<string>('');
  readonly selectedSdc = signal<string>('All');
  readonly selectedScheme = signal<string>('All');
  readonly selectedBatch = signal<string>('All');
  readonly selectedStatus = signal<string>('All');
  readonly activeQuickTab = signal<string>('ALL');

  readonly successMessage = signal<string>('');

  readonly pageSize = 10;

  // Demo avatar SVG matching candidate profile photo demo
  readonly defaultAvatar = 'data:image/svg+xml;charset=UTF-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="120" height="150" viewBox="0 0 120 150"%3E%3Crect width="120" height="150" fill="%23e2e8f0"/%3E%3Ccircle cx="60" cy="50" r="28" fill="%230f172a"/%3E%3Cpath d="M20 135 C 20 95, 100 95, 100 135 Z" fill="%231e293b"/%3E%3C/svg%3E';

  readonly stats = this.aspirantService.stats;

  readonly aspirantColumns: TableColumn<AspirantRecord>[] = [
    { key: '$index', label: 'S. No.', type: 'number', align: 'center', width: 'w-12' },
    { key: 'aspirantInfo', label: 'Aspirant ID', type: 'custom', width: 'min-w-[170px] whitespace-nowrap' },
    { key: 'candidate', label: 'Candidate Profile', type: 'custom', width: 'min-w-[210px]' },
    { key: 'identity', label: 'Aadhaar & Contact', type: 'custom', width: 'min-w-[150px]' },
    { key: 'sdcCenter', label: 'Center (SDC)', type: 'custom', width: 'min-w-[170px]' },
    { key: 'batchCourse', label: 'Batch & Course', type: 'custom', width: 'min-w-[170px]' },
    { key: 'scheme', label: 'Scheme', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'status', label: 'Status', align: 'center', type: 'custom', width: 'w-28' },
    { key: 'actions', label: 'Actions', align: 'right', type: 'custom', width: 'w-32' }
  ];

  // Dynamic filter options derived from current services
  get allSdcOptions() {
    const sdcs = this.sdcService.sdcs();
    return [
      { code: 'All', name: 'All Centers', district: 'Rajasthan' },
      ...sdcs.map(s => ({ code: s.sdcCode, name: s.sdcName, district: s.district }))
    ];
  }

  get allSchemeOptions() {
    return ['All', 'SAMARTH', 'MMKVY', 'RAJKVIK', 'MNSKSY', 'PMKVY'];
  }

  get allBatchOptions() {
    const batches = this.batchService.batches();
    return [
      { code: 'All', course: 'All Batches' },
      ...batches.map(b => ({ code: b.batchCode, course: b.courseName }))
    ];
  }

  // Quick filter tabs: AEBAS Verified removed per user request
  readonly quickFilterTabs = computed(() => {
    const list = this.aspirantService.aspirants();
    return [
      { id: 'ALL', label: 'All Aspirants', count: list.length },
      { id: 'IN_TRAINING', label: 'In Training', count: list.filter(a => a.trainingStatus === 'IN_TRAINING').length },
      { id: 'ENROLLED', label: 'Enrolled', count: list.filter(a => a.trainingStatus === 'ENROLLED').length }
    ];
  });

  readonly filteredAspirants = computed(() => {
    let list = this.aspirantService.aspirants();

    // 1. SDC filter
    const sdc = this.selectedSdc();
    if (sdc !== 'All') {
      list = list.filter(a => a.sdcCode === sdc || a.sdcName.toLowerCase().includes(sdc.toLowerCase()));
    }

    // 2. Scheme filter
    const scheme = this.selectedScheme();
    if (scheme !== 'All') {
      list = list.filter(a => a.scheme.toLowerCase() === scheme.toLowerCase());
    }

    // 3. Batch filter
    const batch = this.selectedBatch();
    if (batch !== 'All') {
      list = list.filter(a => a.batchCode === batch);
    }

    // 4. Status filter
    const status = this.selectedStatus();
    if (status !== 'All') {
      list = list.filter(a => a.trainingStatus === status);
    }

    // 5. Quick tab filter
    const quick = this.activeQuickTab();
    if (quick === 'IN_TRAINING') {
      list = list.filter(a => a.trainingStatus === 'IN_TRAINING');
    } else if (quick === 'ENROLLED') {
      list = list.filter(a => a.trainingStatus === 'ENROLLED');
    }

    // 6. Free text search query
    const query = this.appliedSearch().toLowerCase().trim();
    if (query) {
      list = list.filter(a =>
        a.id.toLowerCase().includes(query) ||
        a.aspirantName.toLowerCase().includes(query) ||
        a.aadhaarMasked.toLowerCase().includes(query) ||
        (a.aadhaarNo && a.aadhaarNo.includes(query)) ||
        a.mobileNo.includes(query) ||
        a.sdcName.toLowerCase().includes(query) ||
        a.sdcCode.toLowerCase().includes(query) ||
        a.sdcDistrict.toLowerCase().includes(query) ||
        a.batchCode.toLowerCase().includes(query) ||
        a.courseName.toLowerCase().includes(query) ||
        a.scheme.toLowerCase().includes(query) ||
        (a.relationName && a.relationName.toLowerCase().includes(query)) ||
        (a.permCity && a.permCity.toLowerCase().includes(query)) ||
        (a.permDistrict && a.permDistrict.toLowerCase().includes(query)) ||
        (a.janaadhaarId && a.janaadhaarId.toLowerCase().includes(query))
      );
    }

    return list;
  });

  setQuickTab(tabId: string): void {
    this.activeQuickTab.set(tabId);
  }

  onSearchInput(val: string): void {
    this.searchQuery.set(val);
    this.appliedSearch.set(val);
  }

  applySearch(): void {
    this.appliedSearch.set(this.searchQuery());
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.appliedSearch.set('');
  }

  viewDetails(aspirant: AspirantRecord): void {
    this.router.navigate(['/aspirants', aspirant.id]);
  }

  viewDossier(aspirant: AspirantRecord): void {
    this.router.navigate(['/aspirants', aspirant.id]);
  }

  editAspirant(aspirant: AspirantRecord): void {
    this.router.navigate(['/aspirants', aspirant.id], { queryParams: { edit: 'true' } });
  }

  updateStatus(aspirant: AspirantRecord, newStatus: AspirantTrainingStatus): void {
    this.aspirantService.updateTrainingStatus(aspirant.id, newStatus);
  }

  toggleBiometric(aspirant: AspirantRecord): void {
    this.aspirantService.toggleBiometric(aspirant.id);
  }

  openMapAspirant(): void {
    const batches = this.batchService.batches();
    if (batches.length > 0) {
      this.router.navigate(['/batches', batches[0].id, 'map-aspirant']);
    } else {
      this.router.navigate(['/batches']);
    }
  }

  exportToCsv(): void {
    const data: AspirantRecord[] = this.filteredAspirants().length > 0
      ? this.filteredAspirants()
      : this.aspirantService.aspirants();
    if (!data.length) {
      return;
    }

    const headers = [
      'Aspirant ID',
      'Candidate Name',
      'Gender',
      'Date of Birth',
      'Age',
      'Aadhaar No (Masked)',
      'Jan Aadhaar ID',
      'Other ID Type',
      'Other ID Number',
      'Father / Husband Name',
      'Relationship',
      'Mother Name',
      'Educational Qualification',
      'Category',
      'Religion',
      'Minority',
      'Special Ability (PwD)',
      'Disability Type',
      'Area Type',
      'Interested Out of Rajasthan',
      'Mobile Number',
      'Alt Mobile Number',
      'Email Address',
      'Permanent Address',
      'Permanent District',
      'Permanent Pincode',
      'Communication Address',
      'SDC Code',
      'SDC Center Name',
      'SDC District',
      'Batch Code',
      'Batch Name',
      'Course Name',
      'Sector',
      'Government Scheme',
      'Enrollment Date',
      'Training Status',
      'Biometric Verified',
      'Attendance Percentage',
      'Bank Name',
      'Account Number',
      'Account Holder Name',
      'Account Type',
      'Bank Branch',
      'IFSC Code',
      'MICR Code',
      'Annual Family Income (INR)',
      'Income Slab',
      'Economic Status',
      'Economic Card / Ration No',
      'BoCW Worker',
      'BoCW Registration No',
      'MGNREGA Worker',
      'MGNREGA Job Card No',
      'RSBY Beneficiary',
      'Gram Sabha PIP Listed',
      'NRLM SHG Member',
      'Voter ID (EPIC)',
      'Preferred Sectors',
      'Attached Documents Count'
    ];

    const escapeCsv = (val: any): string => {
      if (val === null || val === undefined) return '""';
      const str = String(val).trim();
      return `"${str.replace(/"/g, '""')}"`;
    };

    const rows: string[][] = data.map((a: AspirantRecord) => {
      const permAddress = [
        a.permHouseNo,
        a.permStreet,
        a.permWard,
        a.permCity,
        a.permBlock,
        a.permDistrict,
        a.permPincode
      ].filter(Boolean).join(', ');

      const commAddress = a.isAddressSame
        ? (permAddress || 'Same as Permanent Address')
        : [
            a.commHouseNo,
            a.commStreet,
            a.commWard,
            a.commCity,
            a.commBlock,
            a.commDistrict,
            a.commPincode
          ].filter(Boolean).join(', ');

      const docCount = Array.isArray(a.documents)
        ? a.documents.filter((d: any) => d.status === 'UPLOADED').length
        : 0;

      return [
        a.id || '',
        a.aspirantName || '',
        a.gender || '',
        a.dob || '',
        a.age != null ? String(a.age) : '',
        a.aadhaarMasked || (a.aadhaarNo ? `XXXX-XXXX-${a.aadhaarNo.slice(-4)}` : ''),
        a.janaadhaarId || '',
        a.otherIdType || '',
        a.otherIdNo || '',
        a.relationName || '',
        a.relationType || '',
        a.motherName || '',
        a.educationalQualification || '',
        a.category || '',
        a.religion || '',
        a.minority || '',
        a.specialAbility || 'No',
        a.disabilityType || '',
        a.areaType || '',
        a.interestedOutOfRajasthan || 'No',
        a.mobileNo || '',
        a.altMobileNo || '',
        a.email || '',
        permAddress,
        a.permDistrict || '',
        a.permPincode || '',
        commAddress,
        a.sdcCode || '',
        a.sdcName || '',
        a.sdcDistrict || '',
        a.batchCode || '',
        a.batchName || '',
        a.courseName || '',
        a.sector || '',
        a.scheme || '',
        a.enrollmentDate || '',
        a.trainingStatus || '',
        a.biometricVerified ? 'Yes' : 'No',
        a.attendancePercent != null ? `${a.attendancePercent}%` : '0%',
        a.bankName || '',
        a.bankAccountNo || '',
        a.bankAccountName || '',
        a.bankAccountType || '',
        a.bankBranch || '',
        a.ifscCode || '',
        a.micrCode || '',
        a.annualFamilyIncome != null ? String(a.annualFamilyIncome) : '',
        a.incomeSlab || '',
        a.economicStatus || '',
        a.economicCardNo || '',
        a.bocwWorker || 'No',
        a.bocwNo || '',
        a.mgnregaWorker || 'No',
        a.mgnregaNo || '',
        a.isRsby || 'No',
        a.gramsabhaPip || 'No',
        a.nrlmMember || 'No',
        a.epicNo || '',
        Array.isArray(a.preferredSectors) ? a.preferredSectors.join('; ') : '',
        String(docCount)
      ];
    });

    const csvContent = '\uFEFF' + [
      headers.map(escapeCsv).join(','),
      ...rows.map((row: string[]) => row.map(escapeCsv).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Aspirants_Roster_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 500);

    this.successMessage.set(`Exported ${data.length} candidate record${data.length === 1 ? '' : 's'} to CSV successfully.`);
  }

  printDossier(aspirant: AspirantRecord): void {
    window.print();
  }
}
