import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { buildApiUrl } from '../../core/config/api.config';
import { provideApiHttp } from '../../core/http/http.providers';
import { NotificationService } from '../../core/services/notification.service';
import { DynamicFormBuilderComponent } from './dynamic-form-builder.component';
import { FormManagerForm } from './form-manager.model';

const LISTED: FormManagerForm = {
  id: 7, formKey: 'center-inspection', title: 'Center Inspection', moduleName: 'EOI', description: null,
  isActive: true, currentVersion: 2, createdAt: '2026-01-01T00:00:00Z', activeSchema: null
};

const FULL: FormManagerForm = {
  ...LISTED,
  activeSchema: {
    title: 'Center Inspection',
    fields: [
      { fieldKey: 'center_name', label: 'Center Name', fieldType: 'text', isRequired: true, displayOrder: 1, colSpan: 6, sectionName: 'Basic' },
      { fieldKey: 'lab_photo', label: 'Lab Photo', fieldType: 'file', isRequired: false, displayOrder: 2, colSpan: 12, sectionName: 'Infrastructure' }
    ]
  }
};

const url = (path: string) => buildApiUrl(path);

describe('DynamicFormBuilderComponent (Form Manager API)', () => {
  let fixture: ComponentFixture<DynamicFormBuilderComponent>;
  let component: DynamicFormBuilderComponent;
  let backend: HttpTestingController;
  let messages: string[];

  beforeEach(async () => {
    sessionStorage.clear();
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [DynamicFormBuilderComponent],
      providers: [provideRouter([]), provideApiHttp(), provideHttpClientTesting()]
    }).compileComponents();
    messages = [];
    const notifications = TestBed.inject(NotificationService);
    notifications.success = (m: string) => { messages.push(m); };
    notifications.error = (m: string) => { messages.push(m); };
    notifications.info = (m: string) => { messages.push(m); };
    backend = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DynamicFormBuilderComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => backend.verify());

  function loadList(): void {
    backend.expectOne(url('/form-manager')).flush([LISTED]);
    backend.expectOne(url('/form-manager/7')).flush(FULL);
    fixture.detectChanges();
  }

  it('lists the backend forms with their schema details', () => {
    fixture.detectChanges();
    loadList();
    const [row] = component.rows();
    expect(row.title).toBe('Center Inspection');
    expect(row.isStepForm).toBe(true);
    expect(row.stepCount).toBe(2);
    expect(row.fields).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('center-inspection');
  });

  it('creates a form with POST /form-manager and version 1 schema', () => {
    fixture.detectChanges();
    loadList();
    component.openCreate();
    const form = component.editor()!;
    form.title = 'Feedback Form';
    component.onTitleChange(form);
    form.steps[0].fields[0].label = 'Comments';
    component.onLabelChange(form, form.steps[0].fields[0]);
    component.save(form);

    const req = backend.expectOne(url('/form-manager'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body.formKey).toBe('feedback-form');
    expect(req.request.body.title).toBe('Feedback Form');
    expect(req.request.body.moduleName).toBe('EOI');
    expect(req.request.body.schema.fields).toEqual([
      expect.objectContaining({ fieldKey: 'comments', label: 'Comments', fieldType: 'text', displayOrder: 1, sectionName: null })
    ]);
    req.flush({ ...LISTED, id: 8, formKey: 'feedback-form', currentVersion: 1 });
    expect(component.editor()).toBeNull();
    // Reloads the list.
    backend.expectOne(url('/form-manager')).flush([LISTED]);
    backend.expectOne(url('/form-manager/7')).flush(FULL);
    expect(messages).toContain('Form created.');
  });

  it('shows the backend message under Form Key on a duplicate key (409)', () => {
    fixture.detectChanges();
    loadList();
    component.openCreate();
    const form = component.editor()!;
    form.title = 'Center Inspection';
    component.onTitleChange(form);
    component.save(form);
    backend.expectOne(url('/form-manager')).flush(
      { success: false, code: 'CONFLICT', message: "Dynamic form with key 'center-inspection' already exists." },
      { status: 409, statusText: 'Conflict' }
    );
    fixture.detectChanges();
    expect(component.fieldError('formKey')).toContain('already exists');
    expect(component.editor()).not.toBeNull();
  });

  it('edits a form by reading its schema and publishes the next version with PUT', () => {
    fixture.detectChanges();
    loadList();
    component.openEdit(LISTED);
    backend.expectOne(url('/form-manager/7')).flush(FULL);
    const form = component.editor()!;
    expect(form.isStepForm).toBe(true);
    expect(form.steps.map(s => s.title)).toEqual(['Basic', 'Infrastructure']);
    form.changelog = 'Renamed';
    form.steps[0].fields[0].label = 'Centre Name';
    component.save(form);

    const req = backend.expectOne(url('/form-manager/7'));
    expect(req.request.method).toBe('PUT');
    expect(req.request.body.changelog).toBe('Renamed');
    expect(req.request.body.newSchema.fields[0]).toMatchObject({ fieldKey: 'center_name', label: 'Centre Name', sectionName: 'Basic' });
    req.flush({ ...FULL, currentVersion: 3 });
    backend.expectOne(url('/form-manager')).flush([{ ...LISTED, currentVersion: 3 }]);
    backend.expectOne(url('/form-manager/7')).flush({ ...FULL, currentVersion: 3 });
    expect(messages).toContain('Form updated to version 3.');
  });

  it('switches a form off with PUT { isActive: false }', () => {
    fixture.detectChanges();
    loadList();
    component.toggleActive(component.forms()[0]);
    const req = backend.expectOne(url('/form-manager/7'));
    expect(req.request.body).toEqual({ isActive: false });
    req.flush({ ...LISTED, isActive: false });
    expect(component.forms()[0].isActive).toBe(false);
  });

  it('previews a chosen version from GET /form-manager/{id}?version=', () => {
    fixture.detectChanges();
    loadList();
    component.openPreview(component.forms()[0]);
    backend.expectOne(r => r.url === url('/form-manager/7') && r.params.get('version') === '2').flush(FULL);
    expect(component.preview()?.fields.map(f => f.id)).toEqual(['center_name', 'lab_photo']);
    expect(component.previewVersions()).toEqual([2, 1]);

    component.loadPreviewVersion(1);
    backend.expectOne(r => r.url === url('/form-manager/7') && r.params.get('version') === '1').flush({
      ...FULL, activeSchema: { title: 'Center Inspection', fields: [FULL.activeSchema!.fields[0]] }
    });
    expect(component.preview()?.fields).toHaveLength(1);
  });
});
