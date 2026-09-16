import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-mobile-app',
  standalone: true,
  imports: [],
  templateUrl: './mobile-app.component.html'
})
export class MobileAppComponent {
  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
}
