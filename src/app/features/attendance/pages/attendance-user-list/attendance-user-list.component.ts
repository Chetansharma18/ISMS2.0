import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { AttendanceService, AttendanceUser } from '../../../../core/services/attendance.service';
import { UiTableComponent, TableColumn } from '../../../../shared/components/ui/ui-table/ui-table.component';
import { UiInputComponent } from '../../../../shared/components/ui/ui-input/ui-input.component';
import { UiSelectComponent } from '../../../../shared/components/ui/ui-select/ui-select.component';

@Component({
  selector: 'app-attendance-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, UiTableComponent, UiInputComponent, UiSelectComponent],
  template: `
    <div class="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <!-- Page Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-2xl font-bold text-rsldc-navy">Attendance Users</h1>
          <p class="text-sm text-slate-500 mt-1">Manage operators authorized to capture biometric attendance.</p>
        </div>
        <button 
          *ngIf="authService.hasRole('TP_PIA') && !showForm"
          (click)="showForm = true"
          class="inline-flex items-center gap-2 bg-rsldc-navy text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#0f1540] transition shadow-md">
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
          Create Attendance User
        </button>
      </div>

      <!-- Create User Form (Inline) -->
      <div *ngIf="showForm" class="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-6 mb-6">
        <div class="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-rsldc-navy/10 rounded-lg text-rsldc-navy">
              <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
            </div>
            <h2 class="text-xl font-bold text-slate-800">Add New Operator</h2>
          </div>
          <button (click)="cancelForm()" class="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition">
            <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <form [formGroup]="userForm" (ngSubmit)="submitForm()" class="space-y-4">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <app-ui-input formControlName="userName" label="User Name" [required]="true" placeholder="e.g. attendance_abc"></app-ui-input>
            <app-ui-input formControlName="password" type="password" label="Password" [required]="true"></app-ui-input>
            <app-ui-input formControlName="nickName" label="Nick Name" [required]="true" placeholder="e.g. ABC Operator"></app-ui-input>
            <app-ui-input formControlName="email" type="email" label="Email" [required]="true"></app-ui-input>
            <app-ui-input formControlName="altEmail" type="email" label="Alternate Email"></app-ui-input>
            <app-ui-input formControlName="mobile" type="tel" label="Mobile Number" [required]="true"></app-ui-input>
            <app-ui-input formControlName="altMobile" type="tel" label="Alternate Mobile"></app-ui-input>
            <app-ui-input formControlName="address" label="Address"></app-ui-input>
            <app-ui-select formControlName="status" label="Status" [required]="true" [options]="[{label:'Active',value:'ACTIVE'},{label:'Inactive',value:'INACTIVE'}]"></app-ui-select>
          </div>
          
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" (click)="cancelForm()" class="px-5 py-2 border border-slate-300 text-slate-700 font-bold text-sm rounded-lg hover:bg-slate-50 transition">Cancel</button>
            <button type="submit" [disabled]="userForm.invalid" class="px-6 py-2 bg-rsldc-navy text-white font-bold text-sm rounded-lg hover:bg-[#0f1540] transition disabled:opacity-50 shadow-md">Add Operator</button>
          </div>
        </form>
      </div>

      <!-- Users Data Table -->
      <app-ui-table
        [columns]="columns"
        [data]="(users$ | async) || []"
        emptyMessage="No attendance users found.">
        
        <ng-template #rowTemplate let-user let-col="column">
          
          <ng-container *ngIf="col.key === 'userName'">
            <div class="font-mono font-semibold text-rsldc-navy">{{ user.userName }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'nickName'">
            <div class="font-bold text-slate-800">{{ user.nickName }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'contact'">
            <div class="text-sm text-slate-600">
              <div>{{ user.mobile }}</div>
              <div class="text-xs text-slate-500">{{ user.email }}</div>
            </div>
          </ng-container>

          <ng-container *ngIf="col.key === 'address'">
            <div class="text-sm text-slate-600 truncate max-w-xs">{{ user.address || '-' }}</div>
          </ng-container>

          <ng-container *ngIf="col.key === 'status'">
            <span class="px-2.5 py-1 rounded-full text-xs font-bold border"
              [ngClass]="{
                'bg-approve-100 text-approve-700 border-approve-700/20': user.status === 'ACTIVE',
                'bg-reject-100 text-reject-700 border-reject-700/20': user.status === 'INACTIVE'
              }">
              {{ user.status }}
            </span>
          </ng-container>

        </ng-template>
      </app-ui-table>
    </div>
  `
})
export class AttendanceUserListComponent {
  authService = inject(AuthService);
  private attendanceService = inject(AttendanceService);
  private fb = inject(FormBuilder);
  
  users$ = this.attendanceService.users$;
  showForm = false;

  userForm: FormGroup = this.fb.group({
    userName: ['', Validators.required],
    password: ['', Validators.required],
    nickName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    altEmail: ['', Validators.email],
    mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],
    altMobile: ['', Validators.pattern('^[0-9]{10}$')],
    address: [''],
    status: ['ACTIVE', Validators.required]
  });

  columns: TableColumn[] = [
    { key: 'userName', label: 'User Name' },
    { key: 'nickName', label: 'Nick Name' },
    { key: 'contact', label: 'Contact Details' },
    { key: 'address', label: 'Address' },
    { key: 'status', label: 'Status' }
  ];

  cancelForm() {
    this.showForm = false;
    this.userForm.reset({ status: 'ACTIVE' });
  }

  submitForm() {
    if (this.userForm.valid) {
      this.attendanceService.createAttendanceUser(this.userForm.value).subscribe({
        next: () => {
          this.cancelForm();
        }
      });
    }
  }
}
