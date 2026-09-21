import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { OtrFormService } from '../../../registration/services/otr-form.service';

export interface TrainingCenterItem {
  id: string;
  district: string;
  centerName: string;
  telephone: string;
  classrooms: number;
  practicalRooms: number;
  washrooms: string;
  labInfra: string;
  fullAddress: string;
}

export interface TurnoverYear {
  year: string;
  totalTurnover: string;
  skillTurnover: string;
}

export interface TrainingPlacementRecord {
  sector: string;
  year: string;
  trained: number;
  placed: number;
}

export interface ActionPlanDistrict {
  id: string;
  district: string;
  sdcCount: number;
  location: string;
  sectors: string;
  mode: 'Residential' | 'Non-Residential' | 'Both';
  batches: number;
}

export interface EoiDocumentItem {
  id: number;
  name: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  isMandatory: boolean;
  status: 'uploaded' | 'pending';
}

@Component({
  selector: 'app-scheme-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="w-full min-h-full bg-slate-50/50 pb-16 font-sans text-slate-800 select-none">
      
      <!-- ====================================================================
           1. Top Navigation Bar: Back Button & Stepper Progress
           ==================================================================== -->
      <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-4">
          
          <!-- Back to Schemes Button -->
          <button
            type="button"
            (click)="goBackToSchemes()"
            class="inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-md text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>Back to Schemes</span>
          </button>

          <!-- 4-Step Stepper (Clean horizontal line, no button bottom highlights) -->
          <nav class="flex items-center gap-2 sm:gap-6 overflow-x-auto no-scrollbar py-1" aria-label="EOI Application Steps">
            
            <!-- Step 1 -->
            <button
              type="button"
              (click)="goToStep(1)"
              class="flex items-center gap-2 text-xs font-semibold cursor-pointer group"
              [class.text-[#0B3558]]="currentStep() >= 1"
              [class.font-bold]="currentStep() === 1"
              [class.text-slate-400]="currentStep() < 1"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 1"
                [class.text-white]="currentStep() === 1"
                [class.bg-emerald-600]="currentStep() > 1"
                [class.text-white]="currentStep() > 1"
                [class.bg-slate-200]="currentStep() < 1"
              >
                @if (currentStep() > 1) {
                  &check;
                } @else {
                  1
                }
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 1</span>
                <span>Proposal &amp; Documents</span>
              </div>
            </button>

            <span class="w-6 sm:w-10 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 1"></span>

            <!-- Step 2 -->
            <button
              type="button"
              (click)="goToStep(2)"
              class="flex items-center gap-2 text-xs font-semibold cursor-pointer group"
              [class.text-[#0B3558]]="currentStep() >= 2"
              [class.font-bold]="currentStep() === 2"
              [class.text-slate-400]="currentStep() < 2"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 2"
                [class.text-white]="currentStep() === 2"
                [class.bg-emerald-600]="currentStep() > 2"
                [class.text-white]="currentStep() > 2"
                [class.bg-slate-200]="currentStep() < 2"
              >
                @if (currentStep() > 2) {
                  &check;
                } @else {
                  2
                }
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 2</span>
                <span>Complete Preview</span>
              </div>
            </button>

            <span class="w-6 sm:w-10 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 2"></span>

            <!-- Step 3 -->
            <button
              type="button"
              (click)="goToStep(3)"
              class="flex items-center gap-2 text-xs font-semibold cursor-pointer group"
              [class.text-[#0B3558]]="currentStep() >= 3"
              [class.font-bold]="currentStep() === 3"
              [class.text-slate-400]="currentStep() < 3"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 3"
                [class.text-white]="currentStep() === 3"
                [class.bg-emerald-600]="currentStep() > 3"
                [class.text-white]="currentStep() > 3"
                [class.bg-slate-200]="currentStep() < 3"
              >
                @if (currentStep() > 3) {
                  &check;
                } @else {
                  3
                }
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 3</span>
                <span>Fees &amp; Payment</span>
              </div>
            </button>

            <span class="w-6 sm:w-10 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 3"></span>

            <!-- Step 4 -->
            <button
              type="button"
              (click)="goToStep(4)"
              class="flex items-center gap-2 text-xs font-semibold cursor-pointer group"
              [class.text-[#0B3558]]="currentStep() === 4"
              [class.font-bold]="currentStep() === 4"
              [class.text-slate-400]="currentStep() < 4"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors"
                [class.bg-[#0B3558]]="currentStep() === 4"
                [class.text-white]="currentStep() === 4"
                [class.bg-slate-200]="currentStep() < 4"
              >
                4
              </span>
              <div class="text-left leading-tight hidden sm:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 4</span>
                <span>Submission Receipts</span>
              </div>
            </button>

          </nav>
        </div>
      </header>

      <!-- Main Container -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        <!-- ====================================================================
             2. Selected Tender / EOI Banner Card (Matching Screenshot 3)
             ==================================================================== -->
        <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          
          <!-- Top Tag Bar -->
          <div class="bg-[#0B3558] text-white px-5 py-2.5 flex items-center justify-between flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded bg-[#EA580C] text-white font-black text-[10px] uppercase tracking-wider">
                SELECTED TENDER / EOI
              </span>
              <span class="px-2 py-0.5 rounded bg-white/10 text-white font-bold text-xs">
                {{ schemeCode() }}
              </span>
              <span class="text-xs text-blue-200 hidden sm:inline">&bull;</span>
              <span class="text-xs font-semibold text-blue-100">
                {{ schemeCategory() }}
              </span>
            </div>

            <button
              type="button"
              (click)="goBackToSchemes()"
              class="inline-flex items-center gap-1 px-3 py-1 bg-white/10 hover:bg-white/20 rounded text-[11px] font-bold text-white transition-colors cursor-pointer"
            >
              <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span>Change Scheme / Tender</span>
            </button>
          </div>

          <!-- Scheme Details Body -->
          <div class="p-5 sm:p-6 space-y-4">
            <div>
              <h2 class="text-lg sm:text-xl font-black text-[#0B3558] tracking-tight">
                {{ schemeTitle() }}
              </h2>
              <p class="text-xs text-slate-500 mt-1 leading-relaxed max-w-5xl">
                Expression of Interest for Empanelment of Training Partners (TPs) to impart skill training under MMKVY (Category I: RAJKVIK - Rojgar Aadharit Jan Kaushal Vikas Karyakram) across Rajasthan districts with guaranteed minimum 70% wage &amp; corporate placement support for eligible youth.
              </p>
            </div>

            <!-- Parameters Grid (Matching Screenshot 3) -->
            <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">EOI REFERENCE NO.</span>
                <span class="font-mono font-bold text-slate-900">{{ schemeRefNo() }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">TENDER ID</span>
                <span class="font-mono font-bold text-slate-900">2026_RSLDC_593778_1</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">ISSUING AUTHORITY</span>
                <span class="font-bold text-slate-800">RSLDC, Jaipur</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">SUBMISSION DEADLINE</span>
                <span class="font-bold text-rose-600">15-Sep-2026 02:00 PM</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">EMD FEE</span>
                <span class="font-bold text-[#0B3558]">{{ schemeEmdFee() }} <span class="text-[10px] text-slate-400">(Refundable)</span></span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 font-bold uppercase block">PROCESSING FEE</span>
                <span class="font-bold text-[#0B3558]">{{ schemeProcessFee() }} <span class="text-[10px] text-slate-400">(Non-Refundable)</span></span>
              </div>
            </div>
          </div>

        </div>

        <!-- ====================================================================
             STEP 1: SCHEME SPECIFIC DETAILS & DOCUMENTS (From Attached PDF)
             ==================================================================== -->
        @if (currentStep() === 1) {
          <div class="space-y-6">
            
            <!-- Instructions Notice -->
            <div class="bg-blue-50/80 border border-blue-200 rounded-lg p-3.5 flex items-center gap-3 text-xs text-[#0B3558]">
              <svg class="w-5 h-5 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>
                <strong>Proposal Instructions:</strong> Your verified OTR entity particulars have been auto-linked. Please complete the scheme-specific operational parameters, past placement track record, proposed centres, and mandatory compliance documents below.
              </span>
            </div>

            <!-- Subsection 1: Training Centre Infrastructure in Rajasthan (From PDF Page 2) -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">
                    1. Proposed Training Centre Details &amp; Infrastructure
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Operational centres equipped with IT labs, practical labs, and classrooms as per RSLDC specifications.
                  </p>
                </div>
                <span class="px-2.5 py-1 rounded bg-blue-50 text-[#0B3558] font-bold text-xs border border-blue-200">
                  {{ trainingCentres.length }} Centres Listed
                </span>
              </div>

              <!-- Centres Table -->
              <div class="overflow-x-auto border border-slate-200 rounded-lg">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2.5 px-3">District / City</th>
                      <th class="py-2.5 px-3">Training Centre Name</th>
                      <th class="py-2.5 px-2 text-center">Classrooms</th>
                      <th class="py-2.5 px-2 text-center">Practical Rooms</th>
                      <th class="py-2.5 px-2 text-center">Washrooms</th>
                      <th class="py-2.5 px-2 text-center">Lab Infra</th>
                      <th class="py-2.5 px-3">Full Address</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    @for (c of trainingCentres; track c.id) {
                      <tr class="hover:bg-slate-50/60">
                        <td class="py-2.5 px-3 font-bold text-slate-900">{{ c.district }}</td>
                        <td class="py-2.5 px-3 text-slate-800">{{ c.centerName }}</td>
                        <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ c.classrooms }}</td>
                        <td class="py-2.5 px-2 text-center font-bold text-[#0B3558]">{{ c.practicalRooms }}</td>
                        <td class="py-2.5 px-2 text-center text-emerald-600 font-bold">{{ c.washrooms }}</td>
                        <td class="py-2.5 px-2 text-center">
                          <span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                            {{ c.labInfra }}
                          </span>
                        </td>
                        <td class="py-2.5 px-3 text-slate-500 max-w-xs truncate">{{ c.fullAddress }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Subsection 2: Past 3 Years Turnover & Placement Track Record (From PDF Page 4) -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- Financial Turnover from Skill Development -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
                <div class="pb-2 border-b border-slate-100">
                  <h3 class="text-sm font-bold text-[#0B3558]">
                    2. Turnover from Skill Development (Last 3 Years)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">Audited financial turnover from training operations.</p>
                </div>
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2 px-3">Financial Year</th>
                        <th class="py-2 px-3 text-right">Total Turnover (₹)</th>
                        <th class="py-2 px-3 text-right">Skill Turnover (₹)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      @for (t of financialTurnover; track t.year) {
                        <tr>
                          <td class="py-2 px-3 font-bold text-slate-800">{{ t.year }}</td>
                          <td class="py-2 px-3 text-right font-mono text-slate-700">₹ {{ t.totalTurnover }}</td>
                          <td class="py-2 px-3 text-right font-mono font-bold text-[#0B3558]">₹ {{ t.skillTurnover }}</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Training & Placement Track Record -->
              <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
                <div class="pb-2 border-b border-slate-100">
                  <h3 class="text-sm font-bold text-[#0B3558]">
                    3. Training &amp; Placement Track Record
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">Verified candidate certifications and wage employment.</p>
                </div>
                <div class="overflow-x-auto border border-slate-200 rounded-lg">
                  <table class="w-full text-left border-collapse text-xs">
                    <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="py-2 px-3">Sector</th>
                        <th class="py-2 px-2 text-center">Year</th>
                        <th class="py-2 px-2 text-center">Trained</th>
                        <th class="py-2 px-2 text-center">Placed</th>
                        <th class="py-2 px-2 text-center">% Ratio</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      @for (p of placementRecords; track p.sector) {
                        <tr>
                          <td class="py-2 px-3 font-bold text-slate-800">{{ p.sector }}</td>
                          <td class="py-2 px-2 text-center text-slate-500">{{ p.year }}</td>
                          <td class="py-2 px-2 text-center font-bold text-slate-800">{{ p.trained }}</td>
                          <td class="py-2 px-2 text-center font-bold text-emerald-600">{{ p.placed }}</td>
                          <td class="py-2 px-2 text-center font-bold text-[#0B3558]">{{ getPlacementRatio(p) }}%</td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            <!-- Subsection 3: Proposed Annual Action Plan (From PDF Page 4 & 5) -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">
                    4. Proposed Annual Action Plan (2025-2026)
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">Target districts, skill development centres, and batch commitments.</p>
                </div>
                <span class="text-xs font-bold text-[#0B3558] bg-blue-50 px-2.5 py-1 rounded border border-blue-200">
                  Total Batches Committed: 50 (1,250 Candidates)
                </span>
              </div>

              <div class="overflow-x-auto border border-slate-200 rounded-lg">
                <table class="w-full text-left border-collapse text-xs">
                  <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
                    <tr>
                      <th class="py-2 px-3">Proposed District</th>
                      <th class="py-2 px-2 text-center">SDCs</th>
                      <th class="py-2 px-3">SDC Location</th>
                      <th class="py-2 px-3">Proposed Sectors &amp; Courses</th>
                      <th class="py-2 px-2 text-center">Mode</th>
                      <th class="py-2 px-2 text-center">Batches</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100 font-medium">
                    @for (plan of actionPlans; track plan.id) {
                      <tr>
                        <td class="py-2 px-3 font-bold text-slate-900">{{ plan.district }}</td>
                        <td class="py-2 px-2 text-center font-bold text-[#0B3558]">{{ plan.sdcCount }}</td>
                        <td class="py-2 px-3 text-slate-700">{{ plan.location }}</td>
                        <td class="py-2 px-3 text-slate-600">{{ plan.sectors }}</td>
                        <td class="py-2 px-2 text-center font-bold text-slate-700">{{ plan.mode }}</td>
                        <td class="py-2 px-2 text-center font-bold text-emerald-600">{{ plan.batches }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Subsection 4: Mandatory EOI Document Checklist (Matching Screenshot 3 & PDF Page 5) -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-4 shadow-2xs">
              <div class="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 class="text-sm sm:text-base font-bold text-[#0B3558]">
                    5. Mandatory EOI Document Upload Checklist
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Only PDF documents are accepted. Maximum allowed file size is 5 MB per document. Documents marked with * are mandatory.
                  </p>
                </div>
                <span class="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-300">
                  4 of 4 Documents Uploaded
                </span>
              </div>

              <!-- Documents List (Matching Screenshot 3 layout) -->
              <div class="space-y-3">
                @for (doc of eoiDocuments; track doc.id) {
                  <div class="p-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    
                    <div class="flex items-start gap-3">
                      <div class="w-7 h-7 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center font-bold text-xs text-slate-700 shrink-0 mt-0.5">
                        {{ doc.id }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <h4 class="text-xs sm:text-sm font-bold text-slate-900">
                            {{ doc.name }}
                            @if (doc.isMandatory) {
                              <span class="text-rose-600">*</span>
                            }
                          </h4>
                          @if (doc.status === 'uploaded') {
                            <span class="px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Uploaded
                            </span>
                          }
                        </div>
                        <p class="text-[11px] text-slate-500 mt-0.5">
                          {{ doc.description }}
                        </p>
                        @if (doc.status === 'uploaded') {
                          <div class="flex items-center gap-2 mt-1.5 text-[11px] text-slate-600 font-mono">
                            <svg class="w-3.5 h-3.5 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span class="font-bold text-slate-800">{{ doc.fileName }}</span>
                            <span>({{ doc.fileSize }})</span>
                            <span class="text-slate-400">&bull; Uploaded on {{ doc.uploadedDate }}</span>
                          </div>
                        }
                      </div>
                    </div>

                    <!-- Action Buttons (View, Change, Remove) -->
                    <div class="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        (click)="previewDoc(doc)"
                        class="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        (click)="changeDoc(doc)"
                        class="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-md text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                      >
                        Change
                      </button>
                      <button
                        type="button"
                        (click)="removeDoc(doc)"
                        class="px-3 py-1.5 border border-rose-200 hover:bg-rose-50 rounded-md text-xs font-semibold text-rose-600 transition-colors cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>

                  </div>
                }
              </div>
            </div>

            <!-- Footer Action Button for Step 1 -->
            <div class="flex items-center justify-end gap-3 pt-4">
              <button
                type="button"
                (click)="goToStep(2)"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Save &amp; Proceed to Complete Preview</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 2: COMPLETE PREVIEW (All Details + Edit Options)
             ==================================================================== -->
        @if (currentStep() === 2) {
          <div class="space-y-6">
            
            <div class="bg-emerald-50 border border-emerald-200 rounded-lg p-3.5 flex items-center justify-between text-xs text-emerald-900">
              <div class="flex items-center gap-2">
                <svg class="w-5 h-5 text-emerald-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>
                  <strong>Preview Mode:</strong> Review all application particulars below. If any changes are needed, click the <strong>Edit</strong> button on the respective section.
                </span>
              </div>
              <button
                type="button"
                (click)="goToStep(1)"
                class="text-xs font-bold text-[#0B3558] hover:underline cursor-pointer"
              >
                &larr; Back to Step 1
              </button>
            </div>

            <!-- Section 1 Preview: Organization & Legal Constitution -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">1</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">Organization &amp; Legal Constitution (OTR)</h3>
                </div>
                <a
                  [routerLink]="['/registration']"
                  [queryParams]="{ step: 1 }"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit in OTR</span>
                </a>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span class="text-slate-400 block font-medium">TP / PIA Legal Name</span>
                  <span class="font-bold text-slate-800">{{ otrData().step1.fullName || 'DMR ENTERPRISES PRIVATE LIMITED' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Registration / CIN</span>
                  <span class="font-mono font-bold text-slate-800">{{ otrData().step1.registrationNumber || '07AAECD8566H1ZC' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">Company PAN</span>
                  <span class="font-mono font-bold text-slate-800">{{ otrData().step1.companyPan || 'AAECD8566H' }}</span>
                </div>
                <div>
                  <span class="text-slate-400 block font-medium">GSTIN</span>
                  <span class="font-mono font-bold text-slate-800">{{ otrData().step1.gstin || '08AAACR1234F1Z5' }}</span>
                </div>
              </div>
            </div>

            <!-- Section 2 Preview: Training Centres -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">2</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">Proposed Training Centres ({{ trainingCentres.length }} Centres)</h3>
                </div>
                <button
                  type="button"
                  (click)="goToStep(1)"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Centres</span>
                </button>
              </div>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                @for (c of trainingCentres; track c.id) {
                  <div class="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                    <span class="font-bold text-slate-900 block">{{ c.district }}</span>
                    <span class="text-[11px] text-slate-500 block truncate">{{ c.centerName }}</span>
                    <span class="text-[10px] text-emerald-700 font-bold mt-1 inline-block">
                      {{ c.classrooms }} Classrooms &bull; {{ c.practicalRooms }} Labs
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Section 3 Preview: Action Plan & Documents -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 space-y-3 shadow-2xs">
              <div class="flex items-center justify-between pb-2 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-[#0B3558] text-white flex items-center justify-center text-xs font-bold">3</span>
                  <h3 class="text-sm font-bold text-[#0B3558]">Documents &amp; Compliance Verified</h3>
                </div>
                <button
                  type="button"
                  (click)="goToStep(1)"
                  class="text-xs font-bold text-[#0B3558] hover:text-[#EA580C] flex items-center gap-1 cursor-pointer"
                >
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Documents</span>
                </button>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                @for (d of eoiDocuments; track d.id) {
                  <div class="p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
                    <div class="flex items-center gap-2">
                      <svg class="w-4 h-4 text-rose-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span class="font-bold text-slate-800">{{ d.name }}</span>
                    </div>
                    <span class="text-emerald-700 font-bold text-[10px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                }
              </div>
            </div>

            <!-- Declaration Checkbox -->
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-3">
              <input
                type="checkbox"
                id="previewDeclaration"
                [(ngModel)]="declarationAgreed"
                class="mt-1 w-4 h-4 rounded border-slate-300 text-[#0B3558] focus:ring-[#0B3558] cursor-pointer"
              />
              <label for="previewDeclaration" class="text-xs text-slate-700 leading-relaxed cursor-pointer font-medium">
                I hereby solemnly declare that all particulars submitted in this Expression of Interest (EOI) are true, authentic, and in accordance with RSLDC guidelines. I understand that any false statement will result in immediate disqualification and forfeiture of EMD under Rajasthan Transparency in Public Procurement (RTPP) Act.
              </label>
            </div>

            <!-- Navigation Buttons -->
            <div class="flex items-center justify-between pt-4 border-t border-slate-200">
              <button
                type="button"
                (click)="goToStep(1)"
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              >
                &larr; Back to Step 1
              </button>

              <button
                type="button"
                [disabled]="!declarationAgreed"
                (click)="goToStep(3)"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-bold shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>Confirm &amp; Proceed to Fees &amp; Payment</span>
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 3: FEES & PAYMENT (Compulsory Fees, No Checkboxes, Success Modal)
             ==================================================================== -->
        @if (currentStep() === 3) {
          <div class="space-y-6">
            
            <!-- Step Title -->
            <div>
              <h2 class="text-xl sm:text-2xl font-black text-[#0B3558] tracking-tight">
                Fee Payment
              </h2>
              <p class="text-xs text-slate-500 mt-0.5">
                Mandatory EOI Application Fees &amp; Secure Payment Gateway
              </p>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              <!-- Left 2 Columns: Compulsory Fees & Payment Modes -->
              <div class="lg:col-span-2 space-y-6">
                
                <!-- 1. Applicable EOI Application Fees (Compulsory - No Option to Choose/Uncheck!) -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div class="pb-2 border-b border-slate-100">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900">
                      1. Applicable EOI Application Fees (Compulsory)
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Both Processing Fee (₹2,000) and Earnest Money Deposit (₹50,000) are compulsory for EOI proposal submission under MMKVY-RAJKVIK.
                    </p>
                  </div>

                  <div class="space-y-3">
                    <!-- Fee 1: Processing Fee -->
                    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          &check;
                        </div>
                        <div>
                          <h4 class="text-xs sm:text-sm font-bold text-slate-900">
                            1. Processing Fee <span class="text-rose-600">*</span>
                          </h4>
                          <p class="text-[11px] text-slate-500 mt-0.5">
                            Non-refundable administrative scrutiny fee under MMKVY-RAJKVIK guidelines.
                          </p>
                        </div>
                      </div>
                      <span class="text-sm sm:text-base font-black text-slate-900">₹2,000</span>
                    </div>

                    <!-- Fee 2: Earnest Money Deposit (EMD) -->
                    <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                      <div class="flex items-center gap-3">
                        <div class="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                          &check;
                        </div>
                        <div>
                          <h4 class="text-xs sm:text-sm font-bold text-slate-900">
                            2. Earnest Money Deposit (EMD) <span class="text-rose-600">*</span>
                          </h4>
                          <p class="text-[11px] text-slate-500 mt-0.5">
                            Refundable security deposit for Training Provider / PIA empanelment proposal under MMKVY-RAJKVIK.
                          </p>
                        </div>
                      </div>
                      <span class="text-sm sm:text-base font-black text-slate-900">₹50,000</span>
                    </div>
                  </div>
                </div>

                <!-- 2. Select Payment Mode -->
                <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-2xs space-y-4">
                  <div class="pb-2 border-b border-slate-100">
                    <h3 class="text-sm sm:text-base font-bold text-slate-900">
                      2. Select Payment Mode
                    </h3>
                    <p class="text-xs text-slate-500 mt-0.5">
                      Choose your preferred payment method to complete the application fee payment.
                    </p>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <!-- UPI -->
                    <label
                      class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                      [class.border-[#0B3558]]="paymentMethod() === 'UPI'"
                      [class.bg-blue-50/40]="paymentMethod() === 'UPI'"
                      [class.border-slate-200]="paymentMethod() !== 'UPI'"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <input
                          type="radio"
                          name="payMode"
                          value="UPI"
                          [(ngModel)]="paymentMethod"
                          class="w-4 h-4 text-[#0B3558] focus:ring-[#0B3558]"
                        />
                        <span class="text-xs font-bold px-2 py-0.5 bg-blue-100 text-[#0B3558] rounded">Instant</span>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-slate-900">UPI</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</div>
                      </div>
                    </label>

                    <!-- Net Banking -->
                    <label
                      class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                      [class.border-[#0B3558]]="paymentMethod() === 'NetBanking'"
                      [class.bg-blue-50/40]="paymentMethod() === 'NetBanking'"
                      [class.border-slate-200]="paymentMethod() !== 'NetBanking'"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <input
                          type="radio"
                          name="payMode"
                          value="NetBanking"
                          [(ngModel)]="paymentMethod"
                          class="w-4 h-4 text-[#0B3558] focus:ring-[#0B3558]"
                        />
                        <span class="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Bank</span>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-slate-900">Net Banking</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">SBI, HDFC, ICICI, PNB, BoB &amp; 50+ Banks</div>
                      </div>
                    </label>

                    <!-- Debit / Credit Card -->
                    <label
                      class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                      [class.border-[#0B3558]]="paymentMethod() === 'Card'"
                      [class.bg-blue-50/40]="paymentMethod() === 'Card'"
                      [class.border-slate-200]="paymentMethod() !== 'Card'"
                    >
                      <div class="flex items-center justify-between mb-3">
                        <input
                          type="radio"
                          name="payMode"
                          value="Card"
                          [(ngModel)]="paymentMethod"
                          class="w-4 h-4 text-[#0B3558] focus:ring-[#0B3558]"
                        />
                        <span class="text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Cards</span>
                      </div>
                      <div>
                        <div class="text-xs font-bold text-slate-900">Debit / Credit Card</div>
                        <div class="text-[11px] text-slate-400 mt-0.5">RuPay, Visa, MasterCard, Maestro</div>
                      </div>
                    </label>

                  </div>
                </div>

              </div>

              <!-- Right Column: Payment Summary Card (Matching Screenshot 4) -->
              <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden sticky top-24">
                <div class="bg-[#0B3558] text-white p-4 flex items-center justify-between">
                  <h4 class="text-xs font-bold uppercase tracking-wider">Payment Summary</h4>
                  <span class="text-[10px] font-bold px-2 py-0.5 bg-white/10 rounded">MMKVY-RAJKVIK</span>
                </div>

                <div class="p-5 space-y-4 text-xs">
                  <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                    <span>Processing Fee</span>
                    <span class="font-bold text-slate-900">₹2,000</span>
                  </div>
                  <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                    <span>EMD Fee</span>
                    <span class="font-bold text-slate-900">₹50,000</span>
                  </div>

                  <div class="flex justify-between items-baseline pt-1">
                    <span class="text-sm font-bold text-slate-900">Total Payable Amount</span>
                    <span class="text-xl font-black text-[#0B3558]">₹52,000</span>
                  </div>

                  <div class="p-2.5 bg-slate-50 rounded-lg text-[11px] text-slate-500 font-medium">
                    Selected Method: <strong class="text-slate-800">{{ paymentMethod() }}</strong>
                  </div>

                  <!-- Proceed to Pay Action Button -->
                  <button
                    type="button"
                    [disabled]="isPaymentProcessing()"
                    (click)="triggerPayment()"
                    class="w-full py-3 px-4 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                  >
                    @if (isPaymentProcessing()) {
                      <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Connecting to e-GRAS...</span>
                    } @else {
                      <span>Proceed to Payment (₹52,000) &rarr;</span>
                    }
                  </button>
                </div>
              </div>

            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 4: SUBMISSION & TWO RECEIPTS (Payment + Acknowledgment)
             ==================================================================== -->
        @if (currentStep() === 4) {
          <div class="space-y-6">
            
            <!-- Success Confirmation Banner -->
            <div class="bg-linear-to-r from-emerald-600 to-teal-700 text-white rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
              <div class="flex items-center gap-5 text-center sm:text-left">
                <div class="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-2xl text-white shrink-0 mx-auto">
                  &check;
                </div>
                <div>
                  <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider">
                    Application Successfully Submitted &amp; Verified
                  </span>
                  <h2 class="text-xl sm:text-2xl font-black mt-1">
                    EOI Proposal Submitted Successfully!
                  </h2>
                  <p class="text-xs text-emerald-100 mt-1">
                    Application Reference: <strong class="font-mono text-white text-sm">APP-004661</strong> &bull; EOI Ref: <strong class="font-mono text-white">{{ schemeRefNo() }}</strong>
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <a
                  routerLink="/tender-status"
                  class="px-4 py-2.5 bg-white text-[#0B3558] hover:bg-emerald-50 rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  View in Tender Status &rarr;
                </a>
              </div>
            </div>

            <!-- Two Receipts Switcher Bar -->
            <div class="flex items-center gap-3 border-b border-slate-200 pb-2">
              <button
                type="button"
                (click)="activeReceiptTab.set('payment')"
                class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                [class.bg-[#0B3558]]="activeReceiptTab() === 'payment'"
                [class.text-white]="activeReceiptTab() === 'payment'"
                [class.bg-slate-100]="activeReceiptTab() !== 'payment'"
                [class.text-slate-700]="activeReceiptTab() !== 'payment'"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>1. Official Payment Receipt (e-GRAS Challan)</span>
              </button>

              <button
                type="button"
                (click)="activeReceiptTab.set('acknowledgment')"
                class="px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-2"
                [class.bg-[#0B3558]]="activeReceiptTab() === 'acknowledgment'"
                [class.text-white]="activeReceiptTab() === 'acknowledgment'"
                [class.bg-slate-100]="activeReceiptTab() !== 'acknowledgment'"
                [class.text-slate-700]="activeReceiptTab() !== 'acknowledgment'"
              >
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
                <span>2. Application Acknowledgment Receipt</span>
              </button>
            </div>

            <!-- RECEIPT 1: E-TREASURY PAYMENT RECEIPT -->
            @if (activeReceiptTab() === 'payment') {
              <div class="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-sm space-y-6">
                <!-- Receipt Header -->
                <div class="text-center pb-4 border-b-2 border-slate-200 space-y-1">
                  <div class="text-[10px] font-black tracking-wider uppercase text-slate-500">
                    GOVERNMENT OF RAJASTHAN &bull; FINANCE DEPARTMENT
                  </div>
                  <h3 class="text-base sm:text-lg font-black text-[#0B3558]">
                    Online Government Receipts Accounting System (e-GRAS)
                  </h3>
                  <p class="text-xs text-slate-500">Official E-Treasury Cyber Payment Challan Receipt</p>
                </div>

                <!-- Challan Details Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span class="text-slate-400 block font-medium">GRAS Challan Number</span>
                    <span class="font-mono font-bold text-slate-900 text-sm">GRAS-RJ-2026-992140</span>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span class="text-slate-400 block font-medium">Bank Transaction Ref</span>
                    <span class="font-mono font-bold text-slate-900 text-sm">TXN-ISMS-2026-004520402</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Remitter / Agency Name</span>
                    <span class="font-bold text-slate-800">DMR SAKSHAM (DMR Enterprises Private Limited)</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Department / Office</span>
                    <span class="font-bold text-slate-800">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Scheme</span>
                    <span class="font-bold text-slate-800">{{ schemeTitle() }}</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Date &amp; Time</span>
                    <span class="font-bold text-slate-800">21-Sep-2026 18:35 IST</span>
                  </div>
                </div>

                <!-- Fee Breakdown Table -->
                <div class="border border-slate-200 rounded-lg overflow-hidden">
                  <table class="w-full text-xs text-left border-collapse">
                    <thead class="bg-slate-50 text-slate-700 font-bold uppercase text-[10px] border-b border-slate-200">
                      <tr>
                        <th class="py-2.5 px-4">Major Head / Description</th>
                        <th class="py-2.5 px-4 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 font-medium">
                      <tr>
                        <td class="py-2.5 px-4">Earnest Money Deposit (EMD) - Refundable Security</td>
                        <td class="py-2.5 px-4 text-right font-mono font-bold">₹ 50,000.00</td>
                      </tr>
                      <tr>
                        <td class="py-2.5 px-4">Administrative Scrutiny Processing Fee - Non Refundable</td>
                        <td class="py-2.5 px-4 text-right font-mono font-bold">₹ 2,000.00</td>
                      </tr>
                      <tr class="bg-slate-50 font-bold text-slate-900">
                        <td class="py-3 px-4 text-sm">Total Paid Amount:</td>
                        <td class="py-3 px-4 text-right font-mono text-base text-[#0B3558]">₹ 52,000.00</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <!-- Status & Actions -->
                <div class="flex items-center justify-between pt-2">
                  <span class="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    &check; Payment Successful &bull; Real-time Treasury Credit Verified
                  </span>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="printPage()"
                      class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Print Receipt
                    </button>
                    <button
                      type="button"
                      (click)="downloadDocMock('Payment_Receipt_GRAS.pdf')"
                      class="px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>
              </div>
            }

            <!-- RECEIPT 2: APPLICATION ACKNOWLEDGMENT RECEIPT -->
            @if (activeReceiptTab() === 'acknowledgment') {
              <div class="bg-white border-2 border-slate-200 rounded-2xl p-6 sm:p-8 max-w-3xl mx-auto shadow-sm space-y-6">
                <!-- Header -->
                <div class="text-center pb-4 border-b-2 border-slate-200 space-y-1">
                  <div class="text-[10px] font-black tracking-wider uppercase text-slate-500">
                    RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)
                  </div>
                  <h3 class="text-base sm:text-lg font-black text-[#0B3558]">
                    EOI Proposal Submission Acknowledgment Slip
                  </h3>
                  <p class="text-xs text-slate-500">Integrated Skill Management System 2.0 (ISMS)</p>
                </div>

                <!-- Acknowledgment Grid -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div class="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                    <span class="text-blue-500 block font-bold text-[10px] uppercase">Official Application Ref No.</span>
                    <span class="font-mono font-black text-[#0B3558] text-base">APP-004661</span>
                  </div>
                  <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
                    <span class="text-slate-400 block font-medium">Submission Timestamp</span>
                    <span class="font-mono font-bold text-slate-800 text-xs">21-Sep-2026 18:35:42 IST</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Applicant Agency</span>
                    <span class="font-bold text-slate-800">DMR ENTERPRISES PRIVATE LIMITED</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Registration / CIN Number</span>
                    <span class="font-mono font-bold text-slate-800">07AAECD8566H1ZC</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Scheme &amp; Category</span>
                    <span class="font-bold text-slate-800">MMKVY (Category I: RAJKVIK)</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Target Districts Committed</span>
                    <span class="font-bold text-slate-800">5 Districts (50 Batches / 1,250 Candidates)</span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Initial Scrutiny Status</span>
                    <span class="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 inline-block">
                      Technical Opening Initiated
                    </span>
                  </div>
                  <div>
                    <span class="text-slate-400 block font-medium">Fee Payment Ref</span>
                    <span class="font-mono text-slate-700 font-bold">TXN-ISMS-2026-004520402 (₹52,000)</span>
                  </div>
                </div>

                <!-- Footer Note & Actions -->
                <div class="pt-4 border-t border-slate-200 flex items-center justify-between flex-wrap gap-3">
                  <div class="text-[11px] text-slate-500 max-w-sm">
                    Keep this acknowledgment slip for all future correspondence. Track progress in real-time under <strong>Tender Status</strong>.
                  </div>
                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      (click)="printPage()"
                      class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Print Acknowledgment
                    </button>
                    <button
                      type="button"
                      (click)="downloadDocMock('EOI_Acknowledgment_APP-004661.pdf')"
                      class="px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Download PDF
                    </button>
                  </div>
                </div>

              </div>
            }

          </div>
        }

      </main>

      <!-- ====================================================================
           MODAL: PAYMENT SUCCESSFUL CONFIRMATION POPUP (Triggered on Step 3)
           ==================================================================== -->
      @if (showPaymentSuccessModal()) {
        <div
          class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 sm:p-8 text-center space-y-5 animate-in zoom-in-95 duration-200 overflow-hidden">
            <!-- Top Accent line -->
            <div class="absolute top-0 left-0 right-0 h-1.5 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

            <!-- Green Checkmark Icon with soft pulse -->
            <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner mt-2">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <!-- Title & Message -->
            <div>
              <span class="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold uppercase tracking-wider border border-emerald-200">
                Payment Verified
              </span>
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 mt-2">
                Payment Successful!
              </h3>
              <p class="text-xs text-slate-500 mt-1">
                Your EMD and Processing Fee of <strong>₹52,000</strong> have been successfully processed via e-GRAS Cyber Treasury.
              </p>
            </div>

            <!-- Receipt Reference Strip -->
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
              <div class="flex justify-between">
                <span class="text-slate-400">Transaction Ref:</span>
                <span class="font-mono font-bold text-slate-800">TXN-ISMS-2026-004520402</span>
              </div>
              <div class="flex justify-between">
                <span class="text-slate-400">GRAS Challan No:</span>
                <span class="font-mono font-bold text-slate-800">GRAS-RJ-2026-992140</span>
              </div>
              <div class="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                <span>Amount Paid:</span>
                <span class="text-emerald-700">₹ 52,000.00</span>
              </div>
            </div>

            <!-- Action Button: Proceed to Step 4 -->
            <button
              type="button"
              (click)="dismissPaymentSuccessAndProceed()"
              class="w-full py-3 px-4 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Submission &amp; Receipts &rarr;</span>
            </button>

          </div>
        </div>
      }

    </div>
  `
})
export class SchemeFormComponent {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private otrFormService = inject(OtrFormService);

  readonly otrData = this.otrFormService.formData;

  currentStep = signal<number>(1);
  declarationAgreed = false;
  paymentMethod = signal<'UPI' | 'NetBanking' | 'Card'>('UPI');
  isPaymentProcessing = signal<boolean>(false);
  showPaymentSuccessModal = signal<boolean>(false);
  activeReceiptTab = signal<'payment' | 'acknowledgment'>('payment');

  // Scheme Meta Signals
  schemeRefNo = signal<string>('RSLDC/EOI/2026/MMKVY-01');
  schemeTitle = signal<string>('Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)');
  schemeCode = signal<string>('MMKVY-RAJKVIK');
  schemeCategory = signal<string>('Category I: RAJKVIK');
  schemeEmdFee = signal<string>('₹50,000');
  schemeProcessFee = signal<string>('₹2,000');

  // =========================================================================
  // Subsection 1: Training Centres (From PDF Page 2)
  // =========================================================================
  readonly trainingCentres: TrainingCenterItem[] = [
    {
      id: 'tc-1',
      district: 'Alwar',
      centerName: 'DMR ENTERPRISES PVT. LTD',
      telephone: '0144-2301948',
      classrooms: 2,
      practicalRooms: 2,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Near By Navratan Hotel, Bhugor, Byepass, Alwar'
    },
    {
      id: 'tc-2',
      district: 'Khairthal-Tijara',
      centerName: 'DMR ENTERPRISES PVT. LTD',
      telephone: '01460-221049',
      classrooms: 3,
      practicalRooms: 3,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Ward No 12, Behind LIC Office, Khairthal, Alwar'
    },
    {
      id: 'tc-3',
      district: 'Udaipur',
      centerName: 'DMR ENTERPRISES PVT. LTD',
      telephone: '0294-2490184',
      classrooms: 3,
      practicalRooms: 3,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'P.N. 5A, Main Road, Near Police Chowki, Aayad, Udaipur'
    },
    {
      id: 'tc-4',
      district: 'Sri Ganganagar',
      centerName: 'DMR ENTERPRISES PVT. LTD',
      telephone: '0154-2481029',
      classrooms: 2,
      practicalRooms: 2,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Chak 3A, Chhoti Sadbhawnanagar, Sri Ganganagar'
    },
    {
      id: 'tc-5',
      district: 'Jaipur',
      centerName: 'DMR ENTERPRISES PVT. LTD',
      telephone: '0141-2780194',
      classrooms: 3,
      practicalRooms: 3,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Parshwnath Naray City, Mansarovar Ext, Jaipur'
    },
    {
      id: 'tc-6',
      district: 'Sikar',
      centerName: 'DMR ENTERPRISES PVT. LTD',
      telephone: '01572-250918',
      classrooms: 3,
      practicalRooms: 3,
      washrooms: 'Yes',
      labInfra: 'Available',
      fullAddress: 'Near Bus Stand, Sikar Main Road, Fatehpur, Sikar'
    }
  ];

  // =========================================================================
  // Subsection 2: Past 3 Years Financial Turnover (From PDF Page 4)
  // =========================================================================
  readonly financialTurnover: TurnoverYear[] = [
    { year: '2021 - 2022', totalTurnover: '9,21,00,536', skillTurnover: '9,21,00,536' },
    { year: '2022 - 2023', totalTurnover: '2,39,94,320', skillTurnover: '2,39,94,320' },
    { year: '2023 - 2024', totalTurnover: '42,40,154', skillTurnover: '42,40,154' }
  ];

  // =========================================================================
  // Subsection 3: Placement Records (From PDF Page 4)
  // =========================================================================
  readonly placementRecords: TrainingPlacementRecord[] = [
    { sector: 'Healthcare', year: '2022 - 2023', trained: 570, placed: 476 },
    { sector: 'Garment Making', year: '2023 - 2024', trained: 150, placed: 105 },
    { sector: 'Handicraft & Local Skills', year: '2024 - 2025', trained: 810, placed: 441 }
  ];

  // =========================================================================
  // Subsection 4: Proposed Annual Action Plan (From PDF Page 4 & 5)
  // =========================================================================
  readonly actionPlans: ActionPlanDistrict[] = [
    {
      id: 'ap-1',
      district: 'Khairthal-Tijara',
      sdcCount: 2,
      location: 'KHAIRTHAL - TIJARA',
      sectors: 'Computer Hardware, Receptionist, Folk Music, Phad Painting',
      mode: 'Both',
      batches: 10
    },
    {
      id: 'ap-2',
      district: 'Kotputli-Behror',
      sdcCount: 2,
      location: 'KOTPUTLI - BEHROR',
      sectors: 'Computer Hardware, Receptionist, DEO, Handicraft Skills',
      mode: 'Both',
      batches: 10
    },
    {
      id: 'ap-3',
      district: 'Salumber',
      sdcCount: 2,
      location: 'SALUMBAR',
      sectors: 'Computer Hardware, Receptionist, Indian Culture Multi-skills',
      mode: 'Both',
      batches: 10
    },
    {
      id: 'ap-4',
      district: 'Udaipur',
      sdcCount: 2,
      location: 'UDAIPUR',
      sectors: 'Computer Hardware, DEO, Folk Music of Western Rajasthan',
      mode: 'Both',
      batches: 10
    },
    {
      id: 'ap-5',
      district: 'Alwar',
      sdcCount: 2,
      location: 'ALWAR',
      sectors: 'Computer Hardware, Receptionist, Phad Painting, Multi-skills',
      mode: 'Both',
      batches: 10
    }
  ];

  // =========================================================================
  // Subsection 5: Mandatory EOI Document Checklist (From PDF Page 5 & Screenshot 3)
  // =========================================================================
  readonly eoiDocuments: EoiDocumentItem[] = [
    {
      id: 1,
      name: 'Company Document',
      description: 'Certificate of Incorporation / Society Reg / Trust Deed / Entity PAN',
      fileName: 'company_registration_incorporation_proof.pdf',
      fileSize: '2.1 MB',
      uploadedDate: '08-Sep-2026',
      isMandatory: true,
      status: 'uploaded'
    },
    {
      id: 2,
      name: 'Previous Experience',
      description: 'Past skill training & placement track record certificates / work orders',
      fileName: 'past_skill_training_track_record_letters.pdf',
      fileSize: '3.4 MB',
      uploadedDate: '08-Sep-2026',
      isMandatory: true,
      status: 'uploaded'
    },
    {
      id: 3,
      name: 'Audited Financial Statements',
      description: 'Audited balance sheet and profit & loss statements for last three consecutive financial years',
      fileName: 'audited_financial_statements_3years.pdf',
      fileSize: '4.2 MB',
      uploadedDate: '08-Sep-2026',
      isMandatory: true,
      status: 'uploaded'
    },
    {
      id: 4,
      name: 'Non-Blacklisted Affidavit',
      description: 'Notarized self-affidavit on ₹100 stamp paper for not being blacklisted by any Government department',
      fileName: 'non_blacklisted_notarized_affidavit.pdf',
      fileSize: '1.1 MB',
      uploadedDate: '08-Sep-2026',
      isMandatory: true,
      status: 'uploaded'
    }
  ];

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['refNo']) this.schemeRefNo.set(params['refNo']);
      if (params['title']) this.schemeTitle.set(params['title']);
      if (params['category']) this.schemeCategory.set(params['category']);
      if (params['emdFee']) this.schemeEmdFee.set(params['emdFee']);
      if (params['processFee']) this.schemeProcessFee.set(params['processFee']);
    });
  }

  getPlacementRatio(record: TrainingPlacementRecord): number {
    if (!record.trained) return 0;
    return Math.round((record.placed / record.trained) * 100);
  }

  goToStep(stepNumber: number): void {
    this.currentStep.set(stepNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  goBackToSchemes(): void {
    this.router.navigate(['/tenders']);
  }

  previewDoc(doc: EoiDocumentItem): void {
    alert(`Viewing document: ${doc.fileName}`);
  }

  changeDoc(doc: EoiDocumentItem): void {
    alert(`Select a replacement PDF file for: ${doc.name}`);
  }

  removeDoc(doc: EoiDocumentItem): void {
    doc.status = 'pending';
  }

  triggerPayment(): void {
    this.isPaymentProcessing.set(true);

    setTimeout(() => {
      this.isPaymentProcessing.set(false);
      this.showPaymentSuccessModal.set(true);
    }, 1200);
  }

  dismissPaymentSuccessAndProceed(): void {
    this.showPaymentSuccessModal.set(false);
    this.goToStep(4);
  }

  printPage(): void {
    window.print();
  }

  downloadDocMock(fileName: string): void {
    alert(`Downloading official PDF: ${fileName}`);
  }
}
