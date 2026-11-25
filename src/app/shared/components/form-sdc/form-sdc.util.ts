import {
  FormActionConfig,
  FormFieldConfig,
  FormSectionConfig
} from './form-sdc.types';

/**
 * Pure helpers behind FormSdcComponent. Nothing here touches component state,
 * so each piece can be unit tested without TestBed.
 */

type GridCols = 1 | 2 | 3 | 4;

/** Reads a value from the model, supporting dot-notation ('step1.sdcName'). Missing values read as ''. */
export function readModelValue(model: Record<string, any> | null | undefined, key: string): any {
  if (!model || !key) return '';
  if (key.includes('.')) {
    const parts = key.split('.');
    return parts.reduce((acc: any, part) => (acc ? acc[part] : undefined), model) ?? '';
  }
  return model[key] ?? '';
}

/** Writes a value into the model (mutating it), creating intermediate objects for dot-notation keys. */
export function writeModelValue(model: Record<string, any>, key: string, value: any): void {
  if (key.includes('.')) {
    const parts = key.split('.');
    let curr = model;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!curr[parts[i]]) curr[parts[i]] = {};
      curr = curr[parts[i]];
    }
    curr[parts[parts.length - 1]] = value;
  } else {
    model[key] = value;
  }
}

/** Resolves a `boolean | ((model) => boolean)` flag; `fallback` applies when the flag is undefined. */
export function resolveFlag(
  flag: boolean | ((model: any) => boolean) | undefined,
  model: Record<string, any>,
  fallback: boolean
): boolean {
  if (flag === undefined) return fallback;
  if (typeof flag === 'boolean') return flag;
  if (typeof flag === 'function') return flag(model);
  return fallback;
}

/** Resolves a static-or-dynamic label / placeholder to a string. */
export function resolveText(
  text: string | ((model: any) => string) | undefined,
  model: Record<string, any>
): string {
  if (typeof text === 'function') {
    return text(model);
  }
  return text || '';
}

export function isNonEmptyFile(val: any): boolean {
  if (!val) return false;
  if (typeof val === 'string' && val.trim().length > 0) return true;
  if (typeof val === 'object' && (val.fileName || val.name)) return true;
  return false;
}

export function fileDisplayName(val: any): string {
  if (!val) return '';
  if (typeof val === 'string') return val;
  return val.fileName || val.name || '';
}

/** Shape stored in the model for a single uploaded file. */
export function buildFileData(file: File): { fileName: string; fileSize: string; uploadDate: string; uploadedAt: string; fileUrl: string | undefined } {
  const fileSizeMb = file.size / (1024 * 1024);

  let objectUrl: string | undefined;
  try {
    objectUrl = URL.createObjectURL(file);
  } catch {
    // fallback
  }

  return {
    fileName: file.name,
    fileSize: `${fileSizeMb.toFixed(2)} MB`,
    uploadDate: new Date().toLocaleDateString('en-GB'),
    uploadedAt: new Date().toISOString(),
    fileUrl: objectUrl
  };
}

/** Appends the chosen image files to an existing photo list (does not mutate `existing`). */
export function appendPhotos(existing: any[], files: File[]): any[] {
  const currentList: any[] = [...existing];

  files.forEach((file, index) => {
    const fileSizeMb = (file.size / (1024 * 1024)).toFixed(2);
    let objectUrl: string;
    try {
      objectUrl = URL.createObjectURL(file);
    } catch {
      objectUrl = '';
    }

    currentList.push({
      id: 'photo-' + Date.now() + '-' + index,
      name: file.name,
      url: objectUrl,
      size: `${fileSizeMb} MB`,
      tag: `Photo ${currentList.length + 1}`
    });
  });

  return currentList;
}

/** Document shape consumed by the document viewer modal for a stored file value. */
export function buildFilePreviewDoc(fileName: string, fileVal: any): any {
  const fileSize = typeof fileVal === 'object' && fileVal.fileSize ? fileVal.fileSize : '2.40 MB';
  const fileUrl = typeof fileVal === 'object' && fileVal.fileUrl ? fileVal.fileUrl : undefined;
  return {
    fileName,
    fileSize,
    uploadDate: new Date().toLocaleDateString('en-GB'),
    status: 'uploaded',
    fileUrl
  };
}

/** Document shape consumed by the document viewer modal for a photo. */
export function buildPhotoPreviewDoc(photo: any): any {
  return {
    fileName: photo.name,
    fileSize: photo.size || 'Image',
    fileUrl: photo.url,
    uploadDate: new Date().toLocaleDateString('en-GB')
  };
}

/** Grid CSS for a container with the given number of columns. */
export function gridClassFor(cols: GridCols = 4): string {
  switch (cols) {
    case 1:
      return 'grid grid-cols-1 gap-x-4 gap-y-3.5 text-xs';
    case 2:
      return 'grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3.5 text-xs';
    case 3:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-3.5 text-xs';
    case 4:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5 text-xs';
    default:
      return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3.5 text-xs';
  }
}

/** Col-span CSS class for an individual field inside a container with `containerCols` columns. */
export function fieldColClassFor(field: FormFieldConfig, containerCols: GridCols = 4): string {
  if (field.type === 'heading' || field.type === 'divider') {
    return 'col-span-full';
  }

  if (field.colSpan === 'full') {
    return 'col-span-full';
  }

  if (containerCols === 1) {
    return 'col-span-1';
  }

  if (containerCols === 2) {
    if (field.colSpan === 2) return 'col-span-1 sm:col-span-2';
    return 'col-span-1';
  }

  if (containerCols === 3) {
    if (field.colSpan === 3) return 'col-span-1 sm:col-span-3';
    if (field.colSpan === 2) return 'col-span-1 sm:col-span-2';
    return 'col-span-1';
  }

  if (containerCols === 4) {
    if (field.colSpan === 4) return 'col-span-1 sm:col-span-2 lg:col-span-4';
    if (field.colSpan === 3) return 'col-span-1 sm:col-span-2 lg:col-span-3';
    if (field.colSpan === 2) return 'col-span-1 sm:col-span-2 lg:col-span-2';
    return 'col-span-1';
  }

  return 'col-span-1';
}

/** Active (visible) fields across all visible sections, or the flat field list when there are no sections. */
export function collectVisibleFields(
  sections: FormSectionConfig[] | null | undefined,
  fields: FormFieldConfig[] | null | undefined,
  model: Record<string, any>
): FormFieldConfig[] {
  const allFields: FormFieldConfig[] = [];

  if (sections && sections.length > 0) {
    for (const sec of sections) {
      if (resolveFlag(sec.visible, model, true)) {
        for (const f of sec.fields) {
          if (resolveFlag(f.visible, model, true)) {
            allFields.push(f);
          }
        }
      }
    }
  } else if (fields) {
    for (const f of fields) {
      if (resolveFlag(f.visible, model, true)) {
        allFields.push(f);
      }
    }
  }

  return allFields;
}

export interface FormValidationResult {
  errors: Record<string, string>;
  /** Key of the first field (in render order) that failed validation, or null when everything passed. */
  firstErrorKey: string | null;
}

/** Validates the given fields against the model: required, email, length, numeric range, pattern, custom. */
export function validateFields(
  allFields: FormFieldConfig[],
  model: Record<string, any>
): FormValidationResult {
  const errors: Record<string, string> = {};
  let firstErrorKey: string | null = null;

  const fail = (key: string, message: string): void => {
    errors[key] = message;
    if (!firstErrorKey) firstErrorKey = key;
  };

  for (const field of allFields) {
    const val = readModelValue(model, field.key);

    // 1. Required check
    if (field.required) {
      const isPhotosEmpty = field.type === 'photos' && (!Array.isArray(val) || val.length < (field.minPhotos || 3));
      const isEmpty =
        val == null ||
        val === '' ||
        (field.type === 'checkbox' && !val) ||
        (field.type === 'file' && !isNonEmptyFile(val)) ||
        isPhotosEmpty ||
        (typeof val === 'string' && val.trim() === '') ||
        (Array.isArray(val) && val.length === 0);

      if (isEmpty) {
        if (field.type === 'photos' && Array.isArray(val) && val.length < (field.minPhotos || 3)) {
          fail(field.key, `Please upload at least ${field.minPhotos || 3} photos of the center`);
        } else {
          fail(field.key, field.requiredMessage || `${resolveText(field.label, model)} is required`);
        }
        continue;
      }
    }

    // Check minPhotos even if not strictly required, if some photos uploaded
    if (field.type === 'photos' && Array.isArray(val) && val.length > 0 && val.length < (field.minPhotos || 3)) {
      fail(field.key, `Please upload at least ${field.minPhotos || 3} photos of the center`);
      continue;
    }

    // If value is empty and not required, skip format checks
    if (val == null || val === '') continue;

    // 2. Email format check
    if (field.type === 'email' && typeof val === 'string') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(val)) {
        fail(field.key, 'Please enter a valid email address');
        continue;
      }
    }

    // 3. Min / Max length checks
    if (typeof val === 'string') {
      if (field.minLength && val.length < field.minLength) {
        fail(field.key, `Minimum ${field.minLength} characters required`);
        continue;
      }
      if (field.maxLength && val.length > field.maxLength) {
        fail(field.key, `Maximum ${field.maxLength} characters allowed`);
        continue;
      }
    }

    // 4. Min / Max numeric checks
    if (field.type === 'number' && typeof val === 'number') {
      if (field.min != null && val < Number(field.min)) {
        fail(field.key, `Value cannot be less than ${field.min}`);
        continue;
      }
      if (field.max != null && val > Number(field.max)) {
        fail(field.key, `Value cannot be greater than ${field.max}`);
        continue;
      }
    }

    // 5. Regex pattern check
    if (field.pattern && typeof val === 'string') {
      const regex = typeof field.pattern === 'string' ? new RegExp(field.pattern) : field.pattern;
      if (!regex.test(val)) {
        fail(field.key, field.patternMessage || `Invalid format for ${resolveText(field.label, model)}`);
        continue;
      }
    }

    // 6. Custom validator function
    if (field.validator) {
      const customErr = field.validator(val, model);
      if (customErr) {
        fail(field.key, customErr);
        continue;
      }
    }
  }

  return { errors, firstErrorKey };
}

/** Whether an action button should be disabled for the current model. */
export function isActionDisabledFor(action: FormActionConfig, model: Record<string, any>): boolean {
  return resolveFlag(action.disabled, model, false);
}
