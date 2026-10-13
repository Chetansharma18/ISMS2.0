/** Upload rule applied to every proposal document in Step 3. */
export const DOC_ALLOWED_EXTENSIONS: readonly string[] = ['pdf', 'jpg', 'jpeg', 'png'];

/** Formats shown to the applicant. */
export const DOC_FORMAT_LABEL = 'PDF, JPG, PNG';

export const DOC_MAX_SIZE_MB = 5;
export const DOC_MAX_SIZE_BYTES = DOC_MAX_SIZE_MB * 1024 * 1024;

/** Value for the file input `accept` attribute. */
export const DOC_ACCEPT = '.pdf,.jpg,.jpeg,.png';

/** Returns an error message when the file breaks the rule, otherwise null. */
export function validateDocFile(file: { name: string; size: number }): string | null {
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot + 1).toLowerCase() : '';
  if (!DOC_ALLOWED_EXTENSIONS.includes(ext)) {
    return `Unsupported file type. Allowed: ${DOC_FORMAT_LABEL}.`;
  }
  if (file.size > DOC_MAX_SIZE_BYTES) {
    return `File is too large. Maximum size is ${DOC_MAX_SIZE_MB} MB.`;
  }
  return null;
}
