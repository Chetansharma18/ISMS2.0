import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '../icon/icon.component';
import { LanguageService } from '../../../core/services/language.service';
import { LoadingMessageKey } from '../../../core/translations/loading.translations';

export type LoaderMode = 'fullscreen' | 'page' | 'modal' | 'inline';

let nextGradId = 1;

@Component({
  selector: 'app-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, IconComponent],
  template: `
    <ng-template #signatureMotion>
      <!-- ui-guard-allow: raw-svg - Fluid Dual-Arc Ribbon signature motion loader -->
      <svg
        class="block shrink-0"
        [style.width.px]="svgSizePx()"
        [style.height.px]="svgSizePx()"
        viewBox="0 0 76 76"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient [attr.id]="outerGradId" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color: var(--color-primary);" />
            <stop offset="48%" style="stop-color: var(--color-secondary);" />
            <stop offset="80%" style="stop-color: var(--color-muted-rose);" />
            <stop offset="100%" style="stop-color: var(--color-light-peach);" />
          </linearGradient>
          @if (!isSimplified()) {
            <linearGradient [attr.id]="innerGradId" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style="stop-color: var(--color-secondary);" />
              <stop offset="55%" style="stop-color: var(--color-muted-rose);" />
              <stop offset="100%" style="stop-color: var(--color-light-peach);" />
            </linearGradient>
          }
        </defs>

        <circle
          cx="38"
          cy="38"
          r="32"
          style="stroke: var(--color-surface-blush);"
          [attr.stroke-width]="isSimplified() ? 8 : 5"
        />
        <g class="isms-motion-outer-spin">
          <circle
            class="isms-motion-outer-arc"
            cx="38"
            cy="38"
            r="32"
            [attr.stroke]="'url(#' + outerGradId + ')'"
            [attr.stroke-width]="isSimplified() ? 8 : 5"
          />
        </g>

        @if (!isSimplified()) {
          <g class="isms-motion-inner-spin">
            <circle
              class="isms-motion-inner-arc"
              cx="38"
              cy="38"
              r="21"
              [attr.stroke]="'url(#' + innerGradId + ')'"
              stroke-width="2"
            />
          </g>
        }
      </svg>
    </ng-template>

    @if (mode() === 'fullscreen') {
      <div
        class="fixed inset-0 z-[120] flex items-center justify-center p-6 select-none font-sans isms-loader-fade"
        style="background-color: var(--color-background); color: var(--color-text-secondary);"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div class="flex flex-col items-center text-center max-w-[360px] w-full">
          <ng-container *ngTemplateOutlet="signatureMotion" />

          <h1
            class="mt-[22px] mb-0 text-[30px] leading-[1.15] font-bold tracking-[-0.025em]"
            style="color: var(--color-primary);"
          >
            ISMS <span style="color: var(--color-secondary);">2.0</span>
          </h1>
          <p
            class="mt-1.5 mb-0 text-[12px] leading-[1.45] font-medium"
            style="color: var(--color-text-secondary);"
          >
            Integrated Scheme Management System
          </p>
          <p
            class="mt-[18px] mb-0 text-[12px] leading-[1.45] font-normal"
            style="color: var(--color-text-secondary);"
          >
            {{ resolvedText() }}
          </p>
        </div>
      </div>
    } @else if (mode() === 'inline') {
      <div
        class="inline-flex items-center gap-2 select-none font-sans"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <ng-container *ngTemplateOutlet="signatureMotion" />
        @if (resolvedText()) {
          <span class="text-[12px] font-medium" style="color: var(--color-text-secondary);">
            {{ resolvedText() }}
          </span>
        }
      </div>
    } @else {
      <div
        class="flex flex-col items-center justify-center gap-3 p-6 text-center font-sans select-none rounded-xl"
        [class.min-h-[180px]]="centered() && mode() === 'page'"
        [class.min-h-[120px]]="centered() && mode() === 'modal'"
        style="background-color: var(--color-background);"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <ng-container *ngTemplateOutlet="signatureMotion" />

        @if (resolvedText()) {
          <p class="text-[12px] leading-snug font-medium m-0" style="color: var(--color-text-secondary);">
            {{ resolvedText() }}
          </p>
        }

        @if (subtext()) {
          <p class="text-[12px] leading-relaxed m-0 max-w-xs" style="color: var(--color-text-muted);">
            {{ subtext() }}
          </p>
        }

        @if (url()) {
          <div
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[11.5px] tabular-nums mt-0.5 max-w-full border"
            style="background-color: var(--color-surface-soft); border-color: var(--color-border); color: var(--color-text-primary);"
          >
            <app-icon name="lock" size="sm" [stroke]="2" class="text-navy" />
            <span class="font-medium break-all select-all">{{ url() }}</span>
          </div>
        }
      </div>
    }
  `
})
export class LoaderComponent {
  private readonly lang = inject(LanguageService);

  private readonly uid = nextGradId++;
  protected readonly outerGradId = `isms-outer-grad-${this.uid}`;
  protected readonly innerGradId = `isms-inner-grad-${this.uid}`;

  readonly mode = input<LoaderMode>('page');
  readonly text = input<string>('');
  readonly messageKey = input<LoadingMessageKey | null>(null);
  readonly subtext = input<string>('');
  readonly url = input<string>('');
  readonly size = input<'sm' | 'md' | 'lg' | 'xl'>('md');
  readonly centered = input<boolean>(true);

  protected readonly svgSizePx = computed(() => {
    switch (this.mode()) {
      case 'fullscreen':
        return 76;
      case 'modal':
        return 28;
      case 'inline':
        return 16;
      case 'page':
      default:
        return 36;
    }
  });

  /** Simplified single-arc clarity for 16px inline indicators. */
  protected readonly isSimplified = computed(() => this.mode() === 'inline');

  protected readonly resolvedText = computed(() => {
    const key = this.messageKey();
    if (key) return this.lang.getLoadingMessage(key);
    if (this.text()) return this.text();
    if (this.mode() === 'fullscreen') return this.lang.getLoadingMessage('loadingApplication');
    if (this.mode() === 'page' || this.mode() === 'modal') return this.lang.getLoadingMessage('loadingPage');
    return this.lang.getLoadingMessage('loadingRecords');
  });
}
