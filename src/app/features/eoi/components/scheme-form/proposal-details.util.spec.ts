import { describe, expect, it } from 'vitest';
import { ApiError } from '../../../../core/http/api-error';
import {
  ProposalForm,
  amountText,
  completedFinancialYears,
  emptyProposal,
  fyStartYear,
  isFinancialYear,
  normalizeProposalPath,
  proposalErrorsFrom,
  proposalForm,
  toProposalRequest,
  upcomingFinancialYears,
  validateProposal,
  withoutListErrors
} from './proposal-details.util';

const TODAY = new Date(2026, 4, 10); // 10 May 2026

function filled(): ProposalForm {
  const f = emptyProposal(TODAY);
  f.organisation = {
    businessActivity: 'Training & Skill Development',
    registeringAuthority: ' Registrar of Companies ',
    placeOfRegistration: 'Jaipur',
    isBlacklisted: false,
    blacklistDetails: null
  };
  f.financials = f.financials.map(r => ({ ...r, totalTurnover: 92100536, skillTurnover: 92100536 }));
  f.trainingCentres = [{
    district: 'District 1', centreName: 'Centre 1', telephone: '0144000000', classrooms: 2, practicalRooms: 2,
    separateWashrooms: true, labAvailable: true, address: 'Address 1'
  }];
  f.trainingPlacements = [{ sector: 'Healthcare', financialYear: '2022-23', trained: 570, placed: 476, proofCount: 476 }];
  f.actionPlan = [{
    year: '2026-27', district: 'District 1', sdcCount: 2, sdcLocation: 'Location 1', sectors: 'Healthcare',
    courses: 'General Duty Assistant', residentialType: 'Both', batches: 10
  }];
  return f;
}

describe('financial years', () => {
  it('uses the Indian April-March year', () => {
    expect(fyStartYear(new Date(2026, 3, 1))).toBe(2026);
    expect(fyStartYear(new Date(2026, 2, 31))).toBe(2025);
  });

  it('lists the last three completed years and the upcoming ones', () => {
    expect(completedFinancialYears(3, TODAY)).toEqual(['2023-24', '2024-25', '2025-26']);
    expect(upcomingFinancialYears(2, TODAY)).toEqual(['2026-27', '2027-28', '2028-29']);
    expect(completedFinancialYears(1, new Date(2000, 0, 1))).toEqual(['1998-99']);
  });

  it('checks the format', () => {
    expect(isFinancialYear('2023-24')).toBe(true);
    expect(isFinancialYear('1999-00')).toBe(true);
    expect(isFinancialYear('2023-25')).toBe(false);
    expect(isFinancialYear('2023/24')).toBe(false);
  });
});

describe('defaults', () => {
  it('starts with the OTR person, three financial years and one row per list', () => {
    const f = emptyProposal(TODAY);
    expect(f.projectAuthorizedPerson.sameAsOrganisation).toBe(true);
    expect(f.financials.map(r => r.financialYear)).toEqual(['2023-24', '2024-25', '2025-26']);
    expect(f.trainingCentres.length).toBe(1);
    expect(f.trainingPlacements.length).toBe(1);
    expect(f.actionPlan.length).toBe(1);
  });

  it('keeps saved values and fills the financial years that are missing', () => {
    const f = proposalForm({ financials: [{ financialYear: '2024-25', totalTurnover: 5, skillTurnover: 1 }], trainingCentres: [] }, TODAY);
    expect(f.financials.map(r => r.financialYear)).toEqual(['2023-24', '2024-25', '2025-26']);
    expect(f.financials[1].totalTurnover).toBe(5);
    expect(f.trainingCentres.length).toBe(1);
    expect(f.projectAuthorizedPerson.sameAsOrganisation).toBe(true);
  });
});

describe('validateProposal', () => {
  it('accepts a complete proposal', () => {
    expect(validateProposal(filled(), true)).toEqual({});
  });

  it('a draft needs no required fields but still checks formats', () => {
    const f = emptyProposal(TODAY);
    expect(validateProposal(f, false)).toEqual({});
    f.trainingCentres[0].telephone = '12ab';
    expect(Object.keys(validateProposal(f, false))).toEqual(['trainingCentres[0].telephone']);
  });

  it('names every missing field with the backend path on complete', () => {
    const errors = validateProposal(emptyProposal(TODAY), true);
    expect(errors['organisation.businessActivity']).toBeTruthy();
    expect(errors['organisation.isBlacklisted']).toBeTruthy();
    expect(errors['financials[2].totalTurnover']).toBeTruthy();
    expect(errors['trainingCentres[0].district']).toBeTruthy();
    expect(errors['trainingPlacements[0].trained']).toBeTruthy();
    expect(errors['actionPlan[0].residentialType']).toBeTruthy();
    expect(errors['projectAuthorizedPerson.name']).toBeUndefined();
  });

  it('needs blacklisting details only when blacklisted', () => {
    const f = filled();
    f.organisation.isBlacklisted = true;
    expect(Object.keys(validateProposal(f, true))).toEqual(['organisation.blacklistDetails']);
  });

  it('checks the project person only when not the same as the OTR one', () => {
    const f = filled();
    f.projectAuthorizedPerson = { ...f.projectAuthorizedPerson, sameAsOrganisation: false, mobile: '5123456789', email: 'x@', idProofType: 'Ration Card' };
    const errors = validateProposal(f, true);
    expect(errors['projectAuthorizedPerson.name']).toBeTruthy();
    expect(errors['projectAuthorizedPerson.mobile']).toContain('10-digit');
    expect(errors['projectAuthorizedPerson.email']).toBeTruthy();
    expect(errors['projectAuthorizedPerson.idProofType']).toBeTruthy();
  });

  it('checks the relations between numbers', () => {
    const f = filled();
    f.financials[1].skillTurnover = 100000000;
    f.trainingPlacements[0].placed = 600;
    f.actionPlan[0].sdcCount = 0;
    const errors = validateProposal(f, false);
    expect(errors['financials[1].skillTurnover']).toContain('total turnover');
    expect(errors['trainingPlacements[0].placed']).toContain('number trained');
    expect(errors['actionPlan[0].sdcCount']).toBeTruthy();
  });

  it('checks the rows: three distinct financial years, at least one row per list', () => {
    const f = filled();
    f.financials[2].financialYear = f.financials[1].financialYear;
    f.trainingCentres = [];
    f.trainingPlacements[0].trained = 1.5;
    const errors = validateProposal(f, true);
    expect(errors['financials']).toContain('only once');
    expect(errors['trainingCentres']).toBeTruthy();
    expect(errors['trainingPlacements[0].trained']).toContain('whole number');
  });
});

describe('toProposalRequest', () => {
  it('trims text, keeps numbers as numbers and empties to null', () => {
    const f = filled();
    f.trainingCentres[0].telephone = '  ';
    (f.financials[0] as { totalTurnover: unknown }).totalTurnover = '1,000.50';
    const body = toProposalRequest(f);
    expect(body.organisation?.registeringAuthority).toBe('Registrar of Companies');
    expect(body.trainingCentres?.[0].telephone).toBeNull();
    expect(body.financials?.[0].totalTurnover).toBe(1000.5);
    expect(body.organisation?.blacklistDetails).toBeNull();
  });

  it('drops the person fields when same as the OTR person', () => {
    const f = filled();
    f.projectAuthorizedPerson.name = 'Person 1';
    expect(toProposalRequest(f).projectAuthorizedPerson).toEqual({
      sameAsOrganisation: true, name: null, designation: null, mobile: null, email: null, idProofType: null, idNumber: null, residenceAddress: null
    });
    f.projectAuthorizedPerson.sameAsOrganisation = false;
    expect(toProposalRequest(f).projectAuthorizedPerson?.name).toBe('Person 1');
  });
});

describe('backend errors', () => {
  it('normalises the field paths', () => {
    expect(normalizeProposalPath('Financials[1].SkillTurnover')).toBe('financials[1].skillTurnover');
    expect(normalizeProposalPath('body.organisation.registeringAuthority')).toBe('organisation.registeringAuthority');
  });

  it('maps 400 field errors onto the form', () => {
    const error = new ApiError(400, 'Invalid', 'VALIDATION', [], undefined, undefined, [
      { field: 'financials[1].skillTurnover', message: 'Too high', code: 'INVALID' },
      { field: 'trainingCentres', message: 'Add a centre', code: 'REQUIRED' },
      { field: 'proposalDetails', message: 'Complete the EOI Form', code: 'REQUIRED' },
      { field: 'answers.q1', message: 'Other step', code: 'REQUIRED' }
    ]);
    expect(proposalErrorsFrom(error)).toEqual({
      'financials[1].skillTurnover': 'Too high',
      trainingCentres: 'Add a centre',
      _form: 'Complete the EOI Form'
    });
    expect(proposalErrorsFrom(new Error('x'))).toEqual({});
  });

  it('drops the errors of one list', () => {
    expect(withoutListErrors({ actionPlan: 'a', 'actionPlan[0].year': 'b', 'financials[0].totalTurnover': 'c' }, 'actionPlan'))
      .toEqual({ 'financials[0].totalTurnover': 'c' });
  });
});

describe('display', () => {
  it('formats amounts with Indian grouping', () => {
    expect(amountText(92100536)).toBe('\u20B99,21,00,536');
    expect(amountText(null)).toBe('-');
  });
});
