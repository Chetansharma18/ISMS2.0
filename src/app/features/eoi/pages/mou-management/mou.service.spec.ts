import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { MouService } from './mou.service';
import { StorageService } from '../../../../core/services/storage.service';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';
import { INITIAL_MOU_DOCUMENTS } from './mou.model';

describe('MouService', () => {
  let service: MouService;
  let mockStorage: Record<string, unknown>;

  beforeEach(() => {
    mockStorage = {};
    TestBed.configureTestingModule({
      providers: [
        MouService,
        {
          provide: StorageService,
          useValue: {
            getItem: (key: string) => mockStorage[key] ?? null,
            setItem: (key: string, val: unknown) => {
              mockStorage[key] = val;
            }
          }
        },
        {
          provide: DocumentViewerService,
          useValue: {
            registerFile: () => {}
          }
        }
      ]
    });
    service = TestBed.inject(MouService);
  });

  it('loads initial MoU documents if storage is empty', () => {
    let list: any[] = [];
    service.getDocuments().subscribe(res => {
      list = res;
    });
    expect(list.length).toBe(INITIAL_MOU_DOCUMENTS.length);
    expect(list[0].title).toBe(INITIAL_MOU_DOCUMENTS[0].title);
  });

  it('uploads a new MoU document', () => {
    let added: any;
    service.uploadDocument('New Test MoU', null, 'Test_MoU.pdf', '1.5 MB').subscribe(res => {
      added = res;
    });

    expect(added).toBeDefined();
    expect(added.title).toBe('New Test MoU');
    expect(added.fileName).toBe('Test_MoU.pdf');

    let updatedList: any[] = [];
    service.getDocuments().subscribe(res => {
      updatedList = res;
    });
    expect(updatedList.length).toBe(INITIAL_MOU_DOCUMENTS.length + 1);
    expect(updatedList[0].id).toBe(added.id);
  });

  it('deletes an MoU document', () => {
    const targetId = INITIAL_MOU_DOCUMENTS[0].id;
    let success = false;
    service.deleteDocument(targetId).subscribe(res => {
      success = res;
    });

    expect(success).toBe(true);

    let updatedList: any[] = [];
    service.getDocuments().subscribe(res => {
      updatedList = res;
    });
    expect(updatedList.length).toBe(INITIAL_MOU_DOCUMENTS.length - 1);
  });
});
