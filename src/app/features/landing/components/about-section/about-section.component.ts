import { Component } from '@angular/core';
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
                src="/video.mp4" 
                class="w-full h-[400px] object-cover object-center"
                autoplay 
                loop 
                muted 
                playsinline>
              </video>
              
              <!-- Quote Block overlaid on video -->
              <div class="absolute bottom-0 left-0 right-0 bg-[#f0f6ff]/95 backdrop-blur-sm p-5 sm:p-6 border-t border-[#e2efff] shadow-[0_-4px_15px_rgba(0,0,0,0.1)]">
                <span class="absolute top-4 left-4 text-4xl text-blue-500 font-serif leading-none">"</span>
                <p class="text-[13px] sm:text-sm text-slate-700 leading-relaxed pl-6 relative z-10 font-medium">
                  ISMS 2.0 is an integrated MIS system of RSLDC to provide a single platform to 
                  Youths, Training providers, Govt. Departments, Convergence Departments, and 
                  Certification agencies for Skill Development Schemes.
                </p>
                <span class="absolute bottom-1 right-4 text-4xl text-blue-500 font-serif leading-none rotate-180">"</span>
              </div>
            </div>
          </div>

          <!-- Text Content -->
          <div class="pt-2">
            <h2 class="text-3xl sm:text-4xl font-black text-[#0B3558] mb-6 tracking-tight font-sans">
              About ISMS 2.0
            </h2>
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
            </div>
          </div>
          
          <div class="clear-both"></div>
        </div>

      </div>
    </section>
  `
})
export class AboutSectionComponent {
  isExpanded = false;

  toggleExpand() {
    this.isExpanded = !this.isExpanded;
  }
}
