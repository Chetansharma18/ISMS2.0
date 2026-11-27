import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  ButtonComponent,
  DocTableDirective,
  DocumentPageComponent,
  DropdownComponent,
  DropdownItem,
  IconComponent,
  InputDirective
} from '../../../../shared';
import { DEFAULT_LEFT_LOGO_URL, DEFAULT_RIGHT_LOGO_URL } from '../../components/document-editor/document-editor.util';
import { ResultOrdersService } from '../../components/generate-empanelment-order-modal/result-orders.service';
import { OrderEsignModalComponent } from '../../components/generate-empanelment-order-modal/order-esign-modal.component';
import {
  ESignAction,
  OrderDraftForm,
  OrderEditorDto,
  applySigner,
  eSignActionFor,
  isOrderComplete,
  signerOptionLabel,
  signingAuthorityText,
  toContentRequest,
  toDraftForm
} from '../../components/generate-empanelment-order-modal/result-orders.util';
import { errorText } from '../../components/scheme-form/eoi-apply.util';

/**
 * Draft Empanelment / Rejection Order, edited like the sanction order and IPA drafts. The sheet follows the RSLDC
 * order (letterhead, File No. and date, title, subject, paragraphs, the list, signatory, "Copy to"). Each order has
 * its own signing authority, chosen here from the EOI's committee; only that person e-signs the order (OTP), which
 * puts the e-signature on every page.
 *
 * Saving sends the text to the backend, which renders the draft PDF again. The rows come from the decisions; only
 * their Category and File Status are edited here. Only the committee approver edits, and only the latest draft.
 */
@Component({
  selector: 'app-result-order-editor',
  standalone: true,
  imports: [FormsModule, DocumentPageComponent, ButtonComponent, IconComponent, InputDirective, DocTableDirective, DropdownComponent, OrderEsignModalComponent],
  template: `
    <app-document-page
      [title]="pageTitle()"
      [badge]="badge()"
      [subtitle]="subtitle()"
      backLabel="Back to Applicant Submissions"
      [toast]="toast()"
      (back)="goBack()"
    >
      @if (loadError()) {
        <p class="m-0 font-sans text-xs text-rose-700" role="alert">{{ loadError() }}</p>
      } @else if (!form) {
        <p class="m-0 font-sans text-xs text-slate-500">Loading the order...</p>
      } @else {
        <!-- Letterhead, as on the RSLDC orders -->
        <div class="flex items-center justify-between gap-4">
          <img [src]="leftLogo" alt="RSLDC" class="w-16 h-16 object-contain shrink-0" />
          <div class="flex-1 min-w-0 text-center">
            <input appInput variant="plain" type="text" aria-label="Letterhead name" class="w-full text-center text-base sm:text-xl font-bold leading-tight" [readonly]="!canEdit()" [(ngModel)]="form.headerTitle" />
            <input appInput variant="plain" type="text" aria-label="Letterhead address" class="w-full text-center text-[11px] sm:text-xs" [readonly]="!canEdit()" [(ngModel)]="form.headerAddress" />
          </div>
          <img [src]="rightLogo" alt="Government of Rajasthan" class="w-14 h-14 object-contain shrink-0" />
        </div>
        <div class="mt-2 mb-3 border-b border-slate-900"></div>

        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold">
          <div class="flex items-center gap-1 w-full sm:w-auto">
            <span class="shrink-0">{{ isEmpanelment() ? 'File No.-' : 'File No:' }}</span>
            <input appInput variant="plain" type="text" aria-label="File number" class="w-full sm:w-[26rem] font-bold" [readonly]="!canEdit()" [(ngModel)]="form.fileNo" />
          </div>
          <div class="flex items-center gap-1 shrink-0">
            <span>{{ isEmpanelment() ? 'Dated' : 'Date:' }}</span>
            <input appInput variant="plain" type="text" aria-label="Date" placeholder="dd/mm/yyyy" class="w-32 font-bold" [readonly]="!canEdit()" [(ngModel)]="form.dated" />
          </div>
        </div>

        <input
          appInput
          variant="plain"
          type="text"
          aria-label="Order title"
          class="w-full mt-6 mb-5 text-center font-bold underline underline-offset-4"
          [readonly]="!canEdit()"
          [(ngModel)]="form.title"
        />

        <!-- The Rejection Order has no subject; an empty subject is left out of the PDF. -->
        @if (isEmpanelment() || form.subject) {
          <div class="flex items-start gap-1 font-bold">
            <span class="shrink-0 pt-1">Subject:</span>
            <textarea appInput variant="plain" rows="2" aria-label="Subject" class="w-full font-bold resize-y" [readonly]="!canEdit()" [(ngModel)]="form.subject"></textarea>
          </div>
        }

        <div class="mt-2 space-y-1">
          @for (p of form.paragraphs; track $index; let i = $index) {
            <div class="group flex items-start gap-1">
              <textarea appInput variant="plain" rows="2" class="w-full text-justify resize-y" [attr.aria-label]="'Paragraph ' + (i + 1)" [readonly]="!canEdit()" [(ngModel)]="p.text"></textarea>
              @if (canEdit()) {
                <button appButton variant="ghost" size="sm" iconOnly class="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 print:hidden" (click)="removeParagraph(i)" title="Remove paragraph" aria-label="Remove paragraph">
                  <app-icon name="close" size="sm" />
                </button>
              }
            </div>
          }
          @if (canEdit()) {
            <button appButton variant="outline" size="sm" class="print:hidden" (click)="form.paragraphs.push({ text: '' })">
              <app-icon name="plus" size="sm" />
              <span>Add Paragraph</span>
            </button>
          }
        </div>

        <div class="mt-4 overflow-x-auto">
          <table appDocTable class="w-full border-collapse border border-slate-900 text-left">
            <thead>
              <tr class="font-bold align-top">
                <th class="border border-slate-900 p-1.5 w-12">Sr. No</th>
                <th class="border border-slate-900 p-1.5 w-28">Application ID</th>
                <th class="border border-slate-900 p-1.5">Applicant Agency Name</th>
                @if (isEmpanelment()) { <th class="border border-slate-900 p-1.5 w-32">Category</th> }
                @if (isSupplementary()) { <th class="border border-slate-900 p-1.5 w-28">Earlier Result</th> }
                <th class="border border-slate-900 p-1.5 w-28">File Status</th>
                @if (isEmpanelment()) {
                  <th class="border border-slate-900 p-1.5 w-24">Category as per marks</th>
                }
              </tr>
            </thead>
            <tbody>
              @for (row of form.rows; track row.applicationId; let i = $index) {
                <tr class="align-top">
                  <td class="border border-slate-900 p-1.5">{{ i + 1 }}</td>
                  <td class="border border-slate-900 p-1.5 break-all">{{ row.applicationNo }}</td>
                  <td class="border border-slate-900 p-1.5">{{ row.agencyName }}</td>
                  @if (isEmpanelment()) {
                    <td class="border border-slate-900 p-0.5">
                      <input appInput variant="plain" type="text" class="w-full text-center" placeholder="e.g. A1(skilling)" [attr.aria-label]="'Category of ' + row.applicationNo" [readonly]="!canEdit()" [(ngModel)]="row.category" />
                    </td>
                  }
                  @if (isSupplementary()) { <td class="border border-slate-900 p-1.5 text-center">{{ row.earlierResult || '-' }}</td> }
                  <td class="border border-slate-900 p-0.5">
                    <input appInput variant="plain" type="text" class="w-full text-center" [attr.aria-label]="'File status of ' + row.applicationNo" [readonly]="!canEdit()" [(ngModel)]="row.fileStatus" />
                  </td>
                  @if (isEmpanelment()) {
                    <td class="border border-slate-900 p-1.5 text-center">{{ row.grade || '-' }}</td>
                  }
                </tr>
              }
            </tbody>
          </table>
          <p class="m-0 mt-1 font-sans text-[11px] text-slate-500 print:hidden">
            The list{{ isEmpanelment() ? ' and the grades come' : ' comes' }} from the committee's decisions. Change a decision on the Scrutiny Desk or with the evaluation Excel, then generate a new draft.
          </p>
        </div>

        <textarea
          appInput
          variant="plain"
          rows="1"
          aria-label="Closing line"
          placeholder="Closing line (optional), e.g. This issue with the approval of the competent authority."
          class="w-full mt-5 resize-y"
          [readonly]="!canEdit()"
          [(ngModel)]="form.closingText"
        ></textarea>

        <!-- Signing authority of THIS order (the Empanelment and the Rejection Order have different ones): only the
             chosen user can e-sign it. The name and designation below are what the order prints. -->
        <div class="mt-8 p-3 rounded-lg border border-slate-200 bg-slate-50 font-sans text-xs space-y-1.5 print:hidden">
          <span class="block font-semibold text-slate-800">Signing authority (e-signs this order)</span>
          @if (canEdit()) {
            <app-dropdown
              size="sm"
              searchable
              ariaLabel="Signing authority"
              placeholder="Select the signing authority"
              [options]="signerItems()"
              [value]="form.signerSsoId"
              (valueChange)="chooseSigner($event)"
            />
          } @else {
            <span class="block text-slate-700">{{ signerLabel() }}</span>
          }
          @if (eSignAction()?.signedText; as signedText) {
            <span class="block font-semibold text-slate-700">{{ signedText }}</span>
          } @else {
            <span class="block text-[11px] text-slate-500">
              Only this person can e-sign the {{ isEmpanelment() ? 'Empanelment' : 'Rejection' }} Order, with an OTP to their mobile.
              @if (canEdit()) { Save the draft before e-signing: the saved text is what gets signed. }
            </span>
          }
        </div>

        <!-- Signatory printed on the order -->
        <div class="mt-14 flex flex-col items-end gap-0.5">
          <input appInput variant="plain" type="text" aria-label="Signatory name" placeholder="Name of the signatory" class="w-72 text-right font-bold" [readonly]="!canEdit()" [(ngModel)]="form.signatoryName" />
          <input appInput variant="plain" type="text" aria-label="Signatory designation" class="w-72 text-right" [class.font-bold]="!isEmpanelment()" [readonly]="!canEdit()" [(ngModel)]="form.signatoryDesignation" />
        </div>

        <!-- Dispatch line above "Copy to" (Rejection Order). Left empty, it is not printed. -->
        @if (!isEmpanelment() || form.dispatchFileNo) {
          <div class="mt-6 pt-4 border-t border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-bold">
            <div class="flex items-center gap-1 w-full sm:w-auto">
              <span class="shrink-0">File No:</span>
              <input appInput variant="plain" type="text" aria-label="Dispatch file number" placeholder="Leave empty to leave this line out" class="w-full sm:w-[26rem] font-bold" [readonly]="!canEdit()" [(ngModel)]="form.dispatchFileNo" />
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <span>Date:</span>
              <input appInput variant="plain" type="text" aria-label="Dispatch date" class="w-32 font-bold" [readonly]="!canEdit()" [(ngModel)]="form.dispatchDated" />
            </div>
          </div>
        }

        <div class="mt-8">
          <p class="m-0 mb-1.5">Copy to:-</p>
          <ol class="list-none m-0 p-0 pl-10 space-y-1">
            @for (item of form.copyTo; track $index; let i = $index) {
              <li class="group flex items-center gap-1.5">
                <span class="shrink-0 w-6 text-right">{{ i + 1 }}.</span>
                <input appInput variant="plain" type="text" class="w-full" [attr.aria-label]="'Copy to ' + (i + 1)" [readonly]="!canEdit()" [(ngModel)]="item.text" />
                @if (canEdit()) {
                  <button appButton variant="ghost" size="sm" iconOnly class="shrink-0 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 print:hidden" (click)="form.copyTo.splice(i, 1)" title="Remove row" aria-label="Remove row">
                    <app-icon name="close" size="sm" />
                  </button>
                }
              </li>
            }
          </ol>
          @if (canEdit()) {
            <button appButton variant="outline" size="sm" class="mt-2 print:hidden" (click)="form.copyTo.push({ text: '' })">
              <app-icon name="plus" size="sm" />
              <span>Add Row</span>
            </button>
          }
        </div>
      }

      <ng-container actions>
        @if (editor()) {
          <button appButton variant="outline" size="lg" [disabled]="busy()" (click)="viewPdf()">
            <app-icon name="eye" size="sm" />
            <span>View PDF</span>
          </button>
          @if (canEdit()) {
            <button appButton size="lg" [disabled]="busy()" (click)="save()">{{ saving() ? 'Saving...' : 'Save Draft' }}</button>
          }
          @if (eSignAction(); as a) {
            @if (!a.done) {
              <button appButton size="lg" [disabled]="busy() || !a.canSign" [attr.title]="a.note || null" (click)="showESign.set(true)">
                <app-icon name="shield-check" size="sm" />
                <span>{{ a.label }}</span>
              </button>
            }
          }
        }
      </ng-container>
    </app-document-page>

    @if (showESign() && editor(); as e) {
      <app-order-esign-modal [eoiId]="eoiId" [order]="e.order" (signed)="onSigned()" (close)="showESign.set(false)" />
    }
  `
})
export class ResultOrderEditorComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly api = inject(ResultOrdersService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly leftLogo = DEFAULT_LEFT_LOGO_URL;
  protected readonly rightLogo = DEFAULT_RIGHT_LOGO_URL;

  readonly editor = signal<OrderEditorDto | null>(null);
  readonly loadError = signal('');
  readonly toast = signal('');
  readonly saving = signal(false);
  readonly opening = signal(false);
  readonly busy = computed(() => this.saving() || this.opening());
  /** The text being edited (plain object, bound with ngModel). */
  form: OrderDraftForm | null = null;

  protected eoiId = 0;
  private orderId = 0;
  readonly showESign = signal(false);

  /** "E-Sign Empanelment Order" / "E-Sign Rejection Order" for this order (enabled only for its signing authority). */
  readonly eSignAction = computed<ESignAction | null>(() => {
    const e = this.editor();
    if (!e || (e.order.status !== 'Draft' && !isOrderComplete(e.order))) return null;
    return eSignActionFor(e.order);
  });

  readonly canEdit = computed(() => !!this.editor()?.canEdit);
  readonly isEmpanelment = computed(() => this.editor()?.order.type !== 'Rejection');
  readonly isSupplementary = computed(() => (this.editor()?.order.round ?? 1) > 1);
  readonly pageTitle = computed(() => {
    const e = this.editor();
    if (!e) return 'Draft Order';
    return `${e.order.status === 'Draft' ? 'Draft ' : ''}${e.content.title || (this.isEmpanelment() ? 'Final Empanelment Order' : 'Final Rejection Order')}`;
  });
  readonly badge = computed(() => {
    const e = this.editor();
    return e ? (e.order.status === 'Draft' ? `Draft v${e.order.version}` : e.order.status) : '';
  });
  readonly subtitle = computed(() => {
    const e = this.editor();
    if (!e) return '';
    if (e.canEdit) return `${e.schemeName} · ${e.refNo}. Edit the order below and save; the draft PDF is updated with your changes.`;
    if (e.order.status !== 'Draft') return `${e.schemeName} · ${e.refNo}. The order is signed, so it can no longer be edited.`;
    if (!e.order.isLatest) return `${e.schemeName} · ${e.refNo}. A newer draft exists; this one can no longer be edited.`;
    return `${e.schemeName} · ${e.refNo}. Only the committee approver can edit the draft.`;
  });

  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(params => {
      this.eoiId = Number(params['eoiId']);
      this.orderId = Number(params['orderId']);
      if (!Number.isInteger(this.eoiId) || !Number.isInteger(this.orderId) || this.eoiId <= 0 || this.orderId <= 0) {
        this.loadError.set('This order link is not valid. Open the order from Generate Empanelment Order.');
        return;
      }
      this.load();
    });
  }

  /** The EOI's committee, as signing authorities ("Committee Member 1 (Approver, Director)"). */
  readonly signerItems = computed<DropdownItem[]>(() =>
    (this.editor()?.signerOptions ?? []).map(o => ({ value: o.ssoId, label: signerOptionLabel(o) }))
  );

  readonly signerLabel = computed(() => {
    const s = this.editor()?.order.signer;
    if (!s) return '-';
    return s.name && s.name !== s.authorityName ? `${signingAuthorityText(s)} (e-signed by ${s.name})` : signingAuthorityText(s);
  });

  /** A new signing authority: their name and designation fill the printed signature block unless typed by hand. */
  chooseSigner(ssoId: string): void {
    if (!this.form) return;
    const options = this.editor()?.signerOptions ?? [];
    const previous = options.find(o => o.ssoId === this.form!.signerSsoId) ?? null;
    this.form = applySigner(this.form, options.find(o => o.ssoId === ssoId) ?? null, previous);
  }

  /** This order was e-signed by its signing authority: reload it (now Signed, read-only). */
  onSigned(): void {
    this.showESign.set(false);
    this.showToast('The order is e-signed.');
    this.load();
  }

  removeParagraph(index: number): void {
    this.form?.paragraphs.splice(index, 1);
  }

  save(): void {
    if (!this.form || this.busy()) return;
    this.saving.set(true);
    this.api
      .saveContent(this.eoiId, this.orderId, toContentRequest(this.form))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: dto => {
          this.saving.set(false);
          this.apply(dto);
          this.showToast('Draft saved. The PDF has been updated.');
        },
        error: (e: unknown) => {
          this.saving.set(false);
          this.showToast(errorText(e, 'The draft could not be saved.'));
        }
      });
  }

  /** The PDF as it stands on the backend (save first to see unsaved edits in it). */
  viewPdf(): void {
    const e = this.editor();
    if (!e || this.busy()) return;
    this.opening.set(true);
    const signed = e.order.status !== 'Draft' && e.order.status !== 'Superseded';
    this.api
      .file(this.eoiId, this.orderId, signed)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: blob => {
          this.opening.set(false);
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank', 'noopener');
          setTimeout(() => URL.revokeObjectURL(url), 60_000);
        },
        error: (err: unknown) => {
          this.opening.set(false);
          this.showToast(errorText(err, 'The PDF could not be opened.'));
        }
      });
  }

  goBack(): void {
    void this.router.navigate(['/admin/responses', this.eoiId || '']);
  }

  private load(): void {
    this.api
      .content(this.eoiId, this.orderId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: dto => this.apply(dto),
        error: (e: unknown) => this.loadError.set(errorText(e, 'The order could not be loaded.'))
      });
  }

  private apply(dto: OrderEditorDto): void {
    this.editor.set(dto);
    this.form = toDraftForm(dto);
  }

  private showToast(message: string): void {
    this.toast.set(message);
    setTimeout(() => this.toast.set(''), 2500);
  }
}
