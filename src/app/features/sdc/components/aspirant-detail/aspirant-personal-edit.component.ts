import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantRecord } from '../../models/aspirant.model';
import { PARENT_FORM_VIEW_PROVIDER } from './aspirant-parent-form.provider';
import { formatFileSize } from './aspirant-document.util';

/** Edit-mode card: personal details and identity (edits the parent-owned form object). */
@Component({
  selector: 'app-aspirant-personal-edit',
  standalone: true,
  host: { class: 'block' },
  imports: [FormsModule],
  viewProviders: [PARENT_FORM_VIEW_PROVIDER],
  template: `
    <div class="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs space-y-4">
      <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
        <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0 flex items-center gap-2">
          <span class="w-1.5 h-4 bg-primary rounded-full"></span>
          <span>1. Edit Personal Details &amp; Identity</span>
        </h3>
        <span class="text-[11px] text-slate-400">All changes update aspirant database</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Full Name *</label>
          <input
            type="text"
            [(ngModel)]="form().aspirantName"
            name="aspirantName"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
            required
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Relation Type</label>
          <select
            [(ngModel)]="form().relationType"
            name="relationType"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="Father">Father</option>
            <option value="Mother">Mother</option>
            <option value="Husband">Husband</option>
            <option value="Guardian">Guardian</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Father / Guardian Name</label>
          <input
            type="text"
            [(ngModel)]="form().relationName"
            name="relationName"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Mother's Name</label>
          <input
            type="text"
            [(ngModel)]="form().motherName"
            name="motherName"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Date of Birth</label>
          <input
            type="date"
            [(ngModel)]="form().dob"
            name="dob"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Age (Years)</label>
          <input
            type="number"
            [(ngModel)]="form().age"
            name="age"
            class="w-full h-9 px-3 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          />
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Gender</label>
          <select
            [(ngModel)]="form().gender"
            name="gender"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Transgender">Transgender</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Category</label>
          <select
            [(ngModel)]="form().category"
            name="category"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="General">General</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
            <option value="MBC">MBC</option>
            <option value="EWS">EWS</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Religion</label>
          <select
            [(ngModel)]="form().religion"
            name="religion"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="Hindu">Hindu</option>
            <option value="Muslim">Muslim</option>
            <option value="Sikh">Sikh</option>
            <option value="Christian">Christian</option>
            <option value="Jain">Jain</option>
            <option value="Buddhist">Buddhist</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Educational Qualification</label>
          <select
            [(ngModel)]="form().educationalQualification"
            name="educationalQualification"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="Below 8th">Below 8th</option>
            <option value="8th Pass">8th Pass</option>
            <option value="10th Pass">10th Pass</option>
            <option value="12th Pass">12th Pass</option>
            <option value="Graduate">Graduate</option>
            <option value="Post Graduate">Post Graduate</option>
            <option value="ITI / Diploma">ITI / Diploma</option>
          </select>
        </div>

        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Area Type</label>
          <select
            [(ngModel)]="form().areaType"
            name="areaType"
            class="w-full h-9 px-2.5 text-xs bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:outline-none focus:border-primary"
          >
            <option value="Rural">Rural</option>
            <option value="Urban">Urban</option>
          </select>
        </div>

        <!-- Edit Aadhaar Document Attachment -->
        <div>
          <label class="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">Replace Aadhaar Proof Document</label>
          <div class="flex items-center gap-2">
            <span class="text-xs font-mono text-slate-700 truncate block flex-1" [title]="form().aadhaarDocName || 'Aadhaar_Document.pdf'">
              {{ form().aadhaarDocName || 'Aadhaar_Document.pdf' }}
            </span>
            <button
              type="button"
              (click)="editAadhaarFileInput.click()"
              class="px-3 py-1.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-xs font-semibold cursor-pointer shadow-2xs shrink-0"
            >
              Replace File
            </button>
            <input
              #editAadhaarFileInput
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              (change)="onEditAadhaarFileSelected($event)"
              class="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  `
})
export class AspirantPersonalEditComponent {
  readonly form = input.required<Partial<AspirantRecord>>();
  readonly notify = output<string>();

  onEditAadhaarFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      this.form().aadhaarDocName = file.name;
      this.form().aadhaarDocSize = formatFileSize(file.size);
      this.notify.emit(`New Aadhaar document selected: "${file.name}"`);
      input.value = '';
    }
  }
}