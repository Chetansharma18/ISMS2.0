import { Component, Input } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface StepItem {
  id: number;
  label: string;
  sublabel?: string;
  route?: string;
}

@Component({
  selector: 'app-stepper',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, RouterLink],
  template: `
    <!-- Vertical Stepper (Exact Match to Design Image 1) -->
    <div *ngIf="orientation === 'vertical'" class="bg-surface-0 border border-line-200 p-6 shadow-sm rounded-none">
      
      <!-- Top Header Header Line -->
      <div class="flex items-center justify-between pb-3.5 border-b border-line-200 mb-5">
        <span class="text-xs font-bold text-rsldc-navy tracking-wider uppercase font-sans">
          APPLICATION SEQUENCE
        </span>
        <span class="text-rsldc-gold font-bold text-[11px] uppercase tracking-wider">
          STEP {{ currentStep }} OF 7
        </span>
      </div>

      <!-- Step List -->
      <ol class="space-y-4 relative">
        <li *ngFor="let step of steps" class="relative flex items-start group">
          
          <!-- Step Numbered Circle Badge -->
          <div class="flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold flex-shrink-0 transition-colors mr-3.5"
            [ngClass]="{
              'bg-[#A84922] text-white border-2 border-[#A84922] shadow-sm': step.id === currentStep,
              'bg-[#F8FAFC] text-rsldc-navy border-2 border-rsldc-navy': step.id < currentStep,
              'bg-white text-muted-500 border border-line-200': step.id > currentStep
            }">
            <span *ngIf="step.id < currentStep">✓</span>
            <span *ngIf="step.id >= currentStep">{{ step.id }}</span>
          </div>

          <!-- Step Label & Description -->
          <div class="flex-grow pt-0.5">
            <div class="text-sm leading-tight flex items-center justify-between"
              [ngClass]="{
                'text-[#A84922] font-bold': step.id === currentStep,
                'text-rsldc-navy font-semibold': step.id < currentStep,
                'text-muted-500 font-medium': step.id > currentStep
              }">
              <span>{{ step.label }}</span>
              <span *ngIf="step.id === currentStep" class="text-[11px] text-[#A84922] font-semibold ml-2">← current</span>
              <span *ngIf="step.id < currentStep" class="text-[11px] text-approve-700 font-semibold ml-2">✓ done</span>
            </div>
            
            <p *ngIf="step.sublabel" class="text-[11px] text-muted-500 mt-0.5 leading-snug">
              {{ step.sublabel }}
            </p>
          </div>
        </li>
      </ol>
    </div>

    <!-- Horizontal Stepper (For Top / Mobile / Compact View) -->
    <div *ngIf="orientation === 'horizontal'" class="bg-surface-0 border-b border-line-200 px-4 py-3">
      <div class="max-w-5xl mx-auto flex items-center justify-between overflow-x-auto text-xs">
        <div *ngFor="let step of steps; let last = last" class="flex items-center whitespace-nowrap">
          <div class="flex items-center gap-2"
            [ngClass]="{
              'text-[#A84922] font-bold': step.id === currentStep,
              'text-rsldc-navy font-semibold': step.id < currentStep,
              'text-muted-500 font-medium': step.id > currentStep
            }">
            <span class="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold"
              [ngClass]="{
                'bg-[#A84922] text-white': step.id === currentStep,
                'bg-[#F8FAFC] text-rsldc-navy border border-rsldc-navy': step.id < currentStep,
                'bg-white text-muted-500 border border-line-200': step.id > currentStep
              }">
              <span *ngIf="step.id < currentStep">✓</span>
              <span *ngIf="step.id >= currentStep">{{ step.id }}</span>
            </span>
            <span>{{ step.label }}</span>
          </div>
          <div *ngIf="!last" class="w-8 h-[1px] bg-line-200 mx-2 hidden sm:block"></div>
        </div>
      </div>
    </div>
  `
})
export class StepperComponent {
  @Input() currentStep: number = 1;
  @Input() orientation: 'vertical' | 'horizontal' = 'vertical';

  steps: StepItem[] = [
    { id: 1, label: 'Registration', sublabel: 'Entity & identity verification' },
    { id: 2, label: 'Profile', sublabel: 'Auto-attaches to all schemes' },
    { id: 3, label: 'Scheme Details', sublabel: 'Proposal capacity & centers' },
    { id: 4, label: 'EMD Payment', sublabel: 'Refundable security deposit' },
    { id: 5, label: 'Preview & Submit', sublabel: 'Legal affirmation & locking' },
    { id: 6, label: 'Acknowledgement', sublabel: 'Official receipt & App ID' },
    { id: 7, label: 'Scrutiny & Result', sublabel: 'Department evaluation' }
  ];
}
