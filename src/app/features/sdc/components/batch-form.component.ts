import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { jsPDF } from 'jspdf';
import { FormSdcComponent, FormFieldConfig } from '../../../shared/components/form-sdc';
import { BatchService } from '../services/batch.service';
import { SdcService } from '../services/sdc.service';
import { CreateBatchDto, BatchFaculty, BatchHostel } from '../models/batch.model';
import { getBatchDetailsFormFields, getCoursesForSector, SECTOR_COURSES_MAP } from '../config/batch-form.config';

interface FacultyItem {
  facultyName: string;
  trainerType: string;
  qualification: string;
}

interface HostelItem {
  hostelAddress: string;
  hostelCode: string;
  type: string;
  capacity: number;
}

@Component({
  selector: 'app-batch-form',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, FormSdcComponent],
  template: `
    <div class="min-h-full bg-white py-4 sm:py-6 px-4 sm:px-8 font-sans selection:bg-[#174A6E] selection:text-white" style="font-family: 'Inter', sans-serif;">
      
      <!-- Direct-on-Page Container (matching SDC creation layout) -->
      <div class="max-w-7xl mx-auto space-y-4">
        
        <!-- Header: Back Button + Title & SDC Context -->
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
          <div class="flex items-center gap-3">
            <button
              type="button"
              (click)="goBack()"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 active:scale-95 text-xs font-semibold text-slate-700 shadow-2xs transition-all cursor-pointer shrink-0"
              title="Go Back"
            >
              <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span>Back</span>
            </button>
            
            <div>
              <h1 class="text-lg sm:text-xl font-bold text-slate-900 tracking-tight leading-snug m-0">
                Create Batch
              </h1>
              
            </div>
          </div>

          <!-- SDC & Scheme Context Pill -->
          <div class="flex items-center gap-2 self-start sm:self-auto bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs">
            <span class="font-semibold text-slate-800">{{ sdcName() }}</span>
            <span class="text-slate-400 font-mono text-[11px]">({{ sdcCode() }})</span>
            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-200 text-slate-700 uppercase">{{ scheme() }}</span>
          </div>
        </div>

        <!-- 2-Step Modern Stepper -->
        <div class="bg-slate-50/70 border border-slate-200 rounded-xl p-3 sm:px-6">
          <div class="flex items-center justify-between max-w-2xl mx-auto">
            
            <!-- Step 1 Button -->
            <button
              type="button"
              (click)="goToStep(1)"
              class="flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer"
              [class.text-slate-900]="currentStep() === 1"
              [class.text-slate-500]="currentStep() !== 1"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all shadow-2xs"
                [style.background-color]="isPaymentCompleted() || currentStep() > 1 ? '#16a34a' : '#174A6E'"
                style="color: #ffffff !important;"
              >
                @if (isPaymentCompleted() || currentStep() > 1) {
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: #ffffff !important;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                } @else {
                  <span style="color: #ffffff !important; font-weight: 700; font-size: 11px; line-height: 1;">1</span>
                }
              </span>
              <div class="text-left">
                <span class="block leading-tight font-bold text-slate-900">1. PSD Payment</span>
              </div>
            </button>

            <!-- Connector Line -->
            <div
              class="flex-1 mx-4 sm:mx-6 h-0.5 rounded-full transition-all"
              [class.bg-emerald-500]="isPaymentCompleted() || currentStep() > 1"
              [class.bg-slate-200]="!isPaymentCompleted() && currentStep() === 1"
            ></div>

            <!-- Step 2 Button -->
            <button
              type="button"
              (click)="goToStep(2)"
              class="flex items-center gap-2.5 text-xs font-semibold transition-all cursor-pointer"
              [class.text-slate-900]="currentStep() === 2"
              [class.text-slate-400]="currentStep() !== 2"
            >
              <span
                class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 transition-all shadow-2xs"
                [style.background-color]="currentStep() === 2 ? '#174A6E' : '#e2e8f0'"
                [style.color]="currentStep() === 2 ? '#ffffff !important' : '#475569 !important'"
              >
                <span [style.color]="currentStep() === 2 ? '#ffffff !important' : '#475569 !important'" style="font-weight: 700; font-size: 11px; line-height: 1;">2</span>
              </span>
              <div class="text-left">
                <span class="block leading-tight font-bold text-slate-900">2. Batch Details</span>
              </div>
            </button>

          </div>
        </div>

        <!-- Notification Banner -->
        @if (errorMessage()) {
          <div class="p-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 flex items-center justify-between text-xs animate-in fade-in">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-rose-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
            <button (click)="errorMessage.set('')" class="text-rose-500 hover:text-rose-800 cursor-pointer font-bold">✕</button>
          </div>
        }

        <!-- =====================================================================
             STEP 1: FEE PAYMENT & RECEIPT
             ===================================================================== -->
        @if (currentStep() === 1) {
          <div class="space-y-6 animate-in fade-in duration-200">
            
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 class="text-base sm:text-lg font-bold text-slate-900 tracking-tight m-0">
                  Fee Payment
                </h2>
                <p class="text-xs text-slate-500 mt-0.5 m-0">
                  Mandatory Batch PSD Verification Fee &amp; Secure Payment Gateway
                </p>
              </div>

              <div class="flex items-center gap-2">
                @if (isPaymentCompleted()) {
                  <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-[#174A6E] text-xs font-bold border border-blue-200">
                    <svg class="w-3.5 h-3.5 text-[#174A6E]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Fee Verified: ₹500.00 Paid</span>
                  </div>
                  <button
                    type="button"
                    (click)="isPaymentCompleted.set(false)"
                    class="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    View Payment Options
                  </button>
                }
              </div>
            </div>

            <!-- =================================================================
                 CASE A: PAYMENT NOT YET COMPLETED -> SHOW PAYMENT OPTIONS & MAKE PAYMENT BUTTON
                 ================================================================= -->
            @if (!isPaymentCompleted()) {
              <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                
                <!-- Left 2 Cols: Applicable Fee & Payment Method Selection -->
                <div class="lg:col-span-2 space-y-6">
                  
                  <!-- 1. Applicable Batch PSD Verification Fees -->
                  <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div class="pb-2 border-b border-slate-100">
                      <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
                        1. Applicable Batch PSD Verification Fee (Compulsory)
                      </h3>
                      <p class="text-xs text-slate-500 mt-0.5 m-0">
                        Fixed verification fee of ₹500 is compulsory per batch under Rajasthan Skill &amp; Livelihoods Development Corporation guidelines before proceeding to batch scheduling.
                      </p>
                    </div>

                    <div class="space-y-3">
                      <div class="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between">
                        <div class="flex items-center gap-3">
                          <div class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                            &check;
                          </div>
                          <div>
                            <h4 class="text-xs sm:text-sm font-bold text-slate-900 m-0">
                              Batch PSD Verification Fee <span class="text-rose-600">*</span>
                            </h4>
                            <p class="text-[11px] text-slate-500 mt-0.5 m-0">
                              Non-refundable administrative scrutiny &amp; batch allocation verification fee.
                            </p>
                          </div>
                        </div>
                        <span class="text-base sm:text-lg font-bold text-slate-900 font-mono">₹500.00</span>
                      </div>
                    </div>
                  </div>

                  <!-- 2. Select Payment Mode (3 Modes without e-Gras) -->
                  <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-4">
                    <div class="pb-2 border-b border-slate-100 flex items-center justify-between">
                      <h3 class="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider m-0">
                        2. Select Payment Mode
                      </h3>
                      <span class="text-[11px] text-slate-500">Government Encrypted Gateway</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      
                      <!-- UPI -->
                      <label
                        class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                        [class.border-[#174A6E]]="selectedPaymentMethod() === 'UPI'"
                        [class.bg-slate-50]="selectedPaymentMethod() === 'UPI'"
                        [class.border-slate-200]="selectedPaymentMethod() !== 'UPI'"
                      >
                        <div class="flex items-center justify-between mb-3">
                          <input
                            type="radio"
                            name="payMode"
                            value="UPI"
                            [(ngModel)]="selectedPaymentMethod"
                            class="w-4 h-4 text-[#174A6E] focus:ring-[#174A6E]"
                          />
                          <span class="text-[10px] font-bold px-2 py-0.5 bg-[#EAF2F6] text-[#174A6E] rounded">Instant</span>
                        </div>
                        <div>
                          <div class="text-xs font-bold text-slate-900">UPI / QR Code</div>
                          <div class="text-[11px] text-slate-500 mt-0.5">Google Pay, PhonePe, Paytm, BHIM</div>
                        </div>
                      </label>

                      <!-- Net Banking -->
                      <label
                        class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                        [class.border-[#174A6E]]="selectedPaymentMethod() === 'NetBanking'"
                        [class.bg-slate-50]="selectedPaymentMethod() === 'NetBanking'"
                        [class.border-slate-200]="selectedPaymentMethod() !== 'NetBanking'"
                      >
                        <div class="flex items-center justify-between mb-3">
                          <input
                            type="radio"
                            name="payMode"
                            value="NetBanking"
                            [(ngModel)]="selectedPaymentMethod"
                            class="w-4 h-4 text-[#174A6E] focus:ring-[#174A6E]"
                          />
                          <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Bank</span>
                        </div>
                        <div>
                          <div class="text-xs font-bold text-slate-900">Net Banking</div>
                          <div class="text-[11px] text-slate-500 mt-0.5">SBI, HDFC, ICICI, PNB, BoB &amp; 50+ Banks</div>
                        </div>
                      </label>

                      <!-- Debit / Credit Card -->
                      <label
                        class="p-4 rounded-xl border-2 transition-all cursor-pointer flex flex-col justify-between"
                        [class.border-[#174A6E]]="selectedPaymentMethod() === 'Card'"
                        [class.bg-slate-50]="selectedPaymentMethod() === 'Card'"
                        [class.border-slate-200]="selectedPaymentMethod() !== 'Card'"
                      >
                        <div class="flex items-center justify-between mb-3">
                          <input
                            type="radio"
                            name="payMode"
                            value="Card"
                            [(ngModel)]="selectedPaymentMethod"
                            class="w-4 h-4 text-[#174A6E] focus:ring-[#174A6E]"
                          />
                          <span class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Cards</span>
                        </div>
                        <div>
                          <div class="text-xs font-bold text-slate-900">Debit / Credit Card</div>
                          <div class="text-[11px] text-slate-500 mt-0.5">RuPay, Visa, MasterCard</div>
                        </div>
                      </label>

                    </div>
                  </div>

                </div>

                <!-- Right 1 Col: Payment Summary Card (Sticky) -->
                <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden sticky top-20">
                  <div class="bg-[#174A6E] p-4 flex items-center justify-between" style="background-color: #174A6E !important;">
                    <h4 class="text-xs font-bold uppercase tracking-wider m-0 !text-white" style="color: #ffffff !important;">Payment Summary</h4>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded uppercase" style="color: #ffffff !important; background-color: rgba(255, 255, 255, 0.18) !important;">{{ scheme() }}</span>
                  </div>

                  <div class="p-5 space-y-4 text-xs">
                    <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                      <span>Batch PSD Fee</span>
                      <span class="font-bold text-slate-900 font-mono">₹500.00</span>
                    </div>
                    <div class="flex justify-between text-slate-600 pb-2 border-b border-slate-100">
                      <span>Convenience / Processing</span>
                      <span class="font-bold text-emerald-600">₹0.00 (Free)</span>
                    </div>

                    <div class="flex justify-between items-baseline pt-1">
                      <span class="text-sm font-bold text-slate-900">Total Payable</span>
                      <span class="text-xl font-bold text-[#174A6E] font-mono">₹500.00</span>
                    </div>

                    <div class="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
                      Selected Mode: <strong class="text-slate-900 font-semibold">{{ selectedPaymentMethod() }}</strong>
                    </div>

                    <!-- Primary Action: MAKE PAYMENT BUTTON -->
                    <button
                      type="button"
                      [disabled]="isPaymentProcessing()"
                      (click)="triggerPayment()"
                      class="w-full py-3 px-4 bg-[#174A6E] hover:bg-[#123B59] active:scale-95 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75"
                    >
                      @if (isPaymentProcessing()) {
                        <svg class="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                        </svg>
                        <span>Processing Payment...</span>
                      } @else {
                        <span>Make Payment (₹500.00) &rarr;</span>
                      }
                    </button>

                    <div class="text-[10px] text-slate-400 text-center flex items-center justify-center gap-1">
                      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span>256-Bit SSL Secured Payment via RSLDC</span>
                    </div>

                  </div>
                </div>

              </div>


            }

            <!-- =================================================================
                 CASE B: PAYMENT COMPLETED -> SHOW PAYMENT RECEIPT & DOWNLOAD OPTION
                 ================================================================= -->
            @if (isPaymentCompleted()) {
              <div class="space-y-6">
                
                <!-- Official Digital Payment Receipt Card -->
                <div class="bg-white border-2 border-slate-200 rounded-2xl shadow-sm overflow-hidden text-xs">
                  
                  <!-- Top Decorative State Bar (Official ISMS Blue) -->
                  <div class="bg-[#174A6E] text-white px-5 py-3 flex flex-wrap items-center justify-between gap-3" style="background-color: #174A6E !important;">
                    <div class="flex items-center gap-2.5">
                      <div class="w-6 h-6 rounded-full bg-white text-[#174A6E] flex items-center justify-center font-bold text-xs" style="color: #174A6E !important;">
                        &check;
                      </div>
                      <div>
                        <div class="font-bold text-xs sm:text-sm tracking-wide text-white" style="color: #ffffff !important;">GOVERNMENT OF RAJASTHAN &bull; RSLDC ISMS 2.0</div>
                        <div class="text-[10.5px] text-sky-100 font-normal" style="color: #e0f2fe !important;">Official Batch PSD Verification Fee Payment Receipt</div>
                      </div>
                    </div>
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white tracking-wider uppercase border border-white/30" style="color: #ffffff !important;">
                      PAID &amp; VERIFIED
                    </span>
                  </div>

                  <!-- Receipt Core Details Grid -->
                  <div class="p-5 sm:p-6 space-y-5">
                    
                    <!-- Metadata Row 1 -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                      <div>
                        <span class="text-slate-400 block text-[10.5px] font-medium">Receipt Number</span>
                        <span class="font-mono font-bold text-slate-900 text-xs sm:text-sm">{{ receiptNumber() }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px] font-medium">Transaction Reference ID</span>
                        <span class="font-mono font-bold text-emerald-700 text-xs sm:text-sm">{{ transactionId() }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px] font-medium">Payment Timestamp</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ paymentTimestamp() }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px] font-medium">Payment Status</span>
                        <span class="font-bold text-emerald-600 flex items-center gap-1">
                          <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>SUCCESSFUL</span>
                        </span>
                      </div>
                    </div>

                    <!-- Metadata Row 2: Training Centre & Scheme Details -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">Center (SDC) Name &amp; Code</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ sdcName() }} ({{ sdcCode() }})</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">Scheme</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ scheme() }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">Allocated Sector</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ batchData.sector }}</span>
                      </div>
                    </div>

                    <!-- Fee Breakdown Table -->
                    <div class="border border-slate-200 rounded-xl overflow-hidden">
                      <table class="w-full text-left text-xs">
                        <thead class="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                          <tr>
                            <th class="py-2.5 px-4">Fee Description</th>
                            <th class="py-2.5 px-4 text-center">Payment Mode</th>
                            <th class="py-2.5 px-4 text-right">Amount (INR)</th>
                          </tr>
                        </thead>
                        <tbody class="divide-y divide-slate-100 text-slate-800">
                          <tr>
                            <td class="py-3 px-4">
                              <div class="font-semibold text-slate-900">Batch PSD Verification Fee</div>
                              <div class="text-[11px] text-slate-500">Non-refundable statutory verification fee for batch scheduling</div>
                            </td>
                            <td class="py-3 px-4 text-center">
                              <span class="px-2 py-0.5 bg-slate-100 rounded text-[11px] font-medium text-slate-700">
                                {{ selectedPaymentMethod() }}
                              </span>
                            </td>
                            <td class="py-3 px-4 text-right font-mono font-bold">₹500.00</td>
                          </tr>
                          <tr class="bg-slate-50/50">
                            <td class="py-2.5 px-4 text-slate-500">Cyber Treasury / Gateway Convenience Fee</td>
                            <td class="py-2.5 px-4 text-center text-slate-500">Exempt</td>
                            <td class="py-2.5 px-4 text-right font-mono font-semibold text-slate-600">₹0.00</td>
                          </tr>
                        </tbody>
                        <tfoot class="border-t-2 border-slate-200 bg-slate-50 font-bold text-slate-900">
                          <tr>
                            <td class="py-3 px-4 text-sm" colspan="2">TOTAL AMOUNT PAID</td>
                            <td class="py-3 px-4 text-right text-base font-mono text-emerald-700">₹500.00</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <!-- Receipt Download & Proceed Actions Bar -->
                    <div class="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                      
                      <!-- Download & Print Actions -->
                      <div class="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                          type="button"
                          (click)="downloadPaymentReceipt()"
                          class="flex-1 sm:flex-none px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 active:scale-95 text-slate-800 rounded-lg font-semibold text-xs transition-all shadow-2xs cursor-pointer inline-flex items-center justify-center gap-1.5"
                          title="Download Official PDF Receipt"
                        >
                          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>Download Receipt (PDF)</span>
                        </button>

                        <button
                          type="button"
                          (click)="printReceipt()"
                          class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-700 rounded-lg font-semibold text-xs transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                          title="Print Receipt"
                        >
                          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span>Print</span>
                        </button>
                      </div>

                      <!-- Proceed to Batch Details Action Button -->
                      <button
                        type="button"
                        (click)="proceedToStep2()"
                        class="w-full sm:w-auto px-6 py-2.5 bg-[#174A6E] hover:bg-[#123B59] active:scale-95 text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-all cursor-pointer inline-flex items-center justify-center gap-2"
                      >
                        <span>Proceed to Batch Details</span>
                        <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>

                    </div>

                  </div>

                </div>

              </div>
            }

          </div>
        }

        <!-- =====================================================================
             STEP 2: COMPLETE ELSE DETAILS (SHOWING SECTOR ALREADY FILLED)
             ===================================================================== -->
        @if (currentStep() === 2) {
          <div class="space-y-6 animate-in fade-in duration-200">
            
            <!-- Section 1: Batch Parameters & Schedule (with pre-filled Sector) -->
            <div class="space-y-2">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-[#174A6E] rounded-full shrink-0"></span>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                    Batch Parameters &amp; Schedule
                  </h3>
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500">
                  <span>PSD Payment:</span>
                  <span class="font-semibold px-2 py-0.5 rounded text-[11px] bg-emerald-100 text-emerald-800 border border-emerald-200">
                    ✓ SUCCESS (₹{{ batchData.psdFee }})
                  </span>
                </div>
              </div>

              <!-- Reused Shared Form Component (Includes pre-filled Sector as first field) -->
              <app-form-sdc
                [fields]="batchDetailsFormFields"
                [(model)]="batchData"
                [errors]="formErrors"
                (fieldChange)="onFieldChanged($event)"
                density="compact"
                layout="plain"
                [card]="false"
                [gridCols]="4"
                [showSubmit]="false"
                [showCancel]="false"
              ></app-form-sdc>
            </div>

            <!-- Section 2: Faculty Details Table (Matching PDF page 6) -->
            <div class="space-y-2.5 pt-2 border-t border-slate-200">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-[#174A6E] rounded-full shrink-0"></span>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                    Faculty Details
                  </h3>
                  <span class="text-[11px] text-slate-500">({{ facultyList.length }} trainer{{ facultyList.length > 1 ? 's' : '' }} assigned)</span>
                </div>

                <!-- Blue + Add Faculty Button -->
                <button
                  type="button"
                  (click)="addFaculty()"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#174A6E] hover:bg-[#123B59] active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Add Faculty Trainer"
                >
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Faculty</span>
                </button>
              </div>

              <!-- Faculty Responsive Table -->
              <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <th class="py-2 px-3 w-12 text-center">#</th>
                      <th class="py-2 px-3 min-w-[200px]">Faculty Name <span class="text-rose-500">*</span></th>
                      <th class="py-2 px-3 min-w-[180px]">Trainer Type <span class="text-rose-500">*</span></th>
                      <th class="py-2 px-3 min-w-[220px]">Qualification / Experience <span class="text-rose-500">*</span></th>
                      <th class="py-2 px-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (faculty of facultyList; track $index; let i = $index) {
                      <tr class="hover:bg-slate-50/60 transition-colors">
                        <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                        
                        <!-- Faculty Name -->
                        <td class="py-2 px-3">
                          <input
                            type="text"
                            [(ngModel)]="faculty.facultyName"
                            [name]="'faculty_name_' + i"
                            (input)="facultyErrors[i] = false"
                            placeholder="e.g. Vikas Purohit"
                            class="w-full px-2.5 py-1.5 text-xs bg-white border rounded-md text-slate-800 focus:outline-none transition-all"
                            [ngClass]="facultyErrors[i] ? 'border-red-500 bg-red-50/20 focus:border-red-600 focus:ring-1 focus:ring-red-200' : 'border-slate-300 focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]'"
                          />
                          @if (facultyErrors[i]) {
                            <span class="text-[10.5px] text-red-600 font-medium block mt-0.5">Faculty Name is required</span>
                          }
                        </td>

                        <!-- Trainer Type -->
                        <td class="py-2 px-3">
                          <select
                            [(ngModel)]="faculty.trainerType"
                            [name]="'faculty_type_' + i"
                            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
                          >
                            <option value="Primary Trainer">Primary Trainer</option>
                            <option value="Assistant Trainer">Assistant Trainer</option>
                            <option value="Domain Trainer">Domain Trainer</option>
                            <option value="Master Trainer">Master Trainer</option>
                          </select>
                        </td>

                        <!-- Qualification / Experience (Options: Graduate, Post Graduate, PhD) -->
                        <td class="py-2 px-3">
                          <select
                            [(ngModel)]="faculty.qualification"
                            [name]="'faculty_qual_' + i"
                            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
                          >
                            <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate (B.A / B.Sc / B.Com / B.Tech)</option>
                            <option value="Post Graduate (M.A / M.Sc / M.Tech)">Post Graduate (M.A / M.Sc / M.Tech)</option>
                            <option value="PhD">PhD</option>
                          </select>
                        </td>

                        <!-- Action: Remove -->
                        <td class="py-2 px-3 text-center">
                          <button
                            type="button"
                            (click)="removeFaculty(i)"
                            [disabled]="facultyList.length === 1"
                            class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                            title="Remove Trainer"
                          >
                            <svg class="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Section 3: Hostel Details Table (Matching PDF page 7) -->
            <div class="space-y-2.5 pt-2 border-t border-slate-200">
              <div class="flex items-center justify-between pb-1.5 border-b border-slate-100">
                <div class="flex items-center gap-2">
                  <span class="w-1.5 h-4 bg-[#174A6E] rounded-full shrink-0"></span>
                  <h3 class="text-xs font-bold text-slate-900 uppercase tracking-wider m-0">
                    Hostel Details
                  </h3>
                  <span class="text-[11px] text-slate-500">(Residential facility configuration)</span>
                </div>

                <!-- Blue + Add Hostel Button -->
                <button
                  type="button"
                  (click)="addHostel()"
                  class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#174A6E] hover:bg-[#123B59] active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  title="Add Hostel"
                >
                  <svg class="w-3.5 h-3.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Add Hostel</span>
                </button>
              </div>

              <!-- Hostel Responsive Table -->
              <div class="border border-slate-200 rounded-lg overflow-x-auto bg-white">
                <table class="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
                      <th class="py-2 px-3 w-12 text-center">#</th>
                      <th class="py-2 px-3 min-w-[260px]">Hostel Address</th>
                      <th class="py-2 px-3 min-w-[140px]">Hostel Code</th>
                      <th class="py-2 px-3 min-w-[140px]">Type</th>
                      <th class="py-2 px-3 w-28">Capacity</th>
                      <th class="py-2 px-3 w-16 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-slate-100">
                    @for (hostel of hostelList; track $index; let i = $index) {
                      <tr class="hover:bg-slate-50/60 transition-colors">
                        <td class="py-2 px-3 text-center font-mono text-slate-400 font-medium">{{ i + 1 }}</td>
                        
                        <!-- Hostel Address -->
                        <td class="py-2 px-3">
                          <input
                            type="text"
                            [(ngModel)]="hostel.hostelAddress"
                            [name]="'hostel_addr_' + i"
                            placeholder="Plot / Campus Address"
                            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
                          />
                        </td>

                        <!-- Hostel Code -->
                        <td class="py-2 px-3">
                          <input
                            type="text"
                            [(ngModel)]="hostel.hostelCode"
                            [name]="'hostel_code_' + i"
                            placeholder="e.g. HST-JP-001"
                            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
                          />
                        </td>

                        <!-- Type -->
                        <td class="py-2 px-3">
                          <select
                            [(ngModel)]="hostel.type"
                            [name]="'hostel_type_' + i"
                            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
                          >
                            <option value="Boys">Boys</option>
                            <option value="Girls">Girls</option>
                            <option value="Co-ed">Co-ed</option>
                            <option value="Not Applicable">Not Applicable</option>
                          </select>
                        </td>

                        <!-- Capacity -->
                        <td class="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            max="500"
                            [(ngModel)]="hostel.capacity"
                            [name]="'hostel_cap_' + i"
                            placeholder="0"
                            class="w-full px-2.5 py-1.5 text-xs bg-white border border-slate-300 rounded-md text-slate-800 focus:outline-none focus:border-[#174A6E] focus:ring-1 focus:ring-[#174A6E]"
                          />
                        </td>

                        <!-- Action: Remove -->
                        <td class="py-2 px-3 text-center">
                          <button
                            type="button"
                            (click)="removeHostel(i)"
                            class="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                            title="Remove Hostel"
                          >
                            <svg class="w-4 h-4 stroke-[2]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>

            <!-- Bottom Action Buttons -->
            <div class="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">

              <button
                type="button"
                (click)="submitBatchForm()"
                [disabled]="isSubmitting()"
                class="w-full sm:w-auto px-6 py-2 text-xs font-semibold text-white bg-[#174A6E] hover:bg-[#123B59] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm active:scale-95 transition-all cursor-pointer inline-flex items-center justify-center gap-2"
              >
                @if (isSubmitting()) {
                  <svg class="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                  </svg>
                  <span>Submitting Batch...</span>
                } @else {
                  <span>Submit Batch</span>
                }
              </button>
            </div>

          </div>
        }

      </div>

      <!-- =====================================================================
           PAYMENT SUCCESS POPUP MODAL (MATCHING TP REGISTRATION EXPERIENCE)
           ===================================================================== -->
      @if (showPaymentSuccessModal()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200" role="dialog" aria-modal="true">
          <div class="relative max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden text-center font-sans animate-in zoom-in-95 duration-200">
            <!-- Close Cross Button (X) on Top Right -->
            <button
              type="button"
              (click)="closePaymentSuccessModal()"
              class="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer z-30 shadow-xs"
              title="Close and View Receipt"
              aria-label="Close"
            >
              <svg class="w-4 h-4 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div class="bg-[#15803d] text-white py-6 px-6 space-y-2">
              <div class="w-12 h-12 mx-auto rounded-full bg-white text-[#15803d] flex items-center justify-center shadow-md mb-2 font-bold text-xl">
                &check;
              </div>
              <h3 class="text-lg font-bold tracking-tight m-0 text-white" style="color: #ffffff !important;">Payment Successful</h3>
              <p class="text-xs text-emerald-100 font-normal m-0" style="color: #d1fae5 !important;">
                Batch PSD Fee of ₹500.00 completed successfully via {{ selectedPaymentMethod() }}
              </p>
            </div>

            <div class="p-5 space-y-4 text-xs text-left font-sans">
              <div class="border border-slate-200 rounded-xl p-3.5 bg-slate-50/50 space-y-2.5">
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Receipt No:</span>
                  <span class="font-mono font-bold text-slate-800 text-xs">{{ receiptNumber() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Transaction Ref:</span>
                  <span class="font-mono font-bold text-slate-800 text-xs">{{ transactionId() }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Amount Paid:</span>
                  <span class="text-sm font-bold text-slate-900 font-mono">₹500.00</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Center (SDC):</span>
                  <span class="text-slate-800 font-semibold">{{ sdcName() }} ({{ sdcCode() }})</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Allocated Sector:</span>
                  <span class="text-slate-800 font-semibold">{{ batchData.sector }}</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Verification Status:</span>
                  <span class="text-emerald-700 font-bold">RSLDC AUTHORIZED</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-slate-500">Date &amp; Time:</span>
                  <span class="text-slate-600">{{ paymentTimestamp() }}</span>
                </div>
              </div>

              <div class="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  (click)="downloadPaymentReceipt()"
                  class="whitespace-nowrap py-2.5 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer shadow-2xs inline-flex items-center justify-center gap-1.5"
                  title="Download Official PDF Receipt"
                >
                  <svg class="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>Download Receipt (PDF)</span>
                </button>

                <button
                  type="button"
                  (click)="continueToBatchDetailsFromModal()"
                  class="flex-[2] py-2.5 px-4 bg-[#174A6E] hover:bg-[#123B59] text-white rounded-lg font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Continue to Batch Details &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      }

    </div>
  `
})
export class BatchFormComponent implements OnInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private batchService = inject(BatchService);
  private sdcService = inject(SdcService);

  /** Active Step: 1 for PSD Payment, 2 for Batch Details */
  currentStep = signal<number>(1);
  errorMessage = signal<string>('');
  isSubmitting = signal<boolean>(false);

  /** Payment State Signals (just like in TP Registration / Scheme Form) */
  selectedPaymentMethod = signal<string>('UPI');
  isPaymentProcessing = signal<boolean>(false);
  isPaymentCompleted = signal<boolean>(false); // starts false: user sees "Make Payment"
  showPaymentSuccessModal = signal<boolean>(false);
  transactionId = signal<string>('');
  receiptNumber = signal<string>('');
  paymentTimestamp = signal<string>('');

  /** Context identifiers */
  sdcId = signal<string>('sdc-101');
  sdcCode = signal<string>('SDC-0001');
  sdcName = signal<string>('Jaipur Skill Center');
  tpName = signal<string>('ARNOLD SAMARTH');
  scheme = signal<string>('SAMARTH');
  sector = signal<string>('Aerospace and Aviation');

  /** Field configurations for Step 2 */
  batchDetailsFormFields: FormFieldConfig[] = [];
  formErrors: Record<string, string> = {};
  facultyErrors: boolean[] = [false];

  onFieldChanged(event: any): void {
    if (this.formErrors[event.key]) {
      delete this.formErrors[event.key];
      this.formErrors = { ...this.formErrors };
    }
  }

  /**
   * Unified Batch Form Data Model containing:
   * Step 1: PSD Payment fee & status
   * Step 2: Sector (already filled) + 8 Batch parameters
   */
  batchData = {
    // Step 1: PSD Payment
    psdFee: 500,
    psdPaymentStatus: 'PENDING',
    psdPaymentMode: '',
    psdPaymentRef: '',
    psdPaymentDate: '',

    // Step 2: Pre-filled Sector (from SDC context) + empty batch parameters
    sector: 'Aerospace and Aviation',
    course: '',
    batchDurationHours: 0,
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    approvedBatchStrength: 30,
    remarks: ''
  };

  /** Faculty Details List — starts empty, user adds faculty */
  facultyList: FacultyItem[] = [
    {
      facultyName: '',
      trainerType: 'Primary Trainer',
      qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
    }
  ];

  /** Hostel Details List — starts empty, user adds hostel */
  hostelList: HostelItem[] = [
    {
      hostelAddress: '',
      hostelCode: '',
      type: 'Boys',
      capacity: 0
    }
  ];

  ngOnInit(): void {
    // Read route query parameters if redirected from SDC list or detail
    this.route.queryParams.subscribe(params => {
      if (params['sdcId']) this.sdcId.set(params['sdcId']);
      if (params['sdcCode']) this.sdcCode.set(params['sdcCode']);
      if (params['sdcName']) this.sdcName.set(params['sdcName']);
      if (params['scheme']) this.scheme.set(params['scheme']);
      if (params['sector']) {
        this.sector.set(params['sector']);
        this.batchData.sector = params['sector'];
      }
      if (params['step']) {
        const stepNum = parseInt(params['step'], 10);
        if (stepNum === 1 || stepNum === 2) {
          this.currentStep.set(stepNum);
        }
      }
      if (params['paid'] === 'true' || params['receipt'] === 'true') {
        this.isPaymentCompleted.set(true);
      }
    });

    // Lookup SDC from SdcService to prefill sector and capacity
    const sdc = this.sdcService.getSdcById(this.sdcId());
    if (sdc) {
      this.sdcName.set(sdc.sdcName);
      this.sdcCode.set(sdc.sdcCode);
      this.tpName.set(sdc.tpName);
      this.scheme.set(sdc.scheme);
      if (sdc.sector) {
        this.sector.set(sdc.sector);
        this.batchData.sector = sdc.sector;
      }
      if (sdc.sdcCapacity) {
        this.batchData.approvedBatchStrength = Math.min(30, sdc.sdcCapacity);
      }
    } else {
      if (!this.batchData.sector) {
        this.batchData.sector = this.sector();
      }
    }

    // Default payment timestamp and IDs
    if (!this.transactionId()) {
      this.transactionId.set(`TXN-PSD-2026-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    if (!this.receiptNumber()) {
      this.receiptNumber.set(`RCP-PSD-${Math.floor(100000 + Math.random() * 900000)}`);
    }
    this.paymentTimestamp.set(new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }));

    // Ensure course matches the sector
    const initialCourses = getCoursesForSector(this.batchData.sector);
    if (initialCourses.length > 0) {
      if (!initialCourses.some(c => c.courseName === this.batchData.course)) {
        this.batchData.course = initialCourses[0].courseName;
        this.batchData.batchDurationHours = initialCourses[0].defaultDurationHours;
      }
    }

    // Initialize Step 2 batch details form fields (including Sector already filled)
    this.batchDetailsFormFields = getBatchDetailsFormFields({
      onCourseChange: (courseName: string, duration: number) => {
        this.batchData.course = courseName;
        this.batchData.batchDurationHours = duration;
      },
      onSectorChange: (sectorName: string) => {
        this.onSectorSelected(sectorName);
      },
      sector: this.batchData.sector,
      scheme: this.scheme()
    });
  }

  /**
   * Handler when Sector is changed in the dropdown: dynamically syncs Course options
   */
  onSectorSelected(sectorName: string): void {
    this.batchData.sector = sectorName;
    this.sector.set(sectorName);
    const courses = getCoursesForSector(sectorName);
    const courseField = this.batchDetailsFormFields.find(f => f.key === 'course');
    if (courseField) {
      courseField.options = courses.map(c => ({
        label: c.courseName,
        value: c.courseName
      }));
    }
    const hasCurrent = courses.some(c => c.courseName === this.batchData.course);
    if (!hasCurrent) {
      if (courses.length > 0) {
        this.batchData.course = courses[0].courseName;
        this.batchData.batchDurationHours = courses[0].defaultDurationHours;
      } else {
        this.batchData.course = '';
      }
    }
    // Reassign array reference to guarantee child change detection
    this.batchDetailsFormFields = [...this.batchDetailsFormFields];
  }

  goToStep(step: number): void {
    if (step === 2) {
      this.proceedToStep2();
    } else {
      this.currentStep.set(1);
    }
  }

  /**
   * Trigger Payment: Replaces the manual Proceed button with "Make Payment"
   */
  triggerPayment(): void {
    this.isPaymentProcessing.set(true);
    setTimeout(() => {
      this.isPaymentProcessing.set(false);
      const txn = `TXN-PSD-2026-${Math.floor(100000 + Math.random() * 900000)}`;
      const rcp = `RCP-PSD-${Math.floor(100000 + Math.random() * 900000)}`;
      this.transactionId.set(txn);
      this.receiptNumber.set(rcp);
      this.paymentTimestamp.set(new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }));
      this.batchData.psdPaymentStatus = 'SUCCESS';
      this.batchData.psdPaymentRef = txn;
      this.batchData.psdPaymentMode = this.selectedPaymentMethod();
      this.batchData.psdPaymentDate = new Date().toISOString().split('T')[0];
      this.isPaymentCompleted.set(true);
      this.showPaymentSuccessModal.set(true);
    }, 1200);
  }

  continueToBatchDetailsFromModal(): void {
    this.showPaymentSuccessModal.set(false);
    this.currentStep.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  closePaymentSuccessModal(): void {
    this.showPaymentSuccessModal.set(false);
    this.currentStep.set(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Download Official PDF Payment Receipt (Government of Rajasthan / RSLDC ISMS 2.0)
   */
  downloadPaymentReceipt(): void {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210;
    const rcpNo = this.receiptNumber() || 'RCP-PSD-2026-98124';
    const txnId = this.transactionId() || 'TXN-PSD-2026-89412';
    const timeStamp = this.paymentTimestamp() || new Date().toLocaleString('en-IN');
    const paymentMode = this.selectedPaymentMethod() || 'Online';
    const tp = this.tpName() || 'Company 1';
    const sdcCode = this.sdcCode() || 'SDC-RJ-2026-0042';
    const sdcName = this.sdcName() || 'Apex Aviation & Skill Institute, Jaipur';
    const scheme = this.scheme() || 'MMSSY (Mukhya Mantri Sarvjan Skill Yojana)';
    const sector = this.batchData.sector || 'Aerospace and Aviation';

    // Outer framing borders
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.4);
    doc.rect(8, 8, 194, 281);

    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.2);
    doc.rect(10, 10, 190, 277);

    // 1. Top Header Banner (Primary Blue)
    doc.setFillColor(23, 74, 110); // #174A6E
    doc.rect(10, 10, 190, 32, 'F');

    // Gold accent stripe
    doc.setFillColor(234, 179, 8); // #EAB308
    doc.rect(10, 42, 190, 2, 'F');

    // Header Texts
    doc.setTextColor(254, 240, 138); // Yellow-200
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text('GOVERNMENT OF RAJASTHAN', pageWidth / 2, 18, { align: 'center' });

    doc.setTextColor(226, 232, 240); // Slate-200
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('DEPARTMENT OF SKILL, EMPLOYMENT & ENTREPRENEURSHIP', pageWidth / 2, 23, { align: 'center' });

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('RAJASTHAN SKILL AND LIVELIHOODS DEVELOPMENT CORPORATION (RSLDC)', pageWidth / 2, 29, { align: 'center' });

    doc.setTextColor(56, 189, 248); // Sky-400
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('INTEGRATED SCHEME MANAGEMENT SYSTEM (ISMS 2.0)', pageWidth / 2, 35, { align: 'center' });

    // 2. Receipt Sub-Title & Verification Badge
    let y = 51;
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('PAYMENT TRANSACTION RECEIPT', 14, y);

    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text('Statutory Verification Fee for Skill Development Centre (SDC) Batch Creation', 14, y + 4.5);

    // Status Badge (Paid & Verified)
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(34, 197, 94); // emerald-500
    doc.setLineWidth(0.4);
    doc.roundedRect(138, y - 5, 58, 11, 2, 2, 'FD');

    doc.setFillColor(22, 163, 74);
    doc.circle(144, y + 0.5, 1.6, 'F');

    doc.setTextColor(22, 101, 52); // emerald-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('PAID & VERIFIED', 148, y + 2);

    // 3. Transaction Summary Grid Box
    y = 63;
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, 182, 25, 1.5, 1.5, 'FD');

    // Col 1
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('RECEIPT NUMBER', 18, y + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(rcpNo, 18, y + 10.5);

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('TRANSACTION REFERENCE ID', 18, y + 17);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(txnId, 18, y + 22);

    // Col 2
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('PAYMENT TIMESTAMP', 78, y + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(timeStamp, 78, y + 10.5);

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('PAYMENT MODE / GATEWAY', 78, y + 17);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(`${paymentMode} (RSLDC Cyber Treasury)`, 78, y + 22);

    // Col 3
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('TRANSACTION STATUS', 142, y + 5.5);
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // Green
    doc.text('SUCCESS / COMPLETED', 142, y + 10.5);

    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('SCRUTINY STAGE', 142, y + 17);
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('Pre-Scrutiny Verification (PSD)', 142, y + 22);

    // 4. Center & Scheme Particulars
    y = 93;
    // Section Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 2.5, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('1. TRAINING CENTRE & SCHEME PARTICULARS', 19, y + 4.2);

    y += 6;
    // Border box for particulars
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.rect(14, y, 182, 36);

    const leftLabelX = 18;
    const leftValX = 64;

    const renderField = (label: string, val: string, posY: number) => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.2);
      doc.setTextColor(71, 85, 105);
      doc.text(label, leftLabelX, posY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(15, 23, 42);
      doc.text(`: ${val}`, leftValX, posY);
    };

    renderField('Training Partner (TP)', tp, y + 5.5);
    renderField('SDC Centre Code', sdcCode, y + 12);
    renderField('SDC Centre Name', sdcName, y + 18.5);
    renderField('Sanctioned Scheme', scheme, y + 25);
    renderField('Allocated Sector', sector, y + 31.5);

    // 5. Fee Breakdown Table
    y = 140;
    // Section Header
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 6, 'F');
    doc.setFillColor(15, 23, 42);
    doc.rect(14, y, 2.5, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('2. FEE PARTICULARS & STATUTORY BREAKUP', 19, y + 4.2);

    y += 6;
    // Table Header
    doc.setFillColor(15, 23, 42); // Navy
    doc.rect(14, y, 182, 6.5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(255, 255, 255);
    doc.text('S.No.', 18, y + 4.5);
    doc.text('Item Description / Fee Particulars', 34, y + 4.5);
    doc.text('HSN / SAC', 132, y + 4.5);
    doc.text('Amount (INR)', 190, y + 4.5, { align: 'right' });

    y += 6.5;
    // Row 1
    doc.setFillColor(255, 255, 255);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, 196, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('01', 19, y + 5);
    doc.text('Batch PSD Scrutiny & Statutory Physical Verification Fee', 34, y + 5);
    doc.text('998319', 134, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rs. 500.00', 190, y + 5, { align: 'right' });

    y += 8;
    // Row 2
    doc.setFillColor(248, 250, 252);
    doc.rect(14, y, 182, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y + 8, 196, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('02', 19, y + 5);
    doc.text('RSLDC Cyber Treasury & Payment Gateway Convenience Charge', 34, y + 5);
    doc.text('998319', 134, y + 5);
    doc.setFont('helvetica', 'bold');
    doc.text('Rs. 0.00', 190, y + 5, { align: 'right' });

    y += 8;
    // Total Row
    doc.setFillColor(241, 245, 249);
    doc.rect(14, y, 182, 9, 'F');
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.4);
    doc.line(14, y, 196, y);
    doc.line(14, y + 9, 196, y + 9);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text('TOTAL AMOUNT PAID', 34, y + 5.8);

    doc.setFontSize(9.5);
    doc.setTextColor(22, 101, 52); // emerald-700
    doc.text('Rs. 500.00', 190, y + 6, { align: 'right' });

    y += 11;
    // In Words Box
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.roundedRect(14, y, 182, 7.5, 1, 1, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.2);
    doc.setTextColor(71, 85, 105);
    doc.text('Amount in Words:', 18, y + 5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Five Hundred Indian Rupees Only', 48, y + 5);

    // 6. Digital Verification & Security Seal Section
    y = 194;
    // Outer box
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.rect(14, y, 182, 44);

    // Left side - Security & Digital Sign Note
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);
    doc.text('DIGITAL SIGNATURE & SYSTEM AUDIT AUTHENTICATION', 18, y + 5.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Digital Signature SHA-256 Hash:', 18, y + 11);
    doc.setFont('courier', 'normal');
    doc.setFontSize(6.5);
    doc.setTextColor(30, 41, 59);
    doc.text('E83F91A045B821DE0319C5B7281D9254308D2C59A41E1C7E9D0F3', 18, y + 15);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Authorization Code:', 18, y + 21);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    doc.text(`AUTH-RSLDC-CYBER-${Date.now().toString(36).toUpperCase()}`, 48, y + 21);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.8);
    doc.setTextColor(100, 116, 139);
    doc.text('Issuing Authority:', 18, y + 26.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(15, 23, 42);
    doc.text('Finance & Accounts Division, RSLDC Jaipur', 48, y + 26.5);

    // Legal disclaimer box
    doc.setFillColor(248, 250, 252);
    doc.rect(18, y + 30.5, 112, 10, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(18, y + 30.5, 112, 10);

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    doc.text('This is an official computer-generated digital receipt issued under RSLDC', 20, y + 34.5);
    doc.text('ISMS 2.0 regulations. It does not require a physical signature.', 20, y + 38.5);

    // Right side - Official Stamp Graphic
    const stampX = 138;
    const stampY = y + 3.5;
    doc.setFillColor(240, 253, 244); // light green
    doc.setDrawColor(34, 197, 94); // emerald
    doc.setLineWidth(0.5);
    doc.roundedRect(stampX, stampY, 52, 37, 2, 2, 'FD');

    doc.setDrawColor(187, 247, 208);
    doc.setLineWidth(0.25);
    doc.roundedRect(stampX + 1.2, stampY + 1.2, 49.6, 34.6, 1.5, 1.5);

    doc.setTextColor(22, 101, 52);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text('RSLDC RAJASTHAN', stampX + 26, stampY + 7, { align: 'center' });

    doc.setFontSize(6.8);
    doc.setTextColor(21, 128, 61);
    doc.text('DIGITALLY AUTHORIZED', stampX + 26, stampY + 12.5, { align: 'center' });

    doc.setDrawColor(34, 197, 94);
    doc.line(stampX + 6, stampY + 15.5, stampX + 46, stampY + 15.5);

    doc.setFontSize(6.2);
    doc.setTextColor(71, 85, 105);
    doc.text('ACCOUNTS & FINANCE', stampX + 26, stampY + 20, { align: 'center' });
    doc.text('ISMS 2.0 VERIFIED', stampX + 26, stampY + 24.5, { align: 'center' });

    doc.setFontSize(5.8);
    doc.setTextColor(100, 116, 139);
    doc.text(timeStamp, stampX + 26, stampY + 29.5, { align: 'center' });

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.setTextColor(22, 101, 52);
    doc.text('STATUS: SUCCESS', stampX + 26, stampY + 34, { align: 'center' });

    // 7. Important Notes & Terms
    y = 244;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.8);
    doc.setTextColor(71, 85, 105);
    doc.text('IMPORTANT CONDITIONS & TERMS:', 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text('1. The statutory Batch PSD Verification Fee is non-refundable and valid exclusively for the specified batch scrutiny.', 14, y + 4.2);
    doc.text('2. Payment confirmation does not guarantee batch sanction; approval is subject to physical verification and compliance.', 14, y + 8.2);
    doc.text('3. Retain this transaction receipt for future audit reference and official correspondence with RSLDC.', 14, y + 12.2);

    // 8. Footer
    doc.setDrawColor(203, 213, 225);
    doc.setLineWidth(0.3);
    doc.line(10, 269, 200, 269);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(6.2);
    doc.setTextColor(100, 116, 139);
    doc.text('Helpdesk Support: support-isms@rajasthan.gov.in  |  Helpline: 0141-2701888, 2701889', 14, 273.5);
    doc.text('Rajasthan Skill and Livelihoods Development Corporation (RSLDC), EMI Campus, J-8-B, Jhalana Institutional Area, Jaipur', 14, 277.5);

    doc.text('Page 1 of 1', 196, 273.5, { align: 'right' });
    doc.text(`Generated: ${new Date().toLocaleDateString('en-IN')}`, 196, 277.5, { align: 'right' });

    // Trigger direct browser download of formatted PDF
    doc.save(`Batch_PSD_Payment_Receipt_${txnId}.pdf`);
  }

  printReceipt(): void {
    window.print();
  }

  proceedToStep2(): void {
    if (!this.isPaymentCompleted()) {
      this.errorMessage.set('Please make the PSD verification payment before proceeding to batch details.');
      return;
    } this.errorMessage.set('');
    this.currentStep.set(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  addFaculty(): void {
    this.facultyList.push({
      facultyName: '',
      trainerType: 'Assistant Trainer',
      qualification: 'Graduate (B.A / B.Sc / B.Com / B.Tech)'
    });
  }

  removeFaculty(index: number): void {
    if (this.facultyList.length > 1) {
      this.facultyList.splice(index, 1);
    }
  }

  addHostel(): void {
    this.hostelList.push({
      hostelAddress: '',
      hostelCode: `HST-00${this.hostelList.length + 1}`,
      type: 'Co-ed',
      capacity: 30
    });
  }

  removeHostel(index: number): void {
    this.hostelList.splice(index, 1);
  }

  goBack(): void {
    if (window.history.length > 1) {
      this.location.back();
    } else {
      this.router.navigate(['/batches']);
    }
  }

  submitBatchForm(): void {
    this.errorMessage.set('');
    this.formErrors = {};
    let hasError = false;

    // Validation for compulsory fields - highlights empty fields in red
    if (!this.batchData.course || this.batchData.course.trim() === '') {
      this.formErrors['course'] = 'Course selection is mandatory.';
      hasError = true;
    }
    if (!this.batchData.batchDurationHours || Number(this.batchData.batchDurationHours) <= 0) {
      this.formErrors['batchDurationHours'] = 'Batch Duration in hours is mandatory.';
      hasError = true;
    }
    if (!this.batchData.startDate || this.batchData.startDate.trim() === '') {
      this.formErrors['startDate'] = 'Batch Start Date is mandatory.';
      hasError = true;
    }
    if (!this.batchData.startTime || this.batchData.startTime.trim() === '') {
      this.formErrors['startTime'] = 'Batch Start Time is mandatory.';
      hasError = true;
    }
    if (!this.batchData.endTime || this.batchData.endTime.trim() === '') {
      this.formErrors['endTime'] = 'Batch End Time is mandatory.';
      hasError = true;
    }

    // Check each trainer in faculty list
    this.facultyErrors = this.facultyList.map(f => !f.facultyName || f.facultyName.trim().length === 0);
    if (this.facultyErrors.some(err => err)) {
      hasError = true;
    }

    if (hasError) {
      this.formErrors = { ...this.formErrors };
      this.errorMessage.set('Please fill all mandatory highlighted fields before submitting.');
      window.scrollTo({ top: 150, behavior: 'smooth' });
      return;
    }

    this.isSubmitting.set(true);

    try {
      const dto: CreateBatchDto = {
        sdcId: this.sdcId(),
        sdcCode: this.sdcCode(),
        sdcName: this.sdcName(),
        tpName: this.tpName(),
        scheme: this.scheme(),
        sector: this.batchData.sector || this.sector(),
        course: this.batchData.course,
        courseName: this.batchData.course,
        batchDurationHours: this.batchData.batchDurationHours || 300,
        totalHours: this.batchData.batchDurationHours || 300,
        startDate: this.batchData.startDate,
        batchStartDate: this.batchData.startDate,
        endDate: this.batchData.endDate || this.batchData.startDate,
        batchEndDate: this.batchData.endDate || this.batchData.startDate,
        startTime: this.batchData.startTime,
        batchStartTime: this.batchData.startTime,
        endTime: this.batchData.endTime,
        batchEndTime: this.batchData.endTime,
        approvedBatchStrength: this.batchData.approvedBatchStrength || 30,
        remarks: this.batchData.remarks || '',
        psdFee: this.batchData.psdFee || 500,
        psdPaymentStatus: this.batchData.psdPaymentStatus,
        psdPaymentRef: this.batchData.psdPaymentRef,
        psdPaymentMode: this.batchData.psdPaymentMode,
        psdPaymentDate: this.batchData.psdPaymentDate,
        faculty: this.facultyList.map(f => ({
          name: f.facultyName,
          facultyName: f.facultyName,
          type: f.trainerType as any,
          trainerType: f.trainerType,
          qualification: f.qualification,
          experienceYears: 5
        })),
        hostels: this.hostelList.map(h => ({
          hostelAddress: h.hostelAddress,
          address: h.hostelAddress,
          hostelCode: h.hostelCode,
          code: h.hostelCode,
          type: h.type as any,
          hostelType: h.type,
          capacity: h.capacity
        }))
      };

      this.batchService.createBatch(dto);
      this.router.navigate(['/batches']);
    } catch (err: any) {
      this.errorMessage.set(err?.message || 'Failed to submit batch application.');
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
