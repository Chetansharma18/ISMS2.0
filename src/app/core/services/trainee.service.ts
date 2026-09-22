import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, switchMap, catchError } from 'rxjs/operators';

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
  private initialTrainees: Trainee[] = [
    {
      id: 'TR-101',
      registrationNo: 'REG-2026-9001',
      tpId: 'TP-2026-001',
      aspirantCategory: 'General Youth',
      aadhaarNo: 'XXXX-XXXX-9812',
      janaadhaarId: 'JAN-2026-1029',
      otherIdType: 'Voter ID',
      otherIdNo: 'VOT-98124',
      name: 'Rahul Kumar Meena',
      gender: 'Male',
      relationType: 'Father',
      motherName: 'Sunita Devi',
      dob: '2001-04-12',
      age: 24,
      education: 'Higher Secondary (12th)',
      religion: 'Hindu',
      category: 'ST',
      aspirantCategoryType: 'Rural Youth',
      interestedSectors: ['Solar Energy', 'Electronics'],
      trainingPreferredDistrict: 'Jaipur',
      workOutOfRajasthan: false,
      typeOfEmployment: 'Wage Employment',
      ruralUrban: 'Rural',
      accountNo: '30918274912',
      accountName: 'Rahul Kumar Meena',
      accountType: 'Savings Account',
      bankName: 'Bank of Baroda',
      branchName: 'Sanganer, Jaipur',
      ifscCode: 'BARB0SANGAN',
      micrCode: '302012004',
      courseName: 'Solar Panel Installation Technician',
      schemeEnquiry: 'MMKVY',
      specialAbility: 'None',
      annualFamilyIncome: '1,20,000',
      economicStatus: 'BPL',
      bocwWorker: false,
      mgnregaWorker: true,
      rsby: false,
      gramsabhaPri: 'Yes',
      nrlmShgMember: 'No',
      epicNo: 'EPIC-9012',
      incomeSlab: 'Below 1.5 Lakhs',
      economicStatusCardNo: 'BPL-9012',
      bocwNo: '',
      mgnregaNo: 'MG-302198',
      rsbyNo: '',
      nrlmNo: '',
      permanentAddress: { houseNo: '42', streetName: 'Main Village Road', wardNo: '04', villageTownCity: 'Chaksu', district: 'Jaipur', blockName: 'Chaksu', tehsil: 'Chaksu', municipality: 'Chaksu', pincode: '303901' },
      communicationAddress: { houseNo: '42', streetName: 'Main Village Road', wardNo: '04', villageTownCity: 'Chaksu', district: 'Jaipur', blockName: 'Chaksu', tehsil: 'Chaksu', municipality: 'Chaksu', pincode: '303901' },
      mobile: '+91 98290 11223',
      altMobile: '',
      landlineNumber: '',
      email: 'rahul.meena@gmail.com',
      status: 'APPROVED',
      assignedBatchCode: 'BAT-2026-001',
      createdAt: '2026-09-01'
    },
    {
      id: 'TR-102',
      registrationNo: 'REG-2026-9002',
      tpId: 'TP-2026-001',
      aspirantCategory: 'General Youth',
      aadhaarNo: 'XXXX-XXXX-4410',
      janaadhaarId: 'JAN-2026-1030',
      otherIdType: 'Aadhaar',
      otherIdNo: '',
      name: 'Priya Sharma',
      gender: 'Female',
      relationType: 'Father',
      motherName: 'Suman Sharma',
      dob: '2002-09-20',
      age: 23,
      education: 'Graduate (B.A.)',
      religion: 'Hindu',
      category: 'General',
      aspirantCategoryType: 'Urban Youth',
      interestedSectors: ['Information Technology', 'Data Entry'],
      trainingPreferredDistrict: 'Jaipur',
      workOutOfRajasthan: true,
      typeOfEmployment: 'Corporate / IT',
      ruralUrban: 'Urban',
      accountNo: '91204812948',
      accountName: 'Priya Sharma',
      accountType: 'Savings Account',
      bankName: 'State Bank of India',
      branchName: 'Malviya Nagar, Jaipur',
      ifscCode: 'SBIN0001294',
      micrCode: '302002012',
      courseName: 'Domestic Data Entry Operator',
      schemeEnquiry: 'SAMARTH',
      specialAbility: 'None',
      annualFamilyIncome: '1,80,000',
      economicStatus: 'APL',
      bocwWorker: false,
      mgnregaWorker: false,
      rsby: false,
      gramsabhaPri: 'No',
      nrlmShgMember: 'No',
      epicNo: 'EPIC-4410',
      incomeSlab: '1.5 - 2.5 Lakhs',
      economicStatusCardNo: '',
      bocwNo: '',
      mgnregaNo: '',
      rsbyNo: '',
      nrlmNo: '',
      permanentAddress: { houseNo: 'B-12', streetName: 'Gaurav Tower Road', wardNo: '12', villageTownCity: 'Jaipur', district: 'Jaipur', blockName: 'Jaipur City', tehsil: 'Jaipur', municipality: 'Jaipur Nagar Nigam', pincode: '302017' },
      communicationAddress: { houseNo: 'B-12', streetName: 'Gaurav Tower Road', wardNo: '12', villageTownCity: 'Jaipur', district: 'Jaipur', blockName: 'Jaipur City', tehsil: 'Jaipur', municipality: 'Jaipur Nagar Nigam', pincode: '302017' },
      mobile: '+91 94140 88231',
      altMobile: '',
      landlineNumber: '',
      email: 'priya.sharma2002@gmail.com',
      status: 'SUBMITTED',
      createdAt: '2026-09-10'
    }
  ];

  private traineesSubject = new BehaviorSubject<Trainee[]>(this.initialTrainees);
  trainees$ = this.traineesSubject.asObservable();

  constructor(private http: HttpClient) {
    this.fetchTrainees();
  }

  private fetchTrainees() {
    this.http.get<Trainee[]>('/api/trainees').subscribe({
      next: (data) => {
        if (Array.isArray(data) && data.length > 0) {
          this.traineesSubject.next(data);
        }
      },
      error: () => {
        // Fallback to pre-seeded list for local preview
      }
    });
  }

  registerTrainee(payload: any): Observable<any> {
    const current = this.traineesSubject.value;
    const newTrainee: Trainee = {
      id: 'TR-' + Math.floor(100 + Math.random() * 900),
      registrationNo: 'REG-2026-' + Math.floor(1000 + Math.random() * 9000),
      tpId: payload.tpId || 'TP-2026-001',
      aspirantCategory: payload.aspirantCategory || 'General Youth',
      aadhaarNo: payload.aadhaarNo || 'XXXX-XXXX-1234',
      janaadhaarId: payload.janaadhaarId || '',
      otherIdType: payload.otherIdType || '',
      otherIdNo: payload.otherIdNo || '',
      name: payload.name || payload.fullName || 'New Aspirant',
      gender: payload.gender || 'Male',
      relationType: payload.relationType || 'Father',
      motherName: payload.motherName || '',
      dob: payload.dob || '2002-01-01',
      age: 22,
      education: payload.education || '12th Pass',
      religion: payload.religion || 'Hindu',
      category: payload.category || 'General',
      aspirantCategoryType: payload.aspirantCategoryType || 'General',
      interestedSectors: payload.interestedSectors || ['IT'],
      trainingPreferredDistrict: payload.trainingPreferredDistrict || 'Jaipur',
      workOutOfRajasthan: false,
      typeOfEmployment: 'Wage Employment',
      ruralUrban: payload.ruralUrban || 'Urban',
      accountNo: payload.accountNo || '',
      accountName: payload.accountName || payload.name || '',
      accountType: 'Savings Account',
      bankName: payload.bankName || 'SBI',
      branchName: payload.branchName || '',
      ifscCode: payload.ifscCode || '',
      micrCode: '',
      courseName: payload.courseName || 'Skill Training Course',
      schemeEnquiry: payload.schemeEnquiry || 'MMKVY',
      specialAbility: 'None',
      annualFamilyIncome: '1,50,000',
      economicStatus: 'APL',
      bocwWorker: false,
      mgnregaWorker: false,
      rsby: false,
      gramsabhaPri: 'No',
      nrlmShgMember: 'No',
      epicNo: '',
      incomeSlab: '',
      economicStatusCardNo: '',
      bocwNo: '',
      mgnregaNo: '',
      rsbyNo: '',
      nrlmNo: '',
      permanentAddress: payload.permanentAddress || { houseNo: '', streetName: '', wardNo: '', villageTownCity: 'Jaipur', district: 'Jaipur', blockName: 'Jaipur', tehsil: 'Jaipur', municipality: 'Jaipur', pincode: '302001' },
      communicationAddress: payload.communicationAddress || { houseNo: '', streetName: '', wardNo: '', villageTownCity: 'Jaipur', district: 'Jaipur', blockName: 'Jaipur', tehsil: 'Jaipur', municipality: 'Jaipur', pincode: '302001' },
      mobile: payload.mobile || '+91 98765 43210',
      altMobile: '',
      landlineNumber: '',
      email: payload.email || 'aspirant@isms.rajasthan.gov.in',
      status: 'SUBMITTED',
      createdAt: new Date().toISOString().split('T')[0]
    };

    const updated = [newTrainee, ...current];
    this.traineesSubject.next(updated);
    return of({ success: true, trainee: newTrainee });
  }

  approveTrainee(id: string): Observable<any> {
    const current = this.traineesSubject.value;
    const updated = current.map(t => t.id === id ? { ...t, status: 'APPROVED' as const } : t);
    this.traineesSubject.next(updated);
    return of({ success: true });
  }

  assignToBatch(traineeId: string, batchCode: string): Observable<any> {
    const current = this.traineesSubject.value;
    const updated = current.map(t => t.id === traineeId ? { ...t, status: 'ASSIGNED' as const, assignedBatchCode: batchCode } : t);
    this.traineesSubject.next(updated);
    return of({ success: true });
  }

  bulkAssignToBatch(traineeIds: string[], batchCode: string): Observable<any> {
    const current = this.traineesSubject.value;
    const updated = current.map(t => traineeIds.includes(t.id) ? { ...t, status: 'ASSIGNED' as const, assignedBatchCode: batchCode } : t);
    this.traineesSubject.next(updated);
    return of({ success: true });
  }

  unmapFromBatch(traineeId: string): Observable<any> {
    const current = this.traineesSubject.value;
    const updated = current.map(t => t.id === traineeId ? { ...t, status: 'APPROVED' as const, assignedBatchCode: undefined } : t);
    this.traineesSubject.next(updated);
    return of({ success: true });
  }
}
