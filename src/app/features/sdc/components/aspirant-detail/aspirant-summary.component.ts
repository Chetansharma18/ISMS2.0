import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AspirantRecord, AspirantTrainingStatus } from '../../models/aspirant.model';

/** Hero card (photo, name, status switcher) and the training-centre / batch strip. */
@Component({
  selector: 'app-aspirant-summary',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  imports: [FormsModule],
  template: `
    @let cand = aspirant();
    <div class="space-y-5">
    <!-- Candidate Hero Card (With explicit pure white headings and contrast) -->
    <div class="bg-gradient-to-r from-navy to-primary rounded-xl text-white p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div class="flex items-center gap-4">
        <div class="w-16 h-20 rounded-xl bg-white/10 border-2 border-white/20 overflow-hidden shrink-0 shadow-md">
          <img [src]="cand.candidatePhotoUrl || defaultAvatar" alt="Candidate" class="w-full h-full object-cover" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2.5">
            <h1
              class="text-lg sm:text-xl font-bold m-0 tracking-tight leading-snug"
              style="color: #ffffff !important;"
            >
              {{ displayName() }}
            </h1>
            <span
              class="px-2.5 py-0.5 rounded text-[11px] font-bold border"
              style="background-color: rgba(16, 185, 129, 0.25) !important; color: #a7f3d0 !important; border-color: rgba(52, 211, 153, 0.4) !important;"
            >
              {{ displayStatus() }}
            </span>
          </div>
          <div class="text-xs flex flex-wrap items-center gap-2.5 mt-1.5" style="color: rgba(255, 255, 255, 0.85) !important;">
            <span class="font-mono font-bold" style="color: #ffffff !important;">{{ cand.id }}</span>
            <span style="color: rgba(255, 255, 255, 0.5) !important;">•</span>
            <span>Aadhaar: {{ cand.aadhaarMasked }}</span>
          </div>
        </div>
      </div>

      <!-- Fast Status / Biometric Toggles -->
      <div class="flex flex-wrap items-center gap-2.5 w-full md:w-auto pt-2 md:pt-0 border-t md:border-t-0 border-white/10">
        <div class="flex items-center gap-1.5 bg-white/10 rounded-lg px-2.5 py-1 border border-white/15">
          <span class="text-xs" style="color: #ffffff !important;">Status:</span>
          <select
            [ngModel]="cand.trainingStatus"
            (ngModelChange)="statusChange.emit($event)"
            class="h-7 px-2 text-xs bg-white text-slate-900 rounded font-bold focus:outline-none cursor-pointer"
          >
            <option value="ENROLLED">ENROLLED</option>
            <option value="IN_TRAINING">IN TRAINING</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="CERTIFIED">CERTIFIED</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Training Center & Batch Context Strip -->
    <div class="bg-white border border-slate-200 rounded-xl px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs shadow-2xs">
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-slate-500 font-medium">Training Center (SDC):</span>
        <span class="font-bold text-slate-900">{{ cand.sdcName }}</span>
        <span class="font-mono text-slate-900 font-bold">({{ cand.sdcCode }})</span>
        <span class="px-2 py-0.5 rounded text-[11px] bg-slate-100 border border-slate-300 text-slate-700 font-medium">{{ cand.sdcDistrict }}</span>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <span class="text-slate-500 font-medium">Batch:</span>
        <span class="font-bold font-mono text-slate-900">{{ cand.batchCode }}</span>
        <span class="px-2 py-0.5 rounded text-[11px] font-bold bg-primary-light text-brand">{{ cand.scheme }}</span>
        <span class="text-slate-600 font-medium">{{ cand.courseName }}</span>
      </div>
    </div>
    </div>
  `
})
export class AspirantSummaryComponent {
  readonly aspirant = input.required<AspirantRecord>();
  /** Name shown in the hero (live value while editing). */
  readonly displayName = input.required<string>();
  /** Training status shown in the hero badge (live value while editing). */
  readonly displayStatus = input.required<string>();
  readonly statusChange = output<AspirantTrainingStatus>();

  readonly defaultAvatar = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%2394a3b8'%3E%3Cpath fill-rule='evenodd' d='M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z' clip-rule='evenodd'/%3E%3C/svg%3E";
}