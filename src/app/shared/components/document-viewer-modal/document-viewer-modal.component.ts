import { Component, Input, Output, EventEmitter, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FileDoc } from '../../../features/registration/models/otr-form.model';

@Component({
  selector: 'app-document-viewer-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (isOpen && doc) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150"
        role="dialog"
        aria-modal="true"
        (click)="onBackdropClick($event)"
      >
        <div
          class="bg-white rounded-lg border border-[#D9E1E7] shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] font-sans animate-in zoom-in-95 duration-150"
          (click)="$event.stopPropagation()"
        >
          <!-- Modal Header -->
          <div class="px-5 py-3.5 border-b border-[#D9E1E7] bg-[#0483AC] text-white flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- Adobe PDF icon -->
              <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
              </svg>
              <div class="truncate">
                <h3 class="text-[15px] font-semibold text-white tracking-tight m-0 truncate" style="color: #ffffff !important;">
                  {{ title || doc.fileName }}
                </h3>
                <span class="text-[11px] text-white/80 font-normal" style="color: rgba(255,255,255,0.85) !important;">
                  Document Preview &bull; {{ doc.fileName }}
                </span>
              </div>
            </div>

            <!-- Close Button -->
            <button
              type="button"
              (click)="closeModal()"
              class="w-7 h-7 rounded-full text-white/80 hover:text-white hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer focus:outline-none shrink-0"
              title="Close viewer"
              aria-label="Close modal"
            >
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Document Metadata Strip -->
          <div class="px-5 py-2.5 bg-[#F5F7F9] border-b border-[#D9E1E7] flex flex-wrap items-center justify-between gap-3 text-xs text-slate-600 shrink-0">
            <div class="flex items-center gap-4 flex-wrap">
              <div>
                <span class="text-slate-400 text-[11px] font-medium block">File Name</span>
                <span class="font-semibold text-slate-800 break-all">{{ doc.fileName }}</span>
              </div>
              <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span class="text-slate-400 text-[11px] font-medium block">File Size</span>
                <span class="font-medium text-slate-700">{{ doc.fileSize || 'Standard PDF' }}</span>
              </div>
              <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
              <div>
                <span class="text-slate-400 text-[11px] font-medium block">Upload Date</span>
                <span class="font-medium text-slate-700">{{ doc.uploadDate || 'Attached' }}</span>
              </div>
            </div>

            <div class="flex items-center gap-1.5">
              <span class="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-semibold">
                <svg class="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                </svg>
                <span>Verified Upload</span>
              </span>
            </div>
          </div>

          <!-- Document Canvas / Viewer Body -->
          <div class="p-6 overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center">
            @if (doc.fileUrl) {
              <iframe
                [src]="doc.fileUrl"
                class="w-full h-[480px] rounded border border-slate-300 bg-white"
                title="Document viewer"
              ></iframe>
            } @else {
              <!-- Government Document Preview Simulation Canvas -->
              <div class="w-full max-w-xl bg-white border-2 border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm relative overflow-hidden text-center space-y-5">
                
                <!-- Watermark Background -->
                <div class="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
                  <svg class="w-72 h-72 text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2L2 7v7c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.75-1.07-6.5-4.83-6.9-9.1.5.07 1 .1 1.5.1 3.53 0 6.64-1.8 8.4-4.54 1.76 2.74 4.87 4.54 8.4 4.54.5 0 1-.03 1.5-.1-.4 4.27-3.15 8.03-6.9 9.1z"/>
                  </svg>
                </div>

                <!-- Document Header -->
                <div class="border-b-2 border-slate-200 pb-4 space-y-1">
                  <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF2F6] text-[#174A6E] rounded-full text-xs font-semibold uppercase tracking-wider">
                    Integrated Scheme Management System (ISMS 2.0)
                  </div>
                  <h4 class="text-base sm:text-lg font-bold text-slate-900 pt-2 tracking-tight">
                    Official Document Attachment
                  </h4>
                  <p class="text-xs text-slate-500 font-normal">
                    One Time Registration (OTR) Repository &bull; Government of Rajasthan
                  </p>
                </div>

                <!-- Document Particulars Box -->
                <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left space-y-2.5 text-xs">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="text-slate-500 font-medium">Document Title:</span>
                    <strong class="text-slate-800 font-semibold">{{ title || doc.fileName }}</strong>
                  </div>
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="text-slate-500 font-medium">Original Filename:</span>
                    <span class="font-mono text-slate-700">{{ doc.fileName }}</span>
                  </div>
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="text-slate-500 font-medium">File Size:</span>
                    <span class="text-slate-700 font-medium">{{ doc.fileSize }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500 font-medium">Verification Status:</span>
                    <span class="text-emerald-700 font-bold flex items-center gap-1">
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                      Verified &amp; Digitally Signed
                    </span>
                  </div>
                </div>

                <!-- Seal Watermark Stamp Graphic -->
                <div class="pt-2 flex items-center justify-center">
                  <div class="inline-flex items-center gap-2 border-2 border-dashed border-emerald-600/70 text-emerald-800 bg-emerald-50/70 px-4 py-2 rounded-md font-bold text-xs uppercase tracking-wide">
                    <svg class="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                    <span>Official ISMS Certified Attachment</span>
                  </div>
                </div>

              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 border-t border-[#D9E1E7] bg-white flex items-center justify-between gap-3 shrink-0">
            <span class="text-xs text-slate-400 hidden sm:inline">
              Press <kbd class="px-1.5 py-0.5 text-[10px] bg-slate-100 border border-slate-300 rounded font-mono">ESC</kbd> to exit preview
            </span>

            <div class="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                (click)="simulateDownload()"
                class="px-3.5 py-1.5 rounded border border-[#D9E1E7] bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download Copy</span>
              </button>

              <button
                type="button"
                (click)="closeModal()"
                class="px-4 py-1.5 rounded bg-[#0483AC] hover:bg-[#036c8f] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class DocumentViewerModalComponent {
  @Input() isOpen = false;
  @Input() doc: FileDoc | null = null;
  @Input() title?: string;

  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) {
      this.closeModal();
    }
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.closeModal();
    }
  }

  closeModal(): void {
    this.close.emit();
  }

  simulateDownload(): void {
    if (this.doc?.fileUrl) {
      window.open(this.doc.fileUrl, '_blank');
    } else {
      // Gentle notification or simulate downloading the document
      const link = document.createElement('a');
      link.href = '#';
      link.setAttribute('download', this.doc?.fileName || 'document.pdf');
      alert(`Downloading document: ${this.doc?.fileName || 'document.pdf'}`);
    }
  }
}
