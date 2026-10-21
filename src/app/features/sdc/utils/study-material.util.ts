import type { BatchRecord, StudyMaterial, StudyMaterialType } from '../models/batch.model';
import { isBatchApproved } from './batch-approval.util';

/** How a kind of material is given: a file to upload, or the link of a live session. */
export interface StudyMaterialKind {
  id: StudyMaterialType;
  label: string;
  mode: 'file' | 'link';
  /** What the file picker offers: extensions (".pdf") or media groups ("image/*"). */
  accept: string;
  /** Largest file in MB. */
  maxMb: number;
  /** One line telling what to upload and in which formats. */
  hint: string;
}

/** The kinds of E-Campus material: course content, digital media, live training videos, syllabus and other training material. */
export const STUDY_MATERIAL_KINDS: readonly StudyMaterialKind[] = [
  {
    id: 'E_COURSE_CONTENT',
    label: 'E-Course Content',
    mode: 'file',
    accept: '.pdf,.ppt,.pptx,.doc,.docx,.zip',
    maxMb: 50,
    hint: 'Lessons, chapters or modules (PDF, PPT, DOC, ZIP)'
  },
  {
    id: 'SYLLABUS',
    label: 'E-Course Syllabus',
    mode: 'file',
    accept: '.pdf,.doc,.docx',
    maxMb: 10,
    hint: 'Syllabus of the course (PDF, DOC)'
  },
  {
    id: 'DOCUMENT',
    label: 'Training Document',
    mode: 'file',
    accept: '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt',
    maxMb: 25,
    hint: 'Notes, handouts, presentations, question papers (PDF, DOC, PPT, XLS, TXT)'
  },
  {
    id: 'VIDEO',
    label: 'Training Video',
    mode: 'file',
    accept: '.mp4,.webm,.mov',
    maxMb: 200,
    hint: 'Recorded session or demonstration (MP4, WEBM, MOV)'
  },
  {
    id: 'DIGITAL_MEDIA',
    label: 'Digital Media',
    mode: 'file',
    accept: 'image/*,audio/*,video/*',
    maxMb: 100,
    hint: 'Images, audio, animations or clips'
  },
  {
    id: 'LIVE_VIDEO',
    label: 'Live Training Video',
    mode: 'link',
    accept: '',
    maxMb: 0,
    hint: 'Link of the live session with the date and time it is held'
  }
];

export function kindOf(type: StudyMaterialType | string): StudyMaterialKind {
  return STUDY_MATERIAL_KINDS.find(kind => kind.id === type) ?? STUDY_MATERIAL_KINDS[0];
}

/** Study material can be uploaded once the batch is approved (it stays open while the batch runs and after). */
export function canUploadStudyMaterial(b: BatchRecord | undefined): boolean {
  return !!b && isBatchApproved(b) && b.status !== 'CANCELLED';
}

/** The file chosen for a material: only what the checks need. */
export interface ChosenFile {
  name: string;
  sizeBytes: number;
  /** MIME type as the browser reports it (can be empty). */
  mimeType: string;
  /** The size as it was shown when the file was uploaded, for a file that is already uploaded. */
  sizeLabel?: string;
}

/** What the upload form holds. */
export interface StudyMaterialDraft {
  type: StudyMaterialType;
  title: string;
  scope: 'COURSE' | 'SESSION';
  /** Typed text, so a blank or a letter can be reported. */
  sessionNo: string;
  sessionTopic: string;
  file: ChosenFile | null;
  link: string;
  liveDate: string;
  liveTime: string;
}

const LINK_PATTERN = /^https?:\/\/\S+$/i;

/** A file size as "850 KB" or "12.4 MB". */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Whether the file is of a format the kind takes (by extension, or by media group such as image/*). */
export function fileMatchesKind(file: ChosenFile, kind: StudyMaterialKind): boolean {
  const lowerName = file.name.toLowerCase();
  return kind.accept.split(',').some(token => {
    const rule = token.trim().toLowerCase();
    if (rule.startsWith('.')) return lowerName.endsWith(rule);
    if (rule.endsWith('/*')) return file.mimeType.toLowerCase().startsWith(rule.slice(0, -1));
    return false;
  });
}

/** The formats a kind takes in words: "PDF, PPT, DOC" or "image, audio or video". */
export function acceptedFormats(kind: StudyMaterialKind): string {
  const tokens = kind.accept.split(',').map(token => token.trim());
  const extensions = tokens.filter(token => token.startsWith('.')).map(token => token.slice(1).toUpperCase());
  if (extensions.length > 0) return extensions.join(', ');
  return tokens.map(token => token.replace('/*', '')).join(', ').replace(/, ([^,]*)$/, ' or $1');
}

/** A message for each field that is not right; an empty object when the material can be uploaded. */
export function validateStudyMaterial(draft: StudyMaterialDraft): Record<string, string> {
  const errors: Record<string, string> = {};
  const kind = kindOf(draft.type);

  if (!draft.title.trim()) errors['title'] = 'Enter a title.';

  if (draft.scope === 'SESSION') {
    const no = Number(draft.sessionNo);
    if (!draft.sessionNo.trim() || !Number.isInteger(no) || no < 1) errors['sessionNo'] = 'Enter the session number (1 or more).';
  }

  if (kind.mode === 'file') {
    if (!draft.file) errors['file'] = 'Choose the file to upload.';
    else if (!fileMatchesKind(draft.file, kind)) errors['file'] = `Choose a ${acceptedFormats(kind)} file.`;
    else if (draft.file.sizeBytes > kind.maxMb * 1024 * 1024) errors['file'] = `The file is ${formatFileSize(draft.file.sizeBytes)}; the most allowed is ${kind.maxMb} MB.`;
  } else {
    if (!LINK_PATTERN.test(draft.link.trim())) errors['link'] = 'Enter the link starting with https:// or http://.';
    if (!draft.liveDate) errors['liveDate'] = 'Enter the date of the session.';
    if (!draft.liveTime) errors['liveTime'] = 'Enter the time of the session.';
  }
  return errors;
}

/** "Whole course" or "Session 3: Safety basics". */
export function sessionLabel(material: Pick<StudyMaterial, 'sessionNo' | 'sessionTopic'>): string {
  if (!material.sessionNo) return 'Whole course';
  return material.sessionTopic ? `Session ${material.sessionNo}: ${material.sessionTopic}` : `Session ${material.sessionNo}`;
}
