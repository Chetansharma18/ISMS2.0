import { Pipe, PipeTransform } from '@angular/core';
import { formatInr } from '../utils/formatters.util';

/** Template wrapper around shared/utils/formatters.util#formatInr. */
@Pipe({
  name: 'inrCurrency',
  standalone: true
})
export class InrCurrencyPipe implements PipeTransform {
  transform(
    value: number | string | null | undefined,
    compact: boolean = false,
    symbol: boolean = true
  ): string {
    return formatInr(value, { compact, symbol, fractionDigits: 2 });
  }
}
