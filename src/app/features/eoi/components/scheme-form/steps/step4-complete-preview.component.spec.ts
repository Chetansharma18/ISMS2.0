import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Step4CompletePreviewComponent } from './step4-complete-preview.component';
import { SchemeFormState } from '../scheme-form.state';
import { OtrFormService } from '../../../../registration/services/otr-form.service';
import { DocumentViewerService } from '../../../../../core/services/document-viewer.service';
import { EoiDraftService } from '../../../../../core/services/eoi-draft.service';
import { DataEngineService } from '../../../../../core/services/data-engine.service';
import { SchemeFormReceiptsService } from '../scheme-form-receipts.service';

describe('Step4CompletePreviewComponent', () => {
  let fixture: ComponentFixture<Step4CompletePreviewComponent>;
  let component: Step4CompletePreviewComponent;
  let state: SchemeFormState;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Step4CompletePreviewComponent],
      providers: [
        SchemeFormState,
        OtrFormService,
        DocumentViewerService,
        EoiDraftService,
        DataEngineService,
        SchemeFormReceiptsService,
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of({}) }
        }
      ]
    });

    state = TestBed.inject(SchemeFormState);
    fixture = TestBed.createComponent(Step4CompletePreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders all sections and does not have edit buttons on profile sections', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    // Check headings
    expect(compiled.textContent).toContain('Processing Fee');
    expect(compiled.textContent).toContain('Organisation Details');
    expect(compiled.textContent).toContain('Authorized Signatory');
    expect(compiled.textContent).toContain('Organisation Bank Details');
    expect(compiled.textContent).toContain('Documents');

    // Profile sections must NOT have edit buttons
    const buttons = Array.from(compiled.querySelectorAll('button')).map(b => b.textContent?.trim());
    expect(buttons.filter(b => b === 'Edit Details').length).toBe(0);
  });

  it('has an Edit button in the Documents section header that toggles replace mode', () => {
    expect(component['isEditingDocs']()).toBe(false);

    component['toggleDocEdit']();
    fixture.detectChanges();

    expect(component['isEditingDocs']()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Replace mode active');
  });

  it('allows replacing an uploaded document with valid file', () => {
    component['toggleDocEdit']();
    fixture.detectChanges();

    const targetDoc = state.eoiDocuments()[0];
    const dummyFile = new File(['content'], 'replacement_cert.pdf', { type: 'application/pdf' });
    const mockEvent = {
      target: {
        files: [dummyFile],
        value: 'replacement_cert.pdf'
      }
    } as unknown as Event;

    component['onFileChange'](mockEvent, targetDoc);
    fixture.detectChanges();

    const updatedDoc = state.eoiDocuments().find(d => d.id === targetDoc.id);
    expect(updatedDoc?.fileName).toBe('replacement_cert.pdf');
    expect(updatedDoc?.status).toBe('uploaded');
  });

  it('validates file extension and sets error message for invalid format', () => {
    component['toggleDocEdit']();
    fixture.detectChanges();

    const targetDoc = state.eoiDocuments()[0];
    const invalidFile = new File(['content'], 'doc.exe', { type: 'application/x-msdownload' });
    const mockEvent = {
      target: {
        files: [invalidFile],
        value: 'doc.exe'
      }
    } as unknown as Event;

    component['onFileChange'](mockEvent, targetDoc);
    fixture.detectChanges();

    expect(component['errors']()[targetDoc.id]).toContain('Unsupported file type');
  });
});
