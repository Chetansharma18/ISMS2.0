import '@angular/compiler';
import { describe, it, expect, beforeEach } from 'vitest';
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core';
import { of } from 'rxjs';
import { SchemeRequirementsService } from './scheme-requirements.service';
import { StorageService } from './storage.service';
import { DataEngineService } from './data-engine.service';
import { HttpService } from '../http/http.service';
import { MockDatabaseService } from '../mock/mock-database.service';

describe('SchemeRequirementsService', () => {
  let service: SchemeRequirementsService;

  beforeEach(() => {
    const mockHttp = {
      get: () => of([]),
      post: () => of({}),
      put: () => of({}),
      delete: () => of({})
    };

    const injector = createEnvironmentInjector([
      { provide: HttpService, useValue: mockHttp },
      StorageService,
      MockDatabaseService,
      DataEngineService,
      SchemeRequirementsService
    ], null as any);

    service = runInInjectionContext(injector, () => injector.get(SchemeRequirementsService));
  });

  it('initializes and seeds initial normalized requirement mappings', () => {
    const mappings = service.mappings();
    expect(mappings.length).toBeGreaterThan(0);
    const docMap = mappings.find(m => m.requirementType === 'DOCUMENT');
    expect(docMap).toBeDefined();
    expect(docMap?.schemeName).toBeDefined();
    expect(docMap?.masterItemId).toBeDefined();
  });

  it('retrieves documents and annexures for a scheme with getRequirementsForScheme', () => {
    const reqs = service.getRequirementsForScheme('Vishwakarma Yuva Udyami Protsahan Yojana');
    expect(reqs.documents.length).toBeGreaterThan(0);
    expect(reqs.annexures.length).toBeGreaterThan(0);
    expect(reqs.documents.every(d => d.requirementType === 'DOCUMENT')).toBe(true);
    expect(reqs.annexures.every(a => a.requirementType === 'ANNEXURE')).toBe(true);
  });

  it('retrieves scheme-specific custom dynamic fields', () => {
    const solarReqs = service.getRequirementsForScheme('Rooftop Solar Skill Development Scheme (Surya Ghar Yojana)');
    expect(solarReqs.customFields.length).toBeGreaterThan(0);
    const capacityField = solarReqs.customFields.find(f => f.fieldKey === 'targetTrainingCapacityKw');
    expect(capacityField).toBeDefined();
    expect(capacityField?.type).toBe('number');
    expect(capacityField?.mandatory).toBe(true);
  });

  it('adds a new mapping and prevents active duplicates', () => {
    const initialCount = service.mappings().length;
    const newMapping = service.addMapping({
      schemeId: 'sch-test',
      schemeName: 'Test Scheme',
      requirementType: 'DOCUMENT',
      masterItemId: 'doc-999',
      masterItemName: 'Audited Profit & Loss Statement',
      isMandatory: true,
      displayOrder: 1,
      status: 'Active'
    });

    expect(newMapping.id).toBeDefined();
    expect(service.mappings().length).toBe(initialCount + 1);

    // Attempting to add duplicate returns existing mapping without increasing count
    const dup = service.addMapping({
      schemeId: 'sch-test',
      schemeName: 'Test Scheme',
      requirementType: 'DOCUMENT',
      masterItemId: 'doc-999',
      masterItemName: 'Audited Profit & Loss Statement',
      isMandatory: true,
      displayOrder: 1,
      status: 'Active'
    });

    expect(dup.id).toBe(newMapping.id);
    expect(service.mappings().length).toBe(initialCount + 1);
  });

  it('toggles mandatory status for an individual scheme mapping', () => {
    const mapping = service.mappings()[0];
    const initialMandatory = mapping.isMandatory;
    service.toggleMandatory(mapping.id);

    const updated = service.mappings().find(m => m.id === mapping.id);
    expect(updated?.isMandatory).toBe(!initialMandatory);
  });

  it('removes a mapping with removeMapping', () => {
    const mapping = service.mappings()[0];
    const initialCount = service.mappings().length;
    service.removeMapping(mapping.id);
    expect(service.mappings().length).toBe(initialCount - 1);
    expect(service.mappings().some(m => m.id === mapping.id)).toBe(false);
  });

  it('creates an immutable EOI requirement snapshot upon publication', () => {
    const schemeName = 'Vishwakarma Yuva Udyami Protsahan Yojana';
    const snapshot = service.createEoiSnapshot('RSLDC/EOI/TEST/2026/01', schemeName);

    expect(snapshot.eoiRefNo).toBe('RSLDC/EOI/TEST/2026/01');
    expect(snapshot.schemeName).toBe(schemeName);
    expect(snapshot.documents.length).toBeGreaterThan(0);
    expect(snapshot.annexures.length).toBeGreaterThan(0);

    const fetched = service.getEoiSnapshot('RSLDC/EOI/TEST/2026/01');
    expect(fetched).toEqual(snapshot);
  });

  it('synchronizes updated document names and scheme associations via applyMastersSync', () => {
    const targetScheme = 'Vishwakarma Yuva Udyami Protsahan Yojana';
    const testDoc = {
      id: 'doc-sync-test',
      docName: 'New ISO Certificate 2026',
      schemes: [targetScheme],
      status: 'Active' as const
    };

    service.applyMastersSync([testDoc], []);

    const reqs = service.getRequirementsForScheme(targetScheme);
    const added = reqs.documents.find(d => d.masterItemId === 'doc-sync-test');
    expect(added).toBeDefined();
    expect(added?.masterItemName).toBe('New ISO Certificate 2026');

    // Rename the document in master
    const renamedDoc = { ...testDoc, docName: 'Updated ISO Certificate 2026' };
    service.applyMastersSync([renamedDoc], []);

    const updatedReqs = service.getRequirementsForScheme(targetScheme);
    const renamed = updatedReqs.documents.find(d => d.masterItemId === 'doc-sync-test');
    expect(renamed?.masterItemName).toBe('Updated ISO Certificate 2026');

    // Unlink the scheme in master
    const unlinkedDoc = { ...renamedDoc, schemes: [] };
    service.applyMastersSync([unlinkedDoc], []);

    const finalReqs = service.getRequirementsForScheme(targetScheme);
    const unlinked = finalReqs.documents.find(d => d.masterItemId === 'doc-sync-test');
    expect(unlinked).toBeUndefined();
  });
});
