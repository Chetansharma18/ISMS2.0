import { Component, inject } from '@angular/core';
import { LanguageService } from '../../../core/services/language.service';

@Component({
  selector: 'app-mobile-app',
  standalone: true,
  imports: [],
  templateUrl: './mobile-app.component.html',
  styleUrls: ['./mobile-app.component.css']
})
export class MobileAppComponent {
  protected readonly languageService = inject(LanguageService);
  readonly t = this.languageService.t;
}
