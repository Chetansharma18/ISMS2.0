import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BreadcrumbComponent, BreadcrumbItem } from '../breadcrumb/breadcrumb.component';

@Component({
  selector: 'admin-page-header',
  standalone: true,
  imports: [CommonModule, RouterModule, BreadcrumbComponent],
  template: `
    <div class="mb-6 pb-4 border-b border-slate-200">
      <admin-breadcrumb *ngIf="breadcrumbs?.length" [items]="breadcrumbs"></admin-breadcrumb>
      
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div class="flex items-start gap-3.5">
          <div *ngIf="icon" class="w-10 h-10 rounded-xs bg-[#002244]/5 border border-[#002244]/15 flex items-center justify-center text-[#002244] shadow-2xs shrink-0 mt-0.5">
            <span class="material-symbols-outlined text-[24px]">{{ icon }}</span>
          </div>
          <div>
            <div class="flex items-center gap-2.5 flex-wrap">
              <h1 class="text-xl sm:text-2xl font-black tracking-tight text-[#002244]">{{ title }}</h1>
              <ng-content select="[header-badge]"></ng-content>
            </div>
            <p *ngIf="subtitle" class="text-xs sm:text-[13px] text-slate-600 mt-1 leading-relaxed">{{ subtitle }}</p>
          </div>
        </div>

        <!-- Action Buttons Slot -->
        <div class="flex items-center gap-2.5 flex-wrap">
          <ng-content select="[header-actions]"></ng-content>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() icon?: string;
  @Input() breadcrumbs: BreadcrumbItem[] = [];
}
