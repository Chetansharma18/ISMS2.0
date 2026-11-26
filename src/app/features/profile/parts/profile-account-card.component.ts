import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EmptyStateComponent } from '../../../shared/components/empty-state/empty-state.component';
import { LoaderComponent } from '../../../shared/components/loader/loader.component';
import { SectionCardComponent } from '../../../shared/templates/section-card/section-card.component';
import { AccountField } from '../profile-view.util';

/** The account details of GET /auth/me, for users without a One Time Registration. */
@Component({
  selector: 'app-profile-account-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [EmptyStateComponent, LoaderComponent, SectionCardComponent],
  // Block, so the page's vertical spacing applies (a custom element is inline by default).
  host: { class: 'block' },
  template: `
    @if (loading() && fields().length === 0) {
      <app-loader text="Loading your profile..." />
    } @else if (fields().length === 0) {
      <app-empty-state title="No data found" />
    } @else {
      <app-section-card title="Account Details" [subtitle]="roleLabel()">
        <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 m-0 text-[13px]">
          @for (f of fields(); track f.label) {
            <div class="min-w-0">
              <dt class="text-slate-500">{{ f.label }}</dt>
              <dd class="m-0 mt-0.5 font-medium text-slate-900 break-words">{{ f.value }}</dd>
            </div>
          }
        </dl>
      </app-section-card>
    }
  `
})
export class ProfileAccountCardComponent {
  readonly fields = input<AccountField[]>([]);
  readonly roleLabel = input('');
  readonly loading = input(false);
}
