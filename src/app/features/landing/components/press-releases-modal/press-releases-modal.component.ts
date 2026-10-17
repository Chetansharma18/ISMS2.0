import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent, ModalComponent } from '../../../../shared';

interface PressRelease {
  date: string;
  type: string;
  typeColor: string;
  typeBg: string;
  text: string;
}

@Component({
  selector: 'app-press-releases-modal',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ModalComponent, ButtonComponent],
  template: `
    <app-modal
      title="Press Releases & Official Statements"
      subtitle="Rajasthan Skill and Livelihoods Development Corporation (RSLDC)"
      size="lg"
      (close)="close.emit()"
    >
        <div class="space-y-6">
          @for (item of releases; track item.date; let last = $last) {
            <div class="group">
              <div class="flex items-center gap-3 mb-3">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-navy-dark text-white">
                  {{ item.date }}
                </span>
                <span [class]="'inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold border ' + item.typeColor + ' ' + item.typeBg">
                  {{ item.type }}
                </span>
              </div>
              <p class="text-sm text-slate-800 leading-relaxed font-medium">
                {{ item.text }}
              </p>
              @if (!last) {
                <div class="h-px bg-slate-200 w-full mt-6"></div>
              }
            </div>
          }

        </div>

        <ng-container modalFooter>
          <span class="text-xs text-slate-500 font-medium mr-auto">Source: RSLDC Public Relations & Media</span>
          <button appButton (click)="close.emit()">Close</button>
        </ng-container>
    </app-modal>
  `
})
export class PressReleasesModalComponent {
  @Output() close = new EventEmitter<void>();

  releases: PressRelease[] = [
    {
      date: '17 Aug, 2026',
      type: 'Meeting',
      typeColor: 'text-orange-600 border-orange-600/30',
      typeBg: 'bg-orange-50',
      text: 'राज्य कौशल एवं उद्यमिता समिति की प्रथम बैठक आयोजित - युवाओं को उद्योग की मांग के अनुरूप आधुनिक प्रशिक्षण देने एवं कौशल विकास योजनाओं में तेजी लाने पर विस्तृत चर्चा'
    },
    {
      date: '15 Jul, 2026',
      type: 'Event',
      typeColor: 'text-orange-600 border-orange-600/30',
      typeBg: 'bg-orange-50',
      text: 'विश्व युवा कौशल दिवस पर राज्य स्तरीय कार्यक्रम आयोजित, कौशल विकास के क्षेत्र में उत्कृष्ट प्रतिभाओं का हुआ सम्मान'
    },
    {
      date: '05 Jun, 2026',
      type: 'Statement',
      typeColor: 'text-orange-600 border-orange-600/30',
      typeBg: 'bg-orange-50',
      text: 'बोर्ड का उद्देश्य कौशल विकास के माध्यम से युवाओं को आत्मनिर्भर बनाना तथा उनके लिए बेहतर रोजगार के अवसर सुनिश्चित करना है - अध्यक्ष, श्री विश्वकर्मा कौशल विकास बोर्ड'
    },
    {
      date: '23 Apr, 2026',
      type: 'Skill Initiative',
      typeColor: 'text-orange-600 border-orange-600/30',
      typeBg: 'bg-orange-50',
      text: 'राज्य की 2 हजार युवतियों को डिजिटल सशक्त बनाने के लिए यूनिसेफ एफडीसीआर के माध्यम से करेगा प्रशिक्षित'
    },
    {
      date: '07 Apr, 2026',
      type: 'Rozgar Mela',
      typeColor: 'text-orange-600 border-orange-600/30',
      typeBg: 'bg-orange-50',
      text: 'युवा संबल मेला 2026 का किया आयोजन - 42 आशार्थियों को मेला स्थल पर ही ऑफर लेटर वितरित'
    }
  ];
}
