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
  selector: 'app-privacy-policy',
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
        title="Privacy Policy"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Privacy Policy' }]"
      >
        <a appButton variant="outline" size="sm" routerLink="/">
          <app-icon name="arrow-right" class="rotate-180" />
          <span>Back to Home</span>
        </a>
      </app-page-header>

      <app-section-card
        title="Official Privacy Policy & Data Governance"
        subtitle="Integrated Scheme Management System (ISMS 2.0) • Government of Rajasthan"
      >
        <div class="space-y-6 text-slate-700 text-sm leading-relaxed">
          <!-- Section 1 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="shield-check" size="sm" />
              <span>1. Introduction & Statutory Scope</span>
            </h4>
            <p>
              The Integrated Scheme Management System (ISMS 2.0) is the official portal of the Rajasthan Skill and Livelihoods Development Corporation (RSLDC), Department of Skills, Employment and Entrepreneurship, Government of Rajasthan. This Privacy Policy outlines the standards and procedures for the collection, verification, storage, and processing of personal, organizational, and transactional data in compliance with Government of Rajasthan IT policies and the Rajasthan Transparency in Public Procurement (RTPP) Act.
            </p>
          </div>

          <!-- Section 2 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="document" size="sm" />
              <span>2. Information Collection and Identity Verification</span>
            </h4>
            <p class="mb-2">ISMS 2.0 collects and processes information necessary to facilitate public skill development schemes:</p>
            <ul class="list-disc list-inside space-y-1.5 ml-2 text-slate-600">
              <li><strong>Single Sign-On (SSO):</strong> Authentication details authenticated through the Rajasthan SSO (RajSSO) gateway.</li>
              <li><strong>Training Partners & PIAs:</strong> Organization registration, PAN, GSTIN, authorized signatory credentials, empanelment records, and bank accounts for DBT transfers.</li>
              <li><strong>Aspirants & Candidates:</strong> Name, educational qualification, category, contact information, and masked Aadhaar numbers strictly following UIDAI regulations.</li>
              <li><strong>Biometric Attendance Data:</strong> Attendance timestamps recorded through DoITC-approved biometric devices.</li>
            </ul>
          </div>

          <!-- Section 3 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="lock" size="sm" />
              <span>3. Information Security & Encryption</span>
            </h4>
            <p>
              All communications with ISMS 2.0 are secured with 256-bit SSL encryption. Role-Based Access Control (RBAC) ensures data access is strictly limited to authorized department officers, training partners, and scrutiny desks. No sensitive personal information or financial records are stored unencrypted.
            </p>
          </div>

          <!-- Section 4 -->
          <div>
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="building" size="sm" />
              <span>4. Disclosure and Third-Party Sharing</span>
            </h4>
            <p>
              RSLDC does not sell, rent, or trade any personal or enterprise data. Information is shared solely with certified Assessment Agencies, Sector Skill Councils, DoITC, and Cyber Treasury for official verification, evaluation, and statutory auditing purposes.
            </p>
          </div>

          <!-- Section 5 -->
          <div class="border-t border-slate-200 pt-4">
            <h4 class="text-base font-bold text-[#7C0E44] mb-2 flex items-center gap-2">
              <app-icon name="mail" size="sm" />
              <span>5. Nodal Officer & Privacy Inquiries</span>
            </h4>
            <p class="mb-2">For inquiries or concerns regarding data protection and portal privacy standards, please contact:</p>
            <div class="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs sm:text-sm text-slate-800 space-y-1">
              <div class="font-bold text-[#7C0E44]">RSLDC IT & MIS Division</div>
              <div>EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004, Rajasthan</div>
              <div>Email: <a href="mailto:support@isms.rajasthan.gov.in" class="text-primary underline">support@isms.rajasthan.gov.in</a> | Helpline: 0141-2716091</div>
            </div>
          </div>
        </div>
      </app-section-card>
    </app-page-shell>
  `
})
export class PrivacyPolicyComponent {}
