import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDoc } from '../../../features/registration/models/otr-form.model';
import { DocumentViewerService } from '../../../core/services/document-viewer.service';

/**
 * @deprecated Legacy modal preview component.
 * Document viewing across the entire application has been modernized to open directly in a new tab in Chrome.
 */
@Component({
  selector: 'app-document-viewer-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  template: ``
})
export class DocumentViewerModalComponent {
  private docViewer = inject(DocumentViewerService);

  @Input() set isOpen(open: boolean) {
    if (open && this.doc) {
      this.docViewer.openDocument(this.doc, this.title);
      this.close.emit();
    }
  }
  @Input() doc: FileDoc | null = null;
  @Input() title?: string;

  @Output() close = new EventEmitter<void>();
}
