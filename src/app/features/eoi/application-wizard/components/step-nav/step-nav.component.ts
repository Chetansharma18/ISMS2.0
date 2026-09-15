import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EoiService } from '../../services/eoi.service';
import { EOI_SECTIONS, SectionMeta } from '../../models/eoi.model';

@Component({
  selector: 'app-step-nav',
  standalone: true,
  imports: [CommonModule],
  template: `
    <nav class="gov-step-nav-bar" aria-label="EOI Application Progress">
      <div class="step-nav-container">
        <div class="step-stepper-track" role="tablist">
          <div
            *ngFor="let sec of sections; let idx = index; trackBy: trackBySecId"
            class="stepper-step"
            [class.active]="isStepActive(sec.id)"
            [class.completed]="isStepCompleted(sec.id)"
          >
            <button
              type="button"
              role="tab"
              [attr.aria-selected]="isStepActive(sec.id)"
              class="stepper-btn"
              (click)="onSelect(sec.id)"
            >
              <div class="stepper-badge">
                <span *ngIf="isStepCompleted(sec.id)" class="badge-icon">✓</span>
                <span *ngIf="!isStepCompleted(sec.id)" class="badge-num">{{ sec.id }}</span>
              </div>
              <div class="stepper-meta">
                <span class="step-super">STEP {{ sec.id }}</span>
                <span class="step-title">{{ sec.shortLabel }}</span>
              </div>
            </button>
            <div *ngIf="idx < sections.length - 1" class="stepper-connector" aria-hidden="true"></div>
          </div>
        </div>
      </div>
    </nav>
  `,
  styleUrls: ['./step-nav.component.css']
})
export class StepNavComponent {
  eoiService = inject(EoiService);
  sections: SectionMeta[] = EOI_SECTIONS;

  trackBySecId(index: number, sec: SectionMeta): number {
    return sec.id;
  }

  getCurrentStepIndex(): number {
    const stage = this.eoiService.flowStage();
    if (stage === 'documents') return 1;
    if (stage === 'fees') return 2;
    if (stage === 'preview' || stage === 'edit_section') return 3;
    if (stage === 'receipt') return 4;
    return 1;
  }

  isStepActive(stepId: number): boolean {
    return this.getCurrentStepIndex() === stepId;
  }

  isStepCompleted(stepId: number): boolean {
    const current = this.getCurrentStepIndex();
    if (stepId === 1) {
      return this.eoiService.mandatorySlotsUploaded() && current > 1;
    }
    if (stepId === 2) {
      return this.eoiService.isStep2Paid() && current > 2;
    }
    if (stepId === 3) {
      return this.eoiService.submissionData().status === 'SUBMITTED' && current === 4;
    }
    if (stepId === 4) {
      return current === 4 && this.eoiService.submissionData().status === 'SUBMITTED';
    }
    return current > stepId;
  }

  onSelect(sectionId: number): void {
    const current = this.getCurrentStepIndex();
    if (sectionId === current) return;

    // Moving backwards is always allowed
    if (sectionId < current) {
      this.eoiService.setSection(sectionId);
      return;
    }

    // Moving to Step 2: requires Step 1 mandatory docs
    if (sectionId >= 2 && !this.eoiService.mandatorySlotsUploaded()) {
      this.eoiService.showToast('Please upload all 4 mandatory documents in Step 1 first.');
      return;
    }

    // Moving to Step 3 or 4: strictly requires both compulsory fee checkboxes ticked and paid
    if (sectionId >= 3 && !this.eoiService.isStep2Paid()) {
      this.eoiService.showToast('Both Processing Fee and EMD Fee in Step 2 are compulsory and must be paid before viewing Preview.');
      return;
    }

    // Moving to Step 4: requires application to be submitted in Step 3
    if (sectionId === 4 && this.eoiService.submissionData().status !== 'SUBMITTED') {
      this.eoiService.showToast('Please review details and submit your application in Step 3 first.');
      return;
    }

    this.eoiService.setSection(sectionId);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }
}
