import { resolveMock } from '../mock.config';

export const MOCK_SECTORS = resolveMock([
  { id: 'sec-1', code: 'ELE', name: 'Electronics & Hardware', status: 'Active' },
  { id: 'sec-2', code: 'IT', name: 'IT-ITeS', status: 'Active' },
  { id: 'sec-3', code: 'APP', name: 'Apparel & Made-Ups', status: 'Active' },
  { id: 'sec-4', code: 'HLT', name: 'Healthcare', status: 'Active' },
  { id: 'sec-5', code: 'AGR', name: 'Agriculture & Allied', status: 'Active' },
  { id: 'sec-6', code: 'TOU', name: 'Tourism & Hospitality', status: 'Active' },
  { id: 'sec-7', code: 'LOG', name: 'Logistics', status: 'Active' }
]);

export const MOCK_COURSES = resolveMock([
  { id: 'crs-1', sectorId: 'sec-1', code: 'ELE-SOL-01', name: 'Solar Panel Installation Technician', durationHours: 350, nsqfLevel: 4, fee: '₹14,000' },
  { id: 'crs-2', sectorId: 'sec-2', code: 'IT-DDEO-01', name: 'Domestic Data Entry Operator', durationHours: 400, nsqfLevel: 4, fee: '₹12,500' },
  { id: 'crs-3', sectorId: 'sec-3', code: 'APP-SET-01', name: 'Self Employed Tailor', durationHours: 300, nsqfLevel: 3, fee: '₹10,500' },
  { id: 'crs-4', sectorId: 'sec-4', code: 'HLT-GDA-01', name: 'General Duty Assistant', durationHours: 450, nsqfLevel: 4, fee: '₹16,000' }
]);

export const MOCK_DISTRICTS = resolveMock([
  { id: 'dist-1', name: 'Jaipur', division: 'Jaipur', totalCentres: 12 },
  { id: 'dist-2', name: 'Jodhpur', division: 'Jodhpur', totalCentres: 8 },
  { id: 'dist-3', name: 'Kota', division: 'Kota', totalCentres: 6 },
  { id: 'dist-4', name: 'Udaipur', division: 'Udaipur', totalCentres: 7 },
  { id: 'dist-5', name: 'Bikaner', division: 'Bikaner', totalCentres: 5 },
  { id: 'dist-6', name: 'Ajmer', division: 'Ajmer', totalCentres: 6 }
]);
