import { Injectable, inject } from '@angular/core';
import { createPersistedStore } from '../../../core/services/persisted-store';
import { EoiStateService } from '../../eoi/services/eoi-state.service';
import type { IpaCourseRow } from '../../eoi/services/eoi-state.models';
import type { AllocationStatus, IpaAllocation, IpaAllocationCourse, ResolvedIpa } from '../models/ipa-allocation.model';
import { TP_IPAS } from '../../../core/mock/data/tp-ipas.mock';
import { BatchService } from './batch.service';
import { SdcService } from './sdc.service';

const sameText = (a: string | undefined, b: string | undefined): boolean =>
  (a ?? '').trim().toLowerCase() === (b ?? '').trim().toLowerCase();

const splitList = (text: string | undefined): string[] =>
  (text ?? '').split(',').map(part => part.trim()).filter(Boolean);

const unique = (list: string[]): string[] => list.filter((item, i) => list.findIndex(x => sameText(x, item)) === i);

/** The IPA course row as an allocation line: the batches, trainees and cost are the ones the IPA sets. */
export function toAllocationCourse(row: IpaCourseRow): IpaAllocationCourse {
  return {
    courseRowId: row.id,
    courseName: row.courseName,
    courseCode: row.courseCode,
    sector: row.sector,
    district: row.district ?? '',
    cycles: Number(row.cycles) || 0,
    approvedTrainees: row.approvedTrainees,
    costPerBatch: row.costPerBatch,
    durationHours: row.durationHours
  };
}

/**
 * Ties each IPA to the new SDCs registered for it. The IPA fixes everything: its districts, the courses and
 * batches of each district and sector, and the trainees per batch. One new SDC is registered for each district
 * and sector pair of the IPA (the building may be the same as an earlier SDC, but it is a new SDC for the new
 * IPA), and the department approves it like any SDC.
 */
@Injectable({ providedIn: 'root' })
export class IpaAllocationService {
  private readonly eoi = inject(EoiStateService);
  private readonly sdcService = inject(SdcService);
  private readonly batchService = inject(BatchService);

  private readonly store = createPersistedStore<IpaAllocation>({ key: 'isms_ipa_allocations', seed: [] });

  readonly allocations = this.store.items.asReadonly();

  // ---- IPA identity and allowance ---------------------------------------------------------------

  /** An IPA letter has a free-text number that is not unique, so it is identified by scheme, company and issue order. */
  makeIpaId(schemeId: string, appId: string, issueIndex: number): string {
    return `${schemeId}__${appId}__${issueIndex}`;
  }

  /** The issued IPA with its allowance, or null when it does not exist. */
  resolveIpa(ipaId: string): ResolvedIpa | null {
    // Dummy IPAs of the training partner (not linked to the released sanction orders yet).
    const dummy = TP_IPAS.find(ipa => ipa.ipaId === ipaId);
    if (dummy) {
      return {
        ipaId: dummy.ipaId,
        ipaNumber: dummy.ipaNumber,
        schemeId: dummy.schemeId,
        appId: '',
        tpName: dummy.tpName,
        districts: unique(dummy.courses.map(c => c.district ?? '')),
        sectors: unique(dummy.courses.map(c => c.sector)),
        courses: dummy.courses
      };
    }

    const [schemeId, appId, indexText] = (ipaId ?? '').split('__');
    const index = Number(indexText);
    if (!schemeId || !appId || !Number.isInteger(index)) return null;

    const document = this.eoi.getIssuedIpas(schemeId, appId)[index];
    if (!document) return null;

    const sanctionRows = (this.eoi.getSchemeSanctionOrder(schemeId)?.tableRows ?? []).filter(r => r.appId === appId);
    const sanctionDistricts = unique(sanctionRows.flatMap(r => splitList(r.district)));

    // Rows of an older IPA have no district: they are allowed in the sanctioned district(s).
    const courses = document.courseRows.map(row => ({ ...row, district: row.district?.trim() || sanctionDistricts[0] || '' }));
    const districts = unique([...courses.map(c => c.district ?? ''), ...(courses.length ? [] : sanctionDistricts)].filter(Boolean));
    const sectors = unique([
      ...courses.map(c => c.sector),
      ...(courses.length ? [] : sanctionRows.flatMap(r => splitList(r.sector)))
    ].filter(Boolean));

    return {
      ipaId,
      ipaNumber: document.fileNo,
      schemeId,
      appId,
      tpName: sanctionRows[0]?.agencyName ?? document.piaName ?? '',
      districts,
      sectors,
      courses
    };
  }

  /** Course rows of the IPA for one district (and, when given, one sector of it). */
  coursesFor(ipa: ResolvedIpa, district: string, sector?: string): IpaCourseRow[] {
    return ipa.courses.filter(c => sameText(c.district, district) && (!sector || sameText(c.sector, sector)));
  }

  /** Training target of the IPA (or of one district / sector of it): batches x trainees per batch of its course rows. */
  ipaTarget(ipa: ResolvedIpa, district?: string, sector?: string): number {
    const rows = district ? this.coursesFor(ipa, district, sector) : ipa.courses;
    return rows.reduce((sum, c) => sum + (Number(c.cycles) || 0) * (Number(c.approvedTrainees) || 0), 0);
  }

  /** Every district and sector pair of the IPA: each needs its own new SDC. */
  slots(ipa: ResolvedIpa): { district: string; sector: string }[] {
    const pairs = ipa.courses.map(c => ({ district: c.district ?? '', sector: c.sector }));
    return pairs.filter((p, i) => pairs.findIndex(x => sameText(x.district, p.district) && sameText(x.sector, p.sector)) === i);
  }

  targetOf(allocation: Pick<IpaAllocation, 'courses'>): number {
    return allocation.courses.reduce((sum, c) => sum + c.cycles * c.approvedTrainees, 0);
  }

  // ---- Status -------------------------------------------------------------------------------------

  /** The allocation follows its SDC: approved, rejected or returned with it. */
  statusOf(allocation: IpaAllocation): AllocationStatus {
    switch (this.sdcService.getSdcById(allocation.sdcId)?.status) {
      case 'APPROVED':
        return 'APPROVED';
      case 'REJECTED':
        return 'REJECTED';
      case 'RETURNED_TO_TP':
        return 'RETURNED';
      default:
        return 'PENDING';
    }
  }

  /** A pending or approved SDC holds its district and sector; a rejected or returned one gives them back. */
  private holdsSlot(allocation: IpaAllocation): boolean {
    const status = this.statusOf(allocation);
    return status === 'PENDING' || status === 'APPROVED';
  }

  // ---- Queries ------------------------------------------------------------------------------------

  forIpa(ipaId: string): IpaAllocation[] {
    return this.allocations().filter(a => a.ipaId === ipaId);
  }

  forSdc(sdcId: string): IpaAllocation[] {
    return this.allocations().filter(a => a.sdcId === sdcId);
  }

  getById(id: string): IpaAllocation | undefined {
    return this.allocations().find(a => a.id === id);
  }

  /** District and sector pairs of the IPA that still need their new SDC. */
  openSlots(ipa: ResolvedIpa): { district: string; sector: string }[] {
    const taken = this.forIpa(ipa.ipaId).filter(a => this.holdsSlot(a));
    return this.slots(ipa).filter(
      slot => !taken.some(a => sameText(a.district, slot.district) && a.sectors.some(s => sameText(s, slot.sector)))
    );
  }

  /** Districts that still have a sector without its SDC. */
  openDistricts(ipa: ResolvedIpa): string[] {
    return unique(this.openSlots(ipa).map(s => s.district));
  }

  /** Sectors of one district that still need their SDC. */
  openSectors(ipa: ResolvedIpa, district: string): string[] {
    return this.openSlots(ipa).filter(s => sameText(s.district, district)).map(s => s.sector);
  }

  /** SDCs registered for the IPA out of the SDCs it allows (one per district and sector). */
  sdcCount(ipa: ResolvedIpa): { registered: number; allowed: number } {
    const allowed = this.slots(ipa).length;
    return { registered: allowed - this.openSlots(ipa).length, allowed };
  }

  /** Allocations of the SDC that the department has approved. */
  approvedForSdc(sdcId: string): IpaAllocation[] {
    return this.forSdc(sdcId).filter(a => this.statusOf(a) === 'APPROVED');
  }

  /** Batches made against a course of an allocation (rejected and cancelled batches give the batch back). */
  usedCycles(allocationId: string, courseRowId: string): number {
    return this.batchService
      .batches()
      .filter(
        b =>
          b.ipaAllocationId === allocationId &&
          b.ipaCourseRowId === courseRowId &&
          b.status !== 'REJECTED' &&
          b.status !== 'CANCELLED'
      ).length;
  }

  // ---- Changes ------------------------------------------------------------------------------------

  /** Records the new SDC of one district and sector of the IPA, with all the courses and batches the IPA sets for it. */
  create(draft: { ipa: ResolvedIpa; scheme: string; sdcId: string; sdcName: string; district: string; sector: string }): IpaAllocation {
    const courses = this.coursesFor(draft.ipa, draft.district, draft.sector).map(toAllocationCourse).filter(c => c.cycles > 0);
    const allocation: IpaAllocation = {
      id: `alloc-${Date.now()}`,
      ipaId: draft.ipa.ipaId,
      ipaNumber: draft.ipa.ipaNumber,
      schemeId: draft.ipa.schemeId,
      appId: draft.ipa.appId,
      tpName: draft.ipa.tpName,
      scheme: draft.scheme,
      sdcId: draft.sdcId,
      sdcName: draft.sdcName,
      district: draft.district,
      sectors: unique(courses.map(c => c.sector)),
      courses,
      createdAt: new Date().toISOString()
    };
    this.store.items.update(list => {
      const updated = [allocation, ...list];
      this.store.persist(updated);
      return updated;
    });
    return allocation;
  }
}
