import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgIf, AsyncPipe } from '@angular/common';
import { EoiStateService, EoiApplication, UserProfile } from '../../../core/services/eoi-state.service';
import { GradeBadgeComponent } from '../../../shared/components/grade-badge/grade-badge.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-outcome-approved',
  standalone: true,
  imports: [RouterLink, NgIf, AsyncPipe, GradeBadgeComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-paper-50 font-sans">
      <main class="flex-grow max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex flex-col items-center">
        
        <!-- Certificate Document Card (max 640px) -->
        <div class="doc-card doc-spine w-full bg-surface-0 border border-line-200 p-8 sm:p-10 relative">
          
          <!-- Top Border Stamp -->
          <div class="text-center pb-6 border-b border-line-200">
            <!-- Large Solid Circular TP Grade Seal Badge -->
            <div class="mx-auto flex justify-center mb-4 animate-seal-stamp">
              <app-grade-badge grade="A" size="lg"></app-grade-badge>
            </div>

            <div class="text-[11px] font-mono text-muted-500 uppercase tracking-widest">Government Empanelment Order & Accreditation</div>
            <h1 class="text-2xl sm:text-3xl font-serif font-bold text-ink-900 mt-1">Official Technical Partner Empanelment</h1>
            <div class="inline-block mt-2 px-3 py-1 bg-approve-100 text-approve-700 border border-[#BBDAC9] text-xs font-bold uppercase tracking-wider">
              Status: Sanctioned & Approved (Grade A)
            </div>
          </div>

          <!-- Formal Public Sector Statement -->
          <div class="my-6 text-center text-xs text-ink-900 leading-relaxed max-w-lg mx-auto" *ngIf="userProfile$ | async as profile">
            <p>
              This is to certify that <strong>{{ profile.organization.name }}</strong> has successfully cleared administrative, technical, and infrastructure scrutiny under Scheme Reference <strong>SCHEME-RRD-2026</strong>.
            </p>
            <p class="mt-2 text-ink-700">
              The entity is hereby appointed as an authorized <strong>Technical Partner (TP)</strong> with official <strong>Grade A Accreditation</strong> for technical audits and quality scrutiny.
            </p>
          </div>

          <!-- Certificate Metadata Grid -->
          <div class="border border-line-200 mb-8 text-xs" *ngIf="application$ | async as app">
            <table class="w-full text-left divide-y divide-line-200">
              <tbody class="divide-y divide-line-200">
                <tr>
                  <td class="px-4 py-2.5 text-muted-500 w-1/3">Official TP Registration ID:</td>
                  <td class="px-4 py-2.5 font-mono font-bold text-seal-600">TP-IND-2026-042</td>
                </tr>
                <tr>
                  <td class="px-4 py-2.5 text-muted-500">Scheme Gazette Order:</td>
                  <td class="px-4 py-2.5 font-bold text-ink-900">{{ app.schemeName }}</td>
                </tr>
                <tr>
                  <td class="px-4 py-2.5 text-muted-500">Sanctioned Annual Target:</td>
                  <td class="px-4 py-2.5 font-mono font-medium text-ink-900 tabular-nums">450 Inspection Units / Batches</td>
                </tr>
                <tr>
                  <td class="px-4 py-2.5 text-muted-500">Accredited Grade & Rating:</td>
                  <td class="px-4 py-2.5 font-bold text-approve-700">Grade A (Composite Score: 92/100)</td>
                </tr>
                <tr>
                  <td class="px-4 py-2.5 text-muted-500">Validity Period:</td>
                  <td class="px-4 py-2.5 text-ink-900">08 Sep 2026 — 31 Mar 2029 (3 Years)</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Action Buttons -->
          <div class="pt-6 border-t border-line-200 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
            <button (click)="downloadCertificate()" class="px-4 py-2 border border-line-200 bg-paper-50 hover:bg-surface-0 font-semibold text-ink-900 transition-colors inline-flex items-center gap-1.5 w-full sm:w-auto justify-center">
              <span>⬇ Download Sanction Order (PDF)</span>
            </button>

            <a routerLink="/eoi/dashboard" class="px-6 py-2.5 bg-seal-600 text-surface-0 font-semibold hover:bg-[#9B4523] transition-colors flex items-center justify-center gap-2 w-full sm:w-auto">
              <span>Go to TP Dashboard</span>
              <span aria-hidden="true">→</span>
            </a>
          </div>

        </div>

      </main>

    </div>
  `
})
export class OutcomeApprovedComponent implements OnInit {
  application$!: Observable<EoiApplication>;
  userProfile$!: Observable<UserProfile>;

  constructor(
    private eoiService: EoiStateService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.application$ = this.eoiService.currentDraft$;
    this.userProfile$ = this.eoiService.userProfile$;
    this.eoiService.setTpStatus(true, 'A');
  }

  downloadCertificate(): void {
    alert('Downloading official TP Empanelment Sanction Certificate (TP-IND-2026-042.pdf)...');
  }
}
