import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { ButtonComponent, TableColumn, TableComponent } from '../../../shared';
import { ShortfallRequest, ShortfallUpload, SubmittedTender } from '../../../core/models/tender.model';
import { TenderDocViewRequest } from './tender-doc-card.component';
import { isShortfallOverdue, openShortfalls, shortfallsOf } from './tender-shortfall.util';

/**
 * "Revert Requests" section of the application detail page: every shortfall notice the
 * department raised, the files it shared, and the applicant's replies, newest first.
 */
@Component({
  selector: 'app-tender-shortfall-section',
  standalone: true,
  imports: [TableComponent, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <section class="bg-white rounded-xl border border-slate-200/90 shadow-2xs p-5 sm:p-6 space-y-4" aria-labelledby="shortfall-heading">
      <div class="pb-3.5 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
        <div class="flex items-center gap-3">
          <span class="w-7 h-7 rounded-full bg-navy text-white font-bold flex items-center justify-center text-sm shadow-2xs shrink-0">6</span>
          <h2 id="shortfall-heading" class="text-base sm:text-lg font-bold text-slate-900 m-0">
            {{ isAppeal() ? 'Appeal Response' : 'Shortfall Requests' }}
          </h2>
        </div>
        <span class="text-[11px] text-slate-500">
          {{ notices().length }} {{ isAppeal() ? 'response(s)' : 'request(s)' }} &bull; {{ openCount() }} pending
        </span>
      </div>

      @if (notices().length === 0) {
        <p class="m-0 text-xs text-slate-500">
          {{ isAppeal() ? 'No appeal response has been received on this application.' : 'No shortfall request has been raised on this application.' }}
        </p>
      }

      <ol class="m-0 p-0 list-none space-y-4">
        @for (notice of notices(); track notice.id; let i = $index) {
          <li class="border rounded-lg overflow-hidden" [class]="notice.status === 'Open' ? 'border-amber-300' : 'border-slate-200'">
            <!-- Notice header -->
            <div
              class="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 border-b"
              [class]="notice.status === 'Open' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'"
            >
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs font-semibold text-slate-900">
                  {{ isAppeal() ? 'Response ' : 'Request ' }}{{ notices().length - i }}
                </span>
                @if (notice.status === 'Open') {
                  <span class="px-2 py-0.5 rounded-full border border-amber-300 bg-amber-100 text-amber-800 text-[10.5px] font-semibold">
                    Pending
                  </span>
                } @else {
                  <span class="px-2 py-0.5 rounded-full border border-sky-200 bg-sky-50 text-sky-800 text-[10.5px] font-semibold">
                    Responded
                  </span>
                }
              </div>
              @if (notice.status === 'Open') {
                <button appButton size="sm" type="button" (click)="respond.emit(notice)">
                  Respond
                </button>
              }
            </div>

            <div class="p-4 space-y-4 text-xs">
              <!-- History of the notice -->
              <ol class="m-0 p-0 list-none relative pl-5 space-y-3 before:absolute before:left-1.5 before:top-1.5 before:bottom-1.5 before:w-px before:bg-slate-200">
                <li class="relative">
                  <span class="absolute -left-5 top-1 w-3 h-3 rounded-full bg-amber-500 ring-2 ring-white"></span>
                  <div class="flex flex-wrap items-center justify-between gap-1">
                    <span class="font-semibold text-slate-900">
                      {{ isAppeal() ? 'Department response received' : 'Shortfall request raised' }}
                    </span>
                    <span class="text-[11px] text-slate-500">{{ notice.raisedOn }} &bull; {{ notice.raisedBy }}</span>
                  </div>
                  <p class="m-0 mt-1 text-slate-700 leading-relaxed whitespace-pre-line">{{ notice.remarks }}</p>
                  <p class="m-0 mt-1 text-[11px]" [class]="overdue(notice) ? 'text-rose-700 font-semibold' : 'text-slate-500'">
                    Respond by {{ notice.dueDate }}
                  </p>

                  <div class="mt-2 flex flex-wrap items-center gap-1.5">
                    <span class="text-[11px] font-semibold text-slate-600">Documents required:</span>
                    @for (doc of notice.requiredDocs; track doc) {
                      <span class="px-2 py-0.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-[11px] font-medium">{{ doc }}</span>
                    }
                  </div>

                  @if (notice.sharedDocs.length > 0) {
                    <div class="mt-3">
                      <div class="text-[11px] font-semibold text-slate-600 mb-1">Supporting documents</div>
                      <ul class="m-0 p-0 list-none border border-slate-200 rounded-md divide-y divide-slate-200 bg-white">
                        @for (doc of notice.sharedDocs; track doc.fileName) {
                          <li class="flex items-center justify-between gap-3 px-3 py-1.5">
                            <span class="min-w-0 truncate">
                              <span class="font-medium text-slate-800">{{ doc.title }}</span>
                              <span class="text-[11px] text-slate-500"> &bull; {{ doc.fileName }} ({{ doc.fileSize }})</span>
                            </span>
                            <button
                              appButton
                              variant="ghost"
                              size="sm"
                              type="button"
                              (click)="viewDoc.emit({ fileName: doc.fileName, title: doc.title, fileSize: doc.fileSize })"
                              class="shrink-0"
                            >
                              View
                            </button>
                          </li>
                        }
                      </ul>
                    </div>
                  }
                </li>

                @if (notice.response; as reply) {
                  <li class="relative">
                    <span class="absolute -left-5 top-1 w-3 h-3 rounded-full bg-navy ring-2 ring-white"></span>
                    <div class="flex flex-wrap items-center justify-between gap-1">
                      <span class="font-semibold text-slate-900">Response submitted</span>
                      <span class="text-[11px] text-slate-500">{{ reply.respondedOn }}</span>
                    </div>
                    @if (reply.remarks) {
                      <p class="m-0 mt-1 text-slate-700 leading-relaxed whitespace-pre-line">{{ reply.remarks }}</p>
                    }

                    <div class="mt-2">
                      <app-table
                        [columns]="uploadColumns"
                        [data]="reply.uploads"
                        [customTemplates]="{ action: uploadActionTemplate }"
                      />
                      <ng-template #uploadActionTemplate let-up>
                        <button
                          appButton
                          variant="ghost"
                          size="sm"
                          type="button"
                          (click)="viewDoc.emit({ fileName: up.fileName, title: up.requiredDoc, fileSize: up.fileSize })"
                        >
                          View
                        </button>
                      </ng-template>
                    </div>
                  </li>
                } @else {
                  <li class="relative">
                    <span class="absolute -left-5 top-1 w-3 h-3 rounded-full bg-white border-2 border-slate-300"></span>
                    <span class="text-slate-500">Response pending</span>
                  </li>
                }
              </ol>
            </div>
          </li>
        }
      </ol>
    </section>
  `
})
export class TenderShortfallSectionComponent {
  readonly app = input.required<SubmittedTender>();

  readonly respond = output<ShortfallRequest>();
  readonly viewDoc = output<TenderDocViewRequest>();

  protected readonly isAppeal = computed(() => !!this.app().appeal);

  protected readonly uploadColumns: TableColumn<ShortfallUpload>[] = [
    { key: 'requiredDoc', label: 'Document' },
    { key: 'fileName', label: 'Uploaded File', format: (_value, up) => `${up.fileName} (${up.fileSize})` },
    { key: 'uploadedOn', label: 'Uploaded On', cellClass: 'whitespace-nowrap' },
    { key: 'action', label: 'Action', align: 'center', width: 'w-20', type: 'custom' }
  ];

  /** Newest request first. */
  protected readonly notices = computed(() => [...shortfallsOf(this.app())].reverse());
  protected readonly openCount = computed(() => openShortfalls(this.app()).length);

  protected overdue(notice: ShortfallRequest): boolean {
    return isShortfallOverdue(notice);
  }
}
