import { Directive } from '@angular/core';

/**
 * A table that is part of a printed letter (sanction order, IPA, MoU): merged cells, its own black
 * borders and small print sizes, so it cannot be the interactive data grid `app-table`.
 *
 *   <table appDocTable> ... </table>
 *
 * Use `app-table` for every table that is browsed on screen. Cells keep their own border and font
 * classes because a letter's layout belongs to the letter.
 */
@Directive({
  selector: 'table[appDocTable]',
  standalone: true,
  host: { class: 'doc-table border-collapse' }
})
export class DocTableDirective {}
