import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SkeletonVariant = 'cards' | 'table' | 'form' | 'profile' | 'detail' | 'list';

/**
 * Reusable theme-aligned skeleton loader (#FCF8FA base, #F6E7EA elements, #F8EDF1 highlight, #EADCE2 border).
 * Matches target layouts to prevent layout shift when real data arrives.
 */
@Component({
  selector: 'app-skeleton',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  host: {
    class: 'block',
    role: 'status',
    'aria-live': 'polite',
    'aria-busy': 'true',
    'aria-label': 'Loading content'
  },
  template: `
    @switch (variant()) {
      @case ('cards') {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (item of items(); track item) {
            <div class="isms-skeleton-card p-4 space-y-3">
              <div class="flex items-center justify-between gap-2">
                <div class="isms-skeleton h-3.5 w-24"></div>
                <div class="isms-skeleton h-8 w-8 rounded-lg"></div>
              </div>
              <div class="isms-skeleton h-7 w-20"></div>
              <div class="isms-skeleton h-3 w-32"></div>
            </div>
          }
        </div>
      }

      @case ('table') {
        <div class="isms-skeleton-card overflow-hidden">
          <div class="px-4 py-3 border-b flex items-center justify-between gap-3" style="border-color: var(--color-border); background-color: var(--color-surface-rose);">
            <div class="isms-skeleton h-4 w-32"></div>
            <div class="isms-skeleton h-4 w-24"></div>
          </div>
          <div class="divide-y" style="border-color: var(--color-border);">
            @for (row of items(); track row) {
              <div class="px-4 py-3.5 flex items-center gap-4">
                <div class="isms-skeleton h-3.5 w-10 shrink-0"></div>
                <div class="isms-skeleton h-3.5 flex-1"></div>
                <div class="isms-skeleton h-3.5 w-28 hidden sm:block"></div>
                <div class="isms-skeleton h-6 w-20 rounded-full"></div>
              </div>
            }
          </div>
        </div>
      }

      @case ('form') {
        <div class="isms-skeleton-card p-5 space-y-5">
          <div class="isms-skeleton h-5 w-48"></div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            @for (field of items(); track field) {
              <div class="space-y-2">
                <div class="isms-skeleton h-3.5 w-28"></div>
                <div class="isms-skeleton h-10 w-full"></div>
              </div>
            }
          </div>
        </div>
      }

      @case ('profile') {
        <div class="isms-skeleton-card p-5 space-y-5">
          <div class="flex items-center gap-4">
            <div class="isms-skeleton h-14 w-14 rounded-full shrink-0"></div>
            <div class="space-y-2 flex-1">
              <div class="isms-skeleton h-5 w-52"></div>
              <div class="isms-skeleton h-3.5 w-36"></div>
            </div>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2 border-t" style="border-color: var(--color-border);">
            @for (field of items(); track field) {
              <div class="space-y-1.5">
                <div class="isms-skeleton h-3 w-24"></div>
                <div class="isms-skeleton h-4 w-40"></div>
              </div>
            }
          </div>
        </div>
      }

      @case ('detail') {
        <div class="space-y-4">
          <div class="isms-skeleton-card p-5 space-y-3">
            <div class="isms-skeleton h-6 w-64"></div>
            <div class="isms-skeleton h-3.5 w-full"></div>
            <div class="isms-skeleton h-3.5 w-3/4"></div>
          </div>
          <div class="isms-skeleton-card p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
            @for (cell of items(); track cell) {
              <div class="space-y-1.5">
                <div class="isms-skeleton h-3 w-20"></div>
                <div class="isms-skeleton h-4 w-32"></div>
              </div>
            }
          </div>
        </div>
      }

      @case ('list') {
        <div class="space-y-2.5">
          @for (row of items(); track row) {
            <div class="isms-skeleton-card p-3.5 flex items-center justify-between gap-3">
              <div class="space-y-1.5 flex-1">
                <div class="isms-skeleton h-4 w-2/3"></div>
                <div class="isms-skeleton h-3 w-1/3"></div>
              </div>
              <div class="isms-skeleton h-7 w-20 shrink-0"></div>
            </div>
          }
        </div>
      }
    }
  `
})
export class SkeletonLoaderComponent {
  readonly variant = input<SkeletonVariant>('table');
  readonly count = input<number>(4);

  protected readonly items = computed(() => Array.from({ length: Math.max(1, this.count()) }, (_, i) => i));
}
