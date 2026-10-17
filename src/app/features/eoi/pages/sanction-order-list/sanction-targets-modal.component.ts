import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import type { SanctionTableRow } from '../eoi-sanction-editor/eoi-sanction-editor.model';
import { ButtonComponent, ModalComponent, TableColumn, TableComponent } from '../../../../shared';

/** The approved companies of a released sanction order, with the targets sanctioned to each. */
@Component({
  selector: 'app-sanction-targets-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ModalComponent, TableComponent, ButtonComponent],
  template: `
    <app-modal title="Approved Companies" [subtitle]="schemeTitle()" size="xl" (close)="close.emit()">
      <app-table
        [columns]="columns"
        [data]="rows()"
        emptyMessage="No approved companies in this sanction order."
      />

      @if (rows().length > 0) {
        <div class="flex items-center justify-end gap-3 mt-3 px-4 py-2.5 border border-slate-200 rounded-lg bg-slate-50 text-[13px] font-semibold text-slate-900">
          <span>Total</span>
          <span class="min-w-16 text-right">{{ total() }}</span>
        </div>
      }

      <ng-container modalFooter>
        <button appButton (click)="close.emit()">Close</button>
      </ng-container>
    </app-modal>
  `
})
export class SanctionTargetsModalComponent {
  readonly schemeTitle = input('');
  readonly rows = input<SanctionTableRow[]>([]);
  readonly close = output<void>();

  protected readonly columns: TableColumn<SanctionTableRow>[] = [
    { key: '$index', label: 'Sr. No', type: 'number', align: 'center', width: 'w-14' },
    { key: 'appId', label: 'Application ID', cellClass: 'whitespace-nowrap font-mono text-[12px] text-slate-700' },
    { key: 'agencyName', label: 'Name of the Agency / PIA', cellClass: 'font-normal text-slate-800' },
    { key: 'district', label: 'Sanction District', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'sector', label: 'Sanction Sector(s)', cellClass: 'font-normal text-slate-700' },
    { key: 'grade', label: 'Grade', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' },
    { key: 'target', label: 'Sanction Target', align: 'center', cellClass: 'whitespace-nowrap font-normal text-slate-700' }
  ];

  protected readonly total = computed(() => this.rows().reduce((sum, row) => sum + (Number(row.target) || 0), 0));
}
