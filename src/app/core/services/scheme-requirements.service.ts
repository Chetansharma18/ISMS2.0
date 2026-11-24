import { Injectable, inject, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { DataEngineService } from './data-engine.service';
import {
  SchemeRequirementMapping,
  SchemeCustomField,
  EoiRequirementSnapshot,
  MappedSchemeDetail,
  RequirementType
} from '../models/scheme-requirements.model';
import {
  DocMasterItem,
  AnnexureMasterItem,
  SchemeMasterItem
} from '../models/admin-masters.model';
import {
  MOCK_DOC_MASTER_ITEMS,
  MOCK_ANNEXURE_MASTER_ITEMS,
  MOCK_SCHEME_MASTER_ITEMS
} from '../mock/data/admin-masters.mock';
import { MOCK_SCHEMES } from '../mock/data/schemes.mock';

const STORAGE_KEY_REQUIREMENTS = 'ISMS_SCHEME_REQUIREMENT_MAPPINGS';
const STORAGE_KEY_CUSTOM_FIELDS = 'ISMS_SCHEME_CUSTOM_FIELDS';
const STORAGE_KEY_SNAPSHOTS = 'ISMS_EOI_REQUIREMENT_SNAPSHOTS';

@Injectable({
  providedIn: 'root'
})
export class SchemeRequirementsService {
  private storage = inject(StorageService);
  private dataEngine = inject(DataEngineService);

  readonly mappings = signal<SchemeRequirementMapping[]>([]);
  readonly customFields = signal<SchemeCustomField[]>([]);
  readonly snapshots = signal<EoiRequirementSnapshot[]>([]);

  constructor() {
    this.initializeStore();
  }

  private initializeStore(): void {
    // 1. Load or seed normalized requirements mappings
    const savedMappings = this.storage.getItem<SchemeRequirementMapping[]>(STORAGE_KEY_REQUIREMENTS);
    if (savedMappings && savedMappings.length > 0) {
      this.mappings.set(savedMappings);
    } else {
      const seeded = this.seedInitialMappings();
      this.mappings.set(seeded);
      this.storage.setItem(STORAGE_KEY_REQUIREMENTS, seeded);
    }

    // 2. Load or seed scheme-specific custom dynamic fields
    const savedFields = this.storage.getItem<SchemeCustomField[]>(STORAGE_KEY_CUSTOM_FIELDS);
    if (savedFields && savedFields.length > 0) {
      this.customFields.set(savedFields);
    } else {
      const seededFields = this.seedInitialCustomFields();
      this.customFields.set(seededFields);
      this.storage.setItem(STORAGE_KEY_CUSTOM_FIELDS, seededFields);
    }

    // 3. Load snapshots
    const savedSnapshots = this.storage.getItem<EoiRequirementSnapshot[]>(STORAGE_KEY_SNAPSHOTS);
    if (savedSnapshots && savedSnapshots.length > 0) {
      this.snapshots.set(savedSnapshots);
    }
  }

  /**
   * Automatically normalizes legacy MOCK_DOC_MASTER_ITEMS and MOCK_ANNEXURE_MASTER_ITEMS
   * into relational SchemeRequirementMapping rows with immutable scheme references.
   */
  private seedInitialMappings(): SchemeRequirementMapping[] {
    const list: SchemeRequirementMapping[] = [];
    let nextId = 1;

    const schemeLookup = new Map<string, SchemeMasterItem>();
    for (const s of MOCK_SCHEME_MASTER_ITEMS) {
      schemeLookup.set(s.schemeName.trim().toLowerCase(), s);
    }

    // Document Master mappings
    for (const doc of MOCK_DOC_MASTER_ITEMS) {
      const schemes = doc.schemes || [];
      schemes.forEach((schName, idx) => {
        const foundScheme = schemeLookup.get(schName.trim().toLowerCase());
        const schemeId = foundScheme?.id || `sch-${idx + 1}`;
        list.push({
          id: `srm-${nextId++}`,
          schemeId,
          schemeName: schName.trim(),
          schemeCode: foundScheme?.categoryName || 'GENERAL',
          requirementType: 'DOCUMENT',
          masterItemId: doc.id,
          masterItemCode: `DOC-${doc.id.toUpperCase()}`,
          masterItemName: doc.docName || doc.documents || '',
          category: 'Compliance & Verification',
          isMandatory: true,
          applicantCategory: 'ALL',
          displayOrder: nextId,
          maxSizeMb: 25,
          acceptedFormats: ['PDF', 'JPEG', 'PNG', 'TXT'],
          status: 'Active',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      });
    }

    // Annexure Master mappings
    for (const annex of MOCK_ANNEXURE_MASTER_ITEMS) {
      const schemes = annex.schemes || [];
      schemes.forEach((schName, idx) => {
        const foundScheme = schemeLookup.get(schName.trim().toLowerCase());
        const schemeId = foundScheme?.id || `sch-${idx + 1}`;
        list.push({
          id: `srm-${nextId++}`,
          schemeId,
          schemeName: schName.trim(),
          schemeCode: foundScheme?.categoryName || 'GENERAL',
          requirementType: 'ANNEXURE',
          masterItemId: annex.id,
          masterItemCode: `ANNEX-${annex.id.toUpperCase()}`,
          masterItemName: annex.annexureName,
          category: 'Official Format',
          isMandatory: annex.annexureName.includes('Annexure-1') || annex.annexureName.includes('Annexure-6'),
          applicantCategory: 'ALL',
          displayOrder: nextId,
          templateFileName: `${annex.annexureName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Format.pdf`,
          templateVersion: '1.0',
          completionMethod: 'DOWNLOAD_UPLOAD',
          maxSizeMb: 25,
          acceptedFormats: ['PDF', 'DOCX'],
          status: 'Active',
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
      });
    }

    return list;
  }

  /**
   * Seeds realistic scheme-specific dynamic fields for demonstration and testing.
   */
  private seedInitialCustomFields(): SchemeCustomField[] {
    return [
      // Solar Rooftop Scheme (SOLAR-2026 / Rooftop Solar Skill Development Scheme)
      {
        id: 'scf-solar-1',
        schemeId: 'sch-solar',
        schemeCode: 'SOLAR-2026',
        schemeName: 'Rooftop Solar Skill Development Scheme (Surya Ghar Yojana)',
        fieldKey: 'targetTrainingCapacityKw',
        label: 'Proposed Annual Solar Training Capacity (Number of Candidates)',
        type: 'number',
        mandatory: true,
        placeholder: 'e.g. 250',
        hint: 'Annual target candidates for Rooftop Solar PV Installation',
        order: 1,
        status: 'Active',
        createdAt: Date.now()
      },
      {
        id: 'scf-solar-2',
        schemeId: 'sch-solar',
        schemeCode: 'SOLAR-2026',
        schemeName: 'Rooftop Solar Skill Development Scheme (Surya Ghar Yojana)',
        fieldKey: 'labSystemType',
        label: 'Dedicated Solar Demonstration Lab Available',
        type: 'dropdown',
        mandatory: true,
        options: ['Grid-Tied Rooftop System', 'Off-Grid Battery System', 'Hybrid Microgrid Facility', 'Simulation Software Only'],
        placeholder: 'Select Lab Facility Type',
        hint: 'Physical lab setup available at proposed centre',
        order: 2,
        status: 'Active',
        createdAt: Date.now()
      },
      {
        id: 'scf-solar-3',
        schemeId: 'sch-solar',
        schemeCode: 'SOLAR-2026',
        schemeName: 'Rooftop Solar Skill Development Scheme (Surya Ghar Yojana)',
        fieldKey: 'hasDiscomTieup',
        label: 'Existing Tie-up / MoU with State Discom / EPC Contractors',
        type: 'switch',
        mandatory: false,
        hint: 'Toggle yes if applicant possesses formal apprenticeship placement linkage',
        order: 3,
        status: 'Active',
        createdAt: Date.now()
      },

      // Mukhyamantri Yuva Swarojgar Yojana (MYSY-2026 / sch-2)
      {
        id: 'scf-mysy-1',
        schemeId: 'sch-2',
        schemeCode: 'MYSY-2026',
        schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)',
        fieldKey: 'proposedCentresCount',
        label: 'Number of Proposed Skill Development Centers',
        type: 'number',
        mandatory: true,
        placeholder: 'e.g. 5',
        hint: 'Total centers intended across Rajasthan districts',
        order: 1,
        status: 'Active',
        createdAt: Date.now()
      },
      {
        id: 'scf-mysy-2',
        schemeId: 'sch-2',
        schemeCode: 'MYSY-2026',
        schemeName: 'Mukhyamantri Yuva Swarojgar Yojana (2026)',
        fieldKey: 'primaryDistrictFocus',
        label: 'Primary Cluster / District of Operation',
        type: 'dropdown',
        mandatory: true,
        options: ['Jaipur', 'Jodhpur', 'Kota', 'Udaipur', 'Bikaner', 'Ajmer', 'Alwar', 'Bharatpur'],
        placeholder: 'Select Primary District',
        order: 2,
        status: 'Active',
        createdAt: Date.now()
      },

      // Vishwakarma Yuva Udyami Protsahan Yojana (sch-1)
      {
        id: 'scf-vyupy-1',
        schemeId: 'sch-1',
        schemeCode: 'VYUPY-2026',
        schemeName: 'Vishwakarma Yuva Udyami Protsahan Yojana',
        fieldKey: 'traditionalCraftSector',
        label: 'Traditional Artisan / Craft Focus Area',
        type: 'dropdown',
        mandatory: true,
        options: ['Carpentry & Woodwork', 'Pottery & Ceramics', 'Blacksmith & Metalcraft', 'Sculpting & Stone Carving', 'Handicrafts & Textiles'],
        placeholder: 'Select Craft Trade',
        order: 1,
        status: 'Active',
        createdAt: Date.now()
      }
    ];
  }

  // =========================================================================
  // SCHEME REQUIREMENTS QUERY & MUTATION
  // =========================================================================

  /**
   * Retrieves all documents, annexures, and custom dynamic fields mapped to a given scheme.
   */
  getRequirementsForScheme(schemeIdOrName: string): {
    documents: SchemeRequirementMapping[];
    annexures: SchemeRequirementMapping[];
    customFields: SchemeCustomField[];
  } {
    const key = (schemeIdOrName || '').trim().toLowerCase();
    const allMappings = this.mappings();

    const matches = allMappings.filter(
      m => m.status !== 'Inactive' && (
        m.schemeId.toLowerCase() === key ||
        m.schemeName.trim().toLowerCase() === key ||
        (m.schemeCode && m.schemeCode.toLowerCase() === key)
      )
    );

    const documents = matches
      .filter(m => m.requirementType === 'DOCUMENT')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const annexures = matches
      .filter(m => m.requirementType === 'ANNEXURE')
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const customFields = this.customFields()
      .filter(f => f.status !== 'Inactive' && (
        f.schemeId.toLowerCase() === key ||
        f.schemeName.trim().toLowerCase() === key ||
        (f.schemeCode && f.schemeCode.toLowerCase() === key)
      ))
      .sort((a, b) => a.order - b.order);

    return { documents, annexures, customFields };
  }

  /**
   * Retrieves scheme custom proposal fields for a given scheme name.
   */
  getCustomFieldsForScheme(schemeIdOrName: string): SchemeCustomField[] {
    return this.getRequirementsForScheme(schemeIdOrName).customFields;
  }

  /**
   * Retrieves all schemes currently associated with a given Master Item ID with complete scheme metadata.
   */
  getSchemesForMasterItem(masterItemId: string, type: RequirementType): MappedSchemeDetail[] {
    const schemeLookup = new Map<string, any>();
    for (const s of MOCK_SCHEME_MASTER_ITEMS) {
      schemeLookup.set(s.schemeName.trim().toLowerCase(), s);
    }
    for (const s of MOCK_SCHEMES) {
      if (!schemeLookup.has(s.schemeName.trim().toLowerCase())) {
        schemeLookup.set(s.schemeName.trim().toLowerCase(), {
          schemeName: s.schemeName,
          schemeCategory: s.schemeCategory || s.category || 'General',
          categoryName: s.eoiCategory || 'GENERAL',
          amount: s.emdAmount || 50000,
          processFees: s.processFeeAmount || 2000,
          budget: 50000000,
          code: s.code || 'GENERAL',
          eoiDescription: s.eoiDescription || 'Skill Training Scheme under RSLDC',
          status: 'Active'
        });
      }
    }

    return this.mappings()
      .filter(m => m.masterItemId === masterItemId && m.requirementType === type && m.status !== 'Inactive')
      .map(m => {
        const found = schemeLookup.get(m.schemeName.trim().toLowerCase());
        return {
          mappingId: m.id,
          schemeId: m.schemeId,
          schemeName: m.schemeName,
          schemeCode: found?.code || m.schemeCode || 'GENERAL',
          schemeCategory: found?.schemeCategory || 'General',
          categoryName: found?.categoryName || 'GENERAL',
          budget: found?.budget != null ? found.budget : 50000000,
          emdAmount: found?.amount != null ? found.amount : (found?.emdAmount || 50000),
          processFees: found?.processFees != null ? found.processFees : (found?.processFeeAmount || 2000),
          description: found?.eoiDescription || 'Expression of Interest proposal under RSLDC guidelines',
          isMandatory: m.isMandatory,
          status: m.status
        };
      });
  }

  /**
   * Adds a new requirement mapping, preventing duplicate active mappings for the same scheme.
   */
  addMapping(mapping: Omit<SchemeRequirementMapping, 'id' | 'createdAt' | 'updatedAt'>): SchemeRequirementMapping {
    const current = this.mappings();
    const duplicate = current.find(
      m => m.schemeName.trim().toLowerCase() === mapping.schemeName.trim().toLowerCase() &&
           m.masterItemId === mapping.masterItemId &&
           m.requirementType === mapping.requirementType &&
           m.status !== 'Inactive'
    );

    if (duplicate) {
      // If already mapped, return existing
      return duplicate;
    }

    const newMapping: SchemeRequirementMapping = {
      ...mapping,
      id: `srm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    const updated = [...current, newMapping];
    this.mappings.set(updated);
    this.storage.setItem(STORAGE_KEY_REQUIREMENTS, updated);
    return newMapping;
  }

  /**
   * Removes a mapping by marking it inactive or filtering it out.
   */
  removeMapping(mappingId: string): void {
    const updated = this.mappings().filter(m => m.id !== mappingId);
    this.mappings.set(updated);
    this.storage.setItem(STORAGE_KEY_REQUIREMENTS, updated);
  }

  /**
   * Toggles the Mandatory status of an individual mapping for a specific scheme.
   */
  toggleMandatory(mappingId: string): void {
    const updated = this.mappings().map(m => {
      if (m.id === mappingId) {
        return { ...m, isMandatory: !m.isMandatory, updatedAt: Date.now() };
      }
      return m;
    });
    this.mappings.set(updated);
    this.storage.setItem(STORAGE_KEY_REQUIREMENTS, updated);
  }

  /**
   * Creates a brand-new master item (Document or Annexure) in the central repository
   * and immediately binds it to the specified scheme.
   */
  createAndMapMasterItem(
    schemeId: string,
    schemeName: string,
    type: RequirementType,
    itemData: { name: string; category?: string; description?: string; templateFileName?: string; templateVersion?: string },
    isMandatory: boolean = true
  ): SchemeRequirementMapping {
    const masterId = `${type === 'DOCUMENT' ? 'doc' : 'annex'}-${Date.now()}`;
    const code = `${type === 'DOCUMENT' ? 'DOC' : 'ANNEX'}-${Date.now().toString().slice(-4)}`;

    // Add to central data engine
    if (type === 'DOCUMENT') {
      const docItem: Partial<DocMasterItem> = {
        id: masterId,
        docName: itemData.name.trim(),
        schemes: [schemeName.trim()],
        status: 'Active'
      };
      this.dataEngine.for<DocMasterItem>('DOC_MASTERS').create(docItem).subscribe();
    } else {
      const annexItem: Partial<AnnexureMasterItem> = {
        id: masterId,
        annexureName: itemData.name.trim(),
        schemes: [schemeName.trim()],
        status: 'Active'
      };
      this.dataEngine.for<AnnexureMasterItem>('ANNEXURE_MASTERS').create(annexItem).subscribe();
    }

    // Create relational mapping
    return this.addMapping({
      schemeId,
      schemeName: schemeName.trim(),
      requirementType: type,
      masterItemId: masterId,
      masterItemCode: code,
      masterItemName: itemData.name.trim(),
      category: itemData.category || (type === 'DOCUMENT' ? 'Compliance & Verification' : 'Official Format'),
      isMandatory,
      displayOrder: this.mappings().length + 1,
      templateFileName: itemData.templateFileName,
      templateVersion: itemData.templateVersion || '1.0',
      completionMethod: 'DOWNLOAD_UPLOAD',
      maxSizeMb: 25,
      acceptedFormats: ['PDF', 'JPEG', 'PNG', 'TXT'],
      status: 'Active'
    });
  }

  // =========================================================================
  // SCHEME CUSTOM FIELDS MUTATION
  // =========================================================================

  saveCustomField(field: Omit<SchemeCustomField, 'id' | 'createdAt'> & { id?: string }): SchemeCustomField {
    const current = this.customFields();
    const id = field.id || `scf-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const newField: SchemeCustomField = {
      ...field,
      id,
      createdAt: Date.now()
    };

    let updated: SchemeCustomField[];
    if (field.id) {
      updated = current.map(f => (f.id === field.id ? newField : f));
    } else {
      updated = [...current, newField];
    }

    this.customFields.set(updated);
    this.storage.setItem(STORAGE_KEY_CUSTOM_FIELDS, updated);
    return newField;
  }

  createCustomField(field: Omit<SchemeCustomField, 'id' | 'createdAt'> & { id?: string }): SchemeCustomField {
    return this.saveCustomField(field);
  }

  deleteCustomField(fieldId: string): void {
    this.removeCustomField(fieldId);
  }

  removeCustomField(fieldId: string): void {
    const updated = this.customFields().filter(f => f.id !== fieldId);
    this.customFields.set(updated);
    this.storage.setItem(STORAGE_KEY_CUSTOM_FIELDS, updated);
  }

  // =========================================================================
  // IMMUTABLE EOI REQUIREMENT SNAPSHOTS
  // =========================================================================

  /**
   * Captures an immutable freeze of all scheme requirements at publication time.
   */
  createEoiSnapshot(eoiRefNo: string, schemeName: string): EoiRequirementSnapshot {
    const reqs = this.getRequirementsForScheme(schemeName);
    const snapshot: EoiRequirementSnapshot = {
      eoiRefNo,
      schemeId: reqs.documents[0]?.schemeId || reqs.annexures[0]?.schemeId || 'sch-default',
      schemeName,
      version: '1.0.0',
      publishedAt: Date.now(),
      documents: JSON.parse(JSON.stringify(reqs.documents)),
      annexures: JSON.parse(JSON.stringify(reqs.annexures)),
      customFields: JSON.parse(JSON.stringify(reqs.customFields))
    };

    const updated = [...this.snapshots().filter(s => s.eoiRefNo !== eoiRefNo), snapshot];
    this.snapshots.set(updated);
    this.storage.setItem(STORAGE_KEY_SNAPSHOTS, updated);
    return snapshot;
  }

  getEoiSnapshot(eoiRefNo: string): EoiRequirementSnapshot | null {
    return this.snapshots().find(s => s.eoiRefNo === eoiRefNo) || null;
  }
}
