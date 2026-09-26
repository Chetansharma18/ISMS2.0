import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="w-full bg-white not-last:pb-3 not-last:mb-3 not-last:border-b border-slate-200/60">
      @if (title) {
        <div class="font-bold pb-1.5 mb-2.5 border-b border-slate-200/80 flex items-center gap-2" style="font-size: 13.5px !important; color: #0B3558 !important;">
          <span class="w-1.5 h-3.5 bg-[#0B3558] rounded-xs inline-block"></span>
          <span>{{ title }}</span>
        </div>
      }
      <div>
        <ng-content></ng-content>
      </div>
    </section>
  `
})
export class FormSectionComponent {
  @Input() badgeNumber?: string | number;
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() collapsible: boolean = true;
  @Input() set initiallyExpanded(val: boolean) {
    this.isExpanded.set(val);
  }

  @Output() expandedChange = new EventEmitter<boolean>();

  isExpanded = signal<boolean>(true);

  toggleCollapse(): void {
    if (this.collapsible) {
      this.isExpanded.update(v => !v);
      this.expandedChange.emit(this.isExpanded());
    }
  }
}
