import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-4 py-3 bg-[#F5F7F9] border-t border-border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px] text-text-secondary font-sans">
      
      <!-- Left: Item counts -->
      <div class="flex items-center gap-2">
        <span>
          Showing
          <strong class="font-semibold text-text-primary">{{ startItem() }}</strong>
          to
          <strong class="font-semibold text-text-primary">{{ endItem() }}</strong>
          of
          <strong class="font-semibold text-text-primary">{{ totalItems }}</strong>
          entries
        </span>

        @if (showPageSizeSelector && pageSizeOptions.length > 1) {
          <div class="flex items-center gap-1.5 ml-3 pl-3 border-l border-border">
            <span>Show</span>
            <select
              [value]="pageSize"
              (change)="onPageSizeChange($event)"
              class="bg-white border border-border rounded-sm px-2 py-0.5 text-[12px] text-text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            >
              @for (size of pageSizeOptions; track size) {
                <option [value]="size">{{ size }}</option>
              }
            </select>
          </div>
        }
      </div>

      <!-- Right: Page buttons -->
      <div class="flex items-center gap-1.5">
        <!-- First Page -->
        <button
          type="button"
          (click)="goToPage(1)"
          [disabled]="currentPage === 1"
          class="h-7.5 px-2 rounded-sm border border-border bg-white hover:bg-primary-light disabled:opacity-40 disabled:pointer-events-none transition-colors text-[12px] cursor-pointer"
          title="First Page"
        >
          «
        </button>

        <!-- Previous Page -->
        <button
          type="button"
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1"
          class="h-7.5 px-2.5 rounded-sm border border-border bg-white hover:bg-primary-light disabled:opacity-40 disabled:pointer-events-none transition-colors text-[12px] font-medium cursor-pointer"
        >
          Previous
        </button>

        <!-- Visible page numbers -->
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-1.5 py-1 text-text-muted">...</span>
          } @else {
            <button
              type="button"
              (click)="goToPage(page)"
              class="min-w-7.5 h-7.5 px-2 rounded-sm border text-[12px] font-medium transition-colors cursor-pointer"
              [class.bg-primary]="page === currentPage"
              [class.text-white]="page === currentPage"
              [class.border-primary]="page === currentPage"
              [class.bg-white]="page !== currentPage"
              [class.text-text-primary]="page !== currentPage"
              [class.border-border]="page !== currentPage"
              [class.hover:bg-primary-light]="page !== currentPage"
            >
              {{ page }}
            </button>
          }
        }

        <!-- Next Page -->
        <button
          type="button"
          (click)="goToPage(currentPage + 1)"
          [disabled]="currentPage >= totalPages()"
          class="h-7.5 px-2.5 rounded-sm border border-border bg-white hover:bg-primary-light disabled:opacity-40 disabled:pointer-events-none transition-colors text-[12px] font-medium cursor-pointer"
        >
          Next
        </button>

        <!-- Last Page -->
        <button
          type="button"
          (click)="goToPage(totalPages())"
          [disabled]="currentPage >= totalPages()"
          class="h-7.5 px-2 rounded-sm border border-border bg-white hover:bg-primary-light disabled:opacity-40 disabled:pointer-events-none transition-colors text-[12px] cursor-pointer"
          title="Last Page"
        >
          »
        </button>
      </div>

    </div>
  `
})
export class PaginationComponent {
  @Input() totalItems: number = 0;
  @Input() pageSize: number = 10;
  @Input() currentPage: number = 1;
  @Input() pageSizeOptions: number[] = [5, 10, 25, 50];
  @Input() showPageSizeSelector: boolean = true;

  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();

  totalPages = computed(() => {
    return Math.max(1, Math.ceil(this.totalItems / (this.pageSize || 10)));
  });

  startItem = computed(() => {
    if (this.totalItems === 0) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  });

  endItem = computed(() => {
    return Math.min(this.currentPage * this.pageSize, this.totalItems);
  });

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
      return pages;
    }

    pages.push(1);
    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (current < total - 2) pages.push(-1);
    pages.push(total);

    return pages;
  });

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages() && page !== this.currentPage) {
      this.pageChange.emit(page);
    }
  }

  onPageSizeChange(event: Event): void {
    const size = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(size);
  }
}
