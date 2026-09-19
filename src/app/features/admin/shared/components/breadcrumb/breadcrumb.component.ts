import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface BreadcrumbItem {
  label: string;
  url?: string;
  active?: boolean;
}

@Component({
  selector: 'admin-breadcrumb',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="flex items-center text-xs text-slate-500 mb-2.5" aria-label="Breadcrumb">
      <ol class="inline-flex items-center space-x-1 md:space-x-2">
        <li class="inline-flex items-center">
          <a routerLink="/admin" class="inline-flex items-center text-slate-500 hover:text-blue-700 transition-colors">
            <span class="material-symbols-outlined text-[16px] mr-1 text-slate-400">home</span>
            Admin
          </a>
        </li>
        <li *ngFor="let item of items; let last = last">
          <div class="flex items-center">
            <span class="material-symbols-outlined text-[14px] text-slate-400 mx-1">chevron_right</span>
            <a *ngIf="!last && item.url" [routerLink]="item.url" class="text-slate-500 hover:text-blue-700 transition-colors font-medium">
              {{ item.label }}
            </a>
            <span *ngIf="last || !item.url" class="text-slate-800 font-semibold truncate max-w-[280px]">
              {{ item.label }}
            </span>
          </div>
        </li>
      </ol>
    </nav>
  `
})
export class BreadcrumbComponent {
  @Input() items: BreadcrumbItem[] = [];
}
