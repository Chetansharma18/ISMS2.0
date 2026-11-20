import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  PageShellComponent,
  PageHeaderComponent,
  SectionCardComponent,
  ButtonComponent,
  IconComponent,
  InputDirective
} from '../../shared';
import { UserManualPdfService } from '../../core/services/user-manual-pdf.service';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
}

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  isOpen?: boolean;
}

@Component({
  selector: 'app-help-support',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PageShellComponent,
    PageHeaderComponent,
    SectionCardComponent,
    ButtonComponent,
    IconComponent,
    InputDirective
  ],
  host: {
    class: 'block w-full min-h-full'
  },
  template: `
    <app-page-shell>
      <app-page-header
        title="Help & Support"
        [breadcrumbs]="[{ label: 'Home', url: '/' }, { label: 'Help & Support' }]"
      >
        <button
          appButton
          variant="outline"
          size="sm"
          type="button"
          (click)="downloadManual()"
          [disabled]="isDownloadingManual()"
        >
          <app-icon name="document-download" size="sm" />
          <span>{{ isDownloadingManual() ? 'Generating Manual...' : 'Download User Manual (PDF)' }}</span>
        </button>
      </app-page-header>

      <!-- 1. OFFICIAL HELPLINE & NODAL SUPPORT CONTACTS -->
      <app-section-card
        title="Official Helpline & Support Channels"
        subtitle="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
      >
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <!-- Contact 1: Helpline -->
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-9 h-9 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center">
                <app-icon name="phone" size="sm" />
              </div>
              <h4 class="text-sm font-bold text-slate-800 m-0">Helpline Numbers</h4>
              <p class="text-xs text-slate-600 m-0 leading-relaxed">
                Toll Free / Nodal: <strong class="text-slate-900 tabular-nums">0141-2716091</strong><br />
                General Helpdesk: <strong class="text-slate-900 tabular-nums">0141-2792600</strong>
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
              Working days: Monday to Friday (9:30 AM – 6:00 PM)
            </div>
          </div>

          <!-- Contact 2: Email -->
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-9 h-9 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <app-icon name="mail" size="sm" />
              </div>
              <h4 class="text-sm font-bold text-slate-800 m-0">Official Email Support</h4>
              <p class="text-xs text-slate-600 m-0 leading-relaxed">
                Technical queries & portal grievances:<br />
                <a href="mailto:support@isms.rajasthan.gov.in" class="text-primary font-medium hover:underline">support&#64;isms.rajasthan.gov.in</a><br />
                <a href="mailto:isms-support@rajasthan.gov.in" class="text-primary font-medium hover:underline">isms-support&#64;rajasthan.gov.in</a>
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
              Average response time: Within 24 business hours
            </div>
          </div>

          <!-- Contact 3: Headquarters Address -->
          <div class="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col justify-between">
            <div class="space-y-2">
              <div class="w-9 h-9 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
                <app-icon name="building" size="sm" />
              </div>
              <h4 class="text-sm font-bold text-slate-800 m-0">RSLDC Headquarters</h4>
              <p class="text-xs text-slate-600 m-0 leading-relaxed">
                EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004, Rajasthan, India
              </p>
            </div>
            <div class="mt-4 pt-3 border-t border-slate-200 text-[11px] text-slate-500">
              Department of Skill, Employment and Entrepreneurship
            </div>
          </div>
        </div>
      </app-section-card>

      <!-- 2. INTERACTIVE PORTAL ASSISTANT (CHATBOT) -->
      <app-section-card
        title="ISMS 2.0 Support Assistant"
        subtitle="Interactive portal guide for instant answers on OTR, EOI, attendance, payments & grievances"
      >
        <div actions>
          <button appButton variant="ghost" size="sm" type="button" (click)="clearChat()">
            <app-icon name="close" size="sm" />
            <span>Clear Chat</span>
          </button>
        </div>

        <div class="flex flex-col h-[420px] bg-slate-50/70 border border-slate-200 rounded-lg overflow-hidden">
          <!-- Suggested Quick Prompts -->
          <div class="p-3 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto text-xs shrink-0">
            <span class="text-slate-400 font-semibold text-[11px] uppercase whitespace-nowrap shrink-0">Quick Questions:</span>
            @for (prompt of quickPrompts; track prompt) {
              <button
                appButton
                variant="secondary"
                size="sm"
                type="button"
                (click)="askQuestion(prompt)"
                class="whitespace-nowrap shrink-0"
              >
                <span>{{ prompt }}</span>
              </button>
            }
          </div>

          <!-- Messages Stream -->
          <div #chatContainer class="flex-1 overflow-y-auto p-4 space-y-3.5">
            @for (msg of messages(); track msg.id) {
              @if (msg.sender === 'assistant') {
                <div class="flex items-start gap-2.5 max-w-[85%] sm:max-w-[75%]">
                  <div class="w-7 h-7 rounded-full bg-[#0D3557] text-white flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <app-icon name="chat-bubble" size="sm" />
                  </div>
                  <div class="bg-white border border-slate-200/90 rounded-2xl rounded-tl-xs px-3.5 py-2.5 shadow-2xs text-xs sm:text-[13px] text-slate-800 leading-relaxed whitespace-pre-line">
                    {{ msg.text }}
                    <div class="text-[10px] text-slate-400 mt-1 text-right tabular-nums">{{ msg.time }}</div>
                  </div>
                </div>
              } @else {
                <div class="flex items-start justify-end gap-2.5 max-w-[85%] sm:max-w-[75%] ml-auto">
                  <div class="bg-[#0D3557] text-white rounded-2xl rounded-tr-xs px-3.5 py-2.5 shadow-2xs text-xs sm:text-[13px] leading-relaxed whitespace-pre-line">
                    {{ msg.text }}
                    <div class="text-[10px] text-blue-200 mt-1 text-right tabular-nums">{{ msg.time }}</div>
                  </div>
                  <div class="w-7 h-7 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                    <app-icon name="user" size="sm" />
                  </div>
                </div>
              }
            }
          </div>

          <!-- Input Bar -->
          <form class="p-3 bg-white border-t border-slate-200 flex items-center gap-2 shrink-0" (ngSubmit)="sendUserMessage()">
            <input
              appInput
              type="text"
              name="chatQuery"
              [(ngModel)]="userInput"
              placeholder="Type your question (e.g., How to apply for EOI? What is OTR? How to link biometric device?)..."
              class="flex-1 text-xs sm:text-sm"
              autocomplete="off"
            />
            <button
              appButton
              variant="primary"
              size="md"
              type="submit"
              [disabled]="!userInput.trim()"
            >
              <span>Send</span>
              <app-icon name="forward" size="sm" />
            </button>
          </form>
        </div>
      </app-section-card>

      <!-- 3. FREQUENTLY ASKED QUESTIONS (FAQS) -->
      <app-section-card
        title="Frequently Asked Questions (FAQs)"
        subtitle="Quick reference for common queries regarding portal procedures and scheme guidelines"
      >
        <div class="space-y-3">
          @for (faq of faqs(); track faq.id) {
            <div class="border border-slate-200 rounded-lg overflow-hidden bg-white transition-colors">
              <button
                appButton
                variant="ghost"
                block
                type="button"
                (click)="toggleFaq(faq.id)"
                class="justify-between text-left"
              >
                <div class="flex items-center gap-2.5 min-w-0">
                  <span class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 shrink-0">
                    {{ faq.category }}
                  </span>
                  <span class="text-xs sm:text-sm font-semibold text-slate-800 truncate">
                    {{ faq.question }}
                  </span>
                </div>
                <app-icon
                  [name]="faq.isOpen ? 'chevron-up' : 'chevron-down'"
                  size="sm"
                  class="text-slate-400 shrink-0"
                />
              </button>

              @if (faq.isOpen) {
                <div class="px-4 pb-3.5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                  {{ faq.answer }}
                </div>
              }
            </div>
          }
        </div>
      </app-section-card>
    </app-page-shell>
  `
})
export class HelpSupportComponent {
  private userManualService = inject(UserManualPdfService);

  readonly isDownloadingManual = signal(false);
  userInput = '';

  readonly quickPrompts = [
    'How do I complete OTR?',
    'How to submit an EOI bid?',
    'Biometric attendance device rules',
    'Payment reconciliation with Cyber Treasury',
    'Where to track my EOI status?'
  ];

  readonly messages = signal<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: 'Welcome to the ISMS 2.0 Support Assistant. How may I assist you today? You can choose one of the quick questions above or type your question below.',
      time: this.currentTime()
    }
  ]);

  readonly faqs = signal<FaqItem[]>([
    {
      id: 'faq-1',
      category: 'OTR',
      question: 'What documents are required for One-Time Registration (OTR)?',
      answer: 'Organizations need their valid Rajasthan SSO ID, PAN Card, GSTIN certificate, Society/Trust/Company Incorporation Certificate, Authorized Signatory Letter, and official bank account details.',
      isOpen: true
    },
    {
      id: 'faq-2',
      category: 'Payments',
      question: 'What should I do if Cyber Treasury payment is debited but not reflected?',
      answer: 'The ISMS 2.0 portal performs automated treasury reconciliation every 15 minutes with Cyber Treasury (e-GRAS). You can also open EOI Status (/tender-status) and enter your reference number to verify the transaction status.',
      isOpen: false
    },
    {
      id: 'faq-3',
      category: 'EOI Bidding',
      question: 'Can I edit an EOI application after submission?',
      answer: 'Yes, up to 3 edits are permitted prior to the Department Scrutiny Desk locking the proposal for committee evaluation. Once scrutiny begins, amendments require a formal query response.',
      isOpen: false
    },
    {
      id: 'faq-4',
      category: 'Attendance',
      question: 'How is attendance recorded at Skill Development Centers (SDCs)?',
      answer: 'Trainee and faculty attendance must be recorded using DoITC-integrated biometric devices twice daily (IN and OUT). Offline attendance marks require explicit administrative approval from the Attender User.',
      isOpen: false
    },
    {
      id: 'faq-5',
      category: 'IPA & Batches',
      question: 'What is the timeframe for batch initiation after In-Principle Approval (IPA)?',
      answer: 'Under standard RSLDC guidelines (such as MMKVY and RAJKViK), the Training Partner must initiate and register candidate batches within 15 days of IPA issuance.',
      isOpen: false
    },
    {
      id: 'faq-6',
      category: 'Grievance',
      question: 'Where can I file a grievance regarding portal operations or payments?',
      answer: 'Navigate to the Grievance Redressal module (/grievance) from the portal navigation menu. You can file a detailed grievance ticket with supporting attachments and track resolution status in real time.',
      isOpen: false
    }
  ]);

  toggleFaq(id: string): void {
    this.faqs.update(list =>
      list.map(f => (f.id === id ? { ...f, isOpen: !f.isOpen } : f))
    );
  }

  askQuestion(prompt: string): void {
    this.userInput = prompt;
    this.sendUserMessage();
  }

  sendUserMessage(): void {
    const text = this.userInput.trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text,
      time: this.currentTime()
    };

    const replyText = this.computeBotReply(text);
    const botMsg: ChatMessage = {
      id: `bot-${Date.now() + 1}`,
      sender: 'assistant',
      text: replyText,
      time: this.currentTime()
    };

    this.messages.update(list => [...list, userMsg, botMsg]);
    this.userInput = '';
  }

  clearChat(): void {
    this.messages.set([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: 'Chat history cleared. How can I help you today?',
        time: this.currentTime()
      }
    ]);
  }

  async downloadManual(): Promise<void> {
    if (this.isDownloadingManual()) return;
    this.isDownloadingManual.set(true);
    try {
      await this.userManualService.generateUserManualPdf();
    } catch (err) {
      console.error('Failed to generate user manual PDF:', err);
    } finally {
      this.isDownloadingManual.set(false);
    }
  }

  private computeBotReply(query: string): string {
    const q = query.toLowerCase();

    if (q.includes('otr') || q.includes('register') || q.includes('registration')) {
      return 'To complete One-Time Registration (OTR):\n1. Log in via Rajasthan SSO (sso.rajasthan.gov.in).\n2. Navigate to "Registration" (/registration) from the portal menu.\n3. Complete the 4-step wizard: Organization Details, Authorized Person, Bank Details, and Mandatory Undertakings.\n4. Submit for Departmental approval.';
    }

    if (q.includes('eoi') || q.includes('tender') || q.includes('bid') || q.includes('proposal')) {
      return 'For Expression of Interest (EOI) bidding:\n1. Browse active schemes on the Tenders page (/tenders).\n2. Ensure your OTR profile is complete and approved.\n3. Complete the 6-step proposal flow: Scheme Selection, Target Districts & Sectors, Center Infrastructure, EMD Payment, and Final Preview.\n4. Track proposal review status anytime on the EOI Status page (/tender-status).';
    }

    if (q.includes('attendance') || q.includes('biometric') || q.includes('device') || q.includes('punch')) {
      return 'Attendance Rules for SDCs:\n1. Attendance is captured via DoITC-integrated biometric devices.\n2. Both morning (IN) and evening (OUT) punches are required for trainees and trainers.\n3. In case of temporary device disconnection, manual marks must be submitted through "Offline Approvals" and approved by the Attender User.';
    }

    if (q.includes('payment') || q.includes('treasury') || q.includes('gras') || q.includes('challan') || q.includes('fee')) {
      return 'Payment & Cyber Treasury Guidelines:\n1. All proposal and PST fees must be paid through Cyber Treasury (e-GRAS).\n2. The portal reconciles transaction reference numbers every 15 minutes.\n3. Keep your Cyber Treasury GRN reference number safe for verification on the EOI Status page (/tender-status).';
    }

    if (q.includes('ipa') || q.includes('sanction') || q.includes('mou')) {
      return 'In-Principle Approval (IPA) & MoU:\n1. After committee approval, an official IPA is issued under your scheme.\n2. The Training Partner has 15 days from IPA issuance to initiate batches.\n3. The tripartite MoU must be executed and signed before commencing training cycles.';
    }

    if (q.includes('contact') || q.includes('helpline') || q.includes('phone') || q.includes('call') || q.includes('email') || q.includes('address')) {
      return 'Official Nodal Helpdesk Contacts:\n• Phone: 0141-2716091 / 0141-2792600 (Mon–Fri, 9:30 AM – 6:00 PM)\n• Email: support@isms.rajasthan.gov.in\n• Office: EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004, Rajasthan.';
    }

    if (q.includes('status') || q.includes('track')) {
      return 'To track your proposal status, navigate to "EOI Status" (/tender-status) and enter your EOI reference number or Application ID to view real-time stage approvals from Scrutiny Desk to Sanction Order.';
    }

    return `Thank you for your inquiry. For detailed assistance regarding "${query}", you can consult the official ISMS 2.0 User Manual by clicking "Download User Manual (PDF)" above, or contact our support team at 0141-2716091 or support@isms.rajasthan.gov.in (Mon–Fri, 9:30 AM – 6:00 PM).`;
  }

  private currentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
}
