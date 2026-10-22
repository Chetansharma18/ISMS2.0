import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { OtrValidationService } from './otr-validation.service';
import { Step1OrgDetails, createInitialOtrFormData } from '../models/otr-form.model';

describe('OtrValidationService - Step 1 Sub-sections', () => {
  let service: OtrValidationService;
  let validStep1: Step1OrgDetails;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OtrValidationService]
    });
    service = TestBed.inject(OtrValidationService);

    validStep1 = {
      shortName: 'ABC',
      fullName: 'Acme Skill Solutions Ltd',
      natureOfEntity: 'Private Limited Company',
      registrationNumber: 'U74999RJ2020PTC068123',
      dateOfRegistration: '2020-05-15',
      stateOfLegalReg: 'Rajasthan',
      registrationCertDoc: {
        fileName: 'reg_cert.pdf',
        fileSize: '1.2 MB',
        uploadDate: '2026-01-01',
        status: 'uploaded'
      },
      companyPan: 'AABCA1234F',
      panCardDoc: {
        fileName: 'pan.pdf',
        fileSize: '0.8 MB',
        uploadDate: '2026-01-01',
        status: 'uploaded'
      },
      gstRegistered: 'Yes',
      gstin: '08AABCA1234F1Z5',
      gstCertDoc: {
        fileName: 'gst.pdf',
        fileSize: '1.0 MB',
        uploadDate: '2026-01-01',
        status: 'uploaded'
      },
      msmeRegistered: 'Yes',
      udyamNumber: 'UDYAM-RJ-14-0012345',
      msmeCertDoc: {
        fileName: 'udyam.pdf',
        fileSize: '0.9 MB',
        uploadDate: '2026-01-01',
        status: 'uploaded'
      },
      turnOver: '250.00',
      financialYears: [
        { year: '2025-26', totalTurnover: '100.00', skillTurnover: '50.00' }
      ],
      turnoverCertDoc: null,
      blackListed: 'No',
      nsdcPartner: 'Non-Funded Partner',
      preferredSector: 'Electronics',
      contactNo: '9876543210',
      emailId: 'admin@acmeskills.in',
      website: 'https://acmeskills.in',
      registeredAddress: 'Plot 10, Industrial Area',
      registeredState: 'Rajasthan',
      registeredDistrict: 'Jaipur',
      registeredPincode: '302001',
      sameAsRegistered: true,
      officeAddress: 'Plot 10, Industrial Area',
      officeState: 'Rajasthan',
      officeDistrict: 'Jaipur',
      officePincode: '302001'
    };
  });

  describe('Sub-step 1: Basic Organisation Details', () => {
    it('passes when all mandatory basic details are present', () => {
      const errors = service.validateStep1SubStep1(validStep1);
      expect(errors).toEqual([]);
    });

    it('requires organisation name, nature of entity, and preferred sector', () => {
      const step1: Step1OrgDetails = {
        ...validStep1,
        fullName: '',
        natureOfEntity: '',
        preferredSector: ''
      };
      const errors = service.validateStep1SubStep1(step1);
      expect(errors.some(e => e.includes('Organization Name'))).toBe(true);
      expect(errors.some(e => e.includes('Nature of Entity'))).toBe(true);
      expect(errors.some(e => e.includes('Preferred Sector'))).toBe(true);
    });

    it('validates conditional GST details when Yes', () => {
      const invalidGst: Step1OrgDetails = {
        ...validStep1,
        gstRegistered: 'Yes',
        gstin: 'INVALID_GST',
        gstCertDoc: null
      };
      const errors = service.validateStep1SubStep1(invalidGst);
      expect(errors.some(e => e.includes('GSTIN'))).toBe(true);
      expect(errors.some(e => e.includes('GST Registration Certificate'))).toBe(true);
    });

    it('does not require GSTIN or certificate when GST Registered is No', () => {
      const noGst: Step1OrgDetails = {
        ...validStep1,
        gstRegistered: 'No',
        gstin: '',
        gstCertDoc: null
      };
      const errors = service.validateStep1SubStep1(noGst);
      expect(errors).toEqual([]);
    });

    it('validates conditional MSME/Udyam details when Yes', () => {
      const invalidMsme: Step1OrgDetails = {
        ...validStep1,
        msmeRegistered: 'Yes',
        udyamNumber: 'INVALID_UDYAM',
        msmeCertDoc: null
      };
      const errors = service.validateStep1SubStep1(invalidMsme);
      expect(errors.some(e => e.includes('Udyam'))).toBe(true);
      expect(errors.some(e => e.includes('MSME / Udyam Certificate'))).toBe(true);
    });

    it('does not require Udyam or certificate when MSME Registered is No', () => {
      const noMsme: Step1OrgDetails = {
        ...validStep1,
        msmeRegistered: 'No',
        udyamNumber: '',
        msmeCertDoc: null
      };
      const errors = service.validateStep1SubStep1(noMsme);
      expect(errors).toEqual([]);
    });
  });

  describe('Sub-step 2: Registration & Documents', () => {
    it('passes when registration and document details are valid', () => {
      const errors = service.validateStep1SubStep2(validStep1);
      expect(errors).toEqual([]);
    });

    it('fails when registration number, date, or state are missing', () => {
      const invalid: Step1OrgDetails = {
        ...validStep1,
        registrationNumber: '',
        dateOfRegistration: '',
        stateOfLegalReg: ''
      };
      const errors = service.validateStep1SubStep2(invalid);
      expect(errors.some(e => e.includes('Registration / CIN Number'))).toBe(true);
      expect(errors.some(e => e.includes('Date of Registration'))).toBe(true);
      expect(errors.some(e => e.includes('State/UT of Legal Registration'))).toBe(true);
    });

    it('validates PAN format and required documents', () => {
      const invalid: Step1OrgDetails = {
        ...validStep1,
        companyPan: 'BADPAN123',
        registrationCertDoc: null,
        panCardDoc: null
      };
      const errors = service.validateStep1SubStep2(invalid);
      expect(errors.some(e => e.includes('Company PAN'))).toBe(true);
      expect(errors.some(e => e.includes('Certificate of Registration Document'))).toBe(true);
      expect(errors.some(e => e.includes('Organization PAN Card Document'))).toBe(true);
    });
  });

  describe('Sub-step 3: Contact Information', () => {
    it('passes when 10-digit mobile and valid email are provided', () => {
      const errors = service.validateStep1SubStep3(validStep1);
      expect(errors).toEqual([]);
    });

    it('requires a 10-digit contact mobile number', () => {
      const invalid: Step1OrgDetails = {
        ...validStep1,
        contactNo: '12345'
      };
      const errors = service.validateStep1SubStep3(invalid);
      expect(errors.some(e => e.includes('Contact Number'))).toBe(true);
    });

    it('requires a valid email address', () => {
      const invalid: Step1OrgDetails = {
        ...validStep1,
        emailId: 'not-an-email'
      };
      const errors = service.validateStep1SubStep3(invalid);
      expect(errors.some(e => e.includes('Email'))).toBe(true);
    });

    it('validates website format when entered, but accepts empty website', () => {
      const emptyWebsite: Step1OrgDetails = {
        ...validStep1,
        website: ''
      };
      expect(service.validateStep1SubStep3(emptyWebsite)).toEqual([]);

      const invalidWebsite: Step1OrgDetails = {
        ...validStep1,
        website: 'htp://bad url'
      };
      const errors = service.validateStep1SubStep3(invalidWebsite);
      expect(errors.some(e => e.includes('Website'))).toBe(true);
    });
  });

  describe('Sub-step 4: Registered & Office Address', () => {
    it('passes when registered address is complete and sameAsRegistered is true', () => {
      const errors = service.validateStep1SubStep4(validStep1);
      expect(errors).toEqual([]);
    });

    it('requires address, state, district, and 6-digit pin for registered address', () => {
      const invalid: Step1OrgDetails = {
        ...validStep1,
        registeredAddress: '',
        registeredState: '',
        registeredDistrict: '',
        registeredPincode: '123'
      };
      const errors = service.validateStep1SubStep4(invalid);
      expect(errors.some(e => e.includes('Registered Premise Address'))).toBe(true);
      expect(errors.some(e => e.includes('Registered State'))).toBe(true);
      expect(errors.some(e => e.includes('Registered District'))).toBe(true);
      expect(errors.some(e => e.includes('Registered PIN Code'))).toBe(true);
    });

    it('validates office address when sameAsRegistered is false', () => {
      const diffAddressInvalid: Step1OrgDetails = {
        ...validStep1,
        sameAsRegistered: false,
        officeAddress: '',
        officeState: '',
        officeDistrict: '',
        officePincode: ''
      };
      const errors = service.validateStep1SubStep4(diffAddressInvalid);
      expect(errors.some(e => e.includes('Operational Office Address'))).toBe(true);
      expect(errors.some(e => e.includes('Operational Office State'))).toBe(true);
      expect(errors.some(e => e.includes('Operational Office District'))).toBe(true);
      expect(errors.some(e => e.includes('Operational Office PIN Code'))).toBe(true);
    });
  });

  describe('Sub-step routing and combined step validation', () => {
    it('delegates validateStep1SubStep to the corresponding sub-section', () => {
      expect(service.validateStep1SubStep(1, validStep1)).toEqual([]);
      expect(service.validateStep1SubStep(2, validStep1)).toEqual([]);
      expect(service.validateStep1SubStep(3, validStep1)).toEqual([]);
      expect(service.validateStep1SubStep(4, validStep1)).toEqual([]);
    });

    it('returns combined errors in validateStep1', () => {
      const initial = createInitialOtrFormData().step1;
      const allErrors = service.validateStep1(initial);
      expect(allErrors.length).toBeGreaterThan(0);
      expect(allErrors.some(e => e.includes('Organization Name'))).toBe(true);
      expect(allErrors.some(e => e.includes('Registration / CIN Number'))).toBe(true);
      expect(allErrors.some(e => e.includes('Contact Number'))).toBe(true);
      expect(allErrors.some(e => e.includes('Registered Premise Address'))).toBe(true);
    });
  });

  describe('Step 3: Authorized Signatory Validation (Step 2 in Wizard)', () => {
    let validStep3: any;

    beforeEach(() => {
      validStep3 = {
        firstName: 'Vikram',
        lastName: 'Singh Mehta',
        name: 'Vikram Singh Mehta',
        designation: 'Authorized Representative',
        identityDocType: 'Aadhaar Card',
        identityDocNumber: '765432109876',
        aadhaarNo: '765432109876',
        pan: '',
        emailId: 'vikram.mehta@skilltech.org',
        mobileNo: '9829154321',
        bhamashahNo: '',
        voterIdNo: '',
        passportNo: '',
        state: 'Rajasthan',
        residenceAddress: 'B-14, Malviya Nagar, Jaipur, Rajasthan - 302017',
        authorizationLetterDoc: {
          fileName: 'Board_Resolution.pdf',
          fileSize: '1.2 MB',
          uploadDate: '2026-01-01',
          status: 'uploaded'
        },
        idProofDoc: {
          fileName: 'Aadhaar_Doc.pdf',
          fileSize: '1.0 MB',
          uploadDate: '2026-01-01',
          status: 'uploaded'
        }
      };
    });

    it('passes when all required personal, contact, identity, and authorization fields are valid', () => {
      const errors = service.validateStep3(validStep3);
      expect(errors).toEqual([]);
    });

    it('does not require or check Date of Birth and Age', () => {
      const noDobAge = { ...validStep3, dob: undefined, age: undefined };
      const errors = service.validateStep3(noDobAge);
      expect(errors).toEqual([]);
      expect(errors.some(e => e.toLowerCase().includes('birth'))).toBe(false);
      expect(errors.some(e => e.toLowerCase().includes('age'))).toBe(false);
    });

    it('requires First Name, Mobile Number, and Email Address', () => {
      const invalid = {
        ...validStep3,
        firstName: '',
        name: '',
        mobileNo: '123',
        emailId: 'bad-email'
      };
      const errors = service.validateStep3(invalid);
      expect(errors.some(e => e.includes('First Name'))).toBe(true);
      expect(errors.some(e => e.includes('Mobile Number'))).toBe(true);
      expect(errors.some(e => e.includes('Email Address'))).toBe(true);
    });

    it('validates dynamic document number based on selected document type', () => {
      // Invalid Aadhaar (needs 12 digits)
      const badAadhaar = { ...validStep3, identityDocType: 'Aadhaar Card', identityDocNumber: '12345' };
      expect(service.validateStep3(badAadhaar).some(e => e.includes('12 numeric digits'))).toBe(true);

      // Invalid PAN (needs 10 chars statutory)
      const badPan = { ...validStep3, identityDocType: 'PAN Card', identityDocNumber: 'INVALID' };
      expect(service.validateStep3(badPan).some(e => e.includes('Personal PAN'))).toBe(true);

      // Valid PAN
      const goodPan = { ...validStep3, identityDocType: 'PAN Card', identityDocNumber: 'ABCDE1234F', pan: 'ABCDE1234F' };
      expect(service.validateStep3(goodPan)).toEqual([]);
    });

    it('requires identity document upload and authorization letter upload', () => {
      const missingUploads = {
        ...validStep3,
        idProofDoc: null,
        authorizationLetterDoc: null
      };
      const errors = service.validateStep3(missingUploads);
      expect(errors.some(e => e.includes('Identity Document upload'))).toBe(true);
      expect(errors.some(e => e.includes('Authorization Letter'))).toBe(true);
    });
  });
});

