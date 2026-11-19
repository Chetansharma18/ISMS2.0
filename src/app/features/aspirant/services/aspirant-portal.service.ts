import { Injectable, inject, signal, computed } from '@angular/core';
import { StorageService } from '../../../core/services/storage.service';
import { UserPersona } from '../../../core/models/user.model';
import { AspirantFormData } from '../../sdc/config/aspirant-form.config';
import { createEmptyAspirantFormData } from '../../sdc/components/aspirant-mapping/aspirant-form-data.factory';

export interface TrainingCalendarItem {
  id: string;
  district: string;
  sector: string;
  course: string;
  trainingPartner: string;
  sdcName: string;
  batchDate: string;
  batchTime: string;
  status?: string;
  expressedDate?: string;
}

export const INITIAL_TRAINING_CALENDAR: TrainingCalendarItem[] = [
  {
    id: 'tc-001',
    district: 'Jaipur',
    sector: 'Electronics & Hardware',
    course: 'Solar Panel Installation Technician',
    trainingPartner: 'Apex Technical & Infrastructure Solutions Pvt Ltd',
    sdcName: 'Jaipur Skill Development Centre - Vidhyadhar Nagar',
    batchDate: '05/08/2026 - 01/01/2027',
    batchTime: '10:00 AM - 05:00 PM',
    status: 'Admissions Open'
  },
  {
    id: 'tc-002',
    district: 'Jodhpur',
    sector: 'IT-ITeS',
    course: 'Domestic Data Entry Operator',
    trainingPartner: 'Marwar Skill Foundation',
    sdcName: 'Marwar Kaushal Kendra - Mandore',
    batchDate: '10/08/2026 - 15/12/2026',
    batchTime: '09:30 AM - 04:30 PM',
    status: 'Admissions Open'
  },
  {
    id: 'tc-003',
    district: 'Kota',
    sector: 'Healthcare',
    course: 'General Duty Assistant (GDA)',
    trainingPartner: 'Hadoti Skill & Allied Services',
    sdcName: 'Hadoti Technical Training Centre - Vigyan Nagar',
    batchDate: '15/08/2026 - 20/01/2027',
    batchTime: '10:00 AM - 05:00 PM',
    status: 'Admissions Open'
  },
  {
    id: 'tc-004',
    district: 'Udaipur',
    sector: 'Tourism & Hospitality',
    course: 'Food & Beverage Service Associate',
    trainingPartner: 'Mewar Skill Development Trust',
    sdcName: 'Mewar Skill Academy - Sukher',
    batchDate: '01/09/2026 - 28/02/2027',
    batchTime: '09:00 AM - 04:00 PM',
    status: 'Admissions Open'
  },
  {
    id: 'tc-005',
    district: 'Bikaner',
    sector: 'Apparel & Made-Ups',
    course: 'Self Employed Tailor',
    trainingPartner: 'Desert Livelihood Society',
    sdcName: 'Bikaner Kaushal Vikas Kendra - Karni Nagar',
    batchDate: '20/08/2026 - 15/01/2027',
    batchTime: '10:00 AM - 05:00 PM',
    status: 'Admissions Open'
  },
  {
    id: 'tc-006',
    district: 'Ajmer',
    sector: 'Automotive',
    course: 'Two Wheeler Service Technician',
    trainingPartner: 'Rajasthan Technical Training Institute',
    sdcName: 'Ajmer District Kaushal Centre - Vaishali Nagar',
    batchDate: '25/08/2026 - 10/01/2027',
    batchTime: '10:00 AM - 05:00 PM',
    status: 'Admissions Open'
  },
  {
    id: 'tc-007',
    district: 'Alwar',
    sector: 'Capital Goods',
    course: 'CNC Operator Turning',
    trainingPartner: 'Matsya Industrial Skill Foundation',
    sdcName: 'Matsya Skill Development Centre - MIA Alwar',
    batchDate: '05/09/2026 - 15/02/2027',
    batchTime: '09:00 AM - 04:30 PM',
    status: 'Admissions Open'
  },
  {
    id: 'tc-008',
    district: 'Bharatpur',
    sector: 'Agriculture',
    course: 'Micro Irrigation Technician',
    trainingPartner: 'Brij Kisan Skill Trust',
    sdcName: 'Brij Kaushal Kendra - Kumher',
    batchDate: '10/09/2026 - 20/01/2027',
    batchTime: '10:00 AM - 05:00 PM',
    status: 'Admissions Open'
  }
];

@Injectable({
  providedIn: 'root'
})
export class AspirantPortalService {
  private readonly storage = inject(StorageService);

  private readonly PROFILE_COMPLETE_KEY = 'isms_aspirant_profile_complete';
  private readonly PROFILE_DATA_KEY = 'isms_aspirant_profile_data';
  private readonly EXPRESSED_INTERESTS_KEY = 'isms_aspirant_expressed_interests';

  readonly calendarItems = signal<TrainingCalendarItem[]>(INITIAL_TRAINING_CALENDAR);
  readonly isProfileComplete = signal<boolean>(false);
  readonly profileData = signal<AspirantFormData>(createEmptyAspirantFormData());
  readonly expressedInterests = signal<TrainingCalendarItem[]>([]);

  constructor() {
    this.restoreState();
  }

  private restoreState(): void {
    const authUser = this.storage.getItem<UserPersona>('isms_user');
    if (authUser && authUser.role === 'aspirant' && authUser.isProfileComplete === false) {
      this.isProfileComplete.set(false);
      this.profileData.set(createEmptyAspirantFormData());
      return;
    }

    const savedComplete = this.storage.getItem<boolean>(this.PROFILE_COMPLETE_KEY);
    if (savedComplete !== null) {
      this.isProfileComplete.set(!!savedComplete);
    }

    const savedProfile = this.storage.getItem<AspirantFormData>(this.PROFILE_DATA_KEY);
    if (savedProfile) {
      this.profileData.set(savedProfile);
    }

    const savedExpressed = this.storage.getItem<TrainingCalendarItem[]>(this.EXPRESSED_INTERESTS_KEY);
    if (savedExpressed && Array.isArray(savedExpressed)) {
      this.expressedInterests.set(savedExpressed);
    }
  }

  isExpressed(batchId: string): boolean {
    return this.expressedInterests().some(item => item.id === batchId);
  }

  expressInterest(calendarItem: TrainingCalendarItem): boolean {
    if (!this.isProfileComplete()) {
      return false;
    }
    if (this.isExpressed(calendarItem.id)) {
      return true;
    }

    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;

    const expressedItem: TrainingCalendarItem = {
      ...calendarItem,
      status: 'Interest Submitted',
      expressedDate: formattedDate
    };

    const updated = [expressedItem, ...this.expressedInterests()];
    this.expressedInterests.set(updated);
    this.storage.setItem(this.EXPRESSED_INTERESTS_KEY, updated);
    return true;
  }

  saveProfile(data: AspirantFormData): void {
    this.profileData.set({ ...data });
    this.isProfileComplete.set(true);
    this.storage.setItem(this.PROFILE_DATA_KEY, data);
    this.storage.setItem(this.PROFILE_COMPLETE_KEY, true);

    const authUser = this.storage.getItem<UserPersona>('isms_user');
    if (authUser) {
      authUser.isProfileComplete = true;
      this.storage.setItem('isms_user', authUser);
    }
  }

  setProfileComplete(complete: boolean): void {
    this.isProfileComplete.set(complete);
    this.storage.setItem(this.PROFILE_COMPLETE_KEY, complete);
  }

  resetProfile(): void {
    this.profileData.set(createEmptyAspirantFormData());
    this.isProfileComplete.set(false);
    this.storage.removeItem(this.PROFILE_DATA_KEY);
    this.storage.removeItem(this.PROFILE_COMPLETE_KEY);
  }
}
