import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from 'rxjs';
import { ButtonComponent, ModalComponent, OtpInputComponent } from '../../../../shared';
import { errorText } from '../scheme-form/eoi-apply.util';
import { ResultOrdersService } from './result-orders.service';
import { ESIGN_LABEL, ESignChallengeDto, ORDER_TITLE, OrderDto, OrderType, PublishResultDto, secondsUntil } from './result-orders.util';

const OTP_LENGTH = 6;

/**
 * OTP to the signed-in user's mobile, as for the sanction order: send it, enter it, confirm.
 *
 * With `order`: e-signs that one order. Only its own signing authority (the Empanelment and the Rejection Order have
 * different ones) may do it; every page of that order gets the e-signature and it becomes Signed. The other order is
 * signed separately. Without `order`: publishes (releases) the e-signed orders to the applicants.
 */
@Component({
  selector: 'app-order-esign-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, ButtonComponent, OtpInputComponent],
  template: `
    <app-modal [title]="title()" [subtitle]="challenge() ? 'Verify your identity to continue.' : subtitle()" size="sm" (close)="close.emit()">
      <div class="text-xs space-y-4">
        @if (order(); as o) {
          <div class="p-3 rounded-lg border border-slate-200 bg-slate-50 space-y-0.5">
            <span class="block text-[11px] font-medium text-slate-500">Signing authority</span>
            <span class="block text-[13px] font-semibold text-slate-900">{{ o.signer?.authorityName || o.signer?.name || '-' }}</span>
            @if (o.signer?.authorityDesignation) {
              <span class="block text-slate-600">{{ o.signer!.authorityDesignation }}</span>
            }
            <span class="block text-[11px] text-slate-500 tabular-nums">{{ o.orderNo }} &middot; version {{ o.version }}</span>
          </div>
        }
        @if (!challenge()) {
          <div class="p-3.5 border-2 border-navy rounded-lg bg-slate-50 space-y-1">
            <span class="block text-[13px] font-semibold text-slate-900">{{ order() ? 'Sign with OTP' : 'Publish with OTP' }}</span>
            <span class="block text-slate-600 leading-relaxed">
              @if (order()) {
                An OTP will be sent to the mobile number in your profile. Signing puts your e-signature on every page of the
                {{ orderTitle() }} only and makes it final (decisions lock).
              } @else {
                An OTP will be sent to the mobile number in your profile. Publishing releases the e-signed orders to the
                applicants; they can then see their result and download their order.
              }
            </span>
          </div>
        } @else {
          <div class="space-y-2">
            <span class="block text-xs font-semibold text-slate-800">Enter OTP <span class="text-rose-600">*</span></span>
            <p class="m-0 text-slate-600 leading-relaxed">A {{ otpLength }}-digit OTP was sent to {{ challenge()!.mobileMasked }}.</p>
            <app-otp-input [length]="otpLength" [value]="otp()" (valueChange)="otp.set($event)" />
            <div class="flex items-center justify-between text-[11px]">
              <button appButton variant="ghost" size="sm" type="button" [disabled]="busy() || wait() > 0" (click)="sendOtp()">
                {{ wait() > 0 ? 'Resend OTP in ' + wait() + ' s' : 'Resend OTP' }}
              </button>
            </div>
          </div>
        }
        @if (error()) {
          <p class="m-0 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700" role="alert">{{ error() }}</p>
        }
      </div>

      <ng-container modalFooter>
        @if (!challenge()) {
          <button appButton type="button" [disabled]="busy()" (click)="sendOtp()">{{ busy() ? 'Sending...' : 'Send OTP' }}</button>
        } @else {
          <button appButton type="button" [disabled]="busy() || otp().length !== otpLength" (click)="confirm()">
            {{ busy() ? (order() ? 'Signing...' : 'Publishing...') : order() ? 'E-Sign' : 'Publish' }}
          </button>
        }
      </ng-container>
    </app-modal>
  `
})
export class OrderEsignModalComponent {
  private readonly api = inject(ResultOrdersService);
  private readonly destroyRef = inject(DestroyRef);

  readonly eoiId = input.required<number>();
  /** The order to e-sign; null = publish the e-signed orders. */
  readonly order = input<OrderDto | null>(null);
  /** Publish mode: e.g. "Final Empanelment Order and Final Rejection Order". */
  readonly orderNames = input('result orders');

  /** The order was e-signed (order mode). */
  readonly signed = output<OrderDto>();
  /** The orders were released (publish mode). */
  readonly published = output<PublishResultDto>();
  readonly close = output<void>();

  protected readonly otpLength = OTP_LENGTH;
  protected readonly challenge = signal<ESignChallengeDto | null>(null);
  protected readonly otp = signal('');
  protected readonly busy = signal(false);
  protected readonly error = signal('');
  private readonly now = signal(Date.now());
  protected readonly wait = computed(() => secondsUntil(this.challenge()?.resendAvailableAt, this.now()));

  protected readonly orderTitle = computed(() => {
    const o = this.order();
    return o ? (ORDER_TITLE[o.type as OrderType] ?? `${o.type} Order`) : '';
  });
  protected readonly title = computed(() => {
    const o = this.order();
    return o ? (ESIGN_LABEL[o.type as OrderType] ?? 'E-Sign Order') : 'Publish Results';
  });
  protected readonly subtitle = computed(() => (this.order() ? `Sign the ${this.orderTitle()}.` : `Release the ${this.orderNames()}.`));

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  protected sendOtp(): void {
    if (this.busy()) return;
    const o = this.order();
    this.busy.set(true);
    this.error.set('');
    const call: Observable<ESignChallengeDto> = o ? this.api.requestOrderESignOtp(this.eoiId(), o.id) : this.api.requestPublishOtp(this.eoiId());
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: c => {
        this.busy.set(false);
        this.otp.set('');
        this.challenge.set(c);
      },
      error: (e: unknown) => {
        this.busy.set(false);
        this.error.set(errorText(e, 'The OTP could not be sent. Please try again.'));
      }
    });
  }

  protected confirm(): void {
    const c = this.challenge();
    if (!c || this.busy() || this.otp().length !== OTP_LENGTH) return;
    const o = this.order();
    this.busy.set(true);
    this.error.set('');
    if (o) {
      this.api
        .eSignOrder(this.eoiId(), o.id, c.challengeId, this.otp())
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: order => {
            this.busy.set(false);
            this.signed.emit(order);
          },
          error: (e: unknown) => {
            this.busy.set(false);
            this.error.set(errorText(e, 'The order could not be signed. Please try again.'));
          }
        });
      return;
    }
    this.api
      .publish(this.eoiId(), c.challengeId, this.otp())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.busy.set(false);
          this.published.emit(result);
        },
        error: (e: unknown) => {
          this.busy.set(false);
          this.error.set(errorText(e, 'The orders could not be published. Please try again.'));
        }
      });
  }
}
