import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface Trainee {
  id: string;
  registrationNo: string;
  tpId: string;
  
  // Basic Info
  aspirantCategory: string;
  aadhaarNo: string;
  janaadhaarId: string;
  otherIdType: string;
  otherIdNo: string;
  name: string;
  gender: string;
  relationType: string;
  motherName: string;
  dob: string;
  age: number;
  education: string;
  religion: string;
  category: string;
  aspirantCategoryType: string;
  interestedSectors: string[];
  
  // Training Preference & Employment
  trainingPreferredDistrict: string;
  workOutOfRajasthan: boolean;
  typeOfEmployment: string;
  ruralUrban: string;
  
  // Bank Details
  accountNo: string;
  accountName: string;
  accountType: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  micrCode: string;

  // Additional Details
  courseName: string;
  schemeEnquiry: string;
  specialAbility: string;
  annualFamilyIncome: string;
  economicStatus: string;
  bocwWorker: boolean;
  mgnregaWorker: boolean;
  rsby: boolean;
  gramsabhaPri: string;
  nrlmShgMember: string;
  epicNo: string;
  incomeSlab: string;
  economicStatusCardNo: string;
  bocwNo: string;
  mgnregaNo: string;
  rsbyNo: string;
  nrlmNo: string;

  // Addresses
  permanentAddress: Address;
  communicationAddress: Address;

  // Contact
  mobile: string;
  altMobile: string;
  landlineNumber: string;
  email: string;

  // System status
  status: 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'ASSIGNED';
  assignedBatchCode?: string;
  createdAt: string;
}

export interface Address {
  houseNo: string;
  streetName: string;
  wardNo: string;
  villageTownCity: string;
  district: string;
  blockName: string;
  tehsil: string;
  municipality: string;
  pincode: string;
  assemblyConstituency?: string;
  parliamentConstituency?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TraineeService {
  private traineesSubject = new BehaviorSubject<Trainee[]>([]);
  trainees$ = this.traineesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchTrainees();
  }

  private fetchTrainees() {
    this.http.get<Trainee[]>('/api/trainees').subscribe({
      next: (data) => this.traineesSubject.next(data),
      error: (err) => console.error('Failed to fetch trainees:', err)
    });
  }

  registerTrainee(payload: any): Observable<any> {
    return this.http.post('/api/trainees', payload).pipe(
      tap(() => this.fetchTrainees())
    );
  }

  approveTrainee(id: string): Observable<any> {
    return this.http.post(`/api/trainees/${id}/approve`, {}).pipe(
      tap(() => this.fetchTrainees())
    );
  }

  assignToBatch(traineeId: string, batchCode: string): Observable<any> {
    return this.http.post(`/api/trainees/${traineeId}/assign-batch`, { batchCode }).pipe(
      tap(() => this.fetchTrainees())
    );
  }

  bulkAssignToBatch(traineeIds: string[], batchCode: string): Observable<any> {
    return this.http.post('/api/trainees/bulk-assign-batch', { traineeIds, batchCode }).pipe(
      tap(() => this.fetchTrainees())
    );
  }

  unmapFromBatch(traineeId: string): Observable<any> {
    return this.http.post(`/api/trainees/${traineeId}/unmap`, {}).pipe(
      tap(() => this.fetchTrainees())
    );
  }
}
