// ui-guard-allow: page-frame - standalone Help & Support FAQ page without portal shell
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, IconComponent, InputDirective } from '../../shared';

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  isOpen: boolean;
}

export type FaqCategory =
  | 'All'
  | 'Login & Registration'
  | 'User Account'
  | 'Schemes & Applications'
  | 'Documents & Verification'
  | 'Technical Issues';

@Component({
  selector: 'app-help-support',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterModule, FormsModule, ButtonComponent, IconComponent, InputDirective],
  host: {
    class: 'block w-full min-h-screen bg-slate-50 font-sans text-slate-800'
  },
  template: `
    <div class="min-h-screen flex flex-col bg-slate-50 selection:bg-[#7C0E44] selection:text-white">
      
      <!-- ====================================================================
           1. TOP STANDALONE BRANDED HEADER BAR WITH HOME/BACK NAVIGATION
           ==================================================================== -->
      <header class="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
        <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">
          
          <!-- Left: Official Emblem & ISMS Branding -->
          <div class="flex items-center gap-3 sm:gap-4 min-w-0">
            <a routerLink="/" class="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer" title="Go to ISMS 2.0 Home">
              <img
                src="/Rajasthan-Sarkar.png"
                alt="Government of Rajasthan Emblem"
                class="h-9 sm:h-11 w-auto object-contain"
                loading="lazy"
              />
              <img
                src="/rsldc-logo.png"
                alt="RSLDC Logo"
                class="h-8 sm:h-10 w-auto object-contain hidden xs:block"
                loading="lazy"
              />
            </a>

            <div class="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div class="flex flex-col min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm sm:text-base font-extrabold text-[#7C0E44] tracking-tight">ISMS 2.0</span>
                <span class="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full text-[#7C0E44] border border-[#7C0E44]/30 shrink-0">
                  Help Center
                </span>
              </div>
              <span class="text-[11px] sm:text-xs text-slate-500 truncate">
                Frequently Asked Questions &amp; Support
              </span>
            </div>
          </div>

          <!-- Right: Clear Back / Home Navigation Button -->
          <div class="flex items-center gap-2 shrink-0">
            <button
              appButton
              variant="outline"
              size="sm"
              type="button"
              (click)="goBack()"
              aria-label="Back to Previous Page"
            >
              <app-icon name="chevron-left" [stroke]="2" size="sm" />
              <span class="hidden sm:inline">Back</span>
            </button>

            <button
              appButton
              variant="primary"
              size="sm"
              type="button"
              (click)="goHome()"
              aria-label="Go to ISMS 2.0 Home"
            >
              <span>Back to Home</span>
            </button>
          </div>

        </div>
      </header>

      <!-- ====================================================================
           2. HERO / SEARCH BANNER
           ==================================================================== -->
      <section
        class="relative text-white py-10 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
        style="background: linear-gradient(135deg, #4A0626 0%, #7C0E44 55%, #5E0832 100%);"
      >
        <!-- Subtle Rajasthan Fort Outline Silhouette in background -->
        <div
          class="absolute inset-0 bg-cover bg-no-repeat pointer-events-none opacity-20"
          style="background-image: url('/hero-bg.png'); background-position: right 20%;"
        ></div>

        <div class="relative z-10 max-w-4xl mx-auto text-center space-y-3 sm:space-y-4">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-semibold border border-white/20">
            <app-icon name="info-circle" size="sm" />
            <span>Official Portal Guide &amp; Knowledgebase</span>
          </div>

          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight m-0">
            Frequently Asked Questions (FAQs)
          </h1>

          <p class="text-xs sm:text-sm md:text-base text-rose-100 max-w-2xl mx-auto m-0 leading-relaxed">
            Find instant, verified answers on login, One-Time Registration (OTR), active schemes, EOI proposal submissions, documents, and technical support.
          </p>

          <!-- Search Input Box -->
          <div class="pt-2 sm:pt-4 max-w-2xl mx-auto">
            <div class="relative w-full">
              <app-icon
                name="search"
                size="sm"
                [stroke]="2"
                class="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                appInput
                type="text"
                [ngModel]="searchQuery()"
                (ngModelChange)="onSearchInput($event)"
                placeholder="Search FAQs by keywords (e.g. OTR, EOI, Biometric, PAN, Login)..."
                class="w-full pl-10 pr-9 py-2.5 sm:py-3 text-xs sm:text-sm bg-white text-slate-800 rounded-lg shadow-md border-0 focus:ring-2 focus:ring-amber-400 placeholder:text-slate-400"
                autocomplete="off"
              />
              @if (searchQuery()) {
                <button
                  appButton
                  variant="ghost"
                  size="xs"
                  iconOnly
                  type="button"
                  (click)="clearSearch()"
                  title="Clear search"
                  aria-label="Clear search"
                >
                  <app-icon name="close" size="sm" />
                </button>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- ====================================================================
           3. MAIN FAQ ACCORDION SECTION
           ==================================================================== -->
      <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        <!-- Category Filter Tabs & Expand/Collapse All Toolbar -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          
          <!-- Category Tabs -->
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            @for (cat of categories; track cat) {
              <button
                appButton
                size="sm"
                type="button"
                [variant]="selectedCategory() === cat ? 'primary' : 'outline'"
                (click)="selectCategory(cat)"
              >
                <span>{{ cat }}</span>
                <span class="ml-1 opacity-80 tabular-nums">
                  ({{ getCategoryCount(cat) }})
                </span>
              </button>
            }
          </div>

          <!-- Quick Action: Expand/Collapse All -->
          <div class="flex items-center gap-2 shrink-0 self-end md:self-auto">
            <button
              appButton
              variant="ghost"
              size="sm"
              type="button"
              (click)="expandAll()"
            >
              <span>Expand All</span>
            </button>
            <span class="text-slate-300">|</span>
            <button
              appButton
              variant="ghost"
              size="sm"
              type="button"
              (click)="collapseAll()"
            >
              <span>Collapse All</span>
            </button>
          </div>

        </div>

        <!-- Active Filter Indicator / Result Count -->
        <div class="flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong class="text-slate-800 font-bold tabular-nums">{{ filteredFaqs().length }}</strong> questions
            @if (selectedCategory() !== 'All') {
              in <strong class="text-slate-800 font-bold">{{ selectedCategory() }}</strong>
            }
            @if (searchQuery()) {
              matching "<strong class="text-slate-800 font-bold">{{ searchQuery() }}</strong>"
            }
          </span>
          @if (searchQuery() || selectedCategory() !== 'All') {
            <button
              appButton
              variant="ghost"
              size="xs"
              type="button"
              (click)="resetFilters()"
            >
              <span>Reset Filters</span>
            </button>
          }
        </div>

        <!-- Empty Results Message -->
        @if (filteredFaqs().length === 0) {
          <div class="text-center py-12 px-4 bg-white rounded-xl border border-slate-200 space-y-3">
            <div class="w-12 h-12 rounded-full bg-rose-50 text-[#7C0E44] flex items-center justify-center mx-auto">
              <app-icon name="search" size="md" />
            </div>
            <h3 class="text-base font-bold text-slate-800 m-0">No matching questions found</h3>
            <p class="text-xs sm:text-sm text-slate-500 max-w-md mx-auto m-0 leading-relaxed">
              We couldn't find any questions matching your query. Please try searching with different keywords or reset your filters.
            </p>
            <button
              appButton
              variant="primary"
              size="sm"
              type="button"
              (click)="resetFilters()"
            >
              <span>View All FAQs</span>
            </button>
          </div>
        }

        <!-- Expandable FAQ Accordion Cards -->
        <div class="space-y-3">
          @for (faq of filteredFaqs(); track faq.id) {
            <div
              class="border rounded-xl overflow-hidden bg-white shadow-2xs transition-all duration-200"
              [ngClass]="faq.isOpen ? 'border-[#7C0E44]/40 ring-1 ring-[#7C0E44]/15' : 'border-slate-200 hover:border-slate-300'"
            >
              <!-- Accordion Header Button -->
              <button
                appButton
                variant="ghost"
                block
                type="button"
                (click)="toggleFaq(faq.id)"
                class="justify-between text-left h-auto"
                [attr.aria-expanded]="faq.isOpen"
              >
                <div class="flex items-start sm:items-center gap-3 min-w-0 pr-2 py-1">
                  <span
                    class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md shrink-0 border mt-0.5 sm:mt-0"
                    [ngClass]="getBadgeClass(faq.category)"
                  >
                    {{ faq.category }}
                  </span>
                  <span
                    class="text-xs sm:text-[14.5px] font-bold leading-snug tracking-tight text-slate-800 break-words"
                    [class.text-[#7C0E44]]="faq.isOpen"
                  >
                    {{ faq.question }}
                  </span>
                </div>

                <app-icon
                  [name]="faq.isOpen ? 'chevron-up' : 'chevron-down'"
                  size="sm"
                  [stroke]="2"
                  class="shrink-0 transition-transform duration-200 ml-2"
                  [class.text-[#7C0E44]]="faq.isOpen"
                  [class.text-slate-400]="!faq.isOpen"
                />
              </button>

              <!-- Expandable Accordion Body -->
              @if (faq.isOpen) {
                <div class="px-4 pb-4 pt-1 sm:px-5 sm:pb-5 text-xs sm:text-[13.5px] text-slate-600 leading-relaxed border-t border-slate-100 whitespace-pre-line">
                  {{ faq.answer }}
                </div>
              }
            </div>
          }
        </div>

        <!-- ====================================================================
             4. NEED MORE HELP / OFFICIAL HELPLINE CARDS
             ==================================================================== -->
        <div class="mt-12 pt-8 border-t border-slate-200">
          <div class="bg-gradient-to-r from-rose-50/80 via-white to-amber-50/60 border border-rose-200/80 rounded-2xl p-5 sm:p-7 shadow-xs">
            
            <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div class="space-y-1.5 max-w-xl">
                <div class="flex items-center gap-2">
                  <app-icon name="phone" size="sm" class="text-[#7C0E44]" />
                  <span class="text-xs font-bold text-[#7C0E44] uppercase tracking-wider">Still have questions?</span>
                </div>
                <h3 class="text-base sm:text-lg font-bold text-slate-900 m-0">
                  RSLDC Nodal Support &amp; Technical Helpdesk
                </h3>
                <p class="text-xs sm:text-sm text-slate-600 m-0 leading-relaxed">
                  Our technical support team is available Monday to Friday (9:30 AM – 6:00 PM) to assist you with portal procedures, scheme proposals, and credentials. Email us at <span class="font-medium text-slate-800">support@isms.rajasthan.gov.in</span>.
                </p>
              </div>

              <div class="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  appButton
                  variant="primary"
                  size="sm"
                  href="tel:01412716091"
                  aria-label="Call RSLDC Helpline"
                >
                  <app-icon name="phone" size="sm" />
                  <span>Call 0141-2716091</span>
                </a>

                <a
                  appButton
                  variant="outline"
                  size="sm"
                  href="mailto:support@isms.rajasthan.gov.in"
                  aria-label="Email ISMS Support"
                >
                  <app-icon name="mail" size="sm" />
                  <span>support@isms.rajasthan.gov.in</span>
                </a>
              </div>

            </div>

          </div>
        </div>

      </main>

      <!-- ====================================================================
           5. CLEAN STANDALONE FOOTER BAR
           ==================================================================== -->
      <footer class="mt-auto border-t border-slate-200 bg-white py-4 px-4 sm:px-6 text-center text-xs text-slate-500">
        <div class="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; 2026 Government of Rajasthan. All rights reserved (ISMS 2.0).</span>
          <div class="flex items-center gap-4 text-slate-600">
            <button appButton variant="ghost" size="xs" type="button" (click)="goHome()">
              <span>Home</span>
            </button>
            <span>&bull;</span>
            <button appButton variant="ghost" size="xs" type="button" (click)="scrollToTop()">
              <span>Back to Top &uarr;</span>
            </button>
          </div>
        </div>
      </footer>

    </div>
  `
})
export class HelpSupportComponent {
  private router = inject(Router);

  readonly searchQuery = signal<string>('');
  readonly selectedCategory = signal<FaqCategory>('All');

  readonly categories: FaqCategory[] = [
    'All',
    'Login & Registration',
    'User Account',
    'Schemes & Applications',
    'Documents & Verification',
    'Technical Issues'
  ];

  readonly faqs = signal<FaqItem[]>([
    // Category 1: Login & Registration
    {
      id: 'faq-lr-1',
      category: 'Login & Registration',
      question: 'How do I log in to the ISMS 2.0 portal?',
      answer: 'All users access the ISMS 2.0 portal using their verified Rajasthan Single Sign-On (RajSSO) credentials at sso.rajasthan.gov.in. Department Administrators additionally complete a mandatory 6-digit OTP security verification upon signing in.',
      isOpen: true
    },
    {
      id: 'faq-lr-2',
      category: 'Login & Registration',
      question: 'What is One-Time Registration (OTR)?',
      answer: 'One-Time Registration (OTR) is the standardized statutory onboarding flow for Training Partners (TPs) and Project Implementation Agencies (PIAs) on ISMS 2.0. It captures verified organization credentials, authorized signatory details, banking information, and mandatory undertakings.',
      isOpen: false
    },
    {
      id: 'faq-lr-3',
      category: 'Login & Registration',
      question: 'Can I skip mandatory OTR sections and complete them later?',
      answer: 'No. To ensure compliance with RSLDC guidelines, ISMS 2.0 enforces strict sequential progression across the 4 registration steps: Organization Details (Step 1), Authorized Signatory (Step 2), Bank Details (Step 3), and Mandatory Undertakings (Step 4). You cannot advance to subsequent steps without completing all mandatory fields.',
      isOpen: false
    },
    {
      id: 'faq-lr-4',
      category: 'Login & Registration',
      question: 'What happens if I exit the registration wizard before submitting?',
      answer: 'Your entered data is preserved automatically as a registration draft in your active session. When you reopen the registration screen, the form restores your data and initializes at Step 1 with a clean validation state so you can review each section before final submission.',
      isOpen: false
    },

    // Category 2: User Account
    {
      id: 'faq-ua-1',
      category: 'User Account',
      question: 'What personas and user roles exist in ISMS 2.0?',
      answer: 'ISMS 2.0 supports dedicated role-based portals:\n• New User: Training partner applicants completing initial One-Time Registration (OTR).\n• Existing User (Training Partner): Approved organizations managing centers, batches, trainee attendance, and EOI proposals.\n• Aspirant: Candidates enrolling in skill programs, viewing course schedules, and tracking certifications.\n• Department Admin: RSLDC scrutiny officers evaluating proposals, sanction orders, IPAs, and batch approvals.\n• Super Admin: Portal administrators managing EOI configurations, dynamic forms, and masters.',
      isOpen: false
    },
    {
      id: 'faq-ua-2',
      category: 'User Account',
      question: 'How can I view or update my organization profile?',
      answer: 'You can navigate to the "Profile" page from the main portal navigation menu. The profile screen displays your approved organizational details, PAN, GSTIN, bank records, and center affiliations.',
      isOpen: false
    },
    {
      id: 'faq-ua-3',
      category: 'User Account',
      question: 'Why does the portal session time out?',
      answer: 'In compliance with Department of Information Technology & Communication (DoITC) cybersecurity standards, portal sessions automatically time out after periods of inactivity to protect sensitive financial and applicant records. Simply re-authenticate via Rajasthan SSO to continue.',
      isOpen: false
    },

    // Category 3: Schemes & Applications
    {
      id: 'faq-sa-1',
      category: 'Schemes & Applications',
      question: 'Where can I find open and active skill development schemes?',
      answer: 'Browse the "Active Schemes" page (/tenders). You can search by scheme name (e.g. Vishwakarma Yuva Udyami Protsahan Yojana, MMKVY, PMKVY 4.0, Rooftop Solar), reference number, or scheme category (Rajvik, Samarth, Saksham) with instant dynamic keystroke filtering.',
      isOpen: false
    },
    {
      id: 'faq-sa-2',
      category: 'Schemes & Applications',
      question: 'How do I submit an Expression of Interest (EOI) proposal?',
      answer: '1. Browse active schemes on the Active Schemes page (/tenders).\n2. Ensure your One-Time Registration (OTR) has been approved.\n3. Click the "View" button for your chosen scheme to inspect detailed guidelines, RFP documents, and EMD requirements.\n4. Click "Apply for EOI" to begin the proposal submission flow.\n5. Track proposal progress anytime on the EOI Status page (/tender-status).',
      isOpen: false
    },
    {
      id: 'faq-sa-3',
      category: 'Schemes & Applications',
      question: 'Can I resume an incomplete EOI proposal application?',
      answer: 'Yes. If you leave an EOI proposal before finishing all steps, an "Application Pending" alert appears prominently at the top of the Active Schemes page showing the scheme name, reference number, and exact step number. Click "Continue Application" to resume immediately where you left off.',
      isOpen: false
    },
    {
      id: 'faq-sa-4',
      category: 'Schemes & Applications',
      question: 'How do I track the status of my submitted proposal?',
      answer: 'Navigate to "EOI Status" (/tender-status) from the sidebar. You can monitor the real-time stage of your proposal across scrutiny desk verification, committee evaluation, In-Principle Approval (IPA), and Sanction Order issuance.',
      isOpen: false
    },
    {
      id: 'faq-sa-5',
      category: 'Schemes & Applications',
      question: 'What are the biometric attendance device rules for skill training centers?',
      answer: 'Approved Training Partners must deploy Aadhaar-enabled Biometric Attendance System (AEBAS) devices at each accredited Skill Development Center (SDC). Trainee and trainer daily attendance must be captured via registered biometric devices and synced directly with ISMS 2.0 to qualify for batch milestone payments.',
      isOpen: false
    },

    // Category 4: Documents & Verification
    {
      id: 'faq-dv-1',
      category: 'Documents & Verification',
      question: 'What documents are required for OTR onboarding and EOI applications?',
      answer: 'Key statutory documents include:\n• Organization PAN Card (self-attested copy)\n• GST Registration Certificate\n• Certificate of Incorporation, Society, or Trust Registration\n• Authorized Person Board Resolution / Authorization Letter\n• Bank Account Details with Cancelled Cheque (IFSC verified)\n• CA-certified Audited Financial Statements and Turnover Certificates for the last 3 financial years\n• Notarized Affidavit for not being blacklisted by any Govt. / PSU entity.',
      isOpen: false
    },
    {
      id: 'faq-dv-2',
      category: 'Documents & Verification',
      question: 'What are the accepted file formats and upload size limits?',
      answer: 'The portal accepts PDF, TXT, JPEG, JPG, PNG, DOC, DOCX, XLS, and XLSX file formats. Individual attachments must not exceed the maximum upload limit of 25 MB.',
      isOpen: false
    },
    {
      id: 'faq-dv-3',
      category: 'Documents & Verification',
      question: 'How does departmental document scrutiny work?',
      answer: 'Submitted registration dossiers and EOI proposals are routed directly to the Department Scrutiny Desk. Designated scrutiny officers verify uploaded attachments against statutory criteria and RTPP guidelines before passing proposals to the evaluation committee.',
      isOpen: false
    },

    // Category 5: Technical Issues
    {
      id: 'faq-ti-1',
      category: 'Technical Issues',
      question: 'What should I do if the portal displays "No Internet Connection"?',
      answer: 'ISMS 2.0 features global internet connectivity detection across all routes. If internet access is lost, a modal popup appears automatically to prevent data loss. Once your connection is restored, the popup automatically dismisses and you can continue your work.',
      isOpen: false
    },
    {
      id: 'faq-ti-2',
      category: 'Technical Issues',
      question: 'Why is my file upload failing?',
      answer: 'Please check that:\n1. Your file format is supported: PDF, DOC, DOCX, XLS, XLSX, JPG, or PNG.\n2. Your file size does not exceed the 25 MB limit.\n3. The file name contains only letters, numbers, hyphens, and underscores without illegal special characters.\n4. Your internet connection is active.',
      isOpen: false
    },
    {
      id: 'faq-ti-3',
      category: 'Technical Issues',
      question: 'Who should I contact for technical portal assistance or grievances?',
      answer: 'Official RSLDC Helpline and Support Channels:\n• Toll-Free / Nodal: 0141-2716091\n• General Helpdesk: 0141-2792600 (Mon–Fri, 9:30 AM – 6:00 PM)\n• Support Email: support@isms.rajasthan.gov.in / isms-support@rajasthan.gov.in\n• Headquarters: EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004, Rajasthan\n• Grievance Redressal: Submit an official grievance ticket with attachments via the Grievance module (/grievance).',
      isOpen: false
    }
  ]);

  readonly filteredFaqs = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const cat = this.selectedCategory();
    let list = this.faqs();

    if (cat !== 'All') {
      list = list.filter(f => f.category === cat);
    }

    if (q) {
      list = list.filter(
        f =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    return list;
  });

  getCategoryCount(cat: FaqCategory): number {
    if (cat === 'All') return this.faqs().length;
    return this.faqs().filter(f => f.category === cat).length;
  }

  getBadgeClass(cat: string): string {
    switch (cat) {
      case 'Login & Registration':
        return 'text-blue-700 border-blue-200';
      case 'User Account':
        return 'text-purple-700 border-purple-200';
      case 'Schemes & Applications':
        return 'text-amber-700 border-amber-200';
      case 'Documents & Verification':
        return 'text-emerald-700 border-emerald-200';
      case 'Technical Issues':
        return 'text-rose-700 border-rose-200';
      default:
        return 'text-slate-700 border-slate-200';
    }
  }

  onSearchInput(value: string): void {
    this.searchQuery.set(value);
  }

  clearSearch(): void {
    this.searchQuery.set('');
  }

  selectCategory(cat: FaqCategory): void {
    this.selectedCategory.set(cat);
  }

  resetFilters(): void {
    this.searchQuery.set('');
    this.selectedCategory.set('All');
  }

  toggleFaq(id: string): void {
    this.faqs.update(list =>
      list.map(f => (f.id === id ? { ...f, isOpen: !f.isOpen } : f))
    );
  }

  expandAll(): void {
    this.faqs.update(list => list.map(f => ({ ...f, isOpen: true })));
  }

  collapseAll(): void {
    this.faqs.update(list => list.map(f => ({ ...f, isOpen: false })));
  }

  goBack(): void {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/']);
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }

  scrollToTop(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}
