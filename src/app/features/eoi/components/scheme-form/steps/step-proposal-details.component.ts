import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonComponent, DropdownComponent, FormFieldComponent, IconComponent, InputDirective, SectionCardComponent, SwitchComponent } from '../../../../../shared';
import { SchemeFormState } from '../scheme-form.state';
import {
  BUSINESS_ACTIVITIES,
  ID_PROOF_TYPES,
  MAX_ROWS,
  ProposalRowList,
  ProposalSection,
  RESIDENTIAL_TYPES,
  completedFinancialYears,
  upcomingFinancialYears
} from '../proposal-details.util';

const YES_NO = ['Yes', 'No'];

/**
 * EOI Form, built-in sections (RSLDC EOI application format): organisation details for this EOI, the project-level
 * authorized person, financials, training centres, training & placement record and the annual action plan.
 * Nothing here repeats the OTR. Saved with PUT .../proposal-details (see SchemeFormState.saveEoiFormAndProceed).
 */
@Component({
  selector: 'app-step-proposal-details',
  standalone: true,
  imports: [NgTemplateOutlet, FormsModule, ButtonComponent, DropdownComponent, FormFieldComponent, IconComponent, InputDirective, SectionCardComponent, SwitchComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    @let p = state.proposal();
    <div class="space-y-5">
      <!-- 1. Organisation Details (EOI specific) -->
      <app-section-card title="1. Organisation Details (EOI Specific)" subtitle="Name, registration, PAN, address and contact come from your OTR.">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <app-form-field label="Type of Business / Activity" id="pd-org-activity" [required]="true" [error]="err('organisation.businessActivity')">
            <app-dropdown
              size="sm"
              inputId="pd-org-activity"
              [options]="activities"
              [value]="p.organisation.businessActivity ?? ''"
              (valueChange)="org('businessActivity', $event)"
              [invalid]="!!err('organisation.businessActivity')"
            />
          </app-form-field>
          <app-form-field label="Name of Registering Authority" id="pd-org-authority" [required]="true" [error]="err('organisation.registeringAuthority')">
            <input appInput size="sm" id="pd-org-authority" maxlength="200" class="w-full"
              [ngModel]="p.organisation.registeringAuthority" (ngModelChange)="org('registeringAuthority', $event)"
              [invalid]="!!err('organisation.registeringAuthority')" />
          </app-form-field>
          <app-form-field label="Place of Registration" id="pd-org-place" [required]="true" [error]="err('organisation.placeOfRegistration')">
            <input appInput size="sm" id="pd-org-place" maxlength="100" class="w-full"
              [ngModel]="p.organisation.placeOfRegistration" (ngModelChange)="org('placeOfRegistration', $event)"
              [invalid]="!!err('organisation.placeOfRegistration')" />
          </app-form-field>
          <app-form-field label="Blacklisted by any Government Department / Agency" id="pd-org-blacklisted" [required]="true" [error]="err('organisation.isBlacklisted')">
            <app-dropdown
              size="sm"
              inputId="pd-org-blacklisted"
              [options]="yesNo"
              [value]="flagText(p.organisation.isBlacklisted)"
              (valueChange)="org('isBlacklisted', toFlag($event))"
              [invalid]="!!err('organisation.isBlacklisted')"
            />
          </app-form-field>
          @if (p.organisation.isBlacklisted === true) {
            <div class="md:col-span-2">
              <app-form-field label="Blacklisting Details" id="pd-org-blacklist-details" [required]="true" hint="Department / agency, order number, date and period." [error]="err('organisation.blacklistDetails')">
                <textarea appInput rows="3" id="pd-org-blacklist-details" maxlength="1000" class="w-full"
                  [ngModel]="p.organisation.blacklistDetails" (ngModelChange)="org('blacklistDetails', $event)"
                  [invalid]="!!err('organisation.blacklistDetails')"></textarea>
              </app-form-field>
            </div>
          }
        </div>
      </app-section-card>

      <!-- 2. Authorized Person (Project Level) -->
      <app-section-card title="2. Authorized Person (Project Level)" subtitle="The person responsible for this project.">
        <div class="flex items-center gap-3 mb-4">
          <app-switch
            color="navy"
            label="Same as organisation-level authorized person (OTR)"
            [checked]="p.projectAuthorizedPerson.sameAsOrganisation !== false"
            (toggled)="person('sameAsOrganisation', $event)"
          />
          <span class="text-xs font-medium text-slate-700">Same as organisation-level authorized person (OTR)</span>
        </div>
        @if (p.projectAuthorizedPerson.sameAsOrganisation === false) {
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <app-form-field label="Name" id="pd-ap-name" [required]="true" [error]="err('projectAuthorizedPerson.name')">
              <input appInput size="sm" id="pd-ap-name" maxlength="150" class="w-full"
                [ngModel]="p.projectAuthorizedPerson.name" (ngModelChange)="person('name', $event)" [invalid]="!!err('projectAuthorizedPerson.name')" />
            </app-form-field>
            <app-form-field label="Designation" id="pd-ap-designation" [required]="true" [error]="err('projectAuthorizedPerson.designation')">
              <input appInput size="sm" id="pd-ap-designation" maxlength="100" class="w-full"
                [ngModel]="p.projectAuthorizedPerson.designation" (ngModelChange)="person('designation', $event)" [invalid]="!!err('projectAuthorizedPerson.designation')" />
            </app-form-field>
            <app-form-field label="Mobile No." id="pd-ap-mobile" [required]="true" [error]="err('projectAuthorizedPerson.mobile')">
              <input appInput size="sm" id="pd-ap-mobile" type="tel" inputmode="numeric" maxlength="10" class="w-full tabular-nums"
                [ngModel]="p.projectAuthorizedPerson.mobile" (ngModelChange)="person('mobile', $event)" [invalid]="!!err('projectAuthorizedPerson.mobile')" />
            </app-form-field>
            <app-form-field label="Email" id="pd-ap-email" [required]="true" [error]="err('projectAuthorizedPerson.email')">
              <input appInput size="sm" id="pd-ap-email" type="email" maxlength="150" class="w-full"
                [ngModel]="p.projectAuthorizedPerson.email" (ngModelChange)="person('email', $event)" [invalid]="!!err('projectAuthorizedPerson.email')" />
            </app-form-field>
            <app-form-field label="ID Proof Type" id="pd-ap-idtype" [required]="true" [error]="err('projectAuthorizedPerson.idProofType')">
              <app-dropdown size="sm" inputId="pd-ap-idtype" [options]="idProofTypes"
                [value]="p.projectAuthorizedPerson.idProofType ?? ''" (valueChange)="person('idProofType', $event)"
                [invalid]="!!err('projectAuthorizedPerson.idProofType')" />
            </app-form-field>
            <app-form-field label="ID Number" id="pd-ap-idno" [required]="true" [error]="err('projectAuthorizedPerson.idNumber')">
              <input appInput size="sm" id="pd-ap-idno" maxlength="30" class="w-full tabular-nums"
                [ngModel]="p.projectAuthorizedPerson.idNumber" (ngModelChange)="person('idNumber', $event)" [invalid]="!!err('projectAuthorizedPerson.idNumber')" />
            </app-form-field>
            <div class="md:col-span-2">
              <app-form-field label="Residence Address" id="pd-ap-address" [required]="true" [error]="err('projectAuthorizedPerson.residenceAddress')">
                <textarea appInput rows="2" id="pd-ap-address" maxlength="500" class="w-full"
                  [ngModel]="p.projectAuthorizedPerson.residenceAddress" (ngModelChange)="person('residenceAddress', $event)"
                  [invalid]="!!err('projectAuthorizedPerson.residenceAddress')"></textarea>
              </app-form-field>
            </div>
          </div>
        } @else {
          <p class="m-0 text-xs text-slate-500">The authorized person from your OTR (Registration Profile) is used for this project.</p>
        }
      </app-section-card>

      <!-- 3. Financial Details -->
      <app-section-card title="3. Financial Details" subtitle="Turnover of the last three completed financial years, in rupees.">
        @if (err('financials'); as message) {
          <p class="m-0 mb-3 text-[12px] text-rose-600 font-medium" role="alert">{{ message }}</p>
        }
        <div class="space-y-3">
          @for (row of p.financials; track $index; let i = $index) {
            <div class="grid grid-cols-1 md:grid-cols-[140px_1fr_1fr] gap-x-6 items-start rounded-lg border border-slate-200 p-3 md:border-0 md:p-0">
              <app-form-field label="Financial Year" [error]="err('financials[' + i + '].financialYear')">
                <p class="m-0 h-9 flex items-center text-[13px] font-semibold text-slate-900 tabular-nums">{{ row.financialYear }}</p>
              </app-form-field>
              <app-form-field label="Total Turnover (₹)" [id]="'pd-fin-' + i + '-total'" [required]="true" [error]="err('financials[' + i + '].totalTurnover')">
                <input appInput size="sm" type="number" min="0" step="0.01" class="w-full tabular-nums" [id]="'pd-fin-' + i + '-total'"
                  [ngModel]="row.totalTurnover" (ngModelChange)="rowField('financials', i, 'totalTurnover', $event)"
                  [invalid]="!!err('financials[' + i + '].totalTurnover')" />
              </app-form-field>
              <app-form-field label="Turnover from Skill Development (₹)" [id]="'pd-fin-' + i + '-skill'" [required]="true" [error]="err('financials[' + i + '].skillTurnover')">
                <input appInput size="sm" type="number" min="0" step="0.01" class="w-full tabular-nums" [id]="'pd-fin-' + i + '-skill'"
                  [ngModel]="row.skillTurnover" (ngModelChange)="rowField('financials', i, 'skillTurnover', $event)"
                  [invalid]="!!err('financials[' + i + '].skillTurnover')" />
              </app-form-field>
            </div>
          }
        </div>
      </app-section-card>

      <!-- 4. Training Centre Details -->
      <app-section-card title="4. Training Centre Details" subtitle="Your existing training centres.">
        <button actions appButton variant="outline" size="sm" type="button" [disabled]="p.trainingCentres.length >= maxRows" (click)="state.addProposalRow('trainingCentres')">
          <app-icon name="plus" size="sm" /><span>Add row</span>
        </button>
        @if (err('trainingCentres'); as message) {
          <p class="m-0 mb-3 text-[12px] text-rose-600 font-medium" role="alert">{{ message }}</p>
        }
        <div class="space-y-3">
          @for (row of p.trainingCentres; track $index; let i = $index) {
            <div class="rounded-lg border border-slate-200 p-3 sm:p-4">
              <div class="flex items-center justify-between gap-3 mb-2">
                <h4 class="m-0 text-xs font-semibold text-slate-700">Centre {{ i + 1 }}</h4>
                <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="state.removeProposalRow('trainingCentres', i)" title="Remove row" aria-label="Remove row">
                  <app-icon name="trash" size="sm" />
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4">
                <app-form-field label="District" [id]="'pd-tc-' + i + '-district'" [required]="true" [error]="err('trainingCentres[' + i + '].district')">
                  <ng-container *ngTemplateOutlet="district; context: { list: 'trainingCentres', i: i, value: row.district, id: 'pd-tc-' + i + '-district' }" />
                </app-form-field>
                <app-form-field label="Centre Name" [id]="'pd-tc-' + i + '-name'" [required]="true" [error]="err('trainingCentres[' + i + '].centreName')">
                  <input appInput size="sm" maxlength="200" class="w-full" [id]="'pd-tc-' + i + '-name'"
                    [ngModel]="row.centreName" (ngModelChange)="rowField('trainingCentres', i, 'centreName', $event)" [invalid]="!!err('trainingCentres[' + i + '].centreName')" />
                </app-form-field>
                <app-form-field label="Telephone" [id]="'pd-tc-' + i + '-tel'" [error]="err('trainingCentres[' + i + '].telephone')">
                  <input appInput size="sm" type="tel" inputmode="numeric" maxlength="15" class="w-full tabular-nums" [id]="'pd-tc-' + i + '-tel'"
                    [ngModel]="row.telephone" (ngModelChange)="rowField('trainingCentres', i, 'telephone', $event)" [invalid]="!!err('trainingCentres[' + i + '].telephone')" />
                </app-form-field>
                <app-form-field label="Classrooms" [id]="'pd-tc-' + i + '-class'" [required]="true" [error]="err('trainingCentres[' + i + '].classrooms')">
                  <input appInput size="sm" type="number" min="0" max="1000" step="1" class="w-full tabular-nums" [id]="'pd-tc-' + i + '-class'"
                    [ngModel]="row.classrooms" (ngModelChange)="rowField('trainingCentres', i, 'classrooms', $event)" [invalid]="!!err('trainingCentres[' + i + '].classrooms')" />
                </app-form-field>
                <app-form-field label="Practical Rooms" [id]="'pd-tc-' + i + '-prac'" [required]="true" [error]="err('trainingCentres[' + i + '].practicalRooms')">
                  <input appInput size="sm" type="number" min="0" max="1000" step="1" class="w-full tabular-nums" [id]="'pd-tc-' + i + '-prac'"
                    [ngModel]="row.practicalRooms" (ngModelChange)="rowField('trainingCentres', i, 'practicalRooms', $event)" [invalid]="!!err('trainingCentres[' + i + '].practicalRooms')" />
                </app-form-field>
                <app-form-field label="Separate Washrooms (M/F)" [id]="'pd-tc-' + i + '-wash'" [required]="true" [error]="err('trainingCentres[' + i + '].separateWashrooms')">
                  <app-dropdown size="sm" [inputId]="'pd-tc-' + i + '-wash'" [options]="yesNo" [value]="flagText(row.separateWashrooms)"
                    (valueChange)="rowField('trainingCentres', i, 'separateWashrooms', toFlag($event))" [invalid]="!!err('trainingCentres[' + i + '].separateWashrooms')" />
                </app-form-field>
                <app-form-field label="Lab Available" [id]="'pd-tc-' + i + '-lab'" [required]="true" [error]="err('trainingCentres[' + i + '].labAvailable')">
                  <app-dropdown size="sm" [inputId]="'pd-tc-' + i + '-lab'" [options]="yesNo" [value]="flagText(row.labAvailable)"
                    (valueChange)="rowField('trainingCentres', i, 'labAvailable', toFlag($event))" [invalid]="!!err('trainingCentres[' + i + '].labAvailable')" />
                </app-form-field>
                <div class="md:col-span-2 lg:col-span-4">
                  <app-form-field label="Address" [id]="'pd-tc-' + i + '-address'" [required]="true" [error]="err('trainingCentres[' + i + '].address')">
                    <input appInput size="sm" maxlength="500" class="w-full" [id]="'pd-tc-' + i + '-address'"
                      [ngModel]="row.address" (ngModelChange)="rowField('trainingCentres', i, 'address', $event)" [invalid]="!!err('trainingCentres[' + i + '].address')" />
                  </app-form-field>
                </div>
              </div>
            </div>
          } @empty {
            <p class="m-0 text-xs text-slate-500">No training centres added. Choose "Add row".</p>
          }
        </div>
      </app-section-card>

      <!-- 5. Training & Placement Details -->
      <app-section-card title="5. Training & Placement Details" subtitle="Candidates trained and placed, by sector and financial year.">
        <button actions appButton variant="outline" size="sm" type="button" [disabled]="p.trainingPlacements.length >= maxRows" (click)="state.addProposalRow('trainingPlacements')">
          <app-icon name="plus" size="sm" /><span>Add row</span>
        </button>
        @if (err('trainingPlacements'); as message) {
          <p class="m-0 mb-3 text-[12px] text-rose-600 font-medium" role="alert">{{ message }}</p>
        }
        <div class="space-y-3">
          @for (row of p.trainingPlacements; track $index; let i = $index) {
            <div class="rounded-lg border border-slate-200 p-3 sm:p-4">
              <div class="flex items-center justify-between gap-3 mb-2">
                <h4 class="m-0 text-xs font-semibold text-slate-700">Row {{ i + 1 }}</h4>
                <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="state.removeProposalRow('trainingPlacements', i)" title="Remove row" aria-label="Remove row">
                  <app-icon name="trash" size="sm" />
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4">
                <app-form-field label="Sector" [id]="'pd-tp-' + i + '-sector'" [required]="true" [error]="err('trainingPlacements[' + i + '].sector')">
                  @if (state.sectorOptions().length) {
                    <app-dropdown size="sm" searchable [inputId]="'pd-tp-' + i + '-sector'" [options]="state.sectorOptions()" [value]="row.sector ?? ''"
                      (valueChange)="rowField('trainingPlacements', i, 'sector', $event)" [invalid]="!!err('trainingPlacements[' + i + '].sector')" />
                  } @else {
                    <input appInput size="sm" maxlength="200" class="w-full" [id]="'pd-tp-' + i + '-sector'"
                      [ngModel]="row.sector" (ngModelChange)="rowField('trainingPlacements', i, 'sector', $event)" [invalid]="!!err('trainingPlacements[' + i + '].sector')" />
                  }
                </app-form-field>
                <app-form-field label="Financial Year" [id]="'pd-tp-' + i + '-fy'" [required]="true" [error]="err('trainingPlacements[' + i + '].financialYear')">
                  <app-dropdown size="sm" [inputId]="'pd-tp-' + i + '-fy'" [options]="placementYears()" [value]="row.financialYear ?? ''"
                    (valueChange)="rowField('trainingPlacements', i, 'financialYear', $event)" [invalid]="!!err('trainingPlacements[' + i + '].financialYear')" />
                </app-form-field>
                <app-form-field label="Trained" [id]="'pd-tp-' + i + '-trained'" [required]="true" [error]="err('trainingPlacements[' + i + '].trained')">
                  <input appInput size="sm" type="number" min="0" step="1" class="w-full tabular-nums" [id]="'pd-tp-' + i + '-trained'"
                    [ngModel]="row.trained" (ngModelChange)="rowField('trainingPlacements', i, 'trained', $event)" [invalid]="!!err('trainingPlacements[' + i + '].trained')" />
                </app-form-field>
                <app-form-field label="Placed" [id]="'pd-tp-' + i + '-placed'" [required]="true" [error]="err('trainingPlacements[' + i + '].placed')">
                  <input appInput size="sm" type="number" min="0" step="1" class="w-full tabular-nums" [id]="'pd-tp-' + i + '-placed'"
                    [ngModel]="row.placed" (ngModelChange)="rowField('trainingPlacements', i, 'placed', $event)" [invalid]="!!err('trainingPlacements[' + i + '].placed')" />
                </app-form-field>
                <app-form-field label="Placement Proofs" [id]="'pd-tp-' + i + '-proof'" [required]="true" [error]="err('trainingPlacements[' + i + '].proofCount')">
                  <input appInput size="sm" type="number" min="0" step="1" class="w-full tabular-nums" [id]="'pd-tp-' + i + '-proof'"
                    [ngModel]="row.proofCount" (ngModelChange)="rowField('trainingPlacements', i, 'proofCount', $event)" [invalid]="!!err('trainingPlacements[' + i + '].proofCount')" />
                </app-form-field>
              </div>
            </div>
          } @empty {
            <p class="m-0 text-xs text-slate-500">No rows added. Choose "Add row".</p>
          }
        </div>
      </app-section-card>

      <!-- 6. Annual Action Plan -->
      <app-section-card title="6. Annual Action Plan" subtitle="Skill development centres you plan to run under this EOI.">
        <button actions appButton variant="outline" size="sm" type="button" [disabled]="p.actionPlan.length >= maxRows" (click)="state.addProposalRow('actionPlan')">
          <app-icon name="plus" size="sm" /><span>Add row</span>
        </button>
        @if (err('actionPlan'); as message) {
          <p class="m-0 mb-3 text-[12px] text-rose-600 font-medium" role="alert">{{ message }}</p>
        }
        <div class="space-y-3">
          @for (row of p.actionPlan; track $index; let i = $index) {
            <div class="rounded-lg border border-slate-200 p-3 sm:p-4">
              <div class="flex items-center justify-between gap-3 mb-2">
                <h4 class="m-0 text-xs font-semibold text-slate-700">Row {{ i + 1 }}</h4>
                <button appButton variant="ghost" size="sm" iconOnly type="button" (click)="state.removeProposalRow('actionPlan', i)" title="Remove row" aria-label="Remove row">
                  <app-icon name="trash" size="sm" />
                </button>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-4">
                <app-form-field label="Year" [id]="'pd-ap-' + i + '-year'" [required]="true" [error]="err('actionPlan[' + i + '].year')">
                  <app-dropdown size="sm" [inputId]="'pd-ap-' + i + '-year'" [options]="planYears()" [value]="row.year ?? ''"
                    (valueChange)="rowField('actionPlan', i, 'year', $event)" [invalid]="!!err('actionPlan[' + i + '].year')" />
                </app-form-field>
                <app-form-field label="District" [id]="'pd-ap-' + i + '-district'" [required]="true" [error]="err('actionPlan[' + i + '].district')">
                  <ng-container *ngTemplateOutlet="district; context: { list: 'actionPlan', i: i, value: row.district, id: 'pd-ap-' + i + '-district' }" />
                </app-form-field>
                <app-form-field label="No. of SDCs" [id]="'pd-ap-' + i + '-sdc'" [required]="true" [error]="err('actionPlan[' + i + '].sdcCount')">
                  <input appInput size="sm" type="number" min="1" max="100" step="1" class="w-full tabular-nums" [id]="'pd-ap-' + i + '-sdc'"
                    [ngModel]="row.sdcCount" (ngModelChange)="rowField('actionPlan', i, 'sdcCount', $event)" [invalid]="!!err('actionPlan[' + i + '].sdcCount')" />
                </app-form-field>
                <app-form-field label="SDC Location" [id]="'pd-ap-' + i + '-loc'" [required]="true" [error]="err('actionPlan[' + i + '].sdcLocation')">
                  <input appInput size="sm" maxlength="200" class="w-full" [id]="'pd-ap-' + i + '-loc'"
                    [ngModel]="row.sdcLocation" (ngModelChange)="rowField('actionPlan', i, 'sdcLocation', $event)" [invalid]="!!err('actionPlan[' + i + '].sdcLocation')" />
                </app-form-field>
                <div class="md:col-span-2">
                  <app-form-field label="Sectors" [id]="'pd-ap-' + i + '-sectors'" [required]="true" [error]="err('actionPlan[' + i + '].sectors')">
                    @if (state.sectorOptions().length) {
                      <app-dropdown size="sm" multiple searchable [inputId]="'pd-ap-' + i + '-sectors'" [options]="state.sectorOptions()" [values]="splitList(row.sectors)"
                        (valuesChange)="rowField('actionPlan', i, 'sectors', $event.join(', '))" [invalid]="!!err('actionPlan[' + i + '].sectors')" />
                    } @else {
                      <input appInput size="sm" maxlength="500" class="w-full" [id]="'pd-ap-' + i + '-sectors'" placeholder="Healthcare, Retail"
                        [ngModel]="row.sectors" (ngModelChange)="rowField('actionPlan', i, 'sectors', $event)" [invalid]="!!err('actionPlan[' + i + '].sectors')" />
                    }
                  </app-form-field>
                </div>
                <div class="md:col-span-2">
                  <app-form-field label="Courses" [id]="'pd-ap-' + i + '-courses'" [required]="true" [error]="err('actionPlan[' + i + '].courses')">
                    <input appInput size="sm" maxlength="1000" class="w-full" [id]="'pd-ap-' + i + '-courses'"
                      [ngModel]="row.courses" (ngModelChange)="rowField('actionPlan', i, 'courses', $event)" [invalid]="!!err('actionPlan[' + i + '].courses')" />
                  </app-form-field>
                </div>
                <app-form-field label="Residential / Non-Residential" [id]="'pd-ap-' + i + '-res'" [required]="true" [error]="err('actionPlan[' + i + '].residentialType')">
                  <app-dropdown size="sm" [inputId]="'pd-ap-' + i + '-res'" [options]="residentialTypes" [value]="row.residentialType ?? ''"
                    (valueChange)="rowField('actionPlan', i, 'residentialType', $event)" [invalid]="!!err('actionPlan[' + i + '].residentialType')" />
                </app-form-field>
                <app-form-field label="No. of Batches" [id]="'pd-ap-' + i + '-batches'" [required]="true" [error]="err('actionPlan[' + i + '].batches')">
                  <input appInput size="sm" type="number" min="1" max="1000" step="1" class="w-full tabular-nums" [id]="'pd-ap-' + i + '-batches'"
                    [ngModel]="row.batches" (ngModelChange)="rowField('actionPlan', i, 'batches', $event)" [invalid]="!!err('actionPlan[' + i + '].batches')" />
                </app-form-field>
              </div>
            </div>
          } @empty {
            <p class="m-0 text-xs text-slate-500">No rows added. Choose "Add row".</p>
          }
        </div>
      </app-section-card>
    </div>

    <!-- District: the District Master, or free text when it could not be read. -->
    <ng-template #district let-list="list" let-i="i" let-value="value" let-id="id">
      @if (state.districtOptions().length) {
        <app-dropdown size="sm" searchable [inputId]="id" [options]="state.districtOptions()" [value]="value ?? ''"
          (valueChange)="rowField(list, i, 'district', $event)" [invalid]="!!err(list + '[' + i + '].district')" />
      } @else {
        <input appInput size="sm" maxlength="100" class="w-full" [id]="id"
          [ngModel]="value" (ngModelChange)="rowField(list, i, 'district', $event)" [invalid]="!!err(list + '[' + i + '].district')" />
      }
    </ng-template>
  `
})
export class StepProposalDetailsComponent {
  protected readonly state = inject(SchemeFormState);

  protected readonly activities: string[] = [...BUSINESS_ACTIVITIES];
  protected readonly idProofTypes: string[] = [...ID_PROOF_TYPES];
  protected readonly residentialTypes: string[] = [...RESIDENTIAL_TYPES];
  protected readonly yesNo = YES_NO;
  protected readonly maxRows = MAX_ROWS;

  /** Placements: the last five completed years (plus any year already saved). */
  protected readonly placementYears = computed(() =>
    withSaved(completedFinancialYears(5).reverse(), this.state.proposal().trainingPlacements.map(r => r.financialYear))
  );
  /** Action plan: the current year and the next two (plus any year already saved). */
  protected readonly planYears = computed(() => withSaved(upcomingFinancialYears(2), this.state.proposal().actionPlan.map(r => r.year)));

  protected err(path: string): string {
    return this.state.proposalErrors()[path] ?? '';
  }

  protected org(key: string, value: unknown): void {
    this.update('organisation', key, value);
  }

  protected person(key: string, value: unknown): void {
    this.update('projectAuthorizedPerson', key, value);
  }

  protected rowField(list: ProposalRowList | 'financials', index: number, key: string, value: unknown): void {
    this.state.updateProposalRow(list, index, key, value);
  }

  protected flagText(v: boolean | null): string {
    return v === true ? 'Yes' : v === false ? 'No' : '';
  }

  protected toFlag(v: string): boolean | null {
    return v === 'Yes' ? true : v === 'No' ? false : null;
  }

  protected splitList(v: string | null): string[] {
    return (v ?? '').split(',').map(s => s.trim()).filter(Boolean);
  }

  private update(section: ProposalSection, key: string, value: unknown): void {
    this.state.updateProposalField(section, key, value);
  }
}

/** The offered years, with saved years that are no longer offered kept at the end. */
function withSaved(offered: string[], saved: (string | null)[]): string[] {
  const extra = saved.filter((y): y is string => !!y && !offered.includes(y));
  return [...offered, ...Array.from(new Set(extra))];
}
