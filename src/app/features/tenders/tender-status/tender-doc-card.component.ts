import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FileDoc } from '../../registration/models/otr-form.model';
import { SubmittedTenderDoc } from '../../../core/models/tender.model';
import { TenderOtrDocType } from './tender-status.util';

/** Payload emitted when a document should be opened in the viewer. */
export interface TenderDocViewRequest {
  fileName: string;
  title: string;
  fileSize: string;
}

/** Payload emitted when a registration / signatory / bank document is replaced. */
export interface TenderDocReplaceRequest {
  event: Event;
  docType: TenderOtrDocType;
}

/** Payload emitted when a row of the proposal documents table is replaced. */
export interface TenderProposalDocReplaceRequest {
  event: Event;
  doc: SubmittedTenderDoc;
}

@Component({
  selector: 'app-tender-doc-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <div
      class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs"
      [class.max-w-md]="narrow()"
    >
      <div class="min-w-0 flex items-center gap-2">
        <svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <rect width="24" height="24" rx="3" fill="#E5252A"/>
          <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
        </svg>
        <div class="min-w-0">
          <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ doc()?.fileName || fallbackName() }}</span>
          <span class="text-[10px] text-slate-500">{{ doc()?.fileSize || fallbackSize() }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button type="button" (click)="onView()" class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 rounded text-xs font-medium cursor-pointer">View</button>
        @if (isEditing()) {
          <label class="px-2 py-1 bg-white hover:bg-slate-100 border border-slate-300 text-brand rounded text-xs font-medium cursor-pointer">
            Replace
            <input type="file" (change)="replace.emit($event)" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
          </label>
        }
      </div>
    </div>
  `
})
export class TenderDocCardComponent {
  readonly doc = input<FileDoc | null | undefined>(null);
  readonly fallbackName = input.required<string>();
  /** Shown when the document has no size, and always passed to the viewer. */
  readonly fallbackSize = input.required<string>();
  readonly viewTitle = input.required<string>();
  readonly isEditing = input(false);
  readonly narrow = input(false);

  readonly view = output<TenderDocViewRequest>();
  readonly replace = output<Event>();

  onView(): void {
    this.view.emit({
      fileName: this.doc()?.fileName || this.fallbackName(),
      title: this.viewTitle(),
      fileSize: this.fallbackSize()
    });
  }
}
