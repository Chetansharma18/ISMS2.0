import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4 antialiased font-sans">
      <div class="w-full max-w-md bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class AuthLayoutComponent {}
