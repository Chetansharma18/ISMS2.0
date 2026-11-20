import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, expect, it, beforeEach, vi } from 'vitest';
import { HelpSupportComponent } from './help-support.component';
import { UserManualPdfService } from '../../core/services/user-manual-pdf.service';

describe('HelpSupportComponent', () => {
  let fixture: ComponentFixture<HelpSupportComponent>;
  let component: HelpSupportComponent;
  let mockUserManualService: { generateUserManualPdf: ReturnType<typeof vi.fn> };

  beforeEach(async () => {
    mockUserManualService = {
      generateUserManualPdf: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [HelpSupportComponent],
      providers: [
        provideRouter([]),
        { provide: UserManualPdfService, useValue: mockUserManualService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HelpSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders support contacts, chatbot and FAQs', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Help & Support');
    expect(el.textContent).toContain('0141-2716091');
    expect(el.textContent).toContain('support@isms.rajasthan.gov.in');
    expect(el.textContent).toContain('ISMS 2.0 Support Assistant');
    expect(el.textContent).toContain('Frequently Asked Questions');
  });

  it('responds intelligently to chatbot inquiries about OTR and EOI', () => {
    component.userInput = 'How to register OTR?';
    component.sendUserMessage();
    fixture.detectChanges();

    const messages = component.messages();
    expect(messages.length).toBeGreaterThan(1);
    const lastReply = messages[messages.length - 1];
    expect(lastReply.sender).toBe('assistant');
    expect(lastReply.text).toContain('Registration');
    expect(lastReply.text).toContain('/registration');

    component.askQuestion('How to submit an EOI bid?');
    fixture.detectChanges();

    const updated = component.messages();
    const eoiReply = updated[updated.length - 1];
    expect(eoiReply.sender).toBe('assistant');
    expect(eoiReply.text).toContain('Expression of Interest');
    expect(eoiReply.text).toContain('/tenders');
  });

  it('allows expanding and collapsing FAQs', () => {
    const firstFaq = component.faqs()[0];
    expect(firstFaq.isOpen).toBe(true);

    component.toggleFaq(firstFaq.id);
    expect(component.faqs()[0].isOpen).toBe(false);

    component.toggleFaq(firstFaq.id);
    expect(component.faqs()[0].isOpen).toBe(true);
  });

  it('triggers user manual PDF download when action is clicked', async () => {
    await component.downloadManual();
    expect(mockUserManualService.generateUserManualPdf).toHaveBeenCalled();
  });
});
