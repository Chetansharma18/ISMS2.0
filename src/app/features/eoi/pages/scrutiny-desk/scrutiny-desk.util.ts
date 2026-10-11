import type { DossierDocument } from '../../services/eoi-state.service';

/** Document currently shown in the scrutiny document viewer. */
export interface ActivePreviewDocument {
  id: string;
  title: string;
  fileName: string;
  fileSize: string;
  category: string;
  refCode: string;
}

export type GradeLabel = 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D' | 'Grade E';

export const GRADE_OPTIONS: { value: GradeLabel; label: string }[] = [
  { value: 'Grade A', label: 'Grade A (Score >= 85) - Outstanding Empanelment' },
  { value: 'Grade B', label: 'Grade B (Score 70 - 84) - Satisfactory Empanelment' },
  { value: 'Grade C', label: 'Grade C (Score 55 - 69) - Conditional Empanelment' },
  { value: 'Grade D', label: 'Grade D (Score 40 - 54) - Sub-Optimal' },
  { value: 'Grade E', label: 'Grade E (Score < 40) - Disqualified' }
];

/** Clamps a technical score into the 0 - 100 range. */
export function clampScore(score: number): number {
  return Math.min(100, Math.max(0, score));
}

/** Maps a technical score to its grade (>=85 A, >=70 B, >=55 C, >=40 D, else E). */
export function gradeFromScore(score: number): GradeLabel {
  if (score >= 85) return 'Grade A';
  if (score >= 70) return 'Grade B';
  if (score >= 55) return 'Grade C';
  if (score >= 40) return 'Grade D';
  return 'Grade E';
}

/** Accept form is valid when the score is within 0 - 100 and a grade is selected. */
export function isAcceptFormValid(score: number | null | undefined, grade: string): boolean {
  return score !== null &&
    score !== undefined &&
    score >= 0 &&
    score <= 100 &&
    !!grade;
}

/** Reject form requires meaningful remarks (more than 3 characters after trimming). */
export function isRejectFormValid(remarks: string): boolean {
  return remarks.trim().length > 3;
}

/** Replaces every non alphanumeric character with an underscore. */
export function sanitizeFileToken(value: string): string {
  return value.replace(/[^a-zA-Z0-9]/g, '_');
}

/** Builds the certificate reference code for a dossier document. */
export function buildRefCode(applicantId: string | undefined, docId: string): string {
  return `RSLDC-${applicantId || 'APP'}-${docId.toUpperCase()}-2026`;
}

/** Builds the PDF file name for a dossier document title. */
export function buildDocFileName(title: string): string {
  return sanitizeFileToken(title) + '.pdf';
}

/** Builds the viewer model for a dossier document. */
export function toActivePreviewDocument(doc: DossierDocument, applicantId: string | undefined): ActivePreviewDocument {
  return {
    id: doc.id,
    title: doc.title,
    fileName: buildDocFileName(doc.title),
    fileSize: doc.fileSize,
    category: doc.category,
    refCode: buildRefCode(applicantId, doc.id)
  };
}

/** Folder / archive base name used for the "Download All (ZIP)" export. */
export function buildZipFolderName(anonymousLabel: string | undefined, applicantId: string): string {
  return `${sanitizeFileToken(anonymousLabel || 'Applicant')}_${applicantId}_Documents`;
}

/** File name of a single document inside the ZIP archive (1-based position prefix). */
export function buildZipEntryName(index: number, title: string): string {
  return `${index + 1}_${sanitizeFileToken(title)}.pdf`;
}
