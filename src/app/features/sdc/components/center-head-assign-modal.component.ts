import { ChangeDetectionStrategy, Component, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, filter, map, switchMap, tap } from 'rxjs';
import { ActionModalComponent, IconComponent, InputDirective } from '../../../shared';
import type { SsoProfile } from '../../../core/mock/data/sso-users.mock';
import { SsoDirectoryService } from '../services/sso-directory.service';

/** An SSO ID shorter than this is not looked up yet. */
const MIN_SSO_ID_LENGTH = 4;

type LookupStatus = 'idle' | 'loading' | 'found' | 'notFound';

/**
 * Asks for the SSO ID of the Center Head of an approved SDC. As soon as the ID is typed, the person's details are
 * fetched from the SSO and shown; the assignment is made only after the user confirms them.
 */
@Component({
  selector: 'app-center-head-assign-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionModalComponent, IconComponent, InputDirective],
  template: `
    <app-action-modal
      [isOpen]="true"
      [title]="heading() || 'Assign ' + role()"
      [description]="intro() || 'Enter the SSO ID of the ' + role() + ' of ' + sdcName() + '. Only one ' + role() + ' can be assigned to a ' + targetKind() + '.'"
      accentBarClass="bg-primary"
      [showCloseButton]="true"
      [closeOnBackdrop]="false"
      maxWidthClass="max-w-lg"
      [primaryLabel]="confirmLabel()"
      secondaryLabel="Cancel"
      [disablePrimary]="!profile()"
      (primaryAction)="confirm()"
      (secondaryAction)="closed.emit()"
      (close)="closed.emit()"
    >
      <div class="mt-4 space-y-4 text-xs">
        <div>
          <label for="center-head-sso-id" class="block font-semibold text-slate-700 mb-1">
            SSO ID <span class="text-rose-500">*</span>
          </label>
          <input
            appInput
            id="center-head-sso-id"
            type="text"
            autocomplete="off"
            class="w-full"
            [placeholder]="placeholder()"
            [value]="ssoId()"
            (input)="onInput($event)"
          />
        </div>

        @switch (status()) {
          @case ('loading') {
            <div class="flex items-center gap-2 text-slate-600" role="status">
              <app-icon name="spinner" size="sm" [stroke]="2.5" class="animate-spin text-brand" />
              <span>Fetching details from SSO...</span>
            </div>
          }
          @case ('notFound') {
            <div class="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-2" role="alert">
              <app-icon name="alert-triangle" [stroke]="2" class="text-rose-600 shrink-0" />
              <span>No user was found in SSO for this SSO ID. Check the ID and try again.</span>
            </div>
          }
          @case ('found') {
            @if (profile(); as person) {
              <div class="bg-primary-light border border-border rounded-lg p-3 space-y-2">
                <div class="text-[11px] font-semibold text-slate-500 uppercase">Details from SSO</div>
                <dl class="grid grid-cols-[110px_1fr] gap-x-3 gap-y-1.5 m-0">
                  <dt class="text-slate-500">Name</dt>
                  <dd class="m-0 font-semibold text-slate-900">{{ person.name }}</dd>
                  <dt class="text-slate-500">SSO ID</dt>
                  <dd class="m-0 tabular-nums text-slate-900">{{ person.ssoId }}</dd>
                  <dt class="text-slate-500">Mobile</dt>
                  <dd class="m-0 tabular-nums text-slate-900">{{ person.mobile }}</dd>
                  <dt class="text-slate-500">Email</dt>
                  <dd class="m-0 text-slate-900 break-all">{{ person.email }}</dd>
                  <dt class="text-slate-500">Designation</dt>
                  <dd class="m-0 text-slate-900">{{ person.designation }}</dd>
                  <dt class="text-slate-500">Department</dt>
                  <dd class="m-0 text-slate-900">{{ person.department }}</dd>
                </dl>
              </div>
              <p class="m-0 text-slate-600">Check these details, then confirm to make {{ person.name }} the {{ role() }}.</p>
            }
          }
        }
      </div>
    </app-action-modal>
  `
})
export class CenterHeadAssignModalComponent {
  private readonly directory = inject(SsoDirectoryService);

  /** What the person is assigned to: the name of the SDC (or the code of the batch for an Attender User). */
  readonly sdcName = input.required<string>();
  /** The role being assigned; the same dialog serves the Center Head of an SDC and the Attender User of a batch. */
  readonly role = input<string>('Center Head');
  /** What the role belongs to, in the sentence "Only one ... can be assigned to a ...". */
  readonly targetKind = input<string>('center');
  readonly placeholder = input<string>('e.g. CENTERHEAD1');
  /** Title and opening line of the dialog when it is used to change the person instead of assigning one. */
  readonly heading = input<string>('');
  readonly intro = input<string>('');
  readonly confirmLabel = input<string>('Confirm & Assign');
  /** The person the user confirmed. */
  readonly confirmed = output<SsoProfile>();
  readonly closed = output<void>();

  readonly ssoId = signal('');
  readonly status = signal<LookupStatus>('idle');
  readonly profile = signal<SsoProfile | null>(null);

  private readonly typed = new Subject<string>();

  constructor() {
    this.typed
      .pipe(
        tap(id => {
          // Whatever was shown belongs to the old ID.
          this.profile.set(null);
          this.status.set(id.trim().length >= MIN_SSO_ID_LENGTH ? 'loading' : 'idle');
        }),
        debounceTime(300),
        filter(id => id.trim().length >= MIN_SSO_ID_LENGTH),
        switchMap(id => this.directory.lookup(id).pipe(map(found => ({ id, found })))),
        takeUntilDestroyed()
      )
      .subscribe(({ id, found }) => {
        // A late answer for an ID that is no longer in the box is ignored.
        if (id !== this.ssoId()) return;
        this.profile.set(found);
        this.status.set(found ? 'found' : 'notFound');
      });
  }

  protected onInput(event: Event): void {
    const id = (event.target as HTMLInputElement).value;
    this.ssoId.set(id);
    this.typed.next(id);
  }

  protected confirm(): void {
    const person = this.profile();
    if (person) this.confirmed.emit(person);
  }
}
