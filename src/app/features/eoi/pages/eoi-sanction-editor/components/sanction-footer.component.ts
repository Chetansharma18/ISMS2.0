import { ChangeDetectionStrategy, Component } from '@angular/core';

/** Footer of the printed sanction order: a rule, then the website, e-mail and telephone of RSLDC. */
@Component({
  selector: 'app-sanction-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
  template: `
    <div class="mt-8 pt-2 border-t border-slate-700 text-center font-sans text-[11px] font-bold leading-snug text-slate-800">
      <div>Website: https://livelihoods.rajasthan.gov.in/rsldc</div>
      <div>E-mail: md.rsldc-rj@gov.in</div>
      <div>Telephone: 0141-2701174</div>
    </div>
  `
})
export class SanctionFooterComponent {}
