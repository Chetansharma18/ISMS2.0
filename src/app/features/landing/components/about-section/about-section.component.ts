import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about-section',
  standalone: true,
  imports: [CommonModule],
  host: {
    class: 'block w-full'
  },
  template: `
    <section class="pt-12 pb-2 bg-white">
      <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
        
        <!-- Top Row: About Text & Video -->
        <div class="block mb-6 relative clear-both">
          
          <!-- Floated Video & Quote (Must be first in DOM for text wrap) -->
          <div class="w-full lg:w-[45%] lg:float-right lg:ml-10 lg:mt-[80px] mb-8 lg:mb-6">
            <div class="rounded-2xl overflow-hidden bg-slate-100 relative shadow-xl">
              <video 
                    #video
                    src="/video.mp4"
                    class="w-full h-[400px] object-cover object-center"
                    autoplay
                    loop
                    [muted]="true"
                    muted="muted"
                    [volume]="0"
                    playsinline>
                  </video>
              
              <!-- Quote Block overlaid on video -->
              <div class="absolute bottom-0 left-0 right-0 bg-[#f0f6ff]/95 backdrop-blur-sm p-5 sm:p-6 border-t border-[#e2efff] shadow-[0_-4px_15px_rgba(0,0,0,0.1)]">
                <span class="absolute top-4 left-4 text-4xl text-blue-500 font-serif leading-none">“</span>
                <p class="text-[13px] sm:text-sm text-slate-700 leading-relaxed pl-6 relative z-10 font-medium">
                  ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to 
                  Youths, Training providers, Govt. Departments, Convergence Departments, and 
                  Certification agencies for Skill Development Schemes.
                </p>
                <span class="absolute bottom-1 right-4 text-4xl text-blue-500 font-serif leading-none rotate-180">“</span>
              </div>
            </div>
          </div>

          <!-- Text Content -->
          <div class="pt-2">
            <h2 class="text-3xl sm:text-4xl font-black text-[#0B3558] mb-6 tracking-tight font-sans">
              About ISMS 2.0
            </h2>
            <!-- Existing Content -->
            <div class="space-y-4 text-[13px] sm:text-sm text-slate-600 leading-[1.8] text-justify mb-8">
              <p>
                <strong>Integrated Scheme Management System (ISMS 2.0)</strong> is a comprehensive <strong>e-Governance and Management Information System (MIS)</strong> designed to digitally transform, integrate, and streamline the processes involved in the planning, implementation, monitoring, and management of skill development schemes. The platform provides a centralized and secure digital ecosystem that brings together <strong>youth, training providers, government departments, empaneled agencies, assessment and certification agencies, and other stakeholders</strong> on a single platform.
              </p>
              <p>
                ISMS 2.0 enables <strong>end-to-end scheme management</strong>, beginning from scheme and application management through training, monitoring, assessment, certification, approvals, and reporting. By replacing fragmented and manual processes with structured digital workflows, the system helps improve operational efficiency, reduce duplication, enhance transparency, and ensure timely execution of scheme-related activities.
              </p>
              <p>
                The platform provides <strong>workflow-based approvals and role-based access</strong>, ensuring that every stakeholder can access the information and functions relevant to their responsibilities. Integrated dashboards and real-time monitoring capabilities provide authorities with a comprehensive view of scheme performance, applications, training activities, targets, achievements, assessments, certifications, and other key operational indicators.
              </p>
              <!-- Expanded Content -->
              @if (isExpanded) {
                <div class="space-y-4 animate-fade-in mt-4 pt-4 border-t border-slate-100">
                  <p>
                    ISMS 2.0 also serves as a centralized <strong>MIS and decision-support platform</strong>, enabling stakeholders to generate structured reports, monitor performance against defined targets, identify gaps, and track the progress of various schemes and initiatives. Data-driven dashboards and analytics support informed decision-making and provide greater visibility into the overall implementation of skill development programs.
                  </p>
                  <p>
                    The system is designed with a strong focus on <strong>security, scalability, interoperability, and transparency</strong>. It can integrate with relevant government systems and digital services to facilitate secure data exchange and reduce repetitive data entry. With a modular and scalable architecture, ISMS 2.0 can support evolving departmental requirements, new schemes, additional stakeholders, and future digital initiatives.
                  </p>
                  <p>
                    By bringing the complete scheme lifecycle onto a unified digital platform, <strong>ISMS 2.0 aims to create a more efficient, transparent, accountable, and citizen-centric ecosystem for skill development management</strong>, enabling government authorities to monitor implementation effectively while providing stakeholders with simplified and accessible digital services.
                  </p>
                  <p>
                    The platform further strengthens <strong>stakeholder collaboration and coordination</strong> by providing a common digital environment for communication, information exchange, task management, and status tracking. Each stakeholder can perform assigned activities through defined workflows, while the system maintains a structured record of actions, approvals, updates, and transactions throughout the scheme lifecycle.
                  </p>
                  <p>
                    A key objective of ISMS 2.0 is to establish a <strong>single source of truth for scheme-related information</strong>. Centralized data management enables authorized users to access consistent and up-to-date information across different stages of scheme implementation. This minimizes dependency on scattered records, spreadsheets, and manual documentation while improving data accuracy, traceability, and accessibility.
                  </p>
                  <p>
                    ISMS 2.0 provides comprehensive capabilities for <strong>application and beneficiary management</strong>, allowing eligible candidates and stakeholders to be managed through a structured digital process. The platform can support application submission, verification, scrutiny, approval, allocation, and subsequent tracking, helping ensure that applications move through the appropriate stages in a transparent and systematic manner.
                  </p>
                  <p>
                    The system also supports <strong>training provider and agency management</strong>, enabling authorities to maintain relevant organizational information, monitor activities, track assigned targets, and evaluate performance. Training-related activities can be monitored through centralized dashboards, providing visibility into batches, candidates, attendance, training progress, assessments, and certifications.
                  </p>
                  <p>
                    Through its <strong>monitoring and performance management capabilities</strong>, ISMS 2.0 enables government authorities to track progress at different administrative and operational levels. Key indicators can be presented through dashboards, charts, summaries, and analytical reports, allowing stakeholders to quickly understand current performance, identify areas requiring attention, and take appropriate administrative action.
                  </p>
                  <p>
                    The platform incorporates <strong>auditability and traceability</strong> across critical processes. Important transactions, approvals, status changes, and user activities can be recorded to provide a transparent history of actions performed within the system. This supports accountability, facilitates monitoring and review, and helps authorities maintain reliable digital records.
                  </p>
                  <p>
                    ISMS 2.0 is also designed to facilitate <strong>seamless integration with existing and future government digital infrastructure</strong>. Through secure APIs and standardized integration mechanisms, the platform can exchange relevant information with external applications and departmental systems wherever required. This interoperability helps reduce duplicate data entry and enables coordinated delivery of digital services.
                  </p>
                  <p>
                    From an administrative perspective, the system provides <strong>centralized configuration and control mechanisms</strong>, allowing authorized administrators to manage schemes, workflows, roles, permissions, organizational structures, parameters, and other configurable components. This provides flexibility to adapt the platform to changing policy requirements and operational processes without disrupting the overall system.
                  </p>
                  <p>
                    The solution places strong emphasis on <strong>data security and controlled access</strong>. Role-based permissions ensure that users can access only the information and functionality required for their assigned responsibilities. Security controls, authentication mechanisms, audit trails, and secure data exchange help protect sensitive information and maintain the integrity of the platform.
                  </p>
                  <p>
                    The architecture of ISMS 2.0 is intended to be <strong>modular, scalable, and future-ready</strong>, allowing additional modules and services to be introduced as requirements evolve. The platform can progressively incorporate advanced analytics, automated notifications, enhanced dashboards, mobile-enabled services, intelligent monitoring capabilities, and other emerging technologies to further improve scheme administration and service delivery.
                  </p>
                  <p>
                    By combining <strong>digital workflows, centralized data, integrated services, real-time monitoring, analytics, and stakeholder management</strong>, ISMS 2.0 provides a unified foundation for modern scheme administration. It enables government authorities to move from fragmented and process-intensive operations toward a more connected, measurable, and technology-driven approach to managing skill development initiatives.
                  </p>
                  <p>
                    Ultimately, ISMS 2.0 is envisioned as more than a conventional MIS platform. It serves as a <strong>digital governance ecosystem</strong> that connects people, processes, data, and institutions through a common platform. By improving visibility, accountability, coordination, and access to information, the system supports more effective implementation of skill development programs and strengthens the overall digital governance framework.
                  </p>
                </div>
              }
            </div>
            
            <!-- 
            <button (click)="toggleExpand()" class="bg-[#0B3558] hover:bg-[#07233B] text-white text-[13px] font-semibold px-6 py-2.5 rounded transition-colors inline-flex items-center gap-2 mb-4 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0B3558] focus:ring-offset-2 shadow hover:shadow-md">
              {{ isExpanded ? 'Read Less' : 'Know More' }}
              <svg class="w-4 h-4 transition-transform duration-300" [class.rotate-180]="isExpanded" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path *ngIf="!isExpanded" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                <path *ngIf="isExpanded" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            -->
          </div>
          
          <div class="clear-both"></div>
        </div>

      </div>
    </section>
  `
})
export class AboutSectionComponent implements AfterViewInit {
  @ViewChild('video') videoRef!: ElementRef<HTMLVideoElement>;
  isExpanded = false;

  ngAfterViewInit() {
    if (this.videoRef?.nativeElement) {
      this.videoRef.nativeElement.muted = true;
      this.videoRef.nativeElement.volume = 0;
    }
  }

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}

