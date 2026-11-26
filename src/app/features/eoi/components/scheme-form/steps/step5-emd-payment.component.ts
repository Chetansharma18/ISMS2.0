import { ChangeDetectionStrategy, Component, inject, linkedSignal } from '@angular/core';
import { ButtonComponent, IconComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';

/**
 * EMD Payment and Submit. The EMD is paid on RPP (the wizard records it and submits when RPP returns), or an
 * MSME / Udyam registered organisation claims the exemption (the backend checks the Udyam number in the OTR).
 */
@Component({
  selector: 'app-step5-emd-payment',
  standalone: true,
  imports: [ButtonComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="space-y-4">

      <section class="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
        <div class="bg-slate-50/90 px-4 py-3 border-b border-slate-200 flex items-center justify-between gap-3">
          <div class="flex items-center gap-2.5">
            <span class="w-5 h-5 rounded-full bg-[#7C0E44] text-white flex items-center justify-center text-xs font-bold shrink-0">1</span>
            <h2 class="text-sm sm:text-base font-bold text-slate-900 m-0">EMD Details</h2>
          </div>
          @if (state.emdPaid()) {
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">Paid</span>
              <button appButton variant="outline" size="sm" (click)="state.downloadEmdReceipt()">
                <app-icon name="download" size="sm" />
                <span>Download Receipt</span>
              </button>
            </div>
          } @else if (state.emdExempted()) {
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">Exempted</span>
              <button appButton variant="outline" size="sm" (click)="state.downloadEmdReceipt()">
                <app-icon name="download" size="sm" />
                <span>Download Receipt</span>
              </button>
            </div>
          }
        </div>

        @if (!state.emdRequired()) {
          <p class="p-4 sm:p-5 text-xs text-slate-600 m-0">No EMD is payable for this EOI. Submit your application to finish.</p>
        } @else if (state.emdPaid()) {
          <div class="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4 text-xs">
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">Amount Paid</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.formattedEmdFee() }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">Paid On</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">{{ state.emdPaidDate() }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">Payment Reference No. (PRN)</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums break-all">{{ state.emdPaymentRef() }}</span>
            </div>
            <div>
              <span class="text-slate-500 block text-[11.5px] leading-tight">RPP Transaction ID</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1 tabular-nums break-all">{{ state.emd()?.rppTxnId || '-' }}</span>
            </div>
          </div>
        } @else {
          <div class="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-500 block text-[11.5px] leading-tight">Payable To</span>
              <span class="font-medium text-slate-900 text-[12.5px] block mt-1">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
            </div>
            <div class="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <span class="text-slate-500 block text-[11.5px] leading-tight">Refundability</span>
              <span class="font-semibold text-slate-900 text-[12.5px] block mt-1">Refundable</span>
            </div>
            <div class="p-4 rounded-xl bg-[#FCF8FA] border border-[#EADCE2]">
              <span class="text-slate-500 block text-[11.5px] leading-tight">Amount Payable</span>
              @if (claimExemption()) {
                <span class="text-xl font-extrabold text-navy block mt-1">&#8377;0</span>
                <span class="text-[11.5px] text-slate-600 block mt-0.5">MSME / Udyam exemption</span>
              } @else {
                <span class="text-xl font-extrabold text-navy block mt-1">{{ state.formattedEmdFee() }}</span>
                <span class="text-[11.5px] text-slate-500 block mt-0.5">{{ state.emdFeeInWords() }}</span>
              }
            </div>
          </div>
        }
      </section>

      @if (state.emdRequired() && !state.emdPaid() && state.emdExemptionEligible()) {
        <section class="border border-slate-200 rounded-xl bg-white shadow-2xs p-4 sm:p-5">
          <label class="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              [checked]="claimExemption()"
              (change)="claimExemption.set($any($event.target).checked)"
              class="mt-0.5 w-4 h-4 border-slate-300 rounded accent-navy"
            />
            <span class="text-xs sm:text-[12.5px] text-slate-700 leading-relaxed">
              <span class="font-medium text-slate-900 block">Claim MSME / Udyam EMD exemption</span>
              Udyam No. {{ state.emd()?.udyamNumber || '-' }} (from your One Time Registration)
            </span>
          </label>
        </section>
      }

      @if (state.emdError(); as message) {
        <div class="p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 space-y-2" role="alert">
          <p class="m-0 font-medium">{{ message }}</p>
          @if (state.emdRequired() && !state.emdPaid() && !claimExemption()) {
            <button appButton variant="outline" size="sm" [disabled]="state.isPaymentProcessing()" (click)="state.confirmEmd()">
              Check payment status
            </button>
          }
        </div>
      }

      @if (state.emdRequired() && !state.emdPaid() && !claimExemption()) {
        <p class="m-0 text-[11.5px] text-slate-500 flex items-center gap-1.5">
          <app-icon name="info" size="xs" class="shrink-0" />
          You will be taken to the Rajasthan Payment Platform (RPP) to pay. Your application is submitted when you come back.
        </p>
      }

      <div class="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <button appButton variant="outline" size="lg" [disabled]="state.isPaymentProcessing()" (click)="state.goToStep(state.stepIndexProcFee())">
          &larr; Back to Processing Fee
        </button>
        <button appButton size="lg" [loading]="state.isPaymentProcessing()" [disabled]="state.isPaymentProcessing()" (click)="primary()">
          {{ primaryLabel() }}
        </button>
      </div>
    </div>
  `
})
export class Step5EmdPaymentComponent {
  protected readonly state = inject(SchemeFormState);

  /** Ticked when an exemption is already on the application; never ticked by default otherwise. */
  protected readonly claimExemption = linkedSignal(() => this.state.emdExempted());

  protected primaryLabel(): string {
    if (this.state.isPaymentProcessing()) return 'Please wait...';
    if (!this.state.emdRequired() || this.state.emdPaid() || this.claimExemption()) return 'Submit Application';
    return `Pay ${this.state.formattedEmdFee()} with RPP`;
  }

  protected primary(): void {
    if (!this.state.emdRequired() || this.state.emdPaid()) this.state.submitApplication();
    else if (this.claimExemption()) this.state.claimExemptionAndSubmit();
    else this.state.payEmd();
  }
}
