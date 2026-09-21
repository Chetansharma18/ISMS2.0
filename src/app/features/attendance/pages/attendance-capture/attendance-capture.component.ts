import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { AttendanceService } from '../../../../core/services/attendance.service';
import { UiSelectComponent } from '../../../../shared/components/ui/ui-select/ui-select.component';
import { UiInputComponent } from '../../../../shared/components/ui/ui-input/ui-input.component';

@Component({
  selector: 'app-attendance-capture',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, UiSelectComponent, UiInputComponent],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300 max-w-4xl mx-auto pb-12">
      <!-- Page Header -->
      <div>
        <h1 class="text-2xl font-bold text-rsldc-navy">Aspirant Attendance (Biometric)</h1>
        <p class="text-sm text-slate-500 mt-1">Capture daily Aadhaar-based attendance for batch aspirants.</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <!-- Left Side: Configuration -->
        <div class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 h-fit">
          <div class="flex items-center gap-3 mb-6">
            <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
            </div>
            <h2 class="text-xl font-bold text-slate-800">Device & Batch Setup</h2>
          </div>

          <form [formGroup]="captureForm" class="space-y-4">
            <app-ui-select 
              formControlName="deviceType" 
              label="Select Device" 
              [required]="true" 
              [options]="[{label:'MANTRA',value:'MANTRA'},{label:'MORPHO',value:'MORPHO'},{label:'COGENT',value:'COGENT'},{label:'SECUGEN',value:'SECUGEN'}]">
            </app-ui-select>
            
            <app-ui-input 
              formControlName="deviceSerial" 
              label="Device Serial No." 
              [required]="true" 
              placeholder="e.g. MN12345678">
            </app-ui-input>

            <app-ui-select 
              formControlName="batchCode" 
              label="Select Batch" 
              [required]="true" 
              [options]="[{label:'B-26-0001 (Data Entry)',value:'B-26-0001'},{label:'B-26-0002 (Web Dev)',value:'B-26-0002'}]">
            </app-ui-select>
          </form>
        </div>

        <!-- Right Side: Capture Area -->
        <div class="bg-slate-50/80 rounded-2xl shadow-inner border border-slate-200 p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
          
          <div *ngIf="!captureForm.valid" class="text-slate-400">
            <svg class="w-16 h-16 mx-auto mb-4 opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
            <p class="font-bold">Complete Setup First</p>
            <p class="text-xs mt-1">Please select a device and batch on the left.</p>
          </div>

          <div *ngIf="captureForm.valid" class="w-full">
            <h3 class="font-bold text-rsldc-navy text-lg mb-6">Ready to Capture</h3>
            
            <div class="mb-6">
              <label class="block font-semibold text-slate-700 text-xs tracking-wide mb-1.5 text-left">Aadhaar No. / Ref No.</label>
              <input type="text" [formControl]="aadhaarControl" class="w-full px-4 py-3 border border-slate-300 rounded-xl text-center text-xl font-mono tracking-[0.2em] focus:ring-4 focus:ring-rsldc-navy/10 focus:border-rsldc-navy transition-all" placeholder="XXXX-XXXX-XXXX" maxlength="14">
            </div>

            <div class="relative w-32 h-32 mx-auto mb-6 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center overflow-hidden">
              <div *ngIf="scanStatus === 'IDLE'" class="text-slate-300">
                <svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5.5 3.5L4 5M4 19l1.5 1.5M18.5 20.5L20 19M20 5l-1.5-1.5M12 12v.01"></path><path d="M8 8v.01M16 8v.01M8 16v.01M16 16v.01M12 8v.01M12 16v.01M8 12v.01M16 12v.01"></path></svg>
              </div>
              
              <div *ngIf="scanStatus === 'SCANNING'" class="text-blue-500 animate-pulse">
                <svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>
                <div class="absolute inset-0 bg-blue-500/20 translate-y-full animate-[scan_2s_ease-in-out_infinite]"></div>
              </div>

              <div *ngIf="scanStatus === 'SUCCESS'" class="text-emerald-500">
                <svg class="w-16 h-16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
            </div>

            <div class="flex items-start gap-2 text-left mb-6 bg-white p-3 rounded-lg border border-slate-200">
              <input type="checkbox" id="consent" class="mt-0.5" checked>
              <label for="consent" class="text-xs text-slate-500 leading-tight">I hereby give my consent to RSLDC to use my Aadhaar for authenticating my attendance.</label>
            </div>

            <button 
              (click)="startScan()"
              [disabled]="scanStatus === 'SCANNING' || !aadhaarControl.value"
              class="w-full py-3 bg-rsldc-navy text-white rounded-xl font-bold text-sm hover:bg-[#0f1540] transition shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
              <span *ngIf="scanStatus === 'IDLE' || scanStatus === 'SUCCESS'">Capture & Mark Attendance</span>
              <span *ngIf="scanStatus === 'SCANNING'">Scanning Fingerprint...</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  `,
  styles: [`
    @keyframes scan {
      0%, 100% { transform: translateY(-100%); }
      50% { transform: translateY(100%); }
    }
  `]
})
export class AttendanceCaptureComponent {
  private fb = inject(FormBuilder);
  private attendanceService = inject(AttendanceService);
  private authService = inject(AuthService);

  captureForm: FormGroup = this.fb.group({
    deviceType: ['', Validators.required],
    deviceSerial: ['MN20261188', Validators.required],
    batchCode: ['', Validators.required]
  });

  aadhaarControl = this.fb.control('', Validators.required);
  scanStatus: 'IDLE' | 'SCANNING' | 'SUCCESS' = 'IDLE';

  get batchControl() {
    return this.captureForm.get('batchCode')!;
  }

  get deviceControl() {
    return this.captureForm.get('deviceType')!;
  }

  startScan() {
    if (this.captureForm.invalid || !this.aadhaarControl.value) return;

    this.scanStatus = 'SCANNING';
    
    // Simulate biometric scan delay
    setTimeout(() => {
      this.scanStatus = 'SUCCESS';
      
      this.attendanceService.markAttendance({
        batchCode: this.batchControl.value || '',
        aadhaarNo: this.aadhaarControl.value || '',
        deviceType: this.deviceControl.value || ''
      }).subscribe();

      // Reset after 3 seconds
      setTimeout(() => {
        this.scanStatus = 'IDLE';
        this.aadhaarControl.reset();
      }, 3000);
      
    }, 2000);
  }
}
