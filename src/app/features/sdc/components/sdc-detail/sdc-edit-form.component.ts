import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SDC_SECTOR_OPTIONS } from '../../models/sdc.model';
import { RAJASTHAN_LOCATION_DATA } from '../../config/sdc-form.config';
import { SdcPhotoEditorComponent } from './sdc-photo-editor.component';
import { ButtonComponent, DropdownComponent, IconComponent, InputDirective } from '../../../../shared';

/** Inline edit form for an SDC. Edits the parent-owned edit model in place via ngModel. */
// Default change detection: the parent edits the edit model in place (e.g. district change resets dependent fields).
@Component({
  selector: 'app-sdc-edit-form',
  standalone: true,
  imports: [FormsModule, SdcPhotoEditorComponent, ButtonComponent, IconComponent, InputDirective, DropdownComponent],
  host: { class: 'block' },
  template: `
    <div class="border border-slate-200 rounded-xl p-5 sm:p-6 bg-white shadow-2xs space-y-4 animate-in fade-in duration-150">
      
      <div class="border-b border-slate-100 pb-2">
        <h3 class="text-sm font-bold text-slate-800">Edit SDC Registration Information</h3>
        <p class="text-xs text-slate-500">Update center information, capacity, infrastructure parameters, and photos.</p>
      </div>

      <!-- 4-Column Form Grid matching SDC creation form -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        
        <!-- Row 1: Center Name (colSpan 2) + Sector (colSpan 2) -->
        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">
            Center Name <span class="text-rose-500">*</span>
          </label>
          <input
            appInput
            type="text"
            [(ngModel)]="editModel.sdcName"
            class="w-full"
            placeholder="Enter Center Name"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">
            Sector <span class="text-rose-500">*</span>
          </label>
          <app-dropdown
            [options]="sectors"
            [(value)]="editModel.sector"
            placeholder="Select Sector"
            class="w-full"
          />
        </div>

        <!-- Row 2: State (1) + District (1) + Assembly Constituency (1) + Parliament Constituency (1) -->
        <div>
          <label class="block font-semibold text-slate-700 mb-1">State</label>
          <input
            appInput
            type="text"
            [value]="editModel.state"
            disabled
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            District <span class="text-rose-500">*</span>
          </label>
          <app-dropdown
            [options]="districts"
            [value]="editModel.district"
            (valueChange)="districtChange.emit($event)"
            placeholder="Select District"
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Assembly Constituency <span class="text-rose-500">*</span>
          </label>
          <app-dropdown
            [options]="assemblyConstituencies()"
            [(value)]="editModel.assemblyConstituency"
            placeholder="Select Assembly Constituency"
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Parliament Constituency <span class="text-rose-500">*</span>
          </label>
          <app-dropdown
            [options]="parliamentConstituencies()"
            [(value)]="editModel.parliamentConstituency"
            placeholder="Select Parliament Constituency"
            class="w-full"
          />
        </div>

        <!-- Row 3: Division (1) + Block (1) + Proposed Start Date (1) + SDC Capacity (1) -->
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Division</label>
          <input
            appInput
            type="text"
            [value]="editModel.division"
            disabled
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Block <span class="text-rose-500">*</span>
          </label>
          <app-dropdown
            [options]="blocks()"
            [(value)]="editModel.block"
            placeholder="Select Block"
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Proposed Start Date <span class="text-rose-500">*</span>
          </label>
          <input
            appInput
            type="date"
            [(ngModel)]="editModel.proposedStartDate"
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            SDC Capacity <span class="text-rose-500">*</span>
          </label>
          <input
            appInput
            type="number"
            [(ngModel)]="editModel.sdcCapacity"
            min="1"
            max="1000"
            class="w-full"
          />
        </div>

        <!-- Row 4: Center Email (1) + Address (2) + Pin Code (1) -->
        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Center Email <span class="text-rose-500">*</span>
          </label>
          <input
            appInput
            type="email"
            [(ngModel)]="editModel.centerEmail"
            class="w-full"
            placeholder="center@example.com"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">
            Complete Address <span class="text-rose-500">*</span>
          </label>
          <input
            appInput
            type="text"
            [(ngModel)]="editModel.fullAddress"
            class="w-full"
            placeholder="Street address, building, landmark"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">
            Pin Code <span class="text-rose-500">*</span>
          </label>
          <input
            appInput
            type="text"
            [(ngModel)]="editModel.pincode"
            maxlength="6"
            class="w-full"
            placeholder="302029"
          />
        </div>

        <!-- Row 5: Total TP Trained (1) + Total TP Placed (1) + Hostel Category (2) -->
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Total TP Trained</label>
          <input
            appInput
            type="number"
            [(ngModel)]="editModel.totalTrainedAspirants"
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Total TP Placed</label>
          <input
            appInput
            type="number"
            [(ngModel)]="editModel.totalPlacedAspirants"
            class="w-full"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">Hostel Category</label>
          <app-dropdown
            [options]="hostelCategories"
            [(value)]="editModel.hostelCategory"
            placeholder="Select Hostel Category"
            class="w-full"
          />
        </div>

        <!-- Row 6: Latitude (1) + Longitude (1) + Remarks (2) -->
        <div>
          <label class="block font-semibold text-slate-700 mb-1">Latitude</label>
          <input
            appInput
            type="number"
            step="0.0001"
            [(ngModel)]="editModel.latitude"
            class="w-full"
          />
        </div>

        <div>
          <label class="block font-semibold text-slate-700 mb-1">Longitude</label>
          <input
            appInput
            type="number"
            step="0.0001"
            [(ngModel)]="editModel.longitude"
            class="w-full"
          />
        </div>

        <div class="sm:col-span-2">
          <label class="block font-semibold text-slate-700 mb-1">Remarks</label>
          <input
            appInput
            type="text"
            [(ngModel)]="editModel.remarks"
            class="w-full"
            placeholder="Remarks"
          />
        </div>

        <!-- Row 7 (LAST): Center Photos Manager -->
        <div class="sm:col-span-2 lg:col-span-4 pt-4 border-t border-slate-100">
          <app-sdc-photo-editor [photos]="editModel.centerPhotos" />
        </div>

      </div>

      <!-- Form Action Buttons -->
      <div class="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
        <button
          appButton
          variant="outline"
          type="button"
          (click)="cancelled.emit()"
        >
          Cancel
        </button>

        <button
          appButton
          type="button"
          (click)="saved.emit()"
        >
          <app-icon name="check" size="sm" />
          <span>Save Changes</span>
        </button>
      </div>

    </div>
  `
})
export class SdcEditFormComponent {
  readonly model = input.required<any>({ alias: 'editModel' });
  readonly assemblyConstituencies = input.required<string[]>();
  readonly parliamentConstituencies = input.required<string[]>();
  readonly blocks = input.required<string[]>();

  readonly districtChange = output<string>();
  readonly saved = output<void>();
  readonly cancelled = output<void>();

  readonly sectors = SDC_SECTOR_OPTIONS;
  readonly districts = Object.keys(RAJASTHAN_LOCATION_DATA);

  readonly hostelCategories = [
    'Residential (Both Boys & Girls)',
    'Residential (Boys Only)',
    'Residential (Girls Only)'
  ];

  /** Template-friendly alias for the bound edit model. */
  get editModel(): any {
    return this.model();
  }
}