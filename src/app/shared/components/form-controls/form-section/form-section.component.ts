import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-section',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="w-full bg-white pb-4 mb-4 border-b border-slate-200/70 last:border-b-0">
      <h2 class="text-sm sm:text-base font-bold text-slate-900 mb-3 pb-2 border-b border-slate-100">
        {{ title }}
      </h2>
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
