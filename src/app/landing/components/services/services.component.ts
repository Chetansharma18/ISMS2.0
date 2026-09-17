import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface Option13Service {
  id: string;
  title: string;
  image: string;
  theme: 'orange' | 'blue';
  iconType: 'training' | 'assessment' | 'placement' | 'payment' | 'inspection' | 'mis';
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html'
})
export class ServicesComponent {
  services: Option13Service[] = [
    {
      id: 'training-attendance',
      title: 'Training & Attendance',
      image: 'opt13-training.jpg',
      theme: 'orange',
      iconType: 'training'
    },
    {
      id: 'assessment-certification',
      title: 'Assessment & Certification',
      image: 'opt13-assessment.jpg',
      theme: 'blue',
      iconType: 'assessment'
    },
    {
      id: 'placement-verification',
      title: 'Placement & Verification',
      image: 'opt13-placement.jpg',
      theme: 'orange',
      iconType: 'placement'
    },
    {
      id: 'payment-financial-management',
      title: 'Payment & Financial Management',
      image: 'opt13-payment.jpg',
      theme: 'blue',
      iconType: 'payment'
    },
    {
      id: 'inspection-monitoring',
      title: 'Inspection & Monitoring',
      image: 'opt13-inspection.jpg',
      theme: 'orange',
      iconType: 'inspection'
    },
    {
      id: 'mis-reports',
      title: 'MIS & Reports',
      image: 'opt13-mis.jpg',
      theme: 'blue',
      iconType: 'mis'
    }
  ];
}
