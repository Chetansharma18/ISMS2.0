import { Component, computed, inject, signal } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

export interface TenderItem {
  id: string;
  date: string;
  title: string;
  refNo: string;
  category: string;
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

  scrollToAbout(): void {
    const el = document.getElementById('about');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }

  readonly tenders: TenderItem[] = [
    {
      id: 't-1',
      date: '10 Mar, 2026',
      title: 'ई.एम.आई. भवन, हॉस्टल भवन व कौशल भवन परिसर में साफ-सफाई कार्य की संविदा हेतु निविदा-2026-27',
      refNo: 'RSLDC/ADMIN/CLEAN/2026-27/01',
      category: 'Services',
      isNew: true
    },
    {
      id: 't-2',
      date: '20 Jan, 2025',
      title: 'Tender regarding Toner refilling and consumable parts',
      refNo: 'RSLDC/STORE/TONER/2025/11',
      category: 'Procurement',
      isNew: false
    },
    {
      id: 't-3',
      date: '20 Jan, 2025',
      title: 'RFP for cleaning and maintenance in RSLDC',
      refNo: 'RSLDC/EST/CLEAN/2025/08',
      category: 'Facility Management',
      isNew: false
    },
    {
      id: 't-4',
      date: '23 Oct, 2024',
      title: 'Request for proposal:-Selection of Project Management Consulting Agency for providing Project Management consulting support services to Rajasthan Skill and Livelihoods Development Corporation (RSLDC).',
      refNo: 'RSLDC/PMCA/RFP/2024/04',
      category: 'Consultancy',
      isNew: false
    },
    {
      id: 't-5',
      date: '22 Jul, 2024',
      title: 'Amendment in dates of tender submission',
      refNo: 'RSLDC/PROC/AMEND/2024/22',
      category: 'Corrigendum',
      isNew: false
    },
    {
      id: 't-6',
      date: '15 May, 2024',
      title: 'Empanelment of Private Training Partners (PTPs) for execution of Special Central Assistance to Scheduled Castes Sub-Plan (SCA to SCSP) training programs',
      refNo: 'RSLDC/SKILL/SCA-SCSP/2024/03',
      category: 'Empanelment',
      isNew: false
    },
    {
      id: 't-7',
      date: '12 Feb, 2024',
      title: 'Tender for Supply and Installation of Smart Classroom Equipment in Government ITIs and Skill Centers across Rajasthan',
      refNo: 'RSLDC/IT/SMART-CLASS/2024/15',
      category: 'Equipment',
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

  downloadDoc(item: TenderItem, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const docName = `${item.refNo.replace(/[\/\s]/g, '_')}.pdf`;
    const content = `Rajasthan Skill and Livelihoods Development Corporation (RSLDC)\nNotice Inviting Tender / RFP\n\nReference No: ${item.refNo}\nDate: ${item.date}\nCategory: ${item.category}\nTitle: ${item.title}\nStatus: Open`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = docName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
