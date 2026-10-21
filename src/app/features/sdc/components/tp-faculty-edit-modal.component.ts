import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
import { ButtonComponent, FormInputComponent, FormSectionComponent, FormSelectComponent, IconComponent, ModalComponent } from '../../../shared';
import { TpUserRow } from '../utils/tp-users.util';

/** What a faculty member can be changed to. The name, SSO ID and contact details come from SSO and are not edited here. */
export const TRAINER_TYPES = ['Primary Trainer', 'Assistant Trainer', 'Domain Trainer', 'Master Trainer'];
export const FACULTY_QUALIFICATIONS = [
  'Graduate (B.A / B.Sc / B.Com / B.Tech)',
  'Post Graduate (M.A / M.Sc / M.Tech)',
  'PhD'
];

/** Edit Faculty: the trainer type and qualification, changed in every batch the faculty member is in. */
@Component({
  selector: 'app-tp-faculty-edit-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent, FormInputComponent, FormSectionComponent, FormSelectComponent, IconComponent, ModalComponent],
  template: `
    @let u = user();
    <app-modal
      title="Edit Faculty"
      [subtitle]="u.name + ' • ' + u.ssoId"
      size="md"
      [closeOnBackdrop]="false"
      (close)="closed.emit()"
    >
      <app-form-section class="block" title="Trainer Details">
        <div class="grid grid-cols-1 gap-y-2.5">
          <app-form-input label="Name (from SSO)" [disabled]="true" [value]="u.name"></app-form-input>
          <app-form-select label="Trainer Type" [required]="true" [options]="trainerTypes" [value]="trainerType()" (valueChange)="trainerType.set($event)"></app-form-select>
          <app-form-select label="Qualification / Experience" [required]="true" [options]="qualifications" [value]="qualification()" (valueChange)="qualification.set($event)"></app-form-select>
        </div>
        <p class="text-[11px] text-slate-500 mt-3 mb-0">
          This changes the trainer type and qualification in all {{ u.batchIds.length }} {{ u.batchIds.length === 1 ? 'batch' : 'batches' }} of this faculty member.
        </p>
      </app-form-section>

      <ng-container modalFooter>
        <button appButton variant="outline" type="button" (click)="closed.emit()">Cancel</button>
        <button appButton type="button" [disabled]="!trainerType() || !qualification()" (click)="save()">
          <app-icon name="check" size="sm" />
          <span>Save Changes</span>
        </button>
      </ng-container>
    </app-modal>
  `
})
export class TpFacultyEditModalComponent implements OnInit {
  readonly user = input.required<TpUserRow>();
  readonly saved = output<{ trainerType: string; qualification: string }>();
  readonly closed = output<void>();

  protected readonly trainerTypes = TRAINER_TYPES;
  protected readonly qualifications = FACULTY_QUALIFICATIONS;

  protected readonly trainerType = signal<string>('');
  protected readonly qualification = signal<string>('');

  ngOnInit(): void {
    // Starts with what the faculty member has now.
    this.trainerType.set(this.user().trainerType ?? '');
    this.qualification.set(this.user().qualification ?? '');
  }

  protected save(): void {
    if (this.trainerType() && this.qualification()) {
      this.saved.emit({ trainerType: this.trainerType(), qualification: this.qualification() });
    }
  }
}
