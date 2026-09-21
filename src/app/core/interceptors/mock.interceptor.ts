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
  },
  { 
    id: '2', registrationNo: 'REG-2026-002', tpId: 'TP042',
    aspirantCategory: 'General', aadhaarNo: 'XXXX-XXXX-5678', janaadhaarId: 'JAN-456', otherIdType: '', otherIdNo: '',
    name: 'Priya Sharma', gender: 'Female', relationType: 'Father', motherName: 'Kavita Sharma', dob: '2003-08-20', age: 23, education: 'Graduate', religion: 'Hindu', category: 'General', aspirantCategoryType: 'A', interestedSectors: ['IT'],
    trainingPreferredDistrict: 'Jaipur', workOutOfRajasthan: false, typeOfEmployment: 'Full Time', ruralUrban: 'Urban',
    accountNo: '987654321', accountName: 'Priya Sharma', accountType: 'Savings', bankName: 'SBI', branchName: 'Central', ifscCode: 'SBIN0001234', micrCode: '654321',
    courseName: 'Data Science', schemeEnquiry: 'Yes', specialAbility: 'No', annualFamilyIncome: '2L', economicStatus: 'APL', bocwWorker: false, mgnregaWorker: false, rsby: false, gramsabhaPri: '', nrlmShgMember: '', epicNo: '', incomeSlab: '', economicStatusCardNo: '', bocwNo: '', mgnregaNo: '', rsbyNo: '', nrlmNo: '',
    permanentAddress: generateAddress(), communicationAddress: generateAddress(),
    mobile: '9876543211', altMobile: '', landlineNumber: '', email: 'priya@example.com',
    status: 'APPROVED', createdAt: new Date().toISOString()
  },
  { 
    id: '3', registrationNo: 'REG-2026-003', tpId: 'TP042',
    aspirantCategory: 'General', aadhaarNo: 'XXXX-XXXX-9012', janaadhaarId: 'JAN-789', otherIdType: '', otherIdNo: '',
    name: 'Amit Singh', gender: 'Male', relationType: 'Father', motherName: 'Sunita Singh', dob: '2000-11-10', age: 26, education: '10th Pass', religion: 'Hindu', category: 'SC', aspirantCategoryType: 'B', interestedSectors: ['Retail'],
    trainingPreferredDistrict: 'Ajmer', workOutOfRajasthan: true, typeOfEmployment: 'Part Time', ruralUrban: 'Rural',
    accountNo: '456123789', accountName: 'Amit Singh', accountType: 'Savings', bankName: 'PNB', branchName: 'North', ifscCode: 'PUNB0001234', micrCode: '987654',
    courseName: 'Retail Sales', schemeEnquiry: 'No', specialAbility: 'No', annualFamilyIncome: '50K', economicStatus: 'BPL', bocwWorker: false, mgnregaWorker: false, rsby: false, gramsabhaPri: '', nrlmShgMember: '', epicNo: '', incomeSlab: '', economicStatusCardNo: '', bocwNo: '', mgnregaNo: '', rsbyNo: '', nrlmNo: '',
    permanentAddress: generateAddress(), communicationAddress: generateAddress(),
    mobile: '9876543212', altMobile: '', landlineNumber: '', email: 'amit@example.com',
    status: 'APPROVED', createdAt: new Date().toISOString()
  },
  { 
    id: '4', registrationNo: 'REG-2026-004', tpId: 'TP042',
    aspirantCategory: 'General', aadhaarNo: 'XXXX-XXXX-1111', janaadhaarId: 'JAN-111', otherIdType: '', otherIdNo: '',
    name: 'Vikram Mehta', gender: 'Male', relationType: 'Father', motherName: 'Geeta Mehta', dob: '1999-03-22', age: 27, education: 'ITI', religion: 'Hindu', category: 'General', aspirantCategoryType: 'C', interestedSectors: ['Electronics'],
    trainingPreferredDistrict: 'Jaipur', workOutOfRajasthan: true, typeOfEmployment: 'Full Time', ruralUrban: 'Urban',
    accountNo: '111222333', accountName: 'Vikram Mehta', accountType: 'Savings', bankName: 'HDFC', branchName: 'West', ifscCode: 'HDFC0001234', micrCode: '111222',
    courseName: 'Electrician', schemeEnquiry: 'Yes', specialAbility: 'No', annualFamilyIncome: '3L', economicStatus: 'APL', bocwWorker: false, mgnregaWorker: false, rsby: false, gramsabhaPri: '', nrlmShgMember: '', epicNo: '', incomeSlab: '', economicStatusCardNo: '', bocwNo: '', mgnregaNo: '', rsbyNo: '', nrlmNo: '',
    permanentAddress: generateAddress(), communicationAddress: generateAddress(),
    mobile: '9876543213', altMobile: '', landlineNumber: '', email: 'vikram@example.com',
    status: 'ASSIGNED', assignedBatchCode: 'B-26-0002', createdAt: new Date().toISOString()
  },
  { 
    id: '5', registrationNo: 'REG-2026-005', tpId: 'TP042',
    aspirantCategory: 'General', aadhaarNo: 'XXXX-XXXX-2222', janaadhaarId: 'JAN-222', otherIdType: '', otherIdNo: '',
    name: 'Neha Verma', gender: 'Female', relationType: 'Father', motherName: 'Rekha Verma', dob: '2002-07-11', age: 24, education: '12th Pass', religion: 'Hindu', category: 'OBC', aspirantCategoryType: 'A', interestedSectors: ['Apparel'],
    trainingPreferredDistrict: 'Jaipur', workOutOfRajasthan: false, typeOfEmployment: 'Part Time', ruralUrban: 'Urban',
    accountNo: '444555666', accountName: 'Neha Verma', accountType: 'Savings', bankName: 'ICICI', branchName: 'South', ifscCode: 'ICIC0001234', micrCode: '444555',
    courseName: 'Tailoring', schemeEnquiry: 'No', specialAbility: 'No', annualFamilyIncome: '1.5L', economicStatus: 'APL', bocwWorker: false, mgnregaWorker: false, rsby: false, gramsabhaPri: '', nrlmShgMember: '', epicNo: '', incomeSlab: '', economicStatusCardNo: '', bocwNo: '', mgnregaNo: '', rsbyNo: '', nrlmNo: '',
    permanentAddress: generateAddress(), communicationAddress: generateAddress(),
    mobile: '9876543214', altMobile: '', landlineNumber: '', email: 'neha@example.com',
    status: 'ASSIGNED', assignedBatchCode: 'B-26-0002', createdAt: new Date().toISOString()
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
    // Approve
    if (req.method === 'POST' && req.url.includes('/approve')) {
      const id = req.url.split('/')[3];
      mockTrainees = mockTrainees.map(t => t.id === id ? { ...t, status: 'APPROVED' } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    // Bulk assign to batch (check BEFORE single assign-batch to avoid partial match issues)
    if (req.method === 'POST' && req.url.includes('/bulk-assign-batch')) {
      const body = req.body as any;
      const { traineeIds, batchCode } = body;
      mockTrainees = mockTrainees.map(t => traineeIds.includes(t.id) ? { ...t, status: 'ASSIGNED', assignedBatchCode: batchCode } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    // Single assign to batch
    if (req.method === 'POST' && req.url.includes('/assign-batch')) {
      const id = req.url.split('/')[3];
      const body = req.body as any;
      const batchCode = body.batchCode;
      mockTrainees = mockTrainees.map(t => t.id === id ? { ...t, status: 'ASSIGNED', assignedBatchCode: batchCode } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    // Unmap from batch
    if (req.method === 'POST' && req.url.includes('/unmap')) {
      const id = req.url.split('/')[3];
      mockTrainees = mockTrainees.map(t => t.id === id ? { ...t, status: 'APPROVED', assignedBatchCode: undefined } : t);
      return of(new HttpResponse({ status: 200, body: { success: true } })).pipe(delay(500));
    }
    // Register new trainee (exact base URL only)
    if (req.method === 'POST' && req.url === '/api/trainees') {
      const newTrainee = { ...(req.body as any), id: Math.random().toString(36).substr(2, 9), registrationNo: `REG-2026-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`, status: 'SUBMITTED', createdAt: new Date().toISOString(), tpId: 'TP042' };
      mockTrainees.unshift(newTrainee);
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
