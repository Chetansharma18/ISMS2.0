import { Component, Input, Output, EventEmitter, HostListener, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
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
          <div class="px-5 py-3.5 border-b border-[#D9E1E7] bg-[#174A6E] text-white flex items-center justify-between gap-3 shrink-0">
            <div class="flex items-center gap-2.5 min-w-0">
              <!-- PDF or Image Icon -->
              <div class="w-7 h-7 rounded-md bg-white/20 flex items-center justify-center shrink-0">
                @if (isPdfFile(doc)) {
                  <span class="text-[9px] font-extrabold text-white tracking-tight">PDF</span>
                } @else {
                  <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                }
              </div>
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
          <div class="px-5 py-2.5 bg-[#F5F7F9] border-b border-[#D9E1E7] flex flex-wrap items-center gap-4 text-xs text-slate-600 shrink-0">
            <div>
              <span class="text-slate-400 text-[11px] font-medium block">File Name</span>
              <span class="font-semibold text-slate-800 break-all">{{ doc.fileName }}</span>
            </div>
            <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <span class="text-slate-400 text-[11px] font-medium block">File Size</span>
              <span class="font-medium text-slate-700">{{ doc.fileSize || 'Image / File' }}</span>
            </div>
            <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>
            <div>
              <span class="text-slate-400 text-[11px] font-medium block">Upload Date</span>
              <span class="font-medium text-slate-700">{{ doc.uploadDate || 'Attached' }}</span>
            </div>
          </div>

          <!-- Document Canvas / Viewer Body -->
          <div class="overflow-y-auto flex-1 bg-slate-100 flex items-center justify-center">
            @if (doc.fileUrl) {
              @if (isPdfFile(doc)) {
                <!-- PDF: convert base64 → Blob URL so Chrome renders it -->
                <embed
                  [src]="getSafePdfUrl(doc.fileUrl)"
                  type="application/pdf"
                  class="w-full h-[500px]"
                  title="PDF viewer"
                />
              } @else {
                <!-- Image -->
                <div class="max-h-[500px] flex items-center justify-center p-4">
                  <img
                    [src]="doc.fileUrl"
                    [alt]="doc.fileName"
                    class="max-h-[460px] max-w-full object-contain rounded-md shadow-md"
                  />
                </div>
              }
            } @else {
              <!-- Fallback when no URL -->
              <div class="w-full max-w-xl bg-white border-2 border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm text-center space-y-5 m-6">
                <div class="border-b-2 border-slate-200 pb-4 space-y-1">
                  <div class="inline-flex items-center gap-2 px-3 py-1 bg-[#EAF2F6] text-[#174A6E] rounded-full text-xs font-semibold uppercase tracking-wider">
                    Integrated Scheme Management System (ISMS 2.0)
                  </div>
                  <h4 class="text-base font-bold text-slate-900 pt-2 tracking-tight">Official Document Attachment</h4>
                  <p class="text-xs text-slate-500 font-normal">Document Repository &bull; Government of Rajasthan</p>
                </div>
                <div class="bg-slate-50 rounded-lg p-4 border border-slate-200 text-left space-y-2.5 text-xs">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="text-slate-500 font-medium">Document Title:</span>
                    <strong class="text-slate-800 font-semibold">{{ title || doc.fileName }}</strong>
                  </div>
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span class="text-slate-500 font-medium">Original Filename:</span>
                    <span class="font-mono text-slate-700">{{ doc.fileName }}</span>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="text-slate-500 font-medium">File Size:</span>
                    <span class="text-slate-700 font-medium">{{ doc.fileSize }}</span>
                  </div>
                </div>
              </div>
            }
          </div>

          <!-- Modal Footer -->
          <div class="px-5 py-3 border-t border-[#D9E1E7] bg-white flex items-center justify-end shrink-0">
            <button
              type="button"
              (click)="closeModal()"
              class="px-5 py-1.5 rounded-lg bg-[#174A6E] hover:bg-[#123B59] text-white text-xs font-semibold transition-colors cursor-pointer shadow-xs active:scale-95"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class DocumentViewerModalComponent implements OnDestroy {
  private sanitizer = inject(DomSanitizer);
  private blobUrls: string[] = [];

  @Input() isOpen = false;
  @Input() doc: FileDoc | null = null;
  @Input() title?: string;

  @Output() close = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen) this.closeModal();
  }

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeModal();
  }

  closeModal(): void {
    this.close.emit();
  }

  isPdfFile(doc: any): boolean {
    if (!doc) return false;
    const url = (doc.fileUrl || '').toLowerCase();
    const name = (doc.fileName || '').toLowerCase();
    return url.startsWith('data:application/pdf') || name.endsWith('.pdf');
  }

  /**
   * Converts a base64 data: URL to a Blob URL.
   * Chrome blocks data: URLs in <embed>/<iframe> for security, but allows blob: URLs.
   */
  getSafePdfUrl(dataUrl: string): SafeResourceUrl {
    if (dataUrl.startsWith('data:')) {
      try {
        const [header, base64] = dataUrl.split(',');
        const mime = header.match(/:(.*?);/)?.[1] || 'application/pdf';
        const bstr = atob(base64);
        const u8arr = new Uint8Array(bstr.length);
        for (let i = 0; i < bstr.length; i++) u8arr[i] = bstr.charCodeAt(i);
        const blob = new Blob([u8arr], { type: mime });
        const blobUrl = URL.createObjectURL(blob);
        this.blobUrls.push(blobUrl);
        // Append #toolbar=0 to hide the Chrome PDF viewer toolbar
        return this.sanitizer.bypassSecurityTrustResourceUrl(blobUrl + '#toolbar=0&navpanes=0&scrollbar=0&view=FitH');
      } catch {
        return this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl);
      }
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(dataUrl + '#toolbar=0&navpanes=0');
  }

  ngOnDestroy(): void {
    // Revoke all blob URLs to free memory
    this.blobUrls.forEach(u => URL.revokeObjectURL(u));
  }
}
