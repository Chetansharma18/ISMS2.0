import { Component, signal, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

export interface PressRelease {
  id: string;
  date: string;
  title: string;
  category?: string;
}

@Component({
  selector: 'app-news-ticker',
  standalone: true,
  imports: [],
  templateUrl: './news-ticker.component.html',
  styleUrls: ['./news-ticker.component.css']
})
export class NewsTickerComponent {
  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
  isModalOpen = signal(false);

  pressReleases: PressRelease[] = [
    {
      id: '1',
      date: '17 Aug, 2026',
      title: 'राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित— युवाओं को उद्योग की मांग के अनुरूप आधुनिक प्रशिक्षण देने एवं कौशल विकास योजनाओं में तेजी लाने पर विस्तृत चर्चा',
      category: 'Meeting'
    },
    {
      id: '2',
      date: '15 Jul, 2026',
      title: 'विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित, कौशल विकास के क्षेत्र में उत्कृष्ट प्रतिभाओं का हुआ सम्मान',
      category: 'Event'
    },
    {
      id: '3',
      date: '05 Jun, 2026',
      title: 'बोर्ड का उद्देश्य कौशल विकास के माध्यम से युवाओं को आत्मनिर्भर बनाना तथा उनके लिए बेहतर रोजगार के अवसर सुनिश्चित करना है — अध्यक्ष, श्री विश्वकर्मा कौशल विकास बोर्ड',
      category: 'Statement'
    },
    {
      id: '4',
      date: '23 Apr, 2026',
      title: 'राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित',
      category: 'Skill Initiative'
    },
    {
      id: '5',
      date: '07 Apr, 2026',
      title: 'युवा संबल मेला 2026 का किया आयोजन — 42 आशार्थियों को मेला स्थल पर ही ऑफर लेटर वितरित',
      category: 'Rozgar Mela'
    }
  ];

  openModal() {
    this.isModalOpen.set(true);
  }

  closeModal() {
    this.isModalOpen.set(false);
  }
}
