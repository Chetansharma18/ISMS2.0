import { FormFieldConfig, FormOption } from '../../../shared/components/form-sdc';
import { SECTOR_COURSES_MAP, getCoursesForSector, SectorCourseItem } from './courses-catalog.data';

export { SECTOR_COURSES_MAP, getCoursesForSector };
export type { SectorCourseItem };

export interface BatchCourseOption {
  label: string;
  value: string;
  durationHours: number;
  sector: string;
  qpCode: string;
}

/**
 * Full Course Catalog dynamically constructed from the Master Sector-to-Courses mapping
 */
export const BATCH_COURSE_CATALOG: BatchCourseOption[] = [];
Object.entries(SECTOR_COURSES_MAP).forEach(([sector, courses]) => {
  courses.forEach(c => {
    BATCH_COURSE_CATALOG.push({
      label: c.courseName,
      value: c.courseName,
      durationHours: c.defaultDurationHours,
      sector: sector,
      qpCode: ''
    });
  });
});

export interface BatchFormConfigOptions {
  onCourseChange?: (courseName: string, duration: number) => void;
  onSectorChange?: (sectorName: string) => void;
  sector?: string;
  scheme?: string;
}

/**
 * Step 1: PSD Payment Form Fields Configuration
 */
export function getBatchPsdFormFields(): FormFieldConfig[] {
  return [
    {
      key: 'psdFee',
      label: 'Batch PSD Verification Fee',
      type: 'number',
      prefixText: '₹',
      readonly: true,
      colSpan: 1,
      hint: 'Statutory non-refundable verification fee'
    },
    {
      key: 'psdPaymentStatus',
      label: 'PSD Payment Status',
      type: 'select',
      required: true,
      colSpan: 1,
      options: [
        { label: 'SUCCESS (Verified Online)', value: 'SUCCESS' },
        { label: 'PAID (Challan / Bank Acknowledged)', value: 'PAID' },
        { label: 'PENDING (Awaiting Payment Confirmation)', value: 'PENDING' }
      ]
    },
    {
      key: 'psdPaymentMode',
      label: 'Payment Mode',
      type: 'select',
      colSpan: 1,
      options: [
        { label: 'Online Payment Gateway (e-Mitra / NetBanking)', value: 'Online Gateway (e-Mitra)' },
        { label: 'UPI / QR Code (Instant Verification)', value: 'UPI / QR Code' },
        { label: 'Treasury Challan (e-Gras)', value: 'Treasury Challan' },
        { label: 'NEFT / RTGS Bank Transfer', value: 'NEFT / RTGS' }
      ]
    },
    {
      key: 'psdPaymentRef',
      label: 'Transaction / Challan Ref No.',
      type: 'text',
      placeholder: 'e.g. PSD-TXN-2026-89412',
      colSpan: 1
    },
    {
      key: 'psdPaymentDate',
      label: 'Payment Date',
      type: 'date',
      colSpan: 1
    }
  ];
}

/**
 * Step 2: Batch Creation Fields Configuration
 * Form details matching user specifications:
 * - Sector (Pre-filled from SDC, synced with Course catalog)
 * 1 Course (Dropdown - Dynamically filtered by Sector)
 * 2 Batch Duration In HRS. (Number/Input)
 * 3 Batch Start Date* (Date)
 * 4 Batch End Date (Date)
 * 5 Batch Start Time* (Time)
 * 6 Batch End Time* (Time)
 * 7 Approved Batch Strength (Number / Read-only)
 * 8 Remarks (Textarea)
 */
export function getBatchDetailsFormFields(options: BatchFormConfigOptions = {}): FormFieldConfig[] {
  const currentSector = options.sector || 'Aerospace and Aviation';
  const sectorCourses = getCoursesForSector(currentSector);

  const courseOptions: FormOption[] = sectorCourses.map(c => ({
    label: c.courseName,
    value: c.courseName
  }));

  const allSectors = Object.keys(SECTOR_COURSES_MAP).sort();
  const sectorOptions: FormOption[] = allSectors.map(s => ({
    label: s,
    value: s
  }));

  return [
    // Sector (Already Filled / Pre-selected from SDC allocation - Read-only)
    {
      key: 'sector',
      label: 'Sector',
      type: 'text',
      readonly: true,
      colSpan: 2,
      hint: 'Allocated sector for this SDC (pre-filled from center profile)'
    },

    // 1 Course (Dropdown - Filtered to the selected Sector)
    {
      key: 'course',
      label: 'Course',
      type: 'select',
      required: true,
      requiredMessage: 'Course selection is mandatory',
      colSpan: 2,
      placeholder: '-- Select Course under Sector --',
      options: courseOptions,
      onChange: (value: string, field, model) => {
        const courses = getCoursesForSector(model.sector || currentSector);
        const found = courses.find(c => c.courseName === value);
        if (found) {
          model.batchDurationHours = found.defaultDurationHours;
          if (options.onCourseChange) {
            options.onCourseChange(found.courseName, found.defaultDurationHours);
          }
        }
      }
    },

    // 2 Batch Duration In HRS. (Number/Input)
    {
      key: 'batchDurationHours',
      label: 'Batch Duration In HRS.',
      type: 'number',
      required: true,
      suffixText: 'hrs',
      min: 10,
      max: 2000,
      colSpan: 1,
      placeholder: 'e.g. 490'
    },

    // 3 Batch Start Date* (Date)
    {
      key: 'startDate',
      label: 'Batch Start Date',
      type: 'date',
      required: true,
      requiredMessage: 'Batch start date is mandatory',
      colSpan: 1
    },

    // 4 Batch End Date (Date)
    {
      key: 'endDate',
      label: 'Batch End Date',
      type: 'date',
      colSpan: 1
    },

    // 5 Batch Start Time* (Time)
    {
      key: 'startTime',
      label: 'Batch Start Time',
      type: 'time',
      required: true,
      requiredMessage: 'Batch start time is mandatory',
      colSpan: 1
    },

    // 6 Batch End Time* (Time)
    {
      key: 'endTime',
      label: 'Batch End Time',
      type: 'time',
      required: true,
      requiredMessage: 'Batch end time is mandatory',
      colSpan: 1
    },

    // 7 Approved Batch Strength (Number / Read-only)
    {
      key: 'approvedBatchStrength',
      label: 'Approved Batch Strength',
      type: 'number',
      readonly: true,
      colSpan: 1
    },

    // 8 Remarks (Text input aligned at the same level as End Time & Strength)
    {
      key: 'remarks',
      label: 'Remarks',
      type: 'text',
      placeholder: 'Enter batch remarks, training prerequisites, or special instructions...',
      colSpan: 2
    }
  ];
}
