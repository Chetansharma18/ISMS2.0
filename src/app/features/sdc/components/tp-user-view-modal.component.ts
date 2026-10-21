import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import {
  ButtonComponent,
  FormInputComponent,
  FormSectionComponent,
  ModalComponent,
  TableColumn,
  TableComponent
} from '../../../shared';
import { TpAssignment, TpUserRow } from '../utils/tp-users.util';

/** The details of a user the partner created, and every SDC or batch the user is assigned to. */
@Component({
  selector: 'app-tp-user-view-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, FormInputComponent, FormSectionComponent, ModalComponent, TableComponent],
  template: `
    @let u = user();
    <app-modal title="User Details" [subtitle]="u.role + ' • ' + u.ssoId" size="lg" (close)="closed.emit()">
      <div class="space-y-6">
        <app-form-section class="block" title="User Details">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-x-3.5 gap-y-2.5">
            <div class="lg:col-span-6 sm:col-span-1">
              <app-form-input label="Name" [disabled]="true" [value]="u.name"></app-form-input>
            </div>
            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input label="SSO ID" [disabled]="true" [value]="u.ssoId"></app-form-input>
            </div>
            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input label="Role" [disabled]="true" [value]="u.role"></app-form-input>
            </div>
            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input label="Mobile No." [disabled]="true" [value]="u.mobile || '—'"></app-form-input>
            </div>
            <div class="lg:col-span-5 sm:col-span-1">
              <app-form-input label="E-mail" [disabled]="true" [value]="u.email || '—'"></app-form-input>
            </div>
            <div class="lg:col-span-4 sm:col-span-2">
              <app-form-input label="Designation" [disabled]="true" [value]="u.designation || '—'"></app-form-input>
            </div>
            @if (u.role === 'Faculty') {
              <div class="lg:col-span-4 sm:col-span-1">
                <app-form-input label="Trainer Type" [disabled]="true" [value]="u.trainerType || '—'"></app-form-input>
              </div>
              <div class="lg:col-span-8 sm:col-span-1">
                <app-form-input label="Qualification / Experience" [disabled]="true" [value]="u.qualification || '—'"></app-form-input>
              </div>
            }
            <div class="lg:col-span-3 sm:col-span-1">
              <app-form-input label="Assigned On" [disabled]="true" [value]="u.assignedOn || '—'"></app-form-input>
            </div>
          </div>
        </app-form-section>

        <app-form-section class="block" [title]="(u.role === 'Center Head' ? 'Center' : 'Batches') + ' (' + u.assignments.length + ')'">
          <app-table [columns]="columns" [data]="u.assignments" emptyMessage="Not assigned to anything." />
        </app-form-section>
      </div>

      <ng-container modalFooter>
        <button appButton variant="outline" type="button" (click)="closed.emit()">Close</button>
      </ng-container>
    </app-modal>
  `
})
export class TpUserViewModalComponent {
  readonly user = input.required<TpUserRow>();
  readonly closed = output<void>();

  protected readonly columns: TableColumn<TpAssignment>[] = [
    { key: '$index', label: '#', type: 'number', align: 'center', width: 'w-12' },
    { key: 'label', label: 'Assigned To', width: 'min-w-[200px]' },
    { key: 'detail', label: 'Details', width: 'min-w-[260px]' },
    { key: 'status', label: 'Status', width: 'min-w-[130px]' }
  ];
}
