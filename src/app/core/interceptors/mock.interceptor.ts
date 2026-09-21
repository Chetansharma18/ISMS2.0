import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { of, delay } from 'rxjs';
import { Trainee } from '../services/trainee.service';
import { AttendanceUser, AttendanceLog } from '../services/attendance.service';

const generateAddress = (): any => ({ houseNo: '123', streetName: 'Main St', wardNo: '1', villageTownCity: 'Jaipur', district: 'Jaipur', blockName: 'Central', tehsil: 'Jaipur', municipality: 'JMC', pincode: '302001' });

let mockTrainees: Trainee[] = [
  { 
    id: '1', registrationNo: 'REG-2026-001', tpId: 'TP042',
    aspirantCategory: 'General', aadhaarNo: 'XXXX-XXXX-1234', janaadhaarId: 'JAN-123', otherIdType: '', otherIdNo: '',
    name: 'Ramesh Kumar', gender: 'Male', relationType: 'Father', motherName: 'Sita Devi', dob: '2001-05-15', age: 25, education: '12th Pass', religion: 'Hindu', category: 'OBC', aspirantCategoryType: 'A', interestedSectors: ['IT'],
    trainingPreferredDistrict: 'Jaipur', workOutOfRajasthan: false, typeOfEmployment: 'Full Time', ruralUrban: 'Urban',
    accountNo: '123456789', accountName: 'Ramesh Kumar', accountType: 'Savings', bankName: 'SBI', branchName: 'Central', ifscCode: 'SBIN0001234', micrCode: '123456',
    courseName: 'Web Dev', schemeEnquiry: 'Yes', specialAbility: 'No', annualFamilyIncome: '1L', economicStatus: 'APL', bocwWorker: false, mgnregaWorker: false, rsby: false, gramsabhaPri: '', nrlmShgMember: '', epicNo: '', incomeSlab: '', economicStatusCardNo: '', bocwNo: '', mgnregaNo: '', rsbyNo: '', nrlmNo: '',
    permanentAddress: generateAddress(), communicationAddress: generateAddress(),
    mobile: '9876543210', altMobile: '', landlineNumber: '', email: 'ramesh@example.com',
    status: 'SUBMITTED', createdAt: new Date().toISOString()
  }
];

let mockAttendanceUsers: AttendanceUser[] = [
  { id: '1', userName: 'amit_attendance', nickName: 'Amit', email: 'amit@example.com', altEmail: '', mobile: '9876543212', altMobile: '', address: 'Jaipur Skill Center', status: 'ACTIVE', createdAt: new Date().toISOString() }
];

let mockAttendanceLogs: AttendanceLog[] = [
  { id: '1', batchCode: 'B-26-0001', traineeId: '1', deviceType: 'MANTRA', timestamp: new Date().toISOString(), status: 'SUCCESS' }
];

export const mockInterceptor: HttpInterceptorFn = (req, next) => {
  if (req.url.endsWith('.json')) {
    return next(req);
  }

  // SDC List
  if (req.url.includes('/api/v1/sdcs') && req.method === 'GET') {
    const mockResponse = {
      success: true,
      data: {
        items: [
          { id: '1', sdcCode: 'SDC-0001', name: 'Jaipur Skill Center', tpName: 'ARNOLD SAMARTH', scheme: 'SAMARTH', status: 'APPROVED', district: 'Jaipur', noOfApprovedBatches: 3, noOfCompletedBatches: 5, noOfOngoingBatches: 2 },
          { id: '2', sdcCode: 'SDC-0002', name: 'Ajmer Training Inst.', tpName: 'ARNOLD SAMARTH', scheme: 'SAMARTH', status: 'PENDING_INSPECTION', district: 'Ajmer', noOfApprovedBatches: 1, noOfCompletedBatches: 0, noOfOngoingBatches: 1 }
        ],
        total: 2, page: 1, pageSize: 10
      }
    };
    return of(new HttpResponse({ status: 200, body: mockResponse })).pipe(delay(500));
  }

  // Trainees API
  if (req.url.includes('/api/trainees')) {
    if (req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockTrainees })).pipe(delay(500));
    }
    if (req.method === 'POST' && !req.url.includes('/approve')) {
      const newTrainee = { ...(req.body as any), id: Math.random().toString(36).substr(2, 9), registrationNo: `REG-2026-${Math.floor(Math.random() * 1000)}`, status: 'SUBMITTED', createdAt: new Date().toISOString(), tpId: 'TP042' };
      mockTrainees.unshift(newTrainee);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    if (req.method === 'POST' && req.url.includes('/approve')) {
      const id = req.url.split('/')[3];
      mockTrainees = mockTrainees.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    if (req.method === 'POST' && req.url.includes('/assign-batch')) {
      const id = req.url.split('/')[3];
      const body = req.body as any;
      const batchCode = body.batchCode;
      mockTrainees = mockTrainees.map(t => t.id === id ? { ...t, status: 'ASSIGNED', assignedBatchCode: batchCode } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    if (req.method === 'POST' && req.url.includes('/bulk-assign-batch')) {
      const body = req.body as any;
      const { traineeIds, batchCode } = body;
      mockTrainees = mockTrainees.map(t => traineeIds.includes(t.id) ? { ...t, status: 'ASSIGNED', assignedBatchCode: batchCode } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    if (req.method === 'POST' && req.url.includes('/unmap')) {
      const id = req.url.split('/')[3];
      mockTrainees = mockTrainees.map(t => t.id === id ? { ...t, status: 'APPROVED', assignedBatchCode: undefined } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
  }

  // Attendance API
  if (req.url.includes('/api/attendance/users')) {
    if (req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockAttendanceUsers })).pipe(delay(500));
    }
    if (req.method === 'POST') {
      const newUser = { ...(req.body as any), id: Math.random().toString(36).substr(2, 9), status: 'ACTIVE', createdAt: new Date().toISOString() };
      mockAttendanceUsers.unshift(newUser);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
  }

  if (req.url.includes('/api/attendance/logs')) {
    if (req.method === 'GET') {
      return of(new HttpResponse({ status: 200, body: mockAttendanceLogs })).pipe(delay(500));
    }
  }

  if (req.url.includes('/api/attendance/mark')) {
    if (req.method === 'POST') {
      const newLog = { ...(req.body as any), id: Math.random().toString(36).substr(2, 9), timestamp: new Date().toISOString(), status: 'SUCCESS' };
      mockAttendanceLogs.unshift(newLog);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
  }

  return next(req);
};
