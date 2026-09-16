import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf, NgClass, AsyncPipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { EoiStateService, EoiApplication } from '../../../core/services/eoi-state.service';
import { HeaderComponent } from '../../../shared/components/header/header.component';
import { SidebarComponent } from '../../../shared/components/sidebar/sidebar.component';
import { StatusBadgeComponent } from '../../../shared/components/status-badge/status-badge.component';
import { PdfGeneratorService } from '../application-wizard/services/pdf-generator.service';
import { Observable } from 'rxjs';

type AppFilter = 'ALL' | 'PENDING' | 'ACCEPTED' | 'AOC' | 'REJECTED';

@Component({
  selector: 'app-my-applications',
  standalone: true,
  imports: [
    CommonModule,
    NgFor,
    NgIf,
    NgClass,
    AsyncPipe,
    DecimalPipe,
    RouterLink,
    FormsModule,
    HeaderComponent,
    SidebarComponent,
    StatusBadgeComponent
  ],
  template: `
    <div class="min-h-screen flex flex-col bg-[#f8fafc] font-sans text-slate-800 antialiased font-['Poppins',sans-serif]">
      <app-header></app-header>

      <div class="flex flex-grow w-full">
        <!-- Persistent Portal Sidebar -->
        <app-sidebar class="hidden md:block flex-shrink-0"></app-sidebar>

        <main class="flex-1 min-w-0 w-full px-3 sm:px-5 py-4 overflow-y-auto space-y-3">

          <!-- Page Heading: Tender Status -->
          <div class="bg-white border border-slate-200 shadow-xs p-4 sm:p-5 rounded-xs">
            <h1 class="text-xl sm:text-2xl font-bold text-[#002244] tracking-tight">
              Tender Status
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-0.5">
              Real-time technical scrutiny progress, EMD payment verification, and empanelment outcomes for your submitted EOI tenders.
            </p>
          </div>

          <!-- Main Table Card -->
          <div class="bg-white border border-slate-200 shadow-sm rounded-xs overflow-hidden">
            
            <!-- Filters Toolbar -->
            <div class="p-3.5 sm:p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/70">
              
              <!-- Filter Tabs: All, Pending, Accepted, Rejected -->
              <nav class="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0" aria-label="Tender Status Tabs">
                <button 
                  *ngFor="let tab of filterTabs"
                  type="button"
                  (click)="setFilter(tab.key)"
                  [ngClass]="activeFilter === tab.key ? 'bg-[#002244] text-white font-bold shadow-2xs' : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-300 font-semibold'"
                  class="px-3 py-1 rounded-xs text-xs transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap">
                  <span>{{ tab.label }}</span>
                  <span 
                    [ngClass]="activeFilter === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'"
                    class="px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                    {{ getCount(tab.key) }}
                  </span>
                </button>
              </nav>

              <!-- Search Box -->
              <div class="relative w-full md:w-80 shrink-0">
                <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none text-slate-400">
                  <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </span>
                <input 
                  type="text" 
                  [(ngModel)]="searchKeyword" 
                  placeholder="Search Ref, Scheme, Department..." 
                  class="w-full pl-8 pr-7 py-1.5 text-xs border border-slate-300 rounded-xs bg-white focus:border-[#002244] focus:outline-none text-slate-800 transition shadow-2xs"
                />
                <button 
                  *ngIf="searchKeyword" 
                  (click)="searchKeyword = ''" 
                  class="absolute inset-y-0 right-0 flex items-center pr-2 text-slate-400 hover:text-slate-600 text-xs">
                  ✕
                </button>
              </div>

            </div>

            <!-- TENDER STATUS TABLE (Exactly 5 Columns) -->
            <div class="w-full overflow-x-auto" *ngIf="(history$ | async) as allApps">
              <table class="w-full min-w-[800px] table-fixed text-left text-xs border-collapse">
                
                <thead>
                  <tr class="bg-[#002244] text-white text-xs font-bold tracking-wide uppercase border-b-2 border-amber-500">
                    <!-- 1. Application Ref & Date (22%) -->
                    <th class="p-2.5 w-[22%] border-r border-[#0e3b6e] whitespace-nowrap">
                      Application Ref &amp; Date
                    </th>
                    <!-- 2. Scheme & Department (38%) -->
                    <th class="p-2.5 w-[38%] border-r border-[#0e3b6e]">
                      Scheme &amp; Department
                    </th>
                    <!-- 3. Treasury EMD Paid (16%) -->
                    <th class="p-2.5 w-[16%] border-r border-[#0e3b6e] whitespace-nowrap">
                      Treasury EMD Paid
                    </th>
                    <!-- 4. Status (12%) -->
                    <th class="p-2.5 w-[12%] border-r border-[#0e3b6e] text-center whitespace-nowrap">
                      Status
                    </th>
                    <!-- 5. Actions (12%) -->
                    <th class="p-2.5 w-[12%] text-center whitespace-nowrap">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-slate-200 text-slate-800 bg-white font-['Poppins',sans-serif]" *ngIf="getFiltered(allApps) as apps">
                  
                  <tr *ngFor="let app of apps; let idx = index" class="hover:bg-blue-50/50 transition-colors group">
                    
                    <!-- 1. Application Ref & Date -->
                    <td class="p-2.5 border-r border-slate-200 align-middle">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="font-mono font-bold text-[#002244] text-xs sm:text-[13px] leading-snug">
                          {{ app.id }}
                        </span>
                        <button 
                          (click)="copyRef(app.id)" 
                          [title]="copiedId === app.id ? 'Copied!' : 'Copy Reference ID'"
                          class="text-slate-400 hover:text-slate-700 p-0.5 rounded cursor-pointer transition">
                          <svg *ngIf="copiedId !== app.id" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                          </svg>
                          <span *ngIf="copiedId === app.id" class="text-[10px] text-emerald-600 font-bold">✓</span>
                        </button>
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1 font-medium">
                        <svg class="w-3.5 h-3.5 text-slate-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="16" y1="2" x2="16" y2="6"></line>
                          <line x1="8" y1="2" x2="8" y2="6"></line>
                          <line x1="3" y1="10" x2="21" y2="10"></line>
                        </svg>
                        <span>Applied: {{ app.appliedDate }}</span>
                      </div>
                    </td>

                    <!-- 2. Scheme & Department -->
                    <td class="p-2.5 border-r border-slate-200 align-middle">
                      <div class="font-bold text-[#002244] text-xs sm:text-[13px] leading-snug line-clamp-2" [title]="app.schemeName">
                        {{ app.schemeName }}
                      </div>
                      <div class="text-[11px] text-slate-500 mt-0.5 truncate font-medium" [title]="app.department">
                        {{ app.department }}
                      </div>
                    </td>

                    <!-- 3. Treasury EMD Paid (Left Aligned) -->
                    <td class="p-2.5 border-r border-slate-200 align-middle whitespace-nowrap">
                      <div class="font-bold text-slate-900 text-xs sm:text-[13px]">
                        ₹{{ (app.emdPayment.baseEmd || app.emdPayment.totalPaid) | number:'1.0-0' }}
                      </div>
                      <div class="text-[11px] text-slate-500 font-medium mt-0.5">
                        Fee: ₹{{ (app.emdPayment.processingFee || 2500) | number:'1.0-0' }}
                      </div>
                      <div class="text-[10.5px] text-emerald-700 font-mono font-semibold truncate max-w-[140px]" [title]="app.emdPayment.txnReference">
                        {{ app.emdPayment.txnReference }}
                      </div>
                    </td>

                    <!-- 4. Status (Pending, Accepted, Rejected) -->
                    <td class="p-2.5 border-r border-slate-200 align-middle text-center whitespace-nowrap">
                      <app-status-badge [status]="getMappedStatus(app.status)"></app-status-badge>
                    </td>

                    <!-- 5. Actions: Download Receipt PDF -->
                    <td class="p-2.5 align-middle text-center whitespace-nowrap">
                      <button 
                        type="button"
                        (click)="downloadReceiptPdf(app)"
                        class="text-[#002244] hover:text-blue-700 hover:underline text-xs font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors bg-transparent border-0 p-0"
                        title="Download Official EOI Treasury & Empanelment Receipt (PDF)">
                        <svg class="w-3.5 h-3.5 text-red-600 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                        </svg>
                        <span>Receipt PDF</span>
                      </button>
                    </td>

                  </tr>

                  <!-- Empty State -->
                  <tr *ngIf="apps.length === 0">
                    <td colspan="5" class="p-8 text-center text-slate-500">
                      <div class="text-sm font-bold text-slate-700">No tenders found for this status</div>
                      <div class="text-xs text-slate-500 mt-1">Try selecting another status tab or clearing search keywords</div>
                      <button 
                        type="button" 
                        (click)="clearFilters()"
                        class="mt-3 px-4 py-1.5 bg-[#002244] text-white text-xs font-bold rounded-xs cursor-pointer">
                        View All Tenders
                      </button>
                    </td>
                  </tr>

                </tbody>

              </table>
            </div>

          </div>

        </main>
      </div>

      <!-- ===================================================================== -->
      <!-- OFFICIAL EOI SUBMISSION RECEIPT MODAL (IDENTICAL TO STEP 4)          -->
      <!-- ===================================================================== -->
      <div 
        *ngIf="selectedReceiptApp" 
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-5 backdrop-blur-xs animate-in fade-in duration-150">
        
        <div class="bg-white rounded-xs shadow-2xl w-full max-w-4xl max-h-[94vh] flex flex-col border border-slate-300 overflow-hidden font-['Poppins',sans-serif]">
          
          <!-- Modal Top Action Header -->
          <div class="bg-[#002244] text-white px-4 py-3 flex items-center justify-between gap-3 border-b-2 border-amber-500">
            <div class="flex items-center gap-2 min-w-0">
              <svg class="w-4 h-4 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
              </svg>
              <span class="font-bold text-xs sm:text-sm truncate">
                Official EOI Receipt — {{ selectedReceiptApp.id }}
              </span>
            </div>

            <div class="flex items-center gap-2 shrink-0">
              <!-- Print Button -->
              <button 
                type="button"
                (click)="printReceipt()"
                class="px-3 py-1 bg-white/10 hover:bg-white/20 text-white rounded-xs text-xs font-bold transition flex items-center gap-1.5 cursor-pointer">
                <span>🖨️ Print</span>
              </button>

              <!-- Download Button -->
              <button 
                type="button"
                (click)="downloadReceiptPdf(selectedReceiptApp)"
                class="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 rounded-xs text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer">
                <span>📥 Download PDF</span>
              </button>

              <!-- Close Button -->
              <button 
                type="button"
                (click)="closeReceiptModal()"
                class="w-7 h-7 bg-white/15 hover:bg-rose-600 text-white rounded-xs flex items-center justify-center font-bold text-sm transition cursor-pointer"
                title="Close Receipt">
                ✕
              </button>
            </div>
          </div>

          <!-- Modal Scrollable Body: Official Government Receipt Document Preview (Exact Step 4 Design) -->
          <div class="p-4 sm:p-7 overflow-y-auto bg-slate-100 flex justify-center">
            
            <!-- Official Government of Rajasthan Submission Receipt Card -->
            <div id="printable-receipt" class="bg-white border-2 border-[#1D246B] shadow-xl w-full max-w-3xl rounded-xs text-slate-800 font-['Poppins',sans-serif] overflow-hidden">
              
              <!-- Receipt Top Header Banner -->
              <div class="bg-gradient-to-r from-[#131A4D] to-[#1D246B] text-white p-5 sm:p-6 flex items-center justify-between gap-4 border-b-[3px] border-[#E67E22] flex-wrap sm:flex-nowrap">
                <div class="flex items-center gap-3.5 sm:gap-4">
                  <div class="shrink-0">
                    <img src="ashok.png" alt="Emblem" class="h-12 sm:h-15 w-auto brightness-0 invert object-contain" />
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-[10.5px] sm:text-[11px] font-bold tracking-wider text-[#F8B471] uppercase block">GOVERNMENT OF RAJASTHAN</span>
                    <span class="text-[11.5px] sm:text-xs text-white/85 block">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</span>
                    <h2 class="text-sm sm:text-base md:text-lg font-black tracking-wide text-white leading-tight my-0.5 uppercase">
                      EOI APPLICATION SUBMISSION RECEIPT &amp; ACKNOWLEDGEMENT
                    </h2>
                    <span class="text-[11px] text-white/80 block">Integrated Skill Management System (ISMS 2.0) • Scheme Empanelment FY 2025–26</span>
                  </div>
                </div>
                <div class="shrink-0 self-start sm:self-center">
                  <span class="bg-[#10B981] text-white text-xs sm:text-sm font-black px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-xs tracking-wider uppercase inline-block shadow-2xs">
                    ✓ SUBMITTED
                  </span>
                </div>
              </div>

              <!-- Receipt Body Content -->
              <div class="p-5 sm:p-7 space-y-5">
                
                <!-- Highlighted Ref Bar -->
                <div class="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xs px-4 py-3 flex items-center justify-between flex-wrap gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-xs sm:text-sm text-slate-600">Application Number:</span>
                    <strong class="text-base sm:text-lg text-[#002244] font-mono font-extrabold">{{ selectedReceiptApp.id }}</strong>
                  </div>
                  <button
                    type="button"
                    class="bg-white border border-[#93C5FD] hover:bg-[#DBEAFE] text-[#1E40AF] text-xs font-semibold px-3 py-1 rounded-xs transition cursor-pointer flex items-center gap-1 shadow-2xs"
                    (click)="copyRef(selectedReceiptApp.id)"
                    title="Copy Application Number"
                  >
                    <span>{{ copiedId === selectedReceiptApp.id ? '✓ Copied!' : '📋 Copy Application No.' }}</span>
                  </button>
                </div>

                <!-- Application Key Metadata Grid (7 Items matching Step 4) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3.5 gap-x-5 pb-5 border-b border-slate-200 text-xs">
                  <div class="space-y-0.5">
                    <span class="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold block">TRAINING PROVIDER / PIA:</span>
                    <span class="font-bold text-slate-800 text-xs sm:text-[13px] block">Apex Skill Development Foundation</span>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold block">EOI REFERENCE NUMBER:</span>
                    <span class="font-mono text-slate-800 text-xs sm:text-[13px] font-bold block">{{ selectedReceiptApp.schemeId }}</span>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold block">REGISTRATION NUMBER:</span>
                    <span class="font-mono text-slate-800 text-xs sm:text-[13px] font-bold block">REG/RAJ/2018/88921</span>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold block">SUBMISSION DATE &amp; TIME:</span>
                    <span class="text-slate-800 text-xs sm:text-[13px] font-medium block">{{ selectedReceiptApp.appliedDate }}, 03:45 PM IST</span>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold block">POST-SUBMISSION EDITS:</span>
                    <span class="font-bold text-emerald-700 text-xs sm:text-[13px] block">0 of 3 Used (3 Remaining)</span>
                  </div>
                  <div class="space-y-0.5">
                    <span class="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold block">TRAINING CENTRE LOCATION:</span>
                    <span class="text-slate-800 text-xs sm:text-[13px] font-medium block truncate" title="Apex Skill Development Center Jaipur Central, Jaipur">
                      Apex Skill Development Center Jaipur Central, Jaipur
                    </span>
                  </div>
                  <div class="space-y-0.5 sm:col-span-2 lg:col-span-3">
                    <span class="text-[10.5px] uppercase tracking-wider text-slate-500 font-semibold block">TOTAL DOCUMENTS UPLOADED:</span>
                    <span class="font-bold text-emerald-700 text-xs sm:text-[13px] block">4 Categories Uploaded (5 MB Verified PDFs)</span>
                  </div>
                </div>

                <!-- Payment Section in Receipt -->
                <div class="space-y-2.5">
                  <h4 class="text-xs font-bold text-[#002244] uppercase tracking-wider">PAYMENT DETAILS &amp; TRANSACTION RECEIPT</h4>
                  <div class="border border-slate-200 rounded-xs overflow-x-auto">
                    <table class="w-full min-w-[550px] text-left text-xs border-collapse">
                      <thead>
                        <tr class="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 text-[11.5px]">
                          <th class="p-2.5">Fee Description</th>
                          <th class="p-2.5 font-mono">Challan / Ref No.</th>
                          <th class="p-2.5">Payment Method</th>
                          <th class="p-2.5">Payment Status</th>
                          <th class="p-2.5 text-right whitespace-nowrap">Amount Paid</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-slate-200 text-slate-800">
                        <tr>
                          <td class="p-2.5 font-medium">Processing Fee (Scrutiny Fee)</td>
                          <td class="p-2.5 font-mono text-slate-600">PF-TXN-620099</td>
                          <td class="p-2.5">{{ getPaymentMethodDisplay(selectedReceiptApp.emdPayment.paymentMethod) }}</td>
                          <td class="p-2.5 whitespace-nowrap">
                            <span class="bg-[#DCFCE7] text-[#15803D] text-[10.5px] font-bold px-2 py-0.5 rounded-xs">✓ SUCCESSFUL</span>
                          </td>
                          <td class="p-2.5 text-right font-mono font-semibold">
                            ₹{{ (selectedReceiptApp.emdPayment.processingFee || 2500) | number:'1.0-0' }}
                          </td>
                        </tr>
                        <tr>
                          <td class="p-2.5 font-medium">Earnest Money Deposit (EMD)</td>
                          <td class="p-2.5 font-mono text-slate-600">EMD-TXN-620099</td>
                          <td class="p-2.5">{{ getPaymentMethodDisplay(selectedReceiptApp.emdPayment.paymentMethod) }}</td>
                          <td class="p-2.5 whitespace-nowrap">
                            <span class="bg-[#DCFCE7] text-[#15803D] text-[10.5px] font-bold px-2 py-0.5 rounded-xs">✓ SUCCESSFUL</span>
                          </td>
                          <td class="p-2.5 text-right font-mono font-semibold">
                            ₹{{ (selectedReceiptApp.emdPayment.baseEmd || 50000) | number:'1.0-0' }}
                          </td>
                        </tr>
                        <tr class="bg-slate-50/80 font-bold text-slate-900">
                          <td colspan="4" class="p-2.5 text-right">TOTAL AMOUNT PAID:</td>
                          <td class="p-2.5 text-right font-mono text-sm sm:text-base font-extrabold text-[#1E4D8F]">
                            ₹{{ ((selectedReceiptApp.emdPayment.baseEmd || 50000) + (selectedReceiptApp.emdPayment.processingFee || 2500)) | number:'1.0-0' }}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <!-- Transaction Footer Details -->
                  <div class="flex items-center justify-between flex-wrap gap-2 text-slate-500 text-[11px] px-1 pt-1">
                    <span>Gateway Transaction ID: <strong class="text-slate-700 font-mono">{{ selectedReceiptApp.emdPayment.txnReference }}</strong></span>
                    <span>Payment Timestamp: <strong class="text-slate-700">{{ selectedReceiptApp.emdPayment.paidTimestamp || (selectedReceiptApp.appliedDate + ', 5:21 am') }}</strong></span>
                  </div>
                </div>

                <!-- Official Disclaimer & Footer Stamp -->
                <div class="pt-4 border-t border-dashed border-slate-300 flex items-end justify-between flex-wrap gap-4 text-xs">
                  <p class="text-slate-500 text-[11px] max-w-lg leading-relaxed m-0">
                    This acknowledgement receipt is generated electronically under the Integrated Scheme Management System (ISMS 2.0). All claims and uploaded credentials are subject to physical verification and empanelment scrutiny by RSLDC Scrutiny Committee.
                  </p>
                  <div class="border-2 border-[#1E4D8F] rounded-xs px-3.5 py-1.5 text-center text-[#1E4D8F] shrink-0 bg-blue-50/20">
                    <span class="block text-xs font-black tracking-wider uppercase">ISMS 2.0 VERIFIED</span>
                    <span class="block text-[10px] uppercase font-semibold">Govt. of Rajasthan</span>
                  </div>
                </div>

              </div>

            </div>

          </div>

          <!-- Modal Bottom Action Bar -->
          <div class="bg-slate-100 px-4 py-2.5 border-t border-slate-200 flex items-center justify-between">
            <button 
              type="button" 
              (click)="closeReceiptModal()"
              class="px-4 py-1.5 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 text-xs font-bold rounded-xs cursor-pointer">
              ← Close Preview
            </button>

            <div class="flex items-center gap-2">
              <button 
                type="button" 
                (click)="printReceipt()"
                class="px-3.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xs cursor-pointer flex items-center gap-1.5">
                <span>🖨️ Print Receipt</span>
              </button>
              
              <button 
                type="button" 
                (click)="downloadReceiptPdf(selectedReceiptApp)"
                class="px-4 py-1.5 bg-[#002244] hover:bg-[#003366] text-white text-xs font-bold rounded-xs shadow-2xs cursor-pointer flex items-center gap-1.5">
                <span>📥 Download Receipt (PDF)</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  `
})
export class MyApplicationsComponent implements OnInit {
  history$!: Observable<EoiApplication[]>;
  activeFilter: AppFilter = 'ALL';
  searchKeyword: string = '';
  copiedId: string | null = null;
  selectedReceiptApp: EoiApplication | null = null;

  filterTabs: { key: AppFilter; label: string }[] = [
    { key: 'ALL',      label: 'All' },
    { key: 'PENDING',  label: 'Pending' },
    { key: 'ACCEPTED', label: 'Accepted' },
    { key: 'AOC',      label: 'AOC' },
    { key: 'REJECTED', label: 'Rejected' },
  ];

  constructor(
    private eoiService: EoiStateService,
    private pdfService: PdfGeneratorService
  ) {}

  ngOnInit(): void {
    this.history$ = this.eoiService.history$;
  }

  getMappedStatus(status: string): 'PENDING' | 'ACCEPTED' | 'AOC' | 'REJECTED' {
    const s = (status || '').toUpperCase().replace(/[\s-]/g, '_');
    if (s === 'AOC' || s === 'AWARD_OF_CONTRACT') {
      return 'AOC';
    }
    if (s === 'UNDER_SCRUTINY' || s === 'UNDER_PROCESS' || s === 'PENDING' || s === 'DRAFT' || s === 'SUBMITTED') {
      return 'PENDING';
    }
    if (s === 'APPROVED' || s === 'ACCEPTED') {
      return 'ACCEPTED';
    }
    if (s === 'REJECTED') {
      return 'REJECTED';
    }
    return 'PENDING';
  }

  getPaymentMethodDisplay(method?: string): string {
    if (!method) return 'Debit / Credit Card';
    const m = method.toUpperCase();
    if (m === 'UPI') return 'Online UPI';
    if (m === 'NET_BANKING' || m === 'NET BANKING') return 'Net Banking';
    if (m === 'CARD' || m === 'DEBIT / CREDIT CARD') return 'Debit / Credit Card';
    return method;
  }

  getFiltered(apps: EoiApplication[]): EoiApplication[] {
    let filtered = apps;

    if (this.activeFilter !== 'ALL') {
      filtered = filtered.filter(a => this.getMappedStatus(a.status) === this.activeFilter);
    }

    if (this.searchKeyword && this.searchKeyword.trim()) {
      const q = this.searchKeyword.trim().toLowerCase();
      filtered = filtered.filter(a => 
        a.id.toLowerCase().includes(q) ||
        a.schemeName.toLowerCase().includes(q) ||
        a.schemeId.toLowerCase().includes(q) ||
        a.department.toLowerCase().includes(q) ||
        (a.emdPayment?.txnReference && a.emdPayment.txnReference.toLowerCase().includes(q))
      );
    }

    return filtered;
  }

  getCount(filter: AppFilter): number {
    const snapshot = this.eoiService.getHistory();
    if (filter === 'ALL') return snapshot.length;
    return snapshot.filter(a => this.getMappedStatus(a.status) === filter).length;
  }

  setFilter(f: AppFilter): void {
    this.activeFilter = f;
  }

  clearFilters(): void {
    this.activeFilter = 'ALL';
    this.searchKeyword = '';
  }

  copyRef(id: string): void {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        this.copiedId = id;
        setTimeout(() => {
          if (this.copiedId === id) this.copiedId = null;
        }, 2000);
      });
    }
  }

  openReceiptPdf(app: EoiApplication): void {
    this.selectedReceiptApp = app;
  }

  closeReceiptModal(): void {
    this.selectedReceiptApp = null;
  }

  printReceipt(): void {
    window.print();
  }

  downloadReceiptPdf(app: EoiApplication): void {
    const baseEmd = app.emdPayment.baseEmd || 50000;
    const procFee = app.emdPayment.processingFee || 2500;
    const total = (app.emdPayment.totalPaid || (baseEmd + procFee));
    const cleanDigits = app.id.replace(/\D/g, '');
    const ackSuffix = cleanDigits ? cleanDigits.slice(-4) : '9921';

    this.pdfService.downloadReceiptPdf({
      applicationNumber: app.id,
      acknowledgementReceiptNumber: `ACK-RSLDC-2026-${ackSuffix}`,
      eoiRefNumber: app.schemeId || 'EOI/RSLDC/ISMS/2026/01',
      submissionDate: app.appliedDate || '16 Sept 2026',
      submissionTimestamp: `${app.appliedDate || '16 Sept 2026'}, 03:45 PM IST`,
      tpName: 'Apex Skill Development Foundation',
      regNumber: 'REG/RAJ/2018/88921',
      tpPan: 'AAACA1234C',
      tpEmail: 'contact@apexskills.org',
      tpMobile: '9829012345',
      authPerson: 'Rajesh Kumar Sharma',
      authDesignation: 'Managing Director & CEO',
      processingFee: procFee,
      emdFee: baseEmd,
      totalFee: total,
      transactionId: app.emdPayment.txnReference || `TXN-ISMS-2026-${ackSuffix}`,
      paymentMethod: this.getPaymentMethodDisplay(app.emdPayment.paymentMethod),
      paymentDate: app.emdPayment.paidTimestamp || `${app.appliedDate || '16 Sept 2026'}, 5:21 am`,
      status: 'SUBMITTED'
    }, `Receipt_${app.id}.pdf`);
  }
}
