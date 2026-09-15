import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EoiService } from '../../services/eoi.service';

@Component({
  selector: 'app-arpit-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <header class="gov-top-header">
      <div class="header-inner">
        <div class="branding-group">
          <div class="emblem-box">
            <img src="ashok.png" alt="State Emblem of India" class="state-emblem" />
          </div>
          <div class="divider-vertical"></div>
          <div class="title-box">
            <div class="govt-label">
              <span class="hindi-text">राजस्थान सरकार</span>
              <span class="english-text">Government of Rajasthan</span>
            </div>
            <h1 class="main-system-title">ISMS 2.0</h1>
            <div class="sub-system-title">Integrated Scheme Management System</div>
          </div>
        </div>

        <div class="header-meta-group">
          <div class="portal-badge">EOI APPLICATION PORTAL</div>
          <div class="autosave-indicator">
            <span class="autosave-dot" [class.saving]="eoiService.autoSaveStatus() === 'saving'"></span>
            <span class="autosave-text">Auto-saved</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  eoiService = inject(EoiService);
}
