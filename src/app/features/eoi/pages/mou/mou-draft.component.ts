import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  SecurityContext,
  ViewEncapsulation,
  computed,
  effect,
  inject,
  signal,
  viewChild
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { EoiStateService, Scheme } from '../../services/eoi-state.service';
import type { SanctionOrderDocumentData } from '../../services/eoi-state.models';
import { formatDateTime } from '../../../../shared/utils';
import { ButtonComponent, DocTableDirective, IconComponent } from '../../../../shared';
import { MOU_ARTICLES, MOU_RECITALS, MouContext, splitMouText } from './mou-content';

/** Where the edited draft of a scheme is kept in the browser. */
const draftKey = (schemeId: string): string => `isms_mou_draft_${schemeId}`;

interface SavedMouDraft {
  html: string;
  savedAt: string;
}

const UNSAVED = 'Unsaved changes';

/** Left margin of a clause by its level (fixed class names, so they survive saving the HTML). */
const INDENT: Record<number, string> = { 1: 'ml-0', 2: 'ml-6', 3: 'ml-12' };

/**
 * Printable MoU draft between RSLDC and a company under a scheme. It is the same for every company of
 * the scheme: the company's own details stay blank and are written in after printing.
 */
@Component({
  selector: 'app-mou-draft',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent, DocTableDirective, IconComponent],
  // The saved draft is put back as plain HTML, so the styles must not depend on Angular's scoping.
  encapsulation: ViewEncapsulation.None,
  styles: [
    `
      .mou-blank {
        display: inline-block;
        vertical-align: baseline;
        height: 1.1em;
        border-bottom: 1px solid #1e293b;
        outline: none;
      }
      .mou-blank-short { min-width: 3.5rem; }
      .mou-blank-normal { min-width: 9rem; }
      .mou-blank-long { min-width: 18rem; }
      .mou-blank:focus { background: #f1f5f9; }
      @media print {
        .mou-blank:focus { background: transparent; }
        .mou-keep { break-inside: avoid; }
      }
    `
  ],
  template: `
    <div class="w-full min-h-screen bg-slate-50 text-[#1F2933] font-sans py-6 px-3 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div class="max-w-4xl mx-auto space-y-4 print:max-w-none">

        <!-- Toolbar -->
        <div class="print:hidden bg-white border border-slate-200 rounded-lg shadow-2xs px-4 py-3 flex items-center justify-between gap-4">
          <div class="flex items-center gap-3 min-w-0 flex-1">
            <button appButton variant="outline" size="sm" (click)="goBack()">
              <app-icon name="back" />
              <span>Back</span>
            </button>
            <div class="w-px h-8 bg-slate-200 shrink-0"></div>
            <div class="min-w-0">
              <h1 class="text-sm font-bold text-slate-900 m-0 leading-5">MoU Draft</h1>
              @if (context().eoiRef) {
                <p class="text-xs text-slate-500 m-0 leading-4 truncate" [title]="context().scheme + ' · ' + context().eoiRef">
                  {{ context().scheme }} · {{ context().eoiRef }}
                </p>
              }
            </div>
          </div>

          <div class="flex items-center justify-end gap-2.5 shrink-0 ml-auto">
            <span class="text-[11px] text-slate-500 mr-1 whitespace-nowrap" aria-live="polite">{{ saveStatus() }}</span>
            <button appButton variant="outline" (click)="print()">
              <app-icon name="print" size="sm" />
              <span>Print</span>
            </button>
            <button appButton (click)="save()">
              <app-icon name="check" size="sm" />
              <span>Save</span>
            </button>
          </div>
        </div>

        @if (!ready()) {
          <div class="print:hidden bg-white border border-slate-200 rounded-lg p-8 text-center text-sm text-slate-500">
            The sanction order for this scheme could not be found.
          </div>
        } @else {
          <!-- Document -->
          <!-- The whole document can be edited. Saved edits are put back into it when the page opens. -->
          <div
            #sheet
            contenteditable="true"
            spellcheck="false"
            (input)="markEdited()"
            class="mou-sheet w-full bg-white p-6 sm:p-10 lg:p-14 print:p-0 text-[#111827] font-serif leading-relaxed text-[13px] sm:text-sm border border-slate-300 shadow-sm rounded-lg print:border-none print:shadow-none print:text-[12px] focus:outline-none"
          >
          @if (!initialHtml) {

            <h2 class="text-center text-base font-bold tracking-wide m-0 mb-1">MEMORANDUM OF UNDERSTANDING</h2>
            <p class="text-center font-bold m-0 mb-5">{{ context().scheme }}</p>

            <p class="text-justify m-0 mb-4">
              This Memorandum of Understanding (hereinafter referred to as the "MoU") is made and executed on
              <span class="mou-blank mou-blank-short"></span> day of
              <span class="mou-blank mou-blank-normal"></span> {{ year }}, at Jaipur
            </p>

            <p class="text-center font-bold m-0 mb-3">BETWEEN</p>

            <p class="text-justify m-0 mb-4">
              <strong>Rajasthan Skill and Livelihood Development Corporation (RSLDC)</strong>, Department of Skill,
              Employment and Entrepreneurship, Government of Rajasthan, having its office at
              <span class="mou-blank mou-blank-long"></span>, Jaipur, acting through its
              authorised signatory <span class="mou-blank mou-blank-normal"></span>,
              <span class="mou-blank mou-blank-normal"></span> (designation)
              (hereinafter referred to as "<strong>RSLDC</strong>", which expression shall, unless repugnant to the
              context or meaning thereof, include its successors and permitted assigns) of the <strong>FIRST PART</strong>;
            </p>

            <p class="text-center font-bold m-0 mb-3">AND</p>

            <p class="text-justify m-0 mb-4">
              <span class="mou-blank mou-blank-long"></span> (name of the agency), a
              <span class="mou-blank mou-blank-normal"></span> (constitution of the agency),
              having its head office at
              <span class="mou-blank mou-blank-long"></span>, acting through its authorised
              signatory <span class="mou-blank mou-blank-normal"></span>,
              <span class="mou-blank mou-blank-normal"></span> (designation), aged about
              <span class="mou-blank mou-blank-short"></span> years (hereinafter referred to as the
              "<strong>PIA</strong>", which expression shall, unless repugnant to the context or meaning thereof, include its
              successors and permitted assigns) of the <strong>SECOND PART</strong>.
            </p>

            <p class="text-justify m-0 mb-5">
              RSLDC and the PIA are hereinafter individually referred to as a "<strong>Party</strong>" and together as the
              "<strong>Parties</strong>".
            </p>

            <p class="font-bold m-0 mb-2">WHEREAS:</p>
            @for (recital of recitals(); track recital.letter) {
              <div class="mou-keep grid grid-cols-[2rem_1fr] mb-2 text-justify">
                <span class="font-bold">{{ recital.letter }}.</span>
                <p class="m-0">
                  @for (part of recital.parts; track $index) {
                    <ng-container *ngTemplateOutlet="partTpl; context: { $implicit: part }" />
                  }
                </p>
              </div>
            }

            <p class="font-bold m-0 mt-4 mb-4">NOW, THEREFORE, THE PARTIES HEREBY AGREE AS FOLLOWS:</p>

            @for (article of articles(); track article.title) {
              <section class="mb-4">
                <h3 class="text-sm font-bold m-0 mb-2 text-center uppercase" style="break-after: avoid;">{{ article.title }}</h3>
                @for (item of article.items; track $index) {
                  <div
                    class="mou-keep grid grid-cols-[3.75rem_1fr] mb-1.5 text-justify"
                    [ngClass]="indent(item.level)"
                    [class.font-bold]="item.kind === 'heading'"
                  >
                    <span>{{ item.no }}</span>
                    <span>
                      @for (part of item.parts; track $index) {
                        <ng-container *ngTemplateOutlet="partTpl; context: { $implicit: part }" />
                      }
                    </span>
                  </div>
                }
              </section>
            }

            <p class="text-justify m-0 mt-6 mb-5 mou-keep">
              <strong>IN WITNESS WHEREOF</strong>, the Parties have signed this MoU on the date, month and year first
              written above.
            </p>

            <!-- Signatures -->
            <table appDocTable class="mou-keep w-full border-collapse text-[13px]">
              <thead>
                <tr>
                  <th class="border border-slate-700 px-3 py-2 text-left w-1/2">For and on behalf of RSLDC</th>
                  <th class="border border-slate-700 px-3 py-2 text-left w-1/2">For and on behalf of the PIA</th>
                </tr>
              </thead>
              <tbody>
                @for (label of signatureLines; track label) {
                  <tr>
                    <td class="border border-slate-700 px-3 py-3 align-bottom">
                      {{ label }}: <span class="mou-blank mou-blank-normal"></span>
                    </td>
                    <td class="border border-slate-700 px-3 py-3 align-bottom">
                      {{ label }}: <span class="mou-blank mou-blank-normal"></span>
                    </td>
                  </tr>
                }
                <tr>
                  <td class="border border-slate-700 px-3 pt-4 pb-16 align-top">Seal</td>
                  <td class="border border-slate-700 px-3 pt-4 pb-16 align-top">Seal</td>
                </tr>
              </tbody>
            </table>

            <table appDocTable class="mou-keep w-full border-collapse text-[13px] mt-5">
              <thead>
                <tr>
                  <th class="border border-slate-700 px-3 py-2 text-left w-1/2">Witness 1</th>
                  <th class="border border-slate-700 px-3 py-2 text-left w-1/2">Witness 2</th>
                </tr>
              </thead>
              <tbody>
                @for (label of witnessLines; track label) {
                  <tr>
                    <td class="border border-slate-700 px-3 py-3 align-bottom">
                      {{ label }}: <span class="mou-blank mou-blank-normal"></span>
                    </td>
                    <td class="border border-slate-700 px-3 py-3 align-bottom">
                      {{ label }}: <span class="mou-blank mou-blank-normal"></span>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          }
          </div>
        }
      </div>
    </div>

    <ng-template #partTpl let-part>
      @switch (part.type) {
        @case ('blank') {
          <span
            class="mou-blank"
            [class.mou-blank-short]="part.size === 'short'"
            [class.mou-blank-normal]="part.size === 'normal'"
            [class.mou-blank-long]="part.size === 'long'"
           
          ></span>
        }
        @case ('value') {
          <span class="font-semibold">{{ part.value }}</span>
        }
        @default {
          <span>{{ part.value }}</span>
        }
      }
    </ng-template>
  `
})
export class MouDraftComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private eoiStateService = inject(EoiStateService);

  protected readonly year = new Date().getFullYear();
  protected readonly signatureLines = ['Signature', 'Name', 'Designation', 'Date', 'Place'];
  protected readonly witnessLines = ['Signature', 'Name', 'Address'];

  private readonly scheme = signal<Scheme | undefined>(undefined);
  private readonly order = signal<SanctionOrderDocumentData | null>(null);
  private readonly schemeId = this.route.snapshot.paramMap.get('schemeId') ?? '';

  /** True when the scheme and its sanction order are both found. */
  protected readonly ready = computed(() => !!this.scheme() && !!this.order());

  protected readonly context = computed<MouContext>(() => {
    const scheme = this.scheme();
    const order = this.order();
    return {
      scheme: scheme?.schemeTitle ?? '',
      eoiRef: scheme?.refNo ?? '',
      // "31-Aug-2026 01:00 PM" -> "31-Aug-2026"
      eoiDate: (scheme?.dateOfOpening ?? '').split(' ')[0] ?? '',
      sanctionRef: order?.dispatchRef ?? '',
      sanctionDate: order?.sanctionDate ?? ''
    };
  });

  private readonly sanitizer = inject(DomSanitizer);
  private readonly sheet = viewChild<ElementRef<HTMLElement>>('sheet');

  /** The edited document saved earlier, if any. It is read once; saving does not change it. */
  protected readonly initialHtml: string = this.loadSaved()?.html ?? '';
  private restored = false;

  protected readonly saveStatus = signal('');

  // The text is split into plain text, values and blanks once, when the scheme is known.
  protected readonly recitals = computed(() =>
    MOU_RECITALS.map(recital => ({ letter: recital.letter, parts: splitMouText(recital.text, this.context()) }))
  );

  protected readonly articles = computed(() =>
    MOU_ARTICLES.map(article => ({
      title: article.title,
      items: article.items.map(item => ({ ...item, parts: splitMouText(item.text, this.context()) }))
    }))
  );

  constructor() {
    const saved = this.loadSaved();
    if (saved) this.saveStatus.set(`Saved ${formatDateTime(new Date(saved.savedAt))}`);

    // Put the saved document back into the page once it is on screen.
    effect(() => {
      const sheet = this.sheet()?.nativeElement;
      if (!sheet || !this.initialHtml || this.restored) return;
      this.restored = true;
      sheet.innerHTML = this.sanitizer.sanitize(SecurityContext.HTML, this.initialHtml) ?? '';
    });

    this.order.set(this.eoiStateService.getSchemeSanctionOrder(this.schemeId));
    this.eoiStateService
      .getSchemeById(this.schemeId)
      .pipe(takeUntilDestroyed())
      .subscribe(scheme => this.scheme.set(scheme));
  }

  protected indent(level: number): string {
    return INDENT[level] ?? 'ml-0';
  }

  protected markEdited(): void {
    if (this.saveStatus() !== UNSAVED) this.saveStatus.set(UNSAVED);
  }

  /** Stores the document as it is now, edits included. */
  protected save(): void {
    const sheet = this.sheet()?.nativeElement;
    if (!sheet) return;
    const record: SavedMouDraft = { html: sheet.innerHTML, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(draftKey(this.schemeId), JSON.stringify(record));
    } catch {
      this.saveStatus.set('Could not save: browser storage is full or blocked.');
      return;
    }
    this.saveStatus.set(`Saved ${formatDateTime(new Date(record.savedAt))}`);
  }

  private loadSaved(): SavedMouDraft | null {
    try {
      const raw = localStorage.getItem(draftKey(this.schemeId));
      const parsed = raw ? (JSON.parse(raw) as Partial<SavedMouDraft>) : null;
      return parsed && typeof parsed.html === 'string' && parsed.html ? (parsed as SavedMouDraft) : null;
    } catch {
      return null;
    }
  }

  protected print(): void {
    window.print();
  }

  protected goBack(): void {
    void this.router.navigate(['/admin/sanction-orders']);
  }
}
