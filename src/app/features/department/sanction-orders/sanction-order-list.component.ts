import { Component, inject, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UiTableComponent, TableColumn } from '../../../shared/components/ui/ui-table/ui-table.component';
import { SanctionOrderService, SanctionOrder } from '../../../core/services/sanction-order.service';

@Component({
  selector: 'app-sanction-order-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, UiTableComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      
      <!-- Header -->
      <div class="flex justify-between items-end">
        <div>
          <h1 class="text-3xl font-extrabold text-[#131A4D] tracking-tight">Sanction Orders</h1>
          <p class="text-slate-500 mt-1">Manage, edit drafts, and release approved Sanction Orders to Training Providers.</p>
        </div>
        <button routerLink="/department/sanction-orders/create" class="px-4 py-2 bg-[#131A4D] text-white font-bold rounded shadow-xs hover:bg-[#0a0e29] transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/></svg>
          Create Sanction Order
        </button>
      </div>

      <!-- ✅ General Notification Toast Banner -->
      @if (toastMessage()) {
        <div class="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
            <svg class="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div class="flex-1">
            <p class="text-sm font-bold text-green-800">{{ toastMessage()?.title }}</p>
            <p class="text-xs text-green-600 mt-0.5">{{ toastMessage()?.detail }}</p>
          </div>
          <button (click)="toastMessage.set(null)" class="text-green-400 hover:text-green-600 text-lg leading-none ml-2">×</button>
        </div>
      }

      <!-- ⏳ Confirm Release Banner/Dialog -->
      @if (confirmingOrder()) {
        <div class="bg-amber-50 border border-amber-200 rounded-lg px-5 py-4 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div class="flex items-start gap-3">
            <div class="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0 mt-0.5">
              <svg class="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div class="flex-1">
              <p class="text-sm font-bold text-amber-900">Confirm Release of Sanction Order</p>
              <p class="text-xs text-amber-700 mt-1">
                You are about to release <span class="font-mono font-bold">{{ confirmingOrder()!.ref }}</span> to 
                <span class="font-bold">{{ confirmingOrder()!.tpName }}</span>. 
                Once released, the TP will immediately see this order in their portal and can proceed with SDC creation.
              </p>
              <div class="flex gap-2 mt-3">
                <button (click)="confirmRelease()" class="px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded transition-colors shadow-xs flex items-center gap-1.5">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  Yes, Release Order
                </button>
                <button (click)="confirmingOrder.set(null)" class="px-4 py-1.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- Main Sanction Orders Table -->
      <app-ui-table
        [columns]="columns"
        [data]="(orders$ | async) || []"
        emptyMessage="No Sanction Orders found.">
        
        <ng-template #rowTemplate let-order let-col="column">
          
          <ng-container *ngIf="col.key === 'ref'">
            <div class="font-bold text-[#131A4D] font-mono text-sm">{{ order.ref }}</div>
            <div *ngIf="order.status === 'DRAFT'" class="text-xs text-slate-500 font-semibold">Draft Version</div>
            <div *ngIf="order.status !== 'DRAFT'" class="text-xs text-slate-500">Target: <span class="font-bold text-slate-700">{{ order.target || 0 }}</span> Aspirants</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'tender'">
            <div class="font-bold text-slate-700">{{ order.tender }}</div>
            <div class="text-xs text-slate-500 font-mono">{{ order.eoi }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'tp'">
            <div class="font-bold text-slate-800">{{ order.tpName }}</div>
            <div class="text-[10px] text-slate-500 uppercase font-mono">{{ order.tpId }} • {{ order.scheme || 'SCHEME' }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span *ngIf="order.status === 'DRAFT'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 uppercase inline-flex items-center gap-1 border border-slate-300">
              <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Draft
            </span>
            <span *ngIf="order.status === 'PENDING_RELEASE'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 uppercase inline-flex items-center gap-1 border border-amber-300 animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Pending Release
            </span>
            <span *ngIf="order.status === 'RELEASED'" class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800 uppercase inline-flex items-center gap-1 border border-green-300">
              <span class="w-1.5 h-1.5 rounded-full bg-green-500"></span> Released & Active
            </span>
          </ng-container>

          <!-- ⚡ ACTION BUTTONS FOR ALL 3 STATES ⚡ -->
          <ng-container *ngIf="col.key === 'action'">
            <div class="flex justify-end items-center gap-2">
              
              <!-- 1️⃣ BUTTON FOR DRAFT: Edit Draft -->
              <button 
                *ngIf="order.status === 'DRAFT'" 
                (click)="openEditModal(order)"
                class="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:border-slate-400 text-xs font-bold rounded shadow-xs transition-all flex items-center gap-1">
                <svg class="w-3.5 h-3.5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                Edit Draft
              </button>

              <!-- 2️⃣ BUTTON FOR PENDING_RELEASE: Release Order -->
              <button 
                *ngIf="order.status === 'PENDING_RELEASE'" 
                (click)="promptRelease(order)" 
                class="px-3.5 py-1.5 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white text-xs font-bold rounded shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                Release Order
              </button>

              <!-- 3️⃣ BUTTON FOR RELEASED: View / Print Document -->
              <button 
                *ngIf="order.status === 'RELEASED'" 
                (click)="openViewModal(order)" 
                class="px-3.5 py-1.5 bg-[#131A4D] hover:bg-[#0a0e29] text-white text-xs font-bold rounded shadow-xs hover:shadow transition-all flex items-center gap-1.5 cursor-pointer">
                <svg class="w-3.5 h-3.5 text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                View Order
              </button>

            </div>
          </ng-container>

        </ng-template>
      </app-ui-table>

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- MODAL 1: EDIT DRAFT ORDER MODAL                                  -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      @if (editingOrder()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <!-- Modal Header -->
            <div class="bg-[#131A4D] px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 class="text-lg font-bold">Edit Sanction Order Draft</h3>
                <p class="text-xs text-blue-200 font-mono">{{ editingOrder()?.ref }}</p>
              </div>
              <button (click)="editingOrder.set(null)" class="text-slate-300 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <!-- Modal Body Form -->
            <div class="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Order Ref</label>
                  <input type="text" [(ngModel)]="editForm.ref" class="w-full px-3 py-2 border border-slate-300 rounded font-mono bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Scheme</label>
                  <select [(ngModel)]="editForm.scheme" class="w-full px-3 py-2 border border-slate-300 rounded bg-white text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                    <option value="SAMARTH">SAMARTH</option>
                    <option value="MMKVY">MMKVY</option>
                    <option value="MNSKSY">MNSKSY</option>
                    <option value="RAJKVIK">RAJKVIK</option>
                  </select>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Tender No.</label>
                  <input type="text" [(ngModel)]="editForm.tender" class="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">EOI Ref No.</label>
                  <input type="text" [(ngModel)]="editForm.eoi" class="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
              </div>

              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Training Provider Name</label>
                  <input type="text" [(ngModel)]="editForm.tpName" class="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">TP ID Code</label>
                  <input type="text" [(ngModel)]="editForm.tpId" class="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
              </div>

              <div class="grid grid-cols-3 gap-4">
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">Target Aspirants</label>
                  <input type="number" [(ngModel)]="editForm.target" class="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">MOU Start Date</label>
                  <input type="date" [(ngModel)]="editForm.mouStartDate" class="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
                <div>
                  <label class="block text-xs font-bold text-slate-700 mb-1">MOU Expiry Date</label>
                  <input type="date" [(ngModel)]="editForm.mouExpiryDate" class="w-full px-3 py-2 border border-slate-300 rounded text-slate-800 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#131A4D]">
                </div>
              </div>
            </div>

            <!-- Modal Footer Buttons -->
            <div class="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <button (click)="editingOrder.set(null)" class="px-4 py-2 border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-100 transition-colors">
                Cancel
              </button>
              <div class="flex gap-2">
                <button (click)="saveDraftChanges(false)" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded shadow-xs transition-colors">
                  Save Draft
                </button>
                <button (click)="saveDraftChanges(true)" class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded shadow-xs transition-colors flex items-center gap-1">
                  <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
                  Submit for Release
                </button>
              </div>
            </div>

          </div>
        </div>
      }

      <!-- ════════════════════════════════════════════════════════════════ -->
      <!-- MODAL 2: VIEW / PRINT OFFICIAL SANCTION ORDER MODAL              -->
      <!-- ════════════════════════════════════════════════════════════════ -->
      @if (viewingOrder()) {
        <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div class="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            <!-- Header -->
            <div class="bg-[#131A4D] px-6 py-4 text-white flex justify-between items-center">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded bg-white/10 flex items-center justify-center font-bold text-xs">GOVT</div>
                <div>
                  <h3 class="text-base font-bold">Official Sanction Order Document</h3>
                  <p class="text-xs text-blue-200 font-mono">{{ viewingOrder()?.ref }}</p>
                </div>
              </div>
              <button (click)="viewingOrder.set(null)" class="text-slate-300 hover:text-white text-2xl leading-none">&times;</button>
            </div>

            <!-- Printable Official Document Content -->
            <div class="p-8 space-y-6 max-h-[75vh] overflow-y-auto bg-slate-50">
              
              <!-- Letterhead -->
              <div class="bg-white border border-slate-200 p-6 rounded-lg shadow-xs space-y-6">
                <div class="text-center border-b border-slate-200 pb-4">
                  <p class="text-xs uppercase font-extrabold tracking-wider text-slate-500">Government of Rajasthan</p>
                  <h2 class="text-lg font-extrabold text-[#131A4D]">Rajasthan Skill & Livelihoods Development Corporation (RSLDC)</h2>
                  <p class="text-xs text-slate-500 mt-0.5">EMI Campus, Jhalana Doongri, Jaipur - 302004</p>
                </div>

                <div class="flex justify-between items-start text-xs font-mono">
                  <div>
                    <span class="font-bold text-slate-500">SANCTION ORDER NO:</span>
                    <p class="font-extrabold text-slate-800 text-sm mt-0.5">{{ viewingOrder()?.ref }}</p>
                  </div>
                  <div class="text-right">
                    <span class="font-bold text-slate-500">STATUS:</span>
                    <p class="font-bold text-green-700 uppercase mt-0.5">✓ Dispatched & Active</p>
                  </div>
                </div>

                <!-- Document Body -->
                <div class="space-y-3 text-xs text-slate-700 leading-relaxed">
                  <p>
                    Sanction of the Competent Authority is hereby accorded for allotment of targets under the 
                    <strong class="text-[#131A4D] font-bold">{{ viewingOrder()?.scheme || 'SAMARTH' }} Scheme</strong> to 
                    <strong class="text-slate-900 font-bold">{{ viewingOrder()?.tpName }}</strong> (TP Code: <span class="font-mono font-bold">{{ viewingOrder()?.tpId }}</span>) 
                    against Tender Ref <span class="font-mono font-bold">{{ viewingOrder()?.tender }}</span>.
                  </p>

                  <!-- Key Details Grid -->
                  <div class="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-md my-4">
                    <div>
                      <span class="text-[11px] font-bold text-slate-500 block">Allocated Target:</span>
                      <span class="text-sm font-extrabold text-[#131A4D]">{{ viewingOrder()?.target || 0 }} Aspirants</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-500 block">EOI Reference:</span>
                      <span class="text-xs font-mono font-bold text-slate-800">{{ viewingOrder()?.eoi }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-500 block">MOU Start Date:</span>
                      <span class="text-xs font-bold text-slate-800">{{ viewingOrder()?.mouStartDate || '2026-01-01' }}</span>
                    </div>
                    <div>
                      <span class="text-[11px] font-bold text-slate-500 block">MOU Expiry Date:</span>
                      <span class="text-xs font-bold text-slate-800">{{ viewingOrder()?.mouExpiryDate || '2027-01-01' }}</span>
                    </div>
                  </div>

                  <p class="text-slate-600 text-[11px]">
                    This order is issued subject to strict adherence to standard guidelines of the scheme and guidelines issued by RSLDC from time to time.
                  </p>
                </div>

                <!-- Official Signature Block -->
                <div class="pt-6 border-t border-slate-200 flex justify-between items-end">
                  <div class="text-[10px] text-slate-400">
                    Digitally Signed & Dispatched via ISMS Portal<br>
                    Verification Hash: <span class="font-mono">8f92a1c4b72</span>
                  </div>
                  <div class="text-right">
                    <div class="w-24 border-b border-slate-400 mb-1 inline-block"></div>
                    <p class="text-xs font-bold text-slate-800">Authorized Signatory</p>
                    <p class="text-[10px] text-slate-500">Department of Skill & Entrepreneurship</p>
                  </div>
                </div>

              </div>

            </div>

            <!-- Footer Action Buttons -->
            <div class="bg-slate-100 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
              <button (click)="viewingOrder.set(null)" class="px-4 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded hover:bg-slate-50 transition-colors">
                Close
              </button>
              <button (click)="downloadPdf()" class="px-5 py-2 bg-[#131A4D] hover:bg-[#0a0e29] text-white text-xs font-bold rounded shadow-xs transition-all flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                Download Official PDF
              </button>
            </div>

          </div>
        </div>
      }

    </div>
  `
})
export class SanctionOrderListComponent {
  private sanctionOrderService = inject(SanctionOrderService);
  
  orders$ = this.sanctionOrderService.orders$;

  columns: TableColumn[] = [
    { key: 'ref', label: 'Order Ref' },
    { key: 'tender', label: 'Tender / EOI' },
    { key: 'tp', label: 'Training Provider' },
    { key: 'status', label: 'Status' },
    { key: 'action', label: 'Actions', align: 'right' }
  ];

  // Signal state for active operations
  confirmingOrder = signal<SanctionOrder | null>(null);
  editingOrder = signal<SanctionOrder | null>(null);
  viewingOrder = signal<SanctionOrder | null>(null);
  toastMessage = signal<{ title: string; detail: string } | null>(null);

  // Edit form state
  editForm: Partial<SanctionOrder> = {};

  /** 1️⃣ DRAFT ACTION: Open edit modal */
  openEditModal(order: SanctionOrder) {
    this.editingOrder.set(order);
    this.editForm = { ...order };
  }

  /** Save changes to Draft (or Submit for Release) */
  saveDraftChanges(submitForRelease: boolean) {
    const order = this.editingOrder();
    if (!order) return;

    const newStatus = submitForRelease ? 'PENDING_RELEASE' : 'DRAFT';
    this.sanctionOrderService.updateOrder(order.id, {
      ...this.editForm,
      status: newStatus
    });

    this.editingOrder.set(null);

    if (submitForRelease) {
      this.showToast(
        'Submitted for Release!',
        `${order.ref} has been updated and moves to Pending Release status.`
      );
    } else {
      this.showToast(
        'Draft Saved Successfully',
        `Changes to draft ${order.ref} have been saved.`
      );
    }
  }

  /** 2️⃣ PENDING_RELEASE ACTION: Prompt release confirmation */
  promptRelease(order: SanctionOrder) {
    this.toastMessage.set(null);
    this.confirmingOrder.set(order);
  }

  /** Confirm release & dispatch to TP */
  confirmRelease() {
    const order = this.confirmingOrder();
    if (!order) return;
    this.sanctionOrderService.updateStatus(order.id, 'RELEASED');
    this.confirmingOrder.set(null);
    this.showToast(
      'Sanction Order Released Successfully!',
      `${order.ref} has been dispatched to ${order.tpName}. It is now live in their TP Sanction Orders catalog.`
    );
  }

  /** 3️⃣ RELEASED ACTION: Open view modal */
  openViewModal(order: SanctionOrder) {
    this.viewingOrder.set(order);
  }

  /** Download / Print PDF action */
  downloadPdf() {
    const order = this.viewingOrder();
    this.viewingOrder.set(null);
    this.showToast(
      'PDF Downloading...',
      `Official PDF for ${order?.ref || 'Sanction Order'} is generated and downloading.`
    );
    setTimeout(() => {
      window.print();
    }, 300);
  }

  private showToast(title: string, detail: string) {
    this.toastMessage.set({ title, detail });
    setTimeout(() => this.toastMessage.set(null), 7000);
  }
}
