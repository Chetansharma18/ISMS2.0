import { Component, Input, Output, EventEmitter, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="px-4 py-3 bg-[#F5F7F9] border-t border-[#D9E1E7] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[13px] text-[#5F6B76] font-sans">
      
      <!-- Left: Item counts -->
      <div class="flex items-center gap-2">
        <span>
          Showing
          <strong class="font-semibold text-[#1F2933]">{{ startItem() }}</strong>
          to
          <strong class="font-semibold text-[#1F2933]">{{ endItem() }}</strong>
          of
          <strong class="font-semibold text-[#1F2933]">{{ totalItems }}</strong>
          entries
        </span>

        @if (showPageSizeSelector && pageSizeOptions.length > 1) {
          <div class="flex items-center gap-1.5 ml-3 pl-3 border-l border-[#D9E1E7]">
            <span>Show</span>
            <select
              [value]="pageSize"
              (change)="onPageSizeChange($event)"
              class="bg-white border border-[#D9E1E7] rounded-[4px] px-2 py-0.5 text-[12px] text-[#1F2933] focus:outline-none focus:border-[#174A6E]"
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
          class="h-[30px] px-2 rounded-[4px] border border-[#D9E1E7] bg-white hover:bg-[#EAF2F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[12px] cursor-pointer"
          title="First Page"
        >
          «
        </button>

        <!-- Previous Page -->
        <button
          type="button"
          (click)="goToPage(currentPage - 1)"
          [disabled]="currentPage === 1"
          class="h-[30px] px-2.5 rounded-[4px] border border-[#D9E1E7] bg-white hover:bg-[#EAF2F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[12px] font-medium cursor-pointer"
        >
          Previous
        </button>

        <!-- Visible page numbers -->
        @for (page of visiblePages(); track page) {
          @if (page === -1) {
            <span class="px-1.5 py-1 text-[#7A8792]">...</span>
          } @else {
            <button
              type="button"
              (click)="goToPage(page)"
              class="min-w-[30px] h-[30px] px-2 rounded-[4px] border text-[12px] font-medium transition-colors cursor-pointer"
              [class.bg-[#174A6E]]="page === currentPage"
              [class.text-white]="page === currentPage"
              [class.border-[#174A6E]]="page === currentPage"
              [class.bg-white]="page !== currentPage"
              [class.text-[#1F2933]]="page !== currentPage"
              [class.border-[#D9E1E7]]="page !== currentPage"
              [class.hover:bg-[#EAF2F6]]="page !== currentPage"
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
          class="h-[30px] px-2.5 rounded-[4px] border border-[#D9E1E7] bg-white hover:bg-[#EAF2F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[12px] font-medium cursor-pointer"
        >
          Next
        </button>

        <!-- Last Page -->
        <button
          type="button"
          (click)="goToPage(totalPages())"
          [disabled]="currentPage >= totalPages()"
          class="h-[30px] px-2 rounded-[4px] border border-[#D9E1E7] bg-white hover:bg-[#EAF2F6] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-[12px] cursor-pointer"
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
