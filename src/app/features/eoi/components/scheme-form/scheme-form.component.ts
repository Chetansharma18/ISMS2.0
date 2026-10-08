import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { OtrFormService } from '../../../registration/services/otr-form.service';
import { DocumentViewerModalComponent } from '../../../../shared/components/document-viewer-modal/document-viewer-modal.component';
import {
  Step1OrgDetails,
  OfficerInCharge,
  Step3AuthorizedPerson,
  Step4BankDetails,
  FileDoc
} from '../../../registration/models/otr-form.model';

export interface EoiDocumentItem {
  id: number;
  name: string;
  description: string;
  fileName: string;
  fileSize: string;
  uploadedDate: string;
  isMandatory: boolean;
  status: 'uploaded' | 'pending';
  category: 'mandatory' | 'annexure' | 'remaining';
}

@Component({
  selector: 'app-scheme-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DocumentViewerModalComponent],
  template: `
    <div class="w-full min-h-screen bg-slate-50/60 pb-16 font-sans text-slate-800">
      
      <!-- ====================================================================
           1. TOP NAVIGATION BAR: 6-STEP PROGRESS STEPPER
           ==================================================================== -->
      <header class="w-full bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs font-sans">
        <div class="w-full px-3 sm:px-5 lg:px-6 py-3">
          <nav class="w-full flex items-center justify-between overflow-x-auto no-scrollbar py-0.5 gap-1 sm:gap-2" aria-label="EOI Application Steps">
            
            <!-- Step 1: Processing Fee (₹500 / ₹2,000) -->
            <button
              type="button"
              (click)="goToStep(1)"
              class="flex items-center gap-1.5 sm:gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 1"
              [class.font-semibold]="currentStep() === 1"
              [class.text-slate-400]="currentStep() < 1"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 1 || procFeePaid(),
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 1 && !procFeePaid(),
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 1
                }"
                [style.color]="currentStep() >= 1 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 1 || procFeePaid()) { &check; } @else { 1 }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 1</span>
                <span class="text-xs font-semibold">Processing Fee</span>
              </div>
            </button>

            <span class="flex-1 min-w-3 sm:min-w-6 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 1 || procFeePaid()"></span>

            <!-- Step 2: OTR Profile -->
            <button
              type="button"
              (click)="goToStep(2)"
              class="flex items-center gap-1.5 sm:gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 2"
              [class.font-semibold]="currentStep() === 2"
              [class.text-slate-400]="currentStep() < 2"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 2,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 2,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 2
                }"
                [style.color]="currentStep() >= 2 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 2) { &check; } @else { 2 }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 2</span>
                <span class="text-xs font-semibold">OTR Profile</span>
              </div>
            </button>

            <span class="flex-1 min-w-3 sm:min-w-6 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 2"></span>

            <!-- Step 3: Upload Documents -->
            <button
              type="button"
              (click)="goToStep(3)"
              class="flex items-center gap-1.5 sm:gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 3"
              [class.font-semibold]="currentStep() === 3"
              [class.text-slate-400]="currentStep() < 3"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 3,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 3,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 3
                }"
                [style.color]="currentStep() >= 3 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 3) { &check; } @else { 3 }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 3</span>
                <span class="text-xs font-semibold">Upload Documents</span>
              </div>
            </button>

            <span class="flex-1 min-w-3 sm:min-w-6 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 3"></span>

            <!-- Step 4: Complete Preview -->
            <button
              type="button"
              (click)="goToStep(4)"
              class="flex items-center gap-1.5 sm:gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 4"
              [class.font-semibold]="currentStep() === 4"
              [class.text-slate-400]="currentStep() < 4"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 4,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 4,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 4
                }"
                [style.color]="currentStep() >= 4 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 4) { &check; } @else { 4 }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 4</span>
                <span class="text-xs font-semibold">Complete Preview</span>
              </div>
            </button>

            <span class="flex-1 min-w-3 sm:min-w-6 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 4"></span>

            <!-- Step 5: EMD Payment (₹50,000) -->
            <button
              type="button"
              (click)="goToStep(5)"
              class="flex items-center gap-1.5 sm:gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() >= 5"
              [class.font-semibold]="currentStep() === 5"
              [class.text-slate-400]="currentStep() < 5"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() > 5,
                  'bg-[#0B3558] text-white ring-2 ring-[#0B3558]/30 scale-105': currentStep() === 5,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 5
                }"
                [style.color]="currentStep() >= 5 ? '#ffffff !important' : ''"
              >
                @if (currentStep() > 5) { &check; } @else { 5 }
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 5</span>
                <span class="text-xs font-semibold">EMD Payment</span>
              </div>
            </button>

            <span class="flex-1 min-w-3 sm:min-w-6 h-0.5 bg-slate-200" [class.bg-emerald-500]="currentStep() > 5"></span>

            <!-- Step 6: Submission & Receipt -->
            <button
              type="button"
              (click)="goToStep(6)"
              class="flex items-center gap-1.5 sm:gap-2 text-xs font-normal cursor-pointer group shrink-0 transition-colors"
              [class.text-[#0B3558]]="currentStep() === 6"
              [class.font-semibold]="currentStep() === 6"
              [class.text-slate-400]="currentStep() < 6"
            >
              <span
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-[13px] font-bold transition-all shadow-xs shrink-0"
                [ngClass]="{
                  'bg-emerald-600 text-white': currentStep() === 6,
                  'bg-slate-100 text-slate-500 border border-slate-300': currentStep() < 6
                }"
                [style.color]="currentStep() === 6 ? '#ffffff !important' : ''"
              >
                6
              </span>
              <div class="text-left leading-tight hidden md:block">
                <span class="text-[10px] uppercase text-slate-400 block font-medium">STEP 6</span>
                <span class="text-xs font-semibold">Submission Receipt</span>
              </div>
            </button>

          </nav>
        </div>
      </header>

      <!-- Main Container -->
      <main class="w-full px-3 sm:px-5 lg:px-6 pt-5 space-y-6 font-sans">
        
        <!-- Back Button -->
        <div class="flex items-center -mt-1 mb-2">
          <button
            type="button"
            (click)="goBack()"
            class="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 rounded-md border border-sky-300 bg-sky-50 hover:bg-sky-100 text-[#0483AC] active:scale-95 transition-all cursor-pointer font-semibold shadow-2xs"
            title="Back"
          >
            <svg class="w-5 h-5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            <span class="font-semibold text-sm">Back</span>
          </button>
        </div>

        <!-- ====================================================================
             SCHEME HEADER CARD (8 Parameters Strip) - SHOWN IN STEP 1 ONLY
             ==================================================================== -->
        @if (currentStep() === 1) {
          <div class="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div class="p-4 sm:p-5 lg:p-6 space-y-3.5">
              <div class="space-y-1">
                <h2 class="text-lg sm:text-xl font-bold text-[#0B3558] tracking-tight">
                  {{ schemeTitle() }}
                </h2>
                <p class="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-normal">
                  {{ schemeDescription() }}
                </p>
              </div>

              <!-- Parameters Strip -->
              <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 pt-3.5 border-t border-slate-100 text-xs">
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI REFERENCE NO.</span>
                  <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5 break-all">{{ schemeRefNo() }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME NAME</span>
                  <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeName() }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">SCHEME CATEGORY</span>
                  <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeCategory() }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EOI CATEGORY</span>
                  <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeEoiCategory() }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE PUBLISHED</span>
                  <span class="font-semibold text-slate-700 text-[11.5px] block mt-0.5">{{ schemeDatePublished() }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">DATE OF CLOSING</span>
                  <span class="font-bold text-rose-600 text-[11.5px] block mt-0.5">{{ schemeClosingDate() }}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">EMD FEE</span>
                  <span class="font-bold text-slate-800 text-[11.5px] block mt-0.5">{{ schemeEmdFee() }} <span class="text-[10px] text-slate-400 font-normal">(Refundable)</span></span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 font-medium uppercase block tracking-wider">PROCESSING FEE</span>
                  <span class="font-bold text-slate-800 text-[11.5px] block mt-0.5">{{ schemeProcessFee() }} <span class="text-[10px] text-slate-400 font-normal">(Non-Refundable)</span></span>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- ====================================================================
             STEP 1: PROCESSING FEE PAYMENT & OFFICIAL E-CHALLAN RECEIPT
             ==================================================================== -->
        @if (currentStep() === 1) {
          <div class="space-y-6 font-sans">
            
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs space-y-6">
              
              <div class="pb-4 border-b border-slate-100">
                <h3 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight">
                  Step 1: Non-Refundable EOI Application Processing Fee
                </h3>
                <p class="text-xs text-slate-500 mt-1">
                  As per RSLDC EOI guidelines, all applicants must pay the non-refundable processing fee of {{ formattedProcessFee() }} before submitting their proposal application.
                </p>
              </div>

              <!-- Fee Breakdown Box -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Fee Classification</span>
                  <span class="text-sm font-bold text-slate-800 block">EOI Tender Processing Fee</span>
                  <span class="text-[11px] text-slate-500">Major Head: 0070-60-800 (RSLDC Admin)</span>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Refundability</span>
                  <span class="text-sm font-bold text-rose-600 block">Non-Refundable</span>
                  <span class="text-[11px] text-slate-500">Government statutory scrutiny fee</span>
                </div>

                <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
                  <span class="text-[11px] font-medium text-[#0B3558] uppercase tracking-wider block">Amount Payable</span>
                  <span class="text-xl font-black text-[#0B3558] block">{{ formattedProcessFee() }}</span>
                  <span class="text-[11px] text-slate-500">{{ processFeeInWords() }}</span>
                </div>

              </div>

              <!-- ================================================================
                   PAYMENT OPTIONS (UPI, CARDS, NET BANKING, CYBER TREASURY)
                   ================================================================ -->
              @if (!procFeePaid()) {
                <div class="space-y-4 pt-2">
                  <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Payment Method for Processing Fee:
                  </label>
                  
                  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    
                    <!-- UPI -->
                    <button
                      type="button"
                      (click)="procPaymentMethod.set('upi')"
                      class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                      [ngClass]="procPaymentMethod() === 'upi' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900">UPI / QR Code</span>
                        <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                          [ngClass]="procPaymentMethod() === 'upi' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                          @if (procPaymentMethod() === 'upi') { &check; }
                        </span>
                      </div>
                      <span class="text-[10.5px] text-slate-500 block leading-tight">GPay, PhonePe, Paytm, BHIM</span>
                    </button>

                    <!-- Debit / Credit Cards -->
                    <button
                      type="button"
                      (click)="procPaymentMethod.set('card')"
                      class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                      [ngClass]="procPaymentMethod() === 'card' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900">Debit / Credit Card</span>
                        <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                          [ngClass]="procPaymentMethod() === 'card' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                          @if (procPaymentMethod() === 'card') { &check; }
                        </span>
                      </div>
                      <span class="text-[10.5px] text-slate-500 block leading-tight">Visa, RuPay, MasterCard</span>
                    </button>

                    <!-- Net Banking -->
                    <button
                      type="button"
                      (click)="procPaymentMethod.set('netbanking')"
                      class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                      [ngClass]="procPaymentMethod() === 'netbanking' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900">Net Banking</span>
                        <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                          [ngClass]="procPaymentMethod() === 'netbanking' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                          @if (procPaymentMethod() === 'netbanking') { &check; }
                        </span>
                      </div>
                      <span class="text-[10.5px] text-slate-500 block leading-tight">SBI, HDFC, ICICI, 50+ Banks</span>
                    </button>

                    <!-- Cyber Treasury e-GRAS -->
                    <button
                      type="button"
                      (click)="procPaymentMethod.set('e-gras')"
                      class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                      [ngClass]="procPaymentMethod() === 'e-gras' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                    >
                      <div class="flex items-center justify-between">
                        <span class="text-xs font-bold text-slate-900">Cyber Treasury</span>
                        <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                          [ngClass]="procPaymentMethod() === 'e-gras' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                          @if (procPaymentMethod() === 'e-gras') { &check; }
                        </span>
                      </div>
                      <span class="text-[10.5px] text-slate-500 block leading-tight">e-GRAS Rajasthan Portal</span>
                    </button>

                  </div>

                  <!-- Pay Button -->
                  <div class="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      (click)="payProcessingFeeAndProceed()"
                      [disabled]="isProcPaying()"
                      class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      @if (isProcPaying()) {
                        <span class="animate-spin text-sm">&#9696;</span>
                        <span>Authorizing Settlement...</span>
                      } @else {
                        <span>Pay {{ formattedProcessFee() }} Processing Fee &amp; Generate Challan &rarr;</span>
                      }
                    </button>
                  </div>
                </div>
              }

              <!-- ================================================================
                   OFFICIAL E-CHALLAN RECEIPT (When Paid)
                   ================================================================ -->
              @if (procFeePaid()) {
                <div class="space-y-4 pt-2">
                  <div class="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-xs space-y-4">
                    
                    <div class="flex items-center justify-between pb-3 border-b border-slate-200 flex-wrap gap-2">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                          &check;
                        </div>
                        <div>
                          <span class="text-xs font-bold text-[#0B3558] uppercase tracking-wider block">Official e-Challan Receipt</span>
                          <span class="text-[11px] text-slate-500">Cyber Treasury Rajasthan &bull; e-GRAS Ref: GRN-RAJ-2026-981240</span>
                        </div>
                      </div>

                      <div class="flex items-center gap-2">
                        <button
                          type="button"
                          (click)="downloadProcessingFeeReceipt()"
                          class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1 cursor-pointer"
                        >
                          <svg class="w-3.5 h-3.5 text-[#0483AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                          </svg>
                          <span>Download Challan</span>
                        </button>
                        <button
                          type="button"
                          (click)="printReceipt()"
                          class="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-md text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                        >
                          <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                          </svg>
                          <span>Print</span>
                        </button>
                      </div>
                    </div>

                    <!-- Receipt Parameter Grid -->
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">CHALLAN GRN NO.</span>
                        <span class="font-mono font-bold text-slate-900 text-xs">GRN-RAJ-2026-981240</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">CIN / TRANSACTION REF</span>
                        <span class="font-mono font-semibold text-slate-800 text-xs">CIN-SBI-9912081</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">PAYMENT MODE</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ selectedProcPaymentModeLabel }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">SETTLEMENT DATE</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ procFeeDate() }} 20:25:10 IST</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">REMITTER / APPLICANT</span>
                        <span class="font-bold text-slate-900 text-xs truncate block" title="{{ editableStep1.fullName }}">{{ editableStep1.fullName }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">ORGANIZATION CIN / PAN</span>
                        <span class="font-mono font-semibold text-slate-800 text-xs">{{ editableStep1.registrationNumber }} / {{ editableStep1.companyPan }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">ACCOUNT HEAD</span>
                        <span class="font-mono text-slate-800 text-xs">0070-60-800-01-00</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10.5px]">AMOUNT SETTLED</span>
                        <span class="font-black text-emerald-700 text-sm">{{ formattedProcessFee() }}</span>
                      </div>
                    </div>

                  </div>

                  <!-- Proceed to Step 2 Button -->
                  <div class="flex items-center justify-end pt-2">
                    <button
                      type="button"
                      (click)="goToStep(2)"
                      class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                    >
                      <span>Proceed to Step 2: OTR Profile &rarr;</span>
                    </button>
                  </div>
                </div>
              }

            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 2: OTR COMPLETE PROFILE (Editable Form from the start, no banner)
             ==================================================================== -->
        @if (currentStep() === 2) {
          <div class="space-y-6 font-sans">

            <!-- Single Page Container for OTR Profile in 3 Structured Boxes -->
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-10">

              <!-- ================================================================
                   1. Company Particulars & Registration Details
                   ================================================================ -->
              <div class="space-y-4">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <h4 class="text-sm sm:text-base font-bold text-[#0B3558] uppercase tracking-wide m-0">
                    1. COMPANY PARTICULARS &amp; REGISTRATION DETAILS
                  </h4>
                  <span class="text-xs text-slate-500 font-mono font-semibold">CIN: {{ editableStep1.registrationNumber || '-' }}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NAME (SHORT NAME)</label>
                    <input type="text" [(ngModel)]="editableStep1.shortName" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="e.g. SVEPL" />
                  </div>

                  <div class="sm:col-span-2">
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">FULL NAME OF ORGANIZATION</label>
                    <input type="text" [(ngModel)]="editableStep1.fullName" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Full Legal Name" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NATURE OF ENTITY</label>
                    <input type="text" [(ngModel)]="editableStep1.natureOfEntity" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="e.g. Private Limited Company" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">REGISTRATION NUMBER (CIN)</label>
                    <input type="text" [(ngModel)]="editableStep1.registrationNumber" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="CIN Number" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DATE OF REGISTRATION</label>
                    <input type="text" [(ngModel)]="editableStep1.dateOfRegistration" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="DD/MM/YYYY" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">STATE / UT OF REGISTRATION</label>
                    <input type="text" [(ngModel)]="editableStep1.stateOfLegalReg" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="State" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY PAN</label>
                    <input type="text" [(ngModel)]="editableStep1.companyPan" class="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Company PAN" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">GST REGISTERED</label>
                    <select [(ngModel)]="editableStep1.gstRegistered" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">GSTIN</label>
                    <input type="text" [(ngModel)]="editableStep1.gstin" [disabled]="editableStep1.gstRegistered !== 'Yes'" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="15-digit GSTIN" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">MSME / UDYAM REGISTERED</label>
                    <select [(ngModel)]="editableStep1.msmeRegistered" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">UDYAM REGISTRATION NO.</label>
                    <input type="text" [(ngModel)]="editableStep1.udyamNumber" [disabled]="editableStep1.msmeRegistered !== 'Yes'" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="UDYAM-RJ-XX-XXXXXXX" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">NSDC PARTNER STATUS</label>
                    <select [(ngModel)]="editableStep1.nsdcPartner" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]">
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY CONTACT NO.</label>
                    <input type="text" [(ngModel)]="editableStep1.contactNo" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Phone number" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">COMPANY EMAIL-ID</label>
                    <input type="email" [(ngModel)]="editableStep1.emailId" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Official email" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">WEBSITE</label>
                    <input type="text" [(ngModel)]="editableStep1.website" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="https://domain.com" />
                  </div>

                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">REGISTERED ADDRESS</label>
                    <textarea [(ngModel)]="editableStep1.registeredAddress" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Complete Registered Address"></textarea>
                  </div>

                  <div class="sm:col-span-2 lg:col-span-3">
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICE ADDRESS</label>
                    <textarea [(ngModel)]="editableStep1.officeAddress" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Corporate / Branch Office Address"></textarea>
                  </div>
                </div>

                <!-- Attached Registration Documents -->
                <div class="pt-3 border-t border-slate-100">
                  <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                    ATTACHED REGISTRATION DOCUMENTS
                  </span>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    
                    <!-- Doc 1: Certificate of Incorporation -->
                    @if (editableStep1.registrationCertDoc && editableStep1.registrationCertDoc.status === 'uploaded') {
                      <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Certificate of Incorporation</span>
                            <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.registrationCertDoc.fileName }}">
                              {{ editableStep1.registrationCertDoc.fileName }}
                            </span>
                            <div class="mt-0.5">
                              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                {{ editableStep1.registrationCertDoc.fileSize || '1.4 MB' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            (click)="viewDoc(editableStep1.registrationCertDoc.fileName, 'Certificate of Incorporation', editableStep1.registrationCertDoc.fileSize || '1.4 MB')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <label
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                            title="Change Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Change</span>
                            <input type="file" (change)="replaceOtrDoc($event, 'regCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                          </label>
                          <button
                            type="button"
                            (click)="removeOtrDoc('regCert')"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <span class="text-xs text-slate-500 font-medium">Certificate of Incorporation</span>
                        <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Document</span>
                          <input type="file" (change)="replaceOtrDoc($event, 'regCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                    }

                    <!-- Doc 2: Organization PAN Card -->
                    @if (editableStep1.panCardDoc && editableStep1.panCardDoc.status === 'uploaded') {
                      <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Organization PAN Card</span>
                            <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.panCardDoc.fileName }}">
                              {{ editableStep1.panCardDoc.fileName }}
                            </span>
                            <div class="mt-0.5">
                              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                {{ editableStep1.panCardDoc.fileSize || '840 KB' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            (click)="viewDoc(editableStep1.panCardDoc.fileName, 'Organization PAN Card', editableStep1.panCardDoc.fileSize || '840 KB')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <label
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                            title="Change Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Change</span>
                            <input type="file" (change)="replaceOtrDoc($event, 'panCard')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                          </label>
                          <button
                            type="button"
                            (click)="removeOtrDoc('panCard')"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <span class="text-xs text-slate-500 font-medium">Organization PAN Card</span>
                        <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Document</span>
                          <input type="file" (change)="replaceOtrDoc($event, 'panCard')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                    }

                    <!-- Doc 3: GST Certificate -->
                    @if (editableStep1.gstCertDoc && editableStep1.gstCertDoc.status === 'uploaded') {
                      <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">GST Certificate</span>
                            <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.gstCertDoc.fileName }}">
                              {{ editableStep1.gstCertDoc.fileName }}
                            </span>
                            <div class="mt-0.5">
                              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                {{ editableStep1.gstCertDoc.fileSize || '920 KB' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            (click)="viewDoc(editableStep1.gstCertDoc.fileName, 'GST Certificate', editableStep1.gstCertDoc.fileSize || '920 KB')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <label
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                            title="Change Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Change</span>
                            <input type="file" (change)="replaceOtrDoc($event, 'gstCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                          </label>
                          <button
                            type="button"
                            (click)="removeOtrDoc('gstCert')"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <span class="text-xs text-slate-500 font-medium">GST Certificate</span>
                        <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Document</span>
                          <input type="file" (change)="replaceOtrDoc($event, 'gstCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                    }

                    <!-- Doc 4: Udyam Certificate -->
                    @if (editableStep1.msmeCertDoc && editableStep1.msmeCertDoc.status === 'uploaded') {
                      <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Udyam Certificate</span>
                            <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.msmeCertDoc.fileName }}">
                              {{ editableStep1.msmeCertDoc.fileName }}
                            </span>
                            <div class="mt-0.5">
                              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                {{ editableStep1.msmeCertDoc.fileSize || '650 KB' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            (click)="viewDoc(editableStep1.msmeCertDoc.fileName, 'Udyam Certificate', editableStep1.msmeCertDoc.fileSize || '650 KB')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <label
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                            title="Change Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Change</span>
                            <input type="file" (change)="replaceOtrDoc($event, 'msmeCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                          </label>
                          <button
                            type="button"
                            (click)="removeOtrDoc('msmeCert')"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <span class="text-xs text-slate-500 font-medium">Udyam Certificate</span>
                        <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Document</span>
                          <input type="file" (change)="replaceOtrDoc($event, 'msmeCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                    }

                  </div>
                </div>

              </div>

              <!-- ================================================================
                   2. Authorized Signatory / Person Details
                   ================================================================ -->
              <div class="space-y-4 pt-6 border-t border-slate-200">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <h4 class="text-sm sm:text-base font-bold text-[#0B3558] uppercase tracking-wide m-0">
                    2. AUTHORIZED SIGNATORY / PERSON DETAILS
                  </h4>
                  <span class="text-xs text-slate-500 font-semibold">Designated Signatory</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">FULL NAME</label>
                    <input type="text" [(ngModel)]="editableStep3.name" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Signatory Full Name" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DESIGNATION</label>
                    <input type="text" [(ngModel)]="editableStep3.designation" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="e.g. Director" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">DATE OF BIRTH / AGE</label>
                    <input type="text" [(ngModel)]="editableStep3.dob" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="DD/MM/YYYY" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICIAL MOBILE NO.</label>
                    <input type="text" [(ngModel)]="editableStep3.mobileNo" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Mobile Number" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">OFFICIAL EMAIL-ID</label>
                    <input type="email" [(ngModel)]="editableStep3.emailId" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Official Email" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">PAN</label>
                    <input type="text" [(ngModel)]="editableStep3.pan" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Signatory PAN" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">AADHAAR NUMBER</label>
                    <input type="text" [(ngModel)]="editableStep3.aadhaarNo" class="w-full px-3 py-2 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="XXXX-XXXX-XXXX" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">STATE</label>
                    <input type="text" [(ngModel)]="editableStep3.state" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="State" />
                  </div>

                  <div class="sm:col-span-2 lg:col-span-4">
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">RESIDENCE ADDRESS</label>
                    <textarea [(ngModel)]="editableStep3.residenceAddress" rows="2" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Complete Residential Address"></textarea>
                  </div>
                </div>

                <!-- Attached Signatory Documents -->
                <div class="pt-3 border-t border-slate-100">
                  <span class="text-[11px] font-bold text-slate-600 uppercase tracking-wider block mb-2.5">
                    ATTACHED SIGNATORY DOCUMENTS
                  </span>
                  
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    
                    <!-- Doc 1: Authorization Letter / Resolution -->
                    @if (editableStep3.authorizationLetterDoc && editableStep3.authorizationLetterDoc.status === 'uploaded') {
                      <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Authorization Letter / Board Resolution</span>
                            <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep3.authorizationLetterDoc.fileName }}">
                              {{ editableStep3.authorizationLetterDoc.fileName }}
                            </span>
                            <div class="mt-0.5">
                              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                {{ editableStep3.authorizationLetterDoc.fileSize || '1.1 MB' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            (click)="viewDoc(editableStep3.authorizationLetterDoc.fileName, 'Authorization Letter / Resolution', editableStep3.authorizationLetterDoc.fileSize || '1.1 MB')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <label
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                            title="Change Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Change</span>
                            <input type="file" (change)="replaceOtrDoc($event, 'authLetter')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                          </label>
                          <button
                            type="button"
                            (click)="removeOtrDoc('authLetter')"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <span class="text-xs text-slate-500 font-medium">Authorization Letter / Board Resolution</span>
                        <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Document</span>
                          <input type="file" (change)="replaceOtrDoc($event, 'authLetter')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                    }

                    <!-- Doc 2: Identity Proof -->
                    @if (editableStep3.idProofDoc && editableStep3.idProofDoc.status === 'uploaded') {
                      <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Signatory Identity Proof</span>
                            <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep3.idProofDoc.fileName }}">
                              {{ editableStep3.idProofDoc.fileName }}
                            </span>
                            <div class="mt-0.5">
                              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                {{ editableStep3.idProofDoc.fileSize || '780 KB' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            (click)="viewDoc(editableStep3.idProofDoc.fileName, 'Signatory Identity Proof', editableStep3.idProofDoc.fileSize || '780 KB')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <label
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                            title="Change Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Change</span>
                            <input type="file" (change)="replaceOtrDoc($event, 'authIdProof')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                          </label>
                          <button
                            type="button"
                            (click)="removeOtrDoc('authIdProof')"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
                        <span class="text-xs text-slate-500 font-medium">Signatory Identity Proof</span>
                        <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Document</span>
                          <input type="file" (change)="replaceOtrDoc($event, 'authIdProof')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                    }

                  </div>
                </div>

              </div>

              <!-- ================================================================
                   3. Bank Account Details
                   ================================================================ -->
              <div class="space-y-4 pt-6 border-t border-slate-200">
                <div class="flex items-center justify-between pb-3 border-b border-slate-100 flex-wrap gap-2">
                  <h4 class="text-sm sm:text-base font-bold text-[#0B3558] uppercase tracking-wide m-0">
                    3. BANK ACCOUNT DETAILS
                  </h4>
                  <span class="text-xs text-slate-500 font-mono font-semibold">IFSC: {{ editableStep4.ifscCode || '-' }}</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">BANK NAME</label>
                    <input type="text" [(ngModel)]="editableStep4.bankName" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Bank Name" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">BRANCH NAME</label>
                    <input type="text" [(ngModel)]="editableStep4.branchName" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Branch Name" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">ACCOUNT TYPE</label>
                    <select [(ngModel)]="editableStep4.accountType" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]">
                      <option value="Current Account">Current Account</option>
                      <option value="Savings Account">Savings Account</option>
                    </select>
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">ACCOUNT HOLDER NAME</label>
                    <input type="text" [(ngModel)]="editableStep4.accountHolderName" class="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Account Holder Name" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">ACCOUNT NUMBER</label>
                    <input type="text" [(ngModel)]="editableStep4.accountNo" class="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="Account Number" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">IFSC CODE</label>
                    <input type="text" [(ngModel)]="editableStep4.ifscCode" class="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="IFSC Code" />
                  </div>

                  <div>
                    <label class="text-slate-600 block text-[10.5px] uppercase font-bold mb-1">TRANSFER MODE</label>
                    <input type="text" [(ngModel)]="editableStep4.transferMode" class="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#0B3558]" placeholder="NEFT / RTGS" />
                  </div>

                  <!-- Cancelled Cheque Attached Doc -->
                  <div class="sm:col-span-2 lg:col-span-4 pt-1">
                    @if (editableStep4.cancelledChequeDoc && editableStep4.cancelledChequeDoc.status === 'uploaded') {
                      <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs max-w-xl">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                          <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                            <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                            <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                          </svg>
                          <div class="flex flex-col min-w-0">
                            <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Cancelled Cheque / Passbook</span>
                            <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep4.cancelledChequeDoc.fileName }}">
                              {{ editableStep4.cancelledChequeDoc.fileName }}
                            </span>
                            <div class="mt-0.5">
                              <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                {{ editableStep4.cancelledChequeDoc.fileSize || '890 KB' }}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div class="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            (click)="viewDoc(editableStep4.cancelledChequeDoc.fileName, 'Cancelled Cheque', editableStep4.cancelledChequeDoc.fileSize || '890 KB')"
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                            title="Preview Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            <span>View</span>
                          </button>
                          <label
                            class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                            title="Change Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            <span>Change</span>
                            <input type="file" (change)="replaceOtrDoc($event, 'bankDoc')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                          </label>
                          <button
                            type="button"
                            (click)="removeOtrDoc('bankDoc')"
                            class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                            title="Remove Document"
                          >
                            <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            <span>Remove</span>
                          </button>
                        </div>
                      </div>
                    } @else {
                      <div class="flex items-center justify-between gap-2.5 p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl max-w-xl">
                        <span class="text-xs text-slate-500 font-medium">Cancelled Cheque / Passbook</span>
                        <label class="px-3 py-1.5 rounded border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 transition-colors cursor-pointer shadow-2xs shrink-0 flex items-center gap-1.5">
                          <svg class="w-3.5 h-3.5 text-slate-600 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                          </svg>
                          <span>Upload Document</span>
                          <input type="file" (change)="replaceOtrDoc($event, 'bankDoc')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                        </label>
                      </div>
                    }
                  </div>

                </div>

              </div>

            </div>

            <!-- Footer Action Bar -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
              <button
                type="button"
                (click)="goToStep(1)"
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                &larr; Back to Processing Fee
              </button>

              <button
                type="button"
                (click)="saveAndProceedToStep3()"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Proceed to Upload Documents &rarr;
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 3: UPLOAD DOCUMENTS (16 Documents with Category Tabs)
             ==================================================================== -->
        @if (currentStep() === 3) {
          <div class="space-y-6 font-sans">
            
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-6">
              
              <!-- Header Strip with "Attach All Mandated Annexures" -->
              <div class="flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight">
                    Mandatory EOI Proposal Documents Checklist (16 Documents)
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">
                    Separated into Mandatory Statutory Documents, Official Scheme Annexures, and Supporting Documents.
                  </p>
                </div>

                <button
                  type="button"
                  (click)="attachAllSampleDocs()"
                  class="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 rounded-lg text-xs font-semibold shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <span>Attach All Mandated Annexures</span>
                </button>
              </div>

              <!-- Filter Tabs matching user screenshot -->
              <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 text-xs">
                
                <button
                  type="button"
                  (click)="selectedDocTab.set('all')"
                  class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0"
                  [ngClass]="selectedDocTab() === 'all' ? 'bg-[#0B3558] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  All Documents (16)
                </button>

                <button
                  type="button"
                  (click)="selectedDocTab.set('mandatory')"
                  class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedDocTab() === 'mandatory' ? 'bg-[#0B3558] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <span>1. Mandatory Statutory Documents</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="selectedDocTab() === 'mandatory' ? 'bg-white/20 text-white' : 'bg-rose-100 text-rose-700 font-bold'">
                    {{ mandatoryAttachedCount() }}/6
                  </span>
                </button>

                <button
                  type="button"
                  (click)="selectedDocTab.set('annexure')"
                  class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedDocTab() === 'annexure' ? 'bg-[#0B3558] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <span>2. Scheme Annexures</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="selectedDocTab() === 'annexure' ? 'bg-white/20 text-white' : 'bg-sky-100 text-sky-700 font-bold'">
                    {{ annexureAttachedCount() }}/8
                  </span>
                </button>

                <button
                  type="button"
                  (click)="selectedDocTab.set('remaining')"
                  class="px-3.5 py-1.5 rounded-lg font-semibold transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
                  [ngClass]="selectedDocTab() === 'remaining' ? 'bg-[#0B3558] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'"
                >
                  <span>3. Remaining Documents</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded" [ngClass]="selectedDocTab() === 'remaining' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700 font-bold'">
                    {{ remainingAttachedCount() }}/2
                  </span>
                </button>

              </div>

              <!-- 16 Document Cards Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-3.5 pt-2">
                @for (doc of filteredDocuments(); track doc.id) {
                  <div class="p-3.5 sm:p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-3 text-xs">
                    
                    <!-- Left: Number badge, title, tag, status -->
                    <div class="flex items-start gap-3 min-w-0">
                      
                      <!-- Number Badge -->
                      <span
                        class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                        [ngClass]="{
                          'bg-rose-100 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                          'bg-sky-100 text-sky-700 border border-sky-200': doc.category === 'annexure',
                          'bg-slate-100 text-slate-700 border border-slate-200': doc.category === 'remaining'
                        }"
                      >
                        {{ doc.id }}
                      </span>

                      <!-- Name & Status -->
                      <div class="min-w-0">
                        <div class="flex items-center gap-1.5 flex-wrap">
                          <span class="font-bold text-slate-800 text-xs sm:text-[12.5px] leading-tight">
                            {{ doc.name }}
                          </span>
                          
                          <!-- Tag Pill -->
                          @if (doc.category === 'mandatory') {
                            <span class="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                              Mandatory
                            </span>
                          } @else if (doc.category === 'annexure') {
                            <span class="text-[10px] font-bold text-sky-700 bg-sky-50 px-1.5 py-0.2 rounded border border-sky-100">
                              Annexure
                            </span>
                          } @else {
                            <span class="text-[10px] font-semibold text-slate-600 bg-slate-100 px-1.5 py-0.2 rounded">
                              Supporting
                            </span>
                          }
                        </div>

                        @if (doc.status === 'uploaded' && doc.fileName) {
                          <span class="text-[11px] font-mono text-slate-600 block mt-1 truncate" title="{{ doc.fileName }} ({{ doc.fileSize }})">
                            {{ doc.fileName }} ({{ doc.fileSize }})
                          </span>
                        }
                      </div>

                    </div>

                    <!-- Right Action Button -->
                    <div class="flex items-center gap-1.5 shrink-0">
                      @if (doc.status === 'pending') {
                        <label class="px-3.5 py-1.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs transition-colors flex items-center gap-1">
                          <span>Upload PDF</span>
                          <input type="file" (change)="onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                        </label>
                      } @else {
                        <button
                          type="button"
                          (click)="viewDoc(doc.fileName, doc.name, doc.fileSize)"
                          class="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium cursor-pointer"
                        >
                          View
                        </button>
                        <label class="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 border border-sky-200 text-[#0483AC] rounded-md text-xs font-medium cursor-pointer">
                          Replace
                          <input type="file" (change)="onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                        </label>
                      }
                    </div>

                  </div>
                }
              </div>

            </div>

            <!-- Footer Action Bar -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
              <button
                type="button"
                (click)="goToStep(2)"
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                &larr; Back to OTR Profile
              </button>

              <button
                type="button"
                (click)="goToStep(4)"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Proceed to Complete Preview &rarr;
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 4: COMPLETE PREVIEW (Full OTR Form + Uploaded Docs + Fee Status)
             ==================================================================== -->
        @if (currentStep() === 4) {
          <div class="space-y-6 font-sans">
            
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-8">
              
              <div class="pb-3 border-b border-slate-100 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight">
                    Step 4: Complete Application Preview
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Please review all verified profile information, fee payment status, and uploaded proposal documents before committing the EMD deposit.
                  </p>
                </div>
                <button
                  type="button"
                  (click)="printReceipt()"
                  class="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5"
                >
                  <svg class="w-3.5 h-3.5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>Print Preview</span>
                </button>
              </div>

              <!-- 1. Processing Fee Status -->
              <div class="p-4 rounded-xl bg-blue-50/50 border border-blue-200 text-xs space-y-2">
                <div class="flex items-center justify-between flex-wrap gap-2 pb-1.5 border-b border-blue-200">
                  <span class="font-bold text-[#0B3558] uppercase tracking-wider text-[11px]">1. Processing Fee Verification</span>
                  <span class="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">✓ Paid ({{ formattedProcessFee() }})</span>
                </div>
                <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11.5px] text-slate-700">
                  <div>Amount: <strong class="font-bold text-slate-900">{{ formattedProcessFee() }}</strong></div>
                  <div>Mode: <strong>{{ selectedProcPaymentModeLabel }}</strong></div>
                  <div>Challan GRN: <strong class="font-mono text-slate-900">GRN-RAJ-2026-981240</strong></div>
                  <div>Settled On: <strong>{{ procFeeDate() }}</strong></div>
                </div>
              </div>

              <!-- 2. Full OTR Profile Form (All 4 Sections with Inline Edit in Preview) -->
              <div class="space-y-6">
                
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-200 flex-wrap gap-2">
                  <div class="flex items-center gap-2">
                    <span class="font-bold text-[#0B3558] uppercase tracking-wider text-[12px]">2. Complete Verified OTR Profile Details</span>
                    @if (isEditingOtrInPreview()) {
                      <span class="text-[10.5px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        Editing Mode Active
                      </span>
                    }
                  </div>
                  <button
                    type="button"
                    (click)="togglePreviewOtrEdit()"
                    class="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    [ngClass]="isEditingOtrInPreview() ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-white hover:bg-slate-50 border border-[#0B3558] text-[#0B3558]'"
                  >
                    @if (isEditingOtrInPreview()) {
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Save OTR Profile Changes</span>
                    } @else {
                      <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span>Edit Profile Here</span>
                    }
                  </button>
                </div>

                <!-- Section 1: Company Particulars -->
                <div class="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-4 text-xs">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                    <span class="font-bold text-slate-800 uppercase text-[11px]">1. Company Particulars &amp; Registration Details</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-slate-500 font-semibold">CIN: {{ editableStep1.registrationNumber || '-' }}</span>
                      <button
                        type="button"
                        (click)="togglePreviewOtrEdit()"
                        class="px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        [ngClass]="isEditingOtrInPreview() ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-[#0B3558] text-[#0B3558] hover:bg-slate-50'"
                      >
                        {{ isEditingOtrInPreview() ? 'Done' : 'Edit' }}
                      </button>
                    </div>
                  </div>

                  @if (isEditingOtrInPreview()) {
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Short Name</label>
                        <input type="text" [(ngModel)]="editableStep1.shortName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                      </div>
                      <div class="sm:col-span-2">
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Full Name of Organization</label>
                        <input type="text" [(ngModel)]="editableStep1.fullName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Nature of Entity</label>
                        <input type="text" [(ngModel)]="editableStep1.natureOfEntity" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">CIN Number</label>
                        <input type="text" [(ngModel)]="editableStep1.registrationNumber" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Registration Date</label>
                        <input type="text" [(ngModel)]="editableStep1.dateOfRegistration" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">State / UT</label>
                        <input type="text" [(ngModel)]="editableStep1.stateOfLegalReg" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Company PAN</label>
                        <input type="text" [(ngModel)]="editableStep1.companyPan" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#0B3558]" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">GST Registered</label>
                        <select [(ngModel)]="editableStep1.gstRegistered" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">GSTIN</label>
                        <input type="text" [(ngModel)]="editableStep1.gstin" [disabled]="editableStep1.gstRegistered !== 'Yes'" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white disabled:opacity-60 disabled:cursor-not-allowed" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Udyam Registration</label>
                        <input type="text" [(ngModel)]="editableStep1.udyamNumber" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Contact No</label>
                        <input type="text" [(ngModel)]="editableStep1.contactNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Email ID</label>
                        <input type="email" [(ngModel)]="editableStep1.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div class="sm:col-span-2 lg:col-span-3">
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Registered Address</label>
                        <textarea [(ngModel)]="editableStep1.registeredAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"></textarea>
                      </div>
                      <div class="sm:col-span-2 lg:col-span-3">
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Office Address</label>
                        <textarea [(ngModel)]="editableStep1.officeAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"></textarea>
                      </div>
                    </div>
                  } @else {
                    <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Short Name</span>
                        <span class="font-bold text-slate-800 text-xs">{{ editableStep1.shortName || '-' }}</span>
                      </div>
                      <div class="sm:col-span-2">
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Full Name</span>
                        <span class="font-bold text-slate-800 text-xs">{{ editableStep1.fullName || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Nature of Entity</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep1.natureOfEntity || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Registration Date</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep1.dateOfRegistration || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">State / UT</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep1.stateOfLegalReg || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Company PAN</span>
                        <span class="font-mono font-bold text-slate-800 text-xs">{{ editableStep1.companyPan || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">GSTIN</span>
                        <span class="font-mono font-semibold text-slate-800 text-xs">{{ editableStep1.gstRegistered === 'Yes' ? (editableStep1.gstin || '-') : 'Not Applicable' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Udyam Registration</span>
                        <span class="font-mono font-semibold text-slate-800 text-xs">{{ editableStep1.msmeRegistered === 'Yes' ? (editableStep1.udyamNumber || '-') : 'Not Applicable' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">NSDC Partner Status</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep1.nsdcPartner || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Contact Number</span>
                        <span class="font-mono font-semibold text-slate-800 text-xs">{{ editableStep1.contactNo || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Official Email-ID</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep1.emailId || '-' }}</span>
                      </div>
                      <div class="sm:col-span-2">
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Registered Address</span>
                        <span class="font-semibold text-slate-800 text-xs block leading-tight">{{ registeredAddressText }}</span>
                      </div>
                      <div class="sm:col-span-2">
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Office Address</span>
                        <span class="font-semibold text-slate-800 text-xs block leading-tight">{{ officeAddressText }}</span>
                      </div>
                    </div>
                  }

                  <!-- Attached Registration Documents in Preview -->
                  <div class="pt-2 border-t border-slate-200/80">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Attached Registration Documents</span>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      
                      <!-- Inc. Certificate -->
                      @if (editableStep1.registrationCertDoc && editableStep1.registrationCertDoc.status === 'uploaded') {
                        <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                            </svg>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Certificate of Incorporation</span>
                              <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.registrationCertDoc.fileName }}">
                                {{ editableStep1.registrationCertDoc.fileName }}
                              </span>
                              <div class="mt-0.5">
                                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                  {{ editableStep1.registrationCertDoc.fileSize || '1.4 MB' }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              (click)="viewDoc(editableStep1.registrationCertDoc.fileName, 'Certificate of Incorporation', editableStep1.registrationCertDoc.fileSize || '1.4 MB')"
                              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            @if (isEditingOtrInPreview()) {
                              <label
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                                title="Change Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Change</span>
                                <input type="file" (change)="replaceOtrDoc($event, 'regCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                              </label>
                              <button
                                type="button"
                                (click)="removeOtrDoc('regCert')"
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            }
                          </div>
                        </div>
                      }

                      <!-- Company PAN -->
                      @if (editableStep1.panCardDoc && editableStep1.panCardDoc.status === 'uploaded') {
                        <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                            </svg>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Organization PAN Card</span>
                              <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.panCardDoc.fileName }}">
                                {{ editableStep1.panCardDoc.fileName }}
                              </span>
                              <div class="mt-0.5">
                                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                  {{ editableStep1.panCardDoc.fileSize || '840 KB' }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              (click)="viewDoc(editableStep1.panCardDoc.fileName, 'Organization PAN Card', editableStep1.panCardDoc.fileSize || '840 KB')"
                              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            @if (isEditingOtrInPreview()) {
                              <label
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                                title="Change Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Change</span>
                                <input type="file" (change)="replaceOtrDoc($event, 'panCard')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                              </label>
                              <button
                                type="button"
                                (click)="removeOtrDoc('panCard')"
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            }
                          </div>
                        </div>
                      }

                      <!-- GST Certificate -->
                      @if (editableStep1.gstCertDoc && editableStep1.gstCertDoc.status === 'uploaded') {
                        <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                            </svg>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">GST Certificate</span>
                              <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.gstCertDoc.fileName }}">
                                {{ editableStep1.gstCertDoc.fileName }}
                              </span>
                              <div class="mt-0.5">
                                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                  {{ editableStep1.gstCertDoc.fileSize || '920 KB' }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              (click)="viewDoc(editableStep1.gstCertDoc.fileName, 'GST Certificate', editableStep1.gstCertDoc.fileSize || '920 KB')"
                              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            @if (isEditingOtrInPreview()) {
                              <label
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                                title="Change Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Change</span>
                                <input type="file" (change)="replaceOtrDoc($event, 'gstCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                              </label>
                              <button
                                type="button"
                                (click)="removeOtrDoc('gstCert')"
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            }
                          </div>
                        </div>
                      }

                      <!-- Udyam Cert -->
                      @if (editableStep1.msmeCertDoc && editableStep1.msmeCertDoc.status === 'uploaded') {
                        <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                            </svg>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Udyam Certificate</span>
                              <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep1.msmeCertDoc.fileName }}">
                                {{ editableStep1.msmeCertDoc.fileName }}
                              </span>
                              <div class="mt-0.5">
                                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                  {{ editableStep1.msmeCertDoc.fileSize || '650 KB' }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              (click)="viewDoc(editableStep1.msmeCertDoc.fileName, 'Udyam Certificate', editableStep1.msmeCertDoc.fileSize || '650 KB')"
                              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            @if (isEditingOtrInPreview()) {
                              <label
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                                title="Change Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Change</span>
                                <input type="file" (change)="replaceOtrDoc($event, 'msmeCert')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                              </label>
                              <button
                                type="button"
                                (click)="removeOtrDoc('msmeCert')"
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            }
                          </div>
                        </div>
                      }

                    </div>
                  </div>
                </div>

                <!-- Section 2: Authorized Signatory -->
                <div class="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 text-xs">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                    <span class="font-bold text-slate-800 uppercase text-[11px]">2. Authorized Signatory / Person Details</span>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-500 font-semibold">Designated Signatory</span>
                      <button
                        type="button"
                        (click)="togglePreviewOtrEdit()"
                        class="px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        [ngClass]="isEditingOtrInPreview() ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-[#0B3558] text-[#0B3558] hover:bg-slate-50'"
                      >
                        {{ isEditingOtrInPreview() ? 'Done' : 'Edit' }}
                      </button>
                    </div>
                  </div>

                  @if (isEditingOtrInPreview()) {
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Full Name</label>
                        <input type="text" [(ngModel)]="editableStep3.name" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Designation</label>
                        <input type="text" [(ngModel)]="editableStep3.designation" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Mobile No</label>
                        <input type="text" [(ngModel)]="editableStep3.mobileNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Email ID</label>
                        <input type="email" [(ngModel)]="editableStep3.emailId" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">PAN</label>
                        <input type="text" [(ngModel)]="editableStep3.pan" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Aadhaar No</label>
                        <input type="text" [(ngModel)]="editableStep3.aadhaarNo" class="w-full px-2.5 py-1.5 text-xs font-mono border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div class="sm:col-span-2">
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Residence Address</label>
                        <textarea [(ngModel)]="editableStep3.residenceAddress" rows="2" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"></textarea>
                      </div>
                    </div>
                  } @else {
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Full Name</span>
                        <span class="font-bold text-slate-800 text-xs">{{ editableStep3.name || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Designation</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep3.designation || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Mobile No.</span>
                        <span class="font-mono font-semibold text-slate-800 text-xs">{{ editableStep3.mobileNo || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Email-ID</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep3.emailId || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">PAN</span>
                        <span class="font-mono font-bold text-slate-800 text-xs">{{ editableStep3.pan || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Aadhaar No.</span>
                        <span class="font-mono font-semibold text-slate-800 text-xs">{{ editableStep3.aadhaarNo || '-' }}</span>
                      </div>
                      <div class="sm:col-span-2">
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Residence Address</span>
                        <span class="font-semibold text-slate-800 text-xs block leading-tight">{{ residenceAddressText }}</span>
                      </div>
                    </div>
                  }

                  <div class="pt-2 border-t border-slate-200/80">
                    <span class="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-2">Attached Signatory Documents</span>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs">
                      <!-- Authorization Letter -->
                      @if (editableStep3.authorizationLetterDoc && editableStep3.authorizationLetterDoc.status === 'uploaded') {
                        <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                            </svg>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Authorization Letter / Resolution</span>
                              <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep3.authorizationLetterDoc.fileName }}">
                                {{ editableStep3.authorizationLetterDoc.fileName }}
                              </span>
                              <div class="mt-0.5">
                                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                  {{ editableStep3.authorizationLetterDoc.fileSize || '1.1 MB' }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              (click)="viewDoc(editableStep3.authorizationLetterDoc.fileName, 'Authorization Letter', editableStep3.authorizationLetterDoc.fileSize || '1.1 MB')"
                              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            @if (isEditingOtrInPreview()) {
                              <label
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                                title="Change Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Change</span>
                                <input type="file" (change)="replaceOtrDoc($event, 'authLetter')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                              </label>
                              <button
                                type="button"
                                (click)="removeOtrDoc('authLetter')"
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            }
                          </div>
                        </div>
                      }

                      <!-- Identity Proof -->
                      @if (editableStep3.idProofDoc && editableStep3.idProofDoc.status === 'uploaded') {
                        <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs">
                          <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                              <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                              <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                            </svg>
                            <div class="flex flex-col min-w-0">
                              <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Signatory Identity Proof</span>
                              <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep3.idProofDoc.fileName }}">
                                {{ editableStep3.idProofDoc.fileName }}
                              </span>
                              <div class="mt-0.5">
                                <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                  {{ editableStep3.idProofDoc.fileSize || '780 KB' }}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div class="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              (click)="viewDoc(editableStep3.idProofDoc.fileName, 'Signatory Identity Proof', editableStep3.idProofDoc.fileSize || '780 KB')"
                              class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                              title="Preview Document"
                            >
                              <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              <span>View</span>
                            </button>
                            @if (isEditingOtrInPreview()) {
                              <label
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                                title="Change Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Change</span>
                                <input type="file" (change)="replaceOtrDoc($event, 'authIdProof')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                              </label>
                              <button
                                type="button"
                                (click)="removeOtrDoc('authIdProof')"
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </div>
                </div>

                <!-- Section 3: Bank Details -->
                <div class="p-4 sm:p-5 rounded-xl bg-slate-50/70 border border-slate-200 space-y-3 text-xs">
                  <div class="flex items-center justify-between pb-2 border-b border-slate-200 flex-wrap gap-2">
                    <span class="font-bold text-slate-800 uppercase text-[11px]">3. Bank Account Details</span>
                    <div class="flex items-center gap-2">
                      <span class="font-mono text-slate-500 font-semibold">IFSC: {{ editableStep4.ifscCode || '-' }}</span>
                      <button
                        type="button"
                        (click)="togglePreviewOtrEdit()"
                        class="px-2.5 py-0.5 rounded text-[10.5px] font-bold transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        [ngClass]="isEditingOtrInPreview() ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-white border border-[#0B3558] text-[#0B3558] hover:bg-slate-50'"
                      >
                        {{ isEditingOtrInPreview() ? 'Done' : 'Edit' }}
                      </button>
                    </div>
                  </div>

                  @if (isEditingOtrInPreview()) {
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 text-xs">
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Bank Name</label>
                        <input type="text" [(ngModel)]="editableStep4.bankName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Branch Name</label>
                        <input type="text" [(ngModel)]="editableStep4.branchName" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Type</label>
                        <select [(ngModel)]="editableStep4.accountType" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white">
                          <option value="Current Account">Current Account</option>
                          <option value="Savings Account">Savings Account</option>
                        </select>
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Holder</label>
                        <input type="text" [(ngModel)]="editableStep4.accountHolderName" class="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Account Number</label>
                        <input type="text" [(ngModel)]="editableStep4.accountNo" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">IFSC Code</label>
                        <input type="text" [(ngModel)]="editableStep4.ifscCode" class="w-full px-2.5 py-1.5 text-xs font-mono font-bold border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div>
                        <label class="text-slate-600 block text-[10px] uppercase font-bold mb-1">Transfer Mode</label>
                        <input type="text" [(ngModel)]="editableStep4.transferMode" class="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg bg-white" />
                      </div>
                      <div class="sm:col-span-2 lg:col-span-4 pt-1">
                        @if (editableStep4.cancelledChequeDoc && editableStep4.cancelledChequeDoc.status === 'uploaded') {
                          <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs max-w-xl">
                            <div class="flex items-center gap-2.5 min-w-0 flex-1">
                              <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                                <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                                <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                              </svg>
                              <div class="flex flex-col min-w-0">
                                <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Cancelled Cheque / Passbook</span>
                                <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep4.cancelledChequeDoc.fileName }}">
                                  {{ editableStep4.cancelledChequeDoc.fileName }}
                                </span>
                                <div class="mt-0.5">
                                  <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                    {{ editableStep4.cancelledChequeDoc.fileSize || '890 KB' }}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                (click)="viewDoc(editableStep4.cancelledChequeDoc.fileName, 'Cancelled Cheque', editableStep4.cancelledChequeDoc.fileSize || '890 KB')"
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                                title="Preview Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View</span>
                              </button>
                              <label
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 rounded transition-colors cursor-pointer"
                                title="Change Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                <span>Change</span>
                                <input type="file" (change)="replaceOtrDoc($event, 'bankDoc')" class="hidden" accept=".pdf,.png,.jpg,.jpeg" />
                              </label>
                              <button
                                type="button"
                                (click)="removeOtrDoc('bankDoc')"
                                class="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                                title="Remove Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                <span>Remove</span>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  } @else {
                    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Bank Name</span>
                        <span class="font-bold text-slate-800 text-xs">{{ editableStep4.bankName || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Branch</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep4.branchName || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Account Type</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep4.accountType || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Account Holder</span>
                        <span class="font-bold text-slate-800 text-xs">{{ editableStep4.accountHolderName || editableStep1.fullName || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Account Number</span>
                        <span class="font-mono font-bold text-slate-800 text-xs">{{ editableStep4.accountNo || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">IFSC Code</span>
                        <span class="font-mono font-bold text-slate-800 text-xs">{{ editableStep4.ifscCode || '-' }}</span>
                      </div>
                      <div>
                        <span class="text-slate-400 block text-[10px] uppercase font-medium">Transfer Mode</span>
                        <span class="font-semibold text-slate-800 text-xs">{{ editableStep4.transferMode || 'NEFT / RTGS' }}</span>
                      </div>
                      <div class="sm:col-span-2 lg:col-span-4 pt-1">
                        @if (editableStep4.cancelledChequeDoc && editableStep4.cancelledChequeDoc.status === 'uploaded') {
                          <div class="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 shadow-2xs max-w-xl">
                            <div class="flex items-center gap-2.5 min-w-0 flex-1">
                              <svg class="w-5 h-5 shrink-0 select-none shadow-xs" viewBox="0 0 24 24">
                                <rect width="24" height="24" rx="3.5" fill="#E5252A"/>
                                <path d="M5.2 15V9h2.8c1 0 1.7.7 1.7 1.5s-.7 1.5-1.7 1.5H6.7v3H5.2zm1.5-4.2h1.2c.4 0 .6-.3.6-.6s-.2-.6-.6-.6H6.7v1.2zm4.5 4.2V9h2.2c1.7 0 2.8 1.1 2.8 3s-1.1 3-2.8 3h-2.2zm1.5-1.3h.8c.8 0 1.4-.7 1.4-1.7s-.6-1.7-1.4-1.7h-.8v3.4zm5 1.3V9h4v1.3h-2.5v1.2h2v1.2h-2v2.3H16.2z" fill="white"/>
                              </svg>
                              <div class="flex flex-col min-w-0">
                                <span class="text-[10px] uppercase font-bold text-slate-400 leading-tight">Cancelled Cheque / Passbook</span>
                                <span class="font-medium text-slate-800 truncate text-xs" title="{{ editableStep4.cancelledChequeDoc.fileName }}">
                                  {{ editableStep4.cancelledChequeDoc.fileName }}
                                </span>
                                <div class="mt-0.5">
                                  <span class="inline-flex items-center px-1.5 py-0.2 rounded text-[10.5px] font-semibold bg-white border border-slate-200 text-slate-700 shadow-2xs">
                                    {{ editableStep4.cancelledChequeDoc.fileSize || '890 KB' }}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                              <button
                                type="button"
                                (click)="viewDoc(editableStep4.cancelledChequeDoc.fileName, 'Cancelled Cheque', editableStep4.cancelledChequeDoc.fileSize || '890 KB')"
                                class="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#0483AC] hover:text-[#036c8f] bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded transition-colors cursor-pointer"
                                title="Preview Document"
                              >
                                <svg class="w-3.5 h-3.5 stroke-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <span>View</span>
                              </button>
                            </div>
                          </div>
                        }
                      </div>
                    </div>
                  }
                </div>

              </div>

              <!-- 3. Uploaded Documents Status Table (16 items) -->
              <div class="space-y-2.5">
                <div class="flex items-center justify-between pb-1.5 border-b border-slate-200 flex-wrap gap-2">
                  <span class="font-bold text-[#0B3558] uppercase tracking-wider text-[11px]">3. Uploaded Proposal Documents ({{ attachedDocsCount() }} / 16 Attached)</span>
                  <button
                    type="button"
                    (click)="attachAllSampleDocs()"
                    class="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-md font-semibold text-xs cursor-pointer shadow-2xs"
                  >
                    Attach All Mandated Annexures
                  </button>
                </div>

                <div class="border border-slate-200 rounded-xl overflow-hidden">
                  <table class="w-full text-left text-xs">
                    <thead class="bg-slate-100/80 text-slate-600 font-bold text-[10.5px] uppercase tracking-wider border-b border-slate-200">
                      <tr>
                        <th class="p-2.5 w-10 text-center">#</th>
                        <th class="p-2.5">Document Title</th>
                        <th class="p-2.5">Classification</th>
                        <th class="p-2.5">Attached File</th>
                        <th class="p-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-100 text-slate-700">
                      @for (doc of eoiDocuments(); track doc.id) {
                        <tr class="hover:bg-slate-50/50">
                          <td class="p-2.5 text-center font-bold text-slate-400">{{ doc.id }}</td>
                          <td class="p-2.5 font-semibold text-slate-800">{{ doc.name }}</td>
                          <td class="p-2.5">
                            <span class="text-[10px] px-2 py-0.5 rounded font-semibold"
                              [ngClass]="{
                                'bg-rose-50 text-rose-700 border border-rose-200': doc.category === 'mandatory',
                                'bg-sky-50 text-sky-700 border border-sky-200': doc.category === 'annexure',
                                'bg-slate-100 text-slate-600': doc.category === 'remaining'
                              }">
                              {{ doc.category === 'mandatory' ? 'Mandatory Statutory' : (doc.category === 'annexure' ? 'Scheme Annexure' : 'Supporting') }}
                            </span>
                          </td>
                          <td class="p-2.5 font-mono text-[11.5px] text-slate-600">
                            {{ doc.fileName ? (doc.fileName + ' (' + doc.fileSize + ')') : '-' }}
                          </td>
                          <td class="p-2.5 text-center">
                            @if (doc.status === 'uploaded') {
                              <div class="flex items-center justify-center gap-1">
                                <button
                                  type="button"
                                  (click)="viewDoc(doc.fileName, doc.name, doc.fileSize)"
                                  class="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10.5px] font-medium cursor-pointer"
                                >
                                  View
                                </button>
                                <label class="px-2 py-0.5 bg-sky-50 hover:bg-sky-100 border border-sky-300 text-[#0483AC] rounded text-[10.5px] font-medium cursor-pointer">
                                  Replace
                                  <input type="file" (change)="onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                                </label>
                              </div>
                            } @else {
                              <label class="px-2.5 py-0.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded text-[10.5px] font-semibold cursor-pointer shadow-2xs">
                                Upload PDF
                                <input type="file" (change)="onFileSelected($event, doc)" class="hidden" accept=".pdf" />
                              </label>
                            }
                          </td>
                        </tr>
                      }
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Statutory Undertaking Checkbox -->
              <div class="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-2 text-xs text-amber-900">
                <label class="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    [(ngModel)]="declarationAgreed"
                    class="mt-1 w-4 h-4 text-[#0B3558] border-amber-300 rounded focus:ring-[#0B3558]"
                  />
                  <div class="leading-relaxed">
                    <span class="font-bold text-slate-900 block mb-0.5">Statutory Self-Declaration &amp; Undertaking:</span>
                    <span class="text-slate-700">
                      I/We hereby declare that all information furnished and documents submitted are true, authentic, and correct to the best of my knowledge and belief. I understand that any deliberate misrepresentation shall lead to immediate disqualification of the EOI application and forfeiture of the Earnest Money Deposit (EMD).
                    </span>
                  </div>
                </label>
              </div>

            </div>

            <!-- Footer Action Bar -->
            <div class="flex items-center justify-between pt-3 border-t border-slate-200 flex-wrap gap-3">
              <button
                type="button"
                (click)="goToStep(3)"
                class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
              >
                &larr; Back to Upload Documents
              </button>

              <button
                type="button"
                (click)="goToStep(5)"
                [disabled]="!declarationAgreed()"
                class="px-6 py-2.5 bg-[#0B3558] hover:bg-[#07233B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
              >
                Proceed to EMD Fee Payment ({{ formattedEmdFee() }}) &rarr;
              </button>
            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 5: EMD FEE PAYMENT (Refundable)
             ==================================================================== -->
        @if (currentStep() === 5) {
          <div class="space-y-6 font-sans">
            
            <div class="bg-white border border-slate-200 rounded-xl p-5 sm:p-8 shadow-xs font-sans space-y-6">
              
              <div class="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-3">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight">
                    Step 5: Earnest Money Deposit (EMD) Fee Payment
                  </h3>
                  <p class="text-xs text-slate-500 mt-1">
                    Deposit the refundable EMD amount of {{ formattedEmdFee() }} as security for scheme proposal evaluation.
                  </p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#0B3558] border border-blue-200">
                  Refundable / BG Adjustable
                </span>
              </div>

              <!-- EMD Fee Breakdown Box -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Security Type</span>
                  <span class="text-sm font-bold text-slate-800 block">Earnest Money Deposit (EMD)</span>
                  <span class="text-[11px] text-slate-500">Major Head: 8443-00-103 (Security Deposits)</span>
                </div>

                <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <span class="text-[11px] font-medium text-slate-400 uppercase tracking-wider block">Refundability</span>
                  <span class="text-sm font-bold text-emerald-700 block">100% Refundable</span>
                  <span class="text-[11px] text-slate-500">Refunded upon completion of evaluation / BG</span>
                </div>

                <div class="p-4 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1">
                  <span class="text-[11px] font-medium text-[#0B3558] uppercase tracking-wider block">EMD Amount</span>
                  <span class="text-xl font-black text-[#0B3558] block">{{ formattedEmdFee() }}</span>
                  <span class="text-[11px] text-slate-500">{{ emdFeeInWords() }}</span>
                </div>

              </div>

              <!-- Payment Method Selection -->
              <div class="space-y-4 pt-2">
                <label class="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Select Payment Method for EMD Deposit:
                </label>
                
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  
                  <!-- UPI -->
                  <button
                    type="button"
                    (click)="paymentMethod.set('upi')"
                    class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                    [ngClass]="paymentMethod() === 'upi' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">UPI / QR</span>
                      <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                        [ngClass]="paymentMethod() === 'upi' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                        @if (paymentMethod() === 'upi') { &check; }
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 block leading-tight">Instant App Transfer</span>
                  </button>

                  <!-- Debit / Credit Card -->
                  <button
                    type="button"
                    (click)="paymentMethod.set('card')"
                    class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                    [ngClass]="paymentMethod() === 'card' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Card</span>
                      <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                        [ngClass]="paymentMethod() === 'card' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                        @if (paymentMethod() === 'card') { &check; }
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 block leading-tight">Visa, RuPay, Master</span>
                  </button>

                  <!-- Net Banking -->
                  <button
                    type="button"
                    (click)="paymentMethod.set('netbanking')"
                    class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                    [ngClass]="paymentMethod() === 'netbanking' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Net Banking</span>
                      <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                        [ngClass]="paymentMethod() === 'netbanking' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                        @if (paymentMethod() === 'netbanking') { &check; }
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 block leading-tight">Corporate &amp; Retail</span>
                  </button>

                  <!-- Cyber Treasury e-GRAS -->
                  <button
                    type="button"
                    (click)="paymentMethod.set('e-gras')"
                    class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                    [ngClass]="paymentMethod() === 'e-gras' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">Cyber Treasury</span>
                      <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                        [ngClass]="paymentMethod() === 'e-gras' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                        @if (paymentMethod() === 'e-gras') { &check; }
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 block leading-tight">e-GRAS Portal</span>
                  </button>

                  <!-- MSME Exemption -->
                  <button
                    type="button"
                    (click)="paymentMethod.set('exemption')"
                    class="p-3 sm:p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between gap-2"
                    [ngClass]="paymentMethod() === 'exemption' ? 'border-[#0B3558] bg-blue-50/60 ring-2 ring-[#0B3558]/30 shadow-xs' : 'border-slate-200 hover:border-slate-300 bg-white'"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-xs font-bold text-slate-900">MSME Exemption</span>
                      <span class="w-4 h-4 rounded-full flex items-center justify-center border text-[10px]"
                        [ngClass]="paymentMethod() === 'exemption' ? 'border-[#0B3558] bg-[#0B3558] text-white font-bold' : 'border-slate-300 bg-white'">
                        @if (paymentMethod() === 'exemption') { &check; }
                      </span>
                    </div>
                    <span class="text-[10px] text-slate-500 block leading-tight">Udyam Verified (₹ 0)</span>
                  </button>

                </div>

                @if (paymentMethod() === 'exemption') {
                  <div class="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 space-y-1">
                    <strong class="block font-bold text-emerald-800">✓ Eligible for MSME / Udyam EMD Exemption</strong>
                    <span>Your verified Udyam certificate ({{ editableStep1.udyamNumber || 'UDYAM-RJ-14-0028192' }}) entitles this application to 100% EMD waiver under Rajasthan Procurement Rules. Amount payable is <strong>₹ 0.00</strong>.</span>
                  </div>
                }
              </div>

              <!-- Footer Action Bar -->
              <div class="flex items-center justify-between pt-4 border-t border-slate-200 flex-wrap gap-3">
                <button
                  type="button"
                  (click)="goToStep(4)"
                  class="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer"
                >
                  &larr; Back to Complete Preview
                </button>

                <button
                  type="button"
                  (click)="triggerEmdPayment()"
                  [disabled]="isPaymentProcessing()"
                  class="px-8 py-3 bg-[#0B3558] hover:bg-[#07233B] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-2"
                >
                  @if (isPaymentProcessing()) {
                    <span class="animate-spin text-sm">&#9696;</span>
                    <span>Processing Payment &amp; Submitting Proposal...</span>
                  } @else {
                    @if (paymentMethod() === 'exemption') {
                      <span>Claim MSME Exemption &amp; Submit EOI Application &rarr;</span>
                    } @else {
                      <span>Pay {{ formattedEmdFee() }} EMD &amp; Submit EOI Application &rarr;</span>
                    }
                  }
                </button>
              </div>

            </div>

          </div>
        }

        <!-- ====================================================================
             STEP 6: DOWNLOAD RECEIPTS & ACKNOWLEDGEMENT
             ==================================================================== -->
        @if (currentStep() === 6) {
          <div class="space-y-6 font-sans">
            
            <!-- Top Success Status Banner -->
            <div class="bg-[#0B3558] text-white p-6 sm:p-7 rounded-2xl shadow-md space-y-4">
              <div class="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div class="flex items-center gap-3.5 text-center sm:text-left">
                  <div class="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-sm shrink-0">
                    &check;
                  </div>
                  <div>
                    <h3 class="text-lg sm:text-xl font-bold tracking-tight text-white" style="color: #ffffff !important;">
                      EOI Proposal Successfully Submitted!
                    </h3>
                    <p class="text-xs text-sky-100 mt-0.5">
                      Your proposal for <strong>{{ schemeName() }}</strong> ({{ schemeRefNo() }}) has been officially registered.
                    </p>
                  </div>
                </div>

                <!-- Reference Pill & Quick Action -->
                <div class="flex items-center gap-2 flex-wrap justify-center">
                  <div class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs font-mono font-bold">
                    <span>Ref: <strong>ISMS-EOI-2026-9842</strong></span>
                    <button
                      type="button"
                      (click)="copyRef()"
                      class="text-[10.5px] px-2 py-0.5 bg-white/20 hover:bg-white/30 rounded text-white cursor-pointer"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Download Center Section (Acknowledgement, EMD Fee Receipt, Processing Fee Receipt) -->
            <div class="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs space-y-6">
              
              <div class="flex items-center justify-between pb-4 border-b border-slate-100 flex-wrap gap-2">
                <div>
                  <h3 class="text-base sm:text-lg font-bold text-[#0B3558] tracking-tight">
                    Download Official Documents &amp; Receipts
                  </h3>
                  <p class="text-xs text-slate-500 mt-0.5">
                    Download the official submission acknowledgment and payment e-Challan receipts for your records.
                  </p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    type="button"
                    (click)="downloadAllReceipts()"
                    class="px-4 py-2 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                    </svg>
                    <span>Download All (3 Receipts)</span>
                  </button>
                </div>
              </div>

              <!-- 3 Download Cards -->
              <div class="space-y-4">
                
                <!-- 1. EOI Proposal Submission Acknowledgment -->
                <div class="p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-[#0B3558]/50 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-[#0B3558] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                      </svg>
                    </div>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="text-sm sm:text-base font-bold text-slate-900">
                          Proposal Submission Acknowledgment Receipt
                        </h4>
                        <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-[#0B3558]">
                          FORM RSLDC-EOI-ACK
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 leading-relaxed">
                        Official registration certificate containing implementing agency particulars, 16 verified document annexures list, and digital SHA-256 signature digest.
                      </p>
                      <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 font-medium flex-wrap">
                        <span>Ref: <strong class="font-mono text-slate-800">ISMS-EOI-2026-9842</strong></span>
                        <span>&bull;</span>
                        <span>Status: <strong class="text-emerald-700">✓ Submitted &amp; Verified</strong></span>
                        <span>&bull;</span>
                        <span>Date: {{ submissionTimestamp() }}</span>
                      </div>
                    </div>
                  </div>

                  <div class="shrink-0 w-full md:w-auto flex items-center justify-end">
                    <button
                      type="button"
                      (click)="downloadAcknowledgmentReceipt()"
                      class="w-full md:w-auto px-5 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download Acknowledgment</span>
                    </button>
                  </div>
                </div>

                <!-- 2. Earnest Money Deposit (EMD) Fee Receipt -->
                <div class="p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-[#0B3558]/50 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-[#0B3558] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                      </svg>
                    </div>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="text-sm sm:text-base font-bold text-slate-900">
                          Earnest Money Deposit (EMD) Fee Receipt
                        </h4>
                        <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-[#0B3558]">
                          e-GRAS &bull; FORM GA-57
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 leading-relaxed">
                        Cyber Treasury Rajasthan official e-Challan receipt for {{ formattedEmdFee() }} refundable security deposit remitted under Account Head 8443-00-103.
                      </p>
                      <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 font-medium flex-wrap">
                        <span>GRN: <strong class="font-mono text-slate-800">{{ paymentMethod() === 'exemption' ? 'EXEMPT-UDYAM-RJ14' : 'GRN-RAJ-2026-981241' }}</strong></span>
                        <span>&bull;</span>
                        <span>Amount: <strong class="text-emerald-700 font-bold">{{ paymentMethod() === 'exemption' ? '₹ 0.00 (MSME Exempted)' : formattedEmdFee() }}</strong></span>
                        <span>&bull;</span>
                        <span>Head: <strong class="font-mono text-slate-700">8443-00-103-00-00</strong></span>
                      </div>
                    </div>
                  </div>

                  <div class="shrink-0 w-full md:w-auto flex items-center justify-end">
                    <button
                      type="button"
                      (click)="downloadEmdReceipt()"
                      class="w-full md:w-auto px-5 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download EMD Receipt</span>
                    </button>
                  </div>
                </div>

                <!-- 3. Tender Processing Fee Receipt -->
                <div class="p-5 sm:p-6 rounded-xl border border-slate-200 hover:border-[#0B3558]/50 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div class="flex items-start gap-4">
                    <div class="w-12 h-12 rounded-xl bg-[#0B3558] text-white flex items-center justify-center shrink-0 shadow-xs">
                      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"></path>
                      </svg>
                    </div>
                    <div class="space-y-1">
                      <div class="flex items-center gap-2 flex-wrap">
                        <h4 class="text-sm sm:text-base font-bold text-slate-900">
                          Tender Processing Fee Receipt
                        </h4>
                        <span class="px-2 py-0.5 rounded text-[10.5px] font-bold bg-blue-100 text-[#0B3558]">
                          e-GRAS &bull; FORM GA-57
                        </span>
                      </div>
                      <p class="text-xs text-slate-500 leading-relaxed">
                        Cyber Treasury Rajasthan official e-Challan receipt for {{ formattedProcessFee() }} non-refundable EOI processing fee remitted under Account Head 0070-60-800-01-00.
                      </p>
                      <div class="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5 font-medium flex-wrap">
                        <span>GRN: <strong class="font-mono text-slate-800">GRN-RAJ-2026-981240</strong></span>
                        <span>&bull;</span>
                        <span>Amount: <strong class="text-emerald-700 font-bold">{{ formattedProcessFee() }}</strong></span>
                        <span>&bull;</span>
                        <span>Head: <strong class="font-mono text-slate-700">0070-60-800-01-00</strong></span>
                      </div>
                    </div>
                  </div>

                  <div class="shrink-0 w-full md:w-auto flex items-center justify-end">
                    <button
                      type="button"
                      (click)="downloadProcessingFeeReceipt()"
                      class="w-full md:w-auto px-5 py-2.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-lg font-bold text-xs cursor-pointer flex items-center justify-center gap-2 shadow-xs transition-colors"
                    >
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                      </svg>
                      <span>Download Processing Fee Receipt</span>
                    </button>
                  </div>
                </div>

              </div>

              <!-- Footer Navigation Bar -->
              <div class="flex items-center justify-end pt-4 border-t border-slate-200">
                <button
                  type="button"
                  (click)="goToTenderStatus()"
                  class="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-xs transition-colors"
                >
                  <span>Track in Tender Status</span>
                </button>
              </div>

            </div>

          </div>
        }

      </main>

      <!-- ====================================================================
           DOCUMENT VIEWER MODAL
           ==================================================================== -->
      <app-document-viewer-modal
        [isOpen]="isViewerOpen()"
        [doc]="activeViewerDoc()"
        [title]="activeViewerTitle()"
        (close)="closeViewer()"
      />

      <!-- ====================================================================
           PROCESSING FEE PAYMENT SUCCESS MODAL
           ==================================================================== -->
      @if (showProcFeeSuccessModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-150">
            
            <!-- Success Icon -->
            <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner ring-4 ring-emerald-50">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <!-- Title & Subtitle -->
            <div class="space-y-1.5">
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 m-0">
                Successfully Paid!
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                Application Processing Fee of <strong class="text-slate-900">{{ formattedProcessFee() }}</strong> has been successfully paid and official e-Challan generated.
              </p>
            </div>

            <!-- Challan Summary Box -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2.5">
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">Challan GRN No.</span>
                <span class="font-mono font-bold text-[#0B3558] text-xs">GRN-RAJ-2026-981240</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">CIN / Transaction Ref</span>
                <span class="font-mono font-semibold text-slate-800 text-xs">CIN-SBI-9912081</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">Payment Mode</span>
                <span class="font-semibold text-slate-800 text-xs">{{ selectedProcPaymentModeLabel }}</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">Accounting Head</span>
                <span class="font-mono text-slate-700 text-xs">0070-60-800-01-00</span>
              </div>
              <div class="flex items-center justify-between pt-1">
                <span class="font-bold text-slate-700 text-xs">Amount Settled</span>
                <span class="font-black text-emerald-700 text-sm">{{ formattedProcessFee() }}</span>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="space-y-2.5 pt-1">
              <button
                type="button"
                (click)="showProcFeeSuccessModal.set(false); goToStep(2)"
                class="w-full py-3 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 2: OTR Profile &rarr;</span>
              </button>

              <div class="flex items-center justify-center gap-2">
                <button
                  type="button"
                  (click)="downloadProcessingFeeReceipt()"
                  class="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-colors"
                >
                  <svg class="w-3.5 h-3.5 text-[#0483AC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                  </svg>
                  <span>Download Challan</span>
                </button>
                <button
                  type="button"
                  (click)="showProcFeeSuccessModal.set(false)"
                  class="px-4 py-2 text-slate-500 hover:text-slate-700 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Close &amp; View Step 1
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- ====================================================================
           EMD PAYMENT & PROPOSAL SUBMISSION SUCCESS MODAL
           ==================================================================== -->
      @if (showEmdSuccessModal()) {
        <div class="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200 font-sans">
          <div class="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5 animate-in zoom-in-95 duration-150">
            
            <!-- Success Icon -->
            <div class="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner ring-4 ring-emerald-50">
              <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <!-- Title & Subtitle -->
            <div class="space-y-1.5">
              <h3 class="text-xl sm:text-2xl font-black text-slate-900 m-0">
                Successfully Paid!
              </h3>
              <p class="text-xs sm:text-sm text-slate-600 leading-relaxed m-0">
                @if (paymentMethod() === 'exemption') {
                  MSME Exemption claim verified and your proposal for <strong class="text-slate-900">{{ schemeTitle() }}</strong> has been submitted.
                } @else {
                  Earnest Money Deposit (EMD) of <strong class="text-slate-900">{{ formattedEmdFee() }}</strong> has been successfully paid and your proposal for <strong class="text-slate-900">{{ schemeTitle() }}</strong> has been submitted.
                }
              </p>
            </div>

            <!-- Summary Box -->
            <div class="p-4 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2.5">
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">Application Ref No.</span>
                <span class="font-mono font-bold text-[#0B3558] text-xs">ISMS-EOI-2026-9842</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">EMD Challan GRN</span>
                <span class="font-mono font-semibold text-slate-800 text-xs">{{ paymentMethod() === 'exemption' ? 'EXEMPT-UDYAM-RJ14' : 'GRN-RAJ-2026-981241' }}</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">Security Head</span>
                <span class="font-mono text-slate-700 text-xs">8443-00-103-00-00</span>
              </div>
              <div class="flex items-center justify-between pb-2 border-b border-slate-200">
                <span class="text-slate-500 text-[11px] font-medium">Submission Timestamp</span>
                <span class="font-semibold text-slate-800 text-xs">{{ submissionTimestamp() }}</span>
              </div>
              <div class="flex items-center justify-between pt-1">
                <span class="font-bold text-slate-700 text-xs">EMD Amount Settled</span>
                <span class="font-black text-emerald-700 text-sm">{{ paymentMethod() === 'exemption' ? '₹ 0.00 (MSME Exempted)' : formattedEmdFee() }}</span>
              </div>
            </div>

            <!-- Action Button to Step 6 -->
            <div class="pt-1">
              <button
                type="button"
                (click)="showEmdSuccessModal.set(false); goToStep(6)"
                class="w-full py-3.5 bg-[#0B3558] hover:bg-[#07233B] text-white rounded-xl text-xs sm:text-sm font-bold shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Proceed to Step 6: Download Receipts &rarr;</span>
              </button>
            </div>

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
  private location = inject(Location);

  readonly otrData = this.otrFormService.formData;

  currentStep = signal<number>(1);

  schemeTitle = signal<string>('Mukhya Mantri Kaushalya Vikas Yojana (MMKVY)');
  schemeRefNo = signal<string>('RSLDC/EOI/MMKVY Cat I II III/2026-27/01');
  schemeName = signal<string>('MMKVY');
  schemeCode = signal<string>('MMKVY');
  schemeCategory = signal<string>('ALL');
  schemeEoiCategory = signal<string>('General');
  schemeDatePublished = signal<string>('15/09/2026');
  schemeClosingDate = signal<string>('30/11/2026');
  schemeEmdFee = signal<string>('₹50,000');
  schemeProcessFee = signal<string>('₹2,000');
  schemeDescription = signal<string>(
    'Expression of Interest for submission of proposal to undertake the Skill Training under MMKVY Scheme'
  );

  // Step 1: Processing Fee State & Payment Methods
  procFeePaid = signal<boolean>(false);
  isProcPaying = signal<boolean>(false);
  showProcFeeSuccessModal = signal<boolean>(false);
  procFeeDate = signal<string>('04/10/2026');
  procPaymentMethod = signal<'upi' | 'card' | 'netbanking' | 'e-gras'>('upi');
  upiOption = signal<'id' | 'qr'>('id');
  upiId = signal<string>('skills.enterprise@okaxis');
  upiVerified = signal<boolean>(true);
  cardData = { number: '4532 8901 2345 6789', name: 'AUTHORIZED SIGNATORY', expiry: '08/29', cvv: '782' };
  selectedBank = signal<string>('sbi');

  // Step 5: EMD Payment Mode & Inputs
  paymentMethod = signal<'upi' | 'card' | 'netbanking' | 'e-gras' | 'exemption'>('upi');
  emdUpiId = signal<string>('treasury.corp@okhdfcbank');
  emdCardData = { number: '5241 6800 1192 4001', name: 'AUTHORIZED SIGNATORY', expiry: '11/28', cvv: '439' };
  emdSelectedBank = signal<string>('sbi');
  isPaymentProcessing = signal<boolean>(false);
  showEmdSuccessModal = signal<boolean>(false);
  submissionTimestamp = signal<string>('04 Oct 2026, 08:35 PM');

  // Number & Currency Dynamic Computations
  readonly numericProcessFee = computed(() => {
    const feeStr = this.schemeProcessFee() || '2000';
    const num = parseInt(feeStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) || num <= 0 ? 2000 : num;
  });

  readonly numericEmdFee = computed(() => {
    const feeStr = this.schemeEmdFee() || '50000';
    const num = parseInt(feeStr.replace(/[^0-9]/g, ''), 10);
    return isNaN(num) || num <= 0 ? 50000 : num;
  });

  readonly totalPayableAmount = computed(() => {
    return this.numericProcessFee() + this.numericEmdFee();
  });

  readonly formattedProcessFee = computed(() => {
    return '₹ ' + this.numericProcessFee().toLocaleString('en-IN');
  });

  readonly formattedEmdFee = computed(() => {
    return '₹ ' + this.numericEmdFee().toLocaleString('en-IN');
  });

  readonly formattedTotalFee = computed(() => {
    return '₹ ' + this.totalPayableAmount().toLocaleString('en-IN');
  });

  readonly processFeeInWords = computed(() => {
    return this.numberToIndianWords(this.numericProcessFee());
  });

  readonly emdFeeInWords = computed(() => {
    return this.numberToIndianWords(this.numericEmdFee());
  });

  readonly totalFeeInWords = computed(() => {
    return this.numberToIndianWords(this.totalPayableAmount());
  });

  get selectedProcPaymentModeLabel(): string {
    switch (this.procPaymentMethod()) {
      case 'upi': return 'UPI (BHIM / Google Pay / PhonePe)';
      case 'card': return 'Debit / Credit Card (RuPay / Visa)';
      case 'netbanking': return 'Net Banking (SBI / HDFC / Corporate)';
      case 'e-gras': return 'Cyber Treasury Rajasthan (e-GRAS)';
      default: return 'Online Payment Gateway';
    }
  }

  get emdPaymentModeLabel(): string {
    switch (this.paymentMethod()) {
      case 'upi': return 'UPI (BHIM / Google Pay / PhonePe)';
      case 'card': return 'Debit / Credit Card (Visa / RuPay)';
      case 'netbanking': return 'Net Banking (Corporate / Retail)';
      case 'e-gras': return 'Cyber Treasury Rajasthan (e-GRAS)';
      case 'exemption': return 'MSME / Udyam 100% Exemption';
      default: return 'Online Payment Gateway';
    }
  }

  // Step 2: OTR Data Models
  editableStep1: Step1OrgDetails = JSON.parse(JSON.stringify(this.otrFormService.formData().step1));
  editableStep2: OfficerInCharge[] = JSON.parse(JSON.stringify(this.otrFormService.formData().step2));
  editableStep3: Step3AuthorizedPerson = JSON.parse(JSON.stringify(this.otrFormService.formData().step3));
  editableStep4: Step4BankDetails = JSON.parse(JSON.stringify(this.otrFormService.formData().step4));

  // Step 4: Inline OTR Editing in Complete Preview
  isEditingOtrInPreview = signal<boolean>(false);

  // Step 3: Documents Tab Filter
  selectedDocTab = signal<'all' | 'mandatory' | 'annexure' | 'remaining'>('all');

  /** 16 Proposal Documents strictly matching Screenshot */
  eoiDocuments = signal<EoiDocumentItem[]>([
    // 1. Mandatory Statutory Documents (6)
    {
      id: 1,
      name: 'Covering Letter (Annexure 1)',
      description: 'Official proposal submission covering letter on organization letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 2,
      name: 'Audited Financial Statements (Annexure 3)',
      description: 'CA certified balance sheet and P&L accounts for last 3 consecutive financial years',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 3,
      name: 'Anti-Blacklisting Notarized Affidavit (Annexure 6)',
      description: 'Non-judicial notary stamped anti-blacklisting undertaking',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 4,
      name: 'Statutory Compliance Self-Declaration (Annexure 7)',
      description: 'Statutory compliance self-declaration on corporate letterhead',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 5,
      name: 'Signed & Sealed EOI Document',
      description: 'Complete downloaded RFP document signed and sealed on all pages',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },
    {
      id: 6,
      name: 'Debarment Undertaking Document',
      description: 'Affidavit affirming entity is not debarred by any Central or State Govt agency',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'mandatory'
    },

    // 2. Scheme Annexures (8)
    {
      id: 7,
      name: 'Training & Placement Track Record (Annexure 5)',
      description: 'Candidate-level wage placement track record and audit certificates',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 8,
      name: 'Active Skill Development Centres (Annexure 4)',
      description: 'Geotagged infrastructure layout and classroom verification proofs',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 9,
      name: 'Board of Directors Details (Annexure 8)',
      description: 'Board member listing, DIN, and KYC registration profiles',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 10,
      name: 'Industry Placement Tie-ups & MOUs (Annexure 9)',
      description: 'Active corporate MOUs and employer placement commitments',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 11,
      name: 'Relevant Sector Experience Proof (Annexure 10)',
      description: 'Sector specific past training delivery completion certificates',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 12,
      name: 'District Cluster Mobilization Plan (Annexure 11)',
      description: 'District cluster prioritization and candidate outreach methodology',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 13,
      name: 'Technical Evaluation Matrix (Annexure 12)',
      description: 'Technical scoring self-assessment and qualification criteria response',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },
    {
      id: 14,
      name: 'Supporting Credentials & Accreditations (Annexure 13)',
      description: 'Additional credentials, excellence awards, and ISO accreditations',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'annexure'
    },

    // 3. Remaining Documents (2)
    {
      id: 15,
      name: 'NSDC Stake Partner Certificate',
      description: 'NSDC equity or funded partner participation certificate',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: false,
      status: 'pending',
      category: 'remaining'
    },
    {
      id: 16,
      name: 'CA Turnover Certificate with UDIN (Annexure 14)',
      description: 'Chartered Accountant certified turnover certificate with valid UDIN',
      fileName: '',
      fileSize: '',
      uploadedDate: '',
      isMandatory: true,
      status: 'pending',
      category: 'remaining'
    }
  ]);

  readonly mandatoryDocs = computed(() => this.eoiDocuments().filter(d => d.category === 'mandatory'));
  readonly annexureDocs = computed(() => this.eoiDocuments().filter(d => d.category === 'annexure'));
  readonly remainingDocs = computed(() => this.eoiDocuments().filter(d => d.category === 'remaining'));

  readonly mandatoryAttachedCount = computed(() => this.mandatoryDocs().filter(d => d.status === 'uploaded').length);
  readonly annexureAttachedCount = computed(() => this.annexureDocs().filter(d => d.status === 'uploaded').length);
  readonly remainingAttachedCount = computed(() => this.remainingDocs().filter(d => d.status === 'uploaded').length);

  readonly filteredDocuments = computed(() => {
    const tab = this.selectedDocTab();
    if (tab === 'all') return this.eoiDocuments();
    return this.eoiDocuments().filter(d => d.category === tab);
  });

  readonly attachedDocsCount = computed(() => this.eoiDocuments().filter(d => d.status === 'uploaded').length);

  declarationAgreed = signal<boolean>(true);

  // Document Viewer Modal State
  isViewerOpen = signal<boolean>(false);
  activeViewerDoc = signal<FileDoc | null>(null);
  activeViewerTitle = signal<string>('');

  get registeredAddressText(): string {
    const s = this.editableStep1;
    if (!s) return '-';
    const parts = [s.registeredAddress, s.registeredDistrict, s.registeredState];
    let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
    if (s.registeredPincode?.trim()) str += (str ? ' - ' : '') + s.registeredPincode.trim();
    return str || s.registeredAddress || '-';
  }

  get officeAddressText(): string {
    const s = this.editableStep1;
    if (!s) return '-';
    if (s.sameAsRegistered) return 'Same as Registered Address';
    const parts = [s.officeAddress, s.officeDistrict, s.officeState];
    let str = parts.filter(p => !!p && p.trim().length > 0).join(', ');
    if (s.officePincode?.trim()) str += (str ? ' - ' : '') + s.officePincode.trim();
    return str || s.officeAddress || '-';
  }

  get residenceAddressText(): string {
    const s = this.editableStep3;
    return s?.residenceAddress || '-';
  }

  numberToIndianWords(num: number): string {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
      'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n: number): string => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
      if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' and ' + inWords(n % 100) : '');
      if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
      if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
      return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
    };

    if (num === 0) return 'Zero';
    return 'Rupees ' + inWords(num) + ' Only';
  }

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['refNo']) this.schemeRefNo.set(params['refNo']);
      if (params['title']) this.schemeTitle.set(params['title']);
      if (params['schemeName']) this.schemeName.set(params['schemeName']);
      if (params['code']) this.schemeCode.set(params['code']);
      if (params['category']) this.schemeCategory.set(params['category']);
      if (params['schemeCategory']) this.schemeCategory.set(params['schemeCategory']);
      if (params['eoiCategory']) this.schemeEoiCategory.set(params['eoiCategory']);
      if (params['datePublished']) this.schemeDatePublished.set(params['datePublished']);
      if (params['closingDate']) this.schemeClosingDate.set(params['closingDate']);
      if (params['emdFee']) this.schemeEmdFee.set(params['emdFee']);
      if (params['processFee']) this.schemeProcessFee.set(params['processFee']);
      if (params['eoiDescription']) this.schemeDescription.set(params['eoiDescription']);
    });
  }

  goBack(): void {
    this.location.back();
  }

  goToStep(step: number): void {
    this.currentStep.set(step);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  setUpiHandle(handle: string): void {
    const currentBase = (this.upiId() || 'skills').split('@')[0];
    this.upiId.set(`${currentBase}${handle}`);
    this.upiVerified.set(true);
  }

  verifyUpi(): void {
    this.upiVerified.set(true);
  }

  payProcessingFeeAndProceed(): void {
    this.isProcPaying.set(true);
    setTimeout(() => {
      this.isProcPaying.set(false);
      this.procFeePaid.set(true);
      const now = new Date();
      this.procFeeDate.set(`${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`);
      this.showProcFeeSuccessModal.set(true);
    }, 600);
  }

  saveAndProceedToStep3(): void {
    this.otrFormService.updateStep1(this.editableStep1);
    this.otrFormService.updateStep2(this.editableStep2);
    this.otrFormService.updateStep3(this.editableStep3);
    this.otrFormService.updateStep4(this.editableStep4);
    this.goToStep(3);
  }

  togglePreviewOtrEdit(): void {
    if (this.isEditingOtrInPreview()) {
      // Save changes back to OTR form service state
      this.otrFormService.updateStep1(this.editableStep1);
      this.otrFormService.updateStep2(this.editableStep2);
      this.otrFormService.updateStep3(this.editableStep3);
      this.otrFormService.updateStep4(this.editableStep4);
      this.isEditingOtrInPreview.set(false);
    } else {
      this.isEditingOtrInPreview.set(true);
    }
  }

  onFileSelected(event: Event, doc: EoiDocumentItem): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sizeMb = file.size / (1024 * 1024);
      const fileSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      const now = new Date();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const uploadedDate = `${now.getDate()}-${months[now.getMonth()]}-${now.getFullYear()}`;
      this.eoiDocuments.update(docs => docs.map(d => d.id === doc.id ? {
        ...d,
        fileName: file.name,
        fileSize,
        uploadedDate,
        status: 'uploaded'
      } : d));
      input.value = '';
    }
  }

  attachAllSampleDocs(): void {
    this.eoiDocuments.update(docs => docs.map((doc, idx) => ({
      ...doc,
      status: 'uploaded',
      fileName: `Scan_Annexure_${doc.id}_Signed.pdf`,
      fileSize: `${(1.2 + (idx % 3) * 0.8).toFixed(1)} MB`,
      uploadedDate: '04-Oct-2026'
    })));
  }

  replaceOtrDoc(event: Event, type: 'regCert' | 'panCard' | 'gstCert' | 'msmeCert' | 'authLetter' | 'authIdProof' | 'bankDoc'): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const sizeMb = file.size / (1024 * 1024);
      const fileSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      const docObj: FileDoc = {
        fileName: file.name,
        fileSize,
        uploadDate: '04/10/2026',
        status: 'uploaded'
      };

      if (type === 'regCert') this.editableStep1.registrationCertDoc = docObj;
      if (type === 'panCard') this.editableStep1.panCardDoc = docObj;
      if (type === 'gstCert') this.editableStep1.gstCertDoc = docObj;
      if (type === 'msmeCert') this.editableStep1.msmeCertDoc = docObj;
      if (type === 'authLetter') this.editableStep3.authorizationLetterDoc = docObj;
      if (type === 'authIdProof') this.editableStep3.idProofDoc = docObj;
      if (type === 'bankDoc') this.editableStep4.cancelledChequeDoc = docObj;

      input.value = '';
    }
  }

  removeOtrDoc(type: 'regCert' | 'panCard' | 'gstCert' | 'msmeCert' | 'authLetter' | 'authIdProof' | 'bankDoc'): void {
    if (type === 'regCert') this.editableStep1.registrationCertDoc = null;
    if (type === 'panCard') this.editableStep1.panCardDoc = null;
    if (type === 'gstCert') this.editableStep1.gstCertDoc = null;
    if (type === 'msmeCert') this.editableStep1.msmeCertDoc = null;
    if (type === 'authLetter') this.editableStep3.authorizationLetterDoc = null;
    if (type === 'authIdProof') this.editableStep3.idProofDoc = null;
    if (type === 'bankDoc') this.editableStep4.cancelledChequeDoc = null;
  }

  removeSchemeDoc(doc: EoiDocumentItem): void {
    doc.status = 'pending';
    doc.fileName = '';
    doc.fileSize = '';
  }

  replaceOicDoc(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0] && this.editableStep2[index]) {
      const file = input.files[0];
      const sizeMb = file.size / (1024 * 1024);
      const fileSize = sizeMb >= 1 ? `${sizeMb.toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      this.editableStep2[index].appointmentLetterDoc = {
        fileName: file.name,
        fileSize,
        uploadDate: '04/10/2026',
        status: 'uploaded'
      };
      input.value = '';
    }
  }

  viewDoc(fileName: string, title: string, fileSize: string = '1.2 MB'): void {
    this.activeViewerTitle.set(title);
    this.activeViewerDoc.set({
      fileName,
      fileSize,
      uploadDate: '04/10/2026',
      status: 'uploaded'
    });
    this.isViewerOpen.set(true);
  }

  closeViewer(): void {
    this.isViewerOpen.set(false);
    this.activeViewerDoc.set(null);
  }

  triggerEmdPayment(): void {
    this.isPaymentProcessing.set(true);
    setTimeout(() => {
      this.isPaymentProcessing.set(false);
      const now = new Date();
      this.submissionTimestamp.set(`${now.getDate()} Oct 2026, ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
      this.showEmdSuccessModal.set(true);
    }, 800);
  }

  downloadAllReceipts(): void {
    this.downloadAcknowledgmentReceipt();
    setTimeout(() => this.downloadEmdReceipt(), 300);
    setTimeout(() => this.downloadProcessingFeeReceipt(), 600);
  }

  copyRef(): void {
    navigator.clipboard?.writeText('ISMS-EOI-2026-9842');
    alert('Application Reference Number copied: ISMS-EOI-2026-9842');
  }

  goToTenderStatus(): void {
    this.router.navigate(['/tender-status']);
  }

  printReceipt(): void {
    window.print();
  }

  downloadProcessingFeeReceipt(): void {
    const filename = `Processing_Fee_Receipt_GRN-RAJ-2026-981240.html`;
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Treasury Rajasthan - Processing Fee e-Challan Receipt</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
    .gov-title { font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>

  <div class="header-box">
    <div class="gov-title">Government of Rajasthan &bull; Finance Department</div>
    <div class="main-title">e-GRAS Cyber Treasury Official Processing Fee Receipt</div>
    <div style="font-size: 11px; color: #475569; margin-top: 4px;">Integrated Scheme Management System (ISMS 2.0) &bull; RSLDC Tender Application</div>
  </div>

  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">GRN Number</td><td style="font-family: monospace; font-weight: bold;">GRN-RAJ-2026-981240</td><td style="width: 25%; font-weight: bold; background: #f8fafc;">Transaction Date</td><td>${this.procFeeDate()} 20:25:10 IST</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Remitter Name</td><td>${this.editableStep1.fullName}</td><td style="font-weight: bold; background: #f8fafc;">CIN / PAN</td><td style="font-family: monospace;">${this.editableStep1.registrationNumber} / ${this.editableStep1.companyPan}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Department</td><td>Rajasthan Skill &amp; Livelihoods Dev. Corp.</td><td style="font-weight: bold; background: #f8fafc;">Scheme Ref</td><td style="font-family: monospace;">${this.schemeRefNo()}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Bank / Mode</td><td>${this.selectedProcPaymentModeLabel}</td><td style="font-weight: bold; background: #f8fafc;">Payment Status</td><td style="font-weight: bold; color: #15803d;">SUCCESS / SETTLED</td></tr>
  </table>

  <table>
    <thead><tr><th>S.No</th><th>Account Head</th><th>Purpose / Description</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td style="text-align: center;">1</td><td style="font-family: monospace;">0070-60-800-01-00</td><td>EOI RFP Tender Processing Fee (Non-Refundable)</td><td style="text-align: right; font-weight: bold;">${this.numericProcessFee().toFixed(2)}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="3" style="text-align: right;">Total Amount Paid (in words: ${this.processFeeInWords()}):</td><td style="text-align: right; font-size: 13px; color: #0B3558;">${this.formattedProcessFee()}</td></tr>
    </tbody>
  </table>

  <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center;">
    This is a computer-generated e-Receipt issued under Information Technology Act 2000 and does not require physical signature.
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadAcknowledgmentReceipt(): void {
    const filename = `EOI_Acknowledgment_Receipt_ISMS-EOI-2026-9842.html`;
    const docRows = this.eoiDocuments().map(d => `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #64748b;">${d.id}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a;">${d.name}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #475569;">${d.category === 'mandatory' ? 'Mandatory Statutory' : (d.category === 'annexure' ? 'Scheme Annexure' : 'Supporting')}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #1e293b;">${d.fileName ? `${d.fileName} (${d.fileSize})` : 'Attached'}</td>
      </tr>
    `).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>EOI Proposal Submission Acknowledgment Receipt - ISMS-EOI-2026-9842</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .gov-title { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    .sub-title { font-size: 12px; color: #334155; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #0B3558; border: 1px solid #cbd5e1; }
    .section-title { font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>

  <div class="header-box">
    <div>
      <div class="gov-title">Government of Rajasthan &bull; Department of Skill, Employment &amp; Entrepreneurship</div>
      <div class="main-title">Rajasthan Skill and Livelihoods Development Corporation (RSLDC)</div>
      <div class="sub-title">Official EOI Proposal Submission Acknowledgment Receipt</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Application Ref: ISMS-EOI-2026-9842</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Submitted: ${this.submissionTimestamp()}</div>
    </div>
  </div>

  <div class="section-title">1. Applicant Organization &amp; Scheme Details</div>
  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">Applicant Organization</td><td>${this.editableStep1.fullName}</td><td style="width: 20%; font-weight: bold; background: #f8fafc;">CIN / Reg No</td><td style="font-family: monospace;">${this.editableStep1.registrationNumber}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Scheme Name</td><td>${this.schemeTitle()}</td><td style="font-weight: bold; background: #f8fafc;">EOI Ref No</td><td style="font-family: monospace;">${this.schemeRefNo()}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Company PAN / GSTIN</td><td style="font-family: monospace;">${this.editableStep1.companyPan} / ${this.editableStep1.gstin || 'NA'}</td><td style="font-weight: bold; background: #f8fafc;">Submission Status</td><td style="font-weight: bold; color: #15803d;">REGISTERED &amp; SUBMITTED</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Authorized Signatory</td><td>${this.editableStep3.name} (${this.editableStep3.designation})</td><td style="font-weight: bold; background: #f8fafc;">Signatory Contact</td><td>${this.editableStep3.mobileNo} | ${this.editableStep3.emailId}</td></tr>
  </table>

  <div class="section-title">2. Mandatory Proposal Documents Checklist (16 Documents)</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document Name</th><th>Classification</th><th>Attached File</th></tr></thead>
    <tbody>${docRows}</tbody>
  </table>

  <div class="section-title">3. Statutory Verification &amp; Undertaking</div>
  <p style="font-size: 11px; color: #475569; line-height: 1.5; background: #f8fafc; padding: 10px; border: 1px solid #e2e8f0; border-radius: 6px;">
    Digitally authenticated and submitted by <strong>${this.editableStep3.name}</strong> on ${this.submissionTimestamp()}. The applicant organization has accepted the statutory undertaking that all particulars and annexed documents are genuine and valid.
  </p>

  <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10px; color: #64748b;">
    <div>Generated from ISMS 2.0 &bull; Official RSLDC EOI Submission Record</div>
    <div>Date: ${this.submissionTimestamp()}</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadEmdReceipt(): void {
    const filename = `EMD_Cyber_Treasury_Receipt_GRN-RAJ-2026-981241.html`;
    const emdSettledText = this.paymentMethod() === 'exemption' ? '₹ 0.00 (MSME Exempted)' : this.formattedEmdFee();
    const emdNumText = this.paymentMethod() === 'exemption' ? '0.00' : this.numericEmdFee().toFixed(2);
    const emdWords = this.paymentMethod() === 'exemption' ? 'Zero (Exempted)' : this.emdFeeInWords();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Cyber Treasury Rajasthan - EMD Security Deposit e-Challan Receipt</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; text-align: center; }
    .gov-title { font-size: 12px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    td { padding: 6px 10px; border: 1px solid #cbd5e1; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Receipt / Save as PDF</button>
  </div>

  <div class="header-box">
    <div class="gov-title">Government of Rajasthan &bull; Finance Department</div>
    <div class="main-title">e-GRAS Cyber Treasury Official EMD Security Deposit Receipt</div>
    <div style="font-size: 11px; color: #475569; margin-top: 4px;">Integrated Scheme Management System (ISMS 2.0) &bull; RSLDC EOI Security Deposit</div>
  </div>

  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc;">EMD GRN Number</td><td style="font-family: monospace; font-weight: bold;">GRN-RAJ-2026-981241</td><td style="width: 25%; font-weight: bold; background: #f8fafc;">Transaction Date</td><td>${this.submissionTimestamp()}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Remitter Name</td><td>${this.editableStep1.fullName}</td><td style="font-weight: bold; background: #f8fafc;">CIN / PAN</td><td style="font-family: monospace;">${this.editableStep1.registrationNumber} / ${this.editableStep1.companyPan}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Department</td><td>Rajasthan Skill &amp; Livelihoods Dev. Corp.</td><td style="font-weight: bold; background: #f8fafc;">Tender Scheme</td><td>${this.schemeName()} (${this.schemeRefNo()})</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc;">Bank CIN / Gateway Ref</td><td style="font-family: monospace;">CIN-HDFC-9912082</td><td style="font-weight: bold; background: #f8fafc;">Payment Status</td><td style="font-weight: bold; color: #15803d;">SUCCESS / SETTLED</td></tr>
  </table>

  <table>
    <thead><tr><th>S.No</th><th>Account Head</th><th>Purpose / Description</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td style="text-align: center;">1</td><td style="font-family: monospace;">8443-00-103-00-00</td><td>Earnest Money Deposit - EMD (Refundable Security)</td><td style="text-align: right; font-weight: bold;">${emdNumText}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="3" style="text-align: right;">Total EMD Settled (in words: ${emdWords}):</td><td style="text-align: right; font-size: 13px; color: #0B3558;">${emdSettledText}</td></tr>
    </tbody>
  </table>

  <div style="margin-top: 30px; border-top: 1px dashed #cbd5e1; padding-top: 12px; font-size: 10px; color: #64748b; text-align: center;">
    This is a computer-generated e-Receipt issued under Information Technology Act 2000 and does not require physical signature.
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  downloadProposalApplication(): void {
    const filename = `${this.schemeName()}_Proposal_Application_ISMS-EOI-2026-9842.html`;
    const docRows = this.eoiDocuments().map(d => `
      <tr>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: center; font-weight: bold; color: #64748b;">${d.id}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-weight: 600; color: #0f172a;">${d.name}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; color: #475569;">${d.category === 'mandatory' ? 'Mandatory Statutory' : (d.category === 'annexure' ? 'Scheme Annexure' : 'Supporting')}</td>
        <td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace; color: #1e293b;">${d.fileName ? `${d.fileName} (${d.fileSize})` : 'Attached'}</td>
      </tr>
    `).join('');

    const emdSettledText = this.paymentMethod() === 'exemption' ? '₹ 0.00 (MSME Exempted)' : this.formattedEmdFee();
    const totalSettledText = this.paymentMethod() === 'exemption' ? this.formattedProcessFee() : this.formattedTotalFee();

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${this.schemeName()} Proposal Application - ISMS-EOI-2026-9842</title>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 25px; color: #1e293b; background: #fff; line-height: 1.4; font-size: 12px; }
    @media print { body { padding: 0; } @page { size: A4; margin: 12mm; } .no-print { display: none !important; } }
    .header-box { border-bottom: 2px solid #0B3558; padding-bottom: 12px; margin-bottom: 18px; display: flex; justify-content: space-between; align-items: center; }
    .gov-title { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1px; text-transform: uppercase; }
    .main-title { font-size: 18px; font-weight: 800; color: #0B3558; margin: 3px 0; }
    .sub-title { font-size: 12px; color: #334155; }
    .badge { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; background: #f1f5f9; color: #0B3558; border: 1px solid #cbd5e1; }
    .section-title { font-size: 12px; font-weight: 800; color: #0B3558; text-transform: uppercase; letter-spacing: 0.5px; margin: 18px 0 8px 0; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 12px; font-size: 11px; }
    th { background: #f8fafc; color: #334155; font-weight: 700; padding: 6px 10px; border: 1px solid #cbd5e1; text-align: left; text-transform: uppercase; font-size: 10px; }
    .btn-bar { margin-bottom: 15px; padding: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; display: flex; gap: 10px; justify-content: flex-end; }
    .btn { padding: 8px 14px; background: #0B3558; color: #fff; border: none; border-radius: 6px; font-weight: 700; font-size: 12px; cursor: pointer; }
  </style>
</head>
<body>
  <div class="no-print btn-bar">
    <button class="btn" onclick="window.print()">Print Application / Save as PDF</button>
  </div>

  <div class="header-box">
    <div>
      <div class="gov-title">Government of Rajasthan &bull; Department of Skill &amp; Livelihoods</div>
      <div class="main-title">Rajasthan Skill &amp; Livelihoods Development Corporation (RSLDC)</div>
      <div class="sub-title">Expression of Interest (EOI) Application &bull; Scheme: ${this.schemeTitle()}</div>
    </div>
    <div style="text-align: right;">
      <div class="badge">Ref: ISMS-EOI-2026-9842</div>
      <div style="font-size: 10px; color: #64748b; margin-top: 4px;">Submitted: ${this.submissionTimestamp()}</div>
    </div>
  </div>

  <div class="section-title">1. Organization &amp; Statutory Particulars</div>
  <table>
    <tr><td style="width: 25%; font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Applicant Organization</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${this.editableStep1.fullName}</td><td style="width: 20%; font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">CIN / Reg No</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${this.editableStep1.registrationNumber}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Company PAN</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${this.editableStep1.companyPan}</td><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">GSTIN</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${this.editableStep1.gstin || 'Not Applicable'}</td></tr>
    <tr><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Authorized Signatory</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${this.editableStep3.name} (${this.editableStep3.designation})</td><td style="font-weight: bold; background: #f8fafc; padding: 6px 10px; border: 1px solid #cbd5e1;">Contact / Email</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">${this.editableStep3.mobileNo} | ${this.editableStep3.emailId}</td></tr>
  </table>

  <div class="section-title">2. Mandatory Proposal Documents Checklist (16 Documents)</div>
  <table>
    <thead><tr><th style="width: 35px; text-align: center;">#</th><th>Document Name</th><th>Category</th><th>Attached File</th></tr></thead>
    <tbody>${docRows}</tbody>
  </table>

  <div class="section-title">3. Fee Settlement Breakdown</div>
  <table>
    <thead><tr><th>Fee Particulars</th><th>Classification</th><th>Challan Reference</th><th style="text-align: right;">Amount (₹)</th></tr></thead>
    <tbody>
      <tr><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">EOI Tender Processing Fee</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Non-Refundable</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">GRN-RAJ-2026-981240</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${this.formattedProcessFee()}</td></tr>
      <tr><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Earnest Money Deposit (EMD)</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1;">Refundable Security</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; font-family: monospace;">${this.paymentMethod() === 'exemption' ? 'EXEMPT-UDYAM' : 'GRN-RAJ-2026-981241'}</td><td style="padding: 6px 10px; border: 1px solid #cbd5e1; text-align: right; font-weight: bold;">${emdSettledText}</td></tr>
      <tr style="background: #f8fafc; font-weight: bold;"><td colspan="3" style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right;">Total Amount Settled:</td><td style="padding: 8px 10px; border: 1px solid #cbd5e1; text-align: right; font-size: 13px; color: #0B3558;">${totalSettledText}</td></tr>
    </tbody>
  </table>

  <div style="margin-top: 25px; padding-top: 15px; border-top: 1px solid #cbd5e1; display: flex; justify-content: space-between; font-size: 10.5px; color: #64748b;">
    <div>Generated from ISMS 2.0 &bull; Secure Digitally Watermarked Document</div>
    <div>Date: ${this.submissionTimestamp()} &bull; Page 1 of 1</div>
  </div>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
