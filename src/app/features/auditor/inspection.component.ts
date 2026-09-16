import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-inspection',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="space-y-6 pb-12">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-4">
          <a routerLink="/dashboard" class="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </a>
          <div>
            <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">SDC Inspection</h1>
            <p class="text-slate-500 mt-1">Verify physical infrastructure and geotags for SkillMasters Rajasthan (SDC-001).</p>
          </div>
        </div>
        <div class="px-4 py-1.5 bg-amber-100 text-amber-800 border border-amber-200 rounded-full font-bold text-xs uppercase shadow-sm">
          Inspection In Progress
        </div>
      </div>
      
      <form [formGroup]="inspectionForm" class="space-y-6">
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Target Location -->
          <div class="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4 hover:shadow-md transition-shadow">
            <h3 class="font-extrabold text-[#131A4D] text-lg border-b border-slate-100 pb-3">TP Submitted Location</h3>
            <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
              <div>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Latitude</p>
                <p class="font-mono text-sm font-semibold text-slate-800">26.912400</p>
              </div>
              <div>
                <p class="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Longitude</p>
                <p class="font-mono text-sm font-semibold text-slate-800">75.787300</p>
              </div>
            </div>
            <!-- Beautiful High-Fidelity Map View -->
            <div class="h-48 rounded-lg border border-slate-200 shadow-inner relative overflow-hidden group">
              <!-- Map Background -->
              <img src="assets/images/map-mockup.jpg" class="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt="Map Location">
              
              <!-- Subtle overlay for readability -->
              <div class="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/10"></div>
              
              <!-- Center Pin Marker -->
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="relative flex items-center justify-center -mt-6">
                  <!-- Pulse effect -->
                  <div class="absolute w-12 h-12 bg-blue-500/30 rounded-full animate-ping"></div>
                  <!-- The Pin -->
                  <svg class="w-10 h-10 text-red-500 relative drop-shadow-md" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                  </svg>
                </div>
              </div>

              <!-- Overlay UI for Interaction -->
              <div class="absolute inset-0 flex items-center justify-center bg-blue-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                 <button type="button" class="px-5 py-2.5 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl text-sm font-extrabold text-[#131A4D] hover:bg-white transition-colors transform translate-y-2 group-hover:translate-y-0 duration-300">
                   Open in Maps
                 </button>
              </div>

              <!-- Map details overlay at bottom -->
              <div class="absolute bottom-3 left-3 right-3 flex justify-between items-end">
                <div class="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-md">
                  <p class="text-white text-[10px] font-bold tracking-wider">Accuracy: ±3m</p>
                </div>
                <div class="bg-blue-600 shadow-md p-1.5 rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4-4m-4 4l-4-4m4 4V14"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Auditor Geo-Match -->
          <div class="bg-white p-6 rounded-xl border-2 border-[#131A4D] shadow-sm space-y-4 hover:shadow-md transition-shadow relative">
            <div class="absolute -top-3 right-4 bg-[#131A4D] text-white px-3 py-0.5 rounded-full text-[10px] font-bold tracking-wider">
              YOUR LIVE LOCATION
            </div>
            <h3 class="font-extrabold text-[#131A4D] text-lg border-b border-slate-100 pb-3">Inspection Geo-Match</h3>
            
            <div class="grid grid-cols-2 gap-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100">
              <div>
                <p class="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Captured Lat</p>
                <p class="font-mono text-sm text-blue-700 font-bold">{{ capturedLat | number:'1.6-6' }}</p>
              </div>
              <div>
                <p class="text-[10px] text-blue-500 font-bold uppercase tracking-wider mb-1">Captured Lng</p>
                <p class="font-mono text-sm text-blue-700 font-bold">{{ capturedLng | number:'1.6-6' }}</p>
              </div>
            </div>
            
            <div class="flex items-center justify-between bg-green-50 p-4 rounded-lg border border-green-200">
              <span class="text-sm font-bold text-green-800 flex items-center gap-2">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Distance: {{ distance }} meters
              </span>
              <span class="px-2 py-1 bg-green-500 text-white rounded text-[10px] font-bold uppercase tracking-wider shadow-sm">
                Within Tolerance
              </span>
            </div>

            <button type="button" (click)="recapture()" [disabled]="isRecapturing" class="w-full py-3 bg-[#131A4D] text-white font-bold rounded-lg shadow-sm hover:bg-[#0a0e29] transition-all disabled:opacity-75 flex justify-center items-center gap-2">
              <svg *ngIf="isRecapturing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {{ isRecapturing ? 'Calibrating GPS...' : 'Recapture Location' }}
            </button>
          </div>

        </div>

        <!-- Checklist -->
        <div class="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 class="font-extrabold text-[#131A4D] text-lg border-b border-slate-100 pb-3">Inspection Checklist <span class="text-red-500">*</span></h3>
          <div class="space-y-4">
            <label class="flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all" [ngClass]="{'border-green-500 bg-green-50': inspectionForm.get('check1')?.value, 'border-slate-200 bg-slate-50 hover:bg-slate-100': !inspectionForm.get('check1')?.value}">
              <input formControlName="check1" type="checkbox" class="w-5 h-5 rounded text-green-600 mt-0.5 focus:ring-green-500">
              <div>
                <span class="font-bold text-sm" [ngClass]="{'text-green-800': inspectionForm.get('check1')?.value, 'text-slate-700': !inspectionForm.get('check1')?.value}">Center exists at the exact physical address</span>
                <p class="text-xs text-slate-500 mt-1">Verify building number, street, and landmark match the application.</p>
              </div>
            </label>
            
            <label class="flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all" [ngClass]="{'border-green-500 bg-green-50': inspectionForm.get('check2')?.value, 'border-slate-200 bg-slate-50 hover:bg-slate-100': !inspectionForm.get('check2')?.value}">
              <input formControlName="check2" type="checkbox" class="w-5 h-5 rounded text-green-600 mt-0.5 focus:ring-green-500">
              <div>
                <span class="font-bold text-sm" [ngClass]="{'text-green-800': inspectionForm.get('check2')?.value, 'text-slate-700': !inspectionForm.get('check2')?.value}">Signboard is available and clearly visible</span>
                <p class="text-xs text-slate-500 mt-1">Must contain TP name, SDC name, and valid branding guidelines.</p>
              </div>
            </label>
            
            <label class="flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all" [ngClass]="{'border-green-500 bg-green-50': inspectionForm.get('check3')?.value, 'border-slate-200 bg-slate-50 hover:bg-slate-100': !inspectionForm.get('check3')?.value}">
              <input formControlName="check3" type="checkbox" class="w-5 h-5 rounded text-green-600 mt-0.5 focus:ring-green-500">
              <div>
                <span class="font-bold text-sm" [ngClass]="{'text-green-800': inspectionForm.get('check3')?.value, 'text-slate-700': !inspectionForm.get('check3')?.value}">Infrastructure matches submitted documents</span>
                <p class="text-xs text-slate-500 mt-1">Verify lab equipment, classrooms, and square footage against the submitted blueprint.</p>
              </div>
            </label>
          </div>
        </div>

        <!-- Photos -->
        <div class="bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <h3 class="font-extrabold text-[#131A4D] text-lg border-b border-slate-100 pb-3">Inspection Photos <span class="text-red-500">*</span></h3>
          <div (click)="triggerUpload()" class="border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:bg-blue-50 transition-colors cursor-pointer group">
             <div class="w-14 h-14 bg-white shadow-sm rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform mb-4">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
             </div>
            <p class="font-extrabold text-[#131A4D]">Click to Capture Geotagged Photos</p>
            <p class="text-xs text-slate-500 mt-2 max-w-sm">Capture live photos of Building front, Classrooms, and Labs. Photos must be taken from within the Mobile App to preserve EXIF location data.</p>
            
            <!-- Hidden file input to simulate functionality -->
            <input type="file" id="photoUpload" class="hidden" multiple accept="image/*" />
          </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-slate-200">
          <button type="button" (click)="reject()" class="px-6 py-3 bg-white border-2 border-red-200 text-red-600 font-bold rounded-lg hover:bg-red-50 transition-colors shadow-sm">
            Reject SDC
          </button>
          <button type="button" (click)="requestReinspection()" class="px-6 py-3 bg-white border-2 border-amber-300 text-amber-700 font-bold rounded-lg hover:bg-amber-50 transition-colors shadow-sm">
            Request Re-Inspection
          </button>
          <button type="button" (click)="approve()" [disabled]="inspectionForm.invalid" class="px-8 py-3 bg-green-600 text-white font-bold rounded-lg shadow-md hover:bg-green-700 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
            Approve SDC
          </button>
        </div>

      </form>
    </div>
  `
})
export class InspectionComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);

  isRecapturing = false;
  capturedLat = 26.912450;
  capturedLng = 75.787380;
  distance = 12;

  inspectionForm = this.fb.group({
    check1: [false, Validators.requiredTrue],
    check2: [false, Validators.requiredTrue],
    check3: [false, Validators.requiredTrue]
  });

  recapture() {
    this.isRecapturing = true;
    setTimeout(() => {
      // Simulate slightly more accurate GPS reading
      this.capturedLat = 26.912420;
      this.capturedLng = 75.787340;
      this.distance = 5;
      this.isRecapturing = false;
    }, 1500);
  }

  triggerUpload() {
    document.getElementById('photoUpload')?.click();
  }

  reject() {
    if (confirm('Are you sure you want to REJECT this SDC?')) {
      this.router.navigate(['/dashboard']);
    }
  }

  requestReinspection() {
    alert('Re-inspection request logged. The TP will be notified.');
    this.router.navigate(['/dashboard']);
  }

  approve() {
    if (this.inspectionForm.valid) {
      alert('SDC successfully Approved!');
      this.router.navigate(['/dashboard']);
    } else {
      alert('Please complete all checklist items before approving.');
    }
  }
}
