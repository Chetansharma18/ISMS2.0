import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, NgIf, NgFor, AsyncPipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EoiStateService, Scheme, SchemeDocument, UserProfile } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
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
    HeaderComponent,
    SidebarComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f0f4f8] font-sans text-slate-800 antialiased">
      
      <!-- TOP POST-LOGIN HEADER: Dual Logos, User Profile Name, Language/Font Tools (No News Bar) -->
      <app-header></app-header>

      <!-- PENDING PROFILE (OTR) NOTIFICATION BANNER -->
      <div 
        *ngIf="(userProfile$ | async) as profile" 
        class="w-full bg-[#fffbeb] border-b border-amber-200 text-amber-900 px-4 sm:px-6 lg:px-8 py-2.5 shadow-2xs">
        <div 
          *ngIf="profile.role === 'applicant' && (profile.userState === 'new' || !profile.isRegistered)" 
          class="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 text-xs">
          <div class="flex items-center gap-2.5">
            <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-500 text-white font-extrabold text-xs shadow-xs">!</span>
            <span class="text-amber-950 font-medium">
              <strong class="font-bold text-amber-900">One-Time Registration (OTR) Pending:</strong>
              Complete your Organization Master Profile to unlock scheme applications, EMD fee payments, and proposal submissions.
            </span>
          </div>
          <button 
            type="button"
            (click)="goToRegistration()" 
            class="shrink-0 px-3.5 py-1.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-[11px] rounded-sm shadow-xs transition-all flex items-center gap-1.5 cursor-pointer">
            <span>Complete Profile Now</span>
            <span>→</span>
          </button>
        </div>
      </div>

      <div class="flex flex-grow w-full">
        <!-- PERSISTENT PORTAL SIDEBAR -->
        <app-sidebar class="hidden md:block flex-shrink-0"></app-sidebar>

        <!-- MAIN CONTENT AREA -->
        <main class="flex-grow max-w-[1440px] mx-auto px-3 sm:px-6 lg:px-8 py-6 w-full overflow-y-auto">

          <!-- ================================================================= -->
          <!-- VIEW 1: ACTIVE SCHEMES & TENDERS TABLE VIEW                      -->
          <!-- ================================================================= -->
          <div *ngIf="viewMode === 'table'" class="space-y-4">
            
            <!-- Page Heading & Controls Bar -->
            <div class="bg-white border border-slate-200 shadow-xs p-4 sm:p-6 rounded-xs">
              <div>
                <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-[#002244]">
                  Active Schemes &amp; Tenders
                </h1>
                <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                  Official Expression of Interest (EOI) schemes, technical tenders, and empanelment opportunities published by Government of Rajasthan departments.
                </p>
              </div>

              <!-- Search & Filter Bar -->
              <div class="mt-4 pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3">
                
                <!-- Search Input -->
                <div class="sm:col-span-6 lg:col-span-5 relative">
                  <span class="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="11" cy="11" r="8"></circle>
                      <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                  </span>
                  <input 
                    type="text" 
                    [(ngModel)]="searchKeyword" 
                    (input)="filterSchemes()"
                    placeholder="Search by Scheme name, EOI Ref No, or Tender ID..." 
                    class="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xs bg-slate-50 focus:bg-white focus:border-[#002244] focus:outline-none text-slate-800 transition-colors"
                  />
                </div>

                <!-- Category Filter -->
                <div class="sm:col-span-4 lg:col-span-4">
                  <select 
                    [(ngModel)]="selectedCategory" 
                    (change)="filterSchemes()"
                    class="w-full px-3 py-2 text-xs border border-slate-300 rounded-xs bg-slate-50 focus:bg-white focus:border-[#002244] focus:outline-none text-slate-800 transition-colors font-medium">
                    <option value="ALL">All Scheme Categories</option>
                    <option value="State Funded">State Funded Schemes</option>
                    <option value="Centrally Sponsored">Centrally Sponsored Schemes</option>
                    <option value="Employment Linked">Employment Linked Schemes</option>
                  </select>
                </div>

                <!-- Result Counter Pill -->
                <div class="sm:col-span-2 lg:col-span-3 flex items-center justify-start sm:justify-end text-xs text-slate-500">
                  <span>Showing <strong class="text-[#002244] font-bold">{{ filteredSchemes.length }}</strong> of {{ schemes.length }} tenders</span>
                </div>

              </div>
            </div>

            <!-- Crisp Government Schemes Table -->
            <div class="bg-white border border-slate-200 shadow-sm rounded-xs overflow-hidden">
              <div class="overflow-x-auto">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-[#002244] text-white font-bold border-b-2 border-amber-500 text-[11.5px] tracking-wide">
                      <th class="p-3 text-center w-12 border-r border-[#0e3b6e]">S.No</th>
                      <th class="p-3 min-w-[170px] border-r border-[#0e3b6e]">EOI Reference No.</th>
                      <th class="p-3 min-w-[280px] border-r border-[#0e3b6e]">Scheme &amp; Department Chain</th>
                      <th class="p-3 min-w-[130px] border-r border-[#0e3b6e]">Category</th>
                      <th class="p-3 min-w-[145px] border-r border-[#0e3b6e]">Date Published</th>
                      <th class="p-3 min-w-[195px] border-r border-[#0e3b6e] bg-[#001730]">
                        <div class="flex items-center gap-1.5 text-amber-300 font-extrabold">
                          <span>Closing Date</span>
                          <span class="text-[10px] px-1.5 py-0.2 bg-amber-400/20 rounded text-amber-200">HIGHLIGHT</span>
                        </div>
                      </th>
                      <th class="p-3 min-w-[140px] border-r border-[#0e3b6e]">EMD &amp; Fee</th>
                      <th class="p-3 min-w-[170px] text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-200 text-slate-800 font-sans">
                    
                    <tr 
                      *ngFor="let scheme of filteredSchemes; let idx = index" 
                      class="hover:bg-blue-50/60 transition-colors group">
                      
                      <!-- 1. S.No -->
                      <td class="p-3.5 text-center font-bold text-slate-600 border-r border-slate-200 align-top bg-slate-50/40">
                        {{ idx + 1 }}
                      </td>

                      <!-- 2. EOI Reference No & Tender ID -->
                      <td class="p-3.5 border-r border-slate-200 align-top">
                        <div class="font-mono font-bold text-[#002244] text-xs leading-snug">
                          {{ scheme.eoiReferenceNo }}
                        </div>
                        <div class="mt-1 text-[11px] font-mono text-slate-500 flex items-center gap-1">
                          <span class="text-[10px] text-slate-400">ID:</span>
                          <span>{{ scheme.tenderId }}</span>
                        </div>
                        <div class="mt-1.5">
                          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-700 border border-slate-200">
                            Code: {{ scheme.schemeCode }}
                          </span>
                        </div>
                      </td>

                      <!-- 3. Scheme & Department Chain -->
                      <td class="p-3.5 border-r border-slate-200 align-top">
                        <div 
                          (click)="selectScheme(scheme)"
                          class="font-bold text-[#002244] hover:text-blue-800 text-xs leading-snug cursor-pointer group-hover:underline">
                          {{ scheme.name }}
                        </div>
                        <div class="mt-1.5 text-[11px] text-slate-600 leading-relaxed">
                          <span class="font-semibold text-slate-700">Dept Chain:</span>
                          <span class="text-slate-600">{{ scheme.organisationChain }}</span>
                        </div>
                        <div class="mt-1 text-[11px] text-slate-500">
                          <span>Beneficiaries: </span>
                          <span class="italic text-slate-600">{{ scheme.targetBeneficiaries || 'Eligible Citizens of Rajasthan' }}</span>
                        </div>
                      </td>

                      <!-- 4. Scheme Category -->
                      <td class="p-3.5 border-r border-slate-200 align-top">
                        <span 
                          [ngClass]="{
                            'bg-blue-50 text-blue-800 border-blue-200': scheme.schemeCategory === 'State Funded',
                            'bg-purple-50 text-purple-800 border-purple-200': scheme.schemeCategory === 'Centrally Sponsored',
                            'bg-emerald-50 text-emerald-800 border-emerald-200': scheme.schemeCategory === 'Employment Linked',
                            'bg-slate-50 text-slate-800 border-slate-200': scheme.schemeCategory !== 'State Funded' && scheme.schemeCategory !== 'Centrally Sponsored' && scheme.schemeCategory !== 'Employment Linked'
                          }"
                          class="inline-block px-2 py-0.5 text-[11px] font-semibold rounded-xs border">
                          {{ scheme.schemeCategory }}
                        </span>
                        <div class="mt-1 text-[10.5px] text-slate-500 font-medium">
                          {{ scheme.eoiCategory }}
                        </div>
                      </td>

                      <!-- 5. Date of EOI Published -->
                      <td class="p-3.5 border-r border-slate-200 align-top whitespace-nowrap">
                        <div class="font-mono text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="16" y1="2" x2="16" y2="6"></line>
                            <line x1="8" y1="2" x2="8" y2="6"></line>
                            <line x1="3" y1="10" x2="21" y2="10"></line>
                          </svg>
                          <span>{{ scheme.ePublishedDate }}</span>
                        </div>
                        <div class="text-[10.5px] text-slate-500 mt-1 font-mono">
                          Opening: {{ scheme.openingDate }}
                        </div>
                      </td>

                      <!-- 6. Closing Date of EOI (HIGHLIGHTED!) -->
                      <td class="p-3.5 border-r border-slate-200 align-top whitespace-nowrap bg-amber-50/40">
                        <div class="p-2 rounded-xs border border-amber-300 bg-amber-100/70">
                          <div class="font-mono font-black text-[#92400e] text-xs flex items-center gap-1">
                            <svg class="w-3.5 h-3.5 text-amber-700 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <circle cx="12" cy="12" r="10"></circle>
                              <polyline points="12 6 12 12 16 14"></polyline>
                            </svg>
                            <span>{{ scheme.closingDate }}</span>
                          </div>

                          <div class="mt-1.5 flex items-center gap-1.5">
                            <span 
                              *ngIf="(scheme.daysRemaining || 20) <= 5"
                              class="inline-flex items-center gap-1 text-[10px] font-extrabold text-red-800 bg-red-100 border border-red-300 px-1.5 py-0.5 rounded-2xs animate-pulse">
                              <span>⚠️ Closes Soon ({{ scheme.daysRemaining }} Days)</span>
                            </span>
                            <span 
                              *ngIf="(scheme.daysRemaining || 20) > 5"
                              class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded-2xs">
                              <span>● Open ({{ scheme.daysRemaining }} Days Left)</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      <!-- 7. EMD Fee & Process Fee -->
                      <td class="p-3.5 border-r border-slate-200 align-top">
                        <div class="font-bold text-[#002244] text-xs font-mono">
                          ₹{{ scheme.emdAmount | number:'1.0-0' }}
                        </div>
                        <div class="text-[10px] text-emerald-700 font-semibold mt-0.5">
                          ✓ Refundable EMD
                        </div>
                        <div class="mt-1 text-[10.5px] font-mono text-slate-500 border-t border-slate-100 pt-1">
                          Fee: ₹{{ scheme.processingFee | number:'1.0-0' }}
                        </div>
                      </td>

                      <!-- 8. Actions: View Details & Apply -->
                      <td class="p-3.5 align-top text-center">
                        <div class="flex flex-col gap-1.5">
                          <button 
                            type="button"
                            (click)="selectScheme(scheme)"
                            class="w-full px-3 py-1.5 bg-white hover:bg-slate-100 text-[#002244] border border-[#002244]/40 text-xs font-bold rounded-xs shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
                            <svg class="w-3.5 h-3.5 text-[#002244]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                              <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                            <span>View Details</span>
                          </button>

                          <button 
                            type="button"
                            (click)="onApplyClicked(scheme)"
                            class="w-full px-3 py-1.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs shadow-xs transition-colors flex items-center justify-center gap-1 cursor-pointer">
                            <span>Apply</span>
                            <span>→</span>
                          </button>
                        </div>
                      </td>

                    </tr>

                    <!-- Empty State if no schemes match filter -->
                    <tr *ngIf="filteredSchemes.length === 0">
                      <td colspan="8" class="p-8 text-center text-slate-500">
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
            
            <!-- Window Navigation & Hero Banner -->
            <div class="bg-[#002244] text-white rounded-xs shadow-md overflow-hidden border-b-4 border-amber-500">
              
              <!-- Top Row: Breadcrumbs & Back Button -->
              <div class="px-5 py-3 border-b border-white/15 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div class="flex items-center gap-2 text-xs">
                  <button 
                    type="button"
                    (click)="showTable()" 
                    class="text-amber-300 hover:text-white font-semibold flex items-center gap-1 cursor-pointer">
                    <span>←</span>
                    <span>All Tenders List</span>
                  </button>
                  <span class="text-white/40">/</span>
                  <span class="text-slate-300">EOI Schemes</span>
                  <span class="text-white/40">/</span>
                  <span class="text-white font-mono font-bold">{{ selectedScheme.schemeCode }}</span>
                </div>

                <div class="flex items-center gap-2">
                  <button 
                    type="button"
                    (click)="showTable()" 
                    class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white border border-white/25 text-xs font-semibold rounded-xs transition-colors cursor-pointer flex items-center gap-1.5">
                    <span>←</span>
                    <span>Back to Tenders Table</span>
                  </button>
                </div>
              </div>

              <!-- Main Hero Content -->
              <div class="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                
                <!-- Left Title & Meta -->
                <div class="lg:col-span-8 space-y-2">
                  <div class="flex flex-wrap items-center gap-2">
                    <span class="px-2.5 py-0.5 bg-amber-500 text-[#002244] text-xs font-extrabold rounded-2xs tracking-wide">
                      {{ selectedScheme.schemeCategory }}
                    </span>
                    <span class="px-2.5 py-0.5 bg-white/15 text-white text-xs font-mono font-bold rounded-2xs border border-white/20">
                      Ref: {{ selectedScheme.eoiReferenceNo }}
                    </span>
                    <span class="px-2.5 py-0.5 bg-white/15 text-white text-xs font-mono rounded-2xs border border-white/20">
                      Tender ID: {{ selectedScheme.tenderId }}
                    </span>
                  </div>

                  <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-white leading-tight">
                    {{ selectedScheme.name }}
                  </h1>

                  <p class="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-3xl">
                    {{ selectedScheme.eoiDescription }}
                  </p>

                  <div class="pt-2 text-xs text-amber-200/90 font-medium">
                    🏛 Nodal Dept: <span class="text-white font-semibold">{{ selectedScheme.department }}</span>
                  </div>
                </div>

                <!-- Right High-Visibility Closing Date & Apply Card -->
                <div class="lg:col-span-4 bg-white/10 border border-white/20 p-4 rounded-xs text-white space-y-3 shadow-inner">
                  
                  <!-- Highlighted Closing Date Box -->
                  <div class="bg-amber-500/20 border border-amber-400/50 p-3 rounded-xs">
                    <div class="text-[11px] uppercase tracking-wider font-extrabold text-amber-300 flex items-center gap-1">
                      <span>⏰ SUBMISSION DEADLINE (CLOSING DATE)</span>
                    </div>
                    <div class="text-base sm:text-lg font-mono font-black text-white mt-0.5">
                      {{ selectedScheme.closingDate }}
                    </div>
                    <div class="text-[11px] text-amber-200 font-bold mt-1">
                      ● Status: Open for Proposal Submission ({{ selectedScheme.daysRemaining || 20 }} Days Left)
                    </div>
                  </div>

                  <!-- Quick Fees Row -->
                  <div class="grid grid-cols-2 gap-2 text-center text-xs">
                    <div class="bg-white/5 border border-white/15 p-2 rounded-xs">
                      <div class="text-[10px] text-slate-300 uppercase">EMD Fee</div>
                      <div class="font-mono font-bold text-white text-sm mt-0.5">
                        ₹{{ selectedScheme.emdAmount | number:'1.0-0' }}
                      </div>
                      <div class="text-[9.5px] text-emerald-300 font-semibold mt-0.5">100% Refundable</div>
                    </div>
                    <div class="bg-white/5 border border-white/15 p-2 rounded-xs">
                      <div class="text-[10px] text-slate-300 uppercase">Process Fee</div>
                      <div class="font-mono font-bold text-white text-sm mt-0.5">
                        ₹{{ selectedScheme.processingFee | number:'1.0-0' }}
                      </div>
                      <div class="text-[9.5px] text-slate-300 mt-0.5">Non-Refundable</div>
                    </div>
                  </div>

                  <!-- Primary Apply CTA -->
                  <button 
                    type="button"
                    (click)="onApplyClicked(selectedScheme)"
                    class="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#002244] font-black text-xs uppercase tracking-wider rounded-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98">
                    <span>Apply for this Scheme Now</span>
                    <span>→</span>
                  </button>

                </div>

              </div>

            </div>

            <!-- Two-Column Structured Scheme Details & Documents Grid -->
            <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              <!-- LEFT COLUMN: Scheme Overview, All Documents, Scope & Eligibility (8 Cols) -->
              <div class="lg:col-span-8 space-y-6">
                
                <!-- SECTION: Scheme Related All Documents & RFP Downloads -->
                <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 sm:p-6">
                  
                  <div class="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div>
                      <h2 class="text-base font-bold text-[#002244] flex items-center gap-2">
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

                    <span class="px-2.5 py-1 bg-blue-50 text-[#002244] text-xs font-bold rounded-xs border border-blue-200">
                      {{ (selectedScheme.documents || []).length }} Documents
                    </span>
                  </div>

                  <!-- Documents List Container -->
                  <div class="mt-4 space-y-3">
                    <div 
                      *ngFor="let doc of selectedScheme.documents"
                      class="border border-slate-200 hover:border-[#002244] p-3.5 rounded-xs bg-slate-50/50 hover:bg-white transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group">
                      
                      <!-- Doc Meta & Title -->
                      <div class="flex items-start gap-3 min-w-0">
                        <!-- File Type Badge -->
                        <div 
                          [ngClass]="{
                            'bg-red-100 text-red-800 border-red-300': doc.type === 'PDF',
                            'bg-emerald-100 text-emerald-800 border-emerald-300': doc.type === 'EXCEL',
                            'bg-blue-100 text-blue-800 border-blue-300': doc.type === 'DOC'
                          }"
                          class="w-11 h-11 flex-shrink-0 rounded-xs border flex flex-col items-center justify-center font-bold font-mono">
                          <span class="text-xs leading-none">{{ doc.type }}</span>
                          <span class="text-[9px] opacity-75 mt-0.5">DOC</span>
                        </div>

                        <div class="min-w-0">
                          <div class="font-bold text-xs text-[#002244] group-hover:text-blue-800 transition-colors leading-snug">
                            {{ doc.title }}
                          </div>
                          <div class="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                            {{ doc.description }}
                          </div>
                          <div class="flex items-center gap-3 mt-1 text-[10.5px] font-mono text-slate-400">
                            <span>File: <strong class="text-slate-600">{{ doc.filename }}</strong></span>
                            <span>•</span>
                            <span>Size: <strong class="text-slate-600">{{ doc.size }}</strong></span>
                            <span>•</span>
                            <span>Published: {{ doc.publishedDate }}</span>
                          </div>
                        </div>
                      </div>

                      <!-- Actions: Download & Preview -->
                      <div class="flex items-center gap-2 self-start sm:self-center shrink-0">
                        <button 
                          type="button"
                          (click)="previewDocument(doc)"
                          class="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-semibold rounded-xs transition-colors flex items-center gap-1 cursor-pointer">
                          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                          </svg>
                          <span>Preview</span>
                        </button>

                        <button 
                          type="button"
                          (click)="downloadDocument(doc)"
                          class="px-3 py-1.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer">
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

                <!-- SECTION: Key Timeline & Critical Dates Matrix -->
                <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 sm:p-6">
                  <h2 class="text-base font-bold text-[#002244] pb-3 border-b border-slate-200 flex items-center gap-2">
                    <svg class="w-5 h-5 text-blue-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <circle cx="12" cy="12" r="10"></circle>
                      <polyline points="12 6 12 12 16 14"></polyline>
                    </svg>
                    <span>Critical EOI Milestones &amp; Schedule Matrix</span>
                  </h2>

                  <div class="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    
                    <!-- Date 1: Published -->
                    <div class="border border-slate-200 p-3.5 rounded-xs bg-slate-50/50">
                      <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date of EOI Published</div>
                      <div class="font-mono font-bold text-[#002244] text-sm mt-1">
                        {{ selectedScheme.ePublishedDate }}
                      </div>
                      <div class="text-[10.5px] text-slate-500 mt-0.5">Published on official state tender bulletin</div>
                    </div>

                    <!-- Date 2: Pre-Bid Meeting -->
                    <div class="border border-slate-200 p-3.5 rounded-xs bg-slate-50/50">
                      <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pre-Bid Meeting</div>
                      <div class="font-mono font-bold text-[#002244] text-sm mt-1">
                        {{ selectedScheme.preBidMeetingDate || '15-Sep-2026 11:30 AM' }}
                      </div>
                      <div class="text-[10.5px] text-slate-500 mt-0.5">Held at RSLDC Head Office, Jhalana Doongri, Jaipur</div>
                    </div>

                    <!-- Date 3: Closing Date (HIGHLIGHTED) -->
                    <div class="border-2 border-amber-400 p-3.5 rounded-xs bg-amber-50">
                      <div class="text-[11px] font-extrabold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                        <span>⭐ Closing Date of EOI Submission</span>
                      </div>
                      <div class="font-mono font-black text-[#92400e] text-base mt-1">
                        {{ selectedScheme.closingDate }}
                      </div>
                      <div class="text-[11px] text-amber-800 font-bold mt-0.5">
                        Strict deadline: No proposals accepted after portal closing time.
                      </div>
                    </div>

                    <!-- Date 4: Opening Date -->
                    <div class="border border-slate-200 p-3.5 rounded-xs bg-slate-50/50">
                      <div class="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Technical Bid Opening Date</div>
                      <div class="font-mono font-bold text-[#002244] text-sm mt-1">
                        {{ selectedScheme.openingDate }}
                      </div>
                      <div class="text-[10.5px] text-slate-500 mt-0.5">Online scrutiny &amp; empanelment desk opening</div>
                    </div>

                  </div>
                </div>

                <!-- SECTION: Scheme Scope, Objectives & Eligibility Requirements -->
                <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 sm:p-6 space-y-4">
                  <h2 class="text-base font-bold text-[#002244] pb-3 border-b border-slate-200 flex items-center gap-2">
                    <svg class="w-5 h-5 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    <span>Eligibility Requirements &amp; Scope of Work</span>
                  </h2>

                  <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      1. Target Beneficiary Coverage
                    </h3>
                    <p class="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xs border border-slate-100">
                      {{ selectedScheme.targetBeneficiaries || 'Youth of Rajasthan state across designated priority districts.' }}
                    </p>
                  </div>

                  <div>
                    <h3 class="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                      2. Mandatory Empanelment Qualification Criteria
                    </h3>
                    <ul class="space-y-2 text-xs text-slate-700">
                      <li *ngFor="let crit of selectedScheme.eligibilityPreview" class="flex items-start gap-2">
                        <span class="text-emerald-600 font-bold shrink-0">✓</span>
                        <span>{{ crit }}</span>
                      </li>
                    </ul>
                  </div>

                </div>

              </div>

              <!-- RIGHT COLUMN: Fees, Organization Chain, Helpdesk & Apply Action (4 Cols) -->
              <div class="lg:col-span-4 space-y-6">
                
                <!-- Quick Apply Action Card -->
                <div class="bg-white border-2 border-[#002244] rounded-xs shadow-md p-5 space-y-4">
                  <div>
                    <span class="text-[10px] font-mono text-[#002244] uppercase tracking-wider font-bold">
                      Submission Desk
                    </span>
                    <h3 class="text-base font-bold text-[#002244] mt-0.5">
                      Ready to Apply?
                    </h3>
                    <p class="text-xs text-slate-600 mt-1 leading-relaxed">
                      Submit technical qualifications, center capacity proposals, and complete EMD payments online.
                    </p>
                  </div>

                  <div class="p-3 bg-blue-50 border border-blue-200 rounded-xs text-xs text-[#002244] space-y-1">
                    <div class="font-bold">⚠️ Profile Requirement Check:</div>
                    <div class="text-[11.5px] leading-relaxed">
                      Applicants must possess an active verified One-Time Registration (OTR) profile before proceeding.
                    </div>
                  </div>

                  <button 
                    type="button"
                    (click)="onApplyClicked(selectedScheme)"
                    class="w-full py-3 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs uppercase tracking-wider rounded-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98">
                    <span>Submit EOI Proposal</span>
                    <span>→</span>
                  </button>

                  <button 
                    type="button"
                    (click)="showTable()"
                    class="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xs transition-colors cursor-pointer">
                    ← Back to All Tenders
                  </button>
                </div>

                <!-- Financial Fee Parameters Card -->
                <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 space-y-3 text-xs">
                  <h3 class="font-bold text-[#002244] pb-2 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    Financial Parameters &amp; Payment Norms
                  </h3>

                  <div class="space-y-2.5">
                    <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span class="text-slate-500">Earnest Money Deposit (EMD):</span>
                      <span class="font-mono font-bold text-[#002244] text-sm">₹{{ selectedScheme.emdAmount | number:'1.0-0' }}</span>
                    </div>

                    <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span class="text-slate-500">Tender Processing Fee:</span>
                      <span class="font-mono font-bold text-slate-800">₹{{ selectedScheme.processingFee | number:'1.0-0' }}</span>
                    </div>

                    <div class="flex justify-between items-center pb-2 border-b border-slate-100">
                      <span class="text-slate-500">EMD Refund Nature:</span>
                      <span class="font-semibold text-emerald-700">100% Refundable to non-selected</span>
                    </div>

                    <div class="flex justify-between items-center">
                      <span class="text-slate-500">Payment Gateways:</span>
                      <span class="font-medium text-slate-700">Net Banking / UPI / NEFT / RTGS</span>
                    </div>
                  </div>
                </div>

                <!-- Nodal Department Contact Desk -->
                <div class="bg-white border border-slate-200 rounded-xs shadow-xs p-5 space-y-3 text-xs">
                  <h3 class="font-bold text-[#002244] pb-2 border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    Nodal Authority Contact
                  </h3>

                  <div class="space-y-2 text-slate-600 leading-relaxed">
                    <div>
                      <strong class="text-slate-800">Department:</strong>
                      <div>{{ selectedScheme.department }}</div>
                    </div>
                    <div>
                      <strong class="text-slate-800">Tender Cell:</strong>
                      <div>EOI Scrutiny &amp; Empanelment Committee</div>
                    </div>
                    <div>
                      <strong class="text-slate-800">Office Location:</strong>
                      <div>EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur - 302004</div>
                    </div>
                    <div>
                      <strong class="text-slate-800">Helpdesk Email:</strong>
                      <div class="font-mono text-blue-700">support-isms&#64;rajasthan.gov.in</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            <!-- Bottom Floating Action Bar -->
            <div class="mt-8 p-4 bg-white border border-slate-200 rounded-xs shadow-sm flex flex-col sm:flex-row justify-between items-center gap-3">
              <button 
                type="button"
                (click)="showTable()" 
                class="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold transition-colors flex items-center gap-1.5 rounded-xs cursor-pointer">
                <span>←</span>
                <span>Return to Tenders Table</span>
              </button>

              <button 
                type="button"
                (click)="onApplyClicked(selectedScheme)"
                class="px-6 py-2.5 bg-[#002244] hover:bg-[#003366] text-white font-bold text-xs tracking-wide transition-colors flex items-center gap-2 shadow-xs cursor-pointer rounded-xs">
                <span>Apply for this Scheme (Submit Proposal)</span>
                <span>→</span>
              </button>
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
                !
              </div>
              <div>
                <h3 class="text-sm font-bold text-white leading-tight">
                  One-Time Registration (OTR) Profile Required
                </h3>
                <p class="text-[11px] text-amber-300 font-medium">
                  Official Profile Incomplete · Rajasthan Procurement Rules
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
          <div class="p-6 space-y-4 text-xs">
            
            <div class="bg-amber-50 border border-amber-200 p-4 rounded-xs text-slate-800 space-y-2">
              <p class="leading-relaxed font-medium">
                Under Government of Rajasthan procurement and empanelment regulations, applicants cannot submit proposals or pay EMD fees without completing the <strong>One-Time Registration (OTR)</strong> profile.
              </p>
              <p class="text-slate-600 text-[11.5px] leading-relaxed">
                Your organization profile is currently incomplete. Please complete registration to link your PAN, GSTIN, and Authorized Signatory credentials.
              </p>
            </div>

            <!-- Missing Items Checklist -->
            <div class="border border-slate-200 rounded-xs p-3.5 space-y-2 bg-slate-50">
              <div class="font-bold text-[#002244] uppercase tracking-wider text-[10.5px]">
                Registration Steps Required Before Applying:
              </div>
              <div class="space-y-1.5 text-slate-700">
                <div class="flex items-center gap-2">
                  <span class="text-amber-600 font-bold">●</span>
                  <span>Organization Name, Entity Type &amp; Incorporation Details</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-amber-600 font-bold">●</span>
                  <span>Rajasthan GSTIN &amp; Corporate PAN Verification</span>
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-amber-600 font-bold">●</span>
                  <span>Authorized Signatory Identity Verification (Aadhaar / SSO)</span>
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

      <!-- ================================================================= -->
      <!-- MODAL: DOCUMENT PREVIEW MODAL                                    -->
      <!-- ================================================================= -->
      <div 
        *ngIf="previewingDocument" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200 select-none"
        (click)="previewingDocument = null">
        
        <div 
          class="bg-white border border-slate-200 shadow-2xl max-w-2xl w-full rounded-xs overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150"
          (click)="$event.stopPropagation()">
          
          <!-- Header -->
          <div class="bg-[#002244] text-white px-5 py-3.5 flex items-center justify-between border-b-2 border-amber-500">
            <div class="flex items-center gap-2.5">
              <span class="px-2 py-0.5 bg-amber-500 text-[#002244] text-xs font-mono font-bold rounded-2xs">
                {{ previewingDocument.type }}
              </span>
              <h3 class="text-sm font-bold text-white line-clamp-1">
                {{ previewingDocument.title }}
              </h3>
            </div>
            <button 
              type="button" 
              (click)="previewingDocument = null"
              class="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
              ✕
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-4 text-xs overflow-y-auto">
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xs space-y-2">
              <div class="text-slate-500 font-mono text-[11px]">Filename: <strong class="text-slate-800">{{ previewingDocument.filename }}</strong></div>
              <div class="text-slate-500 font-mono text-[11px]">File Size: <strong class="text-slate-800">{{ previewingDocument.size }}</strong></div>
              <div class="text-slate-500 font-mono text-[11px]">Publish Date: <strong class="text-slate-800">{{ previewingDocument.publishedDate }}</strong></div>
            </div>

            <div>
              <h4 class="font-bold text-[#002244] uppercase tracking-wider text-[11px] mb-1">
                Document Abstract &amp; Scope:
              </h4>
              <p class="text-slate-700 leading-relaxed bg-white border border-slate-200 p-3 rounded-xs">
                {{ previewingDocument.description }}
              </p>
            </div>

            <div class="p-3 bg-blue-50 border border-blue-200 text-[#002244] rounded-xs text-[11.5px] leading-relaxed">
              This official document contains regulatory tender guidelines, evaluation scorecards, and submission templates authorized by Rajasthan Skill and Livelihoods Development Corporation (RSLDC).
            </div>
          </div>

          <!-- Footer -->
          <div class="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span class="text-[11px] text-slate-500 font-mono">Official PDF Document</span>
            <div class="flex items-center gap-2">
              <button 
                type="button" 
                (click)="previewingDocument = null"
                class="px-3.5 py-1.5 border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold rounded-xs">
                Close
              </button>
              <button 
                type="button" 
                (click)="downloadDocument(previewingDocument)"
                class="px-4 py-1.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs flex items-center gap-1.5">
                <span>Download Document</span>
                <span>⬇</span>
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
  viewMode: 'table' | 'details' = 'table';
  userProfile$!: Observable<UserProfile>;
  showProfileRequiredModal = false;
  previewingDocument: SchemeDocument | null = null;

  searchKeyword: string = '';
  selectedCategory: string = 'ALL';

  constructor(
    private eoiService: EoiStateService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

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

  onApplyClicked(scheme: Scheme | null): void {
    if (!scheme) return;
    const currentProfile = this.eoiService.getProfile();
    
    // Gating check: if profile is pending (userState === 'new' or !isRegistered), show popup
    if (currentProfile.role === 'applicant' && (currentProfile.userState === 'new' || !currentProfile.isRegistered)) {
      this.showProfileRequiredModal = true;
    } else {
      this.router.navigate(['/eoi/apply', scheme.id]);
    }
  }

  goToRegistration(): void {
    this.showProfileRequiredModal = false;
    this.router.navigate(['/auth/register']);
  }

  showTable(): void {
    this.viewMode = 'table';
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goBack(): void {
    if (this.viewMode === 'details') {
      this.showTable();
    } else {
      this.router.navigate(['/']);
    }
  }

  previewDocument(doc: SchemeDocument): void {
    this.previewingDocument = doc;
  }

  downloadDocument(doc: SchemeDocument): void {
    // Generate simulated download trigger
    alert(`Downloading ${doc.filename} (${doc.size})... Official document download initiated.`);
  }
}
