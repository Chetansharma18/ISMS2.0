import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

export interface TenderItem {
  id: string;
  date: string;
  title: string;
  refNo: string;
  category: string;
  pdfUrl?: string;
  portalUrl: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.css'
})
export class HeroComponent {
  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  readonly currentLanguage = this.languageService.currentLanguage;

  readonly isModalOpen = signal<boolean>(false);
  readonly selectedTender = signal<TenderItem | null>(null);
  readonly searchQuery = signal<string>('');
  readonly officialPortalUrl = 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403';

  readonly filteredTenders = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) {
      return this.tenders;
    }
    return this.tenders.filter(t =>
      t.title.toLowerCase().includes(q) ||
      t.refNo.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.date.toLowerCase().includes(q)
    );
  });

  scrollToAbout(event?: Event): void {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    if (typeof document === 'undefined' || typeof window === 'undefined') {
      return;
    }
    const el = document.getElementById('about');
    if (el) {
      const header = document.querySelector('header');
      const headerHeight = header ? header.getBoundingClientRect().height : 115;
      const targetPosition = el.getBoundingClientRect().top + window.pageYOffset - headerHeight - 10;

      window.scrollTo({
        top: Math.max(0, targetPosition),
        behavior: 'smooth'
      });

      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '#about');
      }
    }
  }

  readonly tenders: TenderItem[] = [
    {
      id: 't-soft-skill',
      date: '14 Sep, 2023',
      title: 'RFP FOR SELECTION SERVICES PROVIDER TO PROVIDE SOFT SKILL TRAINING TO GOVT ITI, SCHOOL, COLLEGE ON ONLINE MODE',
      refNo: 'RSLDC/RFP/ONLINESOFTSKILL/2023-24',
      category: 'Skill Training',
      pdfUrl: 'https://jankalyanfile.rajasthan.gov.in/Files//Content/UploadFolder/Tender/7666_Main_51593627-c244-45dd-a797-7214cf075841.pdf',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: true
    },
    {
      id: 't-mmysy',
      date: '09 Aug, 2023',
      title: 'RFP FOR STRATEGIC TRAINING PARTNERS FOR CONDUCTING ONLINE TRAINING UNDER MMYSY SCHEME OF RSLDC',
      refNo: 'RSLDC/MMYSY/RFP/2023-24/01',
      category: 'Training Partner RFP',
      pdfUrl: 'https://jankalyanfile.rajasthan.gov.in/Files//Content/UploadFolder/Tender/6609_Main_5f780b61-0991-4aaf-b32d-8e2edcd8ba43.pdf',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: true
    },
    {
      id: 't-samarth',
      date: '18 Apr, 2023',
      title: 'EoI for submission of proposal to undertake the project under MMKVY(Cat-III: SAMARTH) scheme of RSLDC',
      refNo: 'RSLDC/EoI/2023-24/1-MMKVY(Cat-III: SAMARTH)',
      category: 'Special Skill Schemes',
      pdfUrl: 'https://jankalyanfile.rajasthan.gov.in/Files//Content/UploadFolder/Tender/4000_Main_5ff60be1-f4e6-4930-9398-198dd81ebe9c.pdf',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: false
    },
    {
      id: 't-saksham',
      date: '18 Apr, 2023',
      title: 'EoI for submission of proposal to undertake the project under MMKVY(Cat-II: SAKSHM) scheme of RSLDC',
      refNo: 'RSLDC/EoI/2023-24/1-MMKVY(Cat-II: SAKSHM)',
      category: 'Skill Training EoI',
      pdfUrl: 'https://jankalyanfile.rajasthan.gov.in/Files//Content/UploadFolder/Tender/3999_Main_4d6d3da9-943e-4279-bbd3-3cfdf479eddc.pdf',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: false
    },
    {
      id: 't-rajkvik',
      date: '18 Apr, 2023',
      title: 'EoI for submission of proposal to undertake the project under RAJKViK scheme of RSLDC',
      refNo: 'RSLDC/EoI/2023-24/1-RAJKViK General',
      category: 'Skill Training EoI',
      pdfUrl: 'https://jankalyanfile.rajasthan.gov.in/Files//Content/UploadFolder/Tender/3997_Main_299bca9f-9ae2-4184-a51e-03aa93ef64c1.pdf',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: false
    },
    {
      id: 't-pmu-tech',
      date: '02 Aug, 2023',
      title: 'Selection of a Project Management Unit for providing Services of Technical Manpower to Rajasthan Skill and Livelihood Development Corporation (RSLDC)',
      refNo: 'RSLDC/PMU/RFP/2023-24/1478',
      category: 'Scheme Technical Manpower',
      pdfUrl: 'https://jankalyanfile.rajasthan.gov.in/Files//Content/UploadFolder/Tender/6465_Main_4260a91b-46ce-44c2-9812-967b22de952d.pdf',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: false
    },
    {
      id: 't-pmca',
      date: '23 Oct, 2024',
      title: 'Request for proposal:-Selection of Project Management Consulting Agency for providing Project Management consulting support services to Rajasthan Skill and Livelihoods Development Corporation (RSLDC)',
      refNo: 'RSLDC/PMCA/11310599',
      category: 'Skill Project Management',
      pdfUrl: 'https://jankalyanfile.rajasthan.gov.in/Files//Content/UploadFolder/Tender/17351_Main_6d035056-5d74-4cb7-bbb7-406f7ace3743.pdf',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: false
    },
    {
      id: 't-sca-scsp',
      date: '15 May, 2024',
      title: 'Empanelment of Private Training Partners (PTPs) for execution of Special Central Assistance to Scheduled Castes Sub-Plan (SCA to SCSP) training programs',
      refNo: 'RSLDC/SKILL/SCA-SCSP/2024/03',
      category: 'Training Partner Empanelment',
      pdfUrl: '',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: false
    },
    {
      id: 't-smart-class',
      date: '12 Feb, 2024',
      title: 'Tender for Supply and Installation of Smart Classroom Equipment in Government ITIs and Skill Centers across Rajasthan',
      refNo: 'RSLDC/IT/SMART-CLASS/2024/15',
      category: 'Educational Infrastructure',
      pdfUrl: '',
      portalUrl: 'https://livelihoods.rajasthan.gov.in/rsldc/#/pages/tender-list/403',
      isNew: false
    }
  ];

  openModal(tender?: TenderItem): void {
    this.selectedTender.set(tender || null);
    this.searchQuery.set('');
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.selectedTender.set(null);
    this.searchQuery.set('');
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target?.value ?? '');
  }

  openTender(item: TenderItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const targetUrl = item.pdfUrl || item.portalUrl || this.officialPortalUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }

  downloadDoc(item: TenderItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const targetUrl = item.pdfUrl || item.portalUrl || this.officialPortalUrl;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }

  redirectToPortal(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    window.open(this.officialPortalUrl, '_blank', 'noopener,noreferrer');
  }
}
