import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LoaderBar {
  index: number;
  angle: number;
  delay: string;
}

@Component({
  selector: 'app-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="flex flex-col items-center justify-center gap-3.5 p-4 text-center font-sans select-none"
      [class.min-h-[160px]]="centered"
    >
      <!-- 12-Bar Radial Spinner (From Uiverse.io by david-mohseni) -->
      <div
        class="loader-spinner relative shrink-0"
        [style.width.px]="spinnerDimensions"
        [style.height.px]="spinnerDimensions"
        role="status"
        aria-label="Loading..."
      >
        @for (bar of bars; track bar.index) {
          <div
            class="loader-bar"
            [style.transform]="'rotate(' + bar.angle + 'deg) translate(0, -130%)'"
            [style.animationDelay]="bar.delay"
            [style.backgroundColor]="color"
          ></div>
        }
      </div>

      <!-- Primary Text -->
      @if (text) {
        <p [class]="'text-[14px] leading-snug font-semibold m-0 ' + textClass">
          {{ text }}
        </p>
      }

      <!-- Optional Subtext -->
      @if (subtext) {
        <p class="text-[12.5px] leading-relaxed text-slate-500 m-0 max-w-xs">
          {{ subtext }}
        </p>
      }

      <!-- Complete URL Name Pill (e.g. for SSO redirects) -->
      @if (url) {
        <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-50 border border-slate-200 text-[11.5px] font-mono text-slate-700 shadow-2xs mt-0.5 max-w-full">
          <svg class="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span class="font-medium text-slate-800 break-all select-all">{{ url }}</span>
        </div>
      }
    </div>
  `,
  styles: [`
    .loader-spinner {
      border-radius: 10px;
    }

    .loader-bar {
      width: 8%;
      height: 24%;
      position: absolute;
      left: 50%;
      top: 30%;
      margin-left: -4%;
      opacity: 0.2;
      border-radius: 50px;
      box-shadow: 0 0 3px rgba(0, 0, 0, 0.15);
      animation: fade458 1.2s linear infinite;
    }

    @keyframes fade458 {
      0% {
        opacity: 1;
      }
      100% {
        opacity: 0.2;
      }
    }
  `]
})
export class LoaderComponent {
  @Input() text: string = '';
  @Input() textClass: string = 'text-[#0B3558]';
  @Input() subtext: string = '';
  @Input() url: string = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' = 'md';
  @Input() color: string = '#0B3558';
  @Input() centered: boolean = true;

  readonly bars: LoaderBar[] = [
    { index: 1, angle: 0, delay: '0s' },
    { index: 2, angle: 30, delay: '-1.1s' },
    { index: 3, angle: 60, delay: '-1.0s' },
    { index: 4, angle: 90, delay: '-0.9s' },
    { index: 5, angle: 120, delay: '-0.8s' },
    { index: 6, angle: 150, delay: '-0.7s' },
    { index: 7, angle: 180, delay: '-0.6s' },
    { index: 8, angle: 210, delay: '-0.5s' },
    { index: 9, angle: 240, delay: '-0.4s' },
    { index: 10, angle: 270, delay: '-0.3s' },
    { index: 11, angle: 300, delay: '-0.2s' },
    { index: 12, angle: 330, delay: '-0.1s' }
  ];

  get spinnerDimensions(): number {
    switch (this.size) {
      case 'sm':
        return 34;
      case 'lg':
        return 64;
      case 'xl':
        return 74;
      case 'md':
      default:
        return 54;
    }
  }
}
