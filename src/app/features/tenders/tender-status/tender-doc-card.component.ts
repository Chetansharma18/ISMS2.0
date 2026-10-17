import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../shared';
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
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
  template: `
    <div
      class="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between gap-2 shadow-2xs"
      [class.max-w-md]="narrow()"
    >
      <div class="min-w-0 flex items-center gap-2">
        <app-icon name="pdf-badge-r3" solid class="text-[#E5252A] select-none" />
        <div class="min-w-0">
          <span class="font-medium text-slate-800 truncate block text-[11.5px]">{{ doc()?.fileName || fallbackName() }}</span>
          <span class="text-[10px] text-slate-500">{{ doc()?.fileSize || fallbackSize() }}</span>
        </div>
      </div>
      <div class="flex items-center gap-1 shrink-0">
        <button appButton variant="outline" size="sm" type="button" (click)="onView()">View</button>
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
