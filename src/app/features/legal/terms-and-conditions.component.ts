import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import {
  PageShellComponent,
  PageHeaderComponent,
  SectionCardComponent,
  ButtonComponent,
  IconComponent
} from '../../shared';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    PageShellComponent,
    PageHeaderComponent,
    SectionCardComponent,
    ButtonComponent,
    IconComponent
  ],
  host: {
    class: 'block w-full min-h-full'
  },
  template: `
    <app-page-shell>
      <app-page-header
        title="Terms and Conditions"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Terms & Conditions' }]"
      >
        <a appButton variant="outline" size="sm" routerLink="/">
          <app-icon name="arrow-right" class="rotate-180" />
          <span>Back to Home</span>
        </a>
      </app-page-header>

      <app-section-card
        title="Terms of Service & Portal Regulations"
        subtitle="Integrated Scheme Management System (ISMS 2.0) • Government of Rajasthan"
      >
        <div class="space-y-6 text-slate-700 text-sm leading-relaxed">
          <!-- Section 1 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="document" size="sm" />
              <span>1. Acceptance of Terms</span>
            </h4>
            <p>
              By accessing, browsing, registering, or conducting operations on the Integrated Scheme Management System (ISMS 2.0), all users—including Training Providers (TPs), Project Implementing Agencies (PIAs), Skill Development Centers (SDCs), candidates, and departmental officers—agree to be bound by these statutory terms, Corporation guidelines, and the Rajasthan Transparency in Public Procurement (RTPP) Act, 2012.
            </p>
          </div>

          <!-- Section 2 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="identification" size="sm" />
              <span>2. One-Time Registration (OTR) & Authentication</span>
            </h4>
            <p class="mb-2">Users must maintain authentic, verified registration credentials:</p>
            <ul class="list-disc list-inside space-y-1.5 ml-2 text-slate-600">
              <li>All applicants must register with a valid Rajasthan Single Sign-On (RajSSO) ID.</li>
              <li>Organizations must upload genuine documentation including PAN, GSTIN, Society/Trust registration, and authorized representative declarations.</li>
              <li>Submission of fraudulent, altered, or fabricated documents will attract immediate disqualification and debarment.</li>
            </ul>
          </div>

          <!-- Section 3 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="clipboard-check" size="sm" />
              <span>3. Expression of Interest (EOI) & Scheme Execution</span>
            </h4>
            <p>
              Proposals submitted in response to published EOIs are binding. Approved Training Partners must strictly adhere to the batch initiation deadlines specified in the In-Principle Approval (IPA), sanction order conditions, and signed Memoranda of Understanding (MoUs). Failure to initiate batches within 15 days of IPA issuance without prior approval may lead to quota revocation.
            </p>
          </div>

          <!-- Section 4 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="bank" size="sm" />
              <span>4. Online Payments & Cyber Treasury</span>
            </h4>
            <p>
              Processing fees, earnest money deposits (EMD), and proposal fees must be paid through the official Cyber Treasury / payment gateway integration. Transactions are reconciled against Treasury reference numbers. Fees once paid are non-refundable unless expressly stated in the respective scheme guidelines.
            </p>
          </div>

          <!-- Section 5 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="camera" size="sm" />
              <span>5. Biometric Attendance & Training Center Compliance</span>
            </h4>
            <p>
              Candidate and faculty attendance must be recorded using DoITC-integrated biometric devices. Training centers must maintain mandatory infrastructure, CCTV live streaming, and certified trainers per NSQF norms. Unauthorized offline marking or falsified attendance will result in immediate penalty.
            </p>
          </div>

          <!-- Section 6 -->
          <div class="border-t border-slate-200 pt-4">
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="alert-triangle" size="sm" />
              <span>6. Violations, Blacklisting & Jurisdiction</span>
            </h4>
            <p class="mb-2">
              Non-compliance with RSLDC guidelines or breach of ethical standards shall trigger debarment proceedings under RTPP Section 46. All disputes arising from transactions on this portal shall be subject to the exclusive jurisdiction of the competent courts in Jaipur, Rajasthan.
            </p>
          </div>
        </div>
      </app-section-card>
    </app-page-shell>
  `
})
export class TermsAndConditionsComponent {}
