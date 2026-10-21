import { Injectable, inject } from '@angular/core';
import { Observable, delay, of } from 'rxjs';
import {
  EMPLOYMENT_DEPT_RECORDS,
  EXPRESSED_INTEREST_APPLICANTS,
  EmploymentDeptRecord,
  ExpressedInterestApplicant,
  AspirantSourceProfile
} from '../../../core/mock/data/aspirant-sources.mock';
import { AspirantFormData, calculateAgeFromDob } from '../config/aspirant-form.config';
import { createEmptyAspirantFormData } from '../components/aspirant-mapping/aspirant-form-data.factory';
import { BatchRecord } from '../models/batch.model';
import { canRegisterAspirants, canRegisterReplacement } from '../utils/batch-approval.util';
import { AspirantService } from './aspirant.service';
import { BatchService } from './batch.service';
import { SdcService } from './sdc.service';

/**
 * Where a training partner can get an aspirant's details from when registering one in a batch: the aspirants who
 * expressed interest on the portal, or the Employment Department. Both read dummy data for now and answer like a real
 * call would; swap the bodies for the real requests when the APIs are available.
 */
@Injectable({ providedIn: 'root' })
export class AspirantSourceService {
  private readonly aspirants = inject(AspirantService);
  private readonly batches = inject(BatchService);
  private readonly sdcs = inject(SdcService);

  /**
   * Aspirants who expressed interest in the course (or the sector) of the batch and are not registered in it yet.
   * Reads the signal of registered aspirants, so it can be used inside a computed.
   */
  expressedInterestFor(batch: BatchRecord): ExpressedInterestApplicant[] {
    const course = (batch.courseName || batch.course || '').trim().toLowerCase();
    const sector = (batch.sector || '').trim().toLowerCase();
    const registered = new Set(
      this.aspirants
        .aspirants()
        .filter(a => a.batchId === batch.id && a.trainingStatus !== 'DROPOUT')
        .map(a => a.aadhaarNo)
    );
    return EXPRESSED_INTEREST_APPLICANTS.filter(
      a =>
        !registered.has(a.aadhaarNo) &&
        (a.course.trim().toLowerCase() === course || a.sector.trim().toLowerCase() === sector)
    );
  }

  /**
   * The Employment Department's records that fit the batch: the aspirant looks for work in the batch's sector, or lives
   * in the district of its center. The call answers after a short delay, like the real API would.
   */
  fetchFromEmploymentDept(batch: BatchRecord): Observable<EmploymentDeptRecord[]> {
    const sector = (batch.sector || '').trim().toLowerCase();
    const district = (batch.sdcDistrict || '').trim().toLowerCase();
    return of(
      EMPLOYMENT_DEPT_RECORDS.filter(
        r => r.sector.trim().toLowerCase() === sector || (r.permDistrict ?? '').trim().toLowerCase() === district
      )
    ).pipe(delay(700));
  }

  /**
   * Registers several aspirants in the batch in one go, straight from what the source knows about them (the form steps
   * are skipped). An aspirant is skipped when the batch is full or closed, or when the Aadhaar number is already in it.
   * With `replacesAspirantId` the registration takes the seat of that dropped student (allowed after the freeze too),
   * and only the first aspirant can take it.
   */
  registerMany(profiles: AspirantSourceProfile[], batchId: string, replacesAspirantId?: string): { registered: number; skipped: number } {
    let registered = 0;
    let skipped = 0;
    for (const profile of profiles) {
      const batch = this.batches.getBatchById(batchId);
      const duplicate = this.aspirants
        .aspirants()
        .some(a => a.batchId === batchId && a.trainingStatus !== 'DROPOUT' && a.aadhaarNo === profile.aadhaarNo);
      const replacement = !!replacesAspirantId;
      const taken = replacement && registered > 0;
      if (!batch || duplicate || taken || !(replacement ? canRegisterReplacement(batch) : canRegisterAspirants(batch))) {
        skipped++;
        continue;
      }
      const form = this.toFormData(profile, batch.sector ? [batch.sector] : []);
      const mapped = this.batches.mapCandidateToBatch(
        batchId,
        {
          name: form.aspirantName,
          aadhaarMasked: `XXXX-XXXX-${form.aadhaarNo.slice(-4)}`,
          mobile: form.mobileNo
        },
        { replacement }
      );
      if (!mapped) {
        skipped++;
        continue;
      }
      this.aspirants.addAspirant(form, this.batches.getBatchById(batchId) ?? batch, this.sdcs.getSdcById(batch.sdcId), replacesAspirantId);
      registered++;
    }
    return { registered, skipped };
  }

  /** The registration form filled with what the source knows; the rest stays empty for the partner to complete. */
  toFormData(source: AspirantSourceProfile, preferredSectors: string[]): AspirantFormData {
    const blank = createEmptyAspirantFormData();
    return {
      ...blank,
      aadhaarNo: source.aadhaarNo,
      confirmAadhaarNo: source.aadhaarNo,
      aspirantName: source.aspirantName,
      gender: source.gender,
      relationType: source.relationType,
      relationName: source.relationName,
      dob: source.dob,
      age: calculateAgeFromDob(source.dob),
      educationalQualification: source.educationalQualification,
      religion: source.religion,
      category: source.category,
      areaType: source.areaType,
      mobileNo: source.mobileNo,
      email: source.email,
      permCity: source.permCity,
      permDistrict: source.permDistrict,
      permPincode: source.permPincode,
      preferredSectors: [...preferredSectors]
    };
  }
}
