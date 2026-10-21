import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { TableColumn, TableComponent } from '../../../../shared';
import { formatDateTime } from '../../../../shared/utils';
import type { CourseMasterItem } from '../../../../core/models/admin-masters.model';
import { DataEngineService } from '../../../../core/services/data-engine.service';
import type { BatchCamera, BatchFaculty, BatchHostel, BatchRecord } from '../../models/batch.model';
import { batchRemarksOf } from './batch-review.util';
import { courseDetailsOf } from './course-details.util';

/** A field value for a read-only box: a dash when there is nothing to show. */
function show(value: string | number | null | undefined): string {
  return value == null || value === '' ? '—' : String(value);
}

/**
 * The batch for the department, with the same fields, in the same order, as the Create Batch form of the training
 * partner (center, batch, course, faculty, cameras, hostel), in the numbered-card style of the SDC review page.
 * Camera passwords are never shown. No officer or designation is shown for the department.
 */
@Component({
  selector: 'app-batch-review-sections',
  standalone: true,
  imports: [TableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block space-y-5' },
  template: `
    @let b = batch();
    @let course = courseInfo();

    <!-- 1. Center Details -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="batch-center-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">1</span>
        <h2 id="batch-center-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Center Details</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">Center Name</span>
          <span class="font-medium text-slate-900">{{ text(b.sdcName) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Center Code</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(b.sdcCode) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Scheme</span>
          <span class="font-medium text-slate-900">{{ text(b.scheme) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Batch Code</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(b.batchCode) }}</span>
        </div>
      </div>
    </section>

    <!-- 2. Batch Details -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="batch-details-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">2</span>
        <h2 id="batch-details-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Batch Details</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        @if (ipaCourse(); as label) {
          <div class="col-span-2 sm:col-span-3 lg:col-span-4">
            <span class="text-slate-500 block text-[11px] mb-0.5">IPA Course</span>
            <span class="font-medium text-slate-900">{{ label }}</span>
          </div>
        }
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Sector</span>
          <span class="font-medium text-slate-900">{{ text(b.sector) }}</span>
        </div>
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">Course</span>
          <span class="font-medium text-slate-900">{{ text(b.courseName) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Batch Size</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(b.approvedBatchStrength || b.maxStrength) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Batch Start Date</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(b.startDate) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Batch End Date</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(b.endDate) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Batch Start Time</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(b.startTime) }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Batch End Time</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ text(b.endTime) }}</span>
        </div>
        <div class="col-span-2 sm:col-span-3 lg:col-span-4">
          <span class="text-slate-500 block text-[11px] mb-0.5">Remarks</span>
          <span class="text-slate-900 leading-relaxed">{{ text(b.remarks) }}</span>
        </div>
      </div>
    </section>

    <!-- 3. Course Details -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="batch-course-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center gap-3">
        <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">3</span>
        <h2 id="batch-course-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Course Details</h2>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-y-3.5 gap-x-6 text-xs">
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">QP / Job Role Code</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ course.qpCode }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Version</span>
          <span class="font-medium text-slate-900">{{ course.version }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">NSQF Level</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ course.nsqfLevel }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Total Duration (hrs)</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ course.totalHours }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Theory Duration (hrs)</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ course.theoryHours }}</span>
        </div>
        <div>
          <span class="text-slate-500 block text-[11px] mb-0.5">Practical + OJT Duration (hrs)</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ course.practicalHours }}</span>
        </div>
        <div class="sm:col-span-2">
          <span class="text-slate-500 block text-[11px] mb-0.5">IT & Soft Skill Training (hrs)</span>
          <span class="tabular-nums text-slate-900 font-medium">{{ course.softSkillHours }}</span>
        </div>
      </div>
    </section>

    <!-- 4. Faculty Details -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="batch-faculty-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">4</span>
          <h2 id="batch-faculty-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Faculty Details</h2>
        </div>
        <span class="text-[11px] text-slate-500">{{ faculty().length }} trainer(s) added</span>
      </div>
      <app-table [columns]="facultyColumns" [data]="faculty()" emptyMessage="No faculty was added to this batch." />
    </section>

    <!-- 5. Camera Configuration -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="batch-camera-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">5</span>
          <h2 id="batch-camera-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Camera Configuration</h2>
        </div>
        <span class="text-[11px] text-slate-500">{{ cameras().length }} camera(s) added</span>
      </div>
      <app-table [columns]="cameraColumns" [data]="cameras()" emptyMessage="No camera was added to this batch." />
    </section>

    <!-- 6. Hostel Details -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="batch-hostel-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">6</span>
          <h2 id="batch-hostel-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Hostel Details</h2>
        </div>
        <span class="text-[11px] text-slate-500">{{ hostels().length }} hostel(s) added</span>
      </div>
      <app-table [columns]="hostelColumns" [data]="hostels()" emptyMessage="No hostel was added to this batch." />
    </section>

    <!-- 7. Remarks of the department -->
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="batch-remarks-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">7</span>
          <h2 id="batch-remarks-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">Department Remarks</h2>
        </div>
        <span class="text-[11px] text-slate-500">{{ remarks().length }} remark(s)</span>
      </div>

      @if (remarks().length === 0) {
        <p class="m-0 text-xs text-slate-500">No remarks have been recorded on this batch yet.</p>
      } @else {
        <ul class="m-0 p-0 list-none space-y-3">
          @for (remark of remarks(); track remark.id) {
            <li class="border border-slate-200 rounded-lg p-3.5 text-xs">
              <div class="flex flex-wrap items-start justify-between gap-2">
                <span class="font-semibold text-slate-900 text-[12.5px]">Department</span>
                <div class="text-right shrink-0">
                  <span class="inline-block px-2 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-700 text-[10.5px] font-semibold">{{ remark.kind }}</span>
                  <span class="block text-[11px] text-slate-500 mt-1">{{ when(remark.at) }}</span>
                </div>
              </div>
              <p class="m-0 mt-2 text-slate-700 leading-relaxed whitespace-pre-line">{{ remark.text }}</p>
            </li>
          }
        </ul>
      }
    </section>
  `
})
export class BatchReviewSectionsComponent {
  readonly batch = input.required<BatchRecord>();

  /** Valid courses of the Course Master: the NSQF level, hours, QP code and version come from here, as in the Create Batch form. */
  private readonly masters = toSignal(
    inject(DataEngineService)
      .for<CourseMasterItem>('COURSES')
      .getAll()
      .pipe(catchError(() => of([] as CourseMasterItem[]))),
    { initialValue: [] as CourseMasterItem[] }
  );

  protected readonly courseInfo = computed(() => courseDetailsOf(this.batch(), this.masters().filter(c => c.status !== 'Inactive')));

  /** The IPA course of a batch made under an IPA, worded as in the Create Batch form. */
  protected readonly ipaCourse = computed(() => {
    const b = this.batch();
    return b.ipaAllocationId && b.ipaCourseRowId ? `${b.courseName} (${b.sector}) · IPA ${b.nipaNo ?? ''}`.trim() : '';
  });

  protected readonly facultyColumns: TableColumn<BatchFaculty>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'ssoId', label: 'SSO ID', width: 'min-w-[150px]' },
    { key: 'facultyName', label: 'Faculty Name', width: 'min-w-[180px]' },
    { key: 'trainerType', label: 'Trainer Type', width: 'min-w-[160px]' },
    { key: 'qualification', label: 'Qualification / Experience', width: 'min-w-[240px]' }
  ];

  protected readonly cameraColumns: TableColumn<BatchCamera>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'vendor', label: 'Vendor', width: 'min-w-[130px]' },
    { key: 'ipAddress', label: 'IP Address : Port', width: 'min-w-[160px]' },
    { key: 'username', label: 'User Name', width: 'min-w-[130px]' },
    { key: 'liveFeedUrl', label: 'Live Feed Link', width: 'min-w-[260px]' }
  ];

  protected readonly hostelColumns: TableColumn<BatchHostel>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'hostelAddress', label: 'Hostel Address', width: 'min-w-[260px]' },
    { key: 'hostelCode', label: 'Hostel Code', width: 'min-w-[130px]' },
    { key: 'type', label: 'Type', width: 'min-w-[120px]' },
    { key: 'capacity', label: 'Capacity', align: 'center', width: 'w-28' }
  ];

  /** The trainers of the batch, in the shape the table reads (older batches store the name and type under other keys). */
  protected readonly faculty = computed(() =>
    (this.batch().faculty ?? []).map(f => ({
      ...f,
      ssoId: f.ssoId ?? '',
      facultyName: f.facultyName ?? f.name ?? '',
      trainerType: f.trainerType ?? f.type ?? '',
      qualification: f.qualification ?? ''
    }))
  );

  /** The cameras of the batch; the password is not part of what is shown. */
  protected readonly cameras = computed(() => (this.batch().cameras ?? []).map(({ password: _hidden, ...rest }) => rest as BatchCamera));

  protected readonly hostels = computed(() => {
    const b = this.batch();
    const list = b.hostels && b.hostels.length > 0 ? b.hostels : b.hostel ? [b.hostel] : [];
    return list.map(h => ({
      ...h,
      hostelAddress: h.hostelAddress ?? h.address ?? '',
      hostelCode: h.hostelCode ?? h.code ?? '',
      type: h.type ?? h.hostelType ?? '',
      capacity: h.capacity ?? 0
    }));
  });

  protected readonly remarks = computed(() => batchRemarksOf(this.batch()));

  protected text(value: string | number | null | undefined): string {
    return show(value);
  }

  protected when(at: string): string {
    return formatDateTime(at);
  }
}
