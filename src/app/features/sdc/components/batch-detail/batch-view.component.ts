import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import {
  FormInputComponent,
  FormSectionComponent,
  TableColumn,
  TableComponent
} from '../../../../shared';
import { categoryLabel } from '../../../eoi/pages/sanction-order-list/sanction-order-list.component';
import { BatchCamera, BatchFaculty, BatchHostel, BatchRecord } from '../../models/batch.model';
import { SdcService } from '../../services/sdc.service';
import { batchStatusLabel } from '../../utils/batch-approval.util';
import { kindOf, sessionLabel } from '../../utils/study-material.util';

/** One line of the study material table. */
interface MaterialLine {
  kind: string;
  title: string;
  session: string;
  source: string;
  uploadedOn: string;
}

/** A field value for a read-only box: a dash when there is nothing to show. */
function show(value: string | number | null | undefined): string {
  return value == null || value === '' ? '—' : String(value);
}

/**
 * The registered batch as the Create Batch form shows it: same card, sections, fields and order, but read-only.
 * Every field is a disabled form control, so it looks like the form and cannot be changed here. Camera passwords
 * are never shown.
 */
@Component({
  selector: 'app-batch-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormInputComponent, FormSectionComponent, TableComponent],
  host: { class: 'block' },
  template: `
    @let b = batch();
    <div class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-7 space-y-6 font-sans">
      <app-form-section class="block" title="Batch">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Batch Code" [disabled]="true" [value]="text(b.batchCode)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="IPA No." [disabled]="true" [value]="text(b.nipaNo)"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Status" [disabled]="true" [value]="statusText()"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Training Partner" [disabled]="true" [value]="text(b.tpName)"></app-form-input>
          </div>
        </div>
      </app-form-section>

      <app-form-section class="block" title="Center Details">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-input label="Center Name" [disabled]="true" [value]="text(b.sdcName)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Center Code" [disabled]="true" [value]="text(b.sdcCode)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="District" [disabled]="true" [value]="text(b.sdcDistrict)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Scheme" [disabled]="true" [value]="text(b.scheme)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Scheme Category" [disabled]="true" [value]="categoryText()"></app-form-input>
          </div>
        </div>
      </app-form-section>

      <app-form-section class="block" title="Batch Details">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Sector" [disabled]="true" [value]="text(b.sector)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Course" [disabled]="true" [value]="text(b.courseName)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Batch Size" [disabled]="true" [value]="text(b.approvedBatchStrength || b.maxStrength)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Registered Trainees" [disabled]="true" [value]="text(b.mappedAspirantsCount || 0)"></app-form-input>
          </div>

          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Batch Start Date" [disabled]="true" [value]="text(b.startDate)"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Batch End Date" [disabled]="true" [value]="text(b.endDate)"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Batch Start Time" [disabled]="true" [value]="text(b.startTime)"></app-form-input>
          </div>
          <div class="lg:col-span-3 sm:col-span-1">
            <app-form-input label="Batch End Time" [disabled]="true" [value]="text(b.endTime)"></app-form-input>
          </div>

          <div class="lg:col-span-12 sm:col-span-2">
            <app-form-input label="Remarks" [disabled]="true" [value]="text(b.remarks)"></app-form-input>
          </div>
        </div>
      </app-form-section>

      <app-form-section class="block" title="Course Details">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-input label="QP / Job Role Code" [disabled]="true" [value]="text(b.qpCode)"></app-form-input>
          </div>
          <div class="lg:col-span-2 sm:col-span-1">
            <app-form-input label="Version" [disabled]="true" [value]="text(b.courseVersion)"></app-form-input>
          </div>
          <div class="lg:col-span-6 sm:col-span-1">
            <app-form-input label="Total Duration (hrs)" [disabled]="true" [value]="text(b.totalHours || b.batchDurationHours)"></app-form-input>
          </div>

          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Theory Duration (hrs)" [disabled]="true" [value]="text(b.theoryHours)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-1">
            <app-form-input label="Practical + OJT Duration (hrs)" [disabled]="true" [value]="text(b.practicalHours)"></app-form-input>
          </div>
          <div class="lg:col-span-4 sm:col-span-2">
            <app-form-input label="IT & Soft Skill Training (hrs)" [disabled]="true" [value]="text(b.softSkillHours)"></app-form-input>
          </div>
        </div>
      </app-form-section>

      <app-form-section class="block" [title]="'Faculty Details (' + faculty().length + ')'">
        <app-table [columns]="facultyColumns" [data]="faculty()" emptyMessage="No faculty was added to this batch." />
      </app-form-section>

      <app-form-section class="block" [title]="'Camera Configuration (' + cameras().length + ')'">
        <app-table [columns]="cameraColumns" [data]="cameras()" emptyMessage="No camera was added to this batch." />
      </app-form-section>

      @if (materials().length > 0) {
        <app-form-section class="block" [title]="'Study Material (' + materials().length + ')'">
          <app-table [columns]="materialColumns" [data]="materials()" />
        </app-form-section>
      }

      @if (hostels().length > 0) {
        <app-form-section class="block" title="Hostel Details">
          <app-table [columns]="hostelColumns" [data]="hostels()" />
        </app-form-section>
      }

    </div>
  `
})
export class BatchViewComponent {
  private readonly sdcService = inject(SdcService);

  readonly batch = input.required<BatchRecord>();

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

  protected readonly materialColumns: TableColumn<MaterialLine>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'kind', label: 'Type', width: 'min-w-[140px]' },
    { key: 'title', label: 'Title', width: 'min-w-[180px]' },
    { key: 'session', label: 'Session', width: 'min-w-[150px]' },
    { key: 'source', label: 'File / Link', width: 'min-w-[200px]' },
    { key: 'uploadedOn', label: 'Uploaded On', align: 'center', width: 'w-28' }
  ];

  /** The study material uploaded for the batch, as the table shows it. */
  protected readonly materials = computed<MaterialLine[]>(() =>
    (this.batch().studyMaterials ?? []).map(material => ({
      kind: kindOf(material.type).label,
      title: material.title,
      session: sessionLabel(material),
      source:
        material.type === 'LIVE_VIDEO'
          ? `${material.link ?? ''} (${material.liveDate ?? ''} ${material.liveTime ?? ''})`.trim()
          : `${material.fileName ?? ''}${material.fileSize ? ' • ' + material.fileSize : ''}`,
      uploadedOn: material.uploadedAt.slice(0, 10)
    }))
  );

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

  protected text(value: string | number | null | undefined): string {
    return show(value);
  }

  protected statusText(): string {
    return batchStatusLabel(this.batch());
  }

  /** Scheme category of the center the batch belongs to, in normal case ("Rajvik", "Samarth"). */
  protected categoryText(): string {
    return categoryLabel(this.sdcService.getSdcById(this.batch().sdcId)?.schemeCategory);
  }
}
