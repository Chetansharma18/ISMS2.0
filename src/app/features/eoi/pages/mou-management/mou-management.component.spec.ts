import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MouManagementComponent } from './mou-management.component';
import { MouService } from './mou.service';
import { DocumentViewerService } from '../../../../core/services/document-viewer.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { BehaviorSubject, of } from 'rxjs';
import { MouDocument } from './mou.model';
import { FileDoc } from '../../../registration/models/otr-form.model';

describe('MouManagementComponent', () => {
  let component: MouManagementComponent;
  let fixture: ComponentFixture<MouManagementComponent>;
  let mockDocsSubject: BehaviorSubject<MouDocument[]>;
  let mockMouService: Partial<MouService>;
  let mockDocViewer: Partial<DocumentViewerService>;
  let mockNotify: Partial<NotificationService>;

  const sampleDocs: MouDocument[] = [
    {
      id: 'doc-1',
      title: 'MMKVY Scheme MoU',
      fileName: 'Signed_MMKVY_MoU.pdf',
      fileSize: '2.4 MB',
      uploadedOn: '24-Oct-2026 11:30 AM',
      uploadedBy: 'Department User'
    },
    {
      id: 'doc-2',
      title: 'PMKVY 4.0 Special Agreement',
      fileName: 'PMKVY_Agreement.pdf',
      fileSize: '1.8 MB',
      uploadedOn: '20-Oct-2026 03:15 PM',
      uploadedBy: 'Department User'
    }
  ];

  beforeEach(async () => {
    mockDocsSubject = new BehaviorSubject<MouDocument[]>([...sampleDocs]);
    mockMouService = {
      documents$: mockDocsSubject.asObservable(),
      uploadDocument: (title: string, _file?: File | null, fileNameOverride?: string, fileSizeOverride?: string) => {
        const newDoc: MouDocument = {
          id: 'doc-new',
          title,
          fileName: fileNameOverride || 'Uploaded.pdf',
          fileSize: fileSizeOverride || '1.0 MB',
          uploadedOn: '26-Oct-2026 01:00 PM',
          uploadedBy: 'Department User'
        };
        mockDocsSubject.next([newDoc, ...mockDocsSubject.value]);
        return of(newDoc);
      },
      deleteDocument: (id: string) => {
        mockDocsSubject.next(mockDocsSubject.value.filter(d => d.id !== id));
        return of(true);
      }
    };

    mockDocViewer = {
      openDocument: () => {},
      registerFile: () => 'blob:test'
    };

    mockNotify = {
      success: () => {},
      warning: () => {},
      error: () => {}
    };

    await TestBed.configureTestingModule({
      imports: [MouManagementComponent],
      providers: [
        { provide: MouService, useValue: mockMouService },
        { provide: DocumentViewerService, useValue: mockDocViewer },
        { provide: NotificationService, useValue: mockNotify }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MouManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders initial list of documents', () => {
    expect(component.documents().length).toBe(2);
    expect(component.filteredDocuments().length).toBe(2);
  });

  it('filters documents by search query', () => {
    component.searchQuery.set('PMKVY');
    expect(component.filteredDocuments().length).toBe(1);
    expect(component.filteredDocuments()[0].title).toContain('PMKVY');

    component.searchQuery.set('non-existent-xyz');
    expect(component.filteredDocuments().length).toBe(0);
  });

  it('auto-fills doc title when file is selected if title is empty', () => {
    const fileDoc: FileDoc = {
      fileName: 'Signed_Bipartite_Draft.pdf',
      fileSize: '1.2 MB',
      uploadDate: '26-10-2026',
      status: 'uploaded'
    };

    component.onFileDocChange(fileDoc);
    expect(component.selectedDoc()).toBe(fileDoc);
    expect(component.docTitle()).toBe('Signed Bipartite Draft');
    expect(component.canUpload()).toBe(true);
  });

  it('uploads a document and resets form', () => {
    const fileDoc: FileDoc = {
      fileName: 'New_MoU.pdf',
      fileSize: '3.1 MB',
      uploadDate: '26-10-2026',
      status: 'uploaded'
    };

    component.onFileDocChange(fileDoc);
    component.docTitle.set('Custom Title');
    component.uploadDocument();

    expect(component.docTitle()).toBe('');
    expect(component.selectedDoc()).toBeNull();
    expect(component.documents().length).toBe(3);
    expect(component.documents()[0].title).toBe('Custom Title');
  });

  it('handles delete prompt, cancel, and confirm delete', () => {
    const target = component.documents()[0];

    // Open delete confirmation modal
    component.promptDelete(target);
    expect(component.documentToDelete()).toBe(target);

    // Cancel delete
    component.cancelDelete();
    expect(component.documentToDelete()).toBeNull();

    // Re-open and confirm delete
    component.promptDelete(target);
    component.confirmDelete();

    expect(component.documentToDelete()).toBeNull();
    expect(component.documents().length).toBe(1);
    expect(component.documents().find(d => d.id === target.id)).toBeUndefined();
  });
});
