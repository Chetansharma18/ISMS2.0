import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiStateService, Scheme, SchemeDocument, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../layout/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-scheme-listing',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIf,
    NgFor,
    AsyncPipe,
    DecimalPipe,
    FormsModule,
    SidebarComponent,
    HeaderComponent
  ],
  template: `
    <div class="h-screen flex flex-col bg-[#F6F8FA] font-sans text-[#172B3A] antialiased overflow-hidden">
      <!-- Unified Post-Login Header -->
      <app-header class="shrink-0"></app-header>
      
      <div class="flex flex-1 min-h-0 w-full overflow-hidden">
        <!-- PERSISTENT PORTAL SIDEBAR -->
        <app-sidebar class="hidden md:block shrink-0 h-full"></app-sidebar>

        <main class="flex-1 min-h-0 min-w-0 w-full p-6 overflow-y-auto overflow-x-hidden bg-[#F6F8FA]">

          <!-- ================================================================= -->
          <!-- VIEW 1: ACTIVE SCHEMES & TENDERS TABLE VIEW                      -->
          <!-- ================================================================= -->
          <div *ngIf="viewMode === 'table'" class="space-y-4">
            
            <!-- Page Heading Bar -->
            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#D9E1E8] mb-6">
              <h1 class="text-[28px] font-bold tracking-tight text-[#0B3558] leading-[36px]">
                Active Schemes &amp; Tenders
              </h1>
            </div>

            <!-- Profile Incomplete Alert Banner for New Applicant -->
            <div *ngIf="userProfile$ | async as profile">
              <div *ngIf="profile.role === 'applicant' && (!profile.isRegistered || profile.userState === 'new')" 
                class="bg-amber-50 border border-amber-300 border-l-4 border-l-amber-500 p-4 rounded-xs shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div class="flex items-start gap-3">
                
                  <div>
                    <div class="font-bold text-[#002244] text-xs sm:text-sm">Please complete your profile first</div>
                    <div class="text-[11.5px] text-amber-900 mt-0.5">
                      Your entity profile is currently incomplete. Please complete your profile to view full tender specifications and submit EOI proposals.
                    </div>
                  </div>
                </div>
                <button 
                  type="button" 
                  (click)="goToRegistration()"
                  class="shrink-0 px-4 py-2 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer">
                  <span>Complete Profile Now</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            <!-- Crisp Government Schemes Table -->
            <div class="bg-white border border-slate-200 shadow-sm rounded-xs overflow-hidden">
              <div class="w-full overflow-x-auto">
                <table class="w-full min-w-[900px] table-fixed text-left border-collapse">
                  <thead>
                    <tr class="bg-[#002244] text-white text-xs font-bold tracking-wide uppercase border-b-2 border-amber-500">
                      <th class="p-2.5 w-[4%] text-center border-r border-[#0e3b6e] whitespace-nowrap">S.No</th>
                      <th class="p-2.5 w-[17%] border-r border-[#0e3b6e] whitespace-nowrap">EOI Reference No.</th>
                      <th class="p-2.5 w-[26%] border-r border-[#0e3b6e]">Scheme &amp; Department Chain</th>
                      <th class="p-2.5 w-[15%] border-r border-[#0e3b6e] text-center whitespace-nowrap">Category</th>
                      <th class="p-2.5 w-[14%] border-r border-[#0e3b6e] whitespace-nowrap">Date Published</th>
                      <th class="p-2.5 w-[14%] border-r border-[#0e3b6e] whitespace-nowrap">Closing Date</th>
                      <th class="p-2.5 w-[10%] text-center whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 text-slate-800 font-['Poppins',sans-serif]">
                    
                    <tr 
                      *ngFor="let scheme of filteredSchemes; let idx = index" 
                      class="hover:bg-blue-50/60 transition-colors group">
                      
                      <!-- 1. S.No -->
                      <td class="p-2.5 text-center font-bold text-slate-700 text-xs sm:text-[13px] border-r border-slate-200 align-middle bg-slate-50/40">
                        {{ idx + 1 }}
                      </td>

                      <!-- 2. EOI Reference No -->
                      <td class="p-2.5 border-r border-slate-200 align-middle whitespace-nowrap">
                        <div class="font-bold text-[#002244] text-xs sm:text-[13px] font-mono leading-snug">
                          {{ scheme.eoiReferenceNo }}
                        </div>
                      </td>

                      <!-- 3. Scheme & Department Chain (Only Scheme Name) -->
                      <td class="p-2.5 border-r border-slate-200 align-middle">
                        <div 
                          (click)="selectScheme(scheme)"
                          class="font-bold text-[#002244] hover:text-blue-800 text-xs sm:text-[13px] leading-snug cursor-pointer group-hover:underline line-clamp-2"
                          [title]="scheme.name">
                          {{ scheme.name }}
                        </div>
                      </td>

                      <!-- 4. Category (Only Category Name: RAJKVIK, SAKSHM, SAMARTH, etc.) -->
                      <td class="p-2.5 border-r border-slate-200 align-middle text-center whitespace-nowrap">
                        <span class="text-xs sm:text-[13px] font-semibold text-slate-700">
                          {{ getCategoryName(scheme.schemeCategory) }}
                        </span>
                      </td>

                      <!-- 5. Date of EOI Published (Date Only) -->
                      <td class="p-2.5 border-r border-slate-200 align-middle">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span class="text-xs sm:text-[13px] font-bold text-slate-800 whitespace-nowrap">
                            {{ getSplitDate(scheme.ePublishedDate).date }}
                          </span>
                        </div>
                      </td>

                      <!-- 6. Closing Date of EOI (Simple Neutral Text - No Red) -->
                      <td class="p-2.5 border-r border-slate-200 align-middle">
                        <div class="flex items-center gap-2">
                          <svg class="w-4 h-4 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          <div class="leading-tight">
                            <div class="text-xs sm:text-[13px] font-bold text-slate-800 whitespace-nowrap">{{ getSplitDate(scheme.closingDate).date }}</div>
                            <div class="text-[11px] text-slate-500 font-medium">{{ getSplitDate(scheme.closingDate).time }}</div>
                          </div>
                        </div>
                      </td>

                      <!-- 7. Actions: View Tender Details Only -->
                      <td class="p-2.5 align-middle text-center whitespace-nowrap">
                        <div class="flex items-center justify-center">
                          <button 
                            type="button"
                            (click)="selectScheme(scheme)"
                            class="text-[#002244] hover:text-blue-700 hover:underline text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer transition-colors bg-transparent border-0 py-1 px-3 rounded hover:bg-slate-100"
                            title="View Tender Details">
                            <svg class="w-3.5 h-3.5 text-[#002244]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View</span>
                          </button>
                        </div>
                      </td>

                    </tr>

                    <!-- Empty State if no schemes match filter -->
                    <tr *ngIf="filteredSchemes.length === 0">
                      <td colspan="7" class="p-8 text-center text-slate-500">
                        <div class="text-sm font-bold text-slate-700">No tenders matched your search criteria</div>
                        <div class="text-xs text-slate-500 mt-1">Try resetting search filters or keywords</div>
                        <button 
                          type="button"
                          (click)="resetFilters()" 
                          class="mt-3 px-4 py-1.5 bg-[#002244] text-white text-xs font-bold rounded-xs">
                          Reset All Filters
                        </button>
                      </td>
                    </tr>

                  </tbody>
                </table>
              </div>
            </div>

          </div>

          <!-- ================================================================= -->
          <!-- VIEW 2: EOI DETAILS & SCHEME DOCUMENTS VIEW                     -->
          <!-- ================================================================= -->
          <div *ngIf="viewMode === 'details' && selectedScheme" class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Window Navigation & Scheme Title Box -->
            <div class="space-y-3">
              
              <!-- Top Row: Breadcrumbs -->
              <div class="flex items-center gap-2 text-xs font-['Poppins',sans-serif]">
                <button 
                  type="button"
                  (click)="showTable()" 
                  class="text-blue-700 hover:text-blue-900 font-semibold flex items-center gap-1 cursor-pointer">
                  <span>←</span>
                  <span>All Tenders List</span>
                </button>
                <span class="text-slate-400">/</span>
                <span class="text-slate-500">EOI Schemes</span>
                <span class="text-slate-400">/</span>
                <span class="text-slate-800 font-semibold">{{ selectedScheme.schemeCode }}</span>
              </div>

              <!-- Page Heading Bar with Apply Button in Header -->
              <div class="bg-white border border-slate-200 shadow-xs p-3.5 sm:p-4 rounded-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#002244]">
                  {{ selectedScheme.name }}
                </h1>
                <button
                  type="button"
                  (click)="onApplyClicked(selectedScheme)"
                  class="shrink-0 px-6 py-2.5 bg-[#0B3558] hover:bg-[#082A46] active:scale-98 text-white font-bold text-sm rounded-xs shadow-sm transition-all flex items-center gap-2 cursor-pointer tracking-wide">
                  <span>Apply for this Scheme</span>
                  <span class="text-amber-400 font-extrabold text-base">→</span>
                </button>
              </div>

            </div>

            <!-- Full-Width Content: Official Documents & Milestones Table -->
            <div class="space-y-6">
              
              <!-- SECTION 1: Scheme Related Official Documents & RFP Downloads -->
              <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 sm:p-6">
                
                <div class="pb-3 border-b border-slate-200">
                  <h2 class="text-base font-bold text-[#002244] flex items-center gap-2 font-['Poppins',sans-serif]">
                    <svg class="w-5 h-5 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    <span>Scheme Related Official Documents &amp; RFP</span>
                  </h2>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Download standard tender terms, technical specifications, and financial bid schedules for {{ selectedScheme.schemeCode }}.
                  </p>
                </div>

                <!-- Documents List Container: Name, Size, Date of Publish with Open PDF & Download -->
                <div class="mt-4 space-y-3">
                  <div 
                    *ngFor="let doc of selectedScheme.documents"
                    class="border border-slate-200 hover:border-[#002244] p-3.5 rounded-xs bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                    
                    <!-- Doc Meta: Name, Size, Date of Publish -->
                    <div class="flex items-center gap-3 min-w-0">
                      <!-- File Type Badge -->
                      <div 
                        [ngClass]="{
                          'bg-red-100 text-red-800 border-red-300': doc.type === 'PDF',
                          'bg-emerald-100 text-emerald-800 border-emerald-300': doc.type === 'EXCEL',
                          'bg-blue-100 text-blue-800 border-blue-300': doc.type === 'DOC'
                        }"
                        class="w-10 h-10 flex-shrink-0 rounded-xs border flex flex-col items-center justify-center font-bold">
                        <span class="text-xs leading-none font-['Poppins',sans-serif]">{{ doc.type }}</span>
                      </div>

                      <div class="min-w-0">
                        <div class="font-bold text-xs sm:text-sm text-[#002244] group-hover:text-blue-800 transition-colors leading-snug font-['Poppins',sans-serif]">
                          {{ doc.title }}
                        </div>
                        <div class="flex items-center gap-3 mt-1 text-[11px] text-slate-500 font-['Poppins',sans-serif]">
                          <span>Size: <strong class="text-slate-700">{{ doc.size }}</strong></span>
                          <span>•</span>
                          <span>Published: <strong class="text-slate-700">{{ doc.publishedDate }}</strong></span>
                        </div>
                      </div>
                    </div>

                    <!-- Actions: Direct PDF Download -->
                    <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
                      <button 
                        type="button"
                        (click)="downloadDocument(doc)"
                        class="px-3.5 py-1.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer font-['Poppins',sans-serif]">
                        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        <span>Download</span>
                      </button>
                    </div>

                  </div>
                </div>

              </div>

              <!-- SECTION 2: Critical EOI Milestones & Schedule Matrix in Proper Table Form (No Emojis) -->
              <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 sm:p-6 space-y-4">
                
                <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                  <h2 class="text-base font-bold text-[#002244] flex items-center gap-2 font-['Poppins',sans-serif]">
                    <svg class="w-5 h-5 text-[#002244]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Critical EOI Milestones &amp; Schedule Matrix</span>
                  </h2>
                </div>

                <!-- Structured Milestones Table -->
                <div class="overflow-x-auto border border-slate-200 rounded-xs shadow-2xs">
                  <table class="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr class="bg-[#002244] text-white font-bold border-b-2 border-amber-500 text-[11.5px] tracking-wide font-['Poppins',sans-serif]">
                        <th class="p-3 text-center w-14 border-r border-[#0e3b6e]">S.No</th>
                        <th class="p-3 min-w-[220px] border-r border-[#0e3b6e]">Milestone / Event Stage</th>
                        <th class="p-3 min-w-[200px] border-r border-[#0e3b6e]">Date &amp; Time</th>
                        <th class="p-3 min-w-[280px]">Details &amp; Remarks</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-200 text-slate-800 font-['Poppins',sans-serif]">
                      
                      <!-- Milestone 1 -->
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50/50">1</td>
                        <td class="p-3 font-semibold text-[#002244] border-r border-slate-200">
                          Date of EOI Published
                        </td>
                        <td class="p-3 font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                          {{ selectedScheme.ePublishedDate }}
                        </td>
                        <td class="p-3 text-slate-600">
                          Published on official state tender bulletin
                        </td>
                      </tr>

                      <!-- Milestone 2 -->
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50/50">2</td>
                        <td class="p-3 font-semibold text-[#002244] border-r border-slate-200">
                          Pre-Bid Meeting
                        </td>
                        <td class="p-3 font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                          {{ selectedScheme.preBidMeetingDate || '15-Sep-2026 11:30 AM' }}
                        </td>
                        <td class="p-3 text-slate-600">
                          Held at RSLDC Head Office, Jhalana Doongri, Jaipur
                        </td>
                      </tr>

                      <!-- Milestone 3 -->
                      <tr class="hover:bg-slate-50 transition-colors bg-amber-50/20">
                        <td class="p-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50/50">3</td>
                        <td class="p-3 font-bold text-[#002244] border-r border-slate-200">
                          Closing Date of EOI Submission
                        </td>
                        <td class="p-3 font-bold text-[#92400e] border-r border-slate-200 whitespace-nowrap">
                          {{ selectedScheme.closingDate }}
                        </td>
                        <td class="p-3 font-medium text-amber-900">
                          Strict deadline: No proposals accepted after portal closing time.
                        </td>
                      </tr>

                      <!-- Milestone 4 -->
                      <tr class="hover:bg-slate-50 transition-colors">
                        <td class="p-3 text-center font-bold text-slate-600 border-r border-slate-200 bg-slate-50/50">4</td>
                        <td class="p-3 font-semibold text-[#002244] border-r border-slate-200">
                          Technical Bid Opening Date
                        </td>
                        <td class="p-3 font-semibold text-slate-800 border-r border-slate-200 whitespace-nowrap">
                          {{ selectedScheme.openingDate }}
                        </td>
                        <td class="p-3 text-slate-600">
                          Online scrutiny &amp; empanelment desk opening
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- SECTION 3: Submission Deadline & Financial Parameters (Clean Gov Style) -->
              <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 sm:p-6 space-y-4">
                <div class="pb-3 border-b border-slate-200">
                  <h2 class="text-base font-bold text-[#002244] flex items-center gap-2 font-['Poppins',sans-serif]">
                    <svg class="w-5 h-5 text-[#002244]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="2" y="4" width="20" height="16" rx="1"></rect>
                      <line x1="6" y1="8" x2="6" y2="8"></line>
                      <line x1="10" y1="8" x2="18" y2="8"></line>
                      <line x1="6" y1="12" x2="6" y2="12"></line>
                      <line x1="10" y1="12" x2="18" y2="12"></line>
                      <line x1="6" y1="16" x2="6" y2="16"></line>
                      <line x1="10" y1="16" x2="18" y2="16"></line>
                    </svg>
                    <span>Submission &amp; Financial Parameters</span>
                  </h2>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <!-- 1. Submission Deadline -->
                  <div class="border border-slate-200 p-4 rounded-xs bg-slate-50/60">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Submission Deadline (Closing Date)
                    </div>
                    <div class="text-sm sm:text-base font-bold text-[#002244] mt-1.5 font-['Poppins',sans-serif]">
                      {{ selectedScheme.closingDate }}
                    </div>
                    <div class="text-xs text-slate-600 font-medium mt-1">
                      Status: Open for Proposal Submission ({{ selectedScheme.daysRemaining || 20 }} Days Left)
                    </div>
                  </div>

                  <!-- 2. EMD Fee -->
                  <div class="border border-slate-200 p-4 rounded-xs bg-slate-50/60">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      EMD Fee
                    </div>
                    <div class="text-sm sm:text-base font-bold text-[#002244] mt-1.5 font-['Poppins',sans-serif]">
                      ₹{{ selectedScheme.emdAmount | number:'1.0-0' }}
                    </div>
                    <div class="text-xs text-emerald-700 font-medium mt-1">
                      ✓ 100% Refundable
                    </div>
                  </div>

                  <!-- 3. Process Fee -->
                  <div class="border border-slate-200 p-4 rounded-xs bg-slate-50/60">
                    <div class="text-xs font-bold text-slate-500 uppercase tracking-wider">
                      Process Fee
                    </div>
                    <div class="text-sm sm:text-base font-bold text-[#002244] mt-1.5 font-['Poppins',sans-serif]">
                      ₹{{ selectedScheme.processingFee | number:'1.0-0' }}
                    </div>
                    <div class="text-xs text-slate-500 font-medium mt-1">
                      Non-Refundable
                    </div>
                  </div>
                </div>
              </div>



            </div>

          </div>

          <!-- ================================================================= -->
          <!-- VIEW 3: IN-PORTAL PDF DOCUMENT VIEWER                            -->
          <!-- ================================================================= -->
          <div *ngIf="viewMode === 'pdf' && activePdfDoc && selectedScheme" class="space-y-4 animate-in fade-in duration-150">
            
            <!-- Sticky Navigation Bar with Back Option & Download Button -->
            <div class="bg-[#002244] text-white p-4 rounded-xs shadow-md border-b-4 border-amber-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div class="flex items-center gap-3">
                <button 
                  type="button"
                  (click)="viewMode = 'details'" 
                  class="px-3.5 py-1.5 bg-white text-[#002244] hover:bg-slate-100 text-xs font-bold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs font-['Poppins',sans-serif]">
                  <span>←</span>
                  <span>Back to Scheme Details</span>
                </button>
                <div class="text-xs text-white/80 hidden sm:block">
                  Viewing: <strong class="text-white">{{ activePdfDoc.title }}</strong>
                </div>
              </div>

              <div class="flex items-center gap-2 self-stretch sm:self-auto justify-end">
                <button 
                  type="button"
                  (click)="downloadDocument(activePdfDoc)" 
                  class="px-4 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#002244] text-xs font-bold rounded-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer font-['Poppins',sans-serif]">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            <!-- Official PDF Document Paper Sheet -->
            <div class="bg-slate-100 p-3 sm:p-8 rounded-xs border border-slate-300 shadow-inner flex justify-center">
              <div class="bg-white border border-slate-300 shadow-lg max-w-3xl w-full p-6 sm:p-12 text-slate-800 font-['Poppins',sans-serif] space-y-6">
                
                <!-- Document Header (Emblem & Dept Details) -->
                <div class="text-center pb-6 border-b-2 border-[#002244] space-y-1.5">
                  <div class="text-xs font-bold tracking-widest text-slate-500 uppercase">
                    Government of Rajasthan
                  </div>
                  <div class="text-base sm:text-lg font-bold text-[#002244]">
                    Rajasthan Skill and Livelihoods Development Corporation (RSLDC)
                  </div>
                  <div class="text-[11px] text-slate-500">
                    EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004
                  </div>
                  <div class="inline-block mt-2 px-3 py-1 bg-[#002244] text-white text-xs font-bold rounded-2xs uppercase tracking-wider">
                    Official {{ activePdfDoc.type }} Document
                  </div>
                </div>

                <!-- Document Meta Bar -->
                <div class="bg-slate-50 border border-slate-200 p-3.5 rounded-xs grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <span class="text-slate-500 block text-[10.5px]">Document Title:</span>
                    <strong class="text-slate-800 text-[11.5px]">{{ activePdfDoc.title }}</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[10.5px]">Scheme Code &amp; Ref:</span>
                    <strong class="text-slate-800 text-[11.5px]">{{ selectedScheme.schemeCode }} ({{ selectedScheme.eoiReferenceNo }})</strong>
                  </div>
                  <div>
                    <span class="text-slate-500 block text-[10.5px]">Publication Date &amp; Size:</span>
                    <strong class="text-slate-800 text-[11.5px]">{{ activePdfDoc.publishedDate }} · {{ activePdfDoc.size }}</strong>
                  </div>
                </div>

                <!-- Document Content Body -->
                <div class="space-y-4 text-xs leading-relaxed text-slate-700">
                  <h3 class="text-sm font-bold text-[#002244] uppercase tracking-wide border-b border-slate-200 pb-1">
                    1. Scope of Expression of Interest (EOI)
                  </h3>
                  <p>
                    The Rajasthan Skill and Livelihoods Development Corporation (RSLDC) hereby invites online proposals through ISMS 2.0 portal for Empanelment of Training Partners (TPs) under <strong>{{ selectedScheme.name }}</strong>.
                  </p>
                  <p>
                    The primary objective of this scheme is to impart high-quality market-relevant domain skill training across all districts of Rajasthan with guaranteed wage employment and corporate placement support for eligible youth.
                  </p>

                  <h3 class="text-sm font-bold text-[#002244] uppercase tracking-wide border-b border-slate-200 pb-1 pt-2">
                    2. Mandatory Financial Parameters
                  </h3>
                  <div class="border border-slate-200 rounded-xs overflow-hidden">
                    <table class="w-full text-left text-xs border-collapse">
                      <tbody>
                        <tr class="border-b border-slate-200 bg-slate-50">
                          <td class="p-2.5 font-bold text-slate-700 w-1/2">Earnest Money Deposit (EMD)</td>
                          <td class="p-2.5 font-bold text-[#002244]">₹{{ selectedScheme.emdAmount | number:'1.0-0' }} (100% Refundable)</td>
                        </tr>
                        <tr class="border-b border-slate-200">
                          <td class="p-2.5 font-bold text-slate-700">Tender Processing Fee</td>
                          <td class="p-2.5 font-semibold text-slate-800">₹{{ selectedScheme.processingFee | number:'1.0-0' }} (Non-Refundable)</td>
                        </tr>
                        <tr>
                          <td class="p-2.5 font-bold text-slate-700">Submission Closing Date</td>
                          <td class="p-2.5 font-bold text-amber-800">{{ selectedScheme.closingDate }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <h3 class="text-sm font-bold text-[#002244] uppercase tracking-wide border-b border-slate-200 pb-1 pt-2">
                    3. Submission &amp; Compliance Instructions
                  </h3>
                  <p>
                    All prospective applicants must possess a verified <strong>One-Time Registration (OTR)</strong> profile on the ISMS portal. Physical submissions will not be entertained. Ensure all required center infrastructure, audited turnover statements, and trainer credentials are submitted online before the closing date.
                  </p>
                </div>

                <!-- Signatory Box -->
                <div class="pt-8 border-t border-slate-200 flex justify-between items-end text-xs">
                  <div class="text-slate-500 text-[11px]">
                    Official E-Signed Document<br>
                    ISMS Digital Procurement Cell
                  </div>
                  <div class="text-right space-y-0.5">
                    <div class="font-bold text-[#002244]">Authorized Signatory</div>
                    <div class="text-slate-600">RSLDC, Government of Rajasthan</div>
                    <div class="text-[10px] text-slate-400">Jaipur, Rajasthan</div>
                  </div>
                </div>

                <!-- Action Footer Inside Viewer -->
                <div class="pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
                  <button 
                    type="button"
                    (click)="viewMode = 'details'" 
                    class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1.5 transition-colors font-['Poppins',sans-serif]">
                    <span>←</span>
                    <span>Back to Scheme Details</span>
                  </button>

                  <button 
                    type="button"
                    (click)="downloadDocument(activePdfDoc)" 
                    class="px-5 py-2 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors font-['Poppins',sans-serif]">
                    <span>Download Official PDF</span>
                    <span>⬇</span>
                  </button>
                </div>

              </div>
            </div>

          </div>

        </main>
      </div>

      <!-- ================================================================= -->
      <!-- MODAL: PROFILE REGISTRATION (OTR) REQUIRED POPUP                 -->
      <!-- ================================================================= -->
      <div 
        *ngIf="showProfileRequiredModal" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none">
        
        <div 
          class="bg-white border border-slate-200 shadow-2xl max-w-lg w-full overflow-hidden text-slate-800 relative rounded-xs animate-in zoom-in-95 duration-150"
          (click)="$event.stopPropagation()">
          
          <!-- Modal Header (Deep Navy with Saffron Accent) -->
          <div class="bg-[#002244] text-white px-5 py-4 flex items-center justify-between border-b-3 border-amber-500">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-full bg-amber-500 text-[#002244] flex items-center justify-center font-black text-sm shrink-0 shadow-xs">
                ⚠️
              </div>
              <div>
                <h3 class="text-sm font-bold text-white leading-tight">
                  Please Complete Your Profile First
                </h3>
                <p class="text-[11px] text-amber-300 font-medium">
                  Profile Incomplete · One-Time Registration (OTR) Required
                </p>
              </div>
            </div>

            <button 
              type="button" 
              (click)="showProfileRequiredModal = false"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Modal Body -->
          <div class="p-6 space-y-4 text-xs leading-relaxed text-slate-600">
            <p>
              To view complete tender details and submit an EOI proposal for <strong class="text-[#002244]">{{ selectedScheme?.name }}</strong>, please complete your entity profile verification first.
            </p>

            <div class="bg-amber-50 border border-amber-200 p-3.5 rounded-xs space-y-2">
              <div class="font-bold text-amber-900 text-xs">Required Profile Sections to Complete:</div>
              <div class="space-y-1.5 text-[11.5px] text-amber-800">
                <div class="flex items-center gap-2">
                  <span class="text-amber-600 font-bold">•</span>
                  <span>1. Organisation / Company Basic Details</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-amber-600 font-bold">•</span>
                  <span>2. Authorized Person Details</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-amber-600 font-bold">•</span>
                  <span>3. Bank Mandate Details (PFMS Verified)</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-amber-600 font-bold">•</span>
                  <span>4. Statutory Document Uploads</span>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-2">
              <button 
                type="button" 
                (click)="showProfileRequiredModal = false"
                class="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xs transition-colors cursor-pointer">
                Cancel / Return
              </button>

              <button 
                type="button" 
                (click)="goToRegistration()"
                class="px-5 py-2.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer">
                <span>Complete Profile Now</span>
                <span>→</span>
              </button>
            </div>

          </div>

        </div>
      </div>

    </div>
  `
})
export class SchemeListingComponent implements OnInit {
  schemes: Scheme[] = [];
  filteredSchemes: Scheme[] = [];
  selectedScheme: Scheme | null = null;
  activePdfDoc: SchemeDocument | null = null;
  viewMode: 'table' | 'details' | 'pdf' = 'table';
  userProfile$!: Observable<UserProfile>;
  showProfileRequiredModal = false;

  searchKeyword: string = '';
  selectedCategory: string = 'ALL';

  constructor(
    private eoiService: EoiStateService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.userProfile$ = this.eoiService.userProfile$;
    this.eoiService.schemes$.subscribe(schemes => {
      this.schemes = schemes;
      this.filterSchemes();
      if (schemes.length > 0 && !this.selectedScheme) {
        this.selectedScheme = schemes[0];
      }
    });

    // Check if a specific scheme was requested via query params
    this.route.queryParams.subscribe(params => {
      if (params['schemeId']) {
        const found = this.schemes.find(s => s.id === params['schemeId']);
        if (found) {
          this.selectedScheme = found;
          this.viewMode = 'details';
        }
      }
    });
  }

  filterSchemes(): void {
    let result = [...this.schemes];

    // Filter by Category
    if (this.selectedCategory && this.selectedCategory !== 'ALL') {
      result = result.filter(s => s.schemeCategory === this.selectedCategory);
    }

    // Filter by Keyword
    if (this.searchKeyword && this.searchKeyword.trim() !== '') {
      const q = this.searchKeyword.toLowerCase().trim();
      result = result.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.eoiReferenceNo.toLowerCase().includes(q) ||
        s.schemeCode.toLowerCase().includes(q) ||
        s.tenderId.toLowerCase().includes(q) ||
        s.organisationChain.toLowerCase().includes(q)
      );
    }

    this.filteredSchemes = result;
  }

  resetFilters(): void {
    this.searchKeyword = '';
    this.selectedCategory = 'ALL';
    this.filterSchemes();
  }

  selectScheme(scheme: Scheme): void {
    this.selectedScheme = scheme;
    this.viewMode = 'details';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  onApplyClicked(scheme: Scheme): void {
    this.selectedScheme = scheme;

    // Check if user has an active, verified profile
    this.eoiService.userProfile$.subscribe(profile => {
      if (!profile || !profile.isRegistered || profile.userState === 'new') {
        this.showProfileRequiredModal = true;
      } else {
        // Navigate directly into multi-step proposal submission workflow
        this.router.navigate(['/eoi/apply', scheme.id]);
      }
    }).unsubscribe();
  }

  goToRegistration(): void {
    this.showProfileRequiredModal = false;
    this.router.navigate(['/profile']);
  }

  showTable(): void {
    this.viewMode = 'table';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goBack(): void {
    if (this.viewMode === 'pdf') {
      this.viewMode = 'details';
    } else if (this.viewMode === 'details') {
      this.showTable();
    } else {
      this.router.navigate(['/']);
    }
  }

  getSplitDate(dateStr: string): { date: string; time: string } {
    if (!dateStr) return { date: '', time: '' };
    const parts = dateStr.trim().split(' ');
    if (parts.length >= 3) {
      return { date: parts[0], time: `${parts[1]} ${parts[2]}` };
    }
    return { date: dateStr, time: '' };
  }

  getCategoryName(category: string): string {
    if (!category) return 'NA';
    const trimmed = category.trim();
    if (trimmed.toUpperCase() === 'ALL' || trimmed.toUpperCase() === 'NA') {
      return 'NA';
    }
    if (trimmed.includes(':')) {
      const part = trimmed.split(':')[1].trim();
      return (part.toUpperCase() === 'ALL' || part.toUpperCase() === 'NA') ? 'NA' : part;
    }
    const cleaned = trimmed.replace(/Category\s+[IVX0-9]+:?\s*/i, '').trim();
    return (cleaned.toUpperCase() === 'ALL' || !cleaned) ? 'NA' : cleaned;
  }

  openPdf(doc: SchemeDocument): void {
    this.activePdfDoc = doc;
    this.viewMode = 'pdf';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  downloadDocument(doc: SchemeDocument): void {
    if (typeof window === 'undefined') return;

    // Generate real PDF file content and trigger browser download
    const pdfContent = `%PDF-1.4
%âãÏÓ
1 0 obj
<< /Title (${doc.title}) /Author (Government of Rajasthan - RSLDC) /Subject (EOI Tender Document) >>
endobj
2 0 obj
<< /Type /Catalog /Pages 3 0 R >>
endobj
3 0 obj
<< /Type /Pages /Kids [4 0 R] /Count 1 >>
endobj
4 0 obj
<< /Type /Page /Parent 3 0 R /MediaBox [0 0 612 792] /Contents 5 0 R >>
endobj
5 0 obj
<< /Length 250 >>
stream
BT
/F1 16 Tf
50 720 Td
(GOVERNMENT OF RAJASTHAN - RSLDC) Tj
/F1 12 Tf
50 690 Td
(${doc.title}) Tj
50 670 Td
(File: ${doc.filename} | Published: ${doc.publishedDate} | Size: ${doc.size}) Tj
50 640 Td
(Official EOI Tender RFP Document authorized under ISMS Rajasthan Portal.) Tj
ET
endstream
endobj
xref
0 6
0000000000 65535 f 
0000000015 00000 n 
0000000120 00000 n 
0000000170 00000 n 
0000000230 00000 n 
0000000325 00000 n 
trailer
<< /Size 6 /Root 2 0 R /Info 1 0 R >>
startxref
620
%%EOF`;

    const blob = new Blob([pdfContent], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = doc.filename.endsWith('.pdf') ? doc.filename : `${doc.filename}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
